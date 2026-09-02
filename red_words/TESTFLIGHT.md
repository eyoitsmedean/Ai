# TestFlight checklist (Dean’s Mac only)

This file is a founder checklist. iOS was **not** compiled on Linux. Do not treat any Linux log as an iOS success.

## Before Archive

1. Open `red_words/ios/Runner.xcworkspace` in Xcode on macOS (not the `.xcodeproj` alone).
2. Signing & Capabilities for **Runner**
   - Bundle ID `com.redwords.redWords`
   - App Group `group.com.redwords.redWords`
   - Display name Red Words
   - Deployment iOS 15.0
   - URL scheme `redwords` / `redwords://today`
3. Signing & Capabilities for **RedWordsWidget**
   - Bundle ID `com.redwords.redWords.RedWordsWidget`
   - Same App Group
   - Embed in Runner (Embed App Extensions phase)
4. Confirm WidgetKit source `ios/RedWordsWidget/RedWordsWidget.swift` is in the RedWordsWidget target (not only on disk).
5. Team / certificates: Dean’s Apple Developer account. This repo has no provisioning profiles.

## Archive

1. `flutter pub get` then `flutter build ios --release` **or** Product → Archive in Xcode.
2. Upload to App Store Connect.
3. TestFlight internal: first launch must be Matthew 6:34. Widget must show Word + citation + thread, never a badge/streak/CTA.
4. Airplane mode: Today and Ask still open from the seed pack.
5. 988 in Settings opens the phone app (`tel:988`).

## Fail the upload if

- Scripture pack missing
- Any invented verse or citation
- Saying order reshuffled
- Streaks, chat bubbles, or Journeys appear
- Widget target missing from the archive
