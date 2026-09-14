# Mastery Brief — Screen eval + verse seal
**Bearing:** C8 · C3 · C10

## Who is world-class
- Anthropic / OpenAI model-spec evals — **the shipped surface** is what you score, not an internal helper. SOURCE-REPORTED (practice).
- Dean: “his words only” + “from an opened text.”

## What world-class looks like
Every eval case runs `composeScreen`. Crisis cases must have empty `meaning` and `limits`. A visible seal: “This is the corpus text of Matthew 5:4 (KJV).”

## Difference
Good: letter eval green, one-screen untested. World-class: the page Dean opens cannot silently diverge.

## Process
1. `eval-advisor.js` calls `composeScreen`.
2. JSON `checks.screen`.
3. UI seal from `ref` + `citation`.

## Traps
Sealing WEB while showing KJV. Sealing after a model rewrite (we have no model on `/ask`).

## Sources
`scripts/eval-advisor.js` VERIFIED · KJV dossier T2.

## Rubric · self-grade
| Criterion | Grade | Evidence |
| --- | --- | --- |
| Every eval case runs `composeScreen` | Pass | `eval-advisor.js` |
| Crisis screen empty of quote/meaning | Pass | engine + `checks.screen` |
| Non-crisis screen matches first letter saying | Pass | quote equality |
| Visible seal names verse + KJV | Pass | “Kept as the opened KJV of {verse}.” (does not claim a live corpus lookup in the browser) |
| Seal hidden on crisis | Pass | `verified: false` + UI clear |
| RESULTS.md lists `screen` | Pass after `npm run eval` | column in renderer |
| No WEB seal on KJV text | Pass | hardcoded KJV label |

**Iterate:** `verified` flag added so the UI cannot seal an empty verse. Best-in-world: seal is a sentence, not a badge.

**Deliverable:** screen eval + seal · `scripts/eval-advisor.js`, `public/one-screen.html`, `data/letterpress.js` · Bearing: C8 C3 C10 · verification: `npm run eval` + `qa:static`.
