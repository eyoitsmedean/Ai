#!/usr/bin/env python3
"""Paint PWA icons: parchment field, crimson disc, white Latin cross."""
import math
import pathlib
import struct
import zlib


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def png_rect(width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixels[y * width + x])
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def splash(width: int, height: int) -> bytes:
    paper = (244, 239, 228, 255)
    crimson = (143, 29, 29, 255)
    ink = (255, 252, 246, 255)
    cx, cy = width / 2, height / 2
    radius = min(width, height) * 0.11
    arm = radius * 0.16
    tall = radius * 0.62
    wide = radius * 0.42
    pixels = []
    for y in range(height):
        for x in range(width):
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
    return png_rect(width, height, pixels)


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


def paint(size: int, *, radius_scale: float = 0.36) -> bytes:
    paper = (244, 239, 228, 255)
    crimson = (143, 29, 29, 255)
    ink = (255, 252, 246, 255)
    cx = cy = size / 2
    radius = size * radius_scale
    arm = size * 0.055
    tall = size * 0.22
    wide = size * 0.15
    pixels = []
    for y in range(size):
        for x in range(size):
            # faint paper grain
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


def main() -> None:
    public = pathlib.Path(__file__).resolve().parent.parent / "public"
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")):
        (public / name).write_bytes(paint(size))
        print("wrote", name)
    for size, name in ((192, "icon-maskable-192.png"), (512, "icon-maskable-512.png")):
        (public / name).write_bytes(paint(size, radius_scale=0.28))
        print("wrote", name)
    for w, h, name in (
        (1080, 2400, "splash-1080x2400.png"),
        (1170, 2532, "splash-1170x2532.png"),
        (1179, 2556, "splash-1179x2556.png"),
        (1284, 2778, "splash-1284x2778.png"),
        (1290, 2796, "splash-1290x2796.png"),
    ):
        (public / name).write_bytes(splash(w, h))
        print("wrote", name)


if __name__ == "__main__":
    main()
