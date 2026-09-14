# Dossier — PWA on iPhone and Android

**Topic:** Add to Home Screen, Web Push, static vs Node hosting  
**Bearing:** C5  
**Why it matters:** Prompt #15 asked for both phones. Store listing is unauthorized.

## Foundations
`beforeinstallprompt` is not a Safari iOS feature (Can I use, prior cycle). iOS 26 User Guide: Share → Add to Home Screen; Open as Web App; compact Safari may hide Share behind ⋯ More. **SOURCE-REPORTED** (KNOWLEDGE 2026-09-11). Not re-fetched this session.

Web Push for Home Screen web apps: iOS/iPadOS 16.4+ (WebKit 16 Feb 2023). User gesture; show notifications or permission can be revoked. **VERIFIED** prior cycle (webkit.org).

GitHub Pages can host `public/` only. Chat and the safety gate need `server.js`. **VERIFIED** by reading `.github/workflows/pages.yml`.

## Frontier
TWA / Play listing wraps the same `public/` (Capacitor option B). Assetlinks stub is not a listing.

## Live controversies
Whether a PWA “counts” as an app in church marketing. YouVersion’s “web doesn’t count” culture is a taste signal, not a technical limit.

## Methods and limits
This environment cannot run RELEASE §C on glass. Claiming iPhone-ready without Dean’s ticks is a C7 failure.

## What the top 1% know
Ask for install *after* the first useful answer. Never request push in a Safari *tab*. A static host that 404s `/api/chat` is a safety hole if someone bookmarks it as “the app.”

## Hardest objections
1. Just ship Capacitor — *answer:* D6; needs Xcode on Dean’s machine and store spend.  
2. Pages is free HTTPS — *answer:* it is a demo shell, now labeled.  
3. Illustrated install sheet is enough — *answer:* still need HTTPS + §C.

## Implications (changed)
Workflow warning comment. Share landing is server-rendered (will not exist on Pages). Operator kit unchanged: Dean deploys Node.

## Depth
D3. Blocker for D4: no physical devices; iOS 26 guide not re-opened today.

**Sources:** `docs/KNOWLEDGE.md` A1/A5; WebKit blog (prior VERIFIED); pages.yml this session.
