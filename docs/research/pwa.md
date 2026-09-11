# PWA install requirements (as of 2026-09-11) — The Red Letter Advisor

Research date: 2026-09-11. Only URLs listed under “URLs opened” were fetched. Confidence tags: **[verified]** = two or more fetched sources agree; **[single-source]** = one fetched source.

Red Letter manifest (workspace `public/manifest.json`): `start_url` `./?source=pwa`, `scope` `./`, `id` `./`, `display` `standalone`, `display_override` `["standalone","minimal-ui"]`, screenshots `1170x2532` (narrow) and `1920x1080` (wide), icons 192/512 `any` + 192/512 `maskable`. HTML already has `apple-mobile-web-app-capable`, `apple-touch-icon`, `beforeinstallprompt` handling, and `navigator.storage.persist()`.

---

## 1. Android Chrome install prompt in 2026

### Manifest fields required for `beforeinstallprompt` + in-browser promotion

From the current Chrome criteria page (last updated **2024-09-19 UTC** — no newer 2025/2026 replacement was found among fetched pages) **[verified with MDN]**:

Chrome fires `beforeinstallprompt` and shows the in-browser install promotion when all of these are true (`https://web.dev/articles/install-criteria`):

- App is not already installed
- User engagement heuristics:
  - at least one click/tap on the page (any prior load counts)
  - at least 30 seconds viewing the page (any prior visit counts)
- Served over HTTPS
- Manifest includes:
  - `short_name` or `name`
  - `icons` — must include a **192px and a 512px** icon
  - `start_url`
  - `display` — one of `fullscreen`, `standalone`, `minimal-ui`, or `window-controls-overlay`
  - `prefer_related_applications` absent or `false`

MDN’s Chromium list matches, and additionally allows `display` **and/or** `display_override` (`https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable`). HTTPS / localhost / 127.0.0.1 is required.

**Red Letter:** already satisfies every listed field (`name`/`short_name`, 192+512 icons, `start_url`, `display: standalone`, `prefer_related_applications: false`). Engagement heuristics are runtime, not a file issue.

### Screenshots (richer install UI, Android)

Not required to be installable. Recommended so Android Chrome upgrades the mini-infobar to an app-store-like bottomsheet **[verified]**.

Criteria documented on `https://web.dev/articles/add-manifest` (last updated **2024-09-18 UTC**):

- Width and height at least 320px and at most 3840px
- Maximum dimension no more than **2.3×** the minimum dimension
- All screenshots of the same `form_factor` share one aspect ratio
- JPEG or PNG
- `form_factor`: `wide` = desktop; `narrow` = mobile
- From Chrome 109: only `wide` screenshots on desktop; `wide` screenshots **ignored on Android**; screenshots without `form_factor` still shown on Android for compatibility
- Chrome desktop shows 1–8 qualifying screenshots; **Chrome Android shows 1–5**

`https://developer.chrome.com/blog/richer-pwa-installation` (last updated **2021-04-23 UTC**): at least one screenshot for the corresponding form factor; `description` recommended. Sites without screenshots keep the small prompt. UI shipped Chrome 94 Android / 108 desktop.

**Red Letter screenshot check (arithmetic against the 2.3 rule):**

| Asset | Size | max/min | Limit 2.3 | 320–3840 | form_factor |
|---|---|---|---|---|---|
| `screenshot-narrow.png` | 1170×2532 | 2532/1170 = **2.164** | pass | pass | `narrow` → Android richer UI |
| `screenshot-wide.png` | 1920×1080 | 1920/1080 = **1.778** | pass | pass | `wide` → desktop richer UI; ignored on Android |

No 2026 change to these numbers was found. Both assets are valid. `description` is already set (Chrome truncates at 300 characters / 7 lines on Android — Red Letter’s description is well under).

### Icons

Chromium still documents **192 + 512** as the required pair **[verified]** (install-criteria + MDN + add-manifest). Maskable is recommended, not required (`https://developer.chrome.com/blog/update-install-criteria`: “even better a maskable icon”). Separate `any` and `maskable` entries (Red Letter’s pattern) is the safe form; add-manifest also mentions `"purpose": "any maskable"` as an alternative.

### Service worker

**As of the latest install-criteria page (2024-09-19), a service worker is not listed as required for `beforeinstallprompt` or in-browser promotion.** MDN states SW is “not a requirement for a PWA to be installable.” **[verified]**

Older Chrome blog (`https://developer.chrome.com/blog/update-install-criteria`, last updated **2023-12-05 UTC**) is more nuanced and still worth knowing:

