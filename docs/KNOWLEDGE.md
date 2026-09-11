# Knowledge archive — Red Letter Advisor

**Research date:** 11 September 2026  
**Labels:** FACT · INTERPRETATION · ESTIMATE · ASSUMPTION · RECOMMENDATION · UNRESOLVED  
**Rule:** do not treat source count as proof. Dates below are the page’s own stamp or the fetch date.

This file is the reusable knowledge layer. Decisions it changed are named. Investigations that only confirmed a direction say so.

---

## Coverage map

### Core topics (retained)

| ID | Question | Why it is core | Owner this cycle |
| --- | --- | --- | --- |
| C1 | What is the product, for whom, and what is “done”? | Founding loop + ATELIER lock | Brief |
| C2 | How do we keep “Jesus’s words only, verbatim WEB”? | Trust contract | Scripture + verify |
| C3 | How do we handle crisis, abuse, and off-scope without becoming a therapist? | Audience is often at a low moment | Safety |
| C4 | How does this ship on iPhone and Android without a store? | Prompt #15 + D6 | PWA |
| C5 | How do we stay chat-first while keeping later “amaze / beautiful” craft? | Drift diagnosis | Product |
| C6 | How do we share a verse a stranger can check? | Goal-wrapper + YouVersion bar | Share |

**Excluded as drift (recorded):** React Native rewrite; streak roadmap; whole-Bible trivia; treating ATELIER’s filled example as “do not build this app” (true in LH01 Notion, false in *this* conversation).

### Five adjacent topics (exactly five)

| ID | Why chosen | Decision it informs |
| --- | --- | --- |
| A1 | iOS PWA install + Web Push 2025–2026 | Install coach copy; what we must not claim |
| A2 | Crisis referral law/guidance for non-crisis apps | `/legal` + crisis card wording |
| A3 | Competitive quality bars (Hallow, YouVersion, Bible Chat) | Match warmth/verse object; refuse streaks/therapy |
| A4 | WEB / eBible / bible-api / NIV-ESV-NLT rights | Keep WEB; local corpus; no licensed-text rewrite |
| A5 | Add-to-Home-Screen conversion patterns | Illustrated sheet after value, not toast-only |

---

## Syntheses

### C1 — Product and done

**Answer:** The founding ten prompts demand a research–build–QA loop to a world-class standard. Later amendments lock that loop onto a **chat-first Gospel advisor PWA**, not a life-planning folio and not a scholarship site.

**Disagreement:** Notion LH01 “ORIGIN CORRECTION” says ATELIER’s RLA block is a filled example with “no active instruction here to build that app.” That is true **for that conversation**. In this transcript, authored #13–#16 and the same filled example were applied to `github.com/eyoitsmedean/Ai`. [FACT: two conversations; INTERPRETATION: this repo follows this transcript.]

**Implication:** Recover prompts from *this* transcript. Do not import LH01’s five 90-day options into this repo.

---

### C2 — Verbatim WEB, Jesus only

**Answer:** Keep the World English Bible. Quote unaltered. Label the name only on faithful copies. A citation outside the four Gospels is never ✓ WEB. Gospel text not in the curated corpus may show WEB wording as “speaker unverified.”

**Evidence (FACT, fetched 2026-09-11):**

- worldenglish.bible homepage: public domain; copy in any form; “World English Bible” is a trademark for faithful copies. (`https://worldenglish.bible/` — `/about` is 404.)  
- ebible.org legal + FAQ (FAQ text dated 5 Feb 2024; HTML Last-Modified 26 Aug 2026): CC0; do not call altered text WEB.  
- Chapter pattern confirmed: `https://ebible.org/eng-web/MAT06.htm#V25` (also `engwebu`, `engwebp`); `<span class="verse" id="V25">`; Last-Modified 26 Aug 2026.  
- bible-api.com: default WEB; 15 req / 30 s / IP; hobby; no SLA.  
- NIV / ESV / NLT gratis windows (HarperCollins, Crossway API, Tyndale/NLT): ≤500 verses, not a complete book, not ≥25% of the work; NIV electronic/app use needs a license; ESV API may not locally store more than 500 verses. Jesus’s words across four Gospels exceed that. **FACT: those editions are blocked for this product without a publisher license.**

