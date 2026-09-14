# Mastery Brief — Print as reach
**Bearing:** C5 · C6 · C3

## Who is world-class
- Traditional lectio cards / pocket gospels — one saying, source line, nothing else. MODEL-KNOWLEDGE.
- CSS `@media print` as used by GOV.UK printable pages — hide nav, keep content. SOURCE-REPORTED.

## What world-class looks like
File → Print (or `window.print`) yields a card: kicker, saying, “KJV”, limits footer. No WATCH banner (the paper *is* the allowed object). No QR to a public URL we do not have.

## Difference
Reach without a domain.

## Process
`@media print` { hide `.watch`, `.rest`, buttons; show saying + source + meaning optional }.

## Traps
Printing a URL that 404s. Inventing `[PAGES_URL]`.

## Sources
CSS Print Profile / MDN `@media print` SOURCE-REPORTED · Dean “folio stays paper” VERIFIED.

## Rubric · self-grade
| Criterion | Grade | Evidence |
| --- | --- | --- |
| Paper card of the saying | Pass | `@media print` keeps words + cite + meaning + seal |
| No WATCH banner on paper | Pass | `.watch` hidden in print |
| No fake public URL | Pass | none printed |
| Reach without deploy | Pass | `window.print` button |
| Limits stay on screen, not the card | Pass | `#limits-block` hidden in print |
| Crisis does not print a saying | Pass | crisis clears words/seal |
| Works without Pages | Pass | local `/ask` |

**Iterate:** first CSS hid too little (title still shouted); second hides mast, form, actions, limits. Best-in-world: do not QR a 404.

**Deliverable:** print stylesheet + button · `public/one-screen.html` · Bearing: C5 C6 C3 · verification: CSS present; print dialog is human.
