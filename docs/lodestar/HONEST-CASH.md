# Honest cash rules
**Bearing:** C4, C5  
Implemented in `plans/index.html` as `honestCash()`.

## Rules
1. If the household window is not open (`confirmed` or `notneeded`) → display **$0**. Label: money waits.
2. If the written lane is `none`, `lamp`, or `folio` → display **$0**. A listing is not a billed hour. Folio is parked.
3. If `room` → possible units $0 / $349 / $698 / $1,047. Display **$0** as expected. Caption names the units.
4. If `handoff` → $0 / $1,500 / $3,000. 12h cap. Display **$0** as expected.
5. If `storefront` → $0 / $595 / $1,190. Display **$0** as expected. Never add Handoff.
6. Never multiply $80–$120 × hours × weeks into the first-screen number.
7. Ledger total is the only “base” that may rise. 35% of ledger → reserve toast.
8. Stretch numbers may live in a drawer, never in `#f-base`.

## Arithmetic executed 14 Sep
On $1 Schedule C net, OASDI still due: 15.3% × 92.35% + income tax on ($1 − half SE) at federal + 5.3% Idaho → **30.21%** (12%) / **39.50%** (22%).  
If W-2 already filled the 2026 OASDI base ($184,500, SSA page opened): HI-only SE + income tax → **~19.8% / ~29.6%**. Bracket unknown → keep 35%.

what it is · the cash engine’s constitution  
where it lives · this file + `plans/index.html`  
Bearing · C4, C5  
verification · rules coded; tax arithmetic run in Node; Mercor HTML opened; no payout exists
