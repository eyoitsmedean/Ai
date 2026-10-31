# Store screenshot pack

Generated from the **running Flutter UI** (`test/store_screenshots_test.dart`). Not mockups. Not a second product.

Open `store/index.html` locally to review every shot.

## What you get

8 scenes × 4 viewports = **32 PNGs** in `store/screenshots/`, plus `store/feature_graphic.png` (Play, 1024×500).

| File suffix | Scene (Gate E) |
| --- | --- |
| `01_today` | Today — Matthew 6:34, Word → citation → knot → reflection |
| `02_one_honest_step` | One honest step + “I'll do this” |
| `03_ask_retrieve` | Ask “I need peace” → a recorded saying |
| `04_ask_stay` | Ask a recipe → honest stay, no invented verse |
| `05_saved_empty` | Saved — “Nothing kept yet.” |
| `06_saved_one` | Saved with Matthew 6:34 |
| `07_settings` | Settings — Dark saying, 988, Privacy |
| `08_home_widget` | Home widget — Word, citation, thread. No badge. |

| Prefix | Slot | Pixel size | Why this size |
| --- | --- | --- | --- |
| `ios67_` | iPhone Dynamic Island, large | 1290×2796 | Accepted large iPhone set |
| `ios61_` | iPhone Dynamic Island, medium | 1179×2556 | **Required** iPhone set |
| `ipad_` | iPad 13" slot | 2048×2732 | **Required** because the Xcode target is iPhone and iPad |
| `play_` | Play phone, 9:16 | 1080×1920 | Recommended portrait size; long side is exactly 2× the short side |

Sizes checked against [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) and [Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151), both retrieved 2026-10-31. Every PNG is 24-bit RGB (no alpha). The previous 1080×2400 phone shots were too tall for Play’s “long side no more than twice the short side” rule and are removed.

Paste-ready listing copy: `LISTING.md`.

## Regenerate

```bash
cd red_words
flutter test test/store_screenshots_test.dart
```

Then reopen `store/index.html`.

## Honest limits

Apple and Play sometimes want photographs from a real device / simulator status bar. These shots are the real screens at the real sizes, with a thin chrome drawn in-test, using Liberation fonts so the words are readable (Flutter’s default test face is squares). Use them to file the listing tonight; replace with device captures if review asks.
