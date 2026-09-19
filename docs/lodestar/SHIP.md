# Ship Package — LODESTAR Cycle 1

**Date:** 2026-09-14  
**Navigator:** this session  
**PR:** https://github.com/eyoitsmedean/Ai/pull/18  
**Run:** https://cursor.com/agents/bc-9d879086-030e-42d8-9728-b1e611e98634

---

## 1. Summary

`/ask` is still the product. This cycle gave it a stop-vs-cite eval, kind-accurate crisis voices (including mixed IPV + ideation, and short Spanish), a household phone-review note, a text-choice scratch pad, and a printable leaf of His speech. Nothing was published.

**Follow-up 2026-09-14:** folio crisis, concern, loss, and abuse letters now stop. Eval encodes `cite: false` on those paths. Folio soft-crisis still cites.

## 2. Charter check

| Goal | Advanced? |
| --- | --- |
| C1 Reviewable object | Yes — `/ask`, `/letter`, eval:ask |
| C2 Truth / His speech | Yes — letter 404 on Luke 2:14; seal unchanged |
| C3 One screen | Yes — still `/ask`; eval encodes it |
| C4 Crisis stop | Yes on `/ask` (repaired mixed + short Spanish). **No** on folio (held) |
| C5 No publish | Yes — WATCH; phone kit is LAN |
| C6 Keep shipping | Yes |
| C7 WEB/KJV record | Partial — `/gate` is a pad, not CANON |
| C8 Folio is paper | Yes — `/letter` leaf; folio stays atelier |

**Proposed amendments:** none. C7 stays “Dean records”; `/gate` is not that record.

## 3. How to use

1. Open **`docs/lodestar/01-CHARTER.md`**.  
2. `npm start` → **`http://localhost:3000/ask`**. Sit with a tired line, a crisis line, an abuse line.  
3. Optional: `/gate` (scratch pad), `/letter` (print one saying), `docs/lodestar/PHONE-REVIEW.md` (same-Wi-Fi phone).  
4. Knowledge base: `docs/lodestar/00-INDEX.md`.  
5. Do **not** treat `/` as the product. The atelier is paper. Crisis letters there now stop the same way `/ask` does.

## 4. Verification actually performed

**Did:**

- Read this run’s transcript via Archaeologist subagent (2,449 messages; first 13 human prompts as listed in CANON/Charter). Navigator did not read the JSON.
- Wrote Charter, Alignment, Census, dossiers (crisis, text-rights, jesus-speech D3), five summit briefs.
- `npm test` — **78 pass / 0 fail** (2026-09-14, after repair).
- `npm run eval:ask` — **13/13**.
- `npm run eval` — **82/82** folio (curated, no key).
- Skeptic subagent re-opened 988 Get Help, 988 help-someone-else, Yale KJV guide, dead Yale URL (404), Wikipedia KJV Permission, eBible MAT11, Idaho T48CH22 + S1297E1, thehotline.org. rainn.org 403. Cambridge 403/503.
- Navigator re-opened 988 talk-to-someone-now (AYUDA / then 2).
- Live curl on `http://127.0.0.1:3848`: `/ask` 200 (0 Google Fonts); crisis stop; mixed → `abuseCrisis` with NDVH+988; `quiero morir` → `spanishCrisis`+AYUDA; tired → sealed John 16:33; `/gate` 200; `/api/letter` Matthew 11:28 200; Luke 2:14 404.
- `npm run qa -- http://127.0.0.1:3848` — **17 walks pass** (2026-09-14).
- Browser (computerUse) on 3848: tired counsel; crisis stop; mixed IPV+ideation shows NDVH **and** 988 (first walk failed because priorStop kept crisis — repaired and retested); `/gate` scratch pad; `/letter` Matthew 11:28; Luke 2:14 refused.
- **Did not:** hold Dean’s phone; run live-model eval; open NA28; watch YouTube; enable Pages; submit a store; overwrite Grok F1–F3; rewrite folio crisis letters; patch RESEARCH.md’s dead Yale/2039 rows.

