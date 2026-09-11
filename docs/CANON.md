# Red Letter — canonical brief (this Cursor conversation)

**Status:** WATCH. Not a launch. Not a store submit. Idaho household. External publish remains HOLD.
**Owner:** Dean. **Audience:** Dean on a phone; the next agent on this branch.
**Updated:** 2026-09-11. **Version:** 2.
**Authoritative locations:** this file · `CLAUDE.md` (product locks) · Notion [Red Letter · one screen · not a launch](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0) (later amendment).

This is the brief for **this** conversation (`cursor.com/agents/bc-9d879086-030e-42d8-9728-b1e611e98634`, repo `eyoitsmedean/Ai`, branch `cursor/press-atelier-review-8634`). It is not the Grok iOS “last-week chats” commission. That thread already has its own F1–F3 on This week. Do not overwrite those pages.

---

## Intended outcome

A faith product that does not fake theology: a **one-screen advisor** that answers with Jesus’s own words from the four Gospels, then a short plain-speech implication, then silence. The folio (Today / Seek / Sit / Press) is paper and an internal atelier. No public URL, no store, until Dean records the licensed text and types publish.

## Recovery table — first ten user prompts in this conversation

Source: this run’s transcript at `/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-30-13Z-dd71/bc-9d879086-030e-42d8-9728-b1e611e98634/transcript.json` (2,023 messages; 12 human user prompts). Read 2026-09-11 by a subagent. No per-message timestamps on human prompts. Wording below is from that file, not reconstructed.

| # | Original wording (this conversation) | Requirement / preference | Current implication | Later amendment |
| --- | --- | --- | --- | --- |
| 1 | `run muse` | Start Meta Muse in this workspace | Means, not the product | Superseded by “build the thing” |
| 2 | `I approve` | Authorize Muse login | One-time | Done |
| 3 | `you should have approval` | Do not stall on OAuth | Process | Done |
| 4 | `run muse here` | Run it on this repo | Process | Done; Muse is not the deliverable |
| 5 | `Build on these idea in extreme detail and produce a deliverable that wows for me to review` | Finished work Dean can sit with | The Press, Advisor, eval, one-screen | Review ≠ launch |
| 6 | `Build` / `Baby` / `Build` | Keep shipping | Sustained production | Still in force for *internal* finish |
| 7 | FORGE PROTOCOL — EXECUTE NOW (3,009 words) | Full pipeline; no outlines-as-deliverables; skeptical-client bar | Production rigor | Later: no publish |
| 8 | FORGE — Universal Project Execution Prompt (2,077 words) | Recover, research, finish usable work | Same | Same |
| 9 | ATELIER PROTOCOL — MASTER PROMPT (6,798 words) | Truth over polish; no irreversible external action; Gospel citations; iOS/Android; eval ≥40 | `CLAUDE.md`, 82-question eval, Capacitor | **Notion 11 Sep: folio stays paper, no store submit** |
| 10 | UNIVERSAL REBUILD PIPELINE (2,793 words; brief fields blank) | Rebuild a native artifact; README was the target | README v2 | Still valid as a doc rebuild |

**Human prompts after #10:** (11) `Massive sprint time get to it pick 5 priorities and push for 45 minutes to an hour` — shipped one composer everywhere. (12) this recovery commission.

**Not in this thread’s first ten:** Notion “This week” locks, the Grok iOS last-week dispatch, Origin Map. Those are **later-found law** for the household, not this transcript.

## Later amendments that win (11 Sep 2026, Notion, fetched this session)

