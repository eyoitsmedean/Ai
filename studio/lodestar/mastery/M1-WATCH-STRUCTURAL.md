# Mastery Brief — Folio as paper (WATCH)
**Bearing:** C5 · C9  
**YouTube:** none this session (no transcript access). Research Orders in Ship Package.

## Who is world-class
- **Bringhurst, *Elements of Typographic Style*** — the page as a finished object, not a funnel. SOURCE-REPORTED (book).
- **GOV.UK / NHS service manuals** — status banners that say what the service will *not* do. SOURCE-REPORTED.
- **Dean, 11 Sep Notion** — “WATCH. Do not publish.” Ground truth.

## What world-class looks like
A visitor who opens the folio without reading any studio doc still knows: this is not live, the working door is `/ask`, and search engines should not index it.

## Difference that makes the difference
Status is *in the chrome*, not in a markdown file three folders deep.

## Process
1. `noindex, nofollow` on every HTML that could be hosted.
2. One visible strip, one sentence, one link.
3. Hide the strip when Sit takes the whole viewport (`html.sitting`).
4. Never invent a Pages URL.

## Checklist
- [x] Folio `<meta name="robots">`
- [x] One-screen already had it
- [x] Strip links to `/ask`
- [x] Hidden during Sit

## Practice loop
Change the banner copy → `npm run qa:static` → phone: does the strip steal the first saying?

## Traps
Shipping energy in `LAUNCH.md` without a WATCH stamp. Fixed this cycle.

## Sources
Bringhurst (book, not re-opened) MODEL-KNOWLEDGE · NHS/GOV.UK manuals SOURCE-REPORTED · Dean Notion VERIFIED.

## Rubric (world-class) · self-grade after build
| Criterion | Grade | Evidence |
| --- | --- | --- |
| Status visible without opening studio docs | Pass | Folio watch-strip + one-screen `.watch` |
| Crawlers told not to index | Pass | `noindex, nofollow` on folio and `/ask` |
| Door to the working surface | Pass | strip links to `/ask` |
| Sit not stolen | Pass | `html.sitting .watch-strip { display: none }` |
| No invented Pages URL | Pass | none added |
| Launch docs cannot be mistaken for a ship plan | Pass | WATCH stamp 14 Sep |
| SW can drop stale chrome | Pass | cache `v16` |

**Iterate:** first pass was folio meta only; second added the visible strip and Sit hide. What the best would still change: a human confirmation that the strip is not too loud on a phone — queued as Next, not a Pages enable.

**Deliverable:** folio WATCH chrome · `public/index.html`, `public/sw.js` · Bearing: C5 C9 · verification: static test + later `qa`.
