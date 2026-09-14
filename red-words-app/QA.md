# QA — Red Words (this revision)

Date: 2026-09-14. Host: Linux Cursor cloud VM. Flutter 3.47.4 (stable), Dart 3.13.3, Android SDK 36 / build-tools 36.0.0, Gradle 9.3.1, AGP 9.1.0, OpenJDK 21.

Do not treat this file as an iOS compile success. iOS was not archived here.

## Automated (this machine)

| Check | Result | Repro |
| --- | --- | --- |
| `flutter analyze` | **PASS** — No issues found | `cd red-words-app && flutter analyze` |
| `flutter test` | **PASS** — 89 passed, 0 failed (2026-09-14 craft pass) | `cd red-words-app && flutter test` |
| Splash ≤1.5s | **PASS** | `Brand.splashHold` is 900ms; `spine_test` pumps splash then Saying |
| Saying hierarchy | **PASS** | `hierarchy_test` — Word → citation → knot → reflection → chips → cue. No `Reflection:` label |
| Step commit (own words) | **PASS** | `spine_test` types “call my sister before noon”, taps I'll do this |
| Continuity | **PASS** | After Amen, “You said you'd call my sister before noon” |
| Ask retrieve | **PASS** | Anxiety query lands `SayingView` / Matthew 6:34 |
| Ask refuse | **PASS** | Jailbreak / sexual / invent-verse stay with no saying |
| Saved empty | **PASS** | “Nothing kept yet.” |
| Dark + XL | **PASS** | Same Y-order; no `EXTRA LARGE` stamp |
| 988 | **PASS** | `tel:988`; fallback copy when launcher returns false / `PlatformException` |
| Seed pack | **PASS** | 100 WEB Gospel sayings; first `anxiety-mt-6-34` / Matthew 6:34 |
| Android `flutter build appbundle --release` | **PASS** | 2026-09-14, 164.1s. Artifact below. |
| iOS compile / IPA | **FAIL / blocked** — no Mac, no Apple Team ID | See `MAC-TESTFLIGHT.md` |

## Android bundle (read back)

Path (rebuild locally; not committed):

```
red-words-app/build/app/outputs/bundle/release/app-release.aab
```

| Fact | Value |
| --- | --- |
| Size | 50.5 MB (Flutter reported; includes bundled Source Serif 4) |
| SHA-256 | `bbe43662482834ad48f12f5e1d28d38fbdaa5df7b8f09c1b77450a67e0255c0b` |
| `applicationId` | `com.redwords.redwords` |
| label | Red Words |
| minSdk | 24 |
| targetSdk | 36 |
| INTERNET | absent from release manifest |
| Launcher icon | mipmap + adaptive `ic_launcher` present in AAB |
| Splash | `@color/paper` `#F6F0E6` |
| Pack in AAB | 100 sayings; first `anxiety-mt-6-34` / Matthew 6:34 / WEB; books John, Luke, Mark, Matthew |
| Widget | `SayingWidgetProvider` + `saying_widget.xml` (Word / citation / thread) |
| Signer | placeholder `CN=Red Words Placeholder, O=Red Words, C=US` — **not** Play |

### How Dean installs the AAB

Play Console accepts only an AAB, and only if it is signed with **his** upload keystore.

```bash
cd red-words-app
cp android/key.properties.example android/key.properties
# point storeFile / passwords at the Play upload keystore
flutter build appbundle --release
# upload: build/app/outputs/bundle/release/app-release.aab
```

Sideload QA (not Play):

```bash
flutter build apk --release
# adb install build/app/outputs/flutter-apk/app-release.apk
```

The AAB produced on this VM must not go to Play. Re-sign with Dean’s key.

## Saying hierarchy (verified in code, not README)

`lib/ui/saying_view.dart` column order, asserted by `hierarchy_test.dart`:

1. Word (`saying-word`, serif, crimson)
2. Citation (`saying-citation`, small caps)
3. Crimson knot (`saying-knot`)
4. Reflection (`saying-reflection`) — no “Reflection:” label
5. Optional Ask chips (`saying-chips`)
6. One honest step cue (`saying-step-cue`)

Ask retrieve constructs the same `SayingView` (`lib/ui/ask_tab.dart`).

## Manual (founder phones) — not run here

| Case | Pass? | Notes |
| --- | --- | --- |
| First launch lands Matthew 6:34 |  | Do not accept another opener |
| Return visit shows “You said you'd ___” |  | After a written step |
| Ask no-retrieve stays |  | weather / recipes |
| Home widget follows the app |  | Word + citation + thread only |
| Airplane mode |  | Pack still opens |
| 988 on a real phone |  | `tel:988` |
| 988 on Wi-Fi tablet |  | Fallback text, nothing silent |
| iOS archive / TestFlight |  | Mac + Dean’s Team ID |

## Fail this ship if

- `flutter analyze` is not clean
- `flutter test` fails
- Android appbundle fails
- Scripture pack missing or not WEB
- Saying order reshuffled
- Streaks, chat, or Journeys appear
