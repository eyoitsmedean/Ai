# Mastery Brief — S3 Shared-word landing

**The summit:** A stranger who opens a shared link can *read the saying* without executing our app JS, then ask about it.  
**Bearing:** C8, C4

## Who is world-class
YouVersion share pages; any newsroom that puts the quote in `og:description` so iMessage/Slack unfurl. **INFERENCE.**

## What world-class looks like
`/share?ref=Matthew+6:34` is HTML with the WEB text, OG tags, 988 honesty, CTA to `/?tab=advisor&ref=`.

## The difference that makes the difference
Crawlers do not run `index.html`. A canvas card the recipient never sees is not a share.

## Process
Server resolves corpus → escape HTML → OG + visible blockquote → Advisor welcome card if they come in-app.

## Checklist
- [x] OG title/description  
- [x] Visible verse without JS  
- [x] Library `?tab=library&ref=` still opens the card (regression)  
- [x] Advisor `?tab=advisor&ref=` does *not* jump to the card modal  

## Practice loop
smoke fetches `/share`.

## Traps
Opening Encounter. Claiming a per-verse PNG we did not generate (still static `og-image.png`).

## Sources
D-competitive-bar. No videos.

## Rubric
| Category | 1–5 |
| --- | --- |
| Crawler-readable | 5 |
| Chat-first arrival | 5 |
| Geographic/crisis honesty on the page | 4 |
| Unique image per verse | 2 |
| Beauty | 4 |

Iterate: page copy names WEB and 988; unique PNG left as Next Summit.
