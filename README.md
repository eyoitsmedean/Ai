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

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com).

## Run it

Needs Node 22.12 or newer.

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm ci
npm start              # http://localhost:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor replies with a small verified letter.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
TRUST_PROXY=           # proxy hop count (usually 1) when behind a reverse proxy
```

```bash
npm test
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
```

Two checks run against a live server (`npm start` first):

```bash
npm run smoke    # API smoke test; pass a base URL to aim elsewhere
npm run qa       # first-session browser QA; pass a base URL to aim elsewhere
```

`npm run qa` drives a real Chrome through `puppeteer-core` (a dev dependency, so run `npm ci`, not `npm ci --omit=dev`). It looks for Chrome at `/usr/local/bin/google-chrome`; set `CHROME_PATH` if yours lives elsewhere:

```bash
CHROME_PATH="$(which google-chrome)" npm run qa http://127.0.0.1:3000
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** serve this repo with `npm start`. This is the full room: live generation, `/api/*`, and the `/welcome` landing page.
- **GitHub Pages:** [eyoitsmedean.github.io/Ai](https://eyoitsmedean.github.io/Ai/). The workflow tests, then publishes `public/` on every push to the default branch. Today and Seek work from `curated.json`; The letters from `library.json`. With no API to reach, the Advisor still answers with a small verified letter. `/welcome` is a Node route and does not exist on Pages; `?fresh=1` works on both.

KJV text is public domain. Attribution is printed beside citations.
