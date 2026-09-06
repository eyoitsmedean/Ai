# CLAUDE.md — system of record

This file is where decisions for this repo get written. Read it before designing anything. Append; do not rewrite history.

**Working protocol:** `studio/ATELIER.md` (Dean's Atelier Protocol). Run it on every session. Default mode STANDARD.
**Project briefs:** `studio/briefs/`. One file per project. The brief wins over this file's defaults where they differ.

## What this repo is

Red Letter — a quiet web companion constrained to the spoken words of Jesus (KJV, four Gospels). Node/Express server (`server.js`) with an Anthropic-backed Advisor that falls back to verified curated pages without a key; static PWA in `public/`. Corpus: `data/gospels-kjv.json` (KJV 1769, public domain) × `data/spoken-gospels.json` (red-letter map). Every quotation is verified against the corpus in `lib/scripture.js` and `test/`.

Red Words is a **separate** native Flutter app (WEB corpus) and lives outside this repo. Do not merge them.

Default branch: `claude/jesus-teachings-chatbot-bSBhF`. There is no `main`. The Pages workflow publishes `public/` from that branch once Pages is enabled.

## Decisions (settled — build on them, flag disagreement in a ship note)

| Date | Decision | Where |
| --- | --- | --- |
| ≤ Aug 2026 | Advisor-first product, not a scholarship tool. Warm advisor voice; scholarship behind the answer. | `DESIGN.md`, `MARKET_STRATEGY.md` |
| ≤ Aug 2026 | Scope is Jesus's spoken words only. Never Paul, never the whole Bible. | `README.md`, `DESIGN.md` |
| ≤ Aug 2026 | His words stay free. Never lock scripture. Never a weekly price. Never "talk to God" / a model speaking as Jesus. | `LAUNCH.md`, `MARKET_STRATEGY.md` |
| ≤ Aug 2026 | Parchment-and-crimson palette; bound-book UI; church-year seasons change the paper. | `DESIGN.md`, `lib/year.js` |
| 4–5 Sep 2026 | No second product architecture for Red Letter or Red Words. No merge. Native lives in Red Words. | `studio/ninety/PROMPT.md` |
| 5 Sep 2026 | Clean room: no employer clients, contacts, data, decks, methods, devices, or time in any side project. | `studio/ninety/PROMPT.md` |
| 5 Sep 2026 | The 90-day plan is five things (`studio/ninety/`). If only two run: October (the freeze) and The Compound. Do not commission more offers this window. | `studio/ninety/FIVE.md` |
| 5 Sep 2026 | Advent path *Watch with me*: 28 rooms counted from Advent Sunday, opened by calendar not streak; week one is Seven Days. | `data/paths.js`, `test/paths.test.js` |
| 6 Sep 2026 | Asset paths and service worker are scope-relative so the app runs at the origin root and under a project path (`/Ai/`). | `public/sw.js`, `public/index.html` |
| 6 Sep 2026 | Matthew 28:20 reads *alway* (KJV), not *always*. Quotes come only from the corpus. | `data/advisor.js`, `data/curated.js` |

## Open questions (only Dean can close these)

1. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and merge PR #17 so `https://eyoitsmedean.github.io/Ai/` exists. Recommended: yes, before 30 September.
2. Where does the Advisor API run for Lent 2027 (Pages is static; the Advisor needs the node host)? Recommended: decide in January, not now.
3. Quality references for the Advisor brief — two named apps and what to match. Not yet supplied.
4. Where the Red Words repo lives (not visible under `eyoitsmedean` on GitHub). Needed only if a future brief touches it.

## FOR THE RECORD — 6 September 2026

Session: 90-day brief → bound operating book → Advent path build → Pages fix → protocol installed.

- Built: `studio/ninety/` (PROMPT, FIVE, PLAYBOOK, index.html); `RLA_ADVENT` in `data/paths.js`; `adventDayIndex` in `lib/year.js`; `test/paths.test.js`; scope-relative asset paths and worker; `studio/ATELIER.md`; `studio/briefs/`; this file.
- Verified this session: 47/47 unit tests; `scripts/qa-browser.js` 6/6 against `node server.js`; headless Chrome under a `/Ai/` sub-path and with the clock set to 1 Dec 2026, 2 Jan 2027, 6 Sep 2026; all 28 Advent passages against `data/gospels-kjv.json` and the red-letter map; Hallow figures against Appfigures, MWM, Sensor Tower.
- Not verified: the live Pages deploy (Pages not enabled; founder-only). Advisor behaviour with a live API key (no key in this environment).
- Assumed: the protocol paste with no commission line meant "install it and hand over the current work under it". Corrected in ten seconds if wrong.
