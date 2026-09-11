# Adjacent 02 — iOS / Android PWA install reality (2026)

**Purpose.** Tell Dean whether a GitHub Pages build of Red Letter can launch fullscreen from the Home Screen on current iPhone Safari and Android Chrome, what actually breaks, and what the five-minute phone walk in `RELEASE.md` still has to prove.  
**Owner.** Dean.  
**Product surfaces.** `public/manifest.json`, `public/sw.js`, `public/index.html` (Keep button, `beforeinstallprompt`, morning reminder, `speechSynthesis`, blessing share), `RELEASE.md` § Phone, `CLAUDE.md` mobile decision.  
**Retrieved.** 2026-09-11. Official Apple / Google / MDN / GitHub pages preferred.  
**Code.** Not edited.

Labels used below: **[fact]** from a named source fetched on this date · **[interpretation]** reading those facts onto this product · **[recommendation]** what Dean should do or prove. This note is not a substitute for the on-device walk.

---

## Verdict

**Yes — a GitHub Pages PWA can launch without the browser chrome on current iOS Safari and Android Chrome.** **[fact]** + **[interpretation]**

The product already has the pieces those platforms look at: HTTPS on `github.io`, a Web App Manifest with `display: "standalone"`, 192 and 512 icons, `start_url` / `scope` of `./`, an `apple-mobile-web-app-capable` meta tag, and a service worker with a `fetch` handler. **[fact]** (`public/manifest.json`, `public/sw.js`, `public/index.html`, GitHub Pages HTTPS docs)

What the walk still has to prove is not “is a PWA theoretically installable.” It is: Dean’s own phone, this origin, this project path (`…github.io/Ai/`), this icon, this first screen, this offline cache, this share sheet. CI cannot see any of that. **[recommendation]**

Native store wrappers stay a separate Dean decision, as `CLAUDE.md` already says. **[fact]**

---

## What this product already ships

Read from the tree on 2026-09-11. **[fact]**

