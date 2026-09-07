# Bot working notes — Red Letter verse map — v1 — 2026-09-07

Worker: Cursor Grok 4.6 · solo · TARGET: red-letter verse map and spoken-corpus build.

## Brief assumptions (reversible)

PROJECT Red Letter · PLATFORM GitHub repo · ARTIFACT_CLASS code + knowledge page · STAKES high · REBUILD_MODE non-destructive · RESEARCH_BUDGET 15.

## KEEP LIST (untouched)

- `data/red-letter-source.json` — production map
- `data/spoken-gospels.json` / `public/library.json` — live corpus
- `lib/scripture.js` product layer (`NOT_SPEECH`, `SPOKEN_OVERRIDES`, `NARRATOR_PREFIXES`, `SPOKEN_ADDITIONS`)
- Crisis / danger / room decisions from prior work

## Research actually run

1. Read `data/red-letter-source.json`, `scripts/build-spoken.js`, `lib/scripture.js`, `CLAUDE.md`, `RELEASE.md`, `scripts/build-kjv.js`.
2. Fetched https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-kjv.osis.xml (200, SHA-256 `eeeae647…e253`).
3. Fetched https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml (200, SHA-256 `5ffa2626…8d68`).
4. Fetched that repo’s README (license table: both Public Domain) and GitHub commits API (both files last changed 2015-05-07, commit `7768dac`).
5. Parsed OSIS `<q who="Jesus">` and WEB `<wj>` over Matthew–John; compared to the production map and to the built spoken corpus after the product layer.

Lookups used: 5 of 15. Stopped: two further sources were not needed once hashes, licenses, and the verse-level delta were in hand.

## Disconfirmation

Sought a second KJV-with-red-letter in the same mirror. Found WEB (different translation) only. No second KJV red-letter file was opened. `[single-source]` for the KJV *spans*; verse-level presence has a WEB witness.

eBible.org itself timed out (15s) this session; the GitHub mirror of the same files was used.

## Change list

- Added: named map, build script, tests, this page, `docs/red-letter-map.md`.
- Updated: `build-spoken.js` refuses to overwrite the live corpus from a non-production map; records point at the witness.
- Retired: the claim that the map’s source is unknown. The *production* file is still unnamed; the witness is named.
- Not done: swap of the live map.
