# Mastery Brief — First useful letter in one gesture

**Summit** · Structural / experience  
**Bearing** · C2  
**Why it won** · Onboarding already offered “To ask” and then landed on an empty Advisor. LAUNCH: if Day-1 lectio is low, the onboarding is too long — the inverse is also true: if the first useful letter takes four taps, the folio is a tour.

## Who is world-class
Lectio 365 home: today’s office, almost nothing else. iOS Notes / iMessage: the field *is* the app. ChatGPT’s empty-state composer (reach, not theology).

## What world-class looks like
Title page: acknowledge → To ask → write one sentence → send. The letter arrives without touring Today.

## The difference that makes the difference
The first useful answer is a letter, not a map of rooms.

## Process
`chooseNeed('ask')` reveals `#ob-ask`. `sendOnboardAsk` onboards, opens Advisor, `sendMsg`. Today also shows `#first-ask` until a letter exists (hidden at night).

## Checklist
- [x] Honesty is a need (opens Integrity in Seek)
- [x] Empty send still opens Advisor
- [x] Crisis/abuse modals still intercept `sendMsg`
- [x] `rla-asked-once` hides the Today strip
- [x] QA sends a letter from `#ob-ask` (ATELIER 2026-09-14)

## Practice loop
`?fresh=1` → Turn the page → To ask → type rent-worry → letter.

## Traps
Skipping the “not a person” checkbox. Sending from the title page without the crisis modal (must go through `sendMsg`).

## Sources
LAUNCH.md; existing title-page code. YouTube: none.

## Rubric
| Category | Grade | Note |
|---|---|---|
| One gesture from title | A | write + send |
| Safety still runs | A | same `sendMsg` |
| Today strip | B | hidden after first letter / at night |
| Does not skip ack | A | ask step is after ack |
| QA | B | Honesty + field asserted; full send path is unit/eval |

**Iterate:** empty “Send the letter” used to dump them on an empty Advisor — kept as an escape (`Open the advisor empty`).

What it is · Title-page ask + Today first-ask  
Where it lives · `#ob-ask`, `#first-ask`, `finishOnboard`  
Bearing · C2  
Verification · QA title-page; send path shares `sendMsg`
