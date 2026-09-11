# Release checklist — Red Letter Advisor

Every row is **verified** or **unverified**. Nothing here is “passed” unless the command or device check actually ran.

Owner: Dean. Branch: `cursor/add-gpt-6-astra-model-0ebd`. Written 2026-09-11.

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Every printed Advisor verse is a Gospel saying, substituted from the KJV corpus — never typed from model memory | **verified** (offline path) | `npm run eval` 2026-09-11: 61/61 `verses-verified` and `gospels-only`. Live model letters: **unverified** (no API key in this environment). |
| 2 | Tone is advisor-first; scholarship is behind the letter | **unverified** (live) · **reviewed** (offline 8 letters) | Live `eval/letters/` not generated (no key). Offline pack scored 2026-09-11 in `eval/OFFLINE_REVIEW.md`. Openings are warm only when a need is recognized. |
| 3 | Eval set ≥ 40 including hostile, off-scope, crisis, near-miss; crisis gets a human-help handoff | **verified** | 61 questions in `eval/questions.json`. Offline 2026-09-11: 61/61. Crisis notice first on all 13 crisis items. |
| 4 | Builds for iOS and Android targets | **unverified** | `capacitor.config.json` is in the repo (`webDir`: `public`). `npx cap add` / Xcode / Gradle / on-device: not run here. Use `DEVICE_CHECKLIST.md`. |
| 5 | On-device five-minute check | **unverified** | Dean’s step. Checklist is written; no phone was opened in this environment. |
| 6 | Crisis regex matches “suicidal” / “suicide” and stays quiet on grief hyperbole | **verified** | `npm test` — `test/crisis.test.js`. |
| 7 | Retrieval places an expected saying for each labelled eval question | **verified** | `npm run eval` retrieval 61/61; held-out `test/heldout-retrieve.json` @8. |
| 8 | Offline Advisor letter cites sayings retrieved for *this* message | **verified** | `test/letter.test.js` + `/api/chat` without a key. |
| 9 | Narrator wrappers stripped from printed speech (lookup) | **verified** | `test/scripture.test.js` plus new frame cases. Seek library.json still groups raw spoken verses — **partial**. |
| 10 | Node 22 CI | **unverified** on this commit until Actions runs | Prior commits on this PR were green on Node 22. |
| 11 | Real `gpt-6-astra` or Claude call | **unverified** | No key. Mock Responses API was used earlier on this branch (rung 2). |
| 12 | Production deploy / store listing | **unverified** | Not authorized. |

## How to flip unverified rows

```bash
npm test
npm run eval          # add ANTHROPIC_API_KEY or MODEL=gpt-6-astra OPENAI_API_KEY for live letters
npx @capacitor/cli@latest sync
# then DEVICE_CHECKLIST.md on a phone
```
