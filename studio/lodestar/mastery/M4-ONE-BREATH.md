# Mastery Brief — One-breath rest
**Bearing:** C6 · C9  
**Director's Cut.**

## Who is world-class
- *Guigo II*, *Scala Claustralium* — lectio ends in rest, not in more text. SOURCE-REPORTED (tradition).
- Folio Sit room already implements a timer + hide chrome. VERIFIED in `public/index.html`.

## What world-class looks like
Sixty seconds. The saying stays. Chrome (watch, buttons, meaning, limits) recedes. `prefers-reduced-motion`: no pulse, just hide.

## Difference
Sit is a *room*. This is a *breath* on the one-screen — same spirit, smaller door.

## Process
Button “Rest” → `html.resting` → 60s → restore. Escape cancels.

## Traps
Autoplay sound. Motion that ignores reduced-motion. Making rest a fourth product.

## Sources
Guigo II (standard lectio source, not re-fetched) SOURCE-REPORTED · Sit implementation VERIFIED.

## Rubric · self-grade
| Criterion | Grade | Evidence |
| --- | --- | --- |
| Sixty seconds | Pass | `setTimeout(endRest, 60000)` |
| Saying stays | Pass | `#words-block` remains |
| Chrome recedes | Pass | `html.resting` hides watch/form/meaning/limits |
| Reduced motion | Pass | no pulse; smaller offset |
| Escape cancels | Pass | keydown + QA |
| Not a fourth product | Pass | one button, no new room |
| Hidden on crisis | Pass | actions cleared |

**Iterate:** added Escape after first write. Best-in-world: no autoplay sound (never added).

**Deliverable:** one-breath rest · `public/one-screen.html` · Bearing: C6 C9 · verification: `qa:static` Rest + Escape. Director’s Cut.
