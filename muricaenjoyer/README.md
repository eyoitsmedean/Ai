# @Muricaenjoyer content

Everything built for the @Muricaenjoyer X account, kept apart from the Red Letter app in this repo. Nothing here is posted anywhere; it's drafts and assets for Dean to decide on.

| Project | What it is | Live page |
|---|---|---|
| `testosterone/` | "Testosterone Isn't a Personality": the finished X Article, research kit, six sourced charts, header art, and a 52-second captioned video with an original heartbeat track | [Article](https://claude.ai/artifact/E6nnge8UAMGReGFRixKkqb) · [Research kit](https://claude.ai/artifact/9n25cmafMpUqu82moZWCKd) |
| `founders/` | The Founders' Group Chat: America's founders in a text thread, 1776–1826, every bubble a real sourced quote. Video in 4:5, 4:5 fast and 9:16, plus a web version with a receipt behind every bubble | [Web chat](https://claude.ai/artifact/QNebUAYTf8zPBpwhrmjBSD) |
| `the-63/` | The 63: every U.S. national park ranked into S–D tiers, with filters, awards, method and live re-weighting, plus tier-list images and post text | [The 63](https://claude.ai/artifact/Js5RFzV6pZZ1xuC5Gasrfe) |
| `freedom-units/` | Freedom Units: a daily estimation game that measures America in American units, with sourced answers and a shareable score card | [Game](https://claude.ai/artifact/MuZPaW1jvs49jagrUYfUAm) |

The live pages are private until shared from each page's Share menu.

## Rebuilding

- Charts: `python3 testosterone/charts.py <outdir>` (needs matplotlib and the Inter fonts).
- Videos are canvas pages rendered frame by frame: `node testosterone/video/render.js <playwright-path> <page.html> <frames-dir> 30`, then encode the frames with ffmpeg (libx264, yuv420p, +faststart). `testosterone/video/audio.py` builds the heartbeat track from the beat times the render writes.
- The 63: edit `the-63/page-src/the-63.tpl.html` and run `the-63/page-src/build.py` to re-inline `parks.json`. `the-63/build.py` rebuilds the rankings from `input.json`.
- Founders: `founders/script-build/build.py` rebuilds and re-checks `script.json` against the verified quotes; `founders/sources.md` lists every quote's document, date and link.
- Freedom Units: `freedom-units/qa/qa.js` plays full games and recomputes every score.
