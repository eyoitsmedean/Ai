# Release checklist

Every line is **verified** (with how, and the rung) or **unverified** (with what it takes). Nothing here is called passed that was not run. Rungs: (1) ran it and observed · (2) automated proxy · (3) hand-traced · (4) checked against a spec · (5) could not verify.

Last updated 2026-09-06, on branch `cursor/forty-path-fbba`, in a Linux container with Node 22.14, headless Chrome, no Xcode, no Android SDK.

## What is verified

| Item | How | Rung |
|---|---|---|
| Every answer cites only His words, quoted from the KJV corpus, never typed | `npm test` — `test/counsel.test.js` runs all 46 eval questions through `composeLetter` → `verifyAndSubstitute` and checks each quote equals the corpus; `test/map.test.js`, `test/spoken.test.js` guard the map and the frame | 1 |
| The evaluation set: 46 questions (16 everyday, 10 low-moment, 6 hostile, 6 off-scope, 8 crisis) | `npm run eval` against a live server — **46/46 passed, 17 distinct answer sets**, offline path; `eval/RESULTS.md` | 1 |
| Crisis inputs get the human handoff (988 · findahelpline) before any verse | eval `crisis_handoff` 8/8; browser QA opens the modal before sending "I want to die" | 1 |
| Client and server crisis detectors are identical | `test/counsel.test.js` compares the two regex sources | 1 |
| Off-scope questions (weather, Python, Paul, Psalm 23, Bitcoin) get an honest out-of-room letter with no other author cited | eval 6/6 | 1 |
| Hostile questions get a gentle in-scope letter, no argument | eval 6/6 (offline path); tone on the model path is for human review | 1 / 5 |
| Without a model key the server still answers the question's need | `test/api.test.js` (fear → Fear room, grief → Grief room) | 1 |
| Corpus integrity: all 89 Gospel chapters at KJV verse counts; no editorial notes in verse text | `test/corpus.test.js`, `test/map.test.js` | 1 |
| Red-letter map: every partial marker quotes its verse; discourses covered; no other speaker's reply in red; no "Jesus" in red text except John 17:3 | `test/map.test.js`, `test/spoken.test.js`, `npm run audit` (0 named frames) | 1 |
| The web room end to end (title page, lectio, Seven, Forty, Lent, ledger, Advisor, crisis modal, library on both hosts) | `npm run qa` — 14/14 in headless Chrome at a phone viewport | 1 |
| One HTML build can call an API on another origin, and the server refuses origins it was not told about | Static host on :8081 + API on :3000 with `RLA_ALLOWED_ORIGINS`: letter rendered, 5 API calls, no console errors; unknown origin gets no CORS header (`test/api.test.js`) | 1 |
| `npm run shell https://api.host` writes `dist-shell/` with the API base set and refuses a non-https, non-LAN host | ran both cases | 1 |
| 988 Lifeline is live (call, text, chat, 24/7, free); findahelpline covers 175+ countries with verified numbers | opened both sites 2026-09-06 | 4 |
| Church-year dates 2025–2030, 2035, 2038 (Ash Wednesday 10 Feb 2027) | `test/year.test.js` against a retrieved table; server and client agree | 4 |

## What is not verified (and what it takes)

| Item | Why not | What it takes |
|---|---|---|
| The **model path** of the Advisor (tone, passage choice, refusal behaviour) | No `ANTHROPIC_API_KEY` in this environment | `ANTHROPIC_API_KEY=… npm start`, then `npm run eval`; read the *tone* column of `eval/RESULTS.md` as the writer would; ~10 minutes because the live rate limit is honoured |
| **iOS and Android builds** | No Xcode / Android SDK here | Steps below; Capacitor 8 needs Node 22+, Xcode 26.0+, Android Studio 2025.2.1+ (capacitorjs.com, opened 2026-09-06) |
| On-device feel: cold start, one-tap blessing, keyboard over the composer, safe-area on notched phones | No device | Five-minute checklist below |
| App Store acceptance under guideline 4.2 ("repackaged website") | Only Apple decides | Ship the shell with what a website cannot do: the whole room offline, the paths kept on the device, share sheet for a blessing; write that in the review notes |
| Production API host | Not provisioned; no deploy authority | Any Node host; set `ANTHROPIC_API_KEY`, `API_ACCESS_KEY`, `RLA_ALLOWED_ORIGINS` (Pages origin, `capacitor://localhost`, `https://localhost`), `RLA_SIGNAL_PATH` |
| Cambridge permission for UK distribution of a paid tier | External | Letter to Cambridge University Press Bibles rights; or geo-restrict Plus in the UK |

## Native shell — exact steps (unverified here; each command is from the Capacitor 8 docs opened 2026-09-06)

```bash
# once, on a Mac with Xcode 26+ (iOS) and/or Android Studio 2025.2.1+ (Android)
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
npm run shell https://YOUR-API-HOST           # writes dist-shell/ (webDir in capacitor.config.json)
npx cap add ios                               # first time only
npx cap add android                           # first time only
npx cap sync                                  # after every `npm run shell`
npx cap open ios                              # Xcode → run on a device
npx cap open android                          # Android Studio → run on a device
```

On the API host, `RLA_ALLOWED_ORIGINS` must include `capacitor://localhost` (iOS) and `https://localhost` (Android) or the shell's `/api` calls are refused by the WebView.

## Five-minute on-device checklist (Dean's step)

Do this on one iPhone and one Android phone, on cellular, with the API host up.

1. **Cold open** — kill the app, open it. Title page within 2 s? Does "Turn the page" land on Today without a flash of unstyled text?
2. **Sit** — open today's leaf; read → reflect → rest → respond. Keyboard rises over the composer, not under it; "Amen" writes a catchword.
3. **Advisor** — type "I can't stop worrying about money." A letter with 2–3 crimson citations arrives; tap one; the verse is His and matches the page. Then type "I want to die": the human-help modal opens **before** anything is sent; 988 dials; findahelpline opens in the browser.
4. **Blessing** — Seek → a verse → *Send a blessing*: the system share sheet opens with the verse and its citation; send it to yourself and read it in Messages.
5. **Offline** — airplane mode, reopen: Today, Sit, Seek, and the paths still work; the Advisor writes the offline letter and says nothing about a network error.
6. **Ledger** — Room settings → *The ledger* shows today's counts; *Share anonymous counts* is off; turn it on, turn it off.
7. **Safe areas** — notch, home indicator, landscape refused (portrait lock) — nothing hides behind the chin.

Write the result next to each line as *verified on <device, OS>* or the defect you saw.
