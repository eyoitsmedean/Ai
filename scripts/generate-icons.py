#!/usr/bin/env python3
"""Build production PWA icons, maskable icons, and iOS splash screens."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SPLASH = PUBLIC / "splash"
SRC = Path("/opt/cursor/artifacts/assets/rla-icon-source.png")
OG_SRC = Path("/opt/cursor/artifacts/assets/rla-og-share.png")
BG = (15, 13, 11, 255)
CRIMSON = (159, 18, 57, 255)


def load_source():
    if not SRC.exists():
        raise SystemExit(f"Missing icon source: {SRC}")
    return Image.open(SRC).convert("RGBA")


def cover(im, size):
    im = im.convert("RGBA")
    w, h = im.size
    scale = max(size[0] / w, size[1] / h)
    nw, nh = int(w * scale), int(h * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - size[0]) // 2
    top = (nh - size[1]) // 2
    return im.crop((left, top, left + size[0], top + size[1]))


def contain_on_canvas(im, canvas, pad_ratio=0.18):
    canvas_im = Image.new("RGBA", canvas, BG)
    inner = int(min(canvas) * (1 - pad_ratio * 2))
    icon = cover(im, (inner, inner))
    x = (canvas[0] - inner) // 2
    y = (canvas[1] - inner) // 2
    canvas_im.paste(icon, (x, y), icon)
    return canvas_im


def save_png(im, path, size=None):
    if size:
        im = im.resize(size, Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGBA").save(path, "PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}")


def splash(icon, size):
    w, h = size
    img = Image.new("RGBA", size, BG)
    # soft crimson glow
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    cx, cy = w // 2, int(h * 0.42)
    r = int(min(w, h) * 0.38)
    g.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(159, 18, 57, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(int(r * 0.35)))
    img = Image.alpha_composite(img, glow)
    mark = contain_on_canvas(icon, (int(min(w, h) * 0.36), int(min(w, h) * 0.36)), pad_ratio=0.06)
    mx = (w - mark.size[0]) // 2
    my = int(h * 0.38) - mark.size[1] // 2
    img.paste(mark, (mx, my), mark)
    return img


def main():
    icon = load_source()
    print("Generating production icons…")
    save_png(cover(icon, (1024, 1024)), PUBLIC / "icon-1024.png", (1024, 1024))
    save_png(cover(icon, (512, 512)), PUBLIC / "icon-512.png", (512, 512))
    save_png(cover(icon, (192, 192)), PUBLIC / "icon-192.png", (192, 192))
    save_png(contain_on_canvas(icon, (512, 512), 0.2), PUBLIC / "icon-maskable-512.png", (512, 512))
    save_png(contain_on_canvas(icon, (192, 192), 0.2), PUBLIC / "icon-maskable-192.png", (192, 192))
    save_png(cover(icon, (180, 180)), PUBLIC / "apple-touch-icon.png", (180, 180))
    save_png(cover(icon, (64, 64)), PUBLIC / "favicon.png", (64, 64))
    save_png(cover(icon, (32, 32)), PUBLIC / "favicon-32.png", (32, 32))

    if OG_SRC.exists():
        og = Image.open(OG_SRC).convert("RGBA")
        save_png(cover(og, (1200, 630)), PUBLIC / "og-image.png", (1200, 630))

    print("Generating iOS splash screens…")
    splashes = {
        "iphone-14-pro-max.png": (1290, 2796),
        "iphone-14-pro.png": (1179, 2556),
        "iphone-14.png": (1170, 2532),
        "iphone-x.png": (1125, 2436),
        "iphone-8.png": (750, 1334),
        "ipad-pro-12.png": (2048, 2732),
    }
    for name, size in splashes.items():
        save_png(splash(icon, size), SPLASH / name)

    print("Done.")


if __name__ == "__main__":
    main()
