# Research — Red Letter (this conversation)

**As of:** 2026-09-11.  
**Brief:** [`docs/CANON.md`](CANON.md).  
**Rule:** every URL below was opened this session (or named as blocked). No invented verses, interviews, or user tests.

This file is the source register and the synthesis. It is not the product.

---

## Coverage map

| ID | Kind | Question | Owner | Status | Changes the product? |
| --- | --- | --- | --- | --- | --- |
| C1 | Core | What did the first ten prompts actually ask? | Lead | Answered in CANON | Yes — Muse was a means; finished reviewable work is the ask |
| C2 | Core | What later amendments outrank atelier launch language? | Lead | Answered in CANON + Notion | Yes — WATCH, paper folio, one screen, WEB/KJV lock |
| C3 | Core | What is the current code vs that brief? | Lead | Diagnosed | Yes — `/ask` is the missing product; folio is atelier |
| C4 | Core | Which Bible texts may a free US advisor paste? | Research | Answered below | Yes — WEB or KJV-US; not NIV/ESV/NASB/NRSV/CSB/Message |
| C5 | Core | What must a crisis path do? | Research | Answered below | Yes — `/ask` stops; folio still verses (drift) |
| C6 | Core | What is Jesus-speech scope and seal? | Existing CLAUDE | Confirmed | Keep — do not reopen unless Dean asks |
| A1 | Adjacent | WEB vs KJV for a public URL | Research | Recommend WEB, human gate | Blocks any URL |
| A2 | Adjacent | Crisis stop vs verses-after-988 | Research | `/ask` = stop | Product split |
| A3 | Adjacent | Folio-stays-paper vs digital Press | Research | Keep atelier HTML | Do not launch five rooms |
| A4 | Adjacent | One-screen vs five-room | Research | `/ask` is the intent | Built this cycle |
| A5 | Adjacent | Idaho / US-only vs GitHub Pages | Research | Pages would be a public URL | Do not merge as launch |

**Excluded as drift (not researched further):** store screenshots, Lent 2027 launch calendar as a ship date, Capacitor store submit, paid IAP, UK Crown as a US-household problem, Grok F1–F3 (Lamp / Academy / DEX).

---

## C1–C3 — Recovered brief vs code

See [`docs/CANON.md`](CANON.md). Short restatement:

The earliest ten prompts in *this* conversation ask for finished work under Muse → Forge → Atelier → Rebuild. Prompt 9 still contains a filled “Red Letter Advisor” brief (iOS/Android, Lent, eval ≥40). Prompt 10’s brief fields are blank. Later Notion pages, edited the same day, cancel launch and store submit, lock folio as paper, and specify one screen plus a human text gate.

The repo already has a working five-room folio and a sealed KJV corpus. It did not have a walkable one-screen page that matches the later amendment. That gap is the real obstacle this cycle addresses.

---

## C4 — Which text may a free US advisor paste?

### Terms

- **Paste** = the advisor displays verse text to a person who did not bring their own Bible.
- **Free US advisor** = no paid license, household in Idaho, no confirmed UK distribution.
- **Name** = the translation’s trademarked title (WEB, NIV, …).

### Established (opened 2026-09-11)

