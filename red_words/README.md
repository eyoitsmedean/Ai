# Red Words

His words, for this moment. / His words. One honest step.

Offline Flutter app. Gospels only. World English Bible (public domain). No backend, no chatbot, no invented Scripture.

## Identifiers

| Surface | Value |
| --- | --- |
| iOS bundle | `com.redwords.redWords` |
| iOS widget | `com.redwords.redWords.RedWordsWidget` |
| App Group | `group.com.redwords.redWords` |
| URL | `redwords://today` |
| Android `applicationId` | `com.redwords.redwords` |
| Android namespace / Kotlin | `com.redwords.red_words` |
| Display name | Red Words |

Play Console application IDs are lowercase. iOS keeps the locked camelCase bundle. That mismatch is intentional and documented — do not “fix” Android to `com.redwords.red_words` (Flutter default) or silently invent a third id.

## Run

```bash
cd red_words
flutter pub get
flutter analyze
flutter test
```

First launch opens Matthew 6:34 (`anxiety-mt-6-34`).

## Android release signing (Dean)

Release is **not** debug-signed. Copy `android/key.properties.example` to `android/key.properties` and point it at the Play upload keystore:

```
storePassword=...
keyPassword=...
keyAlias=upload
storeFile=/absolute/path/to/dean-upload.jks
```

`android/key.properties` and `*.jks` / `*.keystore` are gitignored.

R8/ProGuard is on for release (`android/app/proguard-rules.pro`).

Without Dean’s keystore, release builds on this machine used a **local placeholder keystore** so Gradle could assemble. Those artifacts must not go to Play.

```bash
flutter build appbundle --release   # Play upload: build/app/outputs/bundle/release/app-release.aab
flutter build apk --release         # sideload QA: build/app/outputs/flutter-apk/app-release.apk
```

Play Console accepts only the AAB. With the real `key.properties` in place, the same two commands produce the uploadable bundle — no other change needed.

## iOS / TestFlight

This Linux agent cannot compile or archive iOS. The Xcode project is archive-ready on a Mac: widget extension target, App Group, iOS 15, URL scheme. See `TESTFLIGHT.md`.
