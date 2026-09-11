# Bot working notes — Red Letter / retrieval rebuild

**Red Letter — lib/retrieve.js — v1 — 2026-09-07**

Owner: Dean. Worker: this session. Status: shipped on `cursor/add-gpt-6-astra-model-0ebd`.

## What changed in this version

- Retrieval is lexicon + BM25 instead of substring overlap plus a trailing-`\b` cue table.
- Ten questions were locked in `test/heldout-retrieve.json` before the rebuild. Top-8 hit rate: 4/10 (committed ranker) → 10/10 (this version). [calc]
- Crisis path is unchanged: `CRISIS_CITATIONS` only.

## How to review

1. `npm test` — expect 58 pass.
2. `npm run eval` — expect 61/61 offline; read `eval/RESULTS.md`.
3. Diff `lib/retrieve.js` against `99f4a39` (last committed substring ranker).

## Assumptions

- k1 = 1.5, b = 0.75: textbook defaults, not tuned on the held-out set. [assumption]
- "suicide" as a noun still fires the crisis path (CLAUDE.md #12).
- No live model was called in this rebuild.

## Sources

- Okapi BM25 ranking function and default parameters: Wikipedia, *Okapi BM25*, opened 2026-09-07, https://en.wikipedia.org/wiki/Okapi_BM25
- Prior substring ranker: `git show 99f4a39:lib/retrieve.js`
