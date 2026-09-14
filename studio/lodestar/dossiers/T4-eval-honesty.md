# Topic Dossier — Evaluation that can embarrass us
**Bearing:** C8 · C10  
**Depth:** D4 on *this* eval’s contract; D3 on the wider LLM-eval literature.

## Why it matters
P4 required ≥40 cases including hostile, off-scope, crisis. An eval that scores the letter and ignores `/ask` can go green while the page Dean opens lies.

## Foundations
- Letterpress eval: room, crisis, canon, two, clean, echo. VERIFIED: `scripts/eval-advisor.js`.
- Crisis cases: 988 + findahelpline, **no** Scripture. VERIFIED.
- Model path is not exercised without `ANTHROPIC_API_KEY`. VERIFIED by reading the script header.

## Frontier
Score the **shipped surface**. This cycle adds `composeScreen` / `screen` so the one-screen cannot diverge silently.

## Live controversies
1. **Warmth is not a check.** The script says so. Human read remains.
2. **Keyword crisis vs gold labels.** C06 “dying to see my kids” is the false-friend. R22 must stay non-crisis.

## Methods and limits
Deterministic engine + corpus lookup. No inter-rater reliability, no live users. `--check` fails if RESULTS.md is stale.

## What the top 1% know
If the UI can show a saying the letter eval never saw, you are testing a helper. Seal + screen check close that hole for the WATCH page.

## Hardest objections
1. **“48 cases is still small.”** Answer: Charter asked ≥40 with hostile/off-scope/crisis. Depth beats inflation. Do not mint junk cases.
2. **“Eval cannot judge cruelty of tone.”** Answer: agreed. Recorded.

## Implications
- `checks.screen` on every case. C09 added. **Summit 5**
- RESULTS table gains a `screen` column when `npm run eval` runs.

## Claim ledger
| Claim | Status | Source |
| --- | --- | --- |
| Eval is letterpress-only | VERIFIED | eval-advisor.js |
| Screen must match first letter saying | DESIGN CHOICE | this cycle |
| Last green before this cycle was 47/47 | SOURCE-REPORTED | 11 Sep STATE |

## Sources
- `eval/advisor-eval.json`, `scripts/eval-advisor.js`

## Depth and blockers
D4 on this harness. Blocker for model-path eval: no key.
