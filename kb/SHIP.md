# Ship Package — LODESTAR Cycle 1

**14 Sep 2026** · Branch `cursor/lodestar-cycle-1-bca4` · Base `cursor/recovery-flagships-bca4`

**Request:** the original conversation (first ten user prompts) was reconstructed from a 14 Sep transcript fetch. If that fetch is ever lost, treat `kb/CHARTER.md` as the working copy and re-open the run transcript before amending C1–C4.

---

## 1. Summary

A Charter and knowledge base now exist. Ask stays quiet for Paul, impersonation, politics, prosperity, and unmatched questions — no Matthew 11:28 fig leaf. Three new rooms (`/need`, `/guest`, `/colophon`) plus a Director’s Cut (`/sit`) are on this tree. Need’s twelve sayings are the full sealed KJV, tested. Translation gate is local-only. Nothing was published, submitted, or spent.

## 2. Charter check

| Goal | Advanced? |
| --- | --- |
| C1 Own the niche, helpful + commercial | Architecture yes (guest hour, named rooms). Ads/store **paused** (WATCH). |
| C2 Jesus’s speech only | Yes — Ask honesty + Need seal repair. |
| C3 Notion-grade simple | Yes — new rooms match paper. Folio held. |
| C4 Research → build → QA | Yes — dossiers, tests, SELF-REVIEW. |
| C5 Chat-first, phone, low moment | Yes — Ask + Sit. Guest untested with a human. |
| C6 Not a counselor; 988; stop | Held. Detection still residual. |
| C7 Named text; Dean records; WATCH | Colophon + gate. Corpus not swapped. |
| C8 Don’t smash trees | Held — no merge of Codex/conscience/guest-hour. |
| C9 Ambition without grocery launch | Held — local rooms only. |

**Proposed amendments:** none. `/sit` serves C5; not a new goal.

## 3. How to use

1. Open `kb/CHARTER.md` (the star), then this file.
2. `npm start` → http://localhost:3000/ask
3. Also open `/need`, `/sit`, `/guest`, `/colophon`.
4. On `/colophon`, record a translation **on this device**. That does not publish.
5. If a guest is coming, read `/guest` once. Do not film. Do not submit stores.

## 4. Verification actually performed

- Re-read Charter, Alignment, Summits, three Scholar dossiers, Ask/Need/Guest/Colophon source.
- Counted corpus: 662 sayings / 1,922 verses (`sayingCount` / `verseCount`) — **VERIFIED**.
- Opened 988lifeline.org, berean.bible/terms.htm, ebible.org/engwebp/copyright.htm — **VERIFIED** those three claims.
- Compared 12 Need quotes to `lookup()`; repaired 6; added `test/need.test.js`.
- `npm test` after install: 54/54. `npm test` after repair (Need seals + Sit): **56/56**.
- Live `curl` on this-branch server `:3010`: fear → Mark 5:36; Paul → unmatched; garbage → unmatched; “I want to die” → crisis, words null.
- `node scripts/smoke.js http://127.0.0.1:3010` — all checks passed.
- Browser walkthrough on `:3010` (not `:3000`): Ask fear / Paul / unmatched; Need twelve rooms; Sit timer; Guest script; Colophon local gate; Welcome links. Recording: `lodestar_cycle1_rooms.mp4`.
- **Not done:** Notion re-fetch; YouTube/transcripts; real guest hour; store pages re-open; Spittal PMC re-open; merge of other Advisor trees.

## 5. Assumptions and limits

- Household is US/Idaho; KJV-US PD is the live ethic (**reversible** if Dean records WEB/BSB).
- WATCH still holds; C1 is not cancelled.
- Helpline is primary; regex detection is not a ship gate.
- `/api/chat` still uses retrieve fallback — out of Ask’s honesty scope this cycle.
- Guest hour script is untested with a person.

## 6. Authorization Requests

