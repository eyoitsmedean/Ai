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

## Not this

Do not publish. Do not store-submit. Folio-after-988 is still Dean’s. Translation lock still unrecorded.
