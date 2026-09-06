# Mobile — Red Letter on iPhone and Android

The phone app is the same HTML build, wrapped by Capacitor. Nothing is rewritten; the tests, the seal, and the Press all ship as they are.

## The decision (recorded in CLAUDE.md)

| Option | What it is | Why / why not |
| --- | --- | --- |
| **Capacitor** (chosen) | Native iOS and Android shells around `public/`. `appId app.redletter.quietpage`. | Reuses the working build and its 61 tests and 14 browser walks. Web Share, Canvas proofs, the service worker and the Press need no port. First build is minutes, not weeks of parity work. |
| React Native / Expo rewrite | Re-implement the rooms as native views. | Discards a build Dean has reviewed. Every leaf, seal, and church-year rule would be rewritten twice (JS + native layout). Rejected. |

## What has been verified here, and what has not

| Step | Status |
| --- | --- |
| `npx cap add android` and `npx cap sync android` | verified 2026-09-06 — web assets copied into `android/app/src/main/assets/public` |
| `./gradlew assembleDebug` (Android SDK 36, build-tools 36.0.0, Java 21) | **verified 2026-09-06 — BUILD SUCCESSFUL in 54s; `app-debug.apk` 4.3 MB, contains `index.html`, `config.js`, `data/press.js`, `sw.js`** |
| Install and run on an Android phone | unverified — Dean's step, checklist below |
| `npx cap add ios`, Xcode build, run on iPhone | unverified — needs a Mac with Xcode 15+ and CocoaPods |
| Web Share hands a PNG to Messages on iPhone | unverified — Dean's step |

## Before the first phone build: point the app at its API

The page fetches `/api/...` on the same origin. Inside a phone shell there is no same origin, so set the host once in `public/config.js`:

```js
window.RLA_API_BASE = 'https://YOUR-HOST';   // the Node server from `npm start`, on HTTPS
```

Leave it empty for the web. Without a host the phone build still opens every room and the Advisor answers from the device's own fallback letters; with a host it gets the curated or live Advisor and the corpus seal.

## Android — from a clean machine

```bash
npm install
npm run mobile:apk                 # = npx cap sync android && cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Requirements: Java 17 or 21, Android SDK with `platforms;android-36` and `build-tools;36.0.0` (`sdkmanager` or Android Studio), `ANDROID_HOME` set. To open in Android Studio instead: `npm run mobile:android`.

Install on a phone with USB debugging on: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.

## iOS — on a Mac

```bash
npm install
npx cap add ios                    # once; creates ios/ (commit it)
npm run mobile:sync
npm run mobile:ios                 # opens Xcode
```

In Xcode: select your team under Signing & Capabilities, choose your iPhone as the run target, press Run. Set the display name to **Red Letter** and the bundle id to `app.redletter.quietpage` (already in `capacitor.config.json`).

## The five-minute checklist (on the phone, in this order)

1. **Open** — the title page shows in parchment with the crimson wordmark within two seconds; no white flash (splash is `#F4EFE4`).
2. **Today** — the morning/vespers/compline office loads; tap a saying; the catchword appears.
3. **Advisor** — type "I am afraid of the future". Within five seconds a letter arrives with **Luke 12:32**, **Luke 12:7** or **Mark 5:36** as scripture blocks, each with a citation you can tap. If instead you see John 14:27 and Matthew 11:28 every time, `RLA_API_BASE` is not reaching the server.
4. **Crisis** — type "I want to kill myself". The crisis sheet appears *before* sending; if you continue, the letter leads with 988 (call, text, or chat) and findahelpline.com and says it is not a person.
5. **Bless** — open the Press → Bless, pick a card, tap Send. The system share sheet opens with a PNG attached (Messages shows an image preview, not a link). On iPhone this must happen on the first tap, with no spinner in between.
6. **Offline** — turn on airplane mode, kill the app, reopen. The rooms open and the Press leaves load from the service worker cache. The Advisor falls back to the on-device letters.
7. **Type** — pinch nothing; the folio should not zoom; the crimson stays the only loud colour in dark and light system modes.

Anything that fails: note the step number and the exact text on screen, and send it back. Steps 3–5 are the ones that matter for a person at a low moment.

## Store submission

Not part of this checklist and never done without Dean's sign-off. Both stores will want: privacy nutrition labels (the journal is on-device only; the waitlist e-mail is the only data sent), the 988 / findahelpline safety text visible in the first screenshot set, and a support URL.
