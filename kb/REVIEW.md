# Phase 5 — SELF-REVIEW

**Kind:** SELF-REVIEW (same Navigator as builder; dossiers 01–03 were independent Scholars).  
**Date:** 14 Sep 2026 · Bearing: C4

## Facts spot-check
| Claim | Cited for | Check this session | Result |
| --- | --- | --- | --- |
| 662 / 1,922 | Colophon, Charter notes | `sayingCount()` / `verseCount()` | VERIFIED |
| 988 24/7 | C6 chrome | Opened 988lifeline.org | VERIFIED (24/7/365, call/text/chat offered) |
| BSB PD 30 Apr 2023, not CC0 | C7 | Opened berean.bible/terms.htm | VERIFIED (dedicated PD; CC0 not claimed) |
| WEB PD + name trademark | C7 | Opened ebible.org/engwebp/copyright.htm | VERIFIED |
| Need quotes = sealed text | S3 | Compared 12 rooms to `lookup()` | **Failed** on 6 rooms; repaired; retested |
| YouVersion 1B | C1 | Not re-opened this pass | left SOURCE-REPORTED / first-party as in dossier 03 |
| Hallow $40M | C1 | Not re-opened | ESTIMATE remains; not used in product copy |
| Spittal 2025 | C6 | Not re-opened PMC | SOURCE-REPORTED; not a ship gate |
| WATCH / no store | C7 C9 | Notion not re-fetched | Dean’s 11 Sep words; treat as ground |

## Disproof (load-bearing)
1. **“Ask never invents a saying.”** Tried Paul, garbage, crisis. Holds on `/api/ask`. `/api/chat` still uses retrieve fallback — **not claimed fixed**.
2. **“Need is sealed.”** Broke it: six rooms abbreviated or altered. **Fixed.**
3. **“988 is always shown.”** Holds on ask/need/guest/colophon/sit. Folio not re-clicked this pass (prior recovery).
4. **“No public URL.”** Colophon gate is localStorage only. Holds.
5. **“Hole unoccupied at scale.”** YouVersion has a 2017 red-letter *plan* — already in dossier 03. Does not occupy a Jesus-speech-only advisor. Claim stays INFERENCE.
6. **“Detection is safety.”** Product does not claim this. Chrome-first. Holds.
7. **“KJV is worldwide PD.”** Colophon already refuses this. Holds.
8. **“Guest hour is validated.”** No real guest. Do not claim it.
9. **“Five summits built.”** Pages exist; S4 untested with a human.
10. **“Charter from first ten prompts.”** Transcript was fetched earlier this cycle; this pass did not re-open the JSON. Left as prior VERIFIED.

## Usability
Cold start: `kb/SHIP.md` then `/ask`. Guest page is usable without the folio. Colophon form works without a server write. Sit page is obvious. Missing before repair: Ask footer had no Guest link.

## Alignment
Every new room carries a bearing in-footer. `/sit` is Director’s Cut serving C5 (sit before ask) — not a new Charter goal.

## Integrity
No YouTube cited. `npm test` after install: 54/54. After Need/Sit repair: **56/56**. Browser QA on `http://127.0.0.1:3010` after first push: Ask (fear / Paul / unmatched), Need, Sit timer, Guest, Colophon gate, Welcome — all behaved. Recording saved. Not a real-guest test.

## Defect register

| Sev | Location | Evidence | Fix |
| --- | --- | --- | --- |
| Major | `public/need.html` | 6/12 quotes ≠ `lookup().text` (John 20:29 clipped; John 16:22 dropped “And”; Matt 5:44 / John 16:33 / Luke 15:4 / John 14:27 shortened) | Restored full sealed text; `test/need.test.js` |
| Major | `public/sw.js` | Precache omitted /need /guest /colophon | Added + cache `rla-prod-v4` |
| Minor | `public/ask.html` footer | No Guest link | Added Guest + Sit |
| Minor | `kb/CLAIM-LEDGER.md` | K8 labeled FIRST-PARTY (not in the brief’s vocabulary) | Relabeled SOURCE-REPORTED |
| Minor | Guest hour | No real-user test | Left listed; not claimed |
| Minor | Crisis regex | “end it all” can miss | Chrome-covered; not expanded this cycle |
| Cosmetic | Need “Conflict” vs curated “Conflict & Relationships” | Name shorter on the page | Held — twelve rooms stay short |

**Critical:** none.  
**Retest:** `npm test` after repairs (see Ship). One review, one repair, one retest.
