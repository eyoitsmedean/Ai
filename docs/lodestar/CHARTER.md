# Intent Charter — Red Letter

**Version** — v1 · 2026-09-14 · LODESTAR Cycle 1  
**Status** — first Charter (no prior LODESTAR cycle). Built from prompt 4 of this conversation (ATELIER / PROJECT BRIEF) plus later amendments that do not reverse it. Dean’s words in the record are untagged.

## Purpose

A chat-first advisor that applies **Jesus’s own words** from Matthew, Mark, Luke, and John to a modern life question, with a warm letter the writer can check against a printed Gospel.

## Goals

**C1 — His words only.** Every answer cites a Gospel passage containing Jesus’s direct speech, quoted from a public-domain or licensed text opened in the build — never from memory.  
Source (prompt 4, definition of done §1): “Every answer cites a Gospel passage containing Jesus’s direct words, quoted from a public-domain or licensed translation opened during the build — never from memory.” Origin: **stated**. Constraint: “Scope is Jesus’s words only, not the whole Bible.”

**C2 — Warm advisor, first useful answer.** Tone reads as a warm advisor; scholarship sits behind the answer. The reader is often on a phone at a low moment and should have a useful letter in seconds.  
Source (prompt 4 §2): “Tone reads as a warm advisor; scholarship sits behind the answer, not in front of it.” Origin: **stated**. Product around it (Today, Sit, Seek, Journal, Seven, Forty) is a reading room, not the point (`docs/CANONICAL_BRIEF.md`).

**C3 — Human doors before any verse.** Crisis-adjacent inputs get a caring handoff to human help inside the product. Present danger from another person is a second door (settled 2026-09-11).  
Source (prompt 4 §3): “crisis-adjacent inputs get a caring handoff to human help inside the product.” Abuse door: evolved, 2026-09-11 recovery. Origin: **stated** (crisis) / **evolved** (IPV).

**C4 — Eval that tells the truth.** Pass an evaluation set of at least 40 real questions including hostile, off-scope, and crisis-adjacent ones, with reviewed results. Nothing called passed that was not run.  
Source (prompt 4 §3 and §5). Origin: **stated**. Set is now 50 (recovery); this cycle may extend it.

**C5 — Mobile-first; native is Dean’s.** Builds without error for iOS and Android targets; on-device testing is Dean’s step and ships as a written five-minute checklist. No App Store / Play submission, no production deploy, no spending without sign-off.  
Source (prompt 4 §4 + authority line). Origin: **stated**.

**C6 — Not a person.** The page is not a pastor, clinician, or companion that pretends to suffer with you.  
Source: onboarding copy and crisis notice already in the product (“I am not a person”); prompt 4’s “warm advisor” is diction, not identity. Origin: **inferred** from shipped copy + later legal/pastoral research; proposed as a named goal because C2 without C6 becomes impersonation. Dean may reject the name; the behavior is already in the folio.

## Audience and beneficiaries

Someone with a real question, often at a low moment, on a phone. Secondary: Dean, who must be able to check every citation against a printed Gospel and decide launch.

## Definition of done (as originally imagined)

The five items in prompt 4: corpus-cited letters; warm advisor; eval ≥40 with crisis handoff; iOS/Android build path with Dean’s checklist; RELEASE marks verified vs unverified only.

## Constraints and non-negotiables

- Jesus’s words only. KJV 1769 in use (US public domain). WEB is researched, not swapped.
- Mobile-first. Capacitor around the existing HTML (settled).
- Edit code and branches freely. **No store submit, no production deploy, no spend** without Dean’s yes.
- Never destroy the only copy. Archive, do not delete.
- Do not merge other agents’ PRs onto this line without re-implementation under test.

## Taste profile

**Likes (evidence):** folio not feed; parchment-and-crimson; “Build Baby Build” / FORGE / finish usable work; advisor-first not scholarship-first; grace over streak shame; His words checkable on a printed page; honest “unverified.”  
**Dislikes (evidence):** outlines-as-deliverables; claiming work that did not happen; locking the curated Advisor after five live letters; “love your enemies” as the first word to someone being hurt; product inverted into a scholarship tool.

## Open questions the original conversation left unresolved

- Production API host.
- WEB as a second labeled text.
- UK / Cambridge for any paid tier.
- Model-path tone (`ANTHROPIC_API_KEY`).
- On-device iOS/Android (Dean).
- Whether C6 should be a numbered goal or remain a constraint under C2. **Proposal: keep C6.**

## Provenance

**Read this session:** `docs/CANONICAL_BRIEF.md`, `CLAUDE.md`, `RELEASE.md`, `docs/RESEARCH.md`, `docs/SHIP_PACKET.md`, `lib/counsel.js`, `lib/scripture.js`, `lib/curated.js`, `data/advisor.js`, `eval/questions.json`, `scripts/eval.js`, `public/index.html` (Advisor, Today, blessing, crisis/abuse, settings), `LAUNCH.md`, `README.md`, `test/counsel.test.js`.  
**Not re-opened:** raw cloud transcript file (may be gone on this VM). Prompt wording is taken from `docs/CANONICAL_BRIEF.md`, which states it was extracted from the transcript of run `bc-01a06f36-3b7f-7788-922c-aa7107c5fbba`.  
**Confidence:** high on C1–C5 (quoted). Medium on naming C6 as a separate goal (inferred, reversible).

Bearing: C1–C6.
