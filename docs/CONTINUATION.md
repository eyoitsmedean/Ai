# Continuation — for the next agent

Read this after `CLAUDE.md` and `docs/CANONICAL_BRIEF.md`. Do not start a new product.

## Where authority lives

| Kind | File |
|---|---|
| Settled decisions | `CLAUDE.md` |
| Recovered user intent + eight original prompts | `docs/CANONICAL_BRIEF.md` |
| Evidence, sources, adjacent topics | `docs/RESEARCH.md` |
| What Dean does in twenty minutes | `docs/OPERATOR_KIT.md` |
| Verified vs unverified | `RELEASE.md` |
| Scored offline letters | `eval/OFFLINE_REVIEW.md` |

User prompts 1–8 of this conversation were extracted 2026-09-11 from  
`/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-31-50Z-ffa8/bc-01a06f5c-a2b7-7009-a99d-678c2adc0ebd/transcript.json`.  
Eight user messages exist, not ten. Do not invent a ninth.

## What is evidence vs interpretation vs approved direction

- **Evidence:** a source opened on a date in `docs/RESEARCH.md`, a test that ran, an eval that wrote `eval/RESULTS.md`.
- **Interpretation:** labels in RESEARCH (NY/Utah classification; warmth of a letter).
- **Approved direction:** the numbered table in `CLAUDE.md`. Do not silently reverse it.

## How to add a finding

1. Put the claim in `docs/RESEARCH.md` with a source row.
2. If it changes product behavior, add a `CLAUDE.md` decision.
3. If it changes a letter, regenerate `eval/OFFLINE_REVIEW.md` with `node scripts/review-offline.js` and re-score.
4. Do not copy the same paragraph into three files.

## How to coordinate edits

One branch: `cursor/add-gpt-6-astra-model-0ebd`. PR #23. Check `git status` before you write. Crisis copies in `public/index.html`, `data/advisor.js`, and `public/data/advisor.js` must stay byte-identical with `lib/crisis.js`.

## What is still blocked on Dean

- Live `npm run eval` with a key → `eval/letters/`
- `npx cap add ios|android` and `DEVICE_CHECKLIST.md` on a phone
- CUP letter if a UK store listing is desired
- Two named quality-reference apps
- Harm-to-others crisis phrasing
- Whether this product is a Utah “mental health chatbot” once marketed

## Exact next executable step

```bash
npm test
npm run eval
# then, with a key, read eval/letters/cri-01.md and eval/letters/hos-05.md
```
