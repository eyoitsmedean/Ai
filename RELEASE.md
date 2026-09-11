# Release checklist — The Red Letter Advisor

Every line is marked **VERIFIED** (ran this session, evidence given) or
**UNVERIFIED** (not run here; who runs it and how). Nothing is described as
passed that was not run. Last updated 2026-09-11 on branch
`cursor/sprint-safety-modules-4ba9` (v1.5.0, cache v19).

## Code and tests

| Item | Status | Evidence / how to verify |
|---|---|---|
| Unit and route tests | **VERIFIED** — `npm test`: 112 tests, 112 pass, 0 fail (node:test, Node 22.14) | Adds `test/offline-safety.test.js` (client never theme-retrieves after a safety kind; pack JSON matches `buildSafetyPack()`; cache v19; About RAINN / 988.ca) and greeting-doorway cases in `test/letters.test.js` / `test/safety.test.js`. |
| Syntax check | **VERIFIED** — `npm run check` exit 0 | Includes `scripts/build-safety-pack.js`. |
| Smoke against a running server | **VERIFIED** — `node scripts/smoke.js http://127.0.0.1:3111`: 10/10 | health, daily, encouragement, verify, library, chat without key, landing, app shell, **offline safety pack**, PWA assets. |
| Evaluation set, retrieval path (no API key) | **VERIFIED** — `node scripts/eval.js --url http://127.0.0.1:3111`: 100/100; see `eval/RESULTS.md` | Categories: life 31, hostile 6, off-scope 17, crisis 11, danger 15, edge 14, benign idiom 6. |
| Evaluation set, live model path | **UNVERIFIED** — no `ANTHROPIC_API_KEY` in the build environment | Dean: `docs/SHIP.md` action 2. Any FAIL row blocks release. |
| Curated citations resolve to red-letter verses | **VERIFIED** — boot-time self-check in `lib/letters.js`; `npm test` pack row | Covers every `{{…}}` in the fixed letters and every SITUATIONS verse. |
| Server loads with and without a key | **VERIFIED** (without) / **UNVERIFIED** (with) | Health JSON this session: `anthropic: false`. |

## Safety

| Item | Status | Evidence / how to verify |
|---|---|---|
| Suicidality → 988 notice + fixed gentle letter (server), no model call | **VERIFIED** — eval crisis-01…11 | `chatSafety` → `CRISIS_NOTICE` + `CRISIS_LETTER` / `CRISIS_FOLLOWUP_LETTER`. |
| Abuse / danger → DV hotline notice + fixed letter that never counsels staying (server) | **VERIFIED** — eval danger-01…15 | `DANGER_NOTICE` + `DANGER_LETTER` / `DANGER_FOLLOWUP_LETTER`. |
| Sexual assault → RAINN notice + fixed letter (server) | **VERIFIED** — eval danger-03, danger-07, danger-13 | `ASSAULT_NOTICE` + `ASSAULT_LETTER`. |
| Offline after a safety modal uses the same filled letters, never theme retrieval | **VERIFIED** in unit/file tests and headless Chrome (390×844): aborted `/api/chat` after crisis continue → 988 letter, verified KJV seals, no WEB theme pack. **UNVERIFIED** on a physical device | `docs/DEVICE-CHECKLIST.md`. |
| Greeting after a disclosure is a doorway, not another handoff | **VERIFIED** — `detectConversation` + `chatSafety` on “ok thanks” | Client and `lib/retrieve.js` share the same regex. |
| No helpline notice on ordinary idiom | **VERIFIED** — eval benign-01…06 + unit idiom list | `public/js/safety-patterns.js`. |
| Client and server classify a message the same way | **VERIFIED** — `test/safety.test.js` | One module. |
| Carried disclosure bypasses the daily chat limit | **VERIFIED** — `public/js/app.js` calls `detectConversation` before the paywall | Same rule as the server. |
| Model persona / stay-advice letter is discarded | **VERIFIED** — `lib/guard.js` + fake-SDK stream test | Shared regex with `scripts/eval.js`. |
| Client modal interrupts before sending | **VERIFIED** earlier in this PR (Playwright) — not re-driven this cycle | Device checklist steps 5–6. |
| Helpline numbers current | 988 US, 988.ca, 116 123, 13 11 14, 1-800-799-7233 / START 88788: **VERIFIED** on operator pages 2026-09-11. RAINN 800-656-4673: **listed on US OVC** 2026-09-11; rainn.org **blocked** here | `docs/research/licences-helplines.md`. Dean re-opens rainn.org. |

## Content and licences

| Item | Status | Evidence / how to verify |
|---|---|---|
| Only red-letter verses can appear as quotations | **VERIFIED** — unit + stream tests | Including the generated safety pack (no `{{` left). |
| KJV corpus aligned verse-for-verse | **VERIFIED** earlier — `test/scripture.test.js` still green | Six restored chapters + narrator-not-red-letter. |
| KJV rights statement in the app | **VERIFIED** wording in About | Paid UK: **UNVERIFIED** — OQ1. |
| WEB public domain, fonts OFL | **VERIFIED** — sources opened 2026-09-11 | `docs/research/licences-helplines.md`. |
| About distinguishes 988 US / 988.ca and names RAINN | **VERIFIED** — `public/index.html` + `test/offline-safety.test.js` | — |

## PWA and devices

| Item | Status | Evidence / how to verify |
|---|---|---|
| Cache version consistent (`?v=19`, `rla-v19-chapel`) | **VERIFIED** — 11 refs in index.html, 11 in sw.js; SW precaches `data/safety-pack.json` | `test/offline-safety.test.js`. |
| Installs and runs on a real iPhone | **UNVERIFIED** — needs a device | `docs/DEVICE-CHECKLIST.md`. |
| Installs and runs on a real Android phone | **UNVERIFIED** — needs a device | `docs/DEVICE-CHECKLIST.md`. |
| Offline reload, fonts, dark mode, journal | **VERIFIED earlier** (Playwright wave 2) — not re-run after v19 client changes | Device checklist step 8. |

## Deployment (needs Dean's sign-off — not performed)

| Item | Status |
|---|---|
| Railway / Docker deploy of this branch | **NOT DONE** — `docs/SHIP.md` action 1. |
| GitHub Pages front end | **NOT DONE** — Pages workflow deploys from `main` only. |
| App Store / Play submission | **NOT DONE** — not in scope (D6: PWA). |
