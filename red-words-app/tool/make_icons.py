#!/usr/bin/env python3
"""Paint Red Words icons: paper field, crimson disc, quiet knot."""

import math
import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).resolve().parents[1]


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def png(width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
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


def paint(size: int, *, transparent_corners: bool = False) -> bytes:
    paper = (246, 240, 230, 255)
    crimson = (140, 28, 36, 255)
    cx = cy = size / 2
    radius = size * 0.34
    pixels = []
    for y in range(size):
        for x in range(size):
            n = ((x * 13 + y * 7) % 17) / 17.0
            r = int(paper[0] - n * 6)
            g = int(paper[1] - n * 6)
            b = int(paper[2] - n * 5)
            a = 255
            if transparent_corners:
                r, g, b, a = 0, 0, 0, 0
            dx, dy = x - cx, y - cy
            if math.hypot(dx, dy) <= radius:
                r, g, b, a = crimson[0], crimson[1], crimson[2], 255
                # quiet knot: two crossing arcs
                t = (x / size)
                knot = abs((y / size) - (0.42 + 0.16 * math.sin(t * math.pi * 2))) < 0.035
                if knot and math.hypot(dx, dy) < radius * 0.72:
                    r, g, b = 246, 240, 230
            pixels.append((r, g, b, a))
    return png(size, size, pixels)


def main() -> None:
    res = ROOT / "android" / "app" / "src" / "main" / "res"
    for folder, size in (
        ("mipmap-mdpi", 48),
        ("mipmap-hdpi", 72),
        ("mipmap-xhdpi", 96),
        ("mipmap-xxhdpi", 144),
        ("mipmap-xxxhdpi", 192),
    ):
        dest = res / folder
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "ic_launcher.png").write_bytes(paint(size))
    fg = res / "drawable"
    fg.mkdir(parents=True, exist_ok=True)
    (fg / "ic_launcher_foreground.png").write_bytes(paint(432, transparent_corners=True))
    ios = ROOT / "ios" / "Runner" / "Assets.xcassets" / "AppIcon.appiconset"
    # Keep existing Contents.json; overwrite the 1024 marketing image if present.
    for name, size in (("Icon-App-1024x1024@1x.png", 1024),):
        path = ios / name
        if ios.exists():
            path.write_bytes(paint(size))
    print("wrote launcher icons")


if __name__ == "__main__":
    main()
