# Household quire · one leaf

**Date:** 2026-10-31  
**Branch:** `cursor/household-print-quire-28bf`  
**Why:** Dean asked for a finished product he can hold. WATCH. Paper, not a launch.

## What it is

After `/ask` sets a sitting, **Print this leaf** opens `/leaf`: one sheet with the asked sentence, the sealed crimson words, four lines of stored meaning, and Amen. Crisis sittings print 988 and no counsel.

The sitting stays in `sessionStorage` (`rla-leaf`) on this device. It is not sent anywhere.

## How to use it

```bash
npm start
# /ask  →  type what is true  →  Print this leaf  →  Print this sheet
```

Empty `/leaf` stays blank until a sitting is set.

## Measurable

- `GET /leaf` is `noindex`
- Shame sitting prints Luke 15 and Amen
- Crisis sitting prints 988 and no Amen
- Narrator / Paul citations are dropped
- One `@page` letter sheet; screen chrome hidden in print

## Checks (2026-10-31)

- `npm test` — 75 pass
- `npm run eval-ask` — 15/15
- `npm run smoke` — 12/12
- `npm run qa` — 9/9 including ask → leaf
- Browser: empty leaf stays blank; shame sitting shows Luke 15, implication, Amen, Print this sheet

## Not this

Do not publish. Do not store-submit. Folio-after-988 is still Dean’s. Translation lock still unrecorded.
