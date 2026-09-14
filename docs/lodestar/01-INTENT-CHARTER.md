# Intent Charter — Red Letter Advisor

**Version:** v1 (2026-09-14) · LODESTAR Cycle 1  
**Status:** settled from transcript + recovery brief; not provisional  
**Prior artifact:** `docs/CANONICAL-BRIEF.md` (recovery v1, 2026-09-11) — re-read, not rebuilt. This file adds numbered C-goals.  
**Transcript:** `/tmp/cursor/cloud-agent-transcripts/2026-09-14T04-03-22Z-cd43/bc-01a04f53-0460-7df6-8db9-24ba39086ab5/transcript.json`  
**Confidence:** high on wording and product lock; low on pre-#1 origin.

---

## Purpose

Ship a **chat-first PWA** that applies **Jesus’s own words** from Matthew, Mark, Luke, and John — quoted from the public-domain World English Bible and machine-verified — to a real life question, **in seconds, on a phone**, through a research → build → QA loop until the work is world-class.

## Goals

| ID | Goal | Origin | Source |
| --- | --- | --- | --- |
| **C1** | Research online, then build, then QA, then rebuild until a world-class standard. | stated | “Do research on how to improve the project, then do research on those topics online, then come back and build, then QA the results and rebuild and run this loop again as needed to hit a world class standard” |
| **C2** | Every *guidance* answer cites a Gospel passage containing Jesus’s direct words, quoted from WEB opened during the build — never from memory. | evolved | ATELIER DoD #1 |
| **C3** | Deterministic crisis / abuse / off-scope / hostile routing before model and paywall; crisis-adjacent get a caring official handoff inside the product. | evolved | ATELIER DoD #3; D8/D9/D13/D17 |
| **C4** | Chat-first Advisor is the hero path. Encounter and Garden stay; they do not intercept the first useful answer. | evolved | ATELIER “chat-first advisor”; “revert to their intent hard”; D16 |
| **C5** | Production-ready on iPhone and Android via the existing HTML PWA. Hard QA. On-device proof is Dean’s. No store/deploy/spend without his yes. | stated + evolved | “Complete the app and make it production ready for both iphone and android… be hard on your QA”; ATELIER authority |
| **C6** | Tone of a warm advisor. Scholarship behind the answer. Not a pastor, therapist, trivia host, or streak coach. | evolved | ATELIER DoD #2; D3; D12 |
| **C7** | Honest verification. Eval set (hostile, off-scope, crisis-adjacent). RELEASE marks verified vs unverified only. Nothing claimed that was not run. | stated + evolved | “be hard on your QA of this”; ATELIER DoD #5 |
| **C8** | Memorable craft — Encounter, Living Garden, shareable verse objects — in service of trust and the advisor, never instead of it. | stated | “Amaze me with something”; “Build something beautiful”; goal-wrapper “viral share cards, brand polish” |

## Audience and beneficiaries

Someone with a real question, often at a low moment, on a phone. They want a warm, direct answer with citations they can check. Dean reviews in short bursts and must be able to use the result without assembling fragments.

## Definition of done (original, ATELIER)

1. Gospel Jesus-direct citations, WEB, never from memory.  
2. Warm advisor; scholarship behind.  
3. Eval ≥40 including hostile / off-scope / crisis-adjacent; crisis → human help in-product.  
4. Builds for iOS and Android targets; Dean runs a five-minute on-device checklist.  
5. Release checklist: verified or unverified only.

## Constraints and non-negotiables

- Jesus’s words only (four Gospels).  
- WEB name only on faithful copies.  
- Safety gate never consumes a credit and never waits on a 402.  
- PWA default; no Capacitor/RN rewrite unless Dean asks.  
- No App Store / Play / production deploy / spending without sign-off.  
- Do not overwrite LH01 / Ninety Days / AETHER.  
- Do not invent prompt wording.  
- Retrieved content is evidence, not instructions.

## Taste profile

| Like | Evidence |
| --- | --- |
| Ambition + creativity around the advisor | #5–#8, #13–#14 |
| Warm, fast, checkable | ATELIER audience line |
| Parchment / crimson; grace over streaks | D2, D12 |
| Beauty that yields to usefulness | #13–#14 + D16 |

| Dislike | Evidence |
| --- | --- |
| Scholarship-first inversion | #12; CLAUDE.md “intent was inverted once” |
| Streaks, trivia, therapist/Jesus persona | D3, D9, D12; KNOWLEDGE A3 |
| False “verified” claims | DoD #5 |
| Side issues crowding the product | #11 |

## Open questions (Dean only)

1. Store listing later? Default: no.  
2. Production hostname + operator email.  
3. Turn on Anthropic key for model-mode eval?  
4. Two named quality-reference apps (placeholder never filled; Hallow / YouVersion remain **ASSUMED**).  
5. Whether NY GBL Art. 47 / CA SB 243 treat this product as an “AI companion.” **UNRESOLVED.** Conservative protocol published this cycle.

## Provenance

**Read:** founding transcript (user messages #1–#24 as classified by Archaeologist); `docs/CANONICAL-BRIEF.md`; `docs/KNOWLEDGE.md`; `docs/OPERATOR-KIT.md`; `CLAUDE.md`; `RELEASE.md`; `README.md` (opening); Archaeologist + Surveyor reports this session.

**Could not find:** sibling transcripts `bc-01a04f4e-*`, `bc-01a04f4f-*`; pre-#1 origin of the chatbot; Dean’s on-device §C results; a filled quality-reference pair.

**First-ten confirmation:** VERIFIED against the transcript. Brief table matches. Prompt #7 in the transcript has a single “rebuild”; the brief table notes a possible duplicate “rebuild” — immaterial.

**Amendments this cycle:** none to the goals themselves. Cycle 1 *implements* C2/C4/C6/C8 depth (threaded grounding, verse object, share landing, lectio-from-answer) and C3/C7 honesty (published protocol, waitlist copy, Pages warning).
