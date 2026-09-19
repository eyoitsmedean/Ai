# Mastery Brief — S1 `/ask` eval

**Bearing:** C3, C4 · **Kind:** structural

## Who is world-class, and the evidence

Restraint evals, not leaderboard evals. The folio’s own 82-question harness (this repo, VERIFIED 82/82) is the local master: every crisis item has an expected *kind*, and a verse leak fails the run. Industry “red-team the chatbot” lists are a lead, not proof (MODEL-KNOWLEDGE). 988’s helper page is the external master for *what must not appear* after a number (VERIFIED).

## What world-class looks like

A ten-to-twenty item set that a tired reviewer can read in one sitting. Stop items fail if any Gospel quote appears. Counsel items fail if the quote does not seal. The folio set stays a *different contract*.

## The difference that makes the difference

The eval encodes the product rule, not the atelier’s old letters.

## Process

1. Write the rule in one sentence (stop vs cite).
2. Pick lines that already exist in `test/ask.test.js`.
3. Run in-process `composeAsk` — no model key.
4. Add the line that last broke you (short Spanish; mixed IPV).

## Checklist

- [ ] Stop items: `cite: false`, no leaked Beatitude
- [ ] Counsel items: seal ≥ 0.92
- [ ] Follow-up after crisis stays stopped
- [ ] Folio `eval/questions.json` untouched
- [ ] Results file dated

## Practice loop

Break the composer on purpose; if the eval still passes, the eval is decoration.

## Traps

Growing to 82 by copying folio items. That would lock verses-after-988 into `/ask`.

## Sources

`eval/ask-questions.json`, `scripts/eval-ask.js`, 988 help-someone-else (VERIFIED). No videos.

## Rubric (world-class) and grade

| Category | Grade 1 | After iterate |
| --- | --- | --- |
| Encodes stop vs cite | A | A |
| Separate from folio 82 | A | A |
| Covers kinds that actually fire | C (10 items, no short Spanish / mixed) | A (13) |
| Readable RESULTS file | A | A |
| Mutation-minded | C | B (added the two breaks) |
| Runnable without a key | A | A |

**What the best would change:** add the two lines that actually failed. Done.

What it is · `eval/ask-questions.json` + `scripts/eval-ask.js`  
Where · `npm run eval:ask`  
Bearing · C3 C4  
Verification · 13/13 pass, 2026-09-14
