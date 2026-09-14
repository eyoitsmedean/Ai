# Defect Register — Cycle 1
**Pass:** SELF-REVIEW (same agent, fresh pass after QA)  
**Bearing:** C5

| Sev | Location | Evidence | Fix |
|---|---|---|---|
| Major | `plans/PLANS.md` still sold One-Fix as engine + $1,350 stack | File read after first commit | Rewrote Choose + side-by-side to Notion locks. Retest: read the new tables. |
| Major | Footer / offers linked to `../docs/` which the phone server cannot serve | `serve-plans.js` ROOT is `plans/` only | Removed those hrefs. Retest: no `../docs` in plans HTML (`rg`). |
| Minor | Write-one-lane sits below the HOLD card on a phone | Screenshot `playbook-hold-first-screen.png` | Left it. This week wins the first screen. Scroll is the cost. |
| Minor | Returning browsers keep an old `stack` of One-Fix + Advent ticked | `Object.assign` preserves saved `ninety.v1` | New loads default empty. Old ticks stay until Reset. Reset is labeled. |
| Minor | GitHub long cards still narrate “send five videos” in Week 1 | `PLANS[0].weeks[0]` | This-week HOLD card forbids it. Banner names the draft. Not rewritten (would hide history). |
| Minor | Choice pills wrap on a 390px screen | Screenshot `playbook-lamp-window-open.png` | Usable; cramped. Next cycle: two-row labels. |
| Cosmetic | Rule 3 still says 4.5 hours; Notion locked 8 all-in | Both remain in the project | Unresolved on purpose — Notion wins for money; GitHub rhythm is a drawer. |
| Cosmetic | `qa-plans.js` is not `npm test` | Ran by hand | Fine. Red Letter `npm test` was not re-run (untouched). |

**Critical:** none.

**Retest after Major fixes.** `rg '\.\./docs' plans` → no matches. `node plans/test-honest-cash.js` → 8 ok. `node scripts/qa-plans.js` → 10 ok after test correction (Lamp caption under HOLD is “window is not open,” which is the correct rule).

**Integrity.** No YouTube was watched. Mercor JSON was not re-opened this cycle (HTML was). Handbook unread. Six prompts, not ten. Combined-tax 92.35% factor is Schedule SE convention, not re-opened on the form instructions today.
