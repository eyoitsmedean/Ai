# Canonical brief — Red Letter Advisor

**Version:** 2026-09-11 · recovery flagships  
**Audience:** Dean (builder) and any later agent continuing this work  
**System of record for this recovery:** this file. Do not treat chat summaries as a transcript.

This brief recovers the project from the **first ten user-authored prompts** in this run’s transcript, then records later amendments. Original prompts establish the foundation. They do not authorize reversing later decisions.

---

## 1. Intended outcome and audience

**Outcome.** A market-owning product that spreads the **red words of Jesus** — encouragement and guidance using **his own speech from the four Gospels** — with a daily companion people actually open.

**Audience (use moment).** Someone carrying a real question about their life, often at a low moment, on a phone. They want a warm, checkable answer in seconds: one saying he actually spoke, one plain implication, then silence.

**What it is not.** A full Bible reader (YouVersion owns that). A weekly-paywalled “talk to Scripture” chatbot (Bible Chat’s trust problem). A pastor, church, confession booth, or crisis counselor.

**Status tonight (WATCH).** Build and verify internally. **No public URL, no store submit, no production deploy** until Dean records the licensed translation and explicitly authorizes a release.

---

## 2. Recovery of the earliest ten user prompts

**Access.** The first ten user-authored prompts were read from this run’s transcript:

`/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-31-32Z-71a6/bc-019ff86b-ea97-7267-957b-fb5487dbbca4/transcript.json`

- 34 user-role messages exist in that file.
- Messages store `{ role, text }` only. **They do not carry per-prompt timestamps.** Dates below are not invented; they are omitted.
- Prompts 15, 17, 23–25 in the full list are system notifications, not Dean’s voice. They are excluded from the first ten.
- Wording below is excerpted from the original text. Nothing was reconstructed from memory.

| # | Original wording (excerpt) | Requirement or preference | Current implication | Later amendment |
| --- | --- | --- | --- | --- |
| 1 | “Do research on the best selling bible focused Christian focused apps. Also do research on the best demographics to market to for this types of apps on the best platforms to run ads on. Then do research on any apps that make the red words in the Bible the theme of them. I want to build an app that combines what you learned into the perfect market owning app of spreading the red words in the Bible of Jesus, getting encouragement and some guidance using his own words from the Bible. I think some version of this would be helpful and also make a lot of money and keep you busy for a long time to come” | Market research (winners, demographics, ads, red-letter competitors) **and** a product that owns the niche of Jesus’s own words. Helpful **and** commercial. Long-running work. | Still the founding job. Research lives in `MARKET_STRATEGY.md`, `LAUNCH.md`, and `docs/RESEARCH.md`. The live product is the Advisor / folio, not a YouVersion clone. | Commercial launch is **paused**. 11 Sep 2026 Notion: WATCH / never PUBLISH / no store. Money remains a later goal, not tonight’s action. |
| 2 | “Do research on how to improve the project, then do research on those topics online, then come back and build, then QA the results and rebuild and run this loop again as needed to hit a world class standard” | Research → build → QA → rebuild. World-class bar. Loop until it holds. | Standing operating method. Guest-hour, studio-codex, and this recovery all inherit it. | Unchanged. Later prompts raise the same loop (FORGE / ATELIER / this commission). |
| 3 | “put on your creative design brain and go out and explore all the coolest ideas… impress a human. Somebody who really is impressed by beautiful, elegant, complex in build but very simple in usage designs and things like Notion… exceed your own expectations… be ambitious.” | Design that is expensive to make and cheap to use. Notion-grade paper. Impress a tasteful human. Ambition. | `DESIGN.md` and the folio/welcome visual language. `/ask` must stay that simple: one screen, paper, crimson reserved for speech. | 11 Sep Notion: “Folio stays paper.” One-screen advisor is the public-facing shape *when* a URL is wanted — it does not replace the folio. |
| 4 | “Do what you feel advances this project the most” | Autonomy to pick the highest-leverage next move. | Agents may proceed on reversible work without asking. | ATELIER later: no publish / deploy / spend / store submit without sign-off. |
| 5 | “Build baby build” | Stop planning; produce working software. | Outlines are not the product. `/ask`, brief, and research must be finished artifacts. | Unchanged. |
| 6 | “Research and build like my success and my families success hangs in the balance on the results” | Stakes are household-level. Depth over polish-for-show. | Justifies MASTERWORK research and refusing weekly-paywall patterns that burn trust. | Unchanged in spirit. Later: do **not** spend grocery money launching an unlicensed public URL. |
| 7 | “There are merge conflicts with the `claude/jesus-teachings-chatbot-bSBhF` branch. Review them and classify whether they are simple conflicts, or if there are conflicting intents… Fix the simple conflicts, and report the complicated ones. Fetch the latest changes… from the origin before you begin.” | Conflict hygiene against the long-lived Claude base. Fetch first. Don’t smash intent conflicts. | The product is **fragmented across branches**. Do not merge studio-codex / conscience / guest-hour in one PR. | Repeated as prompts 8, 9, 13, 18. Still binding. |
| 8 | Same wording as 7. | Same. | Same. | Duplicate of 7. |
| 9 | Same wording as 7. | Same. | Same. | Duplicate of 7. |
| 10 | “Believe you can do more and be ambitious” | Raise ambition; do not ship a timid slice. | Three flagships instead of a status note. One-screen that a person can actually use tonight locally. | Prompt 11 adds “and creative.” Prompt 21 asks for missing brilliant ideas. Ambition is not a license to launch. |

