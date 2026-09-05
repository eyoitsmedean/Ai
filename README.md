# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

## The room

- **Today** — morning, vespers, or compline; hear the office; a catchword stays until dawn
- **Paths** — **Seven Days** (Come / Peace / Light / Love / Forgive / Abide / Go), then **Forty**: forty leaves bound in five quires — Come, Light, Mercy, Abide, Go — for Lent or for after the week. A leaf is kept by sitting with it; a missed morning is never a failure state
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves
- **Sit** — read a saying, rest one minute while the words arrive, reply with one sentence
- **Advisor** — a short correspondence that survives the day; scripture is verified against a Gospel corpus before it is written on the page
- **Journal** — a commonplace book kept on this device, with a quire of words you have sat with

Quoted verses are checked against the public-domain **King James Version** (1769). The Advisor first retrieves allowed sayings, then the model may emit only `{{John 14:27}}` placeholders. The harness inserts the spoken corpus text, so the model never types the verse. Daily and encouragement JSON are requested as structured output, then verified the same way.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com).

## Run it

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor replies with a small verified letter.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
```

```bash
npm test
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`. `test/corpus.test.js` checks every Gospel chapter against KJV verse counts so a dropped verse can never shift a citation again; `test/paths.test.js` verifies every Seven and Forty leaf against the corpus.

**Cutting the frame.** The KJV has no quotation marks, so "And Jesus answering said unto them," must be removed before a verse is printed in red. `lib/scripture.js` does this with three ordered rules — a named speaker (`Jesus`, the evangelist's capitalised `the Lord`), a pronoun frame at the start of a speech block, a narrator `, saying,` — and keeps parable speech whole (when Jesus says "His lord said unto him, Well done", those are His words). Cases the rules cannot decide are reviewed by hand in `data/spoken-overrides.json`; `""` there means the map marks a verse that is not His speech (Luke 13:14 is the synagogue ruler). `npm run audit` lists every red letter that still opens like narration; `test/spoken.test.js` fails on any named frame and requires each remaining pronoun frame to be listed as reviewed parable speech. The red letters follow the KJV red-letter tradition (Klopsch, 1899); like most KJV editions the room sets John 3:16–21 as His words, and Room settings says so.

**The ledger.** LAUNCH's four signals are counted on the reader's device (`rla-ledger`: open, lectio, blessing, advisor, sevenStart, sevenDone; sixty days) and read in Room settings. Nothing leaves the device unless *Share anonymous counts* is on; then completed days are sent once each as plain totals — no name, no device id — to `POST /api/signal`, which appends to `data/signals.jsonl` (gitignored; `RLA_SIGNAL_PATH` overrides). `GET /api/signal/summary?days=30` returns the four LAUNCH ratios with their denominators; because no id travels, "active" is device-days, not unique devices, and the response says so. The toggle only appears when `/api/health` answers, so it is absent on GitHub Pages.

`npm run qa` drives a first session in headless Chrome (title page, lectio, Seven, Forty, Lent, the ledger). It needs a running server and system Chrome.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** serve this repo with `npm start`.
- **GitHub Pages:** the workflow publishes `public/`. Today and Seek work from `curated.json`. Advisor needs the API host.

KJV text is public domain. Attribution is printed beside citations.
