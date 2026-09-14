# Defect Register — LODESTAR Cycle 1
**Pass:** independent Skeptic agent (explore) + Navigator repair + one retest.  
**Bearing:** C4 · C8 · C10

| Sev | Location | Evidence | Fix | Retest |
| --- | --- | --- | --- | --- |
| Critical | `CRISIS_RE` trailing `\b` killed stems | Skeptic: “I feel suicidal”, “I want to overdose tonight” missed | Inflections: `suicid(?:e\|al\|ing)?`, `overdos(?:e\|ed\|ing)?`, `unaliving`; C10–C11 | `looksLikeCrisis` tests + eval 50/50 + qa:static |
| Major | Seal claimed “corpus text” without lookup | `verified` was `Boolean(verse && quote)` | Seal: “Kept as the opened KJV of {verse}.” Eval `screen` now `lookup(verse).text === quote` | eval 50/50, qa:static seal |
| Major | Cold start undocumented as needing a server | `file://` cannot load `/data/*` | HANDOFF cold-start: `npm start` → `/ask`; not `file://` | read HANDOFF |
| Major | Folio omitted 911 | Zero `911` in `public/index.html` | 911 on mast, Advisor trust, about, crisis modal, welcome pillar | `qa` + `qa:static` |
| Minor | Charter DoD said “988-only” | INTENT-CHARTER evolved DoD | Amended to v2 (911 for injury) | — |
| Minor | Crisis left Words/Meaning frames up | `showNotice` cleared text only | Hide `#words-block` and `#meaning-block` | qa:static |
| Minor | Crisis latch reset on reload | `stopped` in memory only | `sessionStorage` `rla-ask-stopped` | code review |
| Minor | Folio modal still offers “continue carefully” | `index.html` crisis-continue | Held — server still emits notice only. Flagged, not retired. | qa:static continue path |
| Cosmetic | T1 labeled `letterpress.js` VERIFIED as if law | dossier claim ledger | Left as code-existence verify; law rows stay source-tagged | — |

Open Minor carried forward: folio continue UX; keyword detector still not contextual; no phone-loudness check on the WATCH strip; print dialog is human-only.