**Explicit vs interpreted**

| Explicit (Dean’s words) | Interpretation (ours — labeled) |
| --- | --- |
| Research best-selling Christian apps, demographics, ad platforms, red-letter themes | The competitive set is Hallow / YouVersion / Bible Chat / red-letter KJV clones |
| Build an app that spreads Jesus’s red words for encouragement and guidance | Scope is four Gospels, his speech only |
| Helpful and make money | Freemium later; His words never locked — inferred from later `LAUNCH.md` and Bible Chat reviews, not from prompt 1 |
| Research → build → QA loop; world class | Current checkout must remain testable (`npm test`, smoke, qa) |
| Beautiful, simple, Notion-like | Paper `#F4EFE4`, crimson `#8F1D1D` for speech only |
| Fix simple merge conflicts; report complicated ones | Do not silently merge incompatible Advisor trees |
| Be ambitious | Completeness, not a new product category |

---

## 3. Later amendments (do not reverse)

Read from the same transcript (user messages after the first ten) and from Dean’s Notion pages fetched **11 Sep 2026**.

| Source | Amendment | Status |
| --- | --- | --- |
| User 16 | “Make the app ready for testing by a real human by simulating 20 real humans…” | Demo / QA culture. `scripts/demo-humans.js` exists on this tree. |
| User 22 | “Complete the app and make it production ready for both iphone and android by tomorrow morning… hard on your QA” | Mobile-ready **PWA + Capacitor shells**. On-device store testing is Dean’s step. |
| User 27–28 | FORGE: mine the thread, no fake research, build the thing, label epistemic status. | Method. |
| User 29 · ATELIER filled brief | Mission: production-ready **chat-first** Advisor using Jesus’s own words. DOD: every answer cites a Gospel saying from a **named opened translation**; warm tone; **≥40-question eval** including hostile / off-scope / crisis; iOS/Android **build** (device test = Dean); release checklist honest. Authority: **no App Store / Play submission, no production deploy, no spending.** CLAUDE.md named as system of record — **that file is not on this checkout.** | Binding. **149-q eval = `cursor/studio-codex-bca4` only. 112-q eval = `cursor/advisor-eval-conscience-c7c8` only.** Neither is on `cursor/guest-hour-bca4`. |
| User 30 | UNIVERSAL REBUILD on a knowledge page (`RELEASE.md` on another branch). | Knowledge work; not a substitute for a usable advisor. |
| User 31 | “Finish with grok” | RELEASE v2 completed on `cursor/release-checklist-v2-bca4`. |
| User 32 | “Show me your best finished product” | Seeing the room matters as much as documents. |
| User 33 | “Massive sprint… pick 5 priorities” | Guest-hour UX shipped on this parent (`ff71a6e`). |
| Notion · [Red Letter · one screen · not a launch](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0) (fetched 11 Sep 2026) | Folio stays paper. **No store submit.** One screen: **Ask / The words / What that might mean (≤4 lines) / What this bot cannot do.** Human gate: Dean records the translation **before any public URL.** No invented sayings, no prosperity, no political mascot. Crisis: name a hotline, **stop generating counsel.** Status: **WATCH / never PUBLISH.** | **Current product shape for a URL.** Implemented locally as `/ask`. |
| Notion · [Red Letter · license lock · 11 Sep](https://app.notion.com/p/3d8b7d53f96981958a71e8effc74a2d5) | Prefer WEB or BSB for modern English when distributing. KJV/ASV safe US fallbacks. NIV/ESV/etc. not free for a public advisor. Household is Idaho (US). | Live corpus tonight remains **KJV** in `data/spoken-gospels.json`. Do **not** swap until Dean records the choice. Label every quote. |

---

## 4. Current scope and explicit exclusions

**In scope**

- Jesus’s words, Matthew–Mark–Luke–John, sealed against the spoken corpus.
- Chat-first one screen (`/ask`) plus the existing paper folio (`/`).
- Crisis chrome: 988 + Find A Helpline always visible; detection is secondary and must not be claimed as a ship gate.
- Research, brief, and a usable local product Dean can open with `npm start`.
- Tests on this checkout.

**Out of scope / forbidden without Dean**

- App Store or Play submission.
- Production deploy or any public URL.
- Spending.
- Force-push, deleting Dean’s files, overwriting hand-authored work.
- Merging the three product trees in one PR.
- Swapping the live corpus to WEB/BSB this session.
- Invented sayings, prosperity overlay, political mascot.
- Paywalling His words or metering letters.
- Pretending the model is Jesus.

---

## 5. Existing assets and authoritative locations

| Asset | Where it actually is | Notes |
| --- | --- | --- |
| This checkout (folio + `/ask`) | Branch `cursor/recovery-flagships-bca4` off `cursor/guest-hour-bca4` @ `ff71a6e` | Has folio, welcome, blessing, curated Advisor. **Missing** `CLAUDE.md`, `RELEASE.md`, `eval/`, `lib/safety-core.js`, Codex. |
| Guest-hour UX | `cursor/guest-hour-bca4` | Letter actions, always-on 988 chrome, last leaf, letters crisis, TDZ fix. PR #32. |
| Codex + concordance + 149-q eval | `origin/cursor/studio-codex-bca4` @ `71b1e7a` (6 Sep 2026) | Richest safety/eval tree. Do not claim it is on HEAD. |
| Conscience / `roomFor()` / 112-q | `origin/cursor/advisor-eval-conscience-c7c8` @ `9da9690` | Independent eval lineage. |
| RELEASE.md v2 | `origin/cursor/release-checklist-v2-bca4` | Knowledge rebuild; PR #28 into studio-codex. |
| Spoken corpus | `data/spoken-gospels.json` + `data/gospels-kjv.json` | KJV. Built by `npm run spoken`. |
| Design language | `DESIGN.md` | Paper, one accent, lectio. |
| Market notes | `MARKET_STRATEGY.md`, `LAUNCH.md` | Useful; some figures are estimates — see `docs/RESEARCH.md`. |
| Notion one-screen / license | pages linked above | Later amendment. WATCH. |
| This run | https://cursor.com/agents/bc-019ff86b-ea97-7267-957b-fb5487dbbca4 | Repo `github.com/eyoitsmedean/Ai`. |

**Checkout map (do not casually merge)**

```
claude/jesus-teachings-chatbot-bSBhF     long-lived base
        ├── cursor/production-ready-mobile-bca4
        │     └── cursor/guest-hour-bca4
        │           └── cursor/recovery-flagships-bca4   ← you are here
        ├── cursor/studio-codex-bca4                     Codex + 149-q
        └── cursor/advisor-eval-conscience-c7c8          conscience eval
```

---

## 6. Main obstacles

1. **Fragmentation.** The “finished Advisor” Dean asked for is split: folio UX here, eval/safety on other branches. A single merge is weeks of conflict (prompts 7–9).
2. **Launch vs WATCH.** Prompt 1 wants a market-owning app. 11 Sep Notion forbids a public URL until the translation is recorded. The real next consumer artifact is a **local one-screen**, not a store listing.
3. **Missing system of record on this tree.** ATELIER named `CLAUDE.md`. It is not in this checkout. This brief is the recovery stand-in.
4. **Crisis detection is not a ship gate.** Held-out scores exist on other branches. Helpline-on-screen is the primary control.
5. **License human gate.** WEB/BSB are free for a US public advisor; live text is still KJV. Swapping is Dean’s call.

---

## 7. Preserve / improve / complete / retire

| Action | What |
| --- | --- |
| **Preserve** | Folio paper language; sealed KJV retrieve-and-substitute; 988 chrome from guest-hour; welcome page; blessing URLs; `LAUNCH.md` “never lock His words.” |
| **Improve** | One-screen `/ask` as the URL-shaped product; honest research with dates and contrary evidence; a brief a later agent can resume from. |
| **Complete** | Local `/ask` + `/api/ask`; this brief; `docs/RESEARCH.md`. Notion draft home is created in this session if the integration allows — do not treat older Notion cards from other runs as this brief. |
| **Retire (do not delete)** | Claims that 149-q eval or Codex exist on this checkout. Weekly-SKU launch plans. “Detection works.” |
| **Do not start** | Store submit, WEB corpus swap, cross-tree mega-merge, new spending. |

---

## 8. Observable acceptance criteria

A later agent or Dean can check these without rereading chat.

1. `docs/CANONICAL-BRIEF.md` contains a recovery table built from the transcript’s first ten user prompts, with explicit vs interpreted distinguished.
2. `docs/RESEARCH.md` covers retained core topics plus exactly five adjacent topics, each with sources, dates, and project implications.
3. `GET /ask` is a one-screen page: Ask / The words / meaning ≤4 lines / cannot-do. 988 is visible before any question. No dock. Folio at `/` is untouched.
4. `POST /api/ask` returns a sealed KJV saying for ordinary input and **no counsel** for crisis input.
5. Quotes are labeled **KJV**. Corpus is not swapped.
6. `npm test`, `npm run smoke` (against a live server), and the `/ask` assertions pass on this branch.
7. No store metadata, no production URL, no spend.

---

## 9. Assumptions and unresolved decisions

| ID | Kind | Statement |
| --- | --- | --- |
| A1 | Assumption | “Do not launch” in cash-planning Notion pages means **do not spend household money on a public launch**, not “stop building.” |
| A2 | Assumption | PWA-first remains correct until Dean names a native stack. Capacitor folders may exist; 4.2 still blocks a thin WebView store app. |
| A3 | Assumption | KJV remains the live sealed text until Dean records WEB or BSB. |
| U1 | Unresolved | Which translation is licensed for the first public URL? **Dean.** |
| U2 | Unresolved | When (if ever) to merge guest-hour + studio-codex + conscience. |
| U3 | Unresolved | Whether a 40-day Lent path ships before Ash Wednesday 2027 (10 Feb 2027). |
| U4 | Unresolved | Quality-reference apps Dean would name (ATELIER left this blank). |

---

## 10. Three flagships (this cycle)

| # | Deliverable | For whom | Use |
| --- | --- | --- | --- |
| 1 | This brief | Dean + later agents | Recover intent in one file. |
| 2 | `docs/RESEARCH.md` | Dean before any public URL or spend | Decisions with evidence. |
| 3 | `/ask` + `POST /api/ask` | The person with a real question (local tonight) | One screen, sealed words, honest limits. |

The knowledge archive supports these. It is not a fourth flagship.

---

## 11. First three useful actions for Dean

1. `npm start` → open `http://localhost:3000/ask`. Type a real weight. Confirm 988 is already on screen.
2. Record, in Notion or this brief, **which translation** may appear on a public URL (WEB, BSB, or KJV-US). Do not publish before that line exists.
3. Do **not** submit stores. If you want the **149-question** set, check out `cursor/studio-codex-bca4`. If you want the **112-question conscience** set, check out `cursor/advisor-eval-conscience-c7c8`. Do not expect either on this branch.
