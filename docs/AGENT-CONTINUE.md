# For the next agent

Read `docs/BRIEF.md` first, then `CLAUDE.md`. Those two are authority. This file is how to continue without reconstructing the chat.

## Where instructions live

| Kind | File |
| --- | --- |
| Recovered user intent + first ten prompts | `docs/BRIEF.md` |
| Settled product decisions | `CLAUDE.md` |
| Release evidence | `RELEASE.md` |
| Flagships | `docs/flagship-conscience.md`, `docs/flagship-sitting.md`, the product itself |
| Research | `docs/research/` — each memo labels FACT / INTERPRETATION / RECOMMENDATION |

Do not treat this chat, a summary, or a sub-agent prompt as Dean’s original words. The first ten prompts are quoted in `docs/BRIEF.md` from transcript `bc-01a04f4e`.

## Evidence vs interpretation vs approved direction

- **Evidence:** eval results, tests, official pages dated in `docs/research/sources.md`.
- **Interpretation:** room openings, which verse leads, “a notice is cheap.”
- **Approved direction:** every row in `CLAUDE.md` marked settled. Do not reverse those because a new commission is long.

## How to add findings

Append a row to `docs/research/sources.md`. Write or update a memo under `docs/research/`. If it changes a decision, say so in `CLAUDE.md` (keep the old row, flag the reasoning) and in the Conscience Book. Do not duplicate a topic memo.

## How to coordinate edits

`lib/curated.js` is the only encouragement source. After you change it: `npm run curated`.  
`public/data/signals.js` is the only ears.  
The live map is `data/red-letter-source.json`. The witness is `data/red-letter-ebible-kjv.json`. Do not overwrite the live map from the witness.

## How to record completed work

Commit on `cursor/<name>-c7c8`. Update `RELEASE.md` with what you actually ran. Put letters in `eval/results.md`. List remaining issues under CLAUDE.md open questions — do not invent new ones.

## Do not

Start a competing app. Merge to `main` or Pages without Dean. Submit stores. Spend. Message a stranger. Swap the map. Recreate `data/advisor.js`. Surface Forty in ordinary time.
