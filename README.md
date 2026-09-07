# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

> **Purpose** — the front door for anyone opening this repo: what the room is, why a verse printed in it can be trusted, how to run, check, and ship it.
> **Owner** — Dean. **Status** — pre-launch; the current line of work is [PR #22](https://github.com/eyoitsmedean/Ai/pull/22). **Updated** — 2026-09-07.
> **What changed in this version** — answers first, depth folded; the GitHub Pages claim corrected (Pages is not enabled); a "check it" table that says what each command proves.

## The room

- **Today** — morning, vespers, or compline; hear the office; a catchword stays until dawn
- **Paths** — **Seven Days** (Come / Peace / Light / Love / Forgive / Abide / Go), then **Forty**: forty leaves bound in five quires — Come, Light, Mercy, Abide, Go — for Lent or for after the week. A leaf is kept by sitting with it; a missed morning is never a failure state
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves
- **Sit** — read a saying, rest one minute while the words arrive, reply with one sentence
- **Advisor** — a short correspondence that survives the day; scripture is verified against a Gospel corpus before it is written on the page
- **Journal** — a commonplace book kept on this device, with a quire of words you have sat with

## Why a verse printed here can be trusted

Every verse on every page is filled from one file, never typed by a model or by us.

1. **The corpus** — the four Gospels of the public-domain **King James Version** (1769 text): 3,779 verses, every chapter checked against KJV verse counts so a dropped verse can never shift a citation (`test/corpus.test.js`).
2. **The map** — `data/red-letter-source.json` marks which verses, or which spans of a verse, are His. It is tested: every partial marker must quote its verse, the great discourses must be covered, no verse in red may carry another speaker's reply (`test/map.test.js`).
3. **The frame** — the KJV has no quotation marks, so "And Jesus answering said unto them," is cut before a verse is printed in red. Three ordered rules plus hand-reviewed overrides; a test fails on any narrator frame left in red (`test/spoken.test.js`). Result: **1,927 spoken verses in 660 sayings** (`data/spoken-gospels.json`, rebuilt by `npm run spoken`; counts as of 2026-09-06).
4. **The floor** — the Advisor first retrieves allowed sayings; the model may emit only `{{John 14:27}}` placeholders; the server inserts the corpus text. A letter that cites another author, or arrives with no verified saying, is replaced by the room's own letter (`lib/counsel.js`). Daily and encouragement JSON are requested as structured output and verified the same way.

The red letters follow the King James red-letter tradition begun with Louis Klopsch's 1899 New Testament ([Crossway](https://www.crossway.org/articles/red-letter-origin/); [American Bible Society](https://www.americanbible.org/news/articles/when-did-publishers-start-printing-red-letter-bibles/)). Where a speech ends is an editor's call; like most KJV editions the room sets John 3:16–21 as His words, and Room settings says so.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com). A crisis line opens the human door **before** any verse — on the client (a modal) and on the server (a notice), and a test keeps the two detectors identical.

## Run it

Node 20 or newer (CI runs 20; the native-shell build needs 22+).

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
```

```
ANTHROPIC_API_KEY=       # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=          # optional gate for /api/*
RLA_ALLOWED_ORIGINS=     # comma-separated origins allowed to call /api (see Deploy)
RLA_SIGNAL_PATH=         # where anonymous day counts are appended (default data/signals.jsonl)
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor writes a verified letter for the question from the curated rooms (see *When the lamp is out*).

## Check it

| Command | What it proves | Needs |
|---|---|---|
| `npm test` | 83 tests: corpus counts, the map, the frame, the church year, the paths, the API, the lamp-out letter and the floor, client/server crisis parity | nothing |
| `npm run audit` | lists every red letter that still opens like narration — 0 named frames, 13 pronoun frames, each a reviewed line inside a parable (2026-09-07) | nothing |
| `npm run qa` | 14 checks of a first session in headless Chrome at a phone viewport — title page, lectio, Seven, Forty, Lent, the ledger, the Advisor and its crisis door | a running server, system Chrome |
| `npm run eval` | 46 real questions posted to a live server; every citation must be His and quote the corpus; crisis handoff before any verse; off-scope answered honestly; answers vary with the need. Writes `eval/RESULTS.md` and records which path answered | a running server (~5 min; the rate limit is honoured) |
| `npm run smoke [url]` | route smoke against any host | a running server |

Counts above are as of 2026-09-06. `RELEASE.md` lists what has been verified, at which rung, and what has not.

## Deploy