From [Red Letter · one screen · not a launch](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0) (edited 2026-09-11T18:27Z) and [license lock](https://app.notion.com/p/3d8b7d53f96981958a71e8effc74a2d5) (edited 2026-09-11T17:32Z):

1. **WATCH.** Do not publish, do not launch, do not submit to any store.
2. **Folio stays paper.** The digital Press is an atelier, not the public product.
3. **One screen:** Ask → The words (short) → What that might mean today (four lines max) → What this bot cannot do.
4. **Crisis:** name a human hotline, **stop generating counsel**.
5. **Texts:** WEB and KJV-US are the locked pair for a free US advisor. NIV, ESV, NASB, NRSV, CSB, The Message: do not paste into a public advisor. Human gate: Dean records the chosen text before any public URL.
6. **Household:** Idaho. UK Crown copyright is irrelevant for a US-only advisor; it still matters if a public URL is reachable from the UK.
7. **This week:** external apply / upload / message / purchase / publish remain HOLD. Household window last recorded: Not confirmed.

## Scope

**In:** recover this thread; align the repo with the one-screen lock; keep the sealed KJV atelier; research translations and crisis stop; file reusable knowledge; a walkable `/ask` Dean can review internally.

**Out:** store submit; public URL; swapping the live corpus to WEB without Dean recording it; applying to jobs; unparking Studio/AEVUM; overwriting the Grok-thread F1–F3; speaking for Kelly; inventing sayings.

## What exists and what drifted

| Asset | Verdict | Location |
| --- | --- | --- |
| Sealed KJV Gospels + red-letter map | **Keep.** 3,779 verses, 1,923 spoken, 663 sayings. Tests pin counts. | `data/`, `lib/scripture.js` |
| Curated Advisor + 82-question eval + device bundle | **Keep** as the atelier brain. Crisis letters still add verses after 988 — that **drifts** from the 11 Sep stop rule. | `lib/advise.js`, `eval/` |
| The Press / Forty / lectio | **Keep** as paper/atelier. Do not treat as a launch surface. | `/review`, `REVIEW.md` |
| Capacitor / Android APK / `MOBILE.md` | **Retire as a launch path.** Allowed as a local shell. No store. | `android/`, `MOBILE.md` |
| `LAUNCH.md` pricing / 90-day farm | **Park.** Conflicts with WATCH. | `LAUNCH.md` |
| README as repo front door | **Keep**, now pointing at `/ask` as the intended product. | `README.md` |
| One-screen advisor | **Built this session.** | `public/ask.html`, `lib/ask.js`, `GET /ask`, `POST /api/ask` |
| Research register | **Built this session.** | `docs/RESEARCH.md` |

## Obstacles (real)

1. No `ANTHROPIC_API_KEY` here — live-model path unverified.
2. Dean has not recorded WEB vs KJV for a public URL — human gate still open.
3. Folio Advisor still writes verses after a crisis line — later amendment says stop.
4. GitHub Pages on the default branch would be a public URL if enabled — do not merge as a launch.
5. Granola MCP needs auth; meeting notes were not read.

## Acceptance (observable)

- A tired reader opens `/ask` and sees Ask / Words / Meaning / Cannot-do, plus WATCH.
- Crisis language yields 988 and **no Gospel counsel**.
- Every quote on `/ask` is from the sealed KJV corpus, or the one WEB line opened this session from eBible (Matthew 11:28), labeled.
- This brief names the first ten prompts from the transcript, not from memory.
- Notion Grok F1–F3 are untouched. A pointer page for *this* conversation exists under the Red Letter one-screen page.

## Assumptions

- `[assumption]` Dean’s 11 Sep Notion pages are later amendments to this repo’s atelier work, not a delete order. The folio is preserved; it is no longer the public shape.
- `[assumption]` “Folio stays paper” means do not ship the five-room app as the product, not “delete the HTML.”
- `[recommendation]` Record WEB as the public-facing text if/when a URL exists; keep KJV as the sealed atelier corpus until that gate.

## Flagship deliverables (this conversation)

| # | Deliverable | Who uses it | When | What it enables |
| --- | --- | --- | --- | --- |
| 1 | This brief | Dean; the next agent | Before any new work | Recovered intent, later amendments, what not to reverse |
| 2 | [`docs/RESEARCH.md`](RESEARCH.md) | Dean; the next agent | Before choosing a public text or changing crisis copy | Core + five adjacent questions, dated sources, decisions |
| 3 | `/ask` | Dean on a phone | Internal review | The one-screen product: Ask → words → meaning → cannot; crisis stops |

Start `/ask` with `npm start` and open `http://localhost:3000/ask`. Do not treat `/` as the product.

## For the next agent

- Authoritative instructions: this file, then `CLAUDE.md` locks, then Dean’s later Notion amendments.
- Evidence vs direction: `docs/RESEARCH.md` is evidence and recommendation. This file is approved direction for *this* thread. Folio crisis letters are known drift; do not rewrite them without rewriting `eval/`.
- Add findings to RESEARCH’s source register; do not invent citations.
- Coordinate edits: one owner per file; check git before rewriting CANON.
- Record completed work in `CLAUDE.md` session log and `docs/bot-notes.md`.
- Do not overwrite Notion F1–F3 under This week (Grok / Lamp / Academy / DEX).

## Notion

Grok-thread F1–F3 remain untouched. Pointer for *this* conversation: [Cursor recovery · this conversation · 11 Sep](https://app.notion.com/p/3d8b7d53f969815fae74d87dc035970b), child of [Red Letter · one screen · not a launch](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0).
