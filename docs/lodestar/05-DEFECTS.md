# Defect Register — LODESTAR Cycle 1

**Pass:** SELF-REVIEW (Navigator, separate from the build pass)  
**Date:** 2026-09-14  
**Bearing:** C7

| Sev | Location | Evidence | Fix |
| --- | --- | --- | --- |
| Major | `eval/questions.json` | Two items used id `c21`. Eval ran both; ids must be unique. | Renamed the new crisis-after-thread item to `c22`. |
| Major | `server.js` model path | Thread theme was applied only in `streamCorpusReply`. With a key, follow-ups would ignore S1. | Model messages now get a stay-with-refs note; `continuedTheme` is on the done event. **Model path still UNVERIFIED** (no key). |
| Minor | `scripts/eval.js` | First eval run this session hit leftover `:3000` because argv URL was ignored. | Eval now accepts a `http://` argv as BASE. |
| Minor | `/share` OG image | Page uses static `og-image.png`, not a per-verse render. | Listed as Next Summit. No fake unique image. |
| Minor | 3-hour human notice | Timer exists; ui-check does not wait 3 hours. `showHumanNotice()` is callable. | Documented. Not claimed VERIFIED as timed. |
| Cosmetic | `p02` missing | Historical hole (p01 → c21 → p03). | Held. Not invented. |

## Retest
- `npm run test:unit` — 20/20  
- `node scripts/smoke.js http://127.0.0.1:3010` — 18/18  
- `BASE_URL=http://127.0.0.1:3010 node scripts/eval.js --strict` — 96/96 after the id rename (re-run after this repair)  
- `PUPPETEER_DIR=/tmp/rla-qa CHROME_PATH=/usr/bin/google-chrome node scripts/ui-check.js http://127.0.0.1:3010` — 32/32  

## Integrity
No model-mode run. No physical iPhone/Android. No YouTube transcripts. Founding transcript was read. WEB legal pages and NY Art. 47 sources were searched this session; §1700 full text fetch timed out.
