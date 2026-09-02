# Production QA — Red Words

Deadline: Thursday 3 Sep 2026 8:00am America/Boise.

## Automated (this PR)

| Check | Result |
| --- | --- |
| `flutter analyze` | **PASS** — No issues found |
| `flutter test` | **PASS** — 36 passed, 0 failed |
| Scripture pack | **PASS** — 100 WEB Gospel sayings; first `anxiety-mt-6-34` / Matthew 6:34 |
| Android `assembleRelease` | **PASS** — `BUILD SUCCESSFUL`; APK label `Red Words`; id `com.redwords.redwords`. See `android/BUILD_PROOF.md`. Placeholder keystore, not Play. |
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
| Airplane mode |  | Pack still opens |
| 988 |  | `tel:988` on a real phone |

## Fail the PR if

- Scripture pack missing
- Invented verses or citations
- Saying hierarchy reshuffled
- Streaks, chat, or Journeys appear
- Android build fails
