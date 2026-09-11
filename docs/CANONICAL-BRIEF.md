# Red Letter — canonical brief

**Status: WATCH.** Do not publish. Do not launch. Do not store-submit. Folio stays paper.

**Audience:** Dean (owner / final approver). Idaho household. Internal desk only until he records a named public-domain text.

**Product when a public URL is later authorized:** one screen. Ask. The words. What that might mean today (four lines at most). What this bot cannot do. Crisis: name 988, then silence.

**Not the product:** a store app, a five-room launch, a cash folio, a pastor, a church, a confession booth, or a model that pretends to be Jesus.

Version: 2026-09-11 night · this conversation only (`bc-01a079a6-24e8-7a9d-a0d6-7339bea028bf`) · branch `cursor/trust-harness-rebuild-28bf` · [PR 29](https://github.com/eyoitsmedean/Ai/pull/29)

---

## 1. Intended outcome

A faith product that does not fake theology.

When Advent wants a URL, a person can type what is weighing on them and receive:

1. **Ask** — their own words.
2. **The words** — spoken speech of Jesus from Matthew, Mark, Luke, or John, sealed against a named public-domain text. Nothing invented. No narrator verses. No Paul.
3. **What that might mean today** — at most four lines of stored, plain implication. Then silence.
4. **What this bot cannot do** — always on screen.

Until that URL is authorized, the five-room folio remains a paper atelier. The one-screen at `/ask` is the spec-aligned product, marked `noindex`, labeled Watch.

---

## 2. Recovery of the earliest user prompts

This conversation has **five** user-authored prompts, not ten. Prompts 6–10 do not exist here. They were read from the run transcript (`role: "user"`), not reconstructed from memory. No per-prompt timestamp field exists on the messages; times below are inferred from nearby run metadata.

Other Cursor chats (Grok iOS, PR 18, masterpiece-protocol) have their own first-tens. Those are **not** this brief. Do not overwrite them.

| # | When (UTC, inferred) | Original wording (quoted) | Requirement or preference | Current implication | Later amendment |
| --- | --- | --- | --- | --- | --- |
| 1 | ~2026-09-07 02:15 | “UNIVERSAL REBUILD PIPELINE… You are one worker… assigned to a section of one of Dean's projects… Truth over polish… Nothing irreversible without Dean's explicit authorization… code repo → new branch and a PR… Never commit to main.” Brief fields were left as `{{…}}`. Owner / final approver: Dean. | Rebuild the in-scope section: learn, research, restructure, rebuild, two QA passes, ship. Non-destructive. Label claims. Do not invent sources. | This thread rebuilt the **Advisor trust harness** (spoken-lookup gate, retrieval, SDK, crisis matcher), then the folio sprint, then the one-screen. | Later Notion spec narrowed the *public* product to one screen and parked launch. |
| 2 | ~2026-09-07 03:43 | “Finish with grok” | Complete remaining modules, QA, and delivery. | Harness shipped on this branch. | Superseded as a standing instruction; the work is done. |
| 3 | ~2026-09-08 01:38 | “Show me your best finished product” | Present the product as it actually runs, not notes. | Folio at `/` is the finished paper room. `/ask` is the finished one-screen. | Later: folio stays paper; `/ask` is what a public URL would be. |
| 4 | ~2026-09-11 03:26 | “Massive sprint time get to it pick 5 priorities and push for 45 minutes to an hour” | Choose five priorities and ship them. | Shipped: Need → Sit; themed no-key letters; Amen → blessing; aligned crisis matchers; comfort-cite fix. | Still valid as completed work. Do not reopen unless a defect appears. |
| 5 | ~2026-09-11 21:30 | “UNIVERSAL PROJECT RECOVERY, DEEP RESEARCH, AND EXECUTION COMMISSION… recover the first ten user-authored prompts… Never invent source wording… Choose and complete the three most valuable flagship deliverables…” | Recover the brief, research core + five adjacent topics, produce three complete flagships, review, organize for reuse. Depth over speed. | This document, `/ask`, and `docs/RESEARCH-AND-GATE.md` are those three flagships. | Governs this turn. Does not reverse the WATCH / no-launch law. |

**Explicit later amendments (authoritative, opened 2026-09-11 from Dean’s Notion):**

- Original Red Letter ask (dispatch): “Faith product that does not fake theology.”
- Page [Red Letter · one screen · not a launch](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0): **WATCH** — do not publish, do not launch, do not store-submit. Folio stays paper. Human gate: Dean records a **named public-domain text** (WEB or KJV-US) before any public URL. BSB is a legal alternate, not part of that lock.
- License lock: **WEB** (public domain; name is a trademark) and **KJV 1769 US-PD**. Household is Idaho. Crown copyright still matters in the UK. Not NIV / ESV / NASB / CSB / The Message without a license in hand.
- Crisis: name **988**, **stop generating counsel**.
- Advent window noted: **29 November 2026** (USCCB). Not a launch authorization.
- Dispatch: no sixth Notion hub. Advances go under existing This week / Red Letter pages.

**Repo docs that are not current authorization:** `LAUNCH.md`, `MARKET_STRATEGY.md`, and any 90-day folio cash plan. They are historical. They do not authorize a store submit.

---

## 3. Scope and exclusions

**In scope**

- Spoken words of Jesus in Matthew–John.
- Sealed insertion via `spokenLookup` only.
- One-screen `/ask` (internal).
- Folio as paper / household atelier.
- Crisis stop on the public-shaped screen.
- Translation research and a human-gate memo Dean can use.

**Out of scope**

- Store submit, ads, waitlist-as-launch, GitHub Pages as a public product.
- Adding Paul, Acts, or Revelation speech.
- Pretending the model is Jesus (“Ask Him”).
- Locking a translation into the public product before Dean records it.
- Spending, public emails, or communications on Dean’s behalf.
- A sixth Notion hub.
- Overwriting other chats’ recovery pages (Grok F1–F3, PR 18, masterpiece-protocol).

---

## 4. Existing assets (authoritative locations)

| Asset | Where | Authority |
| --- | --- | --- |
| One-screen product | `public/ask.html`, `GET /ask`, `POST /api/ask`, `lib/ask.js` | Spec-aligned product. WATCH. |
| Folio | `public/index.html`, `/` | Paper atelier. Keep. |
| Welcome | `index.html`, `/welcome` | Household door. Not a launch landing. |
| Spoken corpus | `data/spoken-gospels.json` × `data/red-letter-source.json` | Only insertion source. Currently KJV. |
| Library | `public/library.json` | Grouped sayings for retrieve / seek. |
| Curated packs | `lib/curated.js` / `public/curated.json` key **`packs`** | Theme openings and stored implication. |
| Trust harness | `lib/scripture.js`, `lib/retrieve.js`, `lib/model.js`, `server.js` | Narrator verses refused at every gate. |
| License / product law | Notion parent above | Later amendment. Overrides launch docs. |
| This brief | `docs/CANONICAL-BRIEF.md` | Canonical for **this** conversation. |
| Research + human gate | `docs/RESEARCH-AND-GATE.md` | Flagship 3. |
| Future agents | `docs/FUTURE-AGENTS.md` | How to resume without rereading chat. |

Unused and left in place: `data/scripture.js`, `data/red-letters.js` (WEB-era), unused `cors` package. Do not delete without Dean.

---

## 5. What to preserve, improve, complete, or retire

**Preserve**

- Spoken-lookup gate. Comfort-cite fix (`sayingTouchesCitation`). Need → Sit. Amen blessing. Themed no-key letters. Folio typography (paper, crimson only for His speech).

**Improve**

- `/ask` is the public-shaped surface; keep it four blocks, crisis-silent.
- Label the current corpus honestly: **KJV**, pending Dean’s recording of WEB or KJV-US. BSB may be recorded instead; it is not the lock.

**Complete (this turn)**

- Tests and smoke for `/ask`.
- Research synthesis a specialist can audit.
- Human-gate memo with a recording checklist.
- Notion child under the existing Red Letter page (not a new hub): [Trust harness PR 29 · one-screen /ask · 11 Sep night](https://app.notion.com/p/3d8b7d53f96981d5b34efff27c0f6808).

**Retire as current instruction (do not delete files)**

- Store / cash / 90-day folio launch plans.
- Any implication that GitHub Pages is the product.

**Known drift (documented, not silently “fixed” on the paper folio)**

- Folio `POST /api/chat` still prefixes 988 **and then** writes `FALLBACK_LETTER` (John 14:27 / Matthew 11:28). `/ask` stops. The later spec is stop-after-988. Changing the paper letter would break existing folio tests and is a Dean decision. Recommendation: leave the folio letter until he says the paper room must also go silent.

---

## 6. Main obstacles

1. **Human gate still open.** No public URL until Dean records WEB or KJV-US (BSB optional). The corpus on disk is KJV.
2. **`/ask` isolation.** Welcome and the folio do not advertise `/ask`. That is deliberate under WATCH. Open the URL yourself. If `API_ACCESS_KEY` is set, the page needs that key.
3. **WATCH.** Shipping more launch surface would be drift.
4. **Crisis split.** One-screen stops; folio chat still comforts after 988.
5. **UK Crown copyright** if KJV ever leaves the US household.
6. **Other agents** writing parallel recovery on other branches. Coordinate by not overwriting their pages or their files.

The real obstacle to *use* is not missing code. It is the unrecorded translation and the no-launch rule. The real obstacle to *value tonight* was the missing one-screen and the missing gate memo. Those are the flagships.

---

## 7. Acceptance criteria (observable)

A knowledgeable reader can:

1. Open `http://localhost:3000/ask` and complete Ask → words → ≤4 lines → cannot, without a key (unless `API_ACCESS_KEY` is set).
2. Type a shame sentence and see a sealed Luke 15 (or other spoken) citation in crimson, labeled KJV.
3. Type a crisis sentence and see 988 with **no** verses and **no** implication.
4. Confirm `noindex` and “Watch · not a launch” on the page.
5. Read this brief and know what is law vs historical launch copy.
6. Read `docs/RESEARCH-AND-GATE.md` and record a translation without further assembly.

---

## 8. Assumptions and unresolved decisions

| Item | Kind | Note |
| --- | --- | --- |
| Current disk corpus is KJV 1769 | Fact | Label it. Do not call it WEB. |
| Dean will record WEB (or keep KJV-US) before a URL | Recommendation | BSB is an optional alternate, not the lock. See human-gate memo. |
| `want to die to my old self` trips crisis | Assumption | Accepted over-match. `kms` stays unmatched. |
| Folio remains paper | Later amendment | Do not convert it into the launch. |
| `ANTHROPIC_EFFORT=low` | Assumption | Keep until a live letter feels thin. |
| `kms` is not crisis language | Recommendation | Too many false hits. |
| Express 4 stays | Recommendation | Not this PR. |
| Household window | Unresolved | Notion “This week” still **Not confirmed**. |
| Whether folio chat must also go silent after 988 | Unresolved | `/ask` already does. |
| Advent 29 Nov 2026 | Fact (USCCB) | Calendar, not permission to publish. |

---

## 9. Three flagships (why these)

| Flagship | Why |
| --- | --- |
| 1. This brief + recovery table | Recovers the five actual prompts, later law, and a single place future agents can start. |
| 2. One-screen `/ask` | The product Dean described. Usable tonight. Not a launch. |
| 3. Research synthesis + human-gate memo | The decision he still has to make, with opened sources, contrary evidence, and a recording checklist. |

Outlines were refused as substitutes. Launch decks were refused as flagships.

---

## 10. First three useful actions

1. `npm start` → open `/ask`. Ask something true. Then ask a crisis sentence and confirm the page goes silent.
2. Record — or refuse — a translation using the checklist in `docs/RESEARCH-AND-GATE.md`. Until then the page must keep saying KJV.
3. Do not publish, do not store-submit, do not turn on GitHub Pages as a product.
