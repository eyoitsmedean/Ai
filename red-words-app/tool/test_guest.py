#!/usr/bin/env python3
"""Guest Leaf + store-frame contract. No invented verses."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GUEST = ROOT / "guest"


class GuestLeaf(unittest.TestCase):
    def test_pack_is_web_100_matthew_6_34(self):
        raw = (GUEST / "pack.js").read_text(encoding="utf-8")
        self.assertTrue(raw.startswith("window.RED_WORDS_PACK = "))
        pack = json.loads(raw[len("window.RED_WORDS_PACK = ") :].rstrip(";\n"))
        self.assertEqual(pack["count"], 100)
        self.assertEqual(pack["translation"], "World English Bible")
        self.assertEqual(pack["sayings"][0]["id"], "anxiety-mt-6-34")
        self.assertEqual(pack["sayings"][0]["citation"], "Matthew 6:34")
        self.assertEqual(pack["sayings"][0]["translation"], "WEB")
        books = {s["book"] for s in pack["sayings"]}
        self.assertEqual(books, {"Matthew", "Mark", "Luke", "John"})

    def test_html_keeps_craft_law_and_forbids_drift(self):
        html = (GUEST / "index.html").read_text(encoding="utf-8")
        for key in (
            "splash-promise",
            "saying-word",
            "saying-citation",
            "saying-reflection",
            "step-field",
            "ill-do-this",
            "amen",
            "continuity",
            "ask-field",
            "crisis-988",
            "saved-empty",
        ):
            self.assertIn(f'id="{key}"', html)
        self.assertNotIn("Reflection:", html)
        self.assertNotIn("Journeys", html)
        self.assertNotIn("streak", html.lower())
        self.assertIn("His words, for this moment", html)
        self.assertIn('href="tel:988"', html)
        self.assertIn(">Today<", html)
        self.assertIn(">Ask<", html)
        self.assertIn(">Saved<", html)
        self.assertIn(">Settings<", html)
        self.assertNotIn(">Sit<", html)
        self.assertNotIn(">Seek<", html)
        css = (GUEST / "guest.css").read_text(encoding="utf-8")
        self.assertIn("[hidden] { display: none !important; }", css)

    def test_js_ask_gates(self):
        js = (GUEST / "guest.js").read_text(encoding="utf-8")
        self.assertIn("I will not invent a word of His.", js)
        self.assertIn("You said you'd ", js)
        self.assertIn("tel:988", (GUEST / "index.html").read_text(encoding="utf-8"))
        self.assertIn("jailbreak", js)
        self.assertIn("suicid", js)

    def test_serif_keeps_spaces(self):
        from PIL import ImageDraw, ImageFont

        fnt = ImageFont.truetype(
            str(ROOT / "tool" / "fonts-static" / "SourceSerif4-It.ttf"), 52
        )
        img = Image.new("RGB", (20, 20))
        draw = ImageDraw.Draw(img)
        spaced = draw.textlength("His words", font=fnt)
        jammed = draw.textlength("Hiswords", font=fnt)
        self.assertGreater(spaced - jammed, 6)

    def test_store_frames(self):
        names = [
            "01-splash.png",
            "02-today-matthew-6-34.png",
            "03-honest-step.png",
            "04-continuity.png",
            "05-ask-retrieve.png",
            "06-widget.png",
        ]
        for name in names:
            path = GUEST / "store-frames" / name
            self.assertTrue(path.exists(), name)
            img = Image.open(path)
            self.assertEqual(img.size, (1290, 2796), name)
            # Crimson must appear (Word / knot / thread).
            pixels = img.getdata()
            crimson = sum(1 for r, g, b in pixels if r > 100 and r > g + 40 and r > b + 40)
            self.assertGreater(crimson, 200, name)

    def test_one_file_has_no_external_assets(self):
        html = (GUEST / "RedWords.html").read_text(encoding="utf-8")
        self.assertIn("Matthew 6:34", html)
        self.assertIn("anxiety-mt-6-34", html)
        self.assertIn("data:font/ttf;base64,", html)
        self.assertNotIn('src="pack.js"', html)
        self.assertNotIn('href="guest.css"', html)
        self.assertNotIn("OneDigital", html)
        self.assertNotIn("http://", html)
        self.assertNotIn("https://", html)
        self.assertGreater(len(html), 100_000)

    def test_privacy_copies_match(self):
        a = (ROOT / "docs" / "privacy.html").read_text(encoding="utf-8")
        b = Path("/workspace/public/privacy.html").read_text(encoding="utf-8")
        self.assertEqual(a, b)
        self.assertIn("does not connect to the internet", a)


if __name__ == "__main__":
    unittest.main()
