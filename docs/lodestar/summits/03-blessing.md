# Mastery Brief — Blessing from the letter

**Summit** · Reach  
**Bearing** · C2  
**Why it won** · LAUNCH already said the blessing is the YouVersion verse-image — one person, not a feed — but it lived on Today/Seek, not on the letter the writer just received.

## Who is world-class
YouVersion’s verse image (reach, not our taste). This product’s own LAUNCH.md: “Send a blessing. Not a screenshot of an app.” Hallow/YouVersion share sheets on device — we cannot run them here.

## What world-class looks like
After a letter seals, **Send this word** opens the existing blessing sheet with the first verified saying preselected. System share does the rest (already built).

## The difference that makes the difference
The verse they just sat with is the one they can send. No hunting Seek.

## Process
`extractFirstSaying` → `openBlessing(seed)` → existing `sendBlessing`.

## Checklist
- [ ] Button only if a saying is present
- [ ] Seed appears first in the list
- [ ] Offline: still opens with the seed
- [ ] Does not send the writer’s story

## Practice loop
Send one blessing to yourself on a phone (Dean’s checklist §4).

## Traps
Sharing the whole letter (contains the writer’s wound). Sharing an unverified typed quote.

## Sources
LAUNCH.md **VERIFIED** (repo). Device share sheet **UNVERIFIED** here.

## Rubric
| Category | Grade | Note |
|---|---|---|
| One tap from letter | A | |
| Does not leak the question | A | verse + optional note only |
| Uses existing sheet | A | no second UI |
| Native share | D | unverified on device |
| QA | A | button asserted |

**Iterate:** first saying only; later cycle could let them pick among the letter’s cites (already possible in the sheet list).

What it is · `Send this word` on each letter  
Where it lives · `public/index.html` `addSaveToChatBubble`  
Bearing · C2  
Verification · QA looks for the button