- Menu install: SW `fetch` handler **no longer required** since Chrome **108 mobile / 112 desktop**
- At that time, the *automatic* install-prompt algorithm still required a `fetch()` handler; Chrome said it was working to replace that with other signals
- Developers could still use `beforeinstallprompt` to control the prompt
- Empty fetch handlers were already ignored as a quality cheat

No fetched 2025/2026 page restates the fetch-handler requirement. Treat SW as **strongly recommended for offline/cache/push**, not as a 2026 install-gate. Red Letter already ships `public/sw.js` with a real fetch handler.

### Other Chrome 2024 notes (still current; no 2026 replacement fetched)

Users can install sites that fail the crafted-PWA criteria via More → Add to Home screen → Install app, or ML-triggered prompts (`https://developer.chrome.com/blog/how_chrome_helps_users_install_the_apps_they_value`, last updated **2024-07-23 UTC**). That does not replace meeting criteria if you want `beforeinstallprompt` and the richer dialog.

---

## 2. What iOS Safari still does NOT support

### `beforeinstallprompt` — not supported **[verified]**

- MDN Making PWAs installable: custom install UI via `beforeinstallprompt` “is not supported on iOS.”
- MDN BCD (`https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/BeforeInstallPromptEvent.json`): `safari` and `safari_ios` are `version_added: false`.
- `https://web.dev/learn/pwa/installation-prompt`: if the browser lacks the event, there is no other way to trigger the browser install prompt; on iOS show Share → Add to Home Screen instructions. Chrome/Edge on iOS/iPadOS also do not fire the event.

**Red Letter:** `app.js` already listens for `beforeinstallprompt`; `mobile.js` already documents a visible iOS path when the event is missing. Keep instructional UI. Do not depend on `prompt()`.

### `display_override` — not documented as supported on Safari **[single-source + absence]**

Fetched pages that describe `display_override` are Chromium/MDN-experimental:

- MDN `display_override` page: Experimental; browser considers the array before `display`.
- MDN Making PWAs installable lists `display` and/or `display_override` as a **Chromium** requirement, not a Safari one.
- web.dev add-manifest documents it as a Chromium fallback override (`window-control-overlay` example).

Safari 26.0 (15 Sep 2025) and Safari 26.6 (27 Jul 2026) WebKit feature posts do **not** mention `display_override` or `beforeinstallprompt`. CanIUse `https://caniuse.com/mdn-html_manifest_display_override` was opened; the converted page did not include a usable support grid, so it is not used as evidence.

**Implication:** Red Letter’s `"display_override": ["standalone","minimal-ui"]` is harmless on iOS (ignored) and useful on Chromium. iOS uses `display: "standalone"` plus `apple-mobile-web-app-capable`. Do not treat `display_override` as an iOS install or chrome-hiding switch.

### iOS install model in 2026 (Safari 26 / iOS 26) **[verified]**

From WebKit (WWDC25 beta post + Safari 26.0 features, 15 Sep 2025):

- **Zero installability requirements** on iOS 26 / iPadOS 26: any site can be added to the Home Screen and opened as a web app. Manifest and service worker are **not required** for standalone launch (they still supply icons, offline, push, etc.).
- **Default:** every site added to Home Screen opens as a web app.
- **User override:** the user can turn off “Open as Web App” and get a browser bookmark instead — **even if the site is configured as a web app**. UI is the same regardless of manifest/`apple-mobile-web-app-capable`.

Safari 26.6 (27 Jul 2026) adds no Home Screen install-API changes (Wasm + SW registration cleanup only).

Apple `https://developer.apple.com/documentation/safariservices` returned **HTTP 422**. The fetched `SFSafariViewController` page is native in-app Safari, not Home Screen PWA install — not useful here. The still-relevant Apple archive is `Configuring Web Applications` (apple-touch-icon, `apple-mobile-web-app-capable`, `navigator.standalone`, startup image, title). Red Letter already has those meta tags and `apple-touch-icon.png`.

MDN still: iOS 16.4+ can Add to Home Screen from Safari, Chrome, Edge, Firefox, and Orion Share menus.

---

## 3. 7-day ITP storage eviction — is `persist()` + Home Screen still the documented mitigation?

**Short answer:** Home Screen remains the **explicit ITP exemption**. `persist()` is the **documented Storage API request**, and WebKit says it **grants persistence using heuristics such as “opened as a Home Screen Web App.”** No fetched 2025/2026 page retracts this pair. **[verified for Home Screen exemption; persist() grant heuristic is 2023 Storage Policy]**

### What the 7-day cap still is

Living WebKit policy (`https://webkit.org/tracking-prevention/` — fetched 2026-09-11; no last-updated stamp in the extract):

