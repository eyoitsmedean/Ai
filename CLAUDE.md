# CLAUDE.md — system of record for Red Letter / The Red Letter Advisor

Read this before designing anything. Decisions here are settled; disagree in a ship note, never by silent reversal. Append, do not rewrite.

## What this is

A chat-first advisor that applies the direct words of Jesus in Matthew, Mark, Luke, and John to a modern life situation. Advisor-first, not a scholarship tool. The product intent was inverted once (scholarship-first); do not repeat that.

## Decisions (settled)

| # | Decision | Recorded | Basis |
|---|---|---|---|
| 1 | Name: "The Red Letter Advisor" (room UI wordmark: Red Letter). | brief, 2026-09-06 | Dean |
| 2 | Palette: parchment paper with one crimson accent (`#8F1D1D`) reserved for Jesus's speech and the single active state. Full scale in `DESIGN.md`. | `DESIGN.md` | Dean |
| 3 | Scope is Jesus's spoken words only, never the whole Bible. The model may emit only `{{Book Chapter:Verse}}` markers from a retrieved allow-list; the server inserts corpus text. It never types a verse. | `README.md`, `lib/scripture.js` | Dean; commit 564b53b |
| 4 | Translation: King James Version (1769 text), public domain. Attribution printed beside citations. | `README.md` | Dean. KNOWLEDGE (not re-checked 2026-09-06): the KJV text is public domain worldwide except for Crown letters patent covering printing in the UK; confirm before any UK print or store listing that asserts otherwise |
| 5 | Crisis handling stays in the product: 988 (US) and findahelpline.com, before the letter, and the letter still comes. | `LAUNCH.md` §97, `lib/crisis.js` | Dean |
| 6 | Model is operator configuration, not a reader toggle. Choices: `claude-opus-5` (default), `gpt-6-astra`. `MODEL` env selects; provider inferred. | `lib/models.js`, PR #23 | 2026-09-05 |
| 7 | OpenAI requests send `store: false`; readers' words are not retained in stored-response history. | `lib/models.js` | 2026-09-06 |
| 8 | Node 22 baseline (`engines`, `.nvmrc`, CI). | `package.json` | 2026-09-06; openai SDK v7 requires it |
| 9 | Crisis detection has one source, `lib/crisis.js`. The three client copies must match byte-for-byte; `test/crisis.test.js` enforces it. | `lib/crisis.js` | 2026-09-06; the previous pattern missed "suicidal" and "suicide" |
| 10 | A reader in crisis is offered only the fixed comfort verses in `lib/retrieve.js` (`CRISIS_CITATIONS`), never token-matched sayings. | `lib/retrieve.js` | 2026-09-06; token matching once offered Mark 13's wars and famines |
| 11 | `npm run eval` is the release gate. `eval/RESULTS.md` must be regenerated on the release commit and must say which mode ran. Nothing is reported as passed that did not run. | `scripts/eval.js` | 2026-09-06 |
| 12 | The noun "suicide" alone triggers the notice, so "the suicide of my brother still haunts me" receives the 988 line and the comfort verses. Accepted: a bereaved-by-suicide reader is at elevated risk and the notice is gentle; the letter still comes. | `lib/crisis.js`, `test/crisis.test.js` | 2026-09-06, ASSUMED by the builder; Dean may reverse |
| 13 | Retrieval is lexicon + BM25, not raw substring overlap. A 2026 message is translated into the vocabulary the sayings use; BM25 (k1 1.5, b 0.75) ranks; curated room verses are interleaved; unmatched messages get `DEFAULT_CITATIONS`. Crisis still uses only `CRISIS_CITATIONS`. | `lib/retrieve.js` | 2026-09-07; held-out @8 went 4/10 → 10/10 vs the committed substring ranker |

## Not yet decided (Dean)

- **Mobile stack.** Two options exist as branches. (A) Capacitor shell around the existing `public/` PWA — `origin/cursor/production-ready-mobile-bca4` has `capacitor.config.json` (last commit 2026-09-02). Reuses the whole HTML build, one codebase, web performance ceiling. (B) Native — `origin/cursor/red-words-native-c2d6` and `origin/cursor/red-words-production-d607` carry an Android/Kotlin project. Best performance and platform feel, two more codebases to keep in step with the room. Default per the brief: (A). Only the file lists of those branches were inspected on 2026-09-06, not their contents.
- Whether harm-to-others phrasing ("I want to hurt him") should also trigger the human-help notice. Currently it does not; the notice text speaks of ending one's own life.
- Whether to add an LLM-judged warmth/fit score to the eval. Currently the eval is deterministic and saves live letters for a human to read.

## Known gaps (recorded, not yet fixed)

- Some spoken-corpus sayings begin with narrator framing ("And Jesus answering them began to say, …"). `README.md` promises His speech, not the frame. Source: `data/spoken-gospels.json` grouping.
- The prodigal son (Luke 15:11–32) is still untagged as a theme room; the 2026-09-07 lexicon now surfaces Luke 15 for estrangement via vocabulary (`father`, `son`, `lost`) rather than a theme tag. A dedicated room would still be clearer.
- A live `gpt-6-astra` call has not been made from this repo; the provider is verified against a mock of the Responses API only.

## Eval status

| Date | Mode | Model | Result |
|---|---|---|---|
| 2026-09-06 | offline (no key) | claude-opus-5 configured | 61/61; live-only checks not run. Live path exercised against a mock Responses API (rung 2): 61/61 |
| 2026-09-07 | offline (no key) | claude-opus-5 configured | 61/61 after lexicon+BM25 retrieval rebuild |
