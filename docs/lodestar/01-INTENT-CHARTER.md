# Intent Charter — The Red Letter Advisor
**Cycle:** 1 · **Version:** v1 · **Date:** 2026-09-14  
**Status:** Written from recovered Dean-authored prompts (this run + GitHub). Not rebuilt from a prior Charter — none existed.  
**Bearing:** C1–C10 (this document *is* the Charter)

## Purpose
Ship a **world-class, production-ready Red Letter Advisor** — beautiful and simple to use — that applies **only Jesus’s spoken words** to real life, with **trust and safety** treated as if family success depends on it.

## Goals

**C1 — Research → build → QA → rebuild.** *Stated* (prompt 1). “research, analyze, then build, then QA, then rebuild, until the product is world-class.”

**C2 — Complex in build, simple in use.** *Stated* (prompt 2). Notion-level elegance: the user sees a chapel, not a pipeline.

**C3 — Finish and ship.** *Stated* (prompts 3, 8, 9). “Build baby build.” No outlines-as-deliverables.

**C4 — Production-ready on iPhone and Android.** *Stated* (prompt 6) + *evolved* D6 (PWA, not Capacitor). Hard QA. Capacitor is OQ3, later.

**C5 — Advisor-first, red-letter only, model never types a verse.** *Evolved / SOURCE-REPORTED* (`CLAUDE.md` D3, D4, D8; `README.md`). The problem behind the first “wow” ask.

**C6 — Family-stakes safety and honesty.** *Stated* (prompt 5) + *evolved* D7, D12, D13. Fixed letters. No model on crisis/danger/assault. Offline pack. Helplines. No invented tests.

**C7 — Review-ready work that wows.** *Stated* (prompts 7, 11). Someone should pick it up and see a product, not a lab.

**C8 — Inspectable claims.** *Stated* (prompts 10, 11, 15). Never invent sources, quotes, or certainty. Label VERIFIED / SOURCE-REPORTED / MODEL-KNOWLEDGE / INFERENCE / HYPOTHESIS / DESIGN CHOICE / UNRESOLVED.

**C9 — Recoverable memory.** *Stated* (prompt 14). Canonical brief, research, flagships, so the next bot does not start from zero.

**C10 — Dean owns the irreversible.** *Inferred* from SHIP.md and every “do not deploy / do not spend” rule. Deploy, live-model eval, physical-device walk, rainn.org re-open, UK KJV if paid.

## Audience and beneficiaries
- **End user:** someone on a phone who wants Jesus’s words applied to a real situation — not a sermon mill, not a chatbot toy.
- **Dean:** owner, reviewer, only person who can deploy and walk a device.
- **Next agent:** must inherit intent without asking Dean to repeat himself.

## Definition of done (original)
A production PWA on iPhone and Android that a stranger can install, ask a real question, receive a sealed red-letter answer (or a fixed safety letter), and trust. Family-stakes quality. Review-ready.

## Constraints and non-negotiables
- Only spoken words of Jesus in Matthew–John.
- Model never types a verse; server substitutes KJV; offline uses WEB + pack.
- Safety letters are Dean’s voice — do not rewrite wording.
- Do not invent citations, test results, or device QA.
- Notion is out of product scope.
- Irreversible actions wait for Dean.
- Cache `?v=N` and `rla-vN-chapel` move together.

## Taste profile
**Likes (evidence):** chapel/parchment; Fraunces/Literata/Figtree; advisor-first; “wow” for review; finish; family-stakes honesty; inspectable claims.  
**Dislikes (evidence):** outlines-as-deliverables; persona/stay-advice (discarded); model inventing verses; claiming work that did not happen; Capacitor-first (deferred).

## Open questions (Dean)
OQ1 KJV → WEB for UK paid release.  
OQ2 Live-model eval with his key.  
OQ3 Capacitor later.  
OQ4 (this cycle) Whether “Leave quickly” should also wipe the private journal — **DESIGN CHOICE** held: chat + onboard + daily count only.

## Provenance
**Read:** this run’s transcript via extractors (15 Dean-authored user messages); `CLAUDE.md`; `README.md`; `docs/CANONICAL-BRIEF.md`; `docs/SHIP.md`; `docs/RESEARCH.md`; `docs/research/*`; `RELEASE.md`; `docs/DEVICE-CHECKLIST.md`; product source on `8385505`.  
**Could not find:** a prior LODESTAR Charter; Granola meetings (none referenced).  
**Confidence:** high on C1–C4, C6–C9 (quoted). Medium on C5/C10 as *inferred/evolved* product law — they are how the repo actually behaves, not a sentence Dean typed in prompt 1.

## Proposed amendments (none applied)
None. Cycle 1 writes v1. Good-drift items (WEB theme packs, lectio, recovery docs) stay as implementation of C5/C9, not new goals.