> ITP deletes all cookies created in JavaScript and all other script-writeable storage after **7 days of no user interaction** with the website.

Affected: IndexedDB, LocalStorage, Media keys, SessionStorage, Service Worker registrations and cache.

MDN Storage quotas page agrees: Safari proactively evicts script-created data after seven days of no click/tap when cross-site tracking prevention is on. Server-set cookies are exempt. **[verified]**

Original announcement: `https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/` (**24 Mar 2020**).

### Documented mitigations (still)

1. **Home Screen web app domain is exempt from the 7-day cap** **[verified, three WebKit pages]**
   - Tracking Prevention (current living doc): “The first-party domain of home screen web applications is exempt from ITP’s 7-day cap… ITP always skips that domain in its website data removal algorithm.” Home Screen storage is isolated from Safari.
   - `https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/` (**12 Nov 2020**): explicit first-party Home Screen exception so ITP always skips that domain.
   - March 2020 post: Home Screen apps are not Safari; they have their own days-of-use counter. “We do not expect the first-party in such a web application to have its website data deleted.”

2. **`navigator.storage.persist()`** — `https://webkit.org/blog/14403/updates-to-storage-policy/` (**10 Aug 2023**, Safari 17 / iOS 17):
   - Origins in persistent mode can be excluded from eviction.
   - WebKit “currently grants a request based on heuristics like whether the website is opened as a Home Screen Web App.”
   - Documented pattern: `persisted()` then `persist()` if not already granted.

MDN: Safari/Chromium auto-approve or deny `persist()` from interaction history; no user prompt. Persistent origins are skipped in **storage-pressure** eviction. MDN’s **proactive 7-day** paragraph does **not** independently repeat the persist() exemption — that exemption is stated on the WebKit Storage Policy + Tracking Prevention Home Screen pages.

**No fetched 2025 or 2026 WebKit post changes the 7-day cap or names a new mitigation.** Safari 26.0/26.6 notes are silent on ITP eviction.

### Red Letter implication

`app.js` already calls `persist()` and comments that it “protects against quota eviction, not the Safari-tab 7-day cap.” That matches the sources: **in a Safari tab, `persist()` is not documented as a reliable 7-day ITP waiver; Add to Home Screen (and actually opening as a web app) is.**

**Safari 26 gotcha:** if the user disables “Open as Web App,” they get a Safari bookmark, **not** a Home Screen web app. The ITP exemption is for Home Screen web applications. Journal / offline / SW cache can then still be wiped after 7 days of no Safari interaction. Keep the backup path. Encourage Add to Home Screen **with Open as Web App left on**.

---

## 4. 2026 gotchas for `start_url`, `scope`, `id`

No fetched 2026 spec rewrite. The gotchas below are current (MDN / Chrome / web.dev, last updated 2024) plus Safari 26 user-control.

### `id`

- Chrome 96+ uses explicit `id` as app identity so `start_url` / manifest path can change later (`https://developer.chrome.com/docs/capabilities/pwa-manifest-id`, last updated **2024-09-20 UTC**).
- If `id` is missing, Chrome synthesizes it from `start_url`. Changing `start_url` later can look like a **new app**.
- MDN `id`: resolved against **`start_url`’s origin** (not the manifest directory). `../foo`, `foo`, `/foo`, `./foo` all become the same origin-relative identifier. Fragments stripped; **query params kept**. Invalid/cross-origin `id` falls back to `start_url`. Recommended: leading `/`.
- web.dev weather sample uses `"id": "/?source=pwa"` **equal to** `start_url`.

**Red Letter:** `"id": "./"` resolves to the **origin root** (same family as `/` / `./`), **not** to `./?source=pwa`. That is good: identity is stable if you later change the `?source=pwa` launch query. Do **not** later change `id` to `/` vs `./` vs `/?source=pwa` without checking Chrome’s Computed App Id — a change can create a duplicate install. Keep `id` stable forever.

### `start_url`

- Required for Chromium installability **[verified]**.
- Relative values resolve against the **manifest URL** (MDN). Red Letter’s `./?source=pwa` is correct for a same-directory `manifest.json` (including GitHub Pages subpaths).
- **Hint, not a contract:** “Browsers have flexibility… and may not always use the specified value.” Users may also edit it.
- Must be **same-origin** with the page that links the manifest (and typically with the manifest). Off-origin `start_url` is ignored; install page is used instead.
- Must fall **inside `scope`**.
- Privacy: encoding user IDs in `start_url` is fingerprinting. A launcher flag like `?source=pwa` / `?launcher=homescreen` is explicitly called out as analytics-useful but fingerprint-adjacent. Red Letter’s `?source=pwa` matches the web.dev sample and is a static flag, not a user id — acceptable. Do not add user-specific tokens.

