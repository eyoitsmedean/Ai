# Mastery Brief — One-screen typesetting
**Bearing:** C3 · C6

## Who is world-class
- Bringhurst — measure 45–75 characters; one size change per thought. SOURCE-REPORTED.
- Matthew Butterick, *Practical Typography* — body 16–20px equivalent; contrast over chrome. SOURCE-REPORTED.
- Dean taste — “warm quiet folio”; crimson = spoken words only.

## What world-class looks like
Four frames readable on an iPhone SE-width (320) without pinch. Kickers 11–12px, not 9px. The saying is the only crimson. Meaning ≤4 lines. Limits in smaller, cooler type.

## Difference
Amateur: shrink everything to fit. Master: cut words, keep type.

## Process
1. Lock the saying as the only `.say`.
2. Kickers: letter-spaced small caps or 11px sans, not 9px.
3. Measure: `max-width: 36em` on the card.
4. Meaning from curated `context` only — never a model.

## Checklist / traps
Do not put crimson on “What that might mean.” Do not add a fifth frame. Do not enable Pages to “see it.”

## Sources
Bringhurst · Butterick — not re-downloaded; principles cross-checked against existing folio CSS VERIFIED in repo.

## Rubric · self-grade
| Criterion | Grade | Evidence |
| --- | --- | --- |
| Kickers ≥11px | Pass | 12px |
| Crimson = speech only | Pass | `.words` crimson; `.meaning` ink-2; QA asserts colors |
| Measure readable | Pass | sheet `min(36em, 100%)` |
| Four frames on first paint | Pass | unchanged contract; QA |
| No fifth product frame | Pass | Rest/Print are chrome, not a fifth kicker |
| Meaning from stored context | Pass | `composeScreen` |
| Phone SE without pinch | Partial | CSS done; GUI width check is later QA |

**Iterate:** bumped kickers 11→12; locked meaning off crimson. Best-in-world change: cut the deck to one clause so the saying sits higher — done in spirit (deck already short); did not delete it (first-paint identity).

**Deliverable:** one-screen typesetting · `public/one-screen.html` · Bearing: C3 C6 · verification: `qa:static` color + copy checks.
