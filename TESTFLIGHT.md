# Red Words — ship on a Mac

**Purpose.** Get a TestFlight build and a Play internal build onto a phone.  
**Owner.** Dean. **Status.** Ready to archive. **Updated.** 2026-09-11.  
**What changed.** Version is `0.1.0+4`. Uploads must be built with **Xcode 26** (iOS 26 SDK). The widget ships the locked seven-slot rotation inside the extension. Sit Rest is a quiet minute without countdown digits. Bless Send is the Word, not the brand. The binary is **iPhone-only** (no iPad screenshot set). Old debug-APK checksums were removed — they described a previous binary.

No credentials live in this repo. This Linux checkout cannot produce a signed IPA.

## Identifiers (do not change)

| Item | Value |
| --- | --- |
| Workspace | `ios/Runner.xcworkspace` — never the `.xcodeproj` |
| App bundle | `com.redwords.redWords` |
| Widget product | `RedWordsWidget` |
| Widget bundle | `com.redwords.redWords.RedWordsWidget` |
| App Group | `group.com.redwords.redWords` |
| URL scheme | `redwords` → `redwords://today` |
| Display name | Red Words |
| iOS floor | 15.0 (Runner and widget) |
| Device family | iPhone only (`TARGETED_DEVICE_FAMILY = 1`) |
| Version | `0.1.0+4` in `pubspec.yaml` — bump **+build** on every upload |
| Android applicationId | `com.redwords.red_words` |

## 1. Once, in Apple Developer

1. Identifiers → App IDs → register **com.redwords.redWords** (App) with App Groups.
2. Register **com.redwords.redWords.RedWordsWidget** (App Extension).
3. Register App Group **group.com.redwords.redWords**. Attach it to both App IDs.
4. Profiles: iOS App Store for the app, and a matching profile for the widget.
5. App Store Connect → New App → Red Words → bundle `com.redwords.redWords`.

Xcode can create the group from Signing & Capabilities if you are signed into the team. The container ID must begin with `group.`.

## 2. On the Mac

Apple has required, since 28 April 2026, that App Store Connect uploads be built with **Xcode 26 or later** against the **iOS 26 SDK**. The deployment target stays 15.0. Xcode 16 will fail at upload, not in review.

1. Install Flutter stable and Xcode 26.
2. `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer && sudo xcodebuild -license`
3. `cd` this repo. `flutter pub get`. `npm test`. `flutter test`.
4. Open **`ios/Runner.xcworkspace`**.
5. Signing & Capabilities → **Runner**: your Team; App Group `group.com.redwords.redWords`; URL Type `redwords`.
6. Signing & Capabilities → **RedWordsWidget**: same Team; same App Group.
7. Build Phases on Runner: **Embed Foundation Extensions** must sit above **Thin Binary** (`xcode_backend.sh embed_and_thin`). The opening Run Script is `build` and may stay first. Confirm this on the first Archive if the widget is missing from the IPA.
8. Product → Destination → Any iOS Device (arm64) → Archive.
9. Organizer → **Validate App**, then Distribute → App Store Connect → Upload.
10. TestFlight → Internal testers (up to 100 App Store Connect users). A build lives 90 days. First build of a new app sent to an *external* group goes to App Review; Internal Testing does not.

Kid's Day (2 Sep 2026) already passed. Internal Testing is still the right first track.

## 3. App Store Connect fields

| Field | Enter | Source |
| --- | --- | --- |
| Privacy Policy URL | A public URL serving [`PRIVACY.md`](PRIVACY.md) | Guideline 5.1.1(i) — required in metadata **and** in-app. About already carries the in-app statement. |
| App Privacy questionnaire | Data Not Collected | Nothing is transmitted off the device. Apple: data processed only on device is not "collected." |
| Review notes | "All Scripture is the King James Version (1769), quoted verbatim from a locked corpus; the app cannot display text that is not in that corpus." | Guideline 1.1.5 — "inaccurate or misleading quotations of religious texts." |
| Screenshots | Title, Today, Sit Rest, Seven Days, Seek, widget — see `docs/STORE-LISTING.md` | Guideline 4.2 — show rooms, not only a card. |
| Availability | **Decide UK** before first release | [CUP rights](https://www.cambridge.org/bibles/about/rights-and-permissions/): Crown + CUP. Non-commercial cap is 500 verses, not a complete book, and **not ≥25% of the host work**, plus a prescribed acknowledgement. 37 verses can still fail the 25% test; a store listing is commercial. Request `permissions@cambridge.org`, or exclude the United Kingdom. |

Age-rating questions in App Store Connect were refreshed in January 2026. Answer them before submit or the update stalls.

## 4. Google Play (internal)

Release signing in this repo is the **debug keystore**. Play will reject that as an upload key. No Play upload key is stored here.

1. In Play Console create the app. Enroll in Play App Signing (default for new apps). Generate a local **upload** keystore on the Mac; keep it out of git.
2. Point `android/app/build.gradle.kts` `signingConfig` at that upload keystore locally, or sign the AAB with `jarsigner` / `apksigner`. Do not commit the keystore.
3. `flutter build appbundle`. Upload the AAB to an internal testing track.
4. Data safety form: **not required** while the app is exclusive to the internal testing track ([Play Help](https://support.google.com/googleplay/android-developer/answer/10787469)). Complete it (all No / not collected) and paste the privacy URL **before** leaving exclusive internal for closed, open, or production.
5. Target API: Flutter stable here compiles `targetSdk = 36`. New apps and updates must target API 36 from 31 August 2026.

## 5. First-run QA on a phone

- First open: title leaf, then **Turn the page**.
- Airplane mode: Today still shows a Gospel sentence.
- Today shows **THE CARD** — sentence + citation only, no app name inside the frame.
- Long-press home screen → Widget → **Word** (not a badge, not a streak). The card is already today's Word, even if you never opened the app.
- Tap the widget → Today (`redwords://today`).
- **Unopened-day:** Settings → Date & Time → automatic off → +1 day. The card *should* change; WidgetKit and Android inexact alarms are budgeted, not second-exact. If it does not, open the app once or wait. Set the date back. This is not a ship gate.
- **Warm-start:** open the app, go to Seek, press home, tap the widget. You land on Today, not Seek.
- Small widget: citation plus an opening clause that ends on punctuation, or the whole sentence when it is short. Medium and large: the whole sentence.
- About: Crown/Cambridge rights line, privacy sentence, 988.
- Sit Rest: one catchword; no countdown digits; “When you are ready.” after a minute.
- Bless Send: share sheet is the sentence + citation + `· KJV`.
- Seven ribbon: a bead opens that day.

## If it fails

| Symptom | What to do |
| --- | --- |
| Upload rejected for SDK / Xcode | You are not on Xcode 26. Install it; do not raise the iOS 15.0 floor. |
| Widget missing from the gallery | Widget target not embedded, or signing/App Group missing on **RedWordsWidget**. |
| Widget blank | First install before this revision. Open the app once (title leaf now writes the rotation) or reinstall this build (bundled seven is inside the extension). |
| Widget tap opens title, not Today | SceneDelegate is the URL capture. Confirm `redwords` URL type on Runner. |
| Play rejects the AAB | You uploaded a debug-signed artifact. Make an upload keystore. |
| 4.2 or 1.1.5 bounce | Screenshots must show Sit / Seven / Seek. Review notes must state the corpus lock. |
