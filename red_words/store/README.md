# Store screenshot pack

Generated from the **running Flutter UI** (`test/store_screenshots_test.dart`). Not mockups. Not a second product.

Open `store/index.html` locally to review every shot.

## What you get

8 scenes × 3 viewports = **24 PNGs** in `store/screenshots/`.

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

| Prefix | Viewport | Pixel size |
| --- | --- | --- |
| `ios67_` | iPhone 6.7" logical 430×932 @3 | 1290×2796 |
| `android_` | Play phone logical 360×800 @3 | 1080×2400 |
| `tablet_` | 7–8" portrait logical 800×1280 @2 | 1600×2560 |

Paste-ready listing copy: `LISTING.md`.

## Regenerate

```bash
cd red_words
flutter test test/store_screenshots_test.dart
```

Then reopen `store/index.html`.

## Honest limits

Apple and Play sometimes want photographs from a real device / simulator status bar. These shots are the real screens at the real sizes, with a thin chrome drawn in-test, using Liberation fonts so the words are readable (Flutter’s default test face is squares). Use them to file the listing tonight; replace with device captures if review asks.
