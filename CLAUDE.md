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
| 6 Sep 2026 | The human-help gate is one shared pattern list (`data/crisis.js`) used by server and page; it is tuned against a pinned sentence set, looks at the last two user turns, and is hashed into `/api/health` so an evaluation can refuse a stale server. | `data/crisis.js`, `test/crisis.test.js`, `server.js` |
| 6 Sep 2026 | The verifier prints only his speech: epistle, Psalm, deuterocanon, and narrative-Gospel citations are dropped from a reply, never passed through. `1 John` is not `John`. | `lib/scripture.js`, `test/scripture.test.js` |
| 6 Sep 2026 | The Advisor evaluation set lives in `eval/` and runs with `npm run eval`; quotation of a non-Gospel book is a hard failure, naming one to decline it is not. Fallback-mode results prove the gate and verifier, not tone; the live run is Dean's, from a machine with a key. | `eval/README.md`, `eval/REVIEW.md` |
| 7 Sep 2026 | `MARKET_STRATEGY.md` is the current strategy page (v2). v1 is archived as `MARKET_STRATEGY.v1.md`. The red-letter niche is occupied (three products) but not owned; money and paid ads stay parked through 4 Dec 2026. | `MARKET_STRATEGY.md`, `docs/bot-notes.md` |

## Open questions (only Dean can close these)

1. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and merge PR #17 so `https://eyoitsmedean.github.io/Ai/` exists. Recommended: yes, before 30 September.
2. Where does the Advisor API run for Lent 2027 (Pages is static; the Advisor needs the node host)? Recommended: decide in January, not now.
3. Quality references for the Advisor brief — two named apps and what to match. Not yet supplied.
4. Where the Red Words repo lives (not visible under `eyoitsmedean` on GitHub). Needed only if a future brief touches it.
5. Run the live evaluation once from a machine with a key (`ANTHROPIC_API_KEY=… node server.js` then `npm run eval`), read the replies on E05, H01, O07, A01, C06, and add a dated section to `eval/REVIEW.md`. Recommended: before the Advisor is offered to anyone but you. About 55 model calls.

## FOR THE RECORD — 6 September 2026

Session: 90-day brief → bound operating book → Advent path build → Pages fix → protocol installed.

- Built: `studio/ninety/` (PROMPT, FIVE, PLAYBOOK, index.html); `RLA_ADVENT` in `data/paths.js`; `adventDayIndex` in `lib/year.js`; `test/paths.test.js`; scope-relative asset paths and worker; `studio/ATELIER.md`; `studio/briefs/`; this file.
- Verified this session: 47/47 unit tests; `scripts/qa-browser.js` 6/6 against `node server.js`; headless Chrome under a `/Ai/` sub-path and with the clock set to 1 Dec 2026, 2 Jan 2027, 6 Sep 2026; all 28 Advent passages against `data/gospels-kjv.json` and the red-letter map; Hallow figures against Appfigures, MWM, Sensor Tower.
- Not verified: the live Pages deploy (Pages not enabled; founder-only). Advisor behaviour with a live API key (no key in this environment).
- Assumed: the protocol paste with no commission line meant "install it and hand over the current work under it". Corrected in ten seconds if wrong.

## FOR THE RECORD — 6 September 2026 (second session)

Commission read as: run the protocol on the Advisor brief's open MASTERWORK item (the evaluation set), and finish the protocol transcription.

- Built: `eval/questions.json` (59 turns: everyday 18, hostile 5, off-scope 8, crisis 13 incl. Spanish and two-turn, adversarial 5, soft 6, edge 4); `scripts/eval.js` + `npm run eval`; `eval/README.md`, `eval/REVIEW.md`, `eval/RESULTS.md`; `data/crisis.js` shared gate; `test/crisis.test.js` (72 must-trigger / 48 must-not-trigger); verifier and parser repairs in `lib/scripture.js`; two-turn gate and detector hash in `server.js`; Parts 5 and appendix appended to `studio/ATELIER.md`.
- Team: one builder; one separate Breaker agent ran INTERROGATE on the gate and the runner (29 findings, register in `eval/REVIEW.md`). Repairs and the final retest were the builder's.
- Verified this session (rung 1): 54/54 unit and API tests; 59/59 evaluation items against `node server.js` in fallback mode, detector `2f573b131c0e`-lineage rebuilt after the idiom fix and re-run; `parseRef('1 John 4:18') === null`; the verifier dropping `1 John`, `Psalm 23:1`, `Matthew 1:1` from a reply.
- Verified in ELEVATE (rung 1): the browser crisis modal opens on a Breaker sentence and closes, `scripts/qa-browser.js` 7/7 in headless Chrome.
- Not verified: any live-model behaviour (no key); the live Pages deploy (founder-only).
- Assumed: a second paste of the protocol with no commission line meant "run it on the brief". Corrected in ten seconds if wrong.

## FOR THE RECORD — 7 September 2026

Commission: UNIVERSAL REBUILD PIPELINE on a blank brief. Target assumed: `MARKET_STRATEGY.md`.

- Built: `MARKET_STRATEGY.md` v2; `MARKET_STRATEGY.v1.md` (archive); `docs/bot-notes.md`.
- Verified this session: 17 URLs opened; `lib/year.js` dates for Advent 2026 / Ash Wednesday 2027 / Easter 2027; HTTP check on every cited URL (Baptist Press 403, replaced).
- Not verified: live App Store search ads; Hallow's full 2026 Lent close; any paywall in this product (none is on).
- Assumed: blank brief fields as listed in `docs/bot-notes.md`. Corrected in ten seconds if the target was something else.

