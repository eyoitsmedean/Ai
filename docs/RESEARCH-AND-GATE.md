# Red Letter — research synthesis and human-gate memo

**Status: WATCH.** Not legal advice. Not a launch. Opened **2026-09-11**.

**Intended user:** Dean, sitting down to record which English text this household may put on a public URL.

**What this enables:** a recorded choice (WEB, BSB, or KJV-US) with the pages already opened, the contrary evidence already named, and a one-sitting checklist. Without this, the product stays on unlabeled habit.

---

## How to read this

- **Fact** — opened on a primary page this session, or a prior session whose URL was re-opened.
- **Inference** — reasoned from those facts; not a lab study.
- **Recommendation** — a choice for this project. You may refuse it.
- **Unresolved** — still yours.

Every consequential row in the register has a URL, a date, a limitation, and a confidence label. Sources were opened, not counted.

---

## Coverage map

### Core topics (retained)

| Topic | Question | Connection | Already known | Still uncertain | What would change the project |
| --- | --- | --- | --- | --- | --- |
| C1 Spoken-only Gospels | May the page print narrator text (Mt 1:1, Jn 1:1)? | “Does not fake theology.” | `spokenLookup` refuses narrator verses at placeholders and bold cites. | Whether unused WEB-era files should be deleted. | Deleting unused files is reversible; leaving them is safer until you say so. |
| C2 Public-domain English | Which named text may we store in full for a US advisor? | Human gate before any URL. | WEB PD + trademark; BSB dedicated 30 Apr 2023; KJV US-PD / UK Crown. | Whether you want modern voice or KJV grain. | Recording WEB or BSB requires a corpus rebuild (`npm run spoken` against that text). |
| C3 Crisis stop | After 988, may the bot keep quoting Jesus? | Later spec: stop counsel. | `/ask` stops. Folio chat still writes a comfort letter. IASP Jun 2026 wants a human handoff. | Whether the paper folio must match `/ask`. | If you say yes, change `server.js` chat crisis path and its tests. |
| C4 One screen vs folio | Is the five-room book the product? | “Show me your best finished product” vs later WATCH spec. | Folio is the finished paper room. `/ask` is the finished public-shaped screen. | Whether Advisor-as-a-room still stands. | Do not delete the folio. Do not launch it. |
| C5 No fake theology | May we invent sayings, overlay prosperity, or say “Ask Him”? | Original ask. | Copy and tests forbid “Ask Him.” Placeholders only; harness inserts speech. | Tone of the four-line implication (stored vs model). | `/ask` uses stored pack openings, not a model, so implication cannot invent a saying. |

### Five adjacent topics (project-wide, not per-agent)

Chosen for usefulness, not novelty.

| # | Adjacent topic | Why chosen | What it contributes | Decision it informs |
| --- | --- | --- | --- | --- |
| A | WEB vs KJV vs BSB readability for an anxious 25–54 reader | The gate is not only legal. A crisis-adjacent reader must be able to hear the sentence. | Side-by-side Jn 14:27 / Mt 11:28. Inference: BSB smoothest, WEB modern, KJV heaviest. | Prefer WEB or BSB as the recorded public text. Keep KJV as the current household corpus. |
| B | Crisis-stop after 988 (IASP and contrary “don’t hard-stop” papers) | Highest harm surface. | Official IASP text wants a trained human, not more bot. Contrary papers argue against hanging up *before* a human is reached — not for more Gospel advice after 988. | `/ask` already stops. Folio comfort-after-988 stays a conscious exception until you change it. |
| C | Advent 2026 date | The Notion page says “when Advent wants a URL.” A wrong Sunday would be sloppy. | USCCB 2026 and 2027 calendars: First Sunday of Advent **29 November 2026** (Year B). 30 Nov 2025 is the previous Advent. | Calendar only. Not permission to publish. |
| D | One-screen vs multi-room folio | Prompt 3 asked for the best finished product; later law parked the folio. | Both can be true: folio = paper, `/ask` = product shape. | Do not merge them. Do not add a sixth room. |
| E | ESV / NIV quotation thresholds | Temptation to “use a nicer evangelical text.” | Crossway and Zondervan/HCCP gratis caps (~500 verses, 25% of the work, half-book / no full book, apps need a license). A spoken-Jesus store in Mt–Jn fails all of them. | Refuse ESV and NIV. Same for NASB / CSB / NKJV / NLT / The Message without a license in hand. |

