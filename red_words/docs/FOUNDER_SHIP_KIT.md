# Flagship 1 — Founder ship kit

Use this on a Monday morning. Do the steps in order. Skip nothing that is marked **gate**.

Last updated: 2026-09-11. Evidence dates are on the cited pages.

## What is already done (do not redo)

- Flutter app, 100 WEB Gospel sayings, Matthew 6:34 first.
- Android release APK + AAB built on Linux; label `Red Words`; id `com.redwords.redwords`; R8 on; placeholder signer. See `android/BUILD_PROOF.md`.
- iOS widget **target** is in the pbxproj. Compile is still **blocked on a Mac**.
- Ask retriever rebuilt (PR 36): first-person crisis gate; weather query stays.
- Privacy text is **in Settings** (Apple 5.1.1(i) in-app requirement). Host the same text as a URL using `docs/privacy.html`.

## Gate A — Decide which stores you can enter this week

| Store | What you can do this week | What you cannot |
| --- | --- | --- |
| **App Store / TestFlight** | Archive on a Mac, internal TestFlight, submit for review once privacy URL is live. | Nothing on Linux. |
| **Play — internal/closed test** | Upload a **re-signed** AAB to a closed test track as soon as the keystore and listing exist. | — |
| **Play — production** | Only after the closed-test rule below, if your account is in scope. | Same-day production for a new personal account. |

**Play production rule** (retrieved 2026-09-11, [Play Console Help 14151465](https://support.google.com/googleplay/android-developer/answer/14151465)): personal developer accounts created **after 13 November 2023** must run a **closed test** with at least **12 testers opted in continuously for 14 days**, then **apply** for production access on the Dashboard. Emails on a list do not count; each tester must open the official opt-in link and stay opted in. Organization accounts are generally outside this rule — confirm on your Dashboard.

If the Dashboard shows a production-access application, you are in scope. Start the closed test **this week**. Do not plan a Friday production cut.

## Gate B — Host the privacy policy (30 minutes)

Apple: “All apps must include a link to their privacy policy in the App Store Connect metadata field **and within the app**” (Guideline 5.1.1(i), developer.apple.com/app-store/review/guidelines/, retrieved 2026-09-11). Play also requires a URL on Data safety.

1. Take `red_words/docs/privacy.html` from this repo.
2. Publish it at a stable HTTPS URL (GitHub Pages on a small public repo is enough). Incognito-load it. No login wall. No cookie banner that hides the text.
3. Put that URL in App Store Connect → App Information → Privacy Policy, and Play Console → App content → Privacy policy.
4. Do not change the wording unless the app changes. Settings already shows the same facts.

## Gate C — Android, real keystore, closed test

1. Copy `android/key.properties.example` → `android/key.properties` (gitignored). Point `storeFile` at the Play **upload** keystore. Never commit the keystore.
2. From `red_words/`:

```bash
flutter pub get
flutter build appbundle --release
```

Upload `build/app/outputs/bundle/release/app-release.aab` to a **closed** testing track (not production).

3. Data safety: **Does the app collect or share any of the required user data types? → No.** Privacy URL = Gate B. Ads: No. See `STORE_ANSWERS.md`.
4. Recruit 12 people who will **opt in and leave the app installed for 14 days**. Send the Play opt-in link, not a sideload APK. Write their names in a private note. If someone opts out, the 14-day clock for that seat resets.
5. Device QA on one Android phone: run `docs/REVIEWER_WALKTHROUGH.md` in airplane mode, then with a radio for 988.

The placeholder APK on the agent machines is **not** the Play artifact.

## Gate D — iOS, Mac only

Follow `TESTFLIGHT.md`. Short version:

1. Mac: `ios/Runner.xcworkspace` (not the xcodeproj alone).
2. Signing & Capabilities: App Group `group.com.redwords.redWords` on **Runner and RedWordsWidget**. Team = your Apple Developer account.
3. If Xcode says “no such module WidgetKit” on Runner, add WidgetKit.framework to Runner (Do Not Embed).
4. Build an iOS 15/16 simulator **and** iOS 17+. `containerBackground` is behind `#available(iOSApplicationExtension 17.0, *)`.
5. Archive → upload → TestFlight internal.
6. App Privacy: **Data Not Collected**. Privacy URL = Gate B.
7. Encryption: No proprietary encryption (the app has no network stack of its own).
8. Device QA: `docs/REVIEWER_WALKTHROUGH.md`. Widget follow is the one check Linux could not do.

## Gate E — Store listing copy (paste)

**Name:** Red Words

**Subtitle (App Store, 30 characters):** His words. One honest step.

**Short description (Play, 80):** His words, for this moment. Gospels only. Offline. No chatbot.

**Description (both, edit only the last line for the store name):**

```
Red Words opens on a saying of Jesus — the World English Bible, Gospels only — and one honest step.

There is no account, no streak, no chat, and no invented verse. Ask looks up a recorded saying on this device. If nothing fits, it says so.

If you are in crisis in the US, call or text 988. This app is not a person and it is not emergency care.

Privacy: nothing leaves the device. Policy: <PASTE GATE B URL>
```

**Keywords (App Store):** Jesus,Gospel,Bible,Scripture,WEB,prayer,offline,verse

**Review notes (both):**

```
Offline app. No login. First launch shows Matthew 6:34 (WEB).
Ask is on-device keyword retrieve against 100 recorded sayings; it does not generate Scripture.
988 is tel:988 (US). On a tablet without a dialer the app shows a fallback line.
Home widget: Word, citation, thread. Tap opens redwords://today.
Privacy policy URL: <PASTE>. Same text is in Settings.
```

**Screenshots to shoot** (6.7" iPhone + 6.1" + iPad; Play phone + 7" tablet):

1. Today — Matthew 6:34, hierarchy visible (Word, citation, knot, reflection, step).
2. After “I’ll do this” — the step committed.
3. Ask — a retrieve (e.g. “I need peace”) and a stay (e.g. a recipe).
4. Saved empty (“Nothing kept yet.”) and Saved with one saying.
5. Settings — Dark saying + Privacy block + 988.
6. Home screen widget — Word + citation + thread, no badge.

## Fail the upload if

- Pack missing, invented verse, hierarchy reshuffled, streaks/chat/Journeys, Sit/Seek as home, widget target missing from the iOS archive, Data safety claimed “no collection” after an analytics SDK is added.

## After the gates

Merge order Dean controls: PR 13 (app) then PR 36 (Ask) then this recovery PR. Do not merge PR 12 into this line.
