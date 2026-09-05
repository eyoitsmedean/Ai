# Production QA — Red Words

Deadline: Thursday 3 Sep 2026 8:00am America/Boise.

## Automated (this PR)

| Check | Result |
| --- | --- |
| `flutter analyze` | **PASS** — No issues found |
| `flutter test` | **PASS** — 53 passed, 0 failed |
| Widget data path | **PASS (static)** — Dart `WidgetBridge` → `redwords/widget` channel; iOS handler writes App Group + `reloadAllTimelines`; Android handler writes `red_words_widget` prefs + `APPWIDGET_UPDATE`. Tests read the Swift/Kotlin sources and assert the same channel, keys, suite and file. Device render still manual below. |
| iOS 15 compile guard | **PASS (static)** — `containerBackground` only behind `#available(iOSApplicationExtension 17.0, *)`; test scans the Swift. |
| 988 fallback | **PASS** — launcher `false`/`PlatformException` shows "This device can’t place calls. From a phone, call or text 988." No verse. |
| Scripture pack | **PASS** — 100 WEB Gospel sayings; first `anxiety-mt-6-34` / Matthew 6:34 |
| Android `assembleRelease` | **PASS** ×2 (2026-09-02, 2026-09-05 fresh VM) — APK label `Red Words`; id `com.redwords.redwords`; R8 mapping emitted. See `android/BUILD_PROOF.md`. Placeholder keystore, not Play. |
| Android `bundleRelease` (AAB for Play) | **PASS** — `app-release.aab` 49.2 MB; 100 sayings / Mt 6:34 first / 4 Gospels read back out of the bundle. Placeholder signer. |
| iOS compile | **FAIL / blocked** — no Mac. WidgetKit sources **and** `RedWordsWidget` app-extension target are in `project.pbxproj`. See TESTFLIGHT.md. |

## Manual (founder phones)

| Case | Pass? | Notes |
| --- | --- | --- |
| First launch lands Matthew 6:34 |  | Do not accept another opener |
| Return visit keeps continuity |  | After I'll do this |
| Ask no-retrieve stays, invents nothing |  | e.g. weather / recipes |
| Ask refusal (jailbreak / sexual) |  | No verse |
| Empty Saved |  | “Nothing kept yet.” |
| Load fail |  | Quiet page + 988, no fake verse |
| Dark mode Saying |  | Charcoal `#1C1816`, order unchanged |
| Dynamic Type XL |  | Order unchanged; no “EXTRA LARGE” stamp |
| Home widget |  | Word + citation + thread only |
| Widget follows the app |  | Save / change saying → widget updates within seconds (iOS + Android) |
| Airplane mode |  | Pack still opens |
| 988 |  | `tel:988` on a real phone |
| 988 on Wi-Fi tablet |  | Fallback text appears, nothing silent |
| Store forms |  | Filled from `STORE_ANSWERS.md`; privacy URL live |

## Fail the PR if

- Scripture pack missing
- Invented verses or citations
- Saying hierarchy reshuffled
- Streaks, chat, or Journeys appear
- Android build fails
