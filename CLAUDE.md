# CLAUDE.md — Red Letter · system of record

**Purpose.** Agents and Dean read this file to know what is settled on *this checkout*, what is only claimed on sibling pull requests, and what still needs Dean.  
**Owner / approver.** Dean.  
**Status.** Live v2 — 2026-09-07.  
**Updated.** 2026-09-07.  
**What changed in v2.** This file now maps checkout truth versus open-PR claims. It does not merge any sibling PR. The 2026-09-06 text is intact at [`docs/CLAUDE.v1-2026-09-06.md`](docs/CLAUDE.v1-2026-09-06.md). How to work: [`ATELIER.md`](ATELIER.md). How a section is rebuilt: [`REBUILD.md`](REBUILD.md).

Labels used here: `[verified]` `[calc]` `[inference]` `[estimate]` `[assumption]` `[opinion]` `[recommendation]` `[proposal]`. Origin in parentheses: `(in-scope)` `(retrieved)` `(prior-worker)` `(model-knowledge)`.

---

## Answer first

On **this checkout** (`cursor/atelier-protocol-8754`, branched from `claude/jesus-teachings-chatbot-bSBhF`):

1. The product in the tree is a **reading-room PWA** with five rooms (Today, Seek, Sit, Advisor, Journal). The Advisor is a room, not the front door. `[verified]` `(in-scope)` — `README.md`, `public/index.html`, `public/manifest.json`.
2. Scripture in this tree is **KJV 1769**. There is **no** `eval/` directory. `npm test` on this tree: **38/38 pass** (2026-09-07). `[verified]` `(in-scope)`.
3. There is **no** iOS, Android, Capacitor, or Flutter project on this checkout. `[verified]` `(in-scope)` — `git ls-files`.
4. Open-PR field as of this run: **21** open PRs (`gh pr list`, 2026-09-07), including this branch (#24). Many — not all — carry their own `CLAUDE.md` and “settled” tables. Those tables are **proposals on those branches**, not facts about this tree. PRs #26–#28 appeared during this session and were **not** read. This count goes stale as soon as another PR opens. `[verified]` `(in-scope)`.
5. Merging into `claude/jesus-teachings-chatbot-bSBhF` is a **publish** of `public/` if GitHub Pages is enabled. The Pages API and `https://eyoitsmedean.github.io/Ai/` both returned **404** on 2026-09-07. Last successful Pages workflow run: **30 August 2026**. `[verified]` `(retrieved)`.

Do not copy a sibling PR’s “settled” row into this file unless that PR has merged, or Dean names that branch as the product line.

---

## Product in one breath

*A quiet page for the words Jesus spoke. Four rooms each morning. An advisor that only answers in red letters. A blessing you can send to one person.* `[verified]` `(in-scope)` — `LAUNCH.md` (that file’s own sentence). The shipped shell has **five** rooms: Today, Seek, Sit, Advisor, Journal. `[verified]` `(in-scope)` — `README.md`. Do not “fix” the LAUNCH line in a docs pass.

Audience: someone with a real question, often at a low moment, on a phone. Never assume the reader’s level of faith. `[verified]` `(in-scope)` — Advisor system prompt in `server.js`.

This is not a person, not therapy, not pastoral counseling. Crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com). `[verified]` `(in-scope)` — `README.md`, `lib/scripture.js`.

---

## Settled on this checkout

