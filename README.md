# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page. One rule holds the whole thing together: **nothing on the page is presented as His unless the corpus says He said it.** Every claim below comes with the command that proves it.

> **Purpose** · the front door for anyone opening this repo — Dean, a reviewer, a contributor, or the next worker.
> **Owner** · Dean · **Status** · working build on a review branch; not yet in a store · **Updated** · 2026-09-07.
> **What changed in this version** · the Advisor answers the question without a model key (82-question evaluation, results recorded) · phones build through Capacitor (Android verified) · `CLAUDE.md` is the system of record for decisions.

**If you are in crisis:** this is software, not a person, and not therapy, medical care, or pastoral counseling. In the United States, [988](tel:988) answers by call, text, or chat ([988lifeline.org](https://988lifeline.org)), day and night; anywhere else, [findahelpline.com](https://findahelpline.com) lists verified lines in 175+ countries. The product says the same thing, in the same words, before any letter is sent.

## Run it in two minutes

```bash
npm install
npm start              # http://localhost:3000
```

Without a key the whole room opens: Today and Seek serve curated, corpus-verified pages, and the **Advisor reads the question and answers it** from His sayings — a felt need, a named parable, a verse you brought, a hostile line, a request outside the room, or danger, each in its own letter. Add a key only if you want the model to write the letter:

```bash
cp .env.example .env   # then set ANTHROPIC_API_KEY
```

## The room

- **Today** — morning, vespers, or compline; hear the office; a catchword stays until dawn.
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves.
- **Sit** — read a saying, rest one minute while the words arrive, reply with one sentence.
- **Advisor** — a short correspondence that survives the day; every citation is sealed against the Gospel corpus before it reaches the page.
- **Journal** — a commonplace book kept on this device, with a quire of words you have sat with.
- **The Press** — a reviewer's atelier at [`/review`](http://localhost:3000/review): Reveal · Breathe · Parable · Examen · Bless · Forty (church-year aware). Deep links `?leaf=forty|breath|parable|examen|blessing|reveal`. See `REVIEW.md`.

A guest's first eight minutes are scripted in `DEMO.md`; `/welcome` and `/?fresh=1` open a clean title page.

## How the Advisor stays honest

1. **The model never types a verse.** With a key, it may emit only `{{John 14:27}}` placeholders; the server inserts the corpus text. Without a key, `lib/advise.js` composes the letter the same way.
2. **The seal admits only red letters.** Every one of the 3,779 Gospel verses resolves in the corpus, but only the 1,923 in the spoken map are His speech. An angel's line or the evangelist's narration is dropped from a letter, never printed under "He said this" — on either path.
3. **Every quotation is checked**, ≥ 0.92 similarity against the KJV corpus, before the client marks it *Sealed from the Gospels*.
4. **Danger comes first.** One crisis detector, byte-identical in the server, the page, and the on-device fallback (a test fails on drift). It reads danger three ways — the writer, someone they love, a death they are grieving — and each gets its own letter with 988 first and once. The daily letter limit never closes this path. Abuse and assault get the National Domestic Violence Hotline and RAINN, never a verse about divorce.
5. **Nothing typed is echoed** back into a letter, so nothing typed can be laundered into scripture.

The evaluation set behind these claims is `eval/questions.json` (82 real questions: anxiety, grief, shame, crisis in four forms, abuse, third-party concern, negation, typos, Spanish, hostility, prompt injection, off-scope, idioms) and every unedited answer is in `eval/RESULTS.md`.

## Verify it yourself

Nothing here is described as passing that was not run. Last run in this repository: **2026-09-07**.

| Claim | Command | Last result |
| --- | --- | --- |
| Corpus whole: 89 chapters at canonical verse counts; seal, Forty order, Advisor routing, crisis-regex parity, routes | `npm test` | 61 pass, 0 fail |
| Advisor answers 82 questions correctly on the curated path (mis-routing, buried handoffs, echoes, and identical letters all fail the run) | `npm run eval` → `eval/RESULTS.md` | 82/82, 63 distinct letters |
| The page works in a phone-sized browser, including the crisis modal at the daily limit | `npm start` then `npm run qa` | 14 walks pass |
| Android debug build | `npm run mobile:apk` | BUILD SUCCESSFUL (2026-09-06) |
| Live-model path (`ANTHROPIC_API_KEY` set) | `npm run eval` with the key | **unverified** — no key in the build environment |
| iOS build, on-device behaviour | `MOBILE.md` checklist | **unverified** — needs a Mac and a phone |

`npm run eval` exits 1 on any failure, so it can gate a release. `EVAL_URL=https://host npm run eval` runs the set against a deployed host.

## Configure

| Variable | Purpose | Default |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` (or `ANTHROPIC_AUTH_TOKEN`) | live Advisor, daily page, encouragement generation | none — curated path |
| `ANTHROPIC_MODEL` | model for the live path | `claude-opus-5` (see `server.js`) |
| `PORT` | HTTP port | `3000` |
| `API_ACCESS_KEY` | optional gate on `/api/*`: clients must send it as an `x-api-key` header | off |
| `CHAT_RATE_LIMIT` | Advisor letters per client per minute | `10` |

Routes: `/api/health` · `/api/daily` · `/api/themes` · `/api/encouragement` · `/api/library` · `/api/verify` · `/api/chat` · `/api/waitlist` · `/welcome` · `/review`.

## Phones

The iPhone and Android apps are this same HTML build wrapped by **Capacitor** (`appId app.redletter.quietpage`); nothing is rewritten, so the tests, the seal, and the Press ship as they are. Before `npm run mobile:sync`, set the API host in `public/config.js` (`window.RLA_API_BASE`) — the phone has no Node server of its own. Setup, the iOS steps, and the five-minute on-device checklist are in `MOBILE.md`.

## Deploy

- **Node host** — serve this repo with `npm start`; that host is also what the phone builds and any static deploy call for `/api`.
- **GitHub Pages** — `.github/workflows/pages.yml` publishes `public/` on every push to the repo's default branch (`claude/jesus-teachings-chatbot-bSBhF`) when Pages is enabled. Today and Seek work from `public/curated.json` and `public/library.json`; the Advisor on Pages uses the on-device fallback (`public/data/advisor.js`, same crisis detector and handoff, simpler composer) unless `public/config.js` points at a Node host.
- **CI** — `.github/workflows/ci.yml` runs `npm test` on every push and pull request (Node 20).

## The text and its rights

Scripture is the **King James Version (1769 Cambridge text)**, in `data/gospels-kjv.json`; the red-letter spans are `data/red-letter-source.json`, from which `npm run spoken` rebuilds `data/spoken-gospels.json` and `public/library.json` (663 grouped sayings).

- In the **United States** and most of the world the KJV is public domain; no permission is needed. `[verified]` (retrieved 2026-09-07: Yale Library research guide; Law Stack Exchange quoting Cambridge's policy text)
- In the **United Kingdom** the right to reproduce it is a Crown prerogative administered by Cambridge University Press. Cambridge permits up to 500 verses for liturgical and non-commercial educational use with a prescribed acknowledgement, which the settings colophon prints word for word; larger uses are considered case by case. `[verified — two secondary sources; Cambridge's own page was unreachable this session]` The full spoken library exceeds 500 verses, so a U.K. store listing is an open question in `CLAUDE.md`. Whether the prerogative reaches other Commonwealth jurisdictions is asserted by one source only. `[single-source]`

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card. The design language — what was stolen, what was refused — is `DESIGN.md`.

## Where things live

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | **System of record**: locked decisions, the verified/unverified release checklist, open questions for Dean, session log. Read it before designing anything. |
| `server.js` · `lib/` | Express app; `advise.js` (curated Advisor), `scripture.js` (corpus, seal, crisis detector), `curated.js` (twelve theme packs), `year.js` (church year) |
| `public/` | The page (`index.html`), service worker, on-device data, `config.js` |
| `data/` | KJV corpus, red-letter spans, spoken map, library |
| `eval/` · `scripts/eval-advisor.js` | Evaluation set and runner |
| `test/` · `scripts/qa-browser.js` | Node suite and browser walks |
| `android/` · `capacitor.config.json` · `MOBILE.md` | Phone shells |
| `DESIGN.md` · `LAUNCH.md` · `REVIEW.md` · `DEMO.md` | Design language · the 90-day launch and pricing stance · the Press for reviewers · the guest demo |

KJV text is public domain in the United States. Attribution is printed beside citations.
