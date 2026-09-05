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
6. Build once for an **iOS 15/16** simulator and once for **iOS 17+**. The widget uses `containerBackground` only behind `#available(iOSApplicationExtension 17.0, *)`; both must compile.
7. Runner links `WidgetKit` (imported in `AppDelegate.swift` for `WidgetCenter.shared.reloadAllTimelines()`). If Xcode reports "no such module WidgetKit" on Runner, add WidgetKit.framework to Runner → Frameworks, Libraries (Do Not Embed).

## Archive

1. `flutter pub get` then `flutter build ios --release` **or** Product → Archive in Xcode.
2. Upload to App Store Connect.
3. TestFlight internal: first launch must be Matthew 6:34. Widget must show Word + citation + thread, never a badge/streak/CTA.
4. **Widget data path**: add the widget, open the app, save or move to another saying, return to the home screen. The widget must show the new Word within a few seconds (the app calls `WidgetCenter.shared.reloadAllTimelines()` after every write through the `redwords/widget` channel into the App Group). If it still shows Matthew 6:34 placeholder text after a change, the App Group is not enabled on **both** targets — fix in Signing & Capabilities.
5. Airplane mode: Today and Ask still open from the seed pack.
6. 988 in Settings opens the phone app (`tel:988`). On an iPad without cellular, the app must show "This device can’t place calls. From a phone, call or text 988." — not nothing.
7. Fill App Privacy per `STORE_ANSWERS.md` (Data Not Collected) and set the privacy policy URL.

## Fail the upload if

- Scripture pack missing
- Any invented verse or citation
- Saying order reshuffled
- Streaks, chat bubbles, or Journeys appear
- Widget target missing from the archive
