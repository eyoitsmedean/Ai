# CLAUDE.md — Red Letter · system of record

This file is the system of record for decisions on the Red Letter product (the app in this repo, whose chat room is the Advisor). Agents read `ATELIER.md` for how to work and this file for what is settled. Append decisions here with a date; never rewrite history. The Ninety Days folio has its own brief at `folio/BRIEF.md`.

Labels: VERIFIED · SOURCED · KNOWLEDGE · INFERRED · ESTIMATED · ASSUMED · PROPOSED (see `ATELIER.md` §5). "Repo" as a source means the file was opened in this repository on the date given.

## What moved since the filled example (checked against the repo, 2026-09-06)

| The example said | What the repo shows | Status |
| --- | --- | --- |
| Decisions are "recorded in the repo's CLAUDE.md" | No `CLAUDE.md` existed on any branch (`git ls-tree` on `claude/jesus-teachings-chatbot-bSBhF`; there is no `main`) | Fixed — this file |
| Name "The Red Letter Advisor" | `package.json` name `red-letter-advisor`; the `DAILY_SYSTEM` prompt and `IMPROVEMENT_PLAN.md` say "The Red Letter Advisor"; `README.md`, `public/manifest.json`, and the UI say **Red Letter**, with the Advisor as one of five rooms (Today, Seek, Sit, Advisor, Journal) | Decision stands; naming tension flagged below |
| "Advisor-first product, not a scholarship tool" | The build is a reading room first: title page → Today/Seek; the Advisor is a room, not the front door (`README.md` "The room"; `DESIGN.md` "The words of Jesus are the interface") | Decision stands; product-shape tension flagged below |
| Translation "public domain or licensed — state which" | KJV 1769, `data/gospels-kjv.json`; `lib/scripture.js` sets `translation = 'KJV'`; README: "KJV text is public domain. Attribution is printed beside citations." | Settled: KJV. License note below |
| "Standalone HTML build on Claude's API" | Node/Express `server.js` + `@anthropic-ai/sdk ^0.39.0`, default `ANTHROPIC_MODEL=claude-opus-5`; PWA (`public/manifest.json`, `public/sw.js`); GitHub Pages serves `public/` with curated fallbacks; no iOS or Android project exists | Accurate; mobile stack still undecided |
| "Evaluation set of at least 40 real questions with reviewed results" | None in the repo (searched `test/`, `scripts/`, `data/`); `npm test` covers API, scripture verification, church year — 38 tests | Not built. Definition of done item 3 is open |
| "Crisis-adjacent inputs get a caring handoff" | Built: `lib/scripture.js` `looksLikeCrisis` + `CRISIS_NOTICE` (988, findahelpline.com) streamed before any verified content; `data/advisor.js` regex fallback when the model is off; README and DEMO.md make 988 the demo's pass condition | Done; keep it |

## PROJECT BRIEF — Red Letter (corrected)

Mission (one line):
Ship Red Letter's Advisor as a production-ready, chat-first room that applies Jesus's own words from the four Gospels to a real life situation — verified against the corpus before a verse is shown.

The finished thing (artifact class, file format, where it lives):
A working app that installs on iPhone and Android; code in this repo with tests, the Advisor prompts (`server.js`), and a written evaluation set with results checked into `test/` or `eval/`. Today the shippable form is the PWA plus the Node API host.

Audience and use moment (who, when, in what state of mind):
Someone carrying a real question, often at a low moment, on a phone; wants a warm, direct answer within seconds with verse citations they can check. Never assume the reader's level of faith (Advisor system prompt, repo).

Definition of done (checkable):
1. Every answer cites a Gospel passage containing Jesus's direct words, inserted by the harness from the KJV corpus — the model emits only `{{Book Chapter:Verse}}` placeholders and never types a verse (`server.js` STRICT RULES; `lib/scripture.js` `verifyAndSubstitute`). Status 2026-09-06: built.
2. Tone reads as a warm advisor; scholarship sits behind the answer (Advisor prompt: EMPATHY → SCRIPTURE → CLOSING; "the scripture passages carry the weight"). Status: built; not yet scored against an evaluation set.
3. Passes an evaluation set of at least 40 real questions — hostile, off-scope, and crisis-adjacent included — with reviewed results; crisis inputs receive 988 / findahelpline inside the product. Status: crisis path built; evaluation set not built.
4. Builds without error for iOS and Android targets; on-device testing is Dean's step and ships as a written five-minute checklist (DEMO.md already holds the eight-minute guest script for the web build). Status: no mobile build exists.
5. The release checklist marks every item verified or unverified. Status: pattern in use on PR #15; not yet applied to a Red Letter release.

