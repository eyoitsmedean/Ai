# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, installable on iPhone and Android, and honest about every citation.

## The room

- **Today** — a morning affirmation and a longer Word, with a one-minute practice, a week ribbon, and a streak that survives the timezone
- **Seek** — twelve encouragement rooms (Anxiety & Worry, Grief & Loss, Forgiveness, …), each a verified pack of sayings with a practice and a closing line
- **Advisor** — a short correspondence. Scripture is verified against a Gospel corpus before it is written on the page; each passage carries a seal
- **Journal** — a commonplace book kept on this device, with backup and restore as a file
- **Lectio, Amen, Blessing** — read a saying slowly, listen to it, sit with it, send it as a printed card

## What the server guarantees

The Advisor model never types a verse. It emits `{{John 14:27}}` markers chosen from an allow-list retrieved for the question; the server substitutes the recorded **King James Version** (1769) text as the reply streams, holds back any unfinished marker, and finishes with a per-citation verdict the page uses to seal each passage. Daily and encouragement JSON are requested as structured output and verified the same way; anything that fails verification is replaced by the curated page.

Only Jesus's own speech can be rendered as a quotation: a marker for a narrator line (`{{Matthew 1:1}}`), another author (`{{Romans 8:28}}`) or an unknown reference is dropped with its context sentence, and a letter left with no verifiable saying is replaced by the retrieval letter.

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages and the Advisor answers with a short letter retrieved for what was written — theme passages, situation packs (marriage, prayer, money, anger, an estranged child, a marked day…), and an honest boundary with one open door when the question is trivia, code, or a demand to argue. Offline, the PWA serves saved WEB text from `public/data/corpus.json`.

This is not a person, and it is not therapy, medical care, or pastoral counseling. Messages that describe suicidality, self-harm, abuse, threats or assault are met first with human help — a modal before sending and a notice at the top of the letter — and with a fixed letter that never counsels staying in danger. In crisis: [988](tel:988) (US & Canada, call or text) · Samaritans [116 123](tel:116123) (UK & Ireland) · Lifeline [13 11 14](tel:131114) (AU) · [Find A Helpline](https://findahelpline.com). Unsafe at home (US): [1-800-799-7233](tel:18007997233), text START to 88788, [thehotline.org](https://www.thehotline.org/). Sexual assault (US): RAINN [1-800-656-4673](tel:18006564673).

## Evaluation set

`eval/questions.json` holds 57 real questions — life, hostile, off-scope, crisis, danger and edge cases — each with checkable expectations. `npm run eval` posts them to a running server, reads the stream the way the page does, and scores every letter: no marker leaks, Gospels only, every citation verified by the server, citation counts, theme relevance, the 988 / hotline handoff, no persona claims. It writes `eval/RESULTS.md` (summary table plus every letter in full) and `eval/results.json`, and exits non-zero on any failure.

```bash
RATE_LIMIT_OFF=1 node server.js          # locally, so 57 requests are not throttled
npm run eval                             # or: node scripts/eval.js --url https://your-host
```

The committed `eval/RESULTS.md` states which path it ran against. Against the retrieval path (no key) it is 57/57. The live-model run requires an `ANTHROPIC_API_KEY` and is Dean's step (see `RELEASE.md`).

## Run it

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
npm test               # 48 tests: routes, verification, streaming hold-back, church year
```

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
ANTHROPIC_EFFORT=low   # output_config.effort for Opus 5
ALLOWED_ORIGINS=       # comma-separated origins for a static front end (GitHub Pages)
PORT=3000
```

```bash
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
npm run check    # syntax-check server + every client module
```

## Layout

```
server.js            Express API: /api/daily /api/encouragement /api/chat (SSE) /api/verify /api/library /api/health
lib/                 KJV corpus lookup, red-letter extraction, verification, retrieval, structured-output schemas, church year
data/                KJV Gospels, spoken-Gospels map, curated packs
public/              The PWA: index.html, css/app.css, js/*.js, sw.js, manifest.json, self-hosted fonts, WEB offline corpus
eval/                questions.json (the evaluation set) and the generated RESULTS.md / results.json
scripts/             eval.js, smoke.js, icon and spoken-corpus builders
test/                node:test suites run by CI
docs/                DEVICE-CHECKLIST.md — Dean's five-minute iPhone / Android pass
CLAUDE.md            System of record: settled decisions, licences with sources, open questions
RELEASE.md           Release checklist with every item marked verified or unverified
DEPLOY.md            Railway/Docker and GitHub Pages + API deployment, cache versioning, iOS/Android notes
```

The PWA is served with relative paths so it runs at `/` (Railway) and under a sub-path (GitHub Pages). `public/js/base.js` resolves asset URLs and an optional `<meta name="rla-api-base">` for a remote API.

## Deploy

See [DEPLOY.md](DEPLOY.md). In short: `Dockerfile` for Railway (API + PWA together), or GitHub Pages for the front end pointed at a Railway API via `rla-api-base` and `ALLOWED_ORIGINS`.

## Text and licences

The World English Bible is public domain worldwide ("World English Bible" is a trademark of eBible.org). The King James Version is public domain outside the United Kingdom; in the UK its rights are a perpetual Crown prerogative administered by Cambridge University Press, which permits up to 500 verses for liturgical and non-commercial educational use with the acknowledgement the app prints in its About sheet. Sources, dates checked, and the open question about moving the server corpus to WEB before any paid UK release are in `CLAUDE.md`. Fonts are SIL OFL 1.1.