| Decision | Status | Where it lives |
| --- | --- | --- |
| App wordmark **Red Letter**; package name `red-letter-advisor`; the chat room is the Advisor | shipped; naming tension open | `public/manifest.json`, `package.json`, `README.md` |
| Five rooms: Today · Seek · Sit · Advisor · Journal | shipped | `README.md`, `public/index.html` |
| Scope is Jesus’s spoken words in Matthew, Mark, Luke, John — never Paul, prophets, Psalms, Acts, Revelation | shipped | `server.js` Advisor prompt, `lib/scripture.js` |
| Translation: **KJV 1769** (`data/gospels-kjv.json`). Model emits `{{Book C:V}}`; harness inserts corpus text (`verifyAndSubstitute`) | shipped | `lib/scripture.js`, `README.md` |
| KJV is public domain in the US (README). In the UK, Crown rights are administered by Cambridge University Press; liturgical / non-commercial use up to 500 verses (and less than a full book) needs no application; other uses need written permission | US: `[verified]` `(in-scope)`. UK: `[verified]` `(retrieved)` 2026-09-07 | Cambridge Family Chronicle sample pages PDF, opened this session |
| Palette: paper `#F4EFE4`, ink `#1B1610`, crimson `#8F1D1D` for His speech and the one active state | shipped | `DESIGN.md` |
| Type: Fraunces display, Source Serif 4 scripture, Instrument Sans UI | shipped | `DESIGN.md` |
| Crisis handoff in-product: 988 + findahelpline, before verified content | shipped | `lib/scripture.js` `looksLikeCrisis` / `CRISIS_NOTICE`; `data/advisor.js` fallback |
| App works with no API key (curated, corpus-verified pages) | shipped | `README.md`, `data/curated.js` (28 daily rooms) |
| Free Advisor letters/day on the page: **5** (`FREE_CHATS`) | shipped | `public/index.html` |
| When money exists: words stay free; annual **$59.99** (or **$69.99** to match Hallow) as the lead SKU; monthly **$9.99** never led with; **no weekly price** | recorded, not built | `LAUNCH.md` |
| Lent is the commercial season; Advent is the craft window | recorded | `LAUNCH.md` |
| GitHub Pages workflow publishes `public/` from `main` and `claude/jesus-teachings-chatbot-bSBhF` | shipped as workflow | `.github/workflows/pages.yml` |
| How to work: Atelier Protocol | shipped on this branch | `ATELIER.md`, `.cursor/rules/atelier-protocol.mdc` |
| Ninety Days folio has its own brief | recorded on PR #15; **not in this tree** | `folio/BRIEF.md` is absent here `[verified]` `(in-scope)` |

---

## Contested — sibling PRs only (do not treat as this tree)