| Piece | Where | What it does |
| --- | --- | --- |
| Manifest | `public/manifest.json` | `name` / `short_name` “Red Letter”; `start_url` `./`; `scope` `./`; `display` `standalone`; `orientation` `portrait`; 192 and 512 PNG icons (`any` and `maskable`); parchment `theme_color` / `background_color` |
| Apple hints | `public/index.html` `<head>` | `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `mobile-web-app-capable`, `apple-touch-icon` |
| Service worker | `public/sw.js` (`rla-v17`) | Precaches the folio, `manifest.json`, `library.json`, `curated.json`, `data/*.js`, icons; network-first for HTML; cache-then-network for other same-origin GET; `/api/*` fails closed with `{ offline: true }` |
| Registration | `public/index.html` | `navigator.serviceWorker.register(BASE + 'sw.js')` — `BASE` is the project path, so the worker lives at `/Ai/sw.js` with default scope `/Ai/` |
| Install UI | `paintInstallState`, `promptInstall`, `beforeinstallprompt` | Stores the Chrome event; the Keep button calls `prompt()`. If no event: “Use the browser menu” |
| Standalone detect | `matchMedia('(display-mode: standalone)')` | Hides the Keep pitch and the first-sitting toast once installed. Does **not** also check `navigator.standalone` |
| Audio | `toggleHearOffice`, `toggleSitListen` | `speechSynthesis.speak` from a button tap |
| “Push” | `toggleReminder`, `checkMorningReminder` | Settings toggle → `Notification.requestPermission()` → `new Notification(...)` from a 5-minute `setInterval` while the page is open, 08:00–10:00 local. No `PushManager`, no VAPID, no push server |
| Share | `shareItem`, blessing send | `navigator.share` with a card file when the sheet allows it |
| Host | `.github/workflows/pages.yml` | Publishes `public/` to GitHub Pages |

`CLAUDE.md` settled line: the installable PWA **is** the mobile build; Flutter / Capacitor store wrappers are not merged here. **[fact]**

---

## Can it launch fullscreen from the Home Screen?

### iPhone / iPad — Safari, iOS 26 and iPadOS 26

**[fact]** WebKit, *WebKit Features in Safari 26.0*, 15 September 2025, § “Every site can be a web app on iOS and iPadOS”:

- From iPhone OS 2.1 (2008) through iOS 18, a Home Screen icon opened as a web app only if the page had `apple-mobile-web-app-capable` or a manifest `display` value that asked for it. Otherwise the icon was a Safari bookmark.
- From iOS 26 / iPadOS 26, **every** site added via Share → Add to Home Screen opens as a web app **by default**. The user can turn off “Open as Web App” in that sheet and get a bookmark instead — even if the site *is* configured as a web app.
- A manifest is no longer required for installability. If one is present, Safari still uses it (icons, name, the benefits it declares).
- Home Screen web apps on iOS “never required Service Workers”; a worker “can greatly enhance the user experience.”
- WebKit’s own summary: “there are now zero requirements for ‘installability’ in Safari.”

**[fact]** This product already has both the meta tag and `display: "standalone"`, plus icons in the manifest and an `apple-touch-icon`. On iOS 26 the default Add-to-Home-Screen path should therefore launch without Safari’s URL bar, provided Dean leaves “Open as Web App” on.

**[interpretation]** `RELEASE.md` step 1 (“Open from the icon: it should launch full-screen on the title page with no browser bar”) is the right test. The new failure mode on iOS 26 is not a missing manifest. It is Dean (or a tester) unchecking “Open as Web App,” which produces a Safari bookmark and a visible browser chrome. That is a user choice, not a product defect.

**[fact]** MDN, *Making PWAs installable* (retrieved 2026-09-11): `beforeinstallprompt` “is not supported on iOS.” web.dev, *Installation prompt*: Chrome and Edge on iOS/iPadOS do not install PWAs; the only install path is Safari’s Share → Add to Home Screen. MDN also notes that from iOS 16.4 other browsers’ Share menus can add a Home Screen web app, but that is still the system sheet, not Chrome’s Install dialog.

**[interpretation]** The Keep button will never become “Keep” on an iPhone. It will stay “Use the browser menu.” That is correct. The first-sitting toast (“Add this room to your home screen”) is the iOS install hint, and it already suppresses itself in `standalone`.

**[recommendation]** On the walk, leave “Open as Web App” on. If the icon opens Safari with a URL bar, check that toggle before filing a product bug.

### Android — Chrome

**[fact]** web.dev, *What does it take to be installable?* (last updated 2024-09-19, retrieved 2026-09-11). Chrome fires `beforeinstallprompt` and shows the in-browser install promotion when all of these hold:

- the app is not already installed
- HTTPS
- user engagement: at least one tap, and at least 30 seconds on the page (across visits)
- a manifest with `name` or `short_name`; 192px and 512px icons; `start_url`; `display` of `fullscreen` / `standalone` / `minimal-ui` / `window-controls-overlay`; `prefer_related_applications` absent or `false`

**[fact]** This manifest meets those fields. GitHub Pages on a `github.io` host is HTTPS automatically for sites created after 15 June 2016 (GitHub Docs, *Securing your GitHub Pages site with HTTPS*, retrieved 2026-09-11). The product registers a service worker; current Chrome text does **not** list a service worker as a hard gate for `beforeinstallprompt`, though a worker is still what makes offline and Web Push possible.

**[fact]** MDN, *Making PWAs installable*: on Android, only Chrome with Google Mobile Services, and Samsung Internet on Samsung devices, install a real **WebAPK** (launcher entry, app switcher, system settings). Other Android browsers add a badged shortcut that still opens in the browser.

**[interpretation]** On Dean’s Android Chrome, after ~30 seconds and one tap, `beforeinstallprompt` should fire, the Keep button should enable, and Install app / Keep should produce a standalone WebAPK. First-second-of-first-visit will still show “Use the browser menu”; that is Chrome’s engagement heuristic, not a broken manifest.

**[fact]** MDN `display`: `standalone` “exclude[s] UI elements such as a URL bar but can still include other UI elements such as the status bar.” It is not a game-style `fullscreen`. `RELEASE.md`’s “full-screen … no browser bar” matches `standalone`, not the absence of the status bar.

---

## What breaks

### Install prompts

| Surface | Reality | Product |
| --- | --- | --- |
| iPhone Safari | No `beforeinstallprompt`. Share → Add to Home Screen. iOS 26 adds “Open as Web App” (on by default). **[fact]** WebKit 2025-09-15; MDN | Keep stays “Use the browser menu.” Toast after the first sitting is the hint. |
| Chrome Android | Event fires after HTTPS + manifest + 30s + one tap. `prompt()` only works once per event. **[fact]** web.dev install-criteria + customize-install | Already captured. Keep becomes live only after that heuristic. |
| Chrome / Edge on iOS | Cannot install a PWA. **[fact]** web.dev *Installation prompt* | A tester who only opens the Pages URL in Chrome-on-iPhone will not complete step 1. They must use Safari. |
| Manifest richness | Chrome Android can show a larger, store-like dialog if `description` **and** `screenshots` are present. **[fact]** web.dev *Installation prompt* | `description` is set; `screenshots` are not. The Android prompt will be the small one. Not a blocker. |

**[recommendation]** Do not treat a disabled Keep button on iPhone as a bug. Do not add a fake install API. If Dean wants a richer Android sheet later, that is `screenshots` in the manifest — product work, not this note.

### Standalone display

**[fact]** MDN `display` + product manifest: the asked mode is `standalone`. Detection in the page is `matchMedia('(display-mode: standalone)')`.

**[interpretation]** Gaps that can make step 1 look like a fail:

1. iOS 26 “Open as Web App” turned off → Safari chrome. User choice.
2. Opening `…/Ai` without the trailing slash on a project site can miss the service-worker scope (GitHub Pages project-path quirk; the worker is registered from `BASE`, which includes the slash when the folio computed it). First open should be the canonical Pages URL with the trailing path the workflow printed.
3. A blessing link (`/?b=…`) opened from Messages may land in Safari, not in the installed web app, depending on iOS / Android link capture. That is a different browsing context. The walk’s step 5 (“Open the link”) does not promise it stays inside the Home Screen app.
4. `orientation: "portrait"` will lock or hint portrait. Confirm the title page is usable if the phone is sideways; not a release blocker unless the folio clips.

**[recommendation]** Step 1 of the walk should name the URL (`https://<user>.github.io/Ai/`), name Safari on iPhone, and name “Open as Web App” left on.

### Offline

**[fact]** The worker precaches the folio, the spoken library, curated rooms, signals, and icons. It does not precache Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com` are cross-origin; the worker returns early on other origins). `CLAUDE.md` / `RELEASE.md` already mark headless-Chrome offline as verified; on-device Airplane Mode is unverified.

**[interpretation]** After a successful first load (worker installed, precache finished), Airplane Mode should still render Today and should still open a blessing from cache — that is exactly `RELEASE.md` step 3. What will degrade:

- Fraunces / Source Serif 4 / Instrument Sans fall back to device serifs. The room remains readable; it will not look like DESIGN.md.
- `/api/*` (model Advisor, live daily) returns the worker’s 503 JSON. The static composer and `library.json` / `curated.json` are the offline path. That is the settled GitHub Pages design.
- If Dean flips Airplane Mode *before* the first worker install completes, Today can fail. Wait for the first sitting to finish, then flip the radio.

**[recommendation]** Step 3 must happen on the **installed** icon, after the folio has been opened once online. If Today is blank, the bug is cache, not “PWA install.”

### Audio (`Hear this` / Sit **Listen**)

**[fact]** MDN `SpeechSynthesis`: Baseline, widely available since 2018. The product only calls `speak()` from a tap (`toggleHearOffice`, `toggleSitListen`).

**[interpretation]** Official docs do not list a standalone-mode ban. Known WebKit behaviour (not in Apple’s current PWA pages; treat as **[interpretation]** from long-standing WebKit constraints, to be confirmed on device): the first `speak()` must be inside a user gesture; the iPhone Ring/Silent switch silences it; locking the phone often stops it. The product already toasts “Listening isn’t available on this device” if the API is missing.

**[recommendation]** The five-minute walk does **not** currently tap Hear / Listen. Add one tap on the installed icon if Dean cares that the office can be heard in standalone. Not a blocker for “installable PWA.” Silent-switch false alarm is the likely first “bug.”

### Push / morning reminder

This is the feature that does **not** survive a real phone.

**[fact]** Apple Developer Documentation, *Sending web push notifications in web apps and browsers* (copyright 2026, retrieved 2026-09-11):

- Web Push (Push API + Notifications API + service worker) is available for **Home Screen web apps on iOS 16.4+** and for Safari 16 on macOS 13+.
- Permission must be requested from a **user gesture**, then `pushManager.subscribe` immediately.
- A **server** must hold the subscription, VAPID keys, and POST to `https://*.push.apple.com`.
- Apple Developer Program membership is **not** required.
- Safari does not allow invisible push; the worker must show a notification or Apple revokes permission.

**[fact]** MDN *Notifications API* and *`Notification()` constructor* (retrieved 2026-09-11):

- Non-persistent `new Notification()` is tied to the lifetime of the page.
- “If your code needs to run on mobile devices then you must use persistent notifications.”
- “This constructor throws a `TypeError` when called in nearly all mobile browsers.” Use `ServiceWorkerRegistration.showNotification()`.

**[fact]** This product’s morning reminder is `new Notification(...)` from `setInterval` while `index.html` is running. `public/sw.js` has no `push` handler. There is no VAPID key and no Node host on GitHub Pages.

**[interpretation]** On a phone:

- The Settings toggle may obtain permission inside the Home Screen web app (iOS only exposes Notifications in that context; a plain Safari tab often will not).
- The 08:00 toast will fire only if the folio is **open** between 8 and 10. Close the app, lock the phone, or leave the tab, and nothing is delivered.
- On many mobile browsers the constructor itself throws; the `try/catch` in `checkMorningReminder` swallows it. The toggle can look “on” and never notify.
- True “a quiet word is waiting” while the app is closed needs a push server. GitHub Pages cannot be that server. `IMPROVEMENT_PLAN.md` already flagged this.

**[recommendation]** Do not put a morning-notification check on the five-minute walk as a release blocker. If Dean wants it later, that is a Node (or third-party push) decision, not a Pages decision. Native wrappers do not automatically fix this either — they still need a push pipeline.

### Share / blessing

**[fact]** MDN `navigator.share`: secure context, user activation, files allowed for PNG. The blessing path already uses a tap.

**[interpretation]** Step 5 (Messages + card + link) should work from the installed web app on current iOS and Android. What to watch: file share failing and falling back to text-only; the opened link leaving standalone (see above).

---

## What the five-minute walk still has to prove

`RELEASE.md` § “Phone — Dean's five minutes” cannot be run in this environment. It is still the right list. Map it onto 2026 platform reality:

| Step | What it actually proves | What it does not prove | How to run it so the proof is real |
| --- | --- | --- | --- |
| 1. Add to Home Screen / Install app; open from the icon, no browser bar, title page | Standalone launch, `start_url`, icons, project-path manifest | `beforeinstallprompt` on iPhone (will not fire); Chrome-on-iOS install; a week of icon persistence | **iPhone:** Safari only. Share → Add to Home Screen. Leave **Open as Web App** on. Open the icon, not the Safari tab. **Android:** Chrome. Stay 30+ seconds, tap once, then menu → **Install app** *or* Keep if it enabled. |
| 2. Acknowledgment → morning page → lectio → Amen | First-session ritual in standalone | Hear / Listen; fonts from Google | Do this **from the icon**, not the Safari tab you installed from. |
| 3. Airplane Mode → reopen from the icon | Precache + offline Today | Offline webfonts; model Advisor; first-visit-before-SW | Open once online from the icon, wait a few seconds, *then* Airplane Mode, *then* kill and reopen the icon. |
| 4. Advisor “I want to die” then “I took too many pills” | Crisis / poison interrupt in standalone, `signals.js` from cache | Server model path | Same as the written step. Confirm 988, then 911 / Poison Control, **before** send. |
| 5. Send a blessing → Messages → open the link | Web Share + blessing URL | That the link reopens **inside** the Home Screen app | Send to yourself. Note whether the card image appeared. When the link opens, note Safari vs Red Letter icon. Either is acceptable for “the verse is there”; only the latter is standalone. |

**Still worth one extra tap, not a sixth blocker**

- **Hear this** or Sit **Listen** once, ringer on. Proves speech in standalone.
- After install, confirm the Keep button reads **Kept** (`display-mode: standalone`). If it still says “Use the browser menu” on an icon that has no URL bar, the media query missed — file that. On iOS, also glance at `navigator.standalone` if you ever debug a miss; the page does not read it today.
- Android only: confirm Keep enabled after 30 seconds. If it never enables, the install criteria failed (manifest MIME, icon fetch, or HTTP).

**Do not try to prove in five minutes**

- Web Push / 08:00 reminder with the app closed.
- A week of iOS storage survival.
- Chrome-on-iPhone install.
- Store listing, WebAPK Play presence, or Flutter/Capacitor.

If any numbered step fails on the installed icon, `RELEASE.md` is right: that number is the bug report.

---

## Implications for the three named files

### `public/manifest.json`

**[interpretation]** The file as shipped is sufficient for 2026 install-and-standalone on both platforms. Relative `start_url` / `scope` / icon paths are the correct shape for a GitHub Pages **project** site (`…github.io/Ai/`). Do not “fix” them to `/` — that would escape the project scope.

**[recommendation]** No change required for the walk. Optional later, not this note: `screenshots` for a richer Android install sheet; an explicit `id` if Chrome ever double-installs after a path change. Do not add `prefer_related_applications`. Do not set `display` to `browser`.

### `RELEASE.md` phone walk

**[recommendation]** Keep the five steps. When Dean next edits that section, the only accuracy fixes are:

1. Spell the iOS 26 sheet: Share → **Add to Home Screen** → leave **Open as Web App** on. Chrome-on-iPhone is not a substitute.
2. On Android, wait through the first half-minute before expecting **Install app** / Keep.
3. Do step 3 from the **icon**, after one online launch.
4. Do not add a closed-app notification check. The current reminder cannot pass it.

Those are copy edits for a later Dean pass. This research does not edit `RELEASE.md`.

### `CLAUDE.md` mobile line

**[interpretation]** “The installable PWA **is** the mobile build (iOS/Android via Add to Home Screen)” is still true in 2026. iOS 26 made that *easier*, not harder: any site can be a web app, and this one already declares itself as one. Native store wrappers remain a separate decision.

**[recommendation]** Do not reopen the mobile decision on the back of this note. The walk is what is unverified, not the architecture.

---

## Sources (retrieval 2026-09-11)

Full bibliography: `docs/research/sources.md` § Adjacent 02.

Primary:

- WebKit, *WebKit Features in Safari 26.0*, 15 Sep 2025, https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- Apple Developer, *Sending web push notifications in web apps and browsers*, © 2026, https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- web.dev, *What does it take to be installable?*, updated 2024-09-19, https://web.dev/articles/install-criteria
- web.dev, *How to provide your own in-app install experience*, https://web.dev/articles/customize-install
- web.dev, *Installation prompt*, https://web.dev/learn/pwa/installation-prompt
- MDN, *Making PWAs installable*, https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN, `beforeinstallprompt`, `display`, Notifications API, `Notification()`, `SpeechSynthesis`, `navigator.share`
- GitHub Docs, *Securing your GitHub Pages site with HTTPS*, https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
