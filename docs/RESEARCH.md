# Research — Red Words native book

**Coverage date:** 2026-09-11. Rows below were read at the linked official pages (or, where Apple JS-blocked the body, from that same official URL’s extracted wording). No invented citations.

Facts, interpretations, estimates, assumptions, and recommendations are labeled.

## Source register (consequential)

| ID | Question | Finding | Source | Fetched | Limit / contrary | Confidence | Implication |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | iOS upload SDK | Uploads must be built with **Xcode 26 or later** using an **iOS 26 SDK** since **28 Apr 2026**. | [Upcoming Requirements](https://developer.apple.com/news/upcoming-requirements/). Also [news 3 Feb 2026](https://developer.apple.com/news/?id=ueeok6yw) (SDK wording only). | 2026-09-11 | News item requires the SDK, not the Xcode marketing number. In practice the SDK ships with Xcode 26. | High | Archive on Xcode 26. Deployment target stays 15.0. |
| S2 | 6.9″ screenshots | Accepted portrait sizes: **1260×2736**, **1290×2796**, **1320×2868**. | [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) | 2026-09-11 | 6.5″ is a different slot. 13″ required if iPad is enabled. | High | Listing uses 6.9″. Binary is iPhone-only. |
| S3 | Lectio order | Classic + current USCCB pastoral: lectio → meditatio → oratio → contemplatio. | [USCCB Meditations](https://www.usccb.org/prayer-and-worship/prayers-and-devotions/meditations); [021425.pdf](https://www.usccb.org/resources/021425.pdf); Guigo II *Scala Claustralium*. | 2026-09-11 | **Contrary:** USCCB National Bible Week PDF still teaches contemplatio before oratio ([lectio-divina.pdf](https://www.usccb.org/bible/national-bible-week/upload/lectio-divina.pdf)). | High on four movements; disputed on last-two order | Sit is **inspired by**, not “is.” About says so. |
| S4 | 60s Rest before Respond | No USCCB, Vatican, or Guigo timer found. | Same as S3; silence in 021425.pdf (“period of silent reflection,” no seconds). | 2026-09-11 | A Benedictine might insist oratio before contemplatio. | High that it is **unattested** | Quiet minute is a **product beat**. No countdown digits. No Latin badge. |
| S5 | Dei Verbum 25 | “prayer should accompany the reading of Sacred Scripture, so that God and man may talk together.” | [Vatican EN](https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651118_dei-verbum_en.html) (18 Nov 1965) | 2026-09-11 | Not an app spec. | High | Respond as speech after Rest is defensible. Do not claim magisterial endorsement. |
| S6 | Office vs breviary | GILH treats Lauds/Vespers as hinges. We use Morning / Afternoon / Vespers / Compline as **clock names**. | Product code `office.dart`; GILH is background, not a citation we print. | — | We are not publishing the Liturgy of the Hours. | High | Do not rename to Lauds in the UI. |
| S7 | UK KJV | CUP: UK AV rights vested in the Crown, administered by CUP. Non-commercial liturgical/educational use: max 500 verses, not a complete book, **not ≥25% of the host work**, plus the prescribed acknowledgement. Commercial / over-limit needs written permission (`permissions@cambridge.org`). | [CUP rights](https://www.cambridge.org/bibles/about/rights-and-permissions/) © 2026. [UK IPO](https://www.gov.uk/government/publications/copyright-notice-duration-of-copyright-term/copyright-notice-duration-of-copyright-term) (15 Jan 2021): Crown licenses **publishers** (plural) by letters patent. | 2026-09-11 | **Contrary:** not exclusive worldwide statutory Crown copyright; UK-territorial. Catalog is 37 verses (under 500) but a Gospel-only app can still fail the **25% of the work** test, and a **store listing is commercial**. | High on UK-territorial Crown/CUP; medium on “must exclude” | Dean excludes UK **or** asks CUP. Do not silently list UK. |
| S8 | Play Data safety | Form required even when nothing is collected — for closed, open, or production. **Exclusive internal testing is exempt.** | [Play Help 10787469](https://support.google.com/googleplay/android-developer/answer/10787469) | 2026-09-11 | Exemption ends the moment the app leaves exclusive internal. | High | Internal first; complete the form before leaving. |
| S9 | Play target API | New apps and updates must target API 36 from **31 Aug 2026**. | [Play Help 11926878](https://support.google.com/googleplay/android-developer/answer/11926878); [Android Developers](https://developer.android.com/google/play/requirements/target-sdk) updated 2026-09-01. | 2026-09-11 | Nov 1 extension; Wear/TV/Auto exceptions; permanently private apps. | High for phone | `targetSdk = 36` already. |
| S10 | Pages path | Workflow deploys `public/` from `main` and `claude/jesus-teachings-chatbot-bSBhF` only. | `.github/workflows/pages.yml` | 2026-09-11 | This feature branch will not go live until merge. | High | Privacy URL blocked until merge or another host. |
| S11 | Widget timeline | `after(_:)` = earliest date WidgetKit may request a new timeline. Reloads are budgeted; not second-exact. | [TimelineReloadPolicy](https://developer.apple.com/documentation/widgetkit/timelinereloadpolicy); WWDC21 10048. Dedicated `after(_:)` URL returned 422. | 2026-09-11 | “Tries to respect” the date. | High | Seed + midnight entries; do not promise clock-exact cards. |
| S12 | SceneDelegate URLs | With scenes: launch URL → `scene(_:willConnectTo:options:)`; running/suspended → `scene(_:openURLContexts:)`. | [Custom URL schemes](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) | 2026-09-11 | Cold start is `willConnectTo`, not `openURLContexts`. No-scenes apps still use AppDelegate. | High | Keep SceneDelegate-only capture; consume-once in the session channel. |
| S13 | Ash Wednesday 2027 | **10 February 2027.** Easter 28 Mar 2027. | [USCCB 2027cal.pdf](https://www.usccb.org/resources/2027cal.pdf) (index updated 5 Feb 2026) | 2026-09-11 | US dioceses / Western computation. | High | Lent 40 is a later brief, not this archive. |

## Core topics (retained)

| ID | Question | Connection | Known | Uncertain | Owner |
| --- | --- | --- | --- | --- | --- |
| C1 | What is this project? | Prompt 1 | Existing Ai Gospel book as one Flutter archive | — | Lead |
| C2 | Widget = Word only | Craft law | Gallery name Word; verse + citation | Midnight slip (S11) | Native |
| C3 | Fail-closed catalog | Prompt 1 | 37 KJV verses; empty = blank | — | Canon |
| C4 | Office clock | Prompt 2 | Morning / Afternoon / Vespers / Compline | — | Book |
| C5 | Sit / lectio | Prompt 2 | Four leaves; Rest then Respond | Last-two lectio order disputed (S3) | Book |
| C6 | Seven Days | Prompt 2 | Seven beads, seven rooms, no streak | — | Book |
| C7 | Blessing / share | Prompt 2 / LAUNCH | Native share; Word-only body | iPad popover unused (iPhone-only) | Native |
| C8 | Identifiers | Prompt 1 | Locked table in TESTFLIGHT | First-Archive embed order | Operator |
| C9 | Privacy / stores | Prompt 1, 6 | No accounts; HTML ready | Public URL (S10) | Operator |
| C10 | Church year / silk | Prompt 2 | Tokens in `theme.dart` | Exact seasonal windows vs local diocese | Book |
| C11 | Kid’s Day → TestFlight | Prompt 1, later | Deadline passed | Dean’s Mac day | Operator |
| C12 | Xcode 26 | S1 | Policy live | Flutter engine notes on iOS 26 | Operator |

**Excluded as drift:** Advisor-as-this-ship, Journal-as-app, Ask/Saved/Settings shell from `founder-recovery-d607`, “do not merge PR 12,” 40 Lent rooms, celebrity, streaks, payments.

## Five adjacent topics (project-level)

### A1. Lectio vs Sit (pastoral honesty)

**Why chosen.** Reviewers will ask if we “are” lectio divina.  
**Contributes.** About copy stays humble; Rest has no timer chrome.  
**Informs.** Do not add Latin badges or a USCCB logo. The 60s beat is ours (S4). The last-two-step order is disputed even inside USCCB materials (S3 contrary).

### A2. Screenshot class (6.9″)

**Why chosen.** First listing is blocked without the right pixel box.  
**Contributes.** `STORE-LISTING.md` sizes from Apple Help (S2).  
**Informs.** Simulator → 6.9″ iPhone. iPad family was turned **off** so a 13″ set is not required.

### A3. Blessing as the only loop

**Why chosen.** Growth without accounts (prompt 1).  
**Contributes.** Send is Word-only; the loop is a person, not a funnel.  
**Informs.** Do not add invite codes.

### A4. Privacy hosting

**Why chosen.** Stores require a URL before leaving internal / before App Review.  
**Contributes.** `public/privacy.html` + workflow truth (S10).  
**Informs.** Merge or host elsewhere. Play exclusive-internal does **not** need Data safety yet (S8).

### A5. Named path vs Hallow

**Why chosen.** Temptation to bolt on Lent 2027.  
**Contributes.** Explicit exclusion — Seven Days ships; 40 rooms do not.  
**Informs.** Ash Wednesday **10 Feb 2027** (S13) is a later brief.

## Syntheses (core + adjacent)

**Answer.** This is one offline book. The widget is the Word. Sit is lectio-inspired, not licensed. The ship gate is Dean’s Mac with Xcode 26, a privacy URL, and a UK decision.

**Disagreements that matter.** (1) Lectio’s last two steps. (2) Whether 37 verses under a commercial storefront still need CUP — we treat the listing as commercial and leave the call to Dean. (3) A parallel agent brief that rejects PR 12 — out of scope here.

**Worked example.** Bless Send of John 14:27 is:

```
Peace I leave with you, my peace I give unto you…

John 14:27  ·  KJV
```

No “Red Words.” No install wall.

## Coverage map

| Topic | Status | Next if reopened |
| --- | --- | --- |
| C1–C12, A1–A5 | Synthesized; code matches | Device QA on a phone |
| S1–S13 | Fetched 2026-09-11 | Re-fetch if Apple/Play floors move |
| Flutter engine ABI on iOS 26 | Not blocking archive | Watch Flutter stable notes |
| Play 16 KB page size | Mentioned in older notes | Confirm NDK when Play warns |
| Crown Letters Patent text | Not found on gov.uk beyond IPO notice | Only if Dean lists UK |

**Stop rule.** Material store, rights, lectio-honesty, and widget-clock questions are answered with primary sources. Further search would not change the three flagships.
