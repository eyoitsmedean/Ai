# Ship readiness — Red Words `0.1.0+7`

This file is the leftover list. The book is portrait, iPhone-only, KJV, offline, and still not submitted. Nothing in this pass created an Apple or Google account, signed a release, uploaded a binary, deployed a site, or merged a pull request.

## Already true in this branch

- Bundle `com.redwords.redWords`. Widget `com.redwords.redWords.RedWordsWidget`, gallery label Word. App Group `group.com.redwords.redWords`. URL `redwords://today`. Display name Red Words. iOS floor 15.0. `TARGETED_DEVICE_FAMILY = 1`. Android applicationId `com.redwords.red_words`.
- `ITSAppUsesNonExemptEncryption` is false.
- First-archive order is already in `ios/Runner.xcodeproj/project.pbxproj`: Embed Foundation Extensions sits above Thin Binary. Confirm it once in Xcode; do not reorder it.
- 988 is on every leaf and opens the system dialer. The app does not place the call.
- Portrait only (iOS Info.plist and the Android activity).
- Android `compileSdk` and `targetSdk` are 36 (Play’s floor for new uploads since 31 Aug 2026).
- `PrivacyInfo.xcprivacy` is in the app and the widget extension: no tracking, no collected data types, UserDefaults reason `CA92.1` (on-device and App Group).
- Paste-ready listing strings are in `docs/store/listing.json`. Lengths are checked by `npm test` via `test/store-listing.test.js`.
- Draft frames at the accepted pixel sizes are under `docs/store/`. They are Flutter widget renders in EB Garamond, not photos of a device. The home-screen widget is not among them. The face ships in the binary (`assets/fonts/`, SIL Open Font License).

## Dean — do these, in this order

Do not skip a step because a draft exists.

### Apple

1. Use the Apple Developer team you already have, or enroll yourself. This repo does not contain a team id.
2. In Certificates, Identifiers & Profiles, confirm the App ID `com.redwords.redWords`, the widget App ID `com.redwords.redWords.RedWordsWidget`, and the App Group `group.com.redwords.redWords` on that team.
3. On the Mac, install **Xcode 26** (iOS 26 SDK). Linux cannot produce a signed IPA.
4. Open `ios/Runner.xcworkspace` (not the `.xcodeproj`). Select the team. Archive `0.1.0+7`.
5. On that first archive, look at Runner → Build Phases and confirm **Embed Foundation Extensions** is above **Thin Binary**.
6. Upload to **TestFlight Internal** only. Do not start an external beta or a public release from this list.
7. App Store Connect record: name Red Words, SKU `red-words`, primary language English (US), subtitle and the rest from `docs/store/listing.json`. Category Lifestyle. Age rating: a quiet Gospel reader, no accounts, no public user content, no chat.
8. Privacy nutrition: **Data Not Collected**.
9. Host `public/privacy.html` at a public HTTPS URL yourself, then paste that URL into the privacy field and into the review notes in `docs/STORE-LISTING.md`. `listing.json` leaves `privacyUrl` null on purpose. Pages, if you use it, deploys the web trunk only — this file does not deploy it.
10. Availability: **exclude the United Kingdom**, or attach written permission from Cambridge University Press (`permissions@cambridge.org`). Crown rights in the KJV. Do not enable the UK storefront without that letter.
11. Screenshots: upload the 1290×2796 drafts in `docs/store/ios-6.9/` if you accept widget-test renders for an internal build. Before a public listing, replace them with device captures, and add a real home-screen shot of the Word widget (sentence and citation only, no badge).
12. If you turn on an EU storefront, answer the DSA trader question yourself. This app has no account system; the trader status is still yours to declare.
13. Review notes: the paragraph in `docs/STORE-LISTING.md`, with your privacy URL filled in.

### Google Play

14. Use the Play Console account you already have, or create it yourself. This repo does not contain one.
15. Create the app `com.redwords.red_words` only when you are ready to upload. Do not use a weekly price. Do not put the words behind a purchase.
16. On your machine, make a Play **upload keystore**. It does not belong in git. `android/app/build.gradle.kts` still signs release with the debug key so a local `flutter run --release` works. Point release `signingConfig` at the upload keystore locally, or sign the AAB outside the repo. Play rejects a debug-signed upload.
17. Install Android SDK 36, then `flutter build appbundle`. Confirm `targetSdkVersion: 36` with `aapt dump badging`.
18. Upload to the **internal testing** track only. Data safety is not required on an exclusive internal track. Before any closed, open, or production track, complete Data safety as all No (nothing collected, nothing shared).
19. Store listing: title Red Words, short description `playShort` in `listing.json`, full description the same as Apple. Feature graphic draft: `docs/store/play-feature.png` (1024×500). Phone screenshots: `docs/store/play-phone/` (1080×1920). Same rule as Apple: the home-screen widget photo is still yours.
20. Same UK choice as Apple. Do not list the UK without the CUP letter.

### Still not this branch’s job

- Merging to `claude/jesus-teachings-chatbot-bSBhF`.
- A public App Store or Play release, TestFlight external, or a native rebuild on a CI Mac.
- Creating the developer accounts, the keystore, or the privacy host.
- Emailing Cambridge, or anyone else.

## What this VM could not do

No signed iOS archive (no Xcode, no Apple certificate). No Play upload (no keystore, and release is debug-signed on purpose). No home-screen widget photograph. No check that a physical iPhone or Pixel draws the drafts the same way. The draft PNGs are the widget-test surface at 1290×2796, 1080×1920, and 1024×500.
