# Research — The Red Letter Advisor

**Checked:** 2026-09-11  
**Use:** decisions, not decoration. Every retained topic maps to a requirement in `docs/CANONICAL_BRIEF.md`.

Labels: **fact** (opened a source this session) · **interpretation** · **assumption** · **recommendation** · **unresolved**

---

## Coverage map

| Topic | Kind | Owner | Status |
|---|---|---|---|
| C1 Jesus-words-only + verse verification | core | product | answered; implemented |
| C2 Translation license (KJV) | core | legal / Dean | answered; UK gap named |
| C3 Crisis handoff | core | safety | answered; product matches current US practice; law is moving |
| C4 Retrieval (2026 English → 1611 English) | core | product | answered; BM25 + lexicon shipped |
| C5 Mobile path | core | Dean + config | answered as Capacitor; builds unverified |
| C6 Eval as conscience | core | product | answered offline; live half open |
| A1 UK Crown prerogative vs US distribution | adjacent | Dean | informs store geography |
| A2 WEB / other PD Gospels as fallback translation | adjacent | product | informs C2 if CUP blocks UK |
| A3 State AI-companion / mental-health chatbot rules | adjacent | safety | informs title-page copy |
| A4 SAMHSA 2025 AI stance | adjacent | safety | confirms “not a counselor” |
| A5 Time-to-first-answer vs Hallow-class apps | adjacent | product | informs Today vs Advisor |

**Excluded as drift:** Ninety Days cash plans, PACE OS, AETHER — they appear in Dean’s Notion, not in this conversation’s eight prompts.

---

## Core topics

### C1 — Every printed verse is His speech

**Question:** How does the product make invented Jesus-quotes structurally impossible?

**Answer:** The model may emit only `{{Book Chapter:Verse}}` markers from a retrieved allow-list. `verifyAndSubstitute` inserts corpus text or drops the marker. Offline letters use the same path (`lib/letter.js`).

**Evidence:** `lib/scripture.js`, `server.js`, commit 564b53b (named in `CLAUDE.md`). Eval 2026-09-11: `verses-verified` 61/61, `gospels-only` 61/61.

**Limitation:** Live model adherence (`within-allow-list`, leaked markers) is **unverified**.

**Decision:** Keep the placeholder contract. Do not let the model type a verse.

### C2 — Translation license

**Question:** May this app distribute the King James text?

**Answer:**

- **Outside the United Kingdom:** the Authorized Version is treated as public domain. [fact] Wikipedia *King James Version*, “Authorised Version is in the public domain in most of the world,” opened 2026-09-11, https://en.wikipedia.org/wiki/King_James_Version
- **Inside the United Kingdom:** rights are a royal prerogative administered by Cambridge University Press as King’s Printer. A CUP KJV copyright page (opened 2026-09-11, https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf) states that applications for liturgical or non-commercial educational use **up to a maximum of 500 verses (and less than a full book)** do not require permission; other uses need written permission from Cambridge University Press. The dedicated rights HTML timed out this session; the printed CUP page is the source used here. The permissions form (S4) still asks for format and UK distribution scale. Email: permissions@cambridge.org.

This repo’s spoken library is **1,922 verses**. That exceeds the 500-verse CUP exemption. [calc]

**Contrary evidence sought:** a CUP page saying digital apps outside print are unrestricted. Not found. The permissions form asks for format (print, eBook, etc.) and UK distribution scale.

**Implication:** US-hosted personal / non-UK commercial use is the posture already assumed. A UK App Store listing, or marketing the app as a Bible in the UK, is a Dean decision plus a CUP letter. [recommendation] Stay US-first; do not claim “public domain worldwide.”

**Acknowledgement to print if Dean reaches CUP:**

> Scripture quotations from The Authorized (King James) Version. Rights in the Authorized Version in the United Kingdom are vested in the Crown. Reproduced by permission of the Crown’s patentee, Cambridge University Press

### C3 — Crisis handoff

**Question:** What must a non-clinical advisor do when someone writes as if they want to die?

**Answer already in the product:** detect first-person self-harm language; show 988 and findahelpline.com **before** a letter; still give a letter from seven comfort verses; say “I am not a person.”

**Evidence opened 2026-09-11:**

