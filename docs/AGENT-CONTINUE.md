# For the next agent

Read this after `docs/CANONICAL-BRIEF.md`. Do not invent an earlier conversation.

## Authoritative instructions

1. Dean’s original prompts and later amendments: `docs/CANONICAL-BRIEF.md` (recovery table).
2. Evidence and decisions: `docs/RESEARCH.md`.
3. Live product on **this** branch: `GET /ask`, `POST /api/ask`, folio at `/`.
4. Transcript of this run (first ten prompts):  
   `/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-31-32Z-71a6/bc-019ff86b-ea97-7267-957b-fb5487dbbca4/transcript.json`  
   If that path is gone, recover via Cursor cloud `batch-fetch-details` for `bc-019ff86b-ea97-7267-957b-fb5487dbbca4`. **Never reconstruct wording from memory.**

## What is evidence vs direction

| Kind | Where |
| --- | --- |
| Evidence | Source register in `docs/RESEARCH.md`; opened URLs with dates |
| Interpretation | Labeled in the research file |
| Approved direction | Later amendments table in the brief (WATCH, no store, KJV until Dean records) |

## How to add findings

Append a dated row to the source register. Do not copy MARKET_STRATEGY figures forward without re-opening a source.

## How to edit

This recovery branch owns `/ask`, `lib/ask.js`, and `docs/*`. Folio UX lives on `cursor/guest-hour-bca4`. Codex/eval live on other branches. Do not merge those trees “to be helpful.”

## Completed vs remaining

**Done on this branch:** brief, research, `/ask`, `/api/ask`, tests/smoke hooks. Notion home for *this* run uses `docs/CANONICAL-BRIEF.md` — ignore cards that point at `docs/CANON.md` or other bcIds.

**Not on this checkout:** `CLAUDE.md`, `RELEASE.md`, 149-q eval, Concordance, Codex.

**Blocked on Dean:** translation recorded for any public URL; store/deploy/spend; which tree to merge.

## Next executable step

If `/ask` already exists and tests pass: either (a) wait for Dean’s translation gate, or (b) on a **separate** branch, port `lib/safety-core.js` + held-out eval **without** rewriting the folio.
