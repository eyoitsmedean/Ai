# Defect Register — Cycle 1 SELF-REVIEW

Pass labeled **SELF-REVIEW** (same Navigator, fresh eyes after the builds). One review, one repair, one retest.

| Sev | Location | Evidence | Fix | Retest |
| --- | --- | --- | --- | --- |
| Critical | `finishLetter` dropped Matthew 11:28 from empty send | `retrievalLetter('')` kept only John 14:27 — Peace room allowed-list | Empty `roomFor` allows the two calm verses | `npm test` high-stakes; sit empty = Matt 11:28 |
| Major | Atlas QA used case-sensitive “Matthew 5:23” | `.cite` is `text-transform:uppercase`; Chrome `innerText` is MATTHEW | Assert `/5:23/` | `npm run qa` 21/21 |
| Minor | Atlas verses hand-copied | Changing `lib/curated.js` first verse would not update the page | Next cycle: generate | Carried |
| Minor | findahelpline count removed | “175+” was prior-cycle, not re-fetched | Copy now says “Local helplines” | File read |
| Cosmetic | Help card has no Fraunces (system Georgia) | On purpose: no webfont dependency if Google fonts fail | Keep | — |

No remaining Critical or Major.