### `scope`

- Red Letter `"scope": "./"` is explicit and relative to the manifest — recommended vs relying on the fallback (start_url minus filename/query/fragment).
- Prefix **string** match, not path-segment match. MDN: prefer a scope that ends as a directory (`/prefix/`) so `/prefix-of/` does not accidentally match. `./` is the app directory; fine for a root or Pages project folder.
- Off-scope links stay in the PWA window with extra chrome (URL bar). web.dev: `target="_blank"` opens a browser/Custom Tab on Android.
- Safari 26 still uses scope for in-app vs default-browser navigations (WWDC25/26.0 text: manifest benefits still apply). Default scope if omitted is the host of the page used to create the web app (WWDC23-era Apple talk was not fetched; rely on MDN + WebKit “manifest benefits remain”).

### Safari 26 interaction with these fields

- Manifest is no longer required for standalone launch, but **if present, icons and other benefits are used**.
- User can refuse standalone even when `display`/`start_url` say otherwise.
- Isolated Home Screen storage vs Safari still matters for ITP (Tracking Prevention).

---

## Implications checklist for Red Letter

| Item | Status vs 2026 docs |
|---|---|
| Chrome install fields | Meet criteria. No file change required for the prompt. |
| 192/512 any + maskable | Matches Chromium recommendation. |
| Screenshots 1170×2532 + 1920×1080 | Both under 2.3:1 and in 320–3840. Narrow will drive Android richer UI; wide is desktop-only. |
| SW | Not required on current install-criteria page; keep the real fetch handler for offline. |
| `beforeinstallprompt` | Android/desktop Chromium only. Keep iOS Share-sheet copy. |
| `display_override` | Chromium-only; leave it. iOS uses `display` + apple meta. |
| 7-day ITP | Home Screen web app = documented exemption. `persist()` = grant heuristic when opened as that app. Tab visits still evict. Safari 26 “Open as Web App off” drops the exemption. Keep backup + persist(). |
| `start_url` `./?source=pwa` | Valid, in-scope, static analytics flag. Don’t personalize it. |
| `scope` `./` | Valid; keep explicit. |
| `id` `./` | Stable identity decoupled from `?source=pwa`. Do not change casually. |
| iOS 26 | Any site is addable; user can opt out of web-app mode. Manifest/icons still worth shipping. |

---

## URLs opened

Successful fetches:

1. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
2. https://web.dev/articles/install-criteria — last updated 2024-09-19 UTC
3. https://webkit.org/blog/ — index (STP 247–252, Safari 26.6, Interop 2027, etc.)
4. https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
5. https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ — dated 15 Sep 2025
6. https://webkit.org/blog/18178/webkit-features-for-safari-26-6/ — dated 27 Jul 2026
7. https://webkit.org/blog/14403/updates-to-storage-policy/ — 10 Aug 2023
8. https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/ — 12 Nov 2020
9. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ — 24 Mar 2020
10. https://webkit.org/tracking-prevention/
11. https://developer.chrome.com/blog/update-install-criteria — last updated 2023-12-05 UTC
12. https://developer.chrome.com/blog/richer-pwa-installation — last updated 2021-04-23 UTC
13. https://developer.chrome.com/blog/how_chrome_helps_users_install_the_apps_they_value — last updated 2024-07-23 UTC
14. https://developer.chrome.com/docs/capabilities/pwa-manifest-id — last updated 2024-09-20 UTC
15. https://web.dev/articles/add-manifest — last updated 2024-09-18 UTC
16. https://web.dev/learn/pwa/installation-prompt
17. https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
18. https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
19. https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
20. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display_override
21. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id
22. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/start_url
23. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/scope
24. https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/BeforeInstallPromptEvent.json
25. https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
26. https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller — opened; not useful for PWA install
27. https://caniuse.com/mdn-html_manifest_display_override — opened; support grid not present in extracted HTML

Failed / empty (do not treat as sources):

- https://developer.apple.com/documentation/safariservices — HTTP 422
- https://developer.apple.com/documentation/safariservices/supporting-desktop-class-browsing-in-your-app — HTTP 404
- https://web.dev/patterns/web-apps/richer-install-ui — HTTP 404 (screenshot rules taken from add-manifest instead)
- https://developer.chrome.com/blog/pwa-install-criteria — HTTP 404
- https://raw.githubusercontent.com/mdn/browser-compat-data/main/manifests/webapp.json — HTTP 404
