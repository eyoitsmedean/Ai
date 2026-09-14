# Red Words

His words, for this moment.  
His words. One honest step.

Offline Flutter 3.x app. Gospels only. World English Bible (public domain). No backend, no chatbot, no invented Scripture. Not a Bible app. Not streaks. Not OneDigital.

Spine: splash ≤1.5s → one-stage Saying → One Honest Step in the person’s own words → optional Amen → next open, “You said you’d ___”. Ask is on-device retrieve that lands the same `SayingView`.

Craft law, never reshuffle: Word → Citation → Crimson knot → Reflection → optional Ask chips → One honest step cue.

## Identifiers (locked)

| Surface | Value |
| --- | --- |
| iOS bundle | `com.redwords.redWords` |
| iOS widget | `com.redwords.redWords.RedWordsWidget` |
| App Group | `group.com.redwords.redWords` |
| URL | `redwords://today` |
| Android `applicationId` | `com.redwords.redwords` |
| Android namespace / Kotlin | `com.redwords.red_words` |
| Display name | Red Words |
| iOS floor | 15.0 |
| Android `minSdk` | 24 (mid-2019 3–4GB phones: Pixel 3a, Galaxy A50) |

Play Console application IDs are lowercase. iOS keeps the locked camelCase bundle. Do not “fix” Android to `com.redwords.red_words`.

## Run

```bash
cd red-words-app
flutter pub get
flutter analyze
flutter test
```

First launch opens Matthew 6:34 (`anxiety-mt-6-34`).

## Android release

```bash
flutter build appbundle --release
# artifact: build/app/outputs/bundle/release/app-release.aab
```

Sideload QA APK: `flutter build apk --release` → `build/app/outputs/flutter-apk/app-release.apk`.

Release is **not** debug-signed. Copy `android/key.properties.example` to `android/key.properties` and point it at Dean’s Play upload keystore. Without that file, a **local placeholder** keystore is used so Gradle can assemble. Those artifacts must not go to Play.

R8/ProGuard is on (`android/app/proguard-rules.pro`).

## iOS / TestFlight

This Linux agent cannot compile a signed IPA. The Xcode project is archive-ready on a Mac: widget extension target, App Group, iOS 15, URL scheme. Exact clicks: [`MAC-TESTFLIGHT.md`](MAC-TESTFLIGHT.md).

## QA

Recorded results: [`QA.md`](QA.md). Rebuild every FAIL in our control. Do not call the app production-ready if analyze, tests, or the Android bundle fail.