**Excluded as drift:** store ads, 90-day cash folio, waitlist growth, adding Paul. Reason: later WATCH law.

---

## Source register

Opened 2026-09-11 unless noted. Excerpts are from the pages, not from memory of earlier chats.

| ID | Question | Finding | Source (opened) | Date | Limits / contrary | Confidence | Implication |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | Is WEB public domain? | Yes. Text is not copyrighted. “World English Bible” is an eBible trademark. Changed text must not be called WEB. | [eBible WEB copyright](https://ebible.org/engwebp/copyright.htm); [WEB FAQ](https://ebible.org/eng-web/webfaq.htm) (FAQ updated 5 Feb 2024); [worldenglish.bible](https://worldenglish.bible/) | 2026-09-11 | Trademark is a name control. Editions differ (WEB / WEBU / WEBBE). Classic OT uses “Yahweh.” | Verified | Safe to store unaltered NT speech and label it WEB. If you abridge or modernize, drop the name. |
| S2 | What does WEB actually say in the two comfort verses? | Jn 14:27 WEBU: “Peace I leave with you. My peace I give to you; not as the world gives, I give to you. Don’t let your heart be troubled, neither let it be fearful.” Mt 11:28: “Come to me, all you who labor and are heavily burdened, and I will give you rest.” | [JHN14 WEBU](https://ebible.org/engwebu/JHN14.htm); [MAT11 WEBU](https://ebible.org/engwebu/MAT11.htm) | 2026-09-11 | WEBU vs classic WEB punctuation may differ. Quote the edition you store. | Verified | Use these if you record WEB. Do not paste them into a KJV-labeled page. |
| S3 | Is BSB public domain? | Dedicated to the public domain as of **30 April 2023**. All uses freely permitted. Attribution appreciated, not required. Altered text should drop the Berean name. | [berean.bible/terms.htm](https://berean.bible/terms.htm); [UNLICENSE](https://raw.githubusercontent.com/BSB-publishing/bsb2usfm/main/UNLICENSE); [eBible BSB copyright](https://ebible.org/engbsb/copyright.htm) | 2026-09-11 | [licensing.htm](https://berean.bible/licensing.htm) still shows “Copyright © 2021 … All rights reserved.” That footer is stale against `terms.htm`. | Verified (dedication); verified (stale footer exists) | Legal alternate to WEB. Resolve the footer from `terms.htm`, not from the footer. |
| S4 | BSB comfort verses | Jn 14:27: “Peace I leave with you; My peace I give to you. I do not give to you as the world gives. Do not let your hearts be troubled; do not be afraid.” Mt 11:28: “Come to Me, all you who are weary and burdened, and I will give you rest.” | eBible BSB chapter pages (opened with S3) | 2026-09-11 | BibleHub still says “Berean Study Bible” in some headers (old name). | Verified | Smoothest of the three for a modern anxious reader (**inference** on readability). |
| S5 | KJV in the US vs the UK | US: public domain (Gutenberg #10). UK: Crown / Cambridge letters patent. CUP printed front matter still vests rights in the Crown; some UK uses ≤500 verses and less than a full book without written permission. | [Gutenberg KJV](https://www.gutenberg.org/ebooks/10); [eBible KJV copyright](https://ebible.org/eng-kjv2006/copyright.htm); [CUP KJV sample PDF](https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf) | 2026-09-11 | The old CUP “Queen’s Printer” explainer now redirects to a generic story page. Crown claim remains on CUP printed KJV. A full Mt–Jn store exceeds 500 verses. | Verified (US PD); verified (UK claim on CUP pages) | Fine for this Idaho household copy. Unsafe as a public UK URL. Poor crisis voice (**inference**). |
| S6 | Is 988 still call or text? | Yes, 2026-09-11. Call, text, or chat. 24/7. US and territories. | [988lifeline.org](https://988lifeline.org); [Get help](https://988lifeline.org/get-help/); [Text FAQ](https://988lifeline.org/faq/texting-the-988-lifeline/faq-how-do-i-text-the-988-lifeline/); [SAMHSA 988 FAQ](https://www.samhsa.gov/mental-health/988/faqs); [findahelpline 988](https://findahelpline.com/organizations/988-suicide-crisis-lifeline) | 2026-09-11 | 988 is not a UK line. Chat is a third official channel. FCC page 403’d in this environment; SAMHSA + 988lifeline suffice. | Verified | Copy may say **call or text 988**. Keep findahelpline.com for anywhere else. |
| S7 | After naming 988, keep quoting? | IASP (10 Jun 2026): need a handoff to a **trained person**, not a disclaimer-plus-bot. No official page found that says “keep quoting Jesus after 988.” | [IASP WHA79 write-up](https://www.iasp.info/2026/06/10/online-safety-ai-and-suicide-prevention/) | 2026-09-11 | PLOS “Goldilocks” and a 2026 Delphi preprint argue against *only* shutting down — they want connection until a human is reached, not spiritual counsel after the hotline. | Verified (IASP); contrary evidence does not authorize more Gospel advice | `/ask` stops. That is the product rule for any public URL. |
| S8 | Advent 2026 | First Sunday of Advent **29 November 2026**. Year B. The 2026 PDF also lists 30 November 2025 as the *previous* Advent. | [USCCB 2026 calendar PDF](https://www.usccb.org/resources/2026cal.pdf); [USCCB 2027 calendar PDF](https://www.usccb.org/resources/2027cal.pdf); [calendar index](https://www.usccb.org/committees/divine-worship/liturgical-calendar) | 2026-09-11 | “Advent 2026” can be misread as the season that opens 2026 (Nov 2025). For a late-2026 URL, use 29 Nov 2026. | Verified | Date only. Not a ship date. |
| S9 | ESV / NIV gratis use | Both: up to 500 verses, not more than 25% of the work, not half / a full book, not a commentary or reference work. Apps need a license. | [Crossway permissions](https://www.crossway.org/permissions/); [Zondervan permissions](https://www.zondervan.com/about-us/permissions/); [HarperCollins Christian permissions](https://www.harpercollinschristian.com/sales-and-rights/permissions/) | 2026-09-11 | Biblica electronic-rights page timed out. US commercial pages are enough to refuse. Spoken Mt–Jn exceeds every cap. | Verified | Refuse ESV and NIV for this advisor. |
| S10 | Readability | Same two sayings: BSB contemporary; WEB modern but slightly stiffer; KJV *ye / unto / giveth / labour* adds load under stress. | Verses in S2, S4, S5 | 2026-09-11 | No Flesch run on the red-letter subset. Gutenberg “77.2 fairly easy” is the **whole** KJV, including narrative. | Inference (style); verses verified | Do not pick KJV because it is already on disk if the public reader is anxious and 25–54. |

---

## Syntheses

### C2 / A / E — Which English text?

**Answer:** For a US public URL, record **unaltered WEB** (recommended) or **unaltered BSB**. Keep **KJV** as the current household disk corpus. Refuse ESV / NIV / other licensed evangelical texts.

**Deeper explanation.** The gate is “may we store every spoken saying in Matthew–John and print it on a screen without a publisher contract?” WEB and BSB both say yes in the United States. WEB’s dedication is the longest-running and the cleanest sentence: the text is not copyrighted; the name is a trademark; change the words and lose the name. BSB’s official date is 30 April 2023; the 2021 footer on the licensing page is a real contradiction on the same site and should be resolved from `terms.htm` plus the publisher UNLICENSE. KJV is public domain **in the USA** and still claimed by Crown / Cambridge **in the UK**. This household is Idaho. The moment the same build is used or imported in the UK, KJV is the wrong public text.

**Disagreements.** A reader who loves the grain of 1611/1769 will want to keep KJV. That is a voice choice, not a US legal requirement. It is a UK legal problem. A reader who wants “the Bible my church uses” will ask for ESV or NIV. Those pages do not allow a full-Gospel advisor without a license.

**Worked example.** Shame pack, Luke 15:4.

- KJV (on disk now): “What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it?”
- WEB (opened this session, do not paste onto a KJV-labeled page as if it were already the corpus): you must load WEB before calling it WEB.
- ESV / NIV: do not paste.

**Decision:** `/ask` labels **KJV** today. The human gate is still open.

### C3 / B — Crisis

**Answer:** On `/ask`, detect crisis → print the 988 notice → print “what this cannot do” → do not print words or implication.

**Deeper explanation.** 988 is still call-or-text on 11 Sep 2026. IASP’s June 2026 statement is about handing a distressed person to a trained human. A Gospel advisor that names 988 and then keeps talking is performing the thing IASP is warning against: a general-purpose bot staying in the counselor’s chair.

**Disagreements.** Some clinical papers say “don’t only hard-stop.” Their concern is abandonment before a human is reached. They are not a license to keep interpreting Luke 15 after “I want to die.” The paper folio still does that (988 + John 14:27 / Matthew 11:28). That is documented drift against the later spec, left in place because the folio is paper and its tests encode the comfort letter.

**Decision:** Public-shaped surface stops. Folio letter is your call.

### C4 / D — One screen and the folio

**Answer:** Both exist. They are not the same job.

The folio is the finished book: Today, Seek, Sit, Advisor letters, Journal, church year, lectio. Prompt 3 asked to see that product. Later law said the *public* product is one screen and the folio stays paper. `/ask` is that screen. It does not replace the book; it refuses to pretend the book is a launch.

### C / Advent

**Answer:** 29 November 2026. Year B. Not a ship date.

### C1 / C5 — Theology constraint

**Answer:** Only spoken lookup text prints. Narrator prologues and genealogies are refused even when the KJV contains them. Implication on `/ask` is stored pack prose, sliced to four lines, never a new saying of Jesus.

---

## Human-gate memo

### What you are recording

Which named English text this household authorizes for a **future** public URL. Recording is not publishing. WATCH still holds after you record.

### Recommended recording (you may refuse)

**WEB, unaltered, New Testament speech of Jesus in Matthew–John, labeled WEB.**

Why: public domain worldwide for the text; trademark rule is clear; modern enough for an anxious reader; already named on the Notion license lock.

Equal-legal alternate: **BSB**, if you want the smoother contemporary line and accept the stale © 2021 footer as a documentation nuisance, not a copyright.

Not recommended as the public text: **KJV** (UK Crown; archaic under stress). **ESV / NIV / NASB / CSB / NKJV / NLT / The Message** (license required for this use).

### Checklist — do this once, on paper or in Notion

1. Open [eBible WEB copyright](https://ebible.org/engwebp/copyright.htm). Read the trademark sentence out loud.
2. Open John 14:27 and Matthew 11:28 in the edition you intend to store (WEBU pages are linked above). Confirm the words you will print.
3. If choosing BSB instead: open [terms.htm](https://berean.bible/terms.htm) dated 30 April 2023. Ignore the 2021 footer as a grant of rights.
4. Write one sentence in your own hand:

   > I record ________ (WEB / BSB / KJV-US-only) as the text Red Letter may quote on a public URL. I have not authorized a launch, a store submit, or GitHub Pages as a product.

5. Date it. Idaho. Keep it under the existing Red Letter Notion page. Do not create a sixth hub.
6. Until a worker rebuilds `data/spoken-gospels.json` from that text, the running app must keep saying **KJV**. Do not relabel first.

### After you record — still not a launch

A later worker may rebuild the spoken corpus from the recorded text, keep `spokenLookup` as the only gate, and leave `/ask` on `noindex` until you lift WATCH.

### Crisis sentence to keep (candidate; already on `/ask`)

Call or text 988 in the United States. Anywhere else, start at https://findahelpline.com. Then stop. No verse. No implication.

---

## Chain (requirement → action)

Original requirement: a faith product that does not fake theology.

→ Research question: which named text, and what happens after 988?

→ Evidence: S1–S10.

→ Finding: WEB or BSB for a US URL; KJV on disk today; stop after 988 on the public-shaped screen.

→ Decision: ship `/ask` as WATCH, labeled KJV; do not publish.

→ Completed work: this memo, the brief, the screen.

→ Next action: you record, or you refuse and leave the household on KJV.

---

## Remaining gaps (named, not filled)

- No counsel was hired. This is not a legal opinion.
- Biblica’s NIV electronic-rights page timed out; Crossway / Zondervan / HCCP were enough to refuse ESV/NIV.
- No Flesch score on the spoken-only subset.
- No UK solicitor opened the letters patent.
- Folio-after-988 is a product decision, not a research gap.
- Translation files for WEB/BSB are **not** in this branch. Recording does not silently switch the corpus.
