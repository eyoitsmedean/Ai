# Research synthesis — Red Letter Advisor

**Review date:** 11 September 2026  
**Scope:** Recovered brief in `docs/CANONICAL-BRIEF.md`  
**Claim labels:** FACT · INTERPRETATION · ESTIMATE · ASSUMPTION · RECOMMENDATION · UNRESOLVED  
**This is not legal, financial, medical, or pastoral advice.**

Sources were opened or fetched this session unless marked *prior-repo*. Search snippets were not treated as evidence. Where a preferred direction could be wrong, contrary evidence is stated next to the claim.

---

## How to read this

Original requirement → question → evidence → finding → decision → next action.

If an investigation did not change a decision, it either **confirmed** the direction, **set a boundary**, or **left a gap**.

---

## Coverage map

### Retained core topics

| ID | Question | Why it is core | Owner |
| --- | --- | --- | --- |
| C1 | What product did Dean actually commission? | Prompt 1 + later WATCH | Brief |
| C2 | Who already owns the category, and what hole is left? | Prompt 1 market research | This file |
| C3 | Which English text may a US public advisor quote in full? | ATELIER + 11 Sep license lock | This file |
| C4 | What must the one screen do, and what must it refuse? | Notion one-screen | `/ask` |
| C5 | How should crisis be handled? | ATELIER DOD + Notion | This file + `lib/ask.js` |
| C6 | Why is the repo fragmented, and which tree is the product? | Prompts 7–9 | This file |

**Excluded as drift (recorded, not researched further tonight)**

| Topic | Reason |
| --- | --- |
| Full Bible study / commentary product | Prompt 1 asked for red words, not YouVersion |
| Scholarship-first inversion | ATELIER: “product intent was inverted once” |
| Weekly subscription SKU design | `LAUNCH.md` already forbids it; Bible Chat is the cautionary case |
| Mega-merge of three Advisor trees | Prompts 7–9: conflicting intents; weeks of conflicts |
| Store listing copy | Explicitly excluded: no store submit |

### Five adjacent topics (project-wide, not per-agent)

| ID | Topic | Why chosen | Decision it informs |
| --- | --- | --- | --- |
| A1 | Translation license for a US public advisor (WEB / BSB / KJV / Crown copyright) | A public URL without this is a lawsuit or a takedown | Human gate; do not swap tonight |
| A2 | App Store Review Guideline 4.2 (minimum functionality) | Prompt 22 asked for iPhone/Android “tomorrow”; later: no store | PWA + home-screen, not a thin Capacitor submit |
| A3 | Crisis UX: always-on 988 versus detection scores | ATELIER wants ≥40-q eval; held-out detector scores exist on studio-codex and were **not re-run tonight** | Helpline is primary; do not ship on detectors |
| A4 | Hallow / Bible Chat / YouVersion economics (2025–2026) | Prompt 1’s commercial ambition | Named path + free words; no weekly paywall; Lent 2027 is the calendar |
| A5 | Which git tree is the product | Fragmentation is the real obstacle | Ship `/ask` on guest-hour; leave Codex/eval on their branches |

---

## C1 — What was actually commissioned?

**Answer.** A long-running product that (a) researches the Christian-app market, (b) owns the “words of Jesus” niche, (c) gives encouragement from those words, and (d) is beautiful enough to impress a Notion-sensitive human — later constrained to **chat-first, one screen, WATCH, no public URL** until Dean records a translation.

**Evidence.** Transcript user prompts 1–6, 10, 22, 29; Notion pages fetched 11 Sep 2026 (see brief).

**Disagreement.** Prompt 1 is commercial and expansive. 11 Sep Notion is anti-launch. **Later amendment wins.** Building continues; publishing does not.

**Implication.** Flagship 3 is `/ask` locally, not a store app.

---

## C2 / A4 — Category owners and the remaining hole

### Finding

Nobody with scale owns “live daily life guided **only** by the red letters” as a premium brand. YouVersion owns **reading**. Hallow owns **seasonal prayer habit + annual subscription**. Bible Chat owns **download volume via “talk to Scripture”** and pays for it in trust.

### Evidence opened 11 Sep 2026

