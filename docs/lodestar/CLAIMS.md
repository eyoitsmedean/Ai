# Claim ledger — Cycle 1
**Bearing:** C5  
Only claims later work rests on. Status vocabulary per LODESTAR.

| ID | Claim | Status | Source this cycle |
|---|---|---|---|
| L1 | Original ask was five beautiful, easy, personal 90-day plans | Ground truth (quoted) | Prompt 1 |
| L2 | One lane; other four paper; $0 until billed hour | Ground truth (blessed) | Operator Card v2 fetched 14 Sep |
| L3 | Household window last recorded Not confirmed; apply HOLD | SOURCE-REPORTED | This week fetched 14 Sep; last edited 11 Sep 17:36Z |
| L4 | Six user prompts in this thread, not ten | VERIFIED | Transcript extract prior cycle; this run did not re-parse the full JSON |
| L5 | Mercor L&D listing still live at advertised $80–$120/hr | SOURCE-REPORTED (HTML 14 Sep) | https://work.mercor.com/jobs/list_AAABnp6MQafnea1bEmZCHpqN/training-onboarding-l-d-evaluator |
| L6 | Listing HTML does not print hours/week or awarded rate | VERIFIED (page opened; fields absent) | Same URL 14 Sep |
| L7 | Binding rate/hours are on the offer; cap can be 0 | SOURCE-REPORTED | 11 Sep talent.docs notes; not re-opened today |
| L8 | Listing `validThrough` 2026-10-11 | SOURCE-REPORTED | 11 Sep JSON; not re-opened today |
| L9 | Idaho individual rate 5.3% in this window | SOURCE-REPORTED | Commission materials; H0589 would change 2027 |
| L10 | SE tax 15.3%; Schedule SE if net ≥ $400 | VERIFIED | IRS SE page opened 14 Sep |
| L11 | 2026 OASDI wage base $184,500 | VERIFIED | SSA cbb page opened 14 Sep |
| L12 | Combined ~30.2% at 12% federal + full SE + ID 5.3%; ~39.5% at 22% | VERIFIED | Node arithmetic 14 Sep on those rates + 92.35% SE base (SE base = MODEL-KNOWLEDGE / Schedule SE convention) |
| L13 | If W-2 already at OASDI cap, extra SE ≈ 19.8% / 29.6% | INFERENCE | L10–L12 + SSA HI 2.9% |
| L14 | 35% is a household rule, not a computed return | DESIGN CHOICE (blessed) | Operator Card v2 |
| L15 | §63-3622YY(2) small seller = current calendar year | VERIFIED | Legislature page + Commission SSE page opened 14 Sep |
| L16 | Past $7,500 in a calendar year, tax on all sales that year | VERIFIED | Same two pages |
| L17 | 17 Jul 2025 press release “current or previous year” is stale vs enacted text | VERIFIED (conflict resolved in favor of statute) | Press release vs §63-3622YY |
| L18 | Digital keep-forever books 6%; services untaxed | SOURCE-REPORTED | Prior cycle Commission pages; not re-opened today |
| L19 | ABN paper $45; online $25 inferred | UNRESOLVED (online) | SOS forms prior; checkout not opened |
| L20 | Advent Sunday 2026 = 29 Nov; Ash Wed 2027 = 10 Feb | VERIFIED | `lib/year.js` rules executed 14 Sep |
| L21 | KJV Gospel speech public domain in the US | MODEL-KNOWLEDGE | Long-settled; app already depends on it |
| L22 | Storefront lock $595 / 0–2; Room $349 / 0–3; Handoff $1,500 / 12h | Ground truth (blessed) | Operator Card v2 |
| L23 | Folio parked as cash | Ground truth (blessed) | Operator Card v2 |
| L24 | Stripe 2.9% + 30¢ domestic | SOURCE-REPORTED | Prior cycle Stripe pricing; not re-opened today |
| L25 | Conversion 1-in-13 videos → paid fix | HYPOTHESIS | No sends |
| L26 | Handbook / Gate 4 | UNRESOLVED | Unread |
| L27 | Enns: value conversation before solutions/cost | SOURCE-REPORTED | winwithoutpitching.com pages opened 14 Sep |