- **Node host** — `npm start` serves `public/` and `/api/*`. This is the only deployment that runs the Advisor's model path.
- **GitHub Pages** — `.github/workflows/pages.yml` is ready but **Pages is not enabled on the repo** (site and Pages API both 404 on 2026-09-07); enabling it is Dean's step. Note that `public/index.html` loads its assets from the site root (`/data/curated.js`, `/sw.js`), so Pages needs a user site or custom domain, not the `/Ai/` project path. On Pages, Today and Seek work from `curated.json` and the library from `library.json`; the Advisor needs an API host.
- **One build, any host** — `<meta name="rla-api-base">` in `public/index.html` (empty = same origin) is where `/api` lives. `npm run shell https://api.host` writes `dist-shell/` with it set. The server answers other origins only when they are named in `RLA_ALLOWED_ORIGINS`; for a Capacitor shell add `capacitor://localhost` and `https://localhost`.
- **Native shell** — Capacitor around this build; `capacitor.config.json` points at `dist-shell/`. Exact commands, requirements, and the five-minute on-device checklist are in `RELEASE.md`.

## Depth

<details>
<summary><strong>Cutting the frame</strong> — how narration leaves the red text</summary>

The KJV has no quotation marks, so "And Jesus answering said unto them," must be removed before a verse is printed in red. `lib/scripture.js` does this with three ordered rules — a named speaker (`Jesus`, the evangelist's capitalised `the Lord`), a pronoun frame at the start of a speech block, a narrator `, saying,` — and keeps parable speech whole (when Jesus says "His lord said unto him, Well done", those are His words). Cases the rules cannot decide are reviewed by hand in `data/spoken-overrides.json`; `""` there means the map marks a verse that is not His speech (Luke 13:14 is the synagogue ruler). `npm run audit` lists every red letter that still opens like narration; `test/spoken.test.js` fails on any named frame, requires each remaining pronoun frame to be listed as reviewed parable speech, and forbids the name "Jesus" inside red text except John 17:3, where He names Himself in prayer.

The map itself is tested (`test/map.test.js`): every partial marker must quote its verse span by span (spans separated by ` … ` when another speaker interrupts, as in John 21:15), the great discourses must be covered except for the disciples' questions, no full verse may carry another speaker's reply ("They say unto him, Twelve" — Mark 8:19 is cut by override), and the KJV text may carry italic braces but no editorial notes.

</details>

<details>
<summary><strong>The ledger</strong> — launch signals counted on the device</summary>

`LAUNCH.md`'s four signals are counted on the reader's device (`rla-ledger`: open, lectio, blessing, advisor, sevenStart, sevenDone; sixty days) and read in Room settings. Nothing leaves the device unless *Share anonymous counts* is on; then completed days are sent once each as plain totals — no name, no device id — to `POST /api/signal`, which appends to `data/signals.jsonl` (gitignored; `RLA_SIGNAL_PATH` overrides). `GET /api/signal/summary?days=30` returns the four ratios with their denominators; because no id travels, "active" is device-days, not unique devices, and the response says so. The toggle only appears when `/api/health` answers, so it is absent on a static host.

</details>

<details>
<summary><strong>When the lamp is out</strong> — the letter with no model</summary>

With no model key (or when the model fails) the server still writes the letter for *this* question: `lib/counsel.js` reads the need from the writer's words (twelve rooms, weighted cues, the same voice lines as the client's offline advisor in `data/advisor.js`), takes the passages from the curated rooms, and fills every verse from the corpus. A question that does not reach His words gets an honest out-of-room letter rather than a verse about the weather. A crisis line gets company under the human-help notice, never a scope disclaimer.

</details>

<details>
<summary><strong>The evaluation set</strong> — 46 questions and what a green run means</summary>

`eval/questions.json` holds 46 real questions — 16 everyday, 10 low-moment, 6 hostile, 6 off-scope, 8 crisis. `npm run eval` posts them to a live server and writes `eval/RESULTS.md`: every citation must resolve to His words and quote the corpus exactly; no other author; crisis lines must open with the human handoff (988 · findahelpline) before any verse; off-scope must be answered honestly; answers must vary with the need. The report records which path answered. **A green run on the offline path says nothing about the model path**, and the report says so; run it again with a key and read the *tone* column as the writer would.

</details>

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card. The design language is in `DESIGN.md`.

## Where things are recorded

| File | Holds |
|---|---|
| `CLAUDE.md` | decisions that are settled, questions only Dean can close, the session log — read it before designing anything |
| `RELEASE.md` | what is verified and at which rung, what is not and what it takes, native-shell steps, on-device checklist |
| `LAUNCH.md` | the first ninety days, the four signals, what is refused |
| `DESIGN.md` | the design language |
| `DEMO.md` | the eight-minute guest demo |
| `IMPROVEMENT_PLAN.md` | what was wrong and what fixed it, session by session |
| `MARKET_STRATEGY.md` | market research and positioning |

## Rights

The KJV text is public domain in the United States and most of the world; in the United Kingdom it remains Crown prerogative administered by Cambridge University Press (a 500-verse limit for non-commercial use — see `CLAUDE.md`). Attribution is printed beside every citation. This repository has no LICENSE file `[decision needed: Dean — recommended: keep private until a license is chosen]`.
