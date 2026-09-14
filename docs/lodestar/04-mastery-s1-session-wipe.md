# Mastery Brief — S1 Session wipe / Begin again / fresh=1
**Bearing:** C6, C4, C7

## Who is world-class
The National Domestic Violence Hotline (thehotline.org): published security alert, call-if-monitored, clear-history instruction, immediate leave. NNEDV Safety Net (prior cycle): AI + shared-device residue. **Evidence:** pages opened, not popularity.

## What world-class looks like
One-tap reset that a stranger can find; demo rooms never show the last guest; journal not silently destroyed; query flag is consumed so refresh does not loop.

## Difference that makes the difference
Good: “Clear chat” buried in settings. World-class: a **guest URL**, a **named settings verb**, and a **crisis verb**, each with an explicit remainder (journal stays).

## Process
1. Name the keys that are a transcript (`rla-chat`, onboard flag, daily count).
2. Wipe those only.
3. Consume `?fresh=1` with `replaceState`.
4. Begin again reloads so in-memory `started` cannot lie.

## Rubric (built against)
1. Fresh URL opens onboarding — **pass** (contract + qa-fresh).
2. Chat gone, journal kept — **pass**.
3. Begin again present in Settings — **pass**.
4. Escape does not wipe — **pass** (crisis.js).
5. Query consumed — **pass**.
6. Letters.js wording untouched — **pass**.

## Practice loop
`npm test` · `npm run qa-fresh` between guests.

## Traps
Wiping journal “to be safe.” Rebuilding folio onboarding. Leaving `?fresh=1` on the URL.

## Sources
thehotline.org 2026-09-14 **VERIFIED** (numbers + escape mention). NNEDV **SOURCE-REPORTED** via pastoral-safety.md. No YouTube: no transcript access this cycle — Research Order in Ship Package.
