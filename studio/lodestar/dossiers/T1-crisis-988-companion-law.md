# Topic Dossier — Crisis, 988, and companion-chatbot law
**Bearing:** C4 · C8 · C10  
**Depth:** D4 on the claims this product rests on. Not a treatise on all US crisis systems.

## Why it matters
The one-screen and the letterpress either stop or they become counselors. That is later household law (11 Sep) and P4’s crisis handoff. A wrong detector, a pastoral PS after 988, or a 20-minute pause copied from a bill that is not law, would all miss the star.

## Foundations
- **988** is the US Suicide & Crisis Lifeline: call/text 988 or chat 988lifeline.org. SAMHSA administers; Vibrant operates the network. VERIFIED: SAMHSA 988 FAQ opened 14 Sep 2026 (`https://www.samhsa.gov/mental-health/988/faqs`).
- **911 vs 988.** SAMHSA FAQ: 911 is primary for medical emergencies, fire, crimes in progress, immediate physical intervention. 988 is specialized for behavioral-health crisis. Examples given for calling 911 include a suicide attempt in progress. SOURCE-REPORTED same page; triangulated with SAMHSA “988 versus 911” social post (search 14 Sep).
- **findahelpline.com** is the international directory already named in the product. Not re-audited as a complete country list this session. SOURCE-REPORTED (product + prior cycle).
- **C-SSRS-style passive ideation** (“wish I were dead,” “go to sleep and not wake up”) is a standard screening cluster. MODEL-KNOWLEDGE for the instrument itself; we implemented the *phrases*, not a scored C-SSRS.

## Frontier
Companion-chatbot statutes are moving faster than clinical consensus on *how* a bot should interrupt. California SB 243 (companion chatbots) is chaptered. AB 1988 (PAUSE Act) would have required contextual detection and interruption pauses; it is not law.

## Live controversies
1. **Keyword stop vs contextual detection.** AB 1988’s draft definition of “credible crisis expression” rejects keyword-only detection. Our engine is keyword-plus-carve-out. That is a known gap, not a secret.
2. **Counsel after the hotline.** Older Red Letter contract: 988 then a Shame letter. Later Notion law: stop. Clinical opinion is not uniform that *silence* is always safer than a short pastoral word; the Charter chose stop.
3. **When to involve 911.** SAMHSA: small percentage of 988 contacts activate 911, often with consent. A static page cannot dispatch. Naming 911 for *physical injury now* is the honest split.

## Methods and limits
- Regex on user text. False negatives: metaphor, other languages, novel slang. False positives: we already carve accidental cuts; R22 (“disappeared for a month”) is Loneliness, not crisis — keep it.
- No model on `/ask`, so no LLM “is this crisis?” classifier. Adding one would need a key and a new eval.
- We do not implement SB 243’s annual reporting, three-hour minor break reminders, or a published protocol page. Household is Idaho; the product is WATCH paper.

## What the top 1% know
A stop that still emits Scripture is counsel. A pause copied from a *canceled* bill is theater. 988 is not EMS. The legal question for this folio is not “are we a California operator today” (no) but “if this URL ever serves Californians as a companion chatbot, SB 243 already requires a protocol that *prevents production* of self-harm content and refers to a hotline.” Our stop already does the referral half. Publishing the protocol is a future gate.

## Hardest objections
1. **“Keyword detection is negligent.”** Answer: true as a clinical/legal *ambition*. Recorded. Charter + no model + WATCH make a regex the honest current instrument. Do not pretend it is contextual analysis.
2. **“Naming 911 will send police to suicidal people.”** Answer: the notice names 911 for *physical injury right now*, matching SAMHSA’s medical-emergency examples — not “call 911 instead of 988.”
3. **“A Gospel word after 988 is mercy.”** Answer: later law forbids it. Eval now fails if Scripture follows.
4. **“SB 243 applies.”** Answer: chaptered in CA (LegInfo status opened 14 Sep: Chapter 677, 13 Oct 2025). Dean is in Idaho. Do not implement CA-only chrome for a paper folio.
5. **“AB 1988’s 20-minute pause is required.”** Answer: not law. Hearings canceled 12/22/26 Jun 2026 (LegInfo AB-1988 status via search 14 Sep). Do not implement.

## Implications (what changed)
- `CRISIS_NOTICE` names 911 for physical injury. **Bearing: C4**
- `CRISIS_RE` includes “tired of being alive” and “go to sleep and not wake up.” C09 added. **Bearing: C4 C8**
- One-screen cannot-do block repeats 911. **Bearing: C4**
- This dossier retires the belief that AB 1988 is the statute to implement.

## Claim ledger
| Claim | Status | Source |
| --- | --- | --- |
| 988 is US behavioral-health crisis line | VERIFIED | SAMHSA FAQ 14 Sep |
| 911 is for immediate physical / medical emergency | SOURCE-REPORTED | same FAQ + SAMHSA 988 vs 911 post |
| SB 243 is CA law, Ch. 677, 13 Oct 2025 | VERIFIED | LegInfo bill status opened 14 Sep |
| AB 1988 not law; Senate hearings canceled Jun 2026 | SOURCE-REPORTED | LegInfo/search 14 Sep (status page fetch for AB-1988 was search-only this pass) |
| Keyword detector ≠ contextual analysis | INFERENCE | engine source + AB 1988 draft definition |
| Household is Idaho | SOURCE-REPORTED | Notion / prior recovery, not re-opened this minute |

## Sources
- https://www.samhsa.gov/mental-health/988/faqs (opened 14 Sep; fetch timed out once, search + spilled FAQ text used)
- https://www.samhsa.gov/resource/988/988-versus-911-social-media-post
- https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260SB243 (opened)
- https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260AB1988 (search snippets)
- `data/letterpress.js` VERIFIED

## Depth and blockers
D4 on 988/911 split and the two CA bills as they affect *this* product. Blocker for a full companion-chatbot compliance memo: no counsel; product is not launched; Idaho not CA.
