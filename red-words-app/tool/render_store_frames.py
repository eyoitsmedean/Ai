#!/usr/bin/env python3
"""Render App Store / Play frames from the locked WEB pack and OFL serif.

These are listing images, not a live screenshot of Flutter. Hierarchy and
copy match SayingView / the Guest Leaf. No badge, streak, CTA, or in-card
app name on the widget frame.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PACK = json.loads((ROOT / "assets" / "sayings.json").read_text(encoding="utf-8"))
FIRST = PACK["sayings"][0]
PEACE = next(s for s in PACK["sayings"] if s["id"] == "peace-leave")
OUT = ROOT / "guest" / "store-frames"
ART = Path("/opt/cursor/artifacts/red-words-guest")

W, H = 1290, 2796
PAPER = (246, 240, 230)
CRIMSON = (140, 28, 36)
INK = (42, 36, 32)
MUTED = (122, 110, 94)
CHARCOAL = (28, 24, 22)

# Variable TTFs in fonts/ drop spaces under Pillow. Static cuts are OFL.
SERIF = ROOT / "tool" / "fonts-static" / "SourceSerif4-Regular.ttf"
ITALIC = ROOT / "tool" / "fonts-static" / "SourceSerif4-It.ttf"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def phone(color: tuple[int, int, int] = PAPER) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W, H), color)
    draw = ImageDraw.Draw(img)
    draw.text((80, 72), "9:41", font=font(SERIF, 36), fill=INK if color == PAPER else PAPER)
    draw.rounded_rectangle((520, 2680, 770, 2694), radius=8, fill=CRIMSON)
    return img, draw


def knot(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    # Short crimson thread — widget contract / craft knot.
    draw.arc((x, y, x + 36, y + 22), 200, 20, fill=CRIMSON, width=4)
    draw.arc((x + 24, y, x + 64, y + 22), 160, 340, fill=CRIMSON, width=4)


def write_tracked(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, fnt, fill, tracking: float = 4) -> None:
    cx = x
    for ch in text:
        draw.text((cx, y), ch, font=fnt, fill=fill)
        cx += draw.textlength(ch, font=fnt) + tracking


def write_word(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, size: int = 56) -> int:
    fnt = font(ITALIC, size)
    lines = wrap(draw, text, fnt, W - x - 80)
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=CRIMSON)
        y += int(size * 1.35)
    return y


def save(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    img.save(ART / name, "PNG", optimize=True)
    print(path, img.size)


def frame_splash() -> None:
    img, draw = phone()
    knot(draw, 613, 1180)
    fnt = font(ITALIC, 52)
    text = "His words, for this moment"
    tw = draw.textlength(text, font=fnt)
    draw.text(((W - tw) / 2, 1240), text, font=fnt, fill=CRIMSON)
    save(img, "01-splash.png")


def frame_today() -> None:
    img, draw = phone()
    y = write_word(draw, FIRST["word"], 80, 280)
    write_tracked(draw, FIRST["citation"].upper(), 80, y + 28, font(SERIF, 28), CRIMSON)
    knot(draw, 80, y + 88)
    y = y + 140
    fnt = font(SERIF, 36)
    for line in wrap(draw, FIRST["reflection"], fnt, W - 160):
        draw.text((80, y), line, font=fnt, fill=INK)
        y += 50
    draw.text((80, y + 64), "One honest step", font=font(SERIF, 28), fill=MUTED)
    save(img, "02-today-matthew-6-34.png")


def frame_step() -> None:
    img, draw = phone()
    draw.text((80, 280), "One honest step", font=font(SERIF, 28), fill=MUTED)
    y = 360
    fnt = font(ITALIC, 48)
    for line in wrap(draw, FIRST["step"], fnt, W - 160):
        draw.text((80, y), line, font=fnt, fill=MUTED)
        y += 64
    draw.text((80, y + 40), "sit still before I answer", font=font(ITALIC, 44), fill=INK)
    draw.line((80, y + 120, W - 80, y + 120), fill=CRIMSON, width=2)
    draw.rounded_rectangle((80, 2300, W - 80, 2420), radius=8, fill=CRIMSON)
    label = "I'll do this"
    lf = font(SERIF, 36)
    lw = draw.textlength(label, font=lf)
    draw.text(((W - lw) / 2, 2334), label, font=lf, fill=PAPER)
    save(img, "03-honest-step.png")


def frame_continuity() -> None:
    img, draw = phone()
    draw.text((80, 240), "You said you'd sit still before I answer", font=font(ITALIC, 40), fill=INK)
    draw.line((80, 320, 140, 320), fill=CRIMSON, width=3)
    y = write_word(draw, FIRST["word"], 80, 380, 52)
    write_tracked(draw, FIRST["citation"].upper(), 80, y + 24, font(SERIF, 28), CRIMSON)
    knot(draw, 80, y + 80)
    save(img, "04-continuity.png")


def frame_ask() -> None:
    img, draw = phone()
    draw.text((80, 240), "ASK", font=font(SERIF, 26), fill=MUTED)
    draw.text((80, 300), "I need peace", font=font(ITALIC, 40), fill=INK)
    draw.line((80, 370, W - 80, 370), fill=CRIMSON, width=2)
    y = write_word(draw, PEACE["word"], 80, 440, 48)
    write_tracked(draw, PEACE["citation"].upper(), 80, y + 24, font(SERIF, 28), CRIMSON)
    knot(draw, 80, y + 80)
    save(img, "05-ask-retrieve.png")


def frame_widget() -> None:
    img, draw = phone(CHARCOAL)
    # Home-screen widget card only: Word + citation + thread.
    card = (80, 720, W - 80, 1480)
    draw.rounded_rectangle(card, radius=48, fill=PAPER)
    y = write_word(draw, FIRST["word"], 130, 800, 40)
    write_tracked(draw, FIRST["citation"].upper(), 130, y + 20, font(SERIF, 24), CRIMSON)
    draw.rounded_rectangle((130, y + 80, 200, y + 86), radius=2, fill=CRIMSON)
    save(img, "06-widget.png")


def main() -> None:
    if FIRST["id"] != "anxiety-mt-6-34":
        raise SystemExit("pack opener drifted")
    frame_splash()
    frame_today()
    frame_step()
    frame_continuity()
    frame_ask()
    frame_widget()
    (OUT / "README.md").write_text(
        "# Store frames (iPhone 6.7 — 1290×2796)\n\n"
        "Rendered 2026-10-31 from `assets/sayings.json` and Source Serif 4.\n"
        "Paste 01–05 into App Store / Play. 06 is the widget card: Word, "
        "citation, thread — no badge, streak, CTA, or in-card app name.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
