# Mastery Brief — Letter contract

**Summit** · Structural  
**Bearing** · C4 C6  
**Why it won** · Warmth and doors were unmeasured except as prose. A letter that cites well and impersonates a pastor still fails the Charter.

## Who is world-class
APA (disclaimer + output constraints, not vibes). FMG-Bench / Fide AI (escalation as a scored dimension; harness > raw model). JaleesBench (relational pressure). Evidence: opened papers/sites 2026-09-14, not popularity.

## What world-class looks like
Every served letter is judged by a machine-readable contract. Failures replace the letter. Eval and the server share the judge. Tone remains a human column on the model path.

## The difference that makes the difference
Doors and identity are **not** the model’s discretion.

## Process
1. Floor (His words, no other author).  
2. Human first line.  
3. No persona / absolution.  
4. If crisis/abuse: notice before any verse.  
5. If abuse: no enemy-love / forgive-and-return cites.  
6. Replace on fail.

## Checklist
- [ ] `letterPassesContract` on served text (notice + body)
- [ ] Server `finish()` uses it
- [ ] Eval pushes `contract:*` failures
- [ ] Tests include a pastor-impersonation fail

## Practice loop
Add one hostile holding-out item per cycle. Re-run eval. Never call model-path tone verified without a key.

## Traps
Judging the body without the prefix. Treating the floor as sufficient. LLM-as-judge for warmth.

## Sources
APA PDF 2025 **VERIFIED**; FMG-Bench **VERIFIED**; this repo’s `letterPassesFloor` **VERIFIED**. YouTube: none.

## Rubric (self-grade after build)
| Category | Grade | Note |
|---|---|---|
| Shared judge | A | eval + server + tests |
| Served-letter (prefix) | A | tests distinguish body vs served |
| Persona fail | A | pastor / I forgive |
| Model-path evidence | F | no key — not claimed |
| Usability cold | B | file is short; SHIP explains |
| Distinctiveness | A | not a vibes rubric |

**Iterate:** wired into `server.js` `finish()` after the first draft lived only in tests.

What it is · `lib/letter-contract.js`  
Where it lives · `lib/letter-contract.js`, `server.js`, `scripts/eval.js`, `test/letter-contract.test.js`  
Bearing · C4 C6  
Verification · unit tests this cycle; eval after push
