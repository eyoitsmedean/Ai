#!/usr/bin/env python3
"""Check 64-bit native libraries in an APK or AAB for 16 KiB ELF LOAD alignment.

Play: apps targeting Android 15+ must support 16 KB pages on 64-bit devices
(developer.android.com/guide/practices/page-sizes, retrieved 2026-09-14).
Flutter ships libflutter.so / libapp.so — this is not a Java-only app.

Usage:
  python3 tool/check_16kb.py path/to/app-release.apk
  python3 tool/check_16kb.py path/to/app-release.aab
"""

from __future__ import annotations

import argparse
import struct
import sys
import zipfile
from pathlib import Path

PT_LOAD = 1
MIN_ALIGN = 0x4000
CHECKED_ABIS = ("arm64-v8a", "x86_64")


def _u16(data: bytes, offset: int) -> int:
    return struct.unpack_from("<H", data, offset)[0]


def _u32(data: bytes, offset: int) -> int:
    return struct.unpack_from("<I", data, offset)[0]


def _u64(data: bytes, offset: int) -> int:
    return struct.unpack_from("<Q", data, offset)[0]


def load_alignments(elf: bytes) -> list[int]:
    if elf[:4] != b"\x7fELF":
        raise ValueError("not an ELF file")
    ei_class = elf[4]
    ei_data = elf[5]
    if ei_data != 1:
        raise ValueError("only little-endian ELF is supported")
    if ei_class == 1:
        # 32-bit: Play's 16 KB rule is for 64-bit ABIs; still parse if present.
        e_phoff = _u32(elf, 28)
        e_phentsize = _u16(elf, 42)
        e_phnum = _u16(elf, 44)
        aligns: list[int] = []
        for i in range(e_phnum):
            base = e_phoff + i * e_phentsize
            if _u32(elf, base) != PT_LOAD:
                continue
            aligns.append(_u32(elf, base + 28))
        return aligns
    if ei_class != 2:
        raise ValueError(f"unknown ELF class {ei_class}")
    e_phoff = _u64(elf, 32)
    e_phentsize = _u16(elf, 54)
    e_phnum = _u16(elf, 56)
    aligns = []
    for i in range(e_phnum):
        base = e_phoff + i * e_phentsize
        if _u32(elf, base) != PT_LOAD:
            continue
        aligns.append(_u64(elf, base + 48))
    return aligns


def iter_native_libs(archive: Path) -> list[tuple[str, bytes]]:
    found: list[tuple[str, bytes]] = []
    with zipfile.ZipFile(archive) as zf:
        names = zf.namelist()
        # APK: lib/<abi>/*.so
        # AAB: base/lib/<abi>/*.so  (sometimes nested as base.zip)
        so_names = [
            n
            for n in names
            if n.endswith(".so")
            and any(f"/{abi}/" in n or n.startswith(f"lib/{abi}/") for abi in CHECKED_ABIS)
        ]
        for name in so_names:
            found.append((name, zf.read(name)))
        for nested in names:
            if not nested.endswith(".apk") and nested != "base.zip":
                if not (nested.startswith("base/") and nested.endswith(".zip")):
                    continue
            with zf.open(nested) as inner_fh:
                try:
                    inner = zipfile.ZipFile(inner_fh)
                except zipfile.BadZipFile:
                    continue
                for name in inner.namelist():
                    if not name.endswith(".so"):
                        continue
                    if not any(
                        f"/{abi}/" in name or name.startswith(f"lib/{abi}/")
                        for abi in CHECKED_ABIS
                    ):
                        continue
                    found.append((f"{nested}!{name}", inner.read(name)))
    return found


def minimal_elf64(align: int) -> bytes:
    """One-LOAD AArch64 ET_DYN, little-endian. Used by --self-test."""
    eh = bytearray(64)
    eh[0:4] = b"\x7fELF"
    eh[4] = 2  # ELFCLASS64
    eh[5] = 1  # ELFDATA2LSB
    eh[6] = 1  # EV_CURRENT
    struct.pack_into("<HHIQQQIHHHHHH", eh, 16,
                     3, 183, 1, 0, 64, 0, 0, 64, 56, 1, 0, 0, 0)
    ph = bytearray(56)
    struct.pack_into("<IIQQQQQQ", ph, 0,
                     PT_LOAD, 5, 0, 0, 0, 120, 120, align)
    return bytes(eh + ph)


def _self_test() -> int:
    aligned = load_alignments(minimal_elf64(0x4000))
    unaligned = load_alignments(minimal_elf64(0x1000))
    if aligned != [0x4000]:
        print(f"FAIL: expected [0x4000], got {aligned}", file=sys.stderr)
        return 1
    if unaligned != [0x1000]:
        print(f"FAIL: expected [0x1000], got {unaligned}", file=sys.stderr)
        return 1
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        apk = Path(tmp) / "fake.apk"
        with zipfile.ZipFile(apk, "w") as zf:
            zf.writestr("lib/arm64-v8a/libok.so", minimal_elf64(0x4000))
            zf.writestr("lib/x86_64/libbad.so", minimal_elf64(0x1000))
        libs = iter_native_libs(apk)
        if len(libs) != 2:
            print(f"FAIL: expected 2 libs, got {len(libs)}", file=sys.stderr)
            return 1
    print("OK: ELF parser + APK walk self-test")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", nargs="?", help="release APK or AAB")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return _self_test()
    if not args.artifact:
        parser.error("artifact path required unless --self-test")
    artifact = Path(args.artifact)
    if not artifact.is_file():
        print(f"FAIL: {artifact} is not a file", file=sys.stderr)
        return 2

    libs = iter_native_libs(artifact)
    if not libs:
        print(f"FAIL: no 64-bit .so files in {artifact}", file=sys.stderr)
        print("Flutter release artifacts must contain libflutter.so.", file=sys.stderr)
        return 1

    bad: list[str] = []
    for name, blob in libs:
        try:
            aligns = load_alignments(blob)
        except ValueError as exc:
            bad.append(f"{name}: {exc}")
            continue
        if not aligns:
            bad.append(f"{name}: no PT_LOAD segments")
            continue
        weakest = min(aligns)
        status = "ALIGNED" if weakest >= MIN_ALIGN else "UNALIGNED"
        print(f"{status}  {name}  min_LOAD_align=0x{weakest:x} ({weakest})")
        if weakest < MIN_ALIGN:
            bad.append(f"{name}: LOAD align 0x{weakest:x} < 0x{MIN_ALIGN:x}")

    if bad:
        print("FAIL: 16 KB page-size check", file=sys.stderr)
        for line in bad:
            print(f"  {line}", file=sys.stderr)
        return 1
    print(f"OK: {len(libs)} 64-bit libraries, LOAD align >= 16 KiB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