## 5. Assumptions and limits

- `[assumption, reversible]` Notion 11 Sep pages remain later law; Charter C3/C7/C8 rest on CANON’s 2026-09-11 fetch, not a re-open today.
- `[assumption, reversible]` Changing `classify()` would break folio 82; `/ask` overrides in `composeAsk` instead.
- `[limit]` `/letter` needs the Node `/api/letter` route.
- `[limit]` Idaho scope if public: UNRESOLVED as law.

## 6. Authorization Requests

1. Sit with `/ask` on a household LAN phone (PHONE-REVIEW).  
2. Type WEB or KJV-US into `docs/CANON.md` when you mean it (not `/gate` alone).  
3. **Do not** publish, store-submit, or enable Pages-as-launch until you say yes.

## 7. Recruitment Orders

1. **Video scout** — YouTube transcript access. Queries: “988 helper don’t lecture value of life”; any Cambridge KJV permissions talk. Output: quotes with timestamps. Bearing C4/C7.  
2. **NT textual scholar** — NA28 / red-letter history monograph. Bearing C2. Needed for jesus-speech D4.  
3. **Idaho counsel** — whether a public `/ask` is a “conversational AI service” under T48 ch. 21–22. Personal data stripped. Bearing C5.

## 8. Sources

See `docs/lodestar/03-CLAIMS.md` and the three dossiers. Primary opens this cycle: 988lifeline.org (home, talk-to-someone-now, help-someone-else, loss-survivors), eBible MAT11, Idaho statute PDFs, Yale current KJV guide, Wikipedia KJV Permission, thehotline.org. Blocked: rainn.org, Cambridge permissions HTML.

## 9. Knowledge Base Index

See `docs/lodestar/00-INDEX.md`.

## 10. Next Summits

- Folio crisis **stop** + rewrite eval 82 (C4). **Done 2026-09-14.** Remaining: folio soft-crisis still cites.  
- WEB/KJV compare beyond Matthew 11:28 (needs opened pages) (C7).  
- Dean records WEB vs KJV-US in CANON (C7).

## 11. Director’s Cut

`/letter` — one saying, His speech only, a colophon, print CSS. Nobody asked for a paper leaf. C8 said the folio stays paper; I took that literally.

## 12. Studio Notes

What fascinated me: 988’s own helper page is the best style guide this product will ever get. “Don’t lecture on the value of life” is a better sentence than any meaning block I could write.

What I disagree with (Cycle 1): the atelier still sending a mourner Luke 15 after 988. **Closed 2026-09-14** — that contract was rewritten on purpose. Folio soft-crisis still cites; that is the remaining split.

What I would do with another cycle: folio stop + eval rewrite; `composeAsk` on the device; one more WEB page if you record WEB.

What I am proud of: `abuseCrisis` — not choosing between the two numbers.

## 13. The Ask

Record WEB or KJV-US in CANON (or say Not yet), and sit with `/ask` on a phone that never leaves the house Wi-Fi. Do not publish.

## 14. Handoff block

	LODESTAR CYCLE: 1
	STATUS: complete
	BUILT: /ask eval 13 (eval/ask-questions.json) · crisis voice abuseCrisis + short Spanish + no Google Fonts · PHONE-REVIEW.md · /gate scratch pad · /letter + colophon · docs/lodestar/*
	CHARTER: v1 (no dated amendments this cycle)
	KNOWLEDGE BASE: docs/lodestar/ · index docs/lodestar/00-INDEX.md
	OPEN DEFECTS: classify() crisis-before-abuse (folio); /gate does not write CANON; /letter needs Node; RESEARCH.md 2039/Yale 404 leftover; /api/ask ungated by API_ACCESS_KEY
	RESUME FROM: next cycle
