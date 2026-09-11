#!/usr/bin/env python3
"""Generate public/og-image.png — 1200×630 brand card. No source art required."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-image.png"
W, H = 1200, 630
INK = (15, 13, 11, 255)
CRIMSON = (185, 28, 28, 255)
STONE = (232, 226, 216, 255)
GOLD = (196, 163, 90, 255)


def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    img = Image.new("RGBA", (W, H), INK)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse((520, -80, 1280, 520), fill=(185, 28, 28, 90))
    g.ellipse((-80, 360, 520, 780), fill=(127, 15, 46, 70))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(48)))
    draw = ImageDraw.Draw(img)
    draw.rectangle((48, 48, W - 48, H - 48), outline=(196, 163, 90, 160), width=2)

    draw.text((80, 88), "RED LETTER ADVISOR", font=font(28, bold=True), fill=GOLD)
    draw.text((80, 160), "His words,", font=font(72, bold=True), fill=CRIMSON)
    draw.text((80, 250), "for your day.", font=font(72, bold=True), fill=STONE)
    draw.text(
        (80, 380),
        "“Therefore don’t be anxious for tomorrow,\nfor tomorrow will be anxious for itself.”",
        font=font(28),
        fill=STONE,
    )
    draw.text((80, 500), "Matthew 6:34  ·  Verified WEB  ·  Not invented speech", font=font(22), fill=GOLD)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