Observed 2026-09-07 by reading the `CLAUDE.md` on the branches listed in the table (not #26–#28) and by running those branches’ `npm test` in a throwaway worktree (workspace `node_modules` symlinked).

| Claim on a sibling PR | Branch / PR | What this checkout has | Suite I ran on that branch |
| --- | --- | --- | --- |
| Evaluation set of 40–149 questions; `eval/` is a release gate | #25 112q; #10 98q; #20 149q; #8 91q; others 40–82 | **No `eval/`** | n/a here |
| Capacitor is the settled mobile stack | #22, #18, #20 | No Capacitor files | n/a |
| PWA *is* the mobile build; native is a later Dean decision | #25, #10, #8 | Matches this tree | n/a |
| Flutter “Red Words” is a separate native app (WEB corpus) | #13, #12, #17 | Not in this tree | not run (different product) |
| Server corpus stays KJV | most Red Letter PRs | Matches | n/a |
| Server corpus moves to **WEB** (public domain worldwide) | #8 `cursor/world-class-red-letter-6ab5` | Still KJV | that branch’s `npm test` is a live-server smoke; **15 fetch fails** here (no server). Offline lint passed. |
| Forty path / Lent 2027 rooms | #22, #18; `data/paths.js` on this tree builds `RLA_FORTY` of length **40** from 28 daily + extras | Forty *data* exists; `IMPROVEMENT_PLAN.md` still lists Forty as a follow-up | n/a |
| GPT-6 Astra as a model choice | #23 | Not in this tree | 2 files failed: `Cannot find module 'openai'` (dep listed, not in this workspace’s `node_modules`) |
| “Quiet Chapel” / verified KJV server + shared safety detector | #10 | Not merged | **93/93 pass** |
| Advisor conscience / one shared signal file | #25 | Not merged | **68/68 pass** |
| Press / letterpress Advisor | #18 | Not merged | **61/61 pass** |
| Studio Codex | #20 | Not merged | **71/71 pass** |
| Forty path + release record | #22 | Not merged | **83/83 pass** |
| Masterpiece protocol pack | #16 | Not merged | **76/76 pass** |
| Ninety-day ideas + Advent | #17 | Not merged | **54/54 pass** |
| Editorial / hostable | #21 | Not merged | **44/44 pass** |
| Production-ready mobile (Capacitor) | #11 | Not merged | **44/44 pass** |

`[verified]` `(in-scope)` for file presence and for the suite commands above. Suites were run 2026-09-07. They are not a ranking and not a merge recommendation.

---

## Definition of done (from the 2026-09-06 brief)

| # | Checkable statement | Status on this checkout, 2026-09-07 |
| --- | --- | --- |
| 1 | Every answer cites a Gospel saying; model never types the verse | **Built** — `verifyAndSubstitute` `[verified]` `(in-scope)` |
| 2 | Tone is a warm advisor; scholarship sits behind the answer | **Built in prompt; not scored** — no eval set here |
| 3 | Evaluation set ≥ 40 real questions (hostile, off-scope, crisis-adjacent) with reviewed results; crisis inputs get 988 / findahelpline | Crisis path **built**. Eval set **not on this tree**. Sibling PRs have eval sets; those results are theirs |
| 4 | Builds for iOS and Android; Dean’s on-device checklist | **No mobile project on this checkout** |
| 5 | Release checklist marks every item verified or unverified | Pattern exists on some sibling PRs (`RELEASE.md`); **not on this tree** |

---

## Hard constraints

- Scope: His words only. No feed. No weekly price. `[verified]` `(in-scope)` — `LAUNCH.md`.
- Mobile-first, portrait. Paper not glass. One accent. `[verified]` `(in-scope)` — `DESIGN.md`.
- Fonts are loaded from Google Fonts (SIL OFL). `[assumption]` `(model-knowledge)` — confirm the license file before bundling fonts into a native binary.
- Model: Anthropic via `@anthropic-ai/sdk ^0.39.0`; default `ANTHROPIC_MODEL=claude-opus-5`. App must open with no key. `[verified]` `(in-scope)` — `package.json`, `README.md`.
- UK paid distribution of the KJV text as shipped (the spoken Gospels are far more than 500 verses) needs Cambridge’s written permission, or a UK geo-restriction, or a switch to a worldwide-public-domain text such as WEB. `[inference]` from the Cambridge 500-verse non-commercial clause `(retrieved)`.
- WEB, if ever adopted: public domain; the name “World English Bible” is a trademark for faithful copies only. `[verified]` `(retrieved)` 2026-09-07 — https://worldenglish.bible/
- Apple App Store Guideline **4.2**: an app must elevate beyond a repackaged website. **4.2.2**: other than catalogs, apps should not primarily be marketing materials, web clippings, or a collection of links. `[verified]` `(retrieved)` 2026-09-07 — https://developer.apple.com/app-store/review/guidelines/  
  A thin Capacitor wrap of this PWA is therefore a **review risk**, not a settled stack. `[recommendation]`.

---

## Tensions flagged, not reversed

1. **Name.** Recorded brief: “The Red Letter Advisor.” Shipped shell: “Red Letter.” `[recommendation]`: keep both (app / room). Do not rename the manifest until Dean says so.
2. **Front door.** Brief said chat-first. Shipped first screen is a title page; home is Today. A chat-first mobile release would move Advisor to the first screen or the primary dock action. That is an ANCHOR decision, not a maintenance pass.
3. **Which PR is the product line.** The open-PR field diverges on corpus, eval, mobile, and even translation. `[recommendation]`: this file stays the map; Dean names one line before any merge into `claude/jesus-teachings-chatbot-bSBhF`.

---

## Known risks

- Product intent was inverted once (scholarship-first). Start from the reader’s question. `[verified]` `(prior-worker)` — v1; still true.
- “Verified” may only mean “ran.” This file reports only commands run this session.
- Merge to the integration branch is a Pages publish **if** Pages is enabled. It is not enabled as of 2026-09-07 (404). The workflow still tries. Sign-off still required. `[verified]` `(in-scope)` + `(retrieved)`.
- `IMPROVEMENT_PLAN.md` on this tree still lists lectio / Forty / push as follow-ups; `data/paths.js` already builds 40 rooms and the page has a morning-reminder checkbox. The plan is **stale**. `[verified]` `(in-scope)`. Out of scope for this rebuild — see Cross-section notes.
- Market sentences in `LAUNCH.md` / `MARKET_STRATEGY.md` on this branch still treat Hallow “~$40M” as fact. Corrected wording lives on PR #15. `[verified]` `(prior-worker)` — v1; not re-audited this session.
- `folio/BRIEF.md` is cited by v1; the folder is **not on this branch**. `[verified]` `(in-scope)`.
- **Stale within hours:** open PR count and sibling-suite numbers. **Stale within 90 days:** Apple 4.2 text, Cambridge permissions wording, Pages 404, default `ANTHROPIC_MODEL`, Hallow/Bible Chat market sentences in `LAUNCH.md`.

---

## Authority

**Without asking:** edit code, tests, prompts, and docs on a working branch; run `npm test`, `npm run smoke`, `npm run qa`; open or update a draft PR.

**Always needs Dean:** merge into `claude/jesus-teachings-chatbot-bSBhF`; App Store / Play submission; any production deploy or domain purchase; spending; sending anything to a real person; deleting or force-pushing.

---

## Facts only Dean has

- `[QUALITY_REFERENCE_APPS]` — two apps to match on time-to-first-useful-answer and warmth.
- `[APPLE_DEVELOPER_ACCOUNT]` / `[PLAY_CONSOLE_ACCOUNT]` — whether they exist.
- `[UK_DISTRIBUTION]` — whether the first paid listing includes the UK.
- **Product line** — which open PR (if any) is the line to merge toward.

---

## Decision log

Append only. Do not rewrite earlier rows.

| Date | Decision | Label | Source |
| --- | --- | --- | --- |
| 2026-09-06 | `CLAUDE.md` created; `ATELIER.md` installed; compact protocol as a Cursor rule | recorded | v1 |
| 2026-09-06 | KJV 1769 confirmed in the build; US public domain; UK Crown check placed on the path | VERIFIED (repo) / then KNOWLEDGE (UK) | v1 |
| 2026-09-06 | Evaluation set recorded as not yet built; crisis handoff recorded as built | VERIFIED (repo) | v1 |
| 2026-09-06 | Merging into the integration branch classified as a publish | INFERRED from `pages.yml` | v1 |
| 2026-09-07 | UK KJV clause verified from Cambridge’s own sample pages: 500-verse liturgical / non-commercial ceiling; other uses need written permission | `[verified]` `(retrieved)` | this rebuild |
| 2026-09-07 | WEB confirmed public-domain worldwide; name is a trademark | `[verified]` `(retrieved)` | this rebuild |
| 2026-09-07 | Apple 4.2 / 4.2.2 read from Apple’s guidelines; Capacitor wrap recorded as a review risk, not a stack decision | `[verified]` `(retrieved)` | this rebuild |
| 2026-09-07 | Pages site 404; last successful workflow 30 Aug 2026 | `[verified]` `(retrieved)` | this rebuild |
| 2026-09-07 | This file rebuilt as v2 (checkout vs sibling-PR map). v1 preserved. No product code changed. No sibling PR merged | recorded | this rebuild |

---

## Open questions (batched)

1. Which open PR is the Red Letter product line, if any? `[recommendation]`: none until you read the contested table; keep this checkout as integration truth.
2. For a paid UK listing: write Cambridge, geo-restrict the paid tier, or move the server corpus to WEB? `[recommendation]`: write Cambridge before any paid UK switch; do not silently change translation.
3. Mobile: stay PWA-only; Capacitor shell (Apple 4.2 risk); or keep native work on the separate Red Words PRs? `[recommendation]`: PWA-only until the room has users; store wrap is a later commission.
4. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)? `[recommendation]`: yes, when you want the static room public; merge still needs sign-off.
5. Name and front door (tensions 1–2)? `[recommendation]`: Red Letter = app; Advisor = room; do not move the front door in a docs pass.
6. `[QUALITY_REFERENCE_APPS]` — two names. No default.