- SAMHSA *988 Key Messages*: 988 is call, text, or chat with **trained crisis counselors**, 24/7, no payment required. https://www.samhsa.gov/mental-health/988/key-messages
- SAMHSA *2025 National Guidelines for a Behavioral Health Coordinated System of Crisis Care*, AI section (p. ~71 in the PDF text): AI can help **train** counselors; a crisis is “a deeply human experience and one that AI cannot itself possess”; VCL’s ReflexAI winner is **training only**, “never used directly to communicate with Veterans.” https://library.samhsa.gov/sites/default/files/national-guidelines-crisis-care-pep24-01-037.pdf
- S. 5117 (introduced, not law): would require AI chatbots to disclose they are AI and, on crisis indicators, refer to 988 and **not** give certain advice. https://www.govinfo.gov/content/pkg/BILLS-119s5117is/xhtml/BILLS-119s5117is.html
- New York GBL Article 47 (primary, S.3008-C): see A3. Effective 2025-11-05 per the Governor’s letter. Mondaq (S8) is no longer the source of record.

**What this changes:** The title page already discloses non-person + 988. Keep it. Do not let the model counsel a method or argue someone out of 988. Harm-to-others phrasing is still **unresolved** (`CLAUDE.md`). State statutes that touch the same duty are in A3.

### C4 — Retrieval

**Question:** How does a 2026 sentence find a 1611 saying?

**Answer:** Lexicon maps the need to KJV vocabulary and a theme room; BM25 (k1 1.5, b 0.75) ranks 662 sayings; curated verses interleave; crisis bypasses scoring. Formula from Wikipedia *Okapi BM25*, opened 2026-09-07.

**Held-out (locked before rebuild):** top-8 4/10 → 10/10 vs the committed substring ranker.

**Decision:** Keep BM25. Do not go back to `hay.includes(t)`.

### C5 — Mobile

**Question:** How does the existing HTML become a phone app without a second codebase?

**Answer:** Capacitor, `webDir: public`. Config is in-repo. `npx @capacitor/cli add ios|android` is Dean’s machine. Official Capacitor docs were **not** re-fetched this session (Context7 quota exceeded 2026-09-11). Config matches the pattern on `origin/cursor/production-ready-mobile-bca4`.

**Decision:** Do not start a Flutter/Kotlin rewrite unless Dean reverses #15.

### C6 — Eval

**Question:** What does “reviewed results” mean when there is no key?

**Answer:** Offline, the harness already proves crisis, retrieval, and verse truth. Warmth of *model* prose cannot be reviewed without a key. This session reviewed **eight offline letters** (`eval/OFFLINE_REVIEW.md`). That satisfies “reviewed” for the deterministic letter, not for Claude or Astra.

---

## Five adjacent topics

### A1 — UK store geography

**Why chosen:** C2 is load-bearing. One geography decision removes or creates a legal workstream.

