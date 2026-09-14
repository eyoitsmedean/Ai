# Phase 4 — Candidates, selection, mastery

## 4a. Candidates (18)

1. Shared crisis module  2. `eval-ask` harness  3. `/gate` recording desk  4. `/hear` WEBU/KJV desk  5. `/ask` stillness  6. Folio silent-after-988  7. WEB corpus rebuild  8. Waitlist deletion  9. Pages workflow disable  10. Implication character cap  11. Phone QA of `/gate`  12. Printable Amen card from `/ask`  13. Lectio timer on `/ask`  14. Crisis Spanish copy  15. OEB as third lock candidate  16. Store listing mock  17. Paul-allowed mode  18. Public URL.

6, 7, 8, 9 wait for Dean. 16–18 are off-course. 14–15 are next cycle.

## 4b. Five that won

| # | Kind | Summit | Why |
| --- | --- | --- | --- |
| 1 | Structural | Shared crisis + `eval-ask` | One matcher, runnable without a browser. C7 C1 |
| 2 | Craft | Stillness on `/ask` | The spec’s last word is silence. C6 C4 |
| 3 | Reach | `/gate` | Turns the memo into a sitting. C9 |
| 4 | Tooling | Crisis source drift test | Client copies cannot silently rot. C7 |
| 5 | Wildcard | `/hear` | Dean can hear WEBU without lying about the live corpus. C9 C2 |

**Next Summits:** folio silent-after-988 (needs yes); WEB spoken rebuild (needs recording); printable Amen card; Spanish 988 line; OEB check.

No YouTube. Mastery from opened pages + this product’s own law.

## 4c–4d. Mastery briefs and grades

### S1 · Crisis module + eval · Bearing: C7

World-class here is a matcher you can run in the dark and a stop that does not keep talking. Rubric: (1) one source of truth (2) ordinary English (3) grief is not crisis (4) no verses after a hit (5) eval exits non-zero on fail (6) clients stay in sync. Built: `lib/crisis.js`, `scripts/eval-ask.js`. Grade after iterate: 6/6 on the harness; client sync is string-inclusion, not a build step — **Minor**.

What it is / where / bearing / verification: eval harness · `npm run eval-ask` · C7 · **VERIFIED** this session (all cases passed).

### S2 · Stillness · Bearing: C6

World-class is a page that does not ask for another tap. Rubric: hide the button, name the rest, crisis rest is different, no thread, phone-sized. Built in `public/ask.html`. Grade: 5/5 on structure; not re-shot in a GUI agent this cycle — **tested via unit/API only**.

### S3 · `/gate` · Bearing: C9

World-class is a checklist you can finish without the chat. Rubric: WATCH, opened URLs, hearing link, refuse ESV/NIV, one sentence to write, not sent off-device. Built: `public/gate.html`. Grade: 6/6. **VERIFIED** HTTP 200 + noindex in API tests.

### S4 · Crisis drift test · Bearing: C7

World-class is a broken build when folio HTML drifts. Rubric: same `CRISIS_SOURCE`, three client files, fails if edited. Built: `test/crisis.test.js`. **VERIFIED** pass.

### S5 · `/hear` · Bearing: C9 C2

World-class is hearing before recording, with provenance. Rubric: live KJV sealed, WEBU labeled with URL and date, Luke 15 opened this session, no corpus switch, WATCH. Built: `lib/hear.js`, `data/hearing-desk.json`, `public/hear.html`. Luke 15 WEBU opened 2026-09-14 from eBible. Grade: 7/7. **VERIFIED** `hearingDesk()` + `/api/hear`.

### Rubric iterate (once)

First `/hear` draft left Luke 15 without WEBU. Opened LUK15.htm and filled 15:4 and 15:7. That is the change a careful editor would demand.
