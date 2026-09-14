# Defect Register — Cycle 1 SELF-REVIEW
**Reviewer:** Navigator, separate pass after build · **Kind:** SELF-REVIEW · Bearing: C8

## Checks
- **Facts:** 988 / 988.ca / Hotline numbers re-opened 2026-09-14 and still match About. WebKit ITP Home Screen exemption re-opened. WEB copyright page is now `engwebp/copyright.htm` (old path 404). Yale KJV guide re-opened. rainn.org HTTP 403 — not treated as a missing number.
- **Disproof (load-bearing):**
  1. *Leave quickly wipes the journal.* Broke: code + qa-fresh keep `rla-journal`. Held.
  2. *Escape wipes.* Broke: Escape → `finish('close')` only. Held.
  3. *fresh=1 leaves leftover chat.* Broke: qa-fresh. Held.
  4. *Welcome still hits Google Fonts.* Broke: qa-fresh + source test. Held.
  5. *Helpline script fails CI when rainn.org is blocked.* Broke: exit 0, BLOCKED. Held.
  6. *ITP exemption is persist() in a tab.* Broke: WebKit page says Home Screen. Copy matches. Held.
  7. *KJV is PD in the UK.* Broke: Yale still carves out Crown/CUP. About unchanged. Held.
  8. *Offline safety still theme-retrieves.* Not this cycle’s code; existing 119 tests still pass. Held.
  9. *Cache v19 leftovers.* Broke: tests demand v20 × 11. Held.
  10. *Eval retrieval still green.* 100/100 this session. Held.
- **Usability:** DEMO.md now matches the product. `qa-fresh` is the cold start. Begin again is a settings verb a guest host can find.
- **Alignment:** every summit names C2/C4/C6/C8. MARKET/LAUNCH still unblessed, held.
- **Integrity:** no device walk, no live model, no YouTube, no rainn.org body. Status labels not upgraded past the evidence.

## Register

| Sev | Location | Evidence | Fix |
|---|---|---|---|
| Minor | S5 escape URL | Hotline destination not in the 2026-09-14 extract | Wikipedia is DESIGN CHOICE; Research Order below |
| Minor | Leave quickly | Cannot clear Safari history (Hotline asks visitors to) | Stated in About / Ship limits; no code can do this |
| Minor | `qa-fresh` | Does not follow navigation to Wikipedia | Intentional — would leave the app under test |
| Minor | RAINN primary | HTTP 403 this host | Dean re-open (C10) |
| Cosmetic | `eval/RESULTS.md` | Timestamps/latencies changed on re-run | Commit generated file |

No Critical or Major. No repair loop.

## Retest
`npm test` 119/119 · `npm run check` · `qa-fresh` 3/3 · smoke 10/10 · helplines 6 pass / 0 fail / 1 blocked · eval 100/100 retrieval.