| Claim | Status | Source | Date / context | Limit |
| --- | --- | --- | --- | --- |
| YouVersion family reached **one billion device installs** | FACT (first-party, completed-milestone wording) | [YouVersion blog, 13/18 Nov 2025](https://blog.youversion.com/2025/11/a-billion-reasons-to-celebrate/) — “have hit one billion installs.” The [28 Oct 2025 news page](https://www.youversion.com/news/bible-app-reaches-one-billion-installs) is a pre-celebration piece (title “Reaches”; body “will celebrate” / “approaches”). | Installs ≠ unique humans. Family = Bible App, Lite, Kids. |
| YouVersion apps are free; created by Life.Church | FACT (first-party) | Same Oct/Nov pages | 2025 | **Funding model** (“ministry-funded”) is INTERPRETATION, not stated as such on those pages. |
| Hallow ~**$40M net** revenue in 2025 | ESTIMATE (vendor analytics) | [Appfigures, “The Most Predictable Spike in the App Store”](https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue) | Article dated **Feb. 24** (page year context = 2026 Lent). Author: Ariel. “All figures… estimated… net… after Apple and Google took their fee.” | Not audited financials. Do not treat as GAAP. |
| Ash Wednesday **263K** downloads (2026); same day **263K** in 2024; **226K** in 2025 | ESTIMATE (Appfigures Intelligence) | Same article | Ash Wednesday 2026 = **18 Feb 2026** (stated). 2024 = 14 Feb; 2025 = 5 Mar. | Third-party download model. |
| Hallow Lent-month downloads peaked **2M** (2024), **1.5M** (2025), 2026 February **1.2M** with a week left | ESTIMATE | Same | Surrounding-week surge may be fading even as Ash Wednesday is clockwork | Could be wrong if late-February 2026 recovered; article is mid-spike. |
| Post-Lent revenue peak **$10M** net Mar 2024; **$9.7M** net Apr 2025 | ESTIMATE | Same | Trial delay: downloads in Feb, cash in Mar/Apr | Same vendor caveat. |
| Hallow US list prices **$9.99 / month**, **$69.99 / year** | ESTIMATE / unconfirmed tonight | Appfigures profile quoted listing terms; the Lent article does **not** state these prices. Profile timed out on re-open. | 11 Sep 2026 | Confirm on a live App Store listing before using in ads or a pitch. |
| Pray40 is a 40-day Lent program with celebrity names | FACT (product description) + ESTIMATE (1.4M participants “last year”) | Appfigures article | 2026 lineup named: Wahlberg, Roumie, Pratt, Stefani, Daigle | Participant count is the article’s claim, not Hallow’s IR. |
| Hallow raised **$105M** | FACT-as-reported | Same article | Not independently re-verified this session against Crunchbase/SEC | Treat as reported, not opened-from-primary. |

**Bible Chat.** This session did **not** open a first-party 10-K or a current App Store listing with weekly SKU text. Prior-repo `MARKET_STRATEGY.md` and `LAUNCH.md` (August 2026 addendum) claim high downloads, **$4.99/week**, and trust/refund damage. **Status: PRIOR-REPO / UNVERIFIED tonight.** Do not cite a revenue number. The **decision** (never sell a week) still stands as a trust recommendation, not as proven causality.

**Red-letter apps.** Contrary-evidence pass (11 Sep 2026) still found **no scaled niche-owner**. Near-misses to name:

- **Red Letter Challenge** ([redletterchallenge.com](https://redletterchallenge.com/)) — first-party: 1,200+ churches, 300,000+ people. A 40-day **book / church campaign**, not a live advisor. Brand collision on “red letter,” relevant to Lent 2027 naming.
- **Red Letter Cards** (App Store id 6769763845 / getfaithdaily.com) — conceptually close (“tell Jesus your problem”); **not enough ratings to display**. Not scaled.
- **Text With Jesus** — AI chat-as-Jesus (iOS ~3.8K ratings). Opposite of “do not pretend the model is Jesus.”
- YouVersion already has a “Red Letter Words of Jesus” reading plan. They can occupy the theme tomorrow.

Prior-repo scan still holds: most store hits are KJV red-letter **toggles** or thin quote dumps. **Status: INTERPRETATION, confirmed by absence of a scaled advisor in this session’s opened listings, not by a complete store census.**

### Contrary evidence

- YouVersion can add a “Words of Jesus” plan or AI feature tomorrow. The hole is **unoccupied**, not **unoccupiable**.
- Hallow’s Lent surge **around** Ash Wednesday may already be shrinking (Appfigures 2026). A 2027 Lent path is not a guaranteed payday.
- A beautiful red-letter folio without distribution is not a market-owning app. Prompt 1’s commercial clause is unmet — **by later instruction**, not by accident.

### Decision

**RECOMMENDATION.** Do not compete with YouVersion on reading. Do not copy a weekly SKU. Copy Hallow’s *named season* (Seven Days now; a 40-day path only if Dean wants Lent 2027) and Bible Chat’s *I can ask* — then stay quieter and more honest. **Tonight:** ship the ask screen, not ads.

---

## C3 / A1 — Which text may a US public advisor quote?

**Answer.** For a **free, public-facing, US** advisor that quotes large amounts of Gospel speech:

| Text | Status (US) | Opened source this session | May we ship it tonight? |
| --- | --- | --- | --- |
| **KJV 1769** | Public domain in the US | Standard copyright position; UK **Crown copyright** still applies to the Authorized Version in the United Kingdom. Household is Idaho (Notion license lock). | **Yes, locally.** Already the sealed corpus. Label **KJV**. Do not ship a UK-facing store without separate advice. |
| **ASV 1901** | Public domain in the US (expired) | Not re-opened as a primary page this session; listed on eBible inventories in prior research | Safe fallback. Not in the live corpus. |
| **WEB** | Dedicated to the public domain. **Trademark on the name** (claimed; federal registration not independently verified). If you change the wording, do not call it WEB. Distinguish classic WEB (stable) vs WEBU (still open to language updates). | [eBible WEB Updated about](https://ebible.org/study/content/texts/engwebu/about.html) and [engwebp/copyright.htm](https://ebible.org/engwebp/copyright.htm) opened 11 Sep 2026 (copyright.htm timed out earlier this run, then opened on contrary-evidence pass). FAQ updated 5 Feb 2024 allows commercial electronic publication. | **Licensed enough to use after Dean records it.** Not swapped. |
| **BSB** | Dedicated to the public domain **30 Apr 2023**. “All uses are freely permitted.” Attribution appreciated, not required. Do not call a changed text Berean. | [berean.bible/terms.htm](https://berean.bible/terms.htm) opened 11 Sep 2026. [berean.bible/licensing.htm](https://berean.bible/licensing.htm) restates PD + “Licensing is not required.” Footer on licensing.htm still says “Copyright © 2021… All rights reserved” — **contrary chrome**, superseded by the 2023 dedication in the body. No official CC0 deed was found on berean.bible; do not cite CC0 as first-party. | Same as WEB: allowed **after** the human gate. |
| **OEB** | CC0 | [openenglishbible.org](https://openenglishbible.org/) opened 11 Sep 2026. Release **2025.6** (Dec 2025) includes Genesis; NT available. | Allowed; less familiar to US churchgoers. |
| **NIV, ESV, NLT, NASB, CSB, NKJV, Message** | Copyrighted. Quotation thresholds exist and are **not** a license for a full-Gospel chatbot. | Not every publisher page re-opened tonight. Notion license lock (11 Sep) lists them as **not allowed without a license in hand.** | **Do not paste into a public advisor.** |

**Contrary / caution**

- This is **research, not a legal opinion.** Confirm with counsel before any distribution.
- KJV in the **UK** is not the same as KJV in Idaho.
- WEB trademark: we may not alter text and keep the name.
- Older Bible Hub footers still show pre-2023 BSB copyright lines. Prefer `berean.bible/terms.htm` dated 30 Apr 2023.

**Decision.** **RECOMMENDATION (unchanged):** prefer WEB or BSB for a public modern-English URL. **ASSUMPTION A3:** live corpus stays KJV until Dean writes the gate. `/ask` labels KJV and does not invent WEB quotes from memory.

---

## C4 — One-screen product

**Answer.** Four blocks, paper, no dock:

1. **Ask** — “What is weighing on you today?”
2. **The words** — one sealed saying, citation, translation name.
3. **What that might mean today** — ≤4 sentences, not a sermon.
4. **What this bot cannot do** — pastor / church / confession / crisis counselor + 988.

**Evidence.** Notion one-screen page, fetched 11 Sep 2026. Copy used on `/ask` is adapted from that page; the **example WEB Matthew 11:28** was **not** used as live text because the corpus is KJV.

**Decision.** Implemented as `GET /ask` + `POST /api/ask`. Folio at `/` is preserved.

---

## C5 / A3 — Crisis

### Finding

The **primary** safety control is an always-visible human line. Detection is a **secondary, leaky classifier**. ATELIER still requires crisis-adjacent items in an eval set — that eval is on other branches.

### Evidence

| Claim | Status | Source |
| --- | --- | --- |
| 988 is the US Suicide & Crisis Lifeline; 24/7; call, text, or chat | FACT | [988lifeline.org](https://988lifeline.org/) opened 11 Sep 2026 |
| International routing via a directory | FACT that the site exists | [findahelpline.com](https://findahelpline.com) (linked, not recrawled page-by-page tonight) |
| Notion draft: name a hotline, **stop generating counsel** | FACT (Dean’s page) | One-screen Notion, 11 Sep 2026 |
| Guest-hour folio keeps `#composer-help` when the composer hides | FACT (this repo) | `public/index.html` on parent `ff71a6e` |
| Held-out detector 0/20 (and earlier 0/16, 1/20) | PRIOR-BRANCH | `cursor/studio-codex-bca4` — **not present on this checkout.** Do not cite as a number verified tonight. |
| `looksLikeCrisis` on this tree is a short regex | FACT | `lib/scripture.js` |

**Contrary.** The regex does **not** match bare “die.” It **does** miss paraphrase (“end it all”, “going to jump”) and, before the 11 Sep repair, false-fired on “I don’t want to die.” Repair: negated “want to die” is stripped before the test. Residual: paraphrase still misses; 988 stays on screen for that case.

**Decision.** `/api/ask` returns `words: null` and `stopped: true` on crisis. The page shows 988 **before** any submit. Detection is not a ship gate.

---

## C6 / A5 — Which tree is the product?

**Answer.** For a human opening a URL **tonight**, the product is this folio tree plus `/ask`. For conscience and 149-question eval, the product is `studio-codex` / `advisor-eval-conscience`. They are **not** the same checkout.

| Branch | HEAD (as of last inspect) | Has folio guest-hour? | Has Codex / 149-q? | Role |
| --- | --- | --- | --- | --- |
| `cursor/guest-hour-bca4` | `ff71a6e` | Yes | No | Human UX |
| `cursor/recovery-flagships-bca4` | this | Yes + `/ask` | No | Recovery + one screen |
| `cursor/studio-codex-bca4` | `71b1e7a` | Older | Yes | Eval / concordance |
| `cursor/advisor-eval-conscience-c7c8` | `9da9690` | Different | 112-q | Independent conscience |
| `cursor/release-checklist-v2-bca4` | `148ea1b` | n/a | RELEASE.md | Knowledge |

**Decision.** Do not merge. Cross-section note only. If Dean wants one binary, that is a dedicated conflict-resolution commission, not this one.

---

## A2 — App Store 4.2 and “production ready for iPhone and Android”

**Answer.** Prompt 22 asked for iOS/Android production-ready. ATELIER and Notion later forbade store submit. Official Apple text still rejects a site wrapped in a WebView.

**Official text opened 11 Sep 2026** — [App Store Review Guidelines §4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality):

> Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or “app-like,” it doesn’t belong on the App Store.

Also: 4.2.2 (not primarily web clippings / link collections); 4.2.6 (template / generation-service apps).

**Practitioner blogs** (AppOfWeb, MobiLoud, Code2Native, Publishd; opened via search 11 Sep 2026) claim reviewers want native push, native tabs, offline, etc. Those are **secondary** sources with an incentive to sell wrappers. The **binding** sentence is Apple’s. 4.2 is a **review standard** (“should” / “may not be accepted”), not an automatic ban of every Capacitor binary that later grows native features. Do **not** cite §4.2.7(e) (thin remote-desktop clients) as the website-wrapper rule.

**Home screen.** iOS “Add to Home Screen” and Android install are **not** App Store submissions. README already documents this path.

**Decision.** **RECOMMENDATION confirmed:** PWA + home screen is the honest “phone ready” path. Capacitor may exist for a future native shell. **Do not submit** a thin WebView. Device testing remains Dean’s five-minute checklist (ATELIER).

---

## Worked examples (what `/ask` should do)

These are **specified behaviors**, then implemented in `lib/ask.js`. They are not user tests with real people.

| Input | Expected |
| --- | --- |
| “I am afraid of the future.” | One KJV saying (likely fear/peace cluster), ≤4-line meaning, cannot-do + 988 still visible. |
| “I feel so much shame.” | Shame cluster; John 8 / similar if retrieved and sealed. |
| Empty | 400; page does not invent a verse. |
| “I want to die” / “kill myself” | `crisis: true`, **no words**, **no meaning**, 988 + findahelpline only. |
| “What does Paul say about grace?” | Still only a Gospel saying (or the Matthew 11:28 fallback). No Paul. |

---

## Source register (opened or first-party this session)

| ID | Source | Opened | Used for |
| --- | --- | --- | --- |
| S1 | Transcript `…/transcript.json` (34 user texts) | 11 Sep 2026 | Recovery table |
| S2 | Notion one-screen `3d8b7d53-f969-812f-9d88-eac827b219e0` | 11 Sep 2026 18:27Z | Product shape |
| S3 | Notion license lock `3d8b7d53-f969-8195-8a71-e8effc74a2d5` | 11 Sep 2026 17:32Z | WEB/KJV/WATCH |
| S4 | https://ebible.org/study/content/texts/engwebu/about.html and https://ebible.org/engwebp/copyright.htm | 11 Sep 2026 | WEB PD + trademark |
| S5 | https://berean.bible/terms.htm | 11 Sep 2026 | BSB PD 30 Apr 2023 |
| S6 | https://berean.bible/licensing.htm | 11 Sep 2026 | “Licensing is not required” + stale footer |
| S7 | https://openenglishbible.org/ | 11 Sep 2026 | OEB CC0; 2025.6 |
| S8 | https://developer.apple.com/app-store/review/guidelines/#minimum-functionality | 11 Sep 2026 | §4.2 official |
| S9 | https://988lifeline.org/ | 11 Sep 2026 | 988 |
| S10 | https://www.youversion.com/news/bible-app-reaches-one-billion-installs | 11 Sep 2026 (page date 28 Oct 2025) | 1B installs |
| S11 | https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue | 11 Sep 2026 (article Feb 24, 2026 Lent) | Hallow estimates |
| S12 | Repo files on this checkout (`DESIGN.md`, `LAUNCH.md`, `lib/scripture.js`, …) | 11 Sep 2026 | Product facts |

**Not obtained.** `CLAUDE.md` on this tree. `engwebp/copyright.htm` (timeout earlier). Bible Chat current SKU page. Audited Hallow financials. Real-user validation of `/ask`.

---

## Trace (requirement → action)

| Requirement | Question | Finding | Decision | Work | Next |
| --- | --- | --- | --- | --- | --- |
| Prompt 1: own the red-letter niche | C2 / A4 | Hole exists; YouVersion/Hallow/Bible Chat occupy adjacent jobs | Don’t be a reader or a weekly chat | Research file | Ads only after a public URL exists |
| Prompt 3: simple / Notion | C4 | One screen specified 11 Sep | Build `/ask`, keep folio | `public/ask.html` | Dean opens it |
| ATELIER: named translation | C3 / A1 | WEB/BSB/KJV-US are free; NIV/ESV are not | Label KJV; Dean records before URL | License section | Human gate |
| ATELIER: crisis in product | C5 / A3 | 988 is official; detectors leak | Always-on 988; stop counsel | `lib/ask.js` | Eval stays on other branches |
| Prompt 22: iPhone/Android | A2 | 4.2 rejects thin wrappers | PWA; no submit | Brief + research | Dean’s device checklist |
| Prompts 7–9: conflicts | C6 / A5 | Three living trees | No mega-merge | Checkout map | Dedicated merge later |

---

## Remaining gaps (and why we stopped)

| Gap | Why it is still open | Why we stopped |
| --- | --- | --- |
| Full store census of red-letter apps | Prompt 1 asked; listings churn weekly | Diminishing returns vs `/ask` |
| Bible Chat refund rate | Would sharpen the weekly-SKU warning | No first-party source opened |
| UK Crown-copyright opinion | Only matters if Dean ships in the UK | Household is Idaho |
| Merge cost of the three trees | Real, large | Out of this commission’s conflict rules |
| Real-user test of `/ask` | ATELIER quality bar includes warmth | No human testers in this environment |

**Judged sufficient for tonight:** license, 4.2, crisis primary control, category hole, and which tree to type into — all have enough evidence to act without inventing the rest.
