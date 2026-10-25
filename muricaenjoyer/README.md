# @Muricaenjoyer content

Everything built for the @Muricaenjoyer X account, kept apart from the Red Letter app in this repo. Nothing here is posted anywhere; it's drafts and assets for Dean to decide on.

| Project | What it is | Live page |
|---|---|---|
| `testosterone/` | "Testosterone Isn't a Personality": the finished X Article, research kit, six sourced charts, header art, and a 52-second captioned video with an original heartbeat track | [Article](https://claude.ai/artifact/E6nnge8UAMGReGFRixKkqb) · [Research kit](https://claude.ai/artifact/9n25cmafMpUqu82moZWCKd) |
| `founders/` | The Founders' Group Chat: America's founders in a text thread, 1776–1826, every bubble a real sourced quote. A 62-second short cut in `short/` (the one to post), plus 1:47 cuts in 4:5, 4:5 fast and 9:16. All cuts carry the Oct 24 quote-check fixes. Also plus a web version with a receipt behind every bubble | [Web chat](https://claude.ai/artifact/QNebUAYTf8zPBpwhrmjBSD) |
| `the-63/` | The 63: the 63 U.S. national parks before Chiricahua became #64 (Oct 20, 2026), ranked into S–D tiers, with filters, awards, method and live re-weighting, plus tier-list images, post text a 47-second countdown video in `video/`, and Chiricahua's verdict in `chiricahua/` | [The 63](https://claude.ai/artifact/Js5RFzV6pZZ1xuC5Gasrfe) |
| `thanksgiving/` | The Thanksgiving Group Chat: how America got its Thanksgiving, 1784–2026, as a group chat (Washington, Franklin, Jefferson, Sarah Josepha Hale, Lincoln, FDR, Congress, Bush). A 76-second video in 4:5 and 9:16, three receipt cards, post text, and `sources.md` for every line. Built on the Founders engine by `build.py`; `render.sh` makes the videos | [The chat](https://claude.ai/artifact/4khMniAp2m8NPFWV92UA49) |
| `freedom-units/` | Freedom Units: a daily estimation game that measures America in American units, with sourced answers and a shareable score card, plus ten question/answer teaser cards and a teaser schedule in `teasers/` | [Game](https://claude.ai/artifact/MuZPaW1jvs49jagrUYfUAm) |

The live pages are private until shared from each page's Share menu. The posting plan (Oct 26 to Nov 26) is in `LAUNCH.md`, and the [Launch Desk](https://claude.ai/artifact/XJi51SMkLHxvaQ412Q4eY2) (built by `launch/build.py`) lays out every post with copy buttons and its image or video, for scheduling in one sitting.

## Rebuilding

- Charts: `python3 testosterone/charts.py <outdir>` (needs matplotlib and the Inter fonts).
- Videos are canvas pages rendered frame by frame: `node testosterone/video/render.js <playwright-path> <page.html> <frames-dir> 30`, then encode the frames with ffmpeg (libx264, yuv420p, +faststart). `testosterone/video/audio.py` builds the heartbeat track from the beat times the render writes.
- The 63: edit `the-63/page-src/the-63.tpl.html` and run `the-63/page-src/build.py` to re-inline `parks.json`. `the-63/build.py` rebuilds the rankings from `input.json`.
- Founders: `founders/script-build/build.py` rebuilds and re-checks `script.json` against the verified quotes; `founders/sources.md` lists every quote's document, date and link.
- Freedom Units: `freedom-units/qa-units/qa.js` and `freedom-units/test/play.js` play full games against the shipping page and recompute every score.
- Launch check: `python3 launch/build.py && python3 launch/preflight.py` checks every post against X limits (weighted length, media per post, image size, video length and codecs, alt text).
