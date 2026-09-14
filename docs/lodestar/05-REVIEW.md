# Phase 5 — Prove

**KIND:** Skeptic subagent (built nothing) + Navigator repair + **SELF-REVIEW** of the repair.  
**Date:** 2026-09-14 · **Bearing:** all C

## Method actually used

- Skeptic (`Task` generalPurpose) read Charter, alignment, dossiers, `lib/ask.js`, `public/ask.html`, gate/letter, tests. Re-ran 77 tests (then 78 after repair). Re-opened 988, Yale, Wikipedia, eBible MAT11, Idaho PDFs, thehotline.org. rainn.org still 403. Cambridge still Cloudflare-blocked.
- Navigator repaired Critical/Major items listed below, then retested.
- Browser QA: `npm run qa -- http://127.0.0.1:3848` — 17 walks pass (2026-09-14), including `/ask` stop, no Google Fonts, `/gate`, `/letter` + Luke 2:14 refusal.

## Disproof of load-bearing claims (up to ten)

| Claim | Attack | Result |
| --- | --- | --- |
| `/ask` always stops on danger | Mixed IPV + ideation used to drop NDVH | **Broke**, then repaired (`abuseCrisis`) |
| Spanish modalities are complete | `quiero morir` used English first-person on the API | **Broke**, then repaired (`composeAsk` override; `classify()` untouched) |
| Offline other/loss/ask are first-person | L26 | **Disconfirmed** against current `localStop` (kinds exist). Dossier L26 retired |
| Folio also stops | `compose('I want to kill myself')` | **Holds as known drift** — verses after 988, eval 82 |
| `/gate` records C7 | localStorage only | **Holds as overclaim** — copy rewritten to “scratch pad” |
| `/letter` is paper with a colophon | no colophon | **Broke**, then a one-line colophon added |
| PHONE-REVIEW 390×844 this cycle | no dated qa log at review time | **Too generous** — sentence struck |
| Google Fonts vs NDVH digital security | first paint phoned Google | **Broke**, then font links removed |
| Charter “13 human prompts” | loose role count 16 | **UNRESOLVED** — not re-counted by Navigator |
| SHIP/CLAIMS exist | files missing at review time | **Broke as integrity**, written this phase |

## Defect register

| Sev | Location | Evidence | Fix | Retest |
| --- | --- | --- | --- | --- |
| Major | priorStop after crisis dropped NDVH on a mixed second line | computerUse walk | mixed check before `priorStop`; thread upgrade | eval `ask-abuse-after-crisis` + browser retest pass |
| Major | short Spanish | `quiero morir` → English crisis | `SPANISH_CRISIS_RE` override in `composeAsk` | eval `ask-spanish-short` pass |
| Major | L26 dossier stale | kinds already exist | Relabeled RETIRED | read |
| Major | Google Fonts on `/ask` | link tags | Removed; system stacks | test asserts no googleapis |
| Major | `/ask` footer → folio with no C4 warning | Skeptic usability | Warning: atelier still quotes after 988 | copy present |
| Minor | `/gate` overclaim | localStorage toy | Scratch-pad copy; silent download named | GET /gate test |
| Minor | `/letter` no colophon | mastery brief | Colophon line | qa walk |
| Minor | PHONE-REVIEW last line | overclaim | Struck | read |
| Minor | Missing SHIP/CLAIMS | index lied | Written | files exist |
| Cosmetic | Fraunces named on gate/letter | not loaded | left (system fallback) | — |

Folio verses-after-988: **held** (DESIGN CHOICE / known drift). Not a repair this cycle.

## Integrity

No YouTube cited. No store submit. No Pages enable. Grok F1–F3 untouched. Folio eval not rewritten. Live model and Dean’s phone **not** claimed.

## Remaining Minor (ship with)

- `classify()` still crisis-before-abuse (folio contract). `/ask` overrides; folio does not.
- `/gate` still does not write CANON.
- `/letter` still needs Node for `/api/letter`.
- RESEARCH.md still has the dead Yale URL / 2039 sentence (not patched this cycle — Next Summit / doc chore).
- `/api/ask` is not behind `API_ACCESS_KEY` (DESIGN CHOICE for household review; README must say so).
