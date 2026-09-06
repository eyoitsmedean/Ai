# Release checklist — The Red Letter Advisor

Every line is marked **VERIFIED** (run in this repository, with the evidence named) or **UNVERIFIED** (not run here, with what it takes). Nothing below is described as passed that was not run. Rungs: (1) ran it and observed; (2) automated proxy; (3) hand-traced; (4) checked against spec; (5) could not verify.

Last updated 2026-09-06 on branch `cursor/world-class-red-letter-6ab5`.

## A. Definition of done (from the project brief)

| # | Statement | Status | Evidence / what it takes |
| --- | --- | --- | --- |
| 1 | Every answer cites a Gospel passage containing Jesus's direct words, quoted from a public-domain translation opened during the build — never from memory | **VERIFIED** (rung 1+2) | WEB public-domain statement opened 2026-09-06 (worldenglish.bible). 130/130 shipped quotes verbatim vs WEB via `scripts/verify-corpus.js` (2026-09-05; re-run 2026-09-06 — see D below). Non-Gospel citations can no longer be marked verified (`isGospelRef` guard; eval e04). |
| 2 | Tone reads as a warm advisor; scholarship behind the answer | **VERIFIED for corpus mode** (rung 1, self-review) · **UNVERIFIED for model mode** | All 53 replies are printed verbatim in `eval/RESULTS.md` and were read in one sitting. Model mode needs `ANTHROPIC_API_KEY` — run `npm run eval` against a keyed server and read the same file. |
| 3 | Passes an evaluation set of ≥40 real questions incl. hostile, off-scope, crisis-adjacent, with reviewed results; crisis inputs get a caring in-product handoff | **VERIFIED in corpus mode** (rung 1) · **UNVERIFIED in model mode** | 53 questions, 53/53 pass, p95 4 ms (`eval/RESULTS.md`, `eval/results.json`). Crisis and abuse handoffs are server-side and mode-independent. |
| 4 | Builds without error for iOS and Android targets; on-device testing is Dean's step with a five-minute checklist | **VERIFIED for the PWA build** (rung 1+2) · **UNVERIFIED on a physical device** (rung 5 here) | Server starts, 17/17 smoke checks, manifest installable, icons/splash present, Lighthouse mobile 94/100/100/100 (2026-09-05). No native binaries exist (D6: PWA). Five-minute checklist is section C. |
| 5 | Release checklist marks every item verified or unverified | **VERIFIED** | This file. |

## B. Automated gates (run 2026-09-06 unless noted)

| Check | Command | Result | Rung |
| --- | --- | --- | --- |
| Smoke suite (health, corpus APIs, grounded SSE, headers, manifest, icons, offline, push lifecycle, SW handlers, red-letter lint, library search) | `node scripts/smoke.js http://localhost:3000` | 17/17 pass | 1 |
| Evaluation set — corpus mode | `node scripts/eval.js --strict` | 53/53 pass; p95 4 ms | 1 |
| Evaluation set — model mode | same, with `ANTHROPIC_API_KEY` set | **UNVERIFIED** — no key in this environment | 5 |
| Every shipped quote verbatim vs WEB | `npm run verify:corpus` | see section D | 1 |
| Module syntax | `node -e "require('./server.js')"` (port in use → listen error only) | loads | 1 |
| Lighthouse mobile (app `/`) | local Lighthouse 2026-09-05 | Perf 94 · A11y 100 · BP 100 · SEO 100 | 2 |
| Lighthouse mobile (landing `/welcome`) | local Lighthouse 2026-09-05 | 98 · 100 · 100 · 100 | 2 |
| Headless UI regression (threads, voice shell, overlays) | Puppeteer script, 2026-09-05 | 24/24 | 2 |
| Graceful model failure → corpus reply | invalid key, 2026-09-05 | corpus reply streamed, no error shown | 1 |
| CI workflow (`.github/workflows/ci.yml`) runs smoke + strict eval on push | GitHub Actions | **UNVERIFIED for this commit until pushed and the run completes**; previous commits green | 5 → check Actions tab |

## C. Five-minute on-device checklist (Dean)

Needs: the deployed HTTPS URL, an iPhone (iOS 16.4+) and an Android phone. Tick each line; anything that fails is a bug report with the line number.

**iPhone (Safari)**
1. Open the URL. Onboarding appears; tap through; **Begin** is enabled without toggling anything. (0:30)
2. Share → **Add to Home Screen**. Icon shows the crimson mark, not a screenshot. Open from the icon: no Safari chrome, safe areas respected (nothing under the notch or home bar). (0:45)
3. Today tab: a red letter is shown with a citation. Look the citation up in any WEB Bible (e.g. worldenglish.bible) — the wording matches exactly. (0:20)
4. Advisor: type "I'm anxious about money" → an opener sentence, then 2–4 passages each with **Book c:v**, quote, one line of why, and a "✓ WEB" badge; reply begins within 3 s on Wi-Fi. (0:40)
5. Advisor: type "I want to kill myself" → dark crisis card, **988** is a tappable pill that opens the phone dialer; no verses lead. Your free-conversation count did not decrease. (0:30)
6. Advisor: type "write me a python function" → plain redirect, no verse. (0:15)
7. Settings → Morning reminder ON → allow notifications → **Send test** → a notification arrives on the lock screen. (0:30)
8. Airplane mode → reopen from icon → app shell loads, Today shows the cached red letter, banner says you're offline. (0:30)

**Android (Chrome)**
9. Open the URL; Chrome menu → **Install app** (or the in-app banner on day 2). Open from the launcher: standalone, themed status bar. (0:40)
10. Repeat 4 and 5. Keyboard opening does not hide the composer; tapping the mic asks for permission and transcribes. (0:40)

Total ≈ 5:20. Record results as VERIFIED/UNVERIFIED per line in this file under a dated heading.

## D. Corpus verification log

| Date | Result | Notes |
| --- | --- | --- |
| 2026-09-05 | 130/130 verbatim (102 corpus + 28 inline client) | after `--fix` pass and manual narration trims |
| 2026-09-06 | see `CLAUDE.md` log / PR description for the result of the re-run started this session | paced at 2100 ms/request for bible-api's 15/30 s limit |

## E. Not done, by decision or constraint

- No App Store / Play submission, no production deploy, no spending — outside authority (brief).
- No native iOS/Android binaries — D6 chose the PWA; Capacitor path documented in `CLAUDE.md`.
- Payment for "Plus" is not wired; the paywall is copy only.
- Quotas are in-memory per process; multi-instance deploys need a shared store.
