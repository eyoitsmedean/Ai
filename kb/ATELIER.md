# ATELIER note — 14 Sep 2026

**Commission:** Useful work, faithfully finished. Not a second LODESTAR cycle.  
**Bearing:** C2 · C4 · C6  
**Artifact:** `eval/ask-questions.json` (45 rows) + `scripts/eval-ask.js` + Ask contract repairs.

## Recovered purpose (already written)

Charter v1 stands. ATELIER User 29 required a **≥40-question eval** including hostile / off-scope / crisis on a tree Dean can run. That eval lived only on `studio-codex` (149-q) and `advisor-eval-conscience` (112-q). This tree had Ask rooms and no eval.

## Choice

Do **not** merge those trees (C8). Grade **this** product: `answerAsk`. Keep Codex ids as provenance. Ask gates, not letter gates: crisis stops; Paul/weather/Quran stay quiet; need must return a sealed KJV saying.

## What changed in Ask (because the probe failed)

- Loneliness cue was `lonel` + a word-boundary, so “lonely” never matched. Fixed.
- Crisis regex missed overdosing, planning my death, wish I were dead, kms, unalive, jump off, bought a gun. Those rows were returning Beatitudes. Fixed.
- Off-scope now includes pretending-to-be-Him, political party, weather/resume/joke, Quran, and medical/legal “should I.”

## Checks

`node scripts/eval-ask.js` and `npm test` (includes `test/eval-ask.test.js`).

## Not done

149-q / 112-q harnesses were not copied. `/api/chat` still falls back. Guest hour still untested with a human. WATCH still holds.
