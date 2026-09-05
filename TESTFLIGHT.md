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

## App Store Connect fields the reviewer will check

| Field | What to enter | Why |
| --- | --- | --- |
| Privacy Policy URL | A public URL serving the text of [`PRIVACY.md`](PRIVACY.md) | Guideline 5.1.1(i): every app needs a privacy policy link in metadata **and** in-app. The About leaf already carries the in-app statement. |
| App Privacy questionnaire | "Data Not Collected" | Nothing leaves the device; no SDKs. |
| Review notes | "All Scripture is the King James Version (1769), quoted verbatim from a locked corpus; the app cannot display text that is not in that corpus." | Guideline 1.1.5 rejects "inaccurate or misleading quotations of religious texts." The corpus lock is the compliance mechanism. |
| Screenshots | Today, Sit, Seven Days, Seek, and the widget | Guideline 4.2 judges "app-like" functionality; show the rooms, not only the card. |
| Availability | **Decide UK.** Rights in the KJV in the United Kingdom are vested in the Crown and administered by Cambridge University Press; its imprint notice waives permission only for liturgical or non-commercial educational use up to 500 verses. Either request permission from CUP's Permissions Department before enabling the UK, or exclude the UK at first release. | Rights, not review. |

Google Play: complete the Data safety form as "No data collected" and paste the same privacy URL.

## First-run QA on a phone

- First open: title leaf, then **Turn the page**
- Airplane mode: Today still shows a Gospel sentence
- Long-press home screen → Widget → **Word** (not a badge, not a streak)
- Tap the widget → app opens Today (`redwords://today`)
- The card is the sentence + citation only
- **Unopened-day test:** set the phone's date forward one day (Settings → General → Date & Time, automatic off), return to the home screen. The card should show a different sentence without opening the app. Set the date back.
- **Warm-start test:** open the app, go to Seek, press home, tap the widget. You should land on Today, not Seek.
- Small widget: shows the citation, and the opening clause only when it ends on punctuation. Medium and large show the whole sentence.

## Android artifacts produced on Linux (not store-signed)

Built on this agent, debug-keystore signed (Play will not accept this as an upload key):

| File | SHA-256 |
| --- | --- |
| `build/app/outputs/flutter-apk/app-release.apk` (44.8MB) | `f836085ca143fc4e053a553afa9974a2209dacd89892ff5b9ae2af17dadd36b5` |
| `build/app/outputs/bundle/release/app-release.aab` (44.9MB) | `08f5dc8cbd55b0a569469018a4f73eec153b081fa6b215e3bde849dcec033f00` |

Verified in the APK: label **Red Words**, package `com.redwords.red_words`, version `0.1.0` / `1`, `redwords://today`, `RedWordsWidget` receiver, `provides-component: app-widget`. No Play upload key exists in this repo.
