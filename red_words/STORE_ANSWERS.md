# Store answer sheet (Play Data safety · App Store App Privacy)

Every answer below is derived from what the release binary does, not from intent. Re-derive if a dependency is added.

## What the app does with data

| Fact | Evidence |
| --- | --- |
| No network access | Release APK `aapt dump badging`: no `android.permission.INTERNET`. Only `com.redwords.redwords.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (AndroidX auto-generated, not a user-data permission). |
| No analytics, ads, crash reporting, push, login, purchases | `pubspec.yaml` runtime deps: `flutter_riverpod`, `shared_preferences`, `url_launcher`. Nothing else. |
| On-device storage only | `shared_preferences`: last saying id, first-launch flag, committed step text, saved saying ids, dark-mode flag; widget word/citation/thread. Never leaves the device. |
| One outbound intent | `tel:988` via `url_launcher`, user-initiated, handled by the OS dialer. The app does not read call state or contacts. |
| Scripture | World English Bible, public domain (publisher statement, worldenglish.bible). Bundled in the app. |

## Google Play → App content → Data safety

Play requires this form and a privacy-policy link even when nothing is collected (Play Console Help, "Provide information for Google Play's Data safety section").

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not asked when "No" above |
| Do you provide a way for users to request that their data is deleted? | Not asked when "No" above. (Uninstall clears the on-device prefs.) |
| Privacy policy URL | **Founder-only**: host a page stating the facts in the table above. Required even for "No". |

Other Play sections
- App access: all functionality is available without special access. No login.
- Ads: **No**, this app does not contain ads.
- Content rating questionnaire: Reference / religious text; no user-generated content, no chat, no violence, no purchases.
- Target audience: 18+ or 13+ at founder's discretion; the app does not target children and contains no child-directed features.
- Government apps / Financial features / Health: No. (A crisis phone number is displayed; the app provides no health service and stores no health data.)
- News app: No.

## App Store Connect → App Privacy

Apple requires a privacy policy URL for every app (Guideline 5.1.1) and a privacy label that matches the binary.

| Question | Answer |
| --- | --- |
| Do you or your third-party partners collect data from this app? | **No** → label shows **Data Not Collected** |
| Privacy Policy URL | **Founder-only**, same page as Play. |
| Privacy manifest (`PrivacyInfo.xcprivacy`) | `shared_preferences_foundation` and `url_launcher_ios` ship their own manifests as CocoaPods/SwiftPM resources; Runner itself uses no required-reason APIs beyond UserDefaults, which the plugin declares. Xcode → Product → Generate Privacy Report on the Mac to confirm before upload. |
| Encryption export compliance | Uses only OS-provided HTTPS/none; answer **No** to proprietary encryption. (App has no network calls at all.) |
| Age rating | No objectionable content; religious text. |
| Sign in with Apple | Not applicable, no login. |

## Privacy policy text the founder can host verbatim

> Red Words stores your last saying, saved sayings, your one honest step, and a dark-mode preference on your device only. It has no accounts, no analytics, no advertising, and does not connect to the internet. Tapping 988 opens your phone's dialer; Red Words does not place calls, read call history, or access contacts. Deleting the app deletes this data. Scripture text is the public-domain World English Bible.

## Things that would invalidate this sheet

- Adding any SDK that phones home (analytics, crash reporting, ads, push).
- Adding `INTERNET` to the manifest or any `http`/`https` call.
- Adding a login, purchase, or share-to-server feature.
