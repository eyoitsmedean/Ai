#!/usr/bin/env python3
"""Paint store icons from the existing parchment + crimson cross mark."""
import math
import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def png(width: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
    raw = bytearray()
    for y in range(width):
        raw.append(0)
        for x in range(width):
            raw.extend(pixels[y * width + x])
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, width, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def paint(size: int, maskable: bool = False) -> bytes:
    paper = (244, 239, 228, 255)
    crimson = (143, 29, 29, 255)
    ink = (255, 252, 246, 255)
    cx = cy = size / 2
    radius = size * (0.32 if maskable else 0.36)
    arm = size * 0.055
    tall = size * 0.22
    wide = size * 0.15
    pixels = []
    for y in range(size):
        for x in range(size):
            n = ((x * 13 + y * 7) % 17) / 17.0
            r = int(paper[0] - n * 8)
            g = int(paper[1] - n * 8)
            b = int(paper[2] - n * 6)
            dx, dy = x - cx, y - cy
            if math.hypot(dx, dy) <= radius:
                r, g, b = crimson[:3]
                in_v = abs(dx) <= arm and -tall * 0.85 <= dy <= tall
                in_h = abs(dy + tall * 0.18) <= arm * 0.92 and abs(dx) <= wide
                if in_v or in_h:
                    r, g, b = ink[:3]
            pixels.append((r, g, b, 255))
    return png(size, pixels)


def write(path: pathlib.Path, size: int, maskable: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(paint(size, maskable=maskable))
    print("wrote", path.relative_to(ROOT))


def main() -> None:
    ios = ROOT / "ios/Runner/Assets.xcassets/AppIcon.appiconset"
    mapping = {
        "Icon-App-20x20@1x.png": 20,
        "Icon-App-20x20@2x.png": 40,
        "Icon-App-20x20@3x.png": 60,
        "Icon-App-29x29@1x.png": 29,
        "Icon-App-29x29@2x.png": 58,
        "Icon-App-29x29@3x.png": 87,
        "Icon-App-40x40@1x.png": 40,
        "Icon-App-40x40@2x.png": 80,
        "Icon-App-40x40@3x.png": 120,
        "Icon-App-60x60@2x.png": 120,
        "Icon-App-60x60@3x.png": 180,
        "Icon-App-76x76@1x.png": 76,
        "Icon-App-76x76@2x.png": 152,
        "Icon-App-83.5x83.5@2x.png": 167,
        "Icon-App-1024x1024@1x.png": 1024,
    }
    for name, size in mapping.items():
        write(ios / name, size)

    android = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    res = ROOT / "android/app/src/main/res"
    for folder, size in android.items():
        write(res / folder / "ic_launcher.png", size)
        write(res / folder / "ic_launcher_round.png", size)

if __name__ == "__main__":
    main()