---

## STATE

- Mission lock: keep Red Letter’s system of record honest against this checkout and the open-PR field.
- Decisions made this session: none on the product. Documentation only.
- Work done: v1 archived; this v2 written; `REBUILD.md` and `docs/bot-notes.md` added; `npm test` 38/38 on this tree; sibling suites run as listed.
- Next step: Dean answers the six questions. No mobile MASTERWORK starts until question 1 and question 3 are answered.
- Open risks: 21 open PRs (count stale immediately); Pages 404; no eval on this tree; UK KJV permission unwritten; `IMPROVEMENT_PLAN.md` stale.

RESUME_FROM: Dean names the product line (question 1) and the mobile posture (question 3). Until then, do not start a mobile build.

---

## Sources opened this session

| Claim | Source | Opened |
| --- | --- | --- |
| UK KJV Crown rights; 500-verse liturgical / non-commercial ceiling | https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf | 2026-09-07 |
| WEB is public domain; name is a trademark | https://worldenglish.bible/ | 2026-09-07 |
| App Store 4.2 and 4.2.2 | https://developer.apple.com/app-store/review/guidelines/ | 2026-09-07 |
| Pages URL 404 | https://eyoitsmedean.github.io/Ai/ | 2026-09-07 |
| Pages API 404; last successful workflow 2026-08-30 | `gh api repos/eyoitsmedean/Ai/pages`; `gh run list --workflow=pages.yml` | 2026-09-07 |

Not opened this session (do not treat as citations): Cambridge “Queen’s Printer” HTML page (HTTP 500 / 403); `https://ebible.org/web/copyright.htm` (fetch timed out). Secondary articles from search snippets (Selling Jesus, kjbhistory, TBS) were not used as load-bearing citations.