**World English Bible (WEB)**  
Source: [eBible WEB+ copyright](https://ebible.org/engwebp/copyright.htm) and [WEBU about](https://ebible.org/study/content/texts/engwebu/about.html).

- The *text* is dedicated to the public domain (copyright notice: “Public Domain”).
- “World English Bible” is a **trademark**. You may not call a *changed* text WEB.
- Apocrypha/Deuterocanon in some WEB editions is also public domain on that page.
- This session opened **one** WEB Gospel page: [Matthew 11](https://ebible.org/engwebp/MAT11.htm) (the `/web/MAT11.htm` path 404s; `engwebp` is the live file). Verse 28 on that page reads: “Come to me, all you who labor and are heavily burdened, and I will give you rest.”  
- **No other WEB verse was opened.** Do not quote other WEB lines from memory in a public page.

**KJV (US)**  
The 1769 Cambridge standard text is treated in this repo as public-domain in the United States (`data/gospels-kjv.json`, `LICENSE`). That is the sealed atelier corpus.

**KJV (UK)**  
Opened: [Yale Divinity — King James Bible](https://guides.library.yale.edu/c.php?g=295559&p=7902908) (rights in the *text* claimed in the UK until 2039; Crown via Cambridge).  
Opened: [Law Stack Exchange, citing Cambridge permissions](https://law.stackexchange.com/questions/20128/is-the-kjv-protected-by-copyright-in-the-uk) — Cambridge’s quoted policy: up to **500 verses**, provided they are not a complete book and not more than 25% of the work.  
Opened: [Wikipedia, King James Version, copyright section](https://en.wikipedia.org/wiki/King_James_Version#Copyright_status) — that page said “500 **words**.” That conflicts with the Cambridge-quoting sources. **Treat “500 words” as disconfirmed** until Cambridge’s own page is read. Cambridge’s site was Cloudflare-blocked this session.

Dean’s Idaho household does not make UK Crown the *controlling* rule. A GitHub Pages URL on the default branch *would* be reachable from the UK. That is why Pages is not a launch.

**Berean Standard Bible**  
Opened: [Berean licensing](https://berean.bible/licensing.htm) (page: public domain as of April 30, 2023; licensing not required; “© 2025 All rights reserved” still appears in the footer — the licensing paragraph is the operative grant). Usable as a *future* option. Not adopted this cycle (no BSB corpus in repo; Dean has not recorded a choice).

**Locked out for a free public advisor** (from Dean’s license-lock page, not re-litigated here): NIV, ESV, NASB, NRSV, CSB, The Message. Do not paste them.

### Disputed / unknown

- Exact Cambridge verse-count page (blocked).
- Whether a Pages URL plus a robots disclaimer is enough to stay “US-only.” It is not a legal opinion; treat as **public**.
- Dormant `data/scripture.js` WEB fetch — still an open CLAUDE question.

### Decision this cycle

Keep the sealed KJV atelier. Build `/ask` on that seal so quotes are already in-repo and tested. Show **one** WEB line (Matthew 11:28 from the opened eBible page) only as an empty-state *example*, labeled WEB, with the eBible URL and date. Dean must record WEB vs KJV-US before any public URL. Recommendation for that recording: **WEB** if the URL will exist; **KJV** if the folio stays household-only.

---

## C5 — Crisis path

### Official sources opened 2026-09-11

- [988 Suicide & Crisis Lifeline](https://988lifeline.org/) — call, text, or chat 988, 24/7, United States.
- [Find A Helpline](https://findahelpline.com/) — directory for 175+ countries (use when the reader is not in the US).

Abuse numbers already locked in `CLAUDE.md` (NDVH, RAINN) were not re-fetched this session; do not invent replacements.

### Product rule (Dean, later amendment)

Name a human hotline. **Stop generating counsel.** No verses after 988.

### Adjacent law (not controlling)

Oregon [SB 1546 (enrolled, 2026 session)](https://olis.oregonlegislature.gov/liz/2026R1/Downloads/MeasureDocument/sb1546/Enrolled) — operators of AI companions: disclose non-human output; protocol to detect suicidal / self-harm ideation; refer to 988 (and a youthline under 25). Secondary write-ups (e.g. [WTL Governance](https://wtlgovernance.com/insights/updates/oregon-sb-1546-ai-companion-safety-law/), retrieved 2026-09-11) describe an **interrupt** duty. Dean is in **Idaho**. The statute is a signal, not Idaho law. The product rule (stop + 988) is compatible with interrupt-and-refer. “Further intervention” on this page means **repeat the human number**, not more theology.

### Decision this cycle

`/ask` implements stop. The folio Advisor still appends Matthew 11:28 (and kin) after 988. That is recorded drift. Do not silently change folio letters this cycle — `npm run eval` (82) encodes the old scripts. Changing folio crisis copy is a future eval rewrite, not a drive-by.

---

## C6 — Jesus-speech scope

Unchanged from `CLAUDE.md`. Seal admits only red letters. `refOther` for Luke 2:14 and John 1:1. Narrator frames stripped except Matthew 24:39 and Luke 20:13. Crucifixion English on Matthew 27:46 / Mark 15:34 is in (reversible). Not re-opened.

---

## A1 — WEB vs KJV for a public URL

**Answer:** If Dean ever records a public URL, prefer WEB for the pasted Gospel text. Keep KJV as the sealed atelier until that recording exists.

**Why:** WEB’s text is public domain worldwide on the pages opened today; the risk is the trademark if the text is altered. KJV-US is fine in-country and already sealed. KJV-UK is the problem the moment the same bytes are on a global URL.

**Disagreement:** A craftsman can argue KJV *is* the folio’s voice and changing it breaks the object. That argument wins for the paper/atelier object. It loses for a public HTML advisor.

**Worked example:** Empty state on `/ask` may show WEB Matthew 11:28 from eBible (opened). A live answer on `/ask` still uses the sealed KJV verse for that citation until Dean records a swap. The page must say so.

---

## A2 — Crisis stop vs verses-after-988

**Answer:** The later amendment wins. `/ask` stops. Folio is atelier and still verses; that is a known defect relative to the amendment, not a second product.

**Contrary case:** Some readers *want* a verse after the number. Dean already rejected that for the one-screen advisor. Do not “A/B” it on `/ask`.

**Failure mode:** A future agent “aligns” folio letters without rewriting eval and ships a red CI. Owner: whoever touches `lib/advise.js` crisis copy.

---

## A3 — Folio-stays-paper vs digital Press

**Answer:** “Paper” means the *product* is not the website. The HTML folio is an atelier: useful for Dean, not a launch. Keep it. Do not add a fifth public room. Do not treat Press/Today/Seek as the thing to wow reviewers with.

**This cycle:** `/ask` is the reviewable object. Folio remains at `/`.

---

## A4 — One-screen vs five-room

**Answer:** The intended user-facing shape is four blocks on one screen. Five rooms are navigation for the atelier. Building `/ask` is the correction, not a redesign of the folio.

---

## A5 — Idaho / US-only vs GitHub Pages

**Answer:** Enabling Pages on the default branch is a public URL. Dean’s This-week page puts **publish** on HOLD. Do not merge this branch as a launch. `LAUNCH.md` and store copy stay parked.

**Unknown:** Dean has not named a host. Open question 5 in CLAUDE remains open.

---

## Source register (opened this session)

| Date | URL | What it was used for | Limitation |
| --- | --- | --- | --- |
| 2026-09-11 | https://988lifeline.org/ | US crisis number is 988; call/text/chat | US-scoped |
| 2026-09-11 | https://findahelpline.com/ | Non-US directory | Directory, not a single hotline |
| 2026-09-11 | https://guides.library.yale.edu/c.php?g=295559&p=7902908 | UK Crown / Cambridge claim on KJV text to 2039 | Library guide, not counsel |
| 2026-09-11 | https://law.stackexchange.com/questions/20128/is-the-kjv-protected-by-copyright-in-the-uk | Secondary; quotes Cambridge 500-**verse** policy | Not Cambridge primary; not counsel |
| 2026-09-11 | https://en.wikipedia.org/wiki/King_James_Version#Copyright_status | Said 500 **words** — disconfirmed against the two sources above | Tertiary; conflict |
| 2026-09-11 | https://www.cambridge.org/about-us/who-we-are/queens-printers-patent (attempt) | Cambridge primary | **Blocked** (Cloudflare) |
| 2026-09-11 | https://ebible.org/engwebp/copyright.htm | WEB text PD; name is trademark | Read the page; do not alter and still say WEB |
| 2026-09-11 | https://ebible.org/study/content/texts/engwebu/about.html | Same grant, WEBU edition | Same |
| 2026-09-11 | https://ebible.org/engwebp/MAT11.htm | WEB Matthew 11:28 wording (live). `/web/MAT11.htm` 404s | **Only WEB verse opened** |
| 2026-09-11 | https://olis.oregonlegislature.gov/liz/2026R1/Downloads/MeasureDocument/sb1546/Enrolled | Oregon SB 1546 enrolled text — detect ideation, refer to 988 | Adjacent; Idaho is not Oregon |
| 2026-09-11 | https://wtlgovernance.com/insights/updates/oregon-sb-1546-ai-companion-safety-law/ | Secondary: interrupt + 988 | Not the statute |
| 2026-09-11 | https://berean.bible/licensing.htm | BSB PD as of 2023-04-30 | Footer copyright line is confusing; not adopted |
| 2026-09-11 | https://app.notion.so/3d8b7d53f969812f9d88eac827b219e0 | One-screen / not a launch | User-edited; wins |
| 2026-09-11 | https://app.notion.so/3d8b7d53f96981958a71e8effc74a2d5 | License lock | User-edited; wins |
| 2026-09-11 | Transcript `…/bc-9d879086-030e-42d8-9728-b1e611e98634/transcript.json` | First ten human prompts | No per-prompt timestamps |

**Not opened / not claimed:** Cambridge permissions PDF, Idaho statutes, NIV/ESV licenses, user interviews, live-model eval, iOS device.

---

## Chain (requirement → question → evidence → finding → decision → work)

1. Finished work I can review (prompts 5–10) → what is the product? → Notion one-screen + WATCH → `/ask`, not a store build → `public/ask.html`.
2. Do not publish (This week) → is Pages a launch? → Pages on default branch is a URL → do not merge as launch → README/CLAUDE say WATCH.
3. License lock → which text? → WEB PD + KJV-US atelier + UK Crown if global → human gate; one WEB example only → RESEARCH + empty state.
4. Stop counsel after 988 → does folio comply? → `lib/advise.js` still quotes after 988 → `/ask` stops; folio drift recorded → `lib/ask.js`.
5. Folio stays paper → kill Press? → no; it is atelier → keep `/` ; point reviewers at `/ask`.
