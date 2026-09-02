# TestFlight checklist (Dean, on a Mac)

This Linux agent cannot compile a signed IPA. The iOS project is archive-ready with the locked identifiers. No credentials are stored here.

## Identifiers (do not change)

| Item | Value |
| --- | --- |
| Workspace | `ios/Runner.xcworkspace` |
| App bundle | `com.redwords.redWords` |
| Widget product | `RedWordsWidget` |
| Widget bundle | `com.redwords.redWords.RedWordsWidget` |
| App Group | `group.com.redwords.redWords` |
| URL scheme | `redwords` → `redwords://today` |
| Display name | Red Words |
| Deployment | iOS 15.0 (Runner + widget) |
| Version | `0.1.0+1` in `pubspec.yaml` — bump **+build** if you upload again |

## Once, in Apple Developer

1. Certificates, Identifiers & Profiles → Identifiers → App IDs
2. Register **com.redwords.redWords** (App) with App Groups + Associated Domains optional
3. Register **com.redwords.redWords.RedWordsWidget** (App Extension)
4. Register App Group **group.com.redwords.redWords**
5. Attach the group to both App IDs
6. Profiles: iOS App Store for the app, and a matching profile for the widget extension
7. App Store Connect → New App → Red Words → bundle `com.redwords.redWords`

## On the Mac

1. Install Flutter stable and Xcode 16+
2. `cd` this repo, `flutter pub get`
3. Open **`ios/Runner.xcworkspace`** (not the `.xcodeproj`)
4. Signing & Capabilities for **Runner**: your Team; confirm App Group `group.com.redwords.redWords`; URL Type `redwords`
5. Signing & Capabilities for **RedWordsWidget**: same Team; same App Group
6. Product → Destination → Any iOS Device (arm64)
7. Product → Archive
8. Organizer → Distribute App → App Store Connect → Upload
9. App Store Connect → TestFlight → wait for processing → add testers → **Submit for Review** is optional; Internal Testing is enough for Kid's Day

## First-run QA on a phone

- First open: title leaf, then **Turn the page**
- Airplane mode: Today still shows a Gospel sentence
- Long-press home screen → Widget → **Word** (not a badge, not a streak)
- Tap the widget → app opens Today (`redwords://today`)
- The card is the sentence + citation only

## Android artifacts produced on Linux (not store-signed)

Built on this agent, debug-keystore signed (Play will not accept this as an upload key):

| File | SHA-256 |
| --- | --- |
| `build/app/outputs/flutter-apk/app-release.apk` (44.8MB) | `f836085ca143fc4e053a553afa9974a2209dacd89892ff5b9ae2af17dadd36b5` |
| `build/app/outputs/bundle/release/app-release.aab` (44.9MB) | `08f5dc8cbd55b0a569469018a4f73eec153b081fa6b215e3bde849dcec033f00` |

Verified in the APK: label **Red Words**, package `com.redwords.red_words`, version `0.1.0` / `1`, `redwords://today`, `RedWordsWidget` receiver, `provides-component: app-widget`. No Play upload key exists in this repo.
