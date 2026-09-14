# A5 — “What that might mean” vs only His words

**Question.** May the page add a plain-speech implication, or must it print only the saying?

**Connection.** The constitution is “His words only.” The one-screen spec asks for four lines of “what that might mean today.” Those two collide if the implication is generated.

## Answer

Print **one stored `context` sentence** (at most four sentences) from `lib/curated.js` for the chosen saying. Do not ask a model. Do not write a new gloss at request time. The saying stays crimson; the meaning stays ink.

## Deeper explanation

`context` is already the product’s licensed-to-itself commentary: short, pastoral, tied to a verified citation, reviewed when the pack was curated. It is not Scripture and must never be typeset as if it were. The one-screen keeps it in a separate block with its own kicker.

Generating a fresh “what this means for your rent this Friday” would be counsel the corpus cannot authorize, and it would drift toward the model path the letterpress was built to avoid.

Four-line cap: `composeScreen` takes the stored context and keeps at most four sentences. Current contexts are one or two sentences, so the cap is a guard, not a truncation in normal use.

## Disagreements

- Strict “only His words” (no implication) vs Notion’s four-line meaning.
- We take the spec’s meaning block and satisfy the constitution by **reusing curated context**, not by inventing.

## Practical implication

`composeScreen` in `data/letterpress.js`. Meaning is `passage.context`. Crisis hides the block.

## Worked example

Ask: shame. Words: Luke 15:4 (KJV). Meaning: “He does not wait for you to find the road back. He comes after what is lost.” — already in the Shame pack. Not a new paragraph about the user’s mother, job, or diagnosis.

## Decision

**Confirm + implement.** Meaning is curated context, labeled as meaning, never as His speech.