Mode: MASTERWORK.
Team: orchestrator + Builder + Breaker (the Breaker builds nothing and gathers none of the evidence it attacks).
Capabilities this bot has: web search and fetch, shell and Node, headless Chrome, file output, subagents, GitHub and Notion tools; no memory across sessions beyond this file.
Budget and size: MASTERWORK research budget (≤25 searches); multi-session build; every session ends with a STATE block appended below.

Hard constraints (money, tech, brand, legal, tone; third-party material and its license):
- Scope is Jesus's spoken words only — Matthew, Mark, Luke, John. "Never quote Paul, prophets, or other authors" (Advisor prompt). No feed. No weekly price (`LAUNCH.md`).
- Translation: King James Version, 1769 text. Public domain in the United States (README; VERIFIED in repo). KNOWLEDGE, stale-by before any UK release: in the United Kingdom the KJV is under perpetual Crown copyright administered through letters patent, and commercial distribution there may require permission — confirm with the current rights holder before an App Store or Play release that includes the UK.
- Mobile-first performance; portrait; paper `#F4EFE4`, ink near-black, crimson `#8F1D1D` reserved for His speech and the one active state (`DESIGN.md`; VERIFIED in repo).
- Fonts: Fraunces and the other Google Fonts families are loaded by link under the SIL Open Font License (KNOWLEDGE; verify the license file if fonts are ever bundled into a native binary).
- Not a person, not therapy, not pastoral counseling; 988 and findahelpline stay in the product (README, `LAUNCH.md` law 5).
- Model: Anthropic API via `@anthropic-ai/sdk`; the app must still open with no API key (curated, corpus-verified pages).

Decisions already made (do not re-litigate):
- The name "The Red Letter Advisor" for the product's chat room and package; the app shell is titled "Red Letter" (see tension 1 below).
- Parchment-and-crimson palette; one accent; paper, not glass; chrome disappears when you Sit (`DESIGN.md` principles 1–7).
- Advisor-first, not a scholarship tool (Dean, 2026-09-06 brief); see tension 2 below.
- Verse text is never generated: placeholders + corpus substitution + verification (`lib/scripture.js`).
- Pricing when money exists: free words; annual $59.99–$69.99 as the lead SKU; monthly $9.99 never led with; no weekly paywall (`LAUNCH.md`).
- Lent is the commercial season; Advent 2026 is the craft window (`LAUNCH.md`, `folio/BRIEF.md`).
- Mobile stack — not yet decided. Two options for the next kickoff's ANCHOR, PROPOSED:
  - A (default unless Dean says otherwise — reuses the existing HTML build): wrap the PWA in Capacitor for iOS and Android, keep `server.js` as the API host; risk: App Store review of thin web wrappers, service-worker caching inside the shell.
  - B: rewrite the client in Expo/React Native against the same `/api/*`; risk: re-typesetting the folio design and re-testing the verse pipeline in a second codebase.

Facts only Dean has (values, or "ask me"):
- `[QUALITY_REFERENCE_APPS]` — the two apps to match for time-to-first-useful-answer and warmth of tone.
- `[APPLE_DEVELOPER_ACCOUNT]` / `[PLAY_CONSOLE_ACCOUNT]` — whether they exist; the mobile build cannot be submitted without them (submission always needs sign-off).
- `[UK_DISTRIBUTION]` — whether the first release lists in the UK (decides whether the KJV Crown-copyright check is on the path).

Assets, repos, and system of record:
- Repo `eyoitsmedean/Ai`; integration branch `claude/jesus-teachings-chatbot-bSBhF` (there is no `main`).
- `server.js` (Advisor and daily prompts, verification, crisis notice), `lib/` (scripture, retrieval, themes, church year), `data/` (KJV corpus, red-letter source, spoken corpus), `public/` (PWA), `test/` (38 tests), `scripts/` (spoken-corpus build, icons, smoke, browser QA), `DESIGN.md`, `LAUNCH.md`, `MARKET_STRATEGY.md`, `DEMO.md`, `IMPROVEMENT_PLAN.md`.
- This file is where decisions get written; `ATELIER.md` is how the work is done.

