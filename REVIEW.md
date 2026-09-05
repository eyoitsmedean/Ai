# Reviewer’s gathering — The Press

Open **`http://localhost:3000/review`** (or `/?review=1`).

This is the atelier the strategy docs asked for, built as a walkable folio — not a feature pile. Every leaf now has a payoff: it keeps, it shares, it prints, or it hands something to tomorrow morning.

## How to sit with it

Do not tour. Turn leaves.

| Leaf | What you should feel | What it does now |
| --- | --- | --- |
| **Reveal** | John 14:27 arrives word by word | Sit with it; the sitting is kept |
| **Breathe** | *Peace / be / still* on a living ring | Four in, four held, six out; stops when you leave the leaf |
| **Parable** | Five leaves of Luke 15, His ink only | Sit, share a card, or print the leaf; kept as **Parable** in the journal |
| **Examen** | Rejoice · Review · Release · Rest | Kept once per night; the **Rest** word becomes tomorrow’s catchword in the running head |
| **Bless** | A name, a line of your own, a saying | Three real PNG **proofs** (Parchment · Dawn · Night) pulled live as you type; tap one to save, or Send |
| **Forty** | The rooms toward Ash Wednesday | Church-year aware: before Lent it counts the days; in Lent the room of the day is set; Sundays rest |

Deep links: `/review?leaf=forty` · `breath` · `parable` · `examen` · `blessing` · `reveal`.
Season paper: `/review?season=lent` (also previews Forty *in* Lent) · `advent` · `christmas` · `easter`.

## Where the Press reaches the rest of the book

- **Today** carries a one-line hint that follows the hour — *Dawn in the Press · a breath prayer* / *Vespers in the Press · an evening examen* — and, once the examen is kept, points to the journal instead.
- **Journal** labels **Examen**, **Forty**, and **Parable** entries and keeps examen lines whole; the quire picks catchwords from them.
- **Advisor** letters now offer **Sit with this** under every sealed saying.
- **Command palette** (`⌘K`): *This hour in the Press*, *Bless someone by name*, *Word reveal*.
- Sitting a Forty room marks it received; marking one keeps it in the journal.

## What must stay true

- No invented Jesus. Every crimson sentence is KJV speech — `npm test` seals every Press quote against the corpus.
- The chatbot is never called Him.
- A missed Forty day does not lock a door.
- 988 remains in the title page, the Advisor head, and settings.
- Chrome still leaves the room when you Sit.

## Checks

- `npm test` — 41 route and content tests, including the Press seal and the `/review` deep links.
- `node scripts/qa-browser.js` — 12 browser walks: Forty’s church-year math (Ash Wednesday 2026/2027, Sundays, Day 40, Easter), the proofs at 1080×1350 and 1080×1920, the examen catchword, parable journaling, the hourly hint.
