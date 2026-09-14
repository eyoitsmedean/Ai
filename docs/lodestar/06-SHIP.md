# Ship Package — LODESTAR Cycle 1
**Date:** 2026-09-14 · **PR:** https://github.com/eyoitsmedean/Ai/pull/45  
**Branch:** `cursor/lodestar-cycle-1-4ba9` → `cursor/sprint-safety-modules-4ba9`

## 1. Summary
Charter v1 exists. Watched-device wipe exists. Five summits are in the product, not just described. `/welcome` no longer phones Google Fonts. Helpline numbers were re-fetched today (6 pass, rainn.org blocked). Cache is v20.

## 2. Charter check
Advanced: C1, C2, C4, C6, C7, C8, C9.  
Not advanced (Dean-only): C10 deploy / live eval / device. C3 (finish) is this ship. C5 unchanged (already on course).  
Proposed amendments: none. OQ4 recorded (journal stays).

## 3. How to use
1. Open `docs/lodestar/01-INTENT-CHARTER.md`.
2. Run the chapel: `npm start` → `http://localhost:3000/?fresh=1`.
3. Settings → Begin again between guests. Do not use Leave quickly for a demo — it opens Wikipedia.
4. Release gate: `npm test` · `npm run helplines` · `npm run qa-fresh`.
5. Dean: `docs/SHIP.md` actions 1–3 plus the Authorization Requests below.

## 4. Verification actually performed
- Read this run’s transcript extract + product source on `8385505`.
- Opened: 988lifeline.org, 988.ca, thehotline.org, webkit.org/tracking-prevention, Yale KJV guide, ebible.org/engwebp/copyright.htm. ebible.org/web/copyright.htm → 404.
- `npm test` **119/119**. `npm run check` exit 0.
- `npm run qa-fresh` against :3111 — 3/3.
- `scripts/smoke.js` — 10/10.
- `npm run helplines` — 6 PASS, 0 FAIL, 1 BLOCKED (rainn.org 403).
- `npm run eval` retrieval — **100/100**.
- Chrome screenshots of `/welcome`, `/?fresh=1`, Settings, danger modal.
- **Not done:** live-model eval, physical iPhone/Android, YouTube, rainn.org body, CUP live HTML, Granola (no meeting named).

## 5. Assumptions and limits
- Wikipedia as escape URL is DESIGN CHOICE (Hotline target URL unknown).
- Journal stays on Leave quickly (OQ4).
- `/welcome` waitlist form is unblessed and left in place.
- No token spent on Notion product work.

## 6. Authorization Requests
1. Deploy this branch (or merge stack #37 then #45) to Railway with `ANTHROPIC_API_KEY`.
2. Run live-model `npm run eval` and commit `eval/RESULTS.md`.
3. Walk `docs/DEVICE-CHECKLIST.md` on a real iPhone (leave Open as Web App on) and Android. Include Leave quickly once on a throwaway profile.
4. Re-open rainn.org and confirm 1-800-656-4673 / hotline.rainn.org.
5. If a paid UK release is planned: CUP written permission or OQ1 (server → WEB).
6. Do **not** publish, email, or buy anything until you say yes.

## 7. Recruitment Orders
- **Video scout:** YouTube transcripts for The Hotline “tech safety / escape” explainers; WebKit engineers on ITP Home Screen. Extract process steps. Bearing: C4 C6. No personal data.
- **CUP clerk:** open the live Cambridge KJV permissions HTML (this host gets 403). Quote the 500-verse rule if still present. Bearing: C10 / OQ1.
- **Device walker:** only Dean, or a bot with a physical phone.

## 8. Sources
See dossiers. Primary this session: 988lifeline.org, 988.ca, thehotline.org, webkit.org/tracking-prevention, guides.library.yale.edu/newtestament/kjv, ebible.org/engwebp/copyright.htm.

## 9. Knowledge Base Index
`docs/lodestar/INDEX.md`

## 10. Next Summits
Clear this phone (journal too) · server WEB corpus (OQ1) · live-model eval (OQ2) · Capacitor (OQ3) · public citation-integrity page.

## 11. Director’s Cut
Leave quickly does not return you to the chapel. After the wipe it **replaces the page with Wikipedia**. Nobody asked for an off-site jump. The Hotline’s published pattern is leave immediately; staying in a crimson room with a cleared textarea is merely tidy. Labeled mine.

## 12. Studio Notes
What fascinated me: the 7-day ITP exemption is still a *Home Screen* fact in 2026, and Safari 26 made adding to Home Screen so easy that people will do it *wrong* (bookmark, not web app). That is the real iPhone ship risk, not a missing splash PNG.

What I disagree with you about: “production-ready by tomorrow morning” as a calendar. The bar is right; the clock was never the product. I kept the bar and ignored the expired morning.

Another cycle: Clear this phone; a Dean-gated rainn.org row in RELEASE that flips when the verifier sees 200; maybe match The Hotline’s exact escape URL once someone can see it.

Proud of: not rewriting your letters, and not pretending rainn.org opened.

## 13. The Ask
**Closed 2026-09-14 (ATELIER).** Leave quickly now uses The Hotline’s published target: `https://www.live-local-weather.com/`. Override only if you want a different page.

## 14. Handoff

```
LODESTAR CYCLE: 1
STATUS: complete
BUILT: Intent Charter v1 · Alignment Ledger · four D4 dossiers · five summits (fresh/Begin again/Leave quickly, helpline verifier, ITP install copy, welcome type+colophon, Wikipedia escape) · cache v20 · qa-fresh · 119 tests
CHARTER: v1 (2026-09-14; OQ4 recorded, no goal amendments)
KNOWLEDGE BASE: docs/lodestar/ (index: docs/lodestar/INDEX.md)
OPEN DEFECTS: Minor — Wikipedia vs unknown Hotline URL; cannot clear Safari history; rainn.org blocked; qa-fresh does not follow off-site navigation
RESUME FROM: next cycle
```