Known risks / what went wrong before:
- Product intent was inverted once (scholarship-first). Read this file and `DESIGN.md` before designing anything.
- Unverified checks cannot ship; "tested" means ran.
- `.github/workflows/pages.yml` deploys `public/` to GitHub Pages on every push to `claude/jesus-teachings-chatbot-bSBhF`. Merging a PR into that branch is therefore a **publish** under `ATELIER.md` §1.4 and needs Dean's sign-off each time.
- Market claims in `LAUNCH.md` / `MARKET_STRATEGY.md` on this branch still say Hallow "made ~$40M" as fact and that Bible Chat's "reviews are rotting"; the corrected wording (Appfigures estimate; complaint volume rising, star ratings holding) is on the PR #15 branch and lands here when that PR merges.

Authority (what you may do without asking; what always needs sign-off):
- Without asking: edit code, tests, prompts, and docs on a working branch; run `npm test`, `npm run smoke`, `npm run qa`; open or update a draft PR.
- Always needs sign-off: merging into `claude/jesus-teachings-chatbot-bSBhF` (publishes Pages), App Store / Play submission, any production deploy or domain purchase, spending, sending anything to a real person, deleting or force-pushing.

Quality reference (two named examples, and what to match):
`[QUALITY_REFERENCE_APPS]` — Dean to name. What to match: time from first open to first useful answer, and warmth of tone.

## Tensions flagged, not reversed (2026-09-06)

1. **Name.** The recorded decision is "The Red Letter Advisor"; the shipped shell, manifest, and README say "Red Letter". Recommended resolution at the next kickoff: "Red Letter" is the app, "the Advisor" is the room, and store listings use "Red Letter — words Jesus spoke" (PROPOSED). Until Dean decides, do not rename files or the manifest.
2. **Front door.** "Advisor-first, chat-first" versus a build whose first screen is a title page and whose home is Today. A chat-first mobile release would move the Advisor to the first screen or make it the primary dock action. This is a design decision with retention consequences either way; it belongs in ANCHOR of the mobile build, not in a maintenance pass.

## Decision log

| Date | Decision | Label | Source |
| --- | --- | --- | --- |
| 2026-09-06 | `CLAUDE.md` created as system of record; `ATELIER.md` installed; compact protocol loaded as a Cursor rule | recorded | this commit |
| 2026-09-06 | KJV 1769 confirmed as the translation in the build; US public domain; UK Crown-copyright check placed on the path for any UK release | VERIFIED (repo) / KNOWLEDGE (UK) | `README.md`, `lib/scripture.js` |
| 2026-09-06 | Evaluation set recorded as not yet built; crisis handoff recorded as built | VERIFIED (repo) | `test/`, `lib/scripture.js`, `data/advisor.js` |
| 2026-09-06 | Merging into the integration branch classified as a publish action | INFERRED from `pages.yml` | `.github/workflows/pages.yml` |

## Open questions (batched; recommended default in parentheses)

1. Is the mobile build the next commission? (Default: yes, on a fresh kickoff using this brief; nothing starts until Dean sends it.)
2. Mobile stack A or B? (Default: A, Capacitor around the existing PWA, per Dean's own default.)
3. Name and front door — tensions 1 and 2 above. (Default: keep "Red Letter" as the app name and make the Advisor the first dock action in the mobile shell.)
4. `[QUALITY_REFERENCE_APPS]` — two names. (No default; without them the "match" criterion cannot be scored.)

## STATE

- Mission lock: Red Letter's Advisor as a production-ready, chat-first mobile room; this session installed the protocol and corrected the brief only.
- Decisions made this session: none on the product; documentation and record-keeping only.
- Work done: `ATELIER.md`, `.cursor/rules/atelier-protocol.mdc`, this file; `npm test` 38/38 on the integration branch.
- Next step: Dean answers the batched questions, then a MASTERWORK kickoff for the mobile build starting at ANCHOR with the two stack options.
- Open risks: Pages publishes on merge; no evaluation set; UK KJV rights unchecked.

RESUME_FROM: MASTERWORK kickoff — ANCHOR for the Red Letter mobile build, using this brief and Dean's answers to the four open questions.
