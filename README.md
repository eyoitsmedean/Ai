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

```bash
cp .env.example .env   # add an API key if you want live generation
npm install
npm start              # http://localhost:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor replies with a verified letter built from the sayings retrieved for *this* message (`lib/letter.js`).

```
MODEL=claude-opus-5    # or gpt-6-astra
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN — for claude-* models
OPENAI_API_KEY=        # for gpt-* models
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
```

Node 22 or newer is required (`.nvmrc` is set).

Model choices live in `lib/models.js`: **Claude Opus 5** (Anthropic, default) and **GPT-6 Astra** (OpenAI). The provider is inferred from the model id; `ANTHROPIC_MODEL` is still honored for older `.env` files. `GET /api/health` reports the active `provider`, `model`, and the available `models`.

Notes for **GPT-6 Astra** (`gpt-6-astra`, released 3 September 2026): it runs over the Responses API with strict JSON-schema output for Today and Seek, and streamed text for the Advisor. Requests are sent with `store: false` so the reader's words are not kept in OpenAI's stored-response history. `OPENAI_REASONING_EFFORT` accepts `low`, `medium`, `high`, `xhigh`, or `max` (Astra rejects `none`); unset leaves the provider default. It is priced at $10 / $50 per million input / output tokens and needs a paid usage tier — see the [model page](https://developers.openai.com/api/docs/models/gpt-6-astra).

```bash
npm test
npm run eval     # run eval/questions.json through /api/chat, write eval/RESULTS.md
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
# Phone shell: capacitor.config.json (webDir public). Dean’s five minutes: DEVICE_CHECKLIST.md
# What has actually been run: RELEASE.md
```

## Evaluation

`eval/questions.json` holds 61 real questions in five groups: everyday struggles, crisis (must get the 988 / findahelpline notice before the letter, and only the fixed comfort verses in `lib/retrieve.js`), near-miss (grief and hyperbole that must **not** get the crisis notice), off-scope, and hostile. `npm run eval` sends each through the real `/api/chat` route and writes `eval/RESULTS.md`.

Without an API key the deterministic layers are checked: crisis detection and handoff order, retrieval of an expected saying, and verification of every printed verse against the KJV corpus. With a key the live letters are also graded (cited only allowed sayings, two to four passages, no leaked markers) and saved under `eval/letters/` for a human to read. The results file says which mode ran; nothing is reported as passed that did not run. `RATE_LIMIT_OFF=1` is set by the script so the 61 requests are not throttled; never set it in production.

Crisis detection lives once, in `lib/crisis.js`; `test/crisis.test.js` fails if the copies in `public/index.html` or `data/advisor.js` drift.

Retrieval (`lib/retrieve.js`) translates a modern message into KJV vocabulary through a lexicon, scores sayings with BM25 (k1 = 1.5, b = 0.75), and lifts curated room verses. Crisis messages still bypass scoring and receive only `CRISIS_CITATIONS`. A ten-question held-out set locked before the rebuild lives in `test/heldout-retrieve.json`.

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** serve this repo with `npm start`.
- **GitHub Pages:** the workflow publishes `public/`. Today and Seek work from `curated.json`. Advisor needs the API host.

KJV text is public domain. Attribution is printed beside citations.
