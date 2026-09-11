# Dean’s Mac day — one sitting

You are about to put Red Words on a phone. This is the only list you need. Details and failure table live in `TESTFLIGHT.md`. Listing copy lives in `STORE-LISTING.md`.

**Version to upload:** `0.1.0+4` (`pubspec.yaml`). Bump +build if you upload twice.

## Before you sit (10 minutes)

- [ ] Xcode **26** installed (required for App Store Connect since 28 April 2026). Deployment target stays 15.0.
- [ ] Flutter stable on the Mac. `flutter doctor` clean for iOS.
- [ ] Apple Developer team selected. You can create App IDs today if they do not exist.
- [ ] A public HTTPS page that is the text of `PRIVACY.md` (or `public/privacy.html` once Pages is serving it from `main`).
- [ ] **UK:** exclude the United Kingdom at first release, *or* email `permissions@cambridge.org` before enabling it. [CUP](https://www.cambridge.org/bibles/about/rights-and-permissions/): Crown rights; 500-verse cap; not a complete book; **not ≥25% of the work**. A store listing is commercial.

## Archive (25 minutes)

1. `git checkout cursor/red-words-native-c2d6 && git pull`
2. `flutter pub get && flutter test && npm test`
3. Open **`ios/Runner.xcworkspace`** — not the `.xcodeproj`.
4. Runner and **RedWordsWidget**: same Team; App Group `group.com.redwords.redWords`.
5. Runner URL Type: `redwords`.
6. Build Phases: **Embed Foundation Extensions** sits above **Thin Binary**.
7. Export compliance: `ITSAppUsesNonExemptEncryption` is already `false` in `Info.plist` (no custom crypto).
8. Destination: Any iOS Device (arm64) → Product → Archive.
9. Organizer → Validate. Then Distribute → App Store Connect.
10. TestFlight → Internal testers. A build lives 90 days. Do not send the first build to an external group unless you want App Review now.

## Listing (15 minutes)

Paste `docs/STORE-LISTING.md` into App Store Connect. Privacy questionnaire: Data Not Collected. Age rating: answer the 2026 questions. Screenshots: the six shots in that file, 6.9" class.

## Phone (20 minutes)

The taps, in order:

1. Title leaf. Exhale. Turn the page.
2. Airplane mode. The sentence stays.
3. Today: THE CARD is sentence + citation.
4. Sit: Read → Reflect → Rest (one word, no countdown) → Respond (one sentence). Amen. Leave and return: the sentence is still there.
5. Seven: sit Come. No streak.
6. Bless: Send. The share sheet is the Word, not the brand.
7. Add the **Word** widget *before* a reinstall if you want the first-open test; on this build the seven is inside the extension.
8. Date +1 day. The card should change; if the OS has not reloaded the widget yet, open the app once. This is not a ship gate.
9. App on Seek → home → tap widget → Today.

## Play (when you want Android testers)

1. Create an upload keystore. Keep it off git.
2. Point `android/app/build.gradle.kts` at that keystore locally.
3. `flutter build appbundle`. Internal testing track.
4. Exclusive internal: Data safety is not required yet. Complete it (all No) and paste the privacy URL before leaving internal.

## You are done when

A person who is not you can add the Word widget, read today’s sentence, sit, and send a blessing — and nothing on the card says Red Words.
