# CLAUDE.md — system of record for Red Letter

Read this before designing anything. Decisions here are settled; if you think one is wrong, keep it and flag your reasoning in the ship note. Append to the session log; do not rewrite history.

## Mission

A quiet page for the words Jesus spoke: four rooms each morning, an Advisor that only answers in red letters, a blessing you can send to one person. Advisor-first product, not a scholarship tool. The product intent was inverted once (scholarship-first); do not do that again.

## Decisions that stand

| Decision | Status | Where it lives |
| --- | --- | --- |
| Scope is Jesus's spoken words in Matthew, Mark, Luke, John — never Paul, the prophets, or a full Bible | locked | `lib/scripture.js`, `data/red-letter-source.json`, README |
| Translation is the King James Version (1769), public domain in the U.S.; U.K. Crown prerogative acknowledged (Cambridge University Press) in settings | locked | `data/gospels-kjv.json`, settings colophon |
| Every quoted line is sealed against the corpus; a verbatim clipping counts only if it carries ≥60% of the verse or ≥12 words; seal score ≥ 0.92 | locked | `lib/scripture.js` `similarity`, tests |
| The model never types a verse: it emits `{{Book C:V}}` placeholders and the server inserts corpus text | locked | `server.js`, `lib/scripture.js` `verifyAndSubstitute` |
| Without a model key the Advisor still answers the question from the curated theme packs (not a fixed letter) | locked 2026-09-06 | `lib/advise.js`, `eval/` |
| Crisis: 988 by call, text, or chat (988lifeline.org) and findahelpline.com stay in the product; the page says it is not a person | locked | title page, Advisor head, settings, crisis modal, `lib/advise.js` |
| Palette: parchment and crimson; the only loud colour is the red letter; folio not feed | locked | `DESIGN.md`, `public/index.html` |
| Name: the app is branded **Red Letter**; the Advisor is a room inside it. (The brief still says "The Red Letter Advisor"; the repo moved to the shorter name in the Press work and Dean has reviewed it since. Flagged, not reversed.) | locked, flagged | README, manifest |
| Mobile: **Capacitor** wrapping the existing HTML build (`appId app.redletter.quietpage`). A React Native / Expo rewrite was rejected because it discards the working build and its tests | locked 2026-09-02, confirmed 2026-09-06 | `capacitor.config.json`, `android/`, `MOBILE.md` |
| Pricing: the words stay free; annual first; never a weekly price; never lock scripture behind a gate | locked | `LAUNCH.md` |
| Forty rooms follow the church year: Ash Wednesday = Room 1, Sundays not numbered, Holy Week = Rooms 35–40 | locked 2026-09-06 | `public/data/paths.js`, `REVIEW.md` |
| Lent 2027: Ash Wednesday 10 February, Easter 28 March (USCCB) | verified 2026-09-05 | `lib/year.js`, tests |

## What is verified and what is not (release checklist)

Mark each line when you run it. "Verified" means run in this repository and observed; nothing else counts.

| Item | Status | How to verify |
| --- | --- | --- |
| Node suite (56 tests: corpus verse counts, seal, Forty order, Advisor, routes) | verified 2026-09-06 | `npm test` |
| Corpus whole: all 89 Gospel chapters at canonical verse counts, cross-checked against two independent KJV sources | verified 2026-09-06 | `npm test` (corpus integrity) |
| Every quotation in every client data file (155) seals at ≥ 0.92 | verified 2026-09-06 | `npm test` |
| Advisor evaluation set, curated path: 59/59 pass, 41 distinct letters | verified 2026-09-06 | `npm run eval` → `eval/RESULTS.md` |
| Advisor evaluation set, **live model path** | **unverified** — no `ANTHROPIC_API_KEY` in the build environment | `ANTHROPIC_API_KEY=… npm run eval`, then read `eval/RESULTS.md` |
| Browser QA (13 walks: Press, Forty labels, share proofs, reduced motion, tablist) | verified 2026-09-06 | `npm start` then `npm run qa` |
| Android debug build (`assembleDebug`, SDK 36, Java 21) | verified 2026-09-06 — BUILD SUCCESSFUL, `app-debug.apk` 4.3 MB | `npm run mobile:apk` |
| iOS build | **unverified** — needs a Mac with Xcode | `npx cap add ios && npx cap sync ios && npx cap open ios` |
| On-device: share sheet hands a PNG on iPhone; install prompt; notifications | **unverified** — Dean's step | `MOBILE.md` five-minute checklist |
| U.K. distribution of the full spoken library (>500 verses) | **open** — needs counsel | — |

## How to run

```bash
npm install
npm start          # http://localhost:3000 — without a key, curated pages and the curated Advisor
npm test           # Node suite
npm run eval       # Advisor evaluation → eval/RESULTS.md (exit 1 on any failure)
npm run qa         # browser QA against a running server
npm run spoken     # rebuild data/spoken-gospels.json and public/library.json from the corpus
node scripts/repair-corpus.js   # idempotent; restores the six once-missing verses if a stale corpus is restored
```

Environment: `ANTHROPIC_API_KEY` (live Advisor), `ANTHROPIC_MODEL`, `PORT`, `API_ACCESS_KEY`, `CHAT_RATE_LIMIT` (letters per client per minute, default 10). A phone build sets the API host in `public/config.js` (`window.RLA_API_BASE`).

## Open questions for Dean

1. U.K. launch: the full spoken library exceeds the 500-verse customary allowance; take to counsel before any U.K. store listing.
2. `data/scripture.js` holds a dormant WEB (World English Bible) fetch the server never imports — delete or keep?
3. Grid 3:4 share format: keep once a Meta primary page confirms 1080×1440, or drop.
4. Brand line: keep "Red Letter" (current) or return to "The Red Letter Advisor" as the brief says.
5. The API host for phone builds: where will the Node server live (Railway, Fly, a VPS)? `public/config.js` needs that URL before `cap sync`.

## Session log

- **2026-09-05 — Press atelier.** Six leaves (Reveal, Breathe, Parable, Examen, Bless, Forty), `/review` route, browser QA, seal tightened, Holy Week / Triduum labels, synchronous Web Share, 988 by call/text/chat, Cambridge acknowledgement. PR #18.
- **2026-09-06 — Corpus audit.** Six dropped verses found by comparing all 3,779 Gospel verses against bible-api.com KJV and aruljohn/Bible-kjv (Matthew 2:16, 22:1, 26:38; Mark 4:40, 7:11, 8:8); 45 sayings had carried a neighbour's words; repaired by `scripts/repair-corpus.js`, spoken map and library rebuilt, marginal-note leak filtered, four hand-typed quotations corrected. Forty reordered to the church year.
- **2026-09-06 — Curated Advisor + evaluation.** `lib/advise.js` replaces the fixed no-key letter; 59-question evaluation set with recorded results; crisis detector widened in server and client; `CHAT_RATE_LIMIT`; `public/config.js` API base for phone builds; Capacitor deps and `android/` scaffold added; this file created as the system of record.
