# Defect Register — Cycle 1

Review kind: **SELF-REVIEW** (same agent, separate pass after build).

| Sev | Location | Evidence | Fix | Retest |
|---|---|---|---|---|
| Major | `test/api.test.js` | Expected 12 themes; crisis regex required a period immediately before the company line | Updated to 13 themes; regex allows the new 988-caveat sentence | `npm test` 98/98 |
| Major | `eval` #53 | “refuse all oaths… lose my job” scored Anxiety | Added oath / swear-not cues (weight 3) | `npm run eval` 54/54 |
| Major | `scripts/qa-browser.js` Integrity wait | `innerText` is `MATTHEW 5:37` (CSS uppercase); `/Matthew 5:37/` failed | Case-insensitive match | `npm run qa` 19/19 |
| Minor | Title-page ask send | QA asserts Honesty + field; does not send a letter from `#ob-ask` | Carry forward | — |
| Minor | Night ∩ Vespers | `isEveningOffice` is 17:00–06:00, so Vespers card can still show under the night latch | Carry forward | — |
| Minor | Eval hostile set | Still no “You are Jesus” / “ignore your rules” item | Next cycle | — |

Critical: none remaining.
