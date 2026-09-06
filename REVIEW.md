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

## The corpus was not whole — now it is

The seal is only as good as the text behind it. An audit of every one of the 3,779 Gospel verses against two independent public-domain KJV sources (bible-api.com’s KJV and the aruljohn/Bible-kjv text; they agree with each other on every count and every disputed line) found that `data/gospels-kjv.json` had dropped one verse in each of six chapters — Matthew 2:16, 22:1, 26:38; Mark 4:40, 7:11, 8:8 — and every verse after each of them was shifted up by one. The red-letter map uses true numbering, so 45 sayings were being served with a neighbouring verse’s words. The worst: *Matthew 26:39* carried the narrator’s “And he cometh unto the disciples, and findeth them asleep…” as His speech, and the Advisor would have substituted it into a letter as verified scripture. Mark 8:38 was missing from the spoken library altogether. The public file this corpus was evidently built from has the same six gaps, which is why an earlier check against it found nothing.

`scripts/repair-corpus.js` inserts the six verses (text agreed by both sources) and is safe to rerun; `spoken-gospels.json` and `library.json` are rebuilt. A test now pins all 89 chapters to their canonical verse counts, so this cannot silently recur. Two marginal notes (“many ancient copies add…”, “this verse is not found in most of the Greek copies”) were also leaking into displayed text at Luke 10:22 and 17:36; they are filtered now.

The stricter seal then caught four hand-typed quotations that were not the KJV: “always” for *alway* (Matthew 28:20, in three files), and three spans that skipped words inside a cited range (Matthew 5:14–16 without v.15, Luke 7:47–48, John 11:25 cut to seven words). All are corrected to the corpus text, and every quotation in every client data file (155 of them) is sealed by `npm test`.

## Forty, in the order of the church year

The rooms used to be the 28 daily words followed by 12 extras, which put a post-resurrection commission on Maundy Thursday and the cross on Holy Tuesday, and used John 16:33 twice. The order is now explicit in `public/data/paths.js` and stated there: Ash Wednesday opens on Matthew 6:6, the Gospel of the day; the Monday after the Sunday of the Temptation is the wilderness (Matthew 4:4, new); the last Lenten Friday is Gethsemane; Holy Week runs the ransom, the shepherd who gives his life, love your enemies, the new commandment on Maundy Thursday, paradise on Good Friday, and *I am the resurrection, and the life* on Holy Saturday. Forty rooms, forty distinct sayings, all sealed.

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

- `npm test` — 48 route and content tests: canonical verse counts for all 89 chapters, the six restored verses, the note filter, forty distinct rooms in church-year order, every quotation in every data file sealed at ≥0.92, the Press seal, the 988 modalities, the Cambridge line, and the `/review` deep links.
- `node scripts/qa-browser.js` — 13 browser walks: Forty’s church-year math (Ash Wednesday 2026/2027, Sundays, Day 40, Palm Sunday, Holy Week, Triduum), the proofs at 1080×1350 / 1920 / 1440, a synchronous share from the tap, the examen catchword, parable journaling, the hourly hint, the breath under reduced motion, and the keyboard tablist.