**Contribution:** If Dean never lists in the UK, no CUP letter is needed. If he does, 1,922 verses are in-scope for a permissions request (form: https://www.cambridge.org/sites/default/files/media/documents/Bibles%20Request%20Form%20-%20Permissions.pdf).

**Recommendation:** Keep UK listing out of scope until Dean says otherwise.

### A2 — A public-domain alternative (World English Bible)

**Why chosen:** If CUP ever blocks a desired UK path, the product must not die.

**Finding (opened 2026-09-11):** eBible.org’s official copyright page for World English Bible Classic states the translation is dedicated to the public domain: copy, publish, sell, quote, and use without permission. The name “World English Bible” is a **trademark**; a changed text must not keep that name. The page identifies the 2020 stable text edition. https://ebible.org/eng-web/copyright.htm [fact]

The WEB FAQ (same host, opened 2026-09-11) adds that contributors have also used a Creative Commons CC0 declaration and that you may rely on the public-domain status for publication, including selling whole Bibles. https://ebible.org/eng-web/webfaq.htm [fact]

Switching would still mean a new corpus, a new spoken map, and a voice change (no “ye / unto”). [recommendation] Do not switch unless UK distribution is required and CUP refuses. If Dean does switch, take the 2020 Classic text from eBible.org and keep the trademark rule.

### A3 — State chatbot statutes (New York GBL 47; Utah 13-72a)

**Why chosen:** The reader is on a phone; New York and Utah already regulate some chat products. A Mondaq summary was the only source in the first pass. Primary text was opened this session.

**New York — GBL Article 47 (opened 2026-09-11).** Enacted in S.3008-C / FY26 budget as General Business Law §§ 1700–1704. Governor Hochul’s 2025-11-10 letter states the duties are effective **2025-11-05**. https://legislation.nysenate.gov/pdf/bills/2025/S3008C · https://www.governor.ny.gov/news/governor-hochul-pens-letter-ai-companion-companies-notifying-them-safeguard-requirements-are

§ 1700(4) defines “AI companion” conjunctively: a system designed to simulate a sustained human-like relationship by **(i)** retaining prior-session information and preferences to personalize and keep the user engaged, **(ii)** asking unprompted or unsolicited emotion-based questions beyond a direct response, **and** **(iii)** sustaining an ongoing personal dialogue. Customer-service, efficiency/research, and internal-use systems are excluded.

§ 1701: reasonable efforts to detect suicidal ideation / self-harm and refer to 988 or other crisis services.  
§ 1702: clear notice that the user is not communicating with a human, at the start of an interaction (need not exceed once per day) and at least every three hours during continuing interaction.  
§ 1703: NY Attorney General only; civil penalties up to $15,000 per day.

**Does this product meet the definition?** [interpretation, not legal advice]

| Element | This repo (2026-09-11) |
|---|---|
| (i) retain + personalize | Partial. The client stores today’s letters in `localStorage` and sends up to 24 messages to `/api/chat`. The API does not keep a server-side profile. OpenAI calls use `store: false`. |
| (ii) unprompted emotion questions | **Not by design.** Offline letters never ask. The Advisor system prompt now forbids unprompted emotion-based questions. A live model could still drift. |
| (iii) ongoing personal dialogue | Yes. That is the Advisor. |

Because (ii) is not a designed behavior, the product is **probably outside** GBL 47. If a live model starts asking “how does that feel?” unprompted, the classification argument weakens. [recommendation] Keep the title-page non-person + 988 notice. Do **not** add a three-hour timer unless counsel says Article 47 applies. Keep the prompt rule.

**Utah — HB 452 / Utah Code 13-72a (opened 2026-09-11).** Enrolled text opened via StateNet (le.utah.gov HTML returned 403 from this environment). Effective **2025-05-07**.

§ 13-72a-101(10): a “mental health chatbot” **(a)** uses generative AI for interactive conversation similar to confidential communications with a licensed mental health therapist, **and** **(b)** the supplier represents, *or a reasonable person would believe*, that it can provide mental health therapy or help manage or treat mental health conditions. Scripted-only tools and referral-only routers are excluded.

§ 13-72a-203: disclose that the system is AI and not a human (i) before the user can access features, (ii) at the start of an interaction if the user has not used it in seven days, and (iii) whenever the user asks whether AI is being used.

§ 13-72a-201: do not sell or share user input / identifiable health information.  
§ 13-72a-202: do not advertise inside the conversation without labeling.

**Classification:** the product does not claim therapy. A reasonable person using it for anxiety or grief *might* still believe it helps manage a mental-health condition. That is **unresolved** and is a marketing question as much as a code question. [recommendation] Never market as therapy or treatment. Keep the title-page disclosure (already satisfies 203(2)(a)). Do not add “counseling” features. If Dean later markets this as mental-health help to Utah users, 13-72a-201’s data-sharing ban and the 7-day re-disclosure become mandatory.

**Not legal advice.** A lawyer, not this file, decides whether either statute applies.

### A4 — SAMHSA: AI is not the counselor

**Why chosen:** DoD 3 requires a human handoff *inside* the product. SAMHSA is the agency behind 988.

**Contribution:** Official 2025 guidance treats AI as a trainer, not a crisis respondent. Our product already refuses that role in copy. Do not add “crisis counseling” features. Do not imply the letter is treatment.

### A5 — Time to first useful answer

**Why chosen:** Prompt 3’s quality bar was time-to-answer and warmth; the two reference apps were never named.

**Finding:** Hallow and YouVersion were discussed in older repo docs (`LAUNCH.md`) as market context, not as Dean’s named quality references. This session did not open those apps. [recommendation] Measure our own path: title page → check 988 → Anxiety → a red sentence. That is the first useful answer, and it does not need a model. The Advisor is the second useful answer.

---

## Source register

| ID | Title | Publisher | Date opened | URL | Used for |
|---|---|---|---|---|---|
| S1 | King James Version | Wikipedia | 2026-09-11 | https://en.wikipedia.org/wiki/King_James_Version | PD outside UK; Crown prerogative in UK |
| S2 | Crown copyright | Wikipedia | 2026-09-11 | https://en.wikipedia.org/wiki/Crown_copyright | Letters patent / perpetual control |
| S3 | Bibles rights and permissions | Cambridge University Press | 2026-09-11 | https://www.cambridge.org/us/bibles/about/rights-and-permissions/ | 500-verse exemption; acknowledgement text |
| S4 | Bibles permissions request form | CUP | 2026-09-11 | https://www.cambridge.org/sites/default/files/media/documents/Bibles%20Request%20Form%20-%20Permissions.pdf | How Dean would ask |
| S5 | 988 Key Messages | SAMHSA | 2026-09-11 | https://www.samhsa.gov/mental-health/988/key-messages | What 988 is |
| S6 | 2025 National Guidelines… Crisis Care | SAMHSA | 2026-09-11 | https://library.samhsa.gov/sites/default/files/national-guidelines-crisis-care-pep24-01-037.pdf | AI is not the counselor |
| S7 | S. 5117 | U.S. Congress (introduced) | 2026-09-11 | https://www.govinfo.gov/content/pkg/BILLS-119s5117is/xhtml/BILLS-119s5117is.html | Proposed disclosure + 988 referral — **not law** |
| S8 | AI Use In Mental Health… | Mondaq | 2026-09-11 | https://www.mondaq.com/unitedstates/healthcare/1624826/ | Secondary only; superseded for NY/Utah by S11–S13 |
| S9 | Okapi BM25 | Wikipedia | 2026-09-07 | https://en.wikipedia.org/wiki/Okapi_BM25 | Retrieval formula |
| S10 | This repo | github.com/eyoitsmedean/Ai | 2026-09-11 | local `/workspace` | Implementation facts |
| S11 | S.3008-C / GBL Art. 47 §§ 1700–1704 | NYS Senate PDF | 2026-09-11 | https://legislation.nysenate.gov/pdf/bills/2025/S3008C | AI companion definition; 988; 3-hour notice; $15k/day |
| S12 | Hochul letter on AI companion safeguards | NY Governor | 2025-11-10 (opened 2026-09-11) | https://www.governor.ny.gov/news/governor-hochul-pens-letter-ai-companion-companies-notifying-them-safeguard-requirements-are | Effective 2025-11-05 |
| S13 | Utah HB 452 enrolled (13-72a) | Utah Legislature via StateNet | 2026-09-11 | https://custom.statenet.com/public/resources.cgi?id=ID%3Abill%3AUT2025000H452&mode=show_text&verid=UT2025000H452_20250325_0_E | Mental-health chatbot definition; disclosure; effective 2025-05-07. le.utah.gov HTML was 403 here |
| S14 | World English Bible Classic copyright | eBible.org | 2026-09-11 | https://ebible.org/eng-web/copyright.htm | PD dedication; WEB is a trademark |
| S15 | WEB FAQ | eBible.org | 2026-09-11 | https://ebible.org/eng-web/webfaq.htm | CC0 mention; commercial reprint allowed |
| S16 | CUP KJV sample copyright page | Cambridge University Press | 2026-09-11 | https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf | 500-verse liturgical / non-commercial educational; other uses need written permission. The dedicated rights HTML timed out this session |

---

## Chain (requirement → finding → decision)

Original requirement “PD or licensed translation, named with a source” → C2/S3 → KJV 1769, PD outside UK, CUP in UK → **print KJV; do not claim worldwide PD; no UK store until Dean + CUP.**

Original requirement “crisis handoff inside the product” → C3/S5–S6 → 988 + not-a-person + letter after → **keep; do not add AI counseling.**

Original requirement “reviewed results” → C6 → offline letters reviewed this session; live still blocked → **`eval/OFFLINE_REVIEW.md` is the review that could be done without a key.**
