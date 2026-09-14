# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

## The room

- **Today** — morning, vespers, or compline; hear the office; a catchword stays until dawn
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves
- **Sit** — read a saying, rest one minute while the words arrive, reply with one sentence
- **Advisor** — a short correspondence that survives the day; scripture is verified against a Gospel corpus before it is written on the page
- **Journal** — a commonplace book kept on this device, with a quire of words you have sat with

Quoted verses are checked against the public-domain **King James Version** (1769). The Advisor first retrieves allowed sayings, then the model may emit only `{{John 14:27}}` placeholders. The harness inserts the spoken corpus text, so the model never types the verse. Daily and encouragement JSON are requested as structured output, then verified the same way.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com). The page names the line and stops; it does not keep writing.

A one-screen ask (`/ask`) sets one saying, at most four lines of stored meaning, and the cannot-do block. It is paper. It is not a launch.

## Run it

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor is set by the harness itself — it hears the need you named (shame, grief, fear, doubt…), answers from five spoken sayings kept for that room, and does not repeat a sentence until the room and the commons are spent, at which point it says so. The page marks these letters *Set without a model, from His words only*, and the mark stays with the letter through reloads and into the journal.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
```

```bash
npm test          # API, corpus, letterpress, and static-artifact checks
npm run spoken    # rebuild data/spoken-gospels.json and public/library.json
npm run curated   # regenerate public/curated.json and public/data/ from lib/curated.js
npm run smoke     # against a running server
npm run qa        # first session in a real browser, against a running server
npm run qa:static # the page alone, as GitHub Pages serves it — no API host
npm run eval      # the Advisor evaluation set (eval/advisor-eval.json) → eval/RESULTS.md; phone steps in eval/PHONE-CHECKLIST.md
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`.

Curated sayings have one source, `lib/curated.js`, where every passage is looked up in the corpus. Everything the static page ships — `public/curated.json`, `public/data/curated.js` — is generated from it and the test suite fails if an artifact is stale or any shipped quote is not canonical red-letter text. The letter engine, `data/letterpress.js`, is one file that runs unchanged in Node and in the browser.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** serve this repo with `npm start`.
- **GitHub Pages:** the workflow publishes `public/`. Today, Seek, and the Advisor all work from the generated data with no API host; the Advisor runs the same letterpress the server does, in the browser. Live model generation needs the Node app.

KJV text is public domain. Attribution is printed beside citations.
