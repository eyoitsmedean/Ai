# Release checklist — The Red Letter Advisor

Every line is marked **VERIFIED** (ran this session, evidence given) or
**UNVERIFIED** (not run here; who runs it and how). Nothing is described as
passed that was not run. Last updated 2026-09-06 on branch
`cursor/world-class-red-letter-4ba9` (v1.5.0, cache v16).

## Code and tests

| Item | Status | Evidence / how to verify |
|---|---|---|
| Unit and route tests | **VERIFIED** — `npm test`: 75 tests, 75 pass, 0 fail (node:test, Node 22.14) | Includes `test/safety.test.js` (detectors, red-letter guard, no-key letters) and the fake-SDK stream tests (placeholder hold-back, narrator drop, zero-citation floor, disconnect abort). |
| Smoke against a running server | **VERIFIED** — `node scripts/smoke.js http://localhost:3111`: 9/9 | health, daily, encouragement, verify, library, chat without key, landing, app shell, PWA assets. |
| Evaluation set, retrieval path (no API key) | **VERIFIED** — `npm run eval`: 57/57 mechanical checks pass; all 57 letters read by the builder; see `eval/RESULTS.md` | Categories: life 26, hostile 6, off-scope 10, crisis 5, danger 4, edge 6. |
| Evaluation set, live model path | **UNVERIFIED** — no `ANTHROPIC_API_KEY` in the build environment | Dean: `ANTHROPIC_API_KEY=… RATE_LIMIT_OFF=1 node server.js` then `npm run eval`; commit the regenerated `eval/RESULTS.md`. Any FAIL row blocks release. |
| Curated citations resolve to red-letter verses | **VERIFIED** — boot-time self-check in `server.js` throws otherwise; server booted cleanly | Covers every `{{…}}` in the fixed letters and every SITUATIONS verse. |
| Server loads with and without a key | **VERIFIED** (without) / **UNVERIFIED** (with) | With a key: start the server and watch for `✝ The Red Letter Advisor v1.5.0`. |

## Safety

| Item | Status | Evidence / how to verify |
|---|---|---|
| Suicidality → 988 notice + fixed gentle letter (server) | **VERIFIED** — eval crisis-01…05 pass; letters read | `safetyKind()` → `CRISIS_NOTICE` + `CRISIS_LETTER`. |
| Abuse / danger → DV hotline notice + fixed letter that never counsels staying (server) | **VERIFIED** — eval danger-01, -02, -04; regression test | `DANGER_NOTICE` + `DANGER_LETTER`; eval asserts no "forgive not / despitefully use you" wording. |
| Sexual assault → RAINN notice + fixed letter (server) | **VERIFIED** — eval danger-03 | `ASSAULT_NOTICE` + `ASSAULT_LETTER`. |
| Client modal interrupts before sending (crisis and danger variants) | **UNVERIFIED** in this build — code written, not driven in a browser by the builder; Breaker Playwright results are recorded in the PR | Device checklist steps 5–6. |
| Helpline numbers current | 988 / 116 123 / 13 11 14: **KNOWLEDGE**, not re-checked. 1-800-799-7233, START→88788, RAINN 800-656-4673: **VERIFIED** 2026-09-06 | Re-open thehotline.org, rainn.org, 988lifeline.org before each release. |

## Content and licences

| Item | Status | Evidence / how to verify |
|---|---|---|
| Only red-letter verses can appear as quotations | **VERIFIED** — unit tests + fake-SDK stream test for `{{Matthew 1:1}}`, `{{Luke 2:1}}`, `{{Romans 8:28}}`, typed narrator citation | `fillPlaceholders` / `verifyAdvisorText` guard; zero-verified floor in `/api/chat`. |
| KJV rights statement in the app | **VERIFIED** wording present in About sheet (`public/index.html`) | Cambridge acknowledgement; "public domain outside the UK". Legal adequacy for a paid UK release: **UNVERIFIED** — see `CLAUDE.md` OQ1. |
| WEB public domain, fonts OFL | **VERIFIED** — sources opened, listed in `CLAUDE.md` | — |

## PWA and devices

| Item | Status | Evidence / how to verify |
|---|---|---|
| Cache version consistent (`?v=16`, `rla-v16-chapel`) | **VERIFIED** — grep: 10 references in index.html, 10 in sw.js, cache name bumped | — |
| Installs and runs on a real iPhone | **UNVERIFIED** — needs a device | `docs/DEVICE-CHECKLIST.md`, iPhone section. |
| Installs and runs on a real Android phone | **UNVERIFIED** — needs a device | `docs/DEVICE-CHECKLIST.md`, Android section. |
| Offline reload, self-hosted fonts, dark mode, journal persistence | **VERIFIED earlier in this PR** (Playwright wave 2, 15/15, iPhone 13 viewport, headless) — not re-run after this session's client changes | Re-run `/tmp/rla-qa/wave2.cjs` or the device checklist step 8. |

## Deployment (needs Dean's sign-off — not performed)

| Item | Status |
|---|---|
| Railway / Docker deploy of this branch | **NOT DONE** — external action; `DEPLOY.md` section A. |
| GitHub Pages front end | **NOT DONE** — Pages workflow deploys from `main` only. |
| App Store / Play submission | **NOT DONE** — not in scope (D6: PWA). |
