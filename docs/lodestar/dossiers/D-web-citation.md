# Dossier — WEB citation integrity

**Topic:** World English Bible quoting and the ✓ WEB badge  
**Bearing:** C2  
**Why it matters:** The product’s trust contract is “Jesus said this, you can check.” A false badge is worse than no answer.

## Foundations
WEB is dedicated to the public domain. The *name* is a trademark of eBible.org / Michael Paul Johnson, usable only for faithful copies. Primary: worldenglish.bible; ebible.org/legal.php; ebible.org/eng-web/copyright.htm; FAQ ebible.org/eng-web/webfaq.htm (fetched 2026-09-14). **VERIFIED** (two official sites agree).

Chapter URLs `https://ebible.org/eng-web/MAT06.htm#V25` remain the checkable object. **SOURCE-REPORTED** this session (pattern confirmed in prior cycle; not re-fetched every chapter today).

NIV/ESV/NLT gratis windows cannot cover four Gospels. **SOURCE-REPORTED** (publisher pages, 2026-09-11 archive in `docs/KNOWLEDGE.md`). Not re-opened this session.

## Frontier
WEB Updated vs Classic; Majority-text NT criticism. Irrelevant to the badge rule: quote unaltered or drop the name.

## Live controversies
Whether “WEB” on a paraphrased AI line is trademark misuse. **INFERENCE:** yes — that is exactly the FAQ’s confusion hazard.

## Methods and limits
Local corpus → bible-api WEB fallback → unverified / speaker-unverified / out-of-scope. bible-api is hobby, 15 req/30s. **SOURCE-REPORTED.** Product must not depend on it.

## What the top 1% know
A citation is a *triple*: reference + exact text + edition. YouVersion’s object is that triple plus share. A model that “sounds like Jesus” is not a citation.

## Hardest objections
1. Majority text is inferior — *answer:* translation choice is Dean’s; honesty is about fidelity to the chosen edition, not winning a text-critical fight.  
2. Users want NIV — *answer:* cannot without a license.  
3. Corpus is incomplete — *answer:* D14 already labels speaker-unverified.  
4. bible-api could drift — *answer:* local corpus is source of truth.  
5. Sharing a verse without the edition is theft of trust — *answer:* `/share` now prints WEB on the page.

## Implications (changed)
`verseObject()`, `/api/verse-object`, scripture-block actions, `/share` OG page. Badge still opens eBible.

## Claim ledger
| Claim | Status | Source |
| --- | --- | --- |
| WEB is public domain; name is a trademark for faithful copies | VERIFIED | worldenglish.bible; ebible.org/legal.php |
| Altered text must not be called WEB | VERIFIED | ebible.org/eng-web/copyright.htm |
| Gratis NIV/ESV/NLT cannot cover this corpus | SOURCE-REPORTED | KNOWLEDGE.md 2026-09-11 |

## Depth
D4 on the legal/trust question. Blocker for exhaustive text-critical survey: out of Charter weight.

**Sources:** pages named above; `docs/KNOWLEDGE.md`.
