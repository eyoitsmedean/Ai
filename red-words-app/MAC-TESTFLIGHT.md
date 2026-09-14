# Mac / TestFlight — exact Xcode steps

Linux cannot compile or archive iOS. Do not treat any Linux log as an iOS success. This file is the founder checklist for Dean’s Mac. No Apple Team ID or certificate is invented here.

Open the **workspace**, not the project file:

```
red-words-app/ios/Runner.xcworkspace
```

If CocoaPods is missing on first open: `cd red-words-app && flutter pub get && flutter build ios --release --no-codesign` (still will not produce a store IPA on Linux; on a Mac this generates `Generated.xcconfig` and the Pods workspace).

---

## 1. Signing & Capabilities — Runner

1. Select the **Runner** target.
2. Signing & Capabilities → Team: Dean’s Apple Developer team. Do not use a guessed Team ID.
3. Bundle Identifier: `com.redwords.redWords`
4. Display Name: **Red Words** (already in `Info.plist` as `CFBundleDisplayName`).
5. iOS Deployment Target: **15.0**
6. + Capability → App Groups → enable `group.com.redwords.redWords`
7. Confirm URL Types: scheme `redwords` (opens `redwords://today`). Already in `Runner/Info.plist`.
8. If Xcode reports “no such module WidgetKit” on Runner, add **WidgetKit.framework** to Runner → Frameworks, Libraries, and Embedded Content → **Do Not Embed**. `AppDelegate.swift` imports WidgetKit for `WidgetCenter.shared.reloadAllTimelines()`.

## 2. Signing & Capabilities — RedWordsWidget

The widget is already an app-extension target in `project.pbxproj` (`com.apple.product-type.app-extension`). Sources live at `ios/RedWordsWidget/`.

1. Select the **RedWordsWidget** target.
2. Same Team as Runner.
3. Bundle Identifier: `com.redwords.redWords.RedWordsWidget`
4. Deployment Target: **15.0**
5. + Capability → App Groups → the **same** `group.com.redwords.redWords`
6. Confirm Embed App Extensions phase on Runner includes RedWordsWidget.
7. Confirm `RedWordsWidget.swift` is in the RedWordsWidget target (not only on disk).
8. Build once for an **iOS 15/16** simulator and once for **iOS 17+**. `containerBackground` is used only behind `#available(iOSApplicationExtension 17.0, *)`. Below 17 the widget uses `.background`.

## 3. Widget contract (fail the archive if broken)

On the home screen the widget may show **only**:

- the Word (serif, crimson)
- the citation
- the crimson thread

Never a badge, streak, CTA, or in-card app name. Tapping opens `redwords://today`.

## 4. Archive and upload

1. In Terminal: `cd red-words-app && flutter pub get`
2. Xcode: Any iOS Device (arm64) → Product → Archive
   - or `flutter build ipa` once signing is selected in Xcode
3. Organizer → Distribute App → App Store Connect → Upload
4. App Store Connect → TestFlight → internal group
5. First install must land on Matthew 6:34
6. Add the widget. Change or keep a saying. The widget must update within a few seconds (Dart `WidgetBridge` → `redwords/widget` → App Group → `reloadAllTimelines()`). If it stays on the Matthew 6:34 placeholder, the App Group is missing on **one** of the two targets.
7. Airplane mode: Today and Ask still open from the seed pack.
8. Settings → 988 → phone app (`tel:988`). On an iPad without cellular, the in-app fallback must appear: “This device can’t place calls. From a phone, call or text 988.”
9. App Privacy: Data Not Collected. Privacy URL: Dean must host one (see `docs/privacy.html`). This repo does not invent a live URL.

## 5. Missing secrets (Dean only)

| Secret | Where |
| --- | --- |
| Apple Developer Team ID | Xcode Signing & Capabilities |
| Distribution certificate + App Store provisioning profiles | Apple Developer portal, for Runner **and** RedWordsWidget |
| App Store Connect app record | Bundle `com.redwords.redWords` |
| Privacy policy HTTPS URL | App Privacy / review notes |

Nothing else in this tree is waiting on those secrets.

## Fail the upload if

- Scripture pack missing
- Any invented verse or citation
- Saying order reshuffled
- Streaks, chat bubbles, or Journeys appear
- Widget target missing from the archive
- Widget shows a badge, streak, CTA, or in-card app name