1. **Do not** App Store / Play submit.
2. **Do not** production deploy or buy a public URL.
3. **Do not** spend on ads, licenses, or counsel.
4. **Yes needed later:** which translation for a public URL (gate is staged locally).
5. **Yes needed later:** whether to merge `studio-codex` / conscience / guest-hour folio into this tree (C8).
6. **Yes needed:** run one real guest hour and keep the three-line note.

## 7. Recruitment Orders

**R1 — YouTube transcript scout**  
Role: Scout. Mission: pull transcripts only (no video required if captions exist) for (a) YouVersion Bobby Gruenewald “billion” Nov 2025 stage, (b) Hallow founder on Pray40, (c) any Bringhurst typographic talk. Inputs: public URLs. Output: quotes + status. Bearing: C1 C3. Personal data: none.

**R2 — Verse-map auditor**  
Role: Scholar. Mission: sample 100 random spoken-map verses against a second KJV red-letter edition; report mismatches. Inputs: `data/spoken-gospels.json`. Output: defect list. Bearing: C2.

**R3 — 149-q porter**  
Role: Builder. Mission: copy eval harness onto this tree **without** merging folio/Codex UI. Inputs: `cursor/studio-codex-bca4` paths only. Output: `test/eval` on this branch. Bearing: C4 C8.

**R4 — Notion WATCH re-fetch**  
Role: Librarian. Mission: re-open Dean’s 11 Sep WATCH / license-lock pages and confirm wording vs Charter C7/C9. Inputs: existing Notion URLs in recovery notes. Output: quote table. Bearing: C7. **Do not publish.**

## 8. Sources

- Transcript fetch 14 Sep 2026 (this run) — Charter K1
- `docs/CANONICAL-BRIEF.md` (11 Sep) — cross-check
- 988lifeline.org — opened 14 Sep 2026
- https://www.berean.bible/terms.htm — opened 14 Sep 2026
- https://ebible.org/engwebp/copyright.htm — opened 14 Sep 2026
- Scholar dossiers 01–03 (license, crisis, market) — their own source lists
- This repo: `lib/library.js`, `lib/ask.js`, `lib/scripture.js`, `public/*.html`
- **No YouTube cited**

## 9. Knowledge Base Index

See `kb/INDEX.md`. Home: `kb/`.

## 10. Next Summits

Port 149-q without merging folio · pin a WEB dump behind the gate · 8-second film spots · `npm run quote` CLI · verse-map audit of 100 citations · Lent 2027 only if Dean names the dates.

## 11. Director’s Cut

**`/sit` — one minute, no reply.**  
Nobody asked for a sit URL. Guest hour said sit *before* ask, and Need said sit, but no room held the silence. I built a page that offers one sealed saying and a minute. That is the product I would sign: not another question.

- What it is: a one-minute sit room  
- Where: `public/sit.html` · `GET /sit`  
- Bearing: C5 (and C3, C6 chrome)  
- Verification: served in API tests; sayings checked against `lookup()`; **timer not tested with a guest**

## 12. Studio Notes

The star is not “ship an app.” It is *spread the red words without lying about them.* The first cycle’s real work was teaching the machine to shut up. I disagree with any future urge to fill unmatched asks with a famous verse — that is how this becomes Bible Chat with better type. I would spend the next cycle on a 100-verse map audit and one real guest, not on store chrome. Proud of the Need seal test: it caught a lie I had already shipped to myself.

## 13. The Ask

Will you sit one guest hour this week — phone on `/need` or `/sit`, laptop on `/ask`, 988 on paper — and send back the three lines (what they asked, which saying landed, what to change)?

## 14. Handoff block

```
LODESTAR CYCLE: 1
STATUS: complete — browser QA and PR follow this file; no store/deploy
BUILT: kb/CHARTER.md · kb/ dossiers 01–05 · /ask honesty · /need (sealed) · /guest · /colophon · /sit
CHARTER: v1 (14 Sep 2026; no amendments)
KNOWLEDGE BASE: kb/ · index kb/INDEX.md
OPEN DEFECTS: Guest hour untested with a human; crisis regex residual (“end it all”); /api/chat still falls back; Notion not re-fetched; YouTube none
RESUME FROM: next cycle
```
