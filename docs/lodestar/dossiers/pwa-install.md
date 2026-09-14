# Topic Dossier — PWA / production host

**Bearing.** C5, C9  
**Why it matters.** The phone in a pocket is the product.

## Foundations

web.dev install-criteria (**VERIFIED**, last updated 2024-09-19): HTTPS, manifest name, 192+512 icons, start_url, display standalone/fullscreen/minimal-ui, engagement heuristic for Chrome `beforeinstallprompt`. GitHub Pages (**VERIFIED**): github.io sites after 2016-06-15 are HTTPS automatically.

Safari 26 (**VERIFIED** WebKit blog): every Home Screen site opens as a web app by default; “zero requirements for installability.” `beforeinstallprompt` is not documented as shipping; WebKit Bugzilla 255716 (2023) said Safari has no UA install event.

## Frontier

A2HS on iOS 26 *increases* app-likeness (and companion-law optics) without giving us a programmatic install prompt. Offline: cache-first for static; API returns `{offline:true}`.

## Live controversies

PWA vs store wrapper. Settled: PWA is the mobile build. Flutter lives on other branches.

## Methods and limits

Service worker `rla-v19`. Precache now leads with `help.html`. **Limit:** `new Notification()` is not a morning ping after you leave. No Web Push.

## What the top 1% know

iPhone will never fire our in-page install button. Airplane Mode is the real offline test. A cached crisis card that needs the composer is not a crisis card.

## Hardest objections

1. *Ship to the store.* Answer: Dean’s. Capacitor wraps `public/` if needed.  
2. *Promise a reminder.* Answer: we cannot honestly.

## Implications (what changed)

SW cache bump; help + atlas precached; help first. No install-prompt change on iOS (would be theater).

## Claim ledger

| Claim | Status | Source |
| --- | --- | --- |
| github.io is HTTPS by default | VERIFIED | docs.github.com 2026-09-14 |
| iOS 26 A2HS opens as web app, no BIP | VERIFIED | webkit.org/blog/17333 |

## Sources

web.dev; WebKit 26.0 blog; GitHub Pages HTTPS doc; adjacent-02.  
**Depth.** D4 for install/offline. Push/notifications stopped at D2 (not in Charter).