**Quality critiques (not legal blocks):** Majority-text NT; classic WEB “Yahweh” in OT (low relevance to Gospels); some readers find the English stiff (GotQuestions). BibleGateway still calling WEB “draft” is stale vs official freeze.

**Decision:** Keep WEB. Keep local corpus. bible-api.com is fallback verify only. Do not rewrite quotes and still badge WEB.

---

### C3 — Safety

**Answer:** Deterministic interrupt + official numbers + “software, not a person” is the accepted referral pattern. It is **not** a liability shield if the model keeps chatting through a crisis.

**Must say (FACT from official pages 2026-09-11):** 911 for immediate danger; US 988 call/text + `https://chat.988lifeline.org`; Spanish press 2 / AYUDA / ES chat; IASP `/suicidalthoughts/` (live; title now “Suicidal Crisis Support”); Hotline 1-800-799-7233, START to 88788, thehotline.org; no affiliation; no dispatch.

**Must not say:** US & Canada as one official 988 system; that RLA *is* 988; therapy; HIPAA; “we collect nothing” while cookies/push/AI exist; Hotline logo without permission.

**Law vs guidance (dated):**

- SAMHSA/988: linking encouraged; no mandated app disclaimer. End-card line last updated **15 Jun 2023**, still posted.  
- APA advisory **13 Nov 2025**: disclose AI; not a replacement; interrupt; 988.  
- NY GBL Art. 47 effective **5 Nov 2025**; CA SB 243 operative **1 Jan 2026**: companion-bot duties. **UNRESOLVED** whether RLA is in-scope; conservative interrupt already matches the duty.  
- FTC 6(b) **11 Sep 2025**: inquiry, not a rule.  
- Character.AI settlement **Jan 2026** and pending OpenAI suit: **NEWS**, not holdings. Pattern alleged: no interrupt + anthropomorphic companion.

**Decision this cycle:** rewrite crisis copy; publish `/legal`; keep pre-model gate.

---

### C4 / A1 / A5 — Phone install

**Answer:** PWA is still the correct default. iPhone cannot one-tap install. Web Push requires Home Screen + iOS 16.4+ + a gesture after launch.

**FACT (fetched 2026-09-11):**

- `beforeinstallprompt` is not supported on Safari iOS through the current Can I use table (including 26.x).  
- Apple iPhone User Guide (iOS 26): Share → Add to Home Screen; **Open as Web App**. Compact Safari may hide Share behind ⋯ More.  
- WebKit 16 Feb 2023 / Safari 16.4 (27 Mar 2023): push for Home Screen web apps; standalone vs bookmark.  
- Apple “Sending web push” © 2026: user gesture; show every notification or permission can be revoked.  
- Chrome: `beforeinstallprompt` + richer install (screenshots) documented; TWA is Play-only and does nothing for iPhone.

**RECOMMENDATION:** Illustrated 3-step sheet; “Add to Home Screen” not “Install” on iOS; ask after value; never request push in a Safari tab.

**Confirmed this cycle:** implemented the sheet; banner after first non-crisis answer or day 2; Settings entry.

---

### C5 — Chat-first vs beautiful

**Answer:** Prompts #13–#14 authorized Encounter and Garden. ATELIER authorized chat-first. Both stand. The defect was **order**: Today + cinematic overlay ran before the composer.

