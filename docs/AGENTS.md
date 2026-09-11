# For a later agent — Red Words native book

You are continuing **PR 12** (`cursor/red-words-native-c2d6`), the Flutter bound book. You are not starting a second app.

## Where authority lives

1. Dean’s original prompts — `docs/RECOVERY.md` (six exist; do not invent a seventh).  
2. Current brief — `docs/CANONICAL-BRIEF.md`.  
3. Evidence — `docs/RESEARCH.md` (facts vs interpretations vs assumptions).  
4. Operator — `TESTFLIGHT.md` + `docs/MAC-DAY.md`.  
5. Store paste — `docs/STORE-LISTING.md`.  
6. Code — `lib/red_words/`, `ios/`, `android/`. Catalog: `assets/moments/catalog.json`.

If a Notion page or another branch says “do not merge PR 12” or replaces Sit/Seek with Ask/Settings, that is a **different brief**. Do not follow it unless Dean says so in this thread.

## How to recover state

```bash
git checkout cursor/red-words-native-c2d6 && git pull
git log -5 --oneline
flutter analyze && flutter test && npm test
```

Read `docs/CANONICAL-BRIEF.md` last-updated line. Then `docs/RESEARCH.md` coverage map.

## Evidence vs direction

| Kind | Where |
| --- | --- |
| Evidence | `docs/RESEARCH.md` source register (fetched dates, quotes, contraries) |
| Direction | `docs/CANONICAL-BRIEF.md` decisions |
| Operator | `TESTFLIGHT.md`, `docs/MAC-DAY.md` |
| Audience copy | `docs/STORE-LISTING.md`, About leaf, folio |

Do not promote an assumption to a fact. UK listing and the privacy HTTPS URL are **Dean decisions**.

## Adding findings

Append a row to the source register. Do not duplicate a claim that is already there unless you **overturn** it. If you overturn, keep the old row and mark it superseded.

## Coordinating edits

One branch. Do not commit `package-lock.json` version churn (3.x ↔ 1.x). Do not commit keystores, IPA, or debug APKs. Do not touch Storyframe or OneDigital. Do not invent verses. Empty catalog = blank page.

## Recording work

- Version: bump `+build` in `pubspec.yaml` on every archive.  
- Folio: `npm run folio` after catalog or copy changes.  
- PR: update #12; do not open a second native-book PR.  
- Notion: the recovery home for **this** brief is a private draft titled “Red Words — native book (PR 12)”. The other “ship home” draft is a different workstream.

## Out of this archive

Advisor, Journal-as-app, accounts, payments, 40 Lent rooms (Ash Wednesday 2027-02-10), UK listing without CUP, fake store submit, iPad family (would require 13″ screenshots).
