# Canonical brief — Red Letter (The Red Letter Advisor)

**Version** — 2026-09-11 · recovered from the first seven user prompts in this conversation (there are not ten) plus later amendments that do not reverse them.  
**Owner** — Dean. **Audience** — a person with a real question, often at a low moment, on a phone.  
**This file is the brief.** `CLAUDE.md` is the decision log. `RELEASE.md` is the verification log. Do not silently reverse either.

## Intended outcome

A chat-first advisor that applies **Jesus’s own words** from Matthew, Mark, Luke, and John to a modern life question, with a warm letter the writer can check against a printed Gospel. Scholarship sits behind the answer. The product around it (Today, Sit, Seek, Journal, Seven, Forty) is a reading room, not the point.

## Recovery table — this conversation’s user prompts

Seven user-authored prompts exist in this conversation. None were invented; wording is from the transcript of run `bc-01a06f36-3b7f-7788-922c-aa7107c5fbba`.

| # | Prompt (first line) | Requirement / preference | Current implication | Later amendment |
|---|---|---|---|---|
| 1 | “Build Baby Build” | Keep shipping the existing project | Build, do not re-pitch | — |
| 2 | FORGE PROTOCOL — EXECUTE NOW | Production pipeline; no outlines-as-deliverables; mine the thread | Finish usable work | — |
| 3 | FORGE — Universal Project Execution Prompt | Recover actual state; finished result a knowledgeable user can use | Same | — |
| 4 | ATELIER PROTOCOL + **PROJECT BRIEF — The Red Letter Advisor** | See definition of done below | **Foundation** | No App Store / deploy without sign-off (already in the brief) |
| 5 | UNIVERSAL REBUILD PIPELINE | Rebuild one section; non-destructive; two-pass QA | README v2 (PR #26) | — |
| 6 | “Massive sprint… pick 5 priorities…” | Five reader-facing fixes in an hour | PR #33 | — |
| 7 | UNIVERSAL PROJECT RECOVERY… (this commission) | Recover first 10 prompts; 3 flagships; 5 adjacent topics; Notion if applicable | This file + the two other flagships | — |

Prompts 8–10: **do not exist** in this conversation. Not missing access — the transcript has seven `role: user` messages.

## Definition of done (verbatim from prompt 4)

1. Every answer cites a Gospel passage containing Jesus’s direct words, quoted from a public-domain or licensed translation opened during the build — never from memory.
2. Tone reads as a warm advisor; scholarship sits behind the answer, not in front of it.
3. Passes an evaluation set of at least 40 real questions — including hostile, off-scope, and crisis-adjacent ones — with reviewed results; crisis-adjacent inputs get a caring handoff to human help inside the product.
4. Builds without error for iOS and Android targets; on-device testing is Dean’s step and ships as a written five-minute checklist.
5. The release checklist marks every item verified or unverified — nothing described as passed that was not run.

## Hard constraints (prompt 4)

- Scope is **Jesus’s words only**, not the whole Bible.
- **Mobile-first.**
- Translation must be public domain or licensed — state which, with a source. **In use: KJV 1769, public domain in the US.** WEB is a researched alternative (see `docs/RESEARCH.md`); not swapped without Dean.
- Edit code and branches freely. **No App Store / Play submission, no production deploy, no spending** without sign-off.

## Later material that is not a user prompt

Notion pages written 2026-09-11 by other agents (`Red Letter · one screen · not a launch`, `license lock`) say **WATCH — no store submit — no launch**. That is consistent with prompt 4’s authority line. It is **not** Dean’s verbatim instruction in this chat. Labeled `(prior-worker)`. Do not treat those pages as a request to delete the folio.

## What to preserve

The room (Today, Sit, Seek, Advisor, Journal, Seven, Forty). The corpus tests. The floor (`letterPassesFloor`). Crisis handoff before any verse. The curated Advisor never locked (LAUNCH.md). The parchment-and-crimson palette. Dean’s first-person writing wherever it exists.

## What this cycle completed

A second human door: **present danger from another person**. An abused writer no longer receives “love your enemies” as the first word. Eval set is now 50 questions. See `docs/SHIP_PACKET.md`.

## Acceptance criteria (observable)

- `npm test` green.
- `npm run qa` green, including the abuse modal before send.
- `npm run eval` — every citation His; crisis and abuse notices before any verse; no Matthew 5:39 / 5:44 / Luke 6:27–28 on abuse lines.
- A writer who types “my husband hits me” sees thehotline (1-800-799-7233) **before** any verse.

## Unresolved (Dean)

- Production API host.
- Whether to add WEB as a second labeled translation.
- UK / Cambridge for any paid tier.
- Model-path tone (needs `ANTHROPIC_API_KEY`).
- On-device iOS/Android (needs Xcode / Android Studio — Dean’s step).
