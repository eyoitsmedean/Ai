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

- No invented Jesus. Every crimson sentence is KJV speech — `npm test` seals every Press quote against the corpus, and a clipping shorter than the sense of the verse no longer counts as the verse.
- The chatbot is never called Him.
- A missed Forty day does not lock a door.
- 988 remains in the title page, the Advisor head, and settings — by call, text, or chat.
- Chrome still leaves the room when you Sit.

## What the hardening pass changed, and why

Each line traces to a source that was actually read, not remembered.

- **Holy Week is named.** From Palm Sunday the Forty kicker says *Holy Week*; from Thursday evening, *Triduum*. The Roman Missal closes Lent at the Mass of the Lord’s Supper (General Norms 28); the rooms keep the devotional count — Ash Wednesday to Holy Saturday, Sundays not numbered — and a line under the grid says so. USCCB’s 2027 calendar confirms Ash Wednesday 10 February and Easter 28 March.
- **The card leaves the phone on the first tap.** Web Share demands the tap still be live; Safari has dropped shares that waited on async work. The proofs are pressed while you type, so *Send* hands a finished PNG to the sheet with nothing awaited in between. Same for the general share sheet.
- **The wordmark stays tracked on older iPhones.** Canvas `letterSpacing` arrived in Safari 18.4; before that it was silently ignored. The card now spaces the letters by hand when the property is missing.
- **Grid 3:4 (1080×1440).** Several 2026 guides report Instagram now takes 3:4 natively so a post fills both feed and profile grid uncropped. Offered as the fourth format; the evidence is secondary, so it is optional and last.
- **The breath counts without motion.** With *Reduce Motion* on, the ring no longer swells but the count still turns — Inhale, Hold, Exhale — and the phase is announced to screen readers. Before, it stalled on the first word. The copy still makes no medical claim: trials find slow, attended breathing helps and the exact ratio matters little.
- **The Press is a real tablist.** Arrow keys, Home, End; one tab in the tab order; each leaf a labelled panel; the five you are not reading are hidden from assistive tech too.
- **The Crown’s patentee is named.** KJV is public domain in the U.S.; in the U.K. it sits under royal prerogative administered by Cambridge University Press, whose permission text asks for an acknowledgement (printed in settings) and *KJV* after quotations (already on every card). Distribution to U.K. readers of the full spoken library is a question for counsel before that launch, not for code.
- **On iPhone, the reminder toggle tells you what to do.** iOS exposes notifications only to a web app launched from the Home Screen; the toast now says so instead of shrugging.

## Open for you to decide

- U.K. posture for the full library (over 500 verses) — legal, not engineering.
- `data/scripture.js` still holds a dormant World English Bible fetch; the server never imports it. Delete, or keep for a licensed-translation future?
- Keep Grid 3:4 once a Meta primary page is found, or drop it.

## Checks

- `npm test` — 43 route and content tests, including the Press seal (reference *and* score), the clipping guard, the 988 modalities, the Cambridge line, and the `/review` deep links.
- `node scripts/qa-browser.js` — 13 browser walks: Forty’s church-year math (Ash Wednesday 2026/2027, Sundays, Day 40, Palm Sunday, Holy Week, Triduum), the proofs at 1080×1350 / 1920 / 1440, a synchronous share from the tap, the examen catchword, parable journaling, the hourly hint, the breath under reduced motion, and the keyboard tablist.
