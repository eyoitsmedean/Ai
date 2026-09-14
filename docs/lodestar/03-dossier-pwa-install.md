# Topic Dossier — PWA install and Safari storage (2026)
**Bearing:** C4 · **Depth:** D4 on ITP + Home Screen; Chromium install criteria last updated 2024 on fetched pages  
**Why it matters:** Production-ready on iPhone and Android is the original “done.”

## Foundations
Chromium installability (web.dev install-criteria, last updated 2024-09-19, fetched 2026-09-11): HTTPS, name, 192+512 icons, start_url, display standalone. `beforeinstallprompt` is Chromium-only. **SOURCE-REPORTED** via `docs/research/pwa.md`.

## Frontier
Safari 26 / iOS 26 (WebKit posts 2025-09-15, recorded 2026-09-11): **any site** can be added to the Home Screen and open as a web app; manifest/SW not required for standalone launch. User can turn **Open as Web App** off and get a Safari bookmark. **SOURCE-REPORTED** via that research file.

## Live controversies
Is `persist()` enough for journal survival? **No, in a Safari tab.** WebKit Tracking Prevention (opened **this session**): ITP deletes script-writable storage after **7 days** of no interaction. **Home Screen web application domains are exempt**; their storage is isolated from Safari.

## Methods and limits
Primary: WebKit living policy. Secondary: MDN, Chrome blogs. No physical iPhone in this environment.

## What the top 1% know
`persist()` is a storage-pressure heuristic (Safari 17 Storage Policy, 2023). The **documented 7-day waiver** is Home Screen, not `persist()` in a tab. If the user disables Open as Web App, they lose the exemption. Teaching that is the install-sheet job.

## Hardest objections
1. *Just ship Capacitor.* — D6 / OQ3: PWA first. Capacitor is later.
2. *Safari 26 made install trivial, so skip education.* — Trivial add ≠ understood isolation. The 7-day trap got worse because adding is easy and “Open as Web App” is a hidden toggle.
3. *Screenshots/manifest will get us an iOS prompt.* — iOS has no `beforeinstallprompt`. Instructional UI stays.

## Implications
- Install sheet now names Safari 26, Open as Web App, and the 7-day tab cleanup.
- `persist()` already called; comment already honest.

## Claim ledger
| Claim | Status | Source |
|---|---|---|
| 7-day cap on JS storage | **VERIFIED** | webkit.org/tracking-prevention 2026-09-14 |
| Home Screen domain exempt | **VERIFIED** | same page, heading “Home Screen Web Application Domain Exempt From ITP” |
| iOS has no beforeinstallprompt | **SOURCE-REPORTED** | docs/research/pwa.md → MDN BCD 2026-09-11 |
| Safari 26 zero install requirements | **SOURCE-REPORTED** | docs/research/pwa.md → WebKit 26.0 notes |

## Sources
https://webkit.org/tracking-prevention/ (2026-09-14). `docs/research/pwa.md`.

## Depth and blockers
D4 on ITP exemption. Device confirmation **UNRESOLVED** (no iPhone here).