**Decision:** Default tab Advisor; skip Encounter on Advisor; keep Encounter on Today; keep Garden. Simple mode stays optional (turning it on by default would retire #14).

---

### C6 — Share

**Answer:** Match YouVersion’s *mechanics* (text + reference + version + native share). Do not copy stock-photo social identity or “web doesn’t count.”

**Decision:** Share URLs now `/?tab=advisor&ref=`. Per-verse Open Graph is **not** built (would need a server-rendered share page). Static `og-image.png` remains.

---

### A3 — Competitors

| App | Match | Refuse |
| --- | --- | --- |
| Hallow | Warmth; one useful moment in ~2 minutes (Warmpeach 2026-05 lab; COI: they build a Bible-chat app). Official help 2 Jun 2026: Play Session first. | 26-step funnel; early paywall; optional streaks; account wall. |
| YouVersion | Verse as object; share always includes reference + version. Official help (Verse Images updated ~1 week before 2026-09-11). | Streaks; “Bible.com doesn’t count”; store coercion. |
| Bible Chat (SoulStream) | Negative lesson. About markets crisis comfort; Terms 6 Aug 2025 disclaim counseling. Warmpeach 2026-05 documented mis-labeled citations and weak crisis routing. | Trivia, streaks, therapist voice, unverified quotes, paywall-before-help. |

Dean still has not named two quality-reference apps. These remain ASSUMED references.

---

## Source register (load-bearing)

| # | Source | Date | Used for | Limit | Conf. |
| --- | --- | --- | --- | --- | --- |
| 1 | https://worldenglish.bible/ | Fetched 2026-09-11 | PD + trademark | /about 404 | High |
| 2 | https://ebible.org/eng-web/webfaq.htm | Text 2024-02-05; LM 2026-08-26 | CC0; trademark if altered | — | High |
| 3 | https://ebible.org/eng-web/MAT06.htm#V25 | LM 2026-08-26 | Citation URLs | — | High |
| 4 | https://bible-api.com/ | Fetched 2026-09-11 | 15/30s; no SLA | Hobby host | High |
| 5 | HarperCollins NIV permissions | Fetched 2026-09-11 | NIV blocked for app corpus | — | High |
| 6 | https://api.esv.org/ + esv.org permissions | Fetched 2026-09-11 | ESV store/API caps | — | High |
| 7 | BibleGateway NLT copyright + api.nlt.to | Fetched 2026-09-11 | NLT caps | — | High |
| 8 | https://988lifeline.org/get-help/ | Fetched 2026-09-11 | 988 channels | CDN LM ≠ edit date | High |
| 9 | SAMHSA 988 FAQs + end cards | End cards **2023-06-15** | Official CTA; US scope | — | High |
| 10 | https://www.thehotline.org/ + media room | Fetched 2026-09-11 | Numbers; no endorsement | Chat is a button, not a permalink | High |
| 11 | https://www.iasp.info/suicidalthoughts/ | Fetched 2026-09-11 | International | Not a hotline | High |
| 12 | https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ | 2023-02-16 | Push + A2HS | — | High |
| 13 | Apple iPhone User Guide bookmark/A2HS | iOS 26 guide | Current install steps | No calendar stamp | High |
| 14 | caniuse.com/wf-beforeinstallprompt | 2026-09-11 | No BIP on iOS | — | High |
| 15 | APA chatbot advisory | 2025-11-13 | Disclose + interrupt | Guidance | High |
| 16 | NY GBL §1701 / CA SB 243 | 2025–2026 | Companion statutes | Scope UNRESOLVED | High (text) / Med (apply) |
| 17 | Hallow help + Warmpeach review | 2026-06 / 2026-05 | First-open bar | Warmpeach COI | Med-high |
| 18 | YouVersion help (share / verse images) | Live 2026-09 | Share mechanics | — | High |
| 19 | thebiblechat.com About + Terms | Terms 2025-08-06 | Anti-pattern | Marketing vs legal split | High |

Full PWA and legal registers from the research agents are summarized, not duplicated, to keep this file usable.

---

## Chain (requirement → finding → decision → work)

Original #1 loop → research the hard questions → WEB keep, PWA keep, 988 geography fix, install sheet → code + `/legal` + operator kit → Dean deploys HTTPS and runs RELEASE §C.

Investigations that **confirmed** without changing a decision: WEB public-domain status; 988 linking allowed; bible-api.com must not be the store; Encounter should be kept, not deleted.
