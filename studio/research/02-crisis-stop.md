# A2 — Crisis stop vs 988-then-letter

**Question.** After the page names 988, may it still set two sayings?

**Connection.** The ATELIER definition of done said crisis-adjacent inputs get 988 *before any Scripture*. The 11 Sep one-screen page says: name a human hotline, **stop generating counsel**.

## Answer

Stop. A crisis cue yields the notice only. No Gospel citation, no “what that might mean,” no model call. Accidental cuts (`shaving`, `cooking`, `on a knife…`) remain non-crisis.

## Deeper explanation

The older contract treated 988 as a preface: the reader still received a Shame or Hope letter. That is counsel. It also trains the eval to *require* Scripture after a suicide cue, which is the opposite of a pause.

988 is a human service (US Suicide & Crisis Lifeline). This page is not 988, not a pastor, and not emergency care. The existing letterpress notice already says so. We kept that notice rather than silently replacing it with the Notion candidate sentence; Dean can swap copy.

California AB 1988 (PAUSE Act, 2025–2026) would require companion-chatbot operators to detect “credible crisis expressions” (contextual, not keywords alone) and interrupt. As of 11 Sep 2026 it is **not law**: Assembly passed 73–0 on 21 May 2026; Senate committee hearings were canceled at the author’s request (last recorded 26 Jun 2026). Dean lives in Idaho. The bill is used here as *contrary pressure in the same direction* — even a jurisdiction that has only *debated* mandatory pauses expects interruption, not a pastoral PS. Our detector is still keyword-plus-carve-out, which the bill would call insufficient if it ever applied. That limitation is recorded, not papered over.

## Disagreements

- **Old eval/QA:** 988 must appear *before* the first `**Matthew…**`.
- **Later Notion law:** no further counsel after the line.
- **PAUSE drafts:** some versions describe a timed pause or a human-review pause after a second expression. We implement first-expression stop, which is stricter than “warn then continue.”

## Practical implication

`composeLetter` returns `crisis: true`, empty passages. `/api/chat` returns the notice and never starts the model. The one-screen hides Words and Meaning. Folio modal may still ask “continue”; continue still does not generate a letter.

## Worked example

- “I want to die. I’m so ashamed.” → 988 notice. Theme metadata may still be Shame (for logs). No Luke 15.
- “I cut myself shaving this morning and it stung.” → generic or commons letter, no 988 (O07).
- “I cut myself again last night.” → crisis stop (C05).

## Decision

**Changed the product.** The old “988 then letter” contract is retired.
