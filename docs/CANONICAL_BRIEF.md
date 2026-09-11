# Canonical brief — The Red Letter Advisor

**Version:** 2026-09-11  
**Audience:** Dean, and any agent who continues this work  
**System of record for decisions:** `CLAUDE.md`  
**This file is the brief.** Later agents read it before they invent a new project.

---

## Intended outcome

Ship a production-ready, chat-first advisor that applies **Jesus’s own words from the four Gospels** to a modern life situation. Advisor-first, not a scholarship tool. The reader is often on a phone, often at a low moment, and wants a warm direct answer within seconds with citations they can check.

## Who it is for

Someone carrying a real question about their life. Not a pastor, not a clinician, not an academic. The product must stay usable if they never learn the word “lectio.”

## Original requirements (explicit)

From user prompt 3 (ATELIER project brief), quoted in substance and checked against the transcript:

1. Every answer cites a Gospel passage containing Jesus’s direct words, quoted from a public-domain or licensed translation **opened during the build** — never from memory.
2. Tone reads as a warm advisor; scholarship sits behind the answer.
3. Passes an evaluation set of at least 40 real questions — including hostile, off-scope, and crisis-adjacent — with reviewed results; crisis-adjacent inputs get a caring handoff to human help **inside the product**.
4. Builds without error for iOS and Android targets; on-device testing is Dean’s step and ships as a written five-minute checklist.
5. The release checklist marks every item verified or unverified — nothing described as passed that was not run.

Hard constraints (same brief): Jesus’s words only, not the whole Bible; mobile-first; translation must be PD or licensed for app distribution, named with a source.

Authority (same brief): edit code and branches freely; **no** App Store / Play submission, production deploy, or spending without sign-off.

Decisions already made (same brief + `CLAUDE.md`): name “The Red Letter Advisor”; parchment-and-crimson palette; advisor-first. Mobile stack was undecided; later amended to Capacitor over `public/` (`CLAUDE.md` #15).

Quality reference: two named apps were never supplied. Match target remains “time from first open to first useful answer” and “warmth of tone.”

## Recovery table — first user prompts in this conversation

Source: this run’s transcript at `/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-31-50Z-ffa8/bc-01a06f5c-a2b7-7009-a99d-678c2adc0ebd/transcript.json` (extracted 2026-09-11). **Eight user messages exist, not ten.** There is no ninth or tenth user prompt in this conversation. Nothing below is reconstructed from memory.

| # | First words (verbatim) | Requirement / preference | Current implication | Later amendment |
|---|---|---|---|---|
| 1 | “Can you add the recent gpt astra agent to my model choices?” | Add GPT Astra as a selectable model | `gpt-6-astra` is in `lib/models.js` beside `claude-opus-5`. Operator env, not a reader toggle (`CLAUDE.md` #6) | None. Still in force |
| 2 | “# FORGE — Universal Project Execution Prompt Take ownership of advancing the project already established…” | Recover state, resolve controlling questions, produce the strongest finished result | Authorized deep execution on the *existing* Advisor, not a new app | Superseded in method by prompts 3, 4, 8; not in product intent |
| 3 | “# ATELIER PROTOCOL — MASTER PROMPT You are a principal-level practitioner working in Dean's atelier…” plus the filled **PROJECT BRIEF — The Red Letter Advisor** | The five DoD items above; MASTERWORK; CLAUDE.md as system of record; propose two mobile options and default to the one that reuses the HTML build | This is the product brief. DoD still governs | Mobile default later locked to Capacitor (A). Eval set built (61). CLAUDE.md created |
| 4 | “# UNIVERSAL REBUILD PIPELINE — any project · any platform · any model You are one worker…” | Rebuild a named target non-destructively; research; QA twice | Applied to `lib/retrieve.js` (lexicon + BM25). Original ranker remains in git at `99f4a39` | Prompt 5 ordered the rebuild finished |
| 5 | “Finish with grok” | Complete the in-progress retrieval rebuild | Shipped `0fec7ae` | None |
| 6 | “Show me your best finished product” | See the running app, not a plan | Demoed at `http://127.0.0.1:3000`; screenshots under `/opt/cursor/artifacts/screenshots/` | None |
| 7 | “Massive sprint time get to it pick 5 priorities and push for 45 minutes to an hour” | Five shipped priorities, no ceremony | Shipped `f20bbed`: retrieval-aware letters, narrator strip, Capacitor config, RELEASE.md, prodigal tags | None |
| 8 | “UNIVERSAL PROJECT RECOVERY, DEEP RESEARCH, AND EXECUTION COMMISSION Execute this commission…” | Recover first ten prompts, research core + five adjacent, complete three flagships, review, continue | This file, `docs/RESEARCH.md`, `docs/OPERATOR_KIT.md` | — |

**Missing access:** no timestamps on transcript user entries. No attachments on these eight messages. Prompts 2, 3, 4, and 8 are long protocol texts; the *product* commission inside them is the Red Letter brief in prompt 3.

## Later amendments (preserve)

- Model choice is operator configuration (`MODEL=`), not an in-app picker. (`CLAUDE.md` #6)
- OpenAI requests send `store: false`. (`#7`)
- Node 22. (`#8`)
- Crisis pattern is one source; “suicide” as a noun fires. (`#9`, `#12`)
- Crisis readers get only `CRISIS_CITATIONS`. (`#10`)
- `npm run eval` is the release gate. (`#11`)
- Retrieval is lexicon + BM25. (`#13`)
- Offline letters use the retrieved allow-list. (`#14`)
- Mobile default is Capacitor over `public/`. (`#15`)
- Offline openings are warm only when a need is recognized. (`#16`)
- Lexicon false positives on “making money” / “cannot stop crying” are closed; skeptic lines retrieve refusal sayings. (`#17`)
- Live prompt forbids unprompted emotion-based questions. (`#18`)
- No store submission, no production deploy, no spending (prompt 3). Still in force.

## Current scope

**In:** the web/PWA room (`public/`), Node Advisor API, KJV Gospel corpus, crisis handoff, eval, Capacitor *config*, documentation Dean can act on.

**Out:** App Store / Play upload; paid ads; a scholarship apparatus; the rest of the Bible; a new native Kotlin/Swift rewrite; Notion as system of record (Dean’s Notion workspace is other projects — searched 2026-09-11, no Red Letter home page).

## Existing assets (authoritative paths)

| Asset | Path |
|---|---|
| Decisions | `CLAUDE.md` |
| App | `public/index.html`, `server.js` |
| Verse truth | `lib/scripture.js`, `data/gospels-kjv.json`, `data/spoken-gospels.json` |
| Retrieval | `lib/retrieve.js` |
| Offline letter | `lib/letter.js` |
| Crisis | `lib/crisis.js` |
| Eval | `eval/questions.json`, `eval/RESULTS.md`, `eval/OFFLINE_REVIEW.md` |
| Mobile | `capacitor.config.json`, `DEVICE_CHECKLIST.md` |
| Honesty | `RELEASE.md` |

## Obstacles (the real ones)

1. **No live model letter has been reviewed.** DoD 2 and the “reviewed results” half of DoD 3 are blocked on a key Dean has not put in this environment. Offline letters *have* been reviewed (2026-09-11).
2. **No `ios/` or `android/` tree.** DoD 4 is config + checklist, not a binary. Generating those trees here would still not be an on-device pass.
3. **UK KJV prerogative.** The app embeds far more than 500 verses. Outside the UK that is ordinary public-domain use. A UK store listing or UK-hosted commercial distribution needs CUP written permission. See `docs/RESEARCH.md`.
4. **Quality-reference apps were never named.** Warmth still has no external benchmark.

## Preserve / improve / complete / retire

| Action | What |
|---|---|
| Preserve | Crisis-first title page; placeholder-only model contract; `store: false`; parchment/crimson; eval harness; BM25 retrieval |
| Improve | Offline letter openings on hostile/off-scope; skeptic retrieval (Luke 4:12); Seek library narrator frames |
| Complete | Live `npm run eval`; DEVICE_CHECKLIST on a phone; CUP decision if UK distribution is planned |
| Retire | The idea that a generic John 14:27 letter is “the Advisor” when no key is present |

## Acceptance criteria (observable)

- [x] Eight original user prompts recovered from the transcript; fewer than ten stated
- [x] Offline `/api/chat` cites retrieved Gospel speech, verified against the corpus
- [x] Crisis notice precedes the letter; 13/13 eval
- [x] Eval ≥ 40 with hostile / off-scope / crisis; 61 questions; offline 61/61
- [x] Eight offline letters read and scored (`eval/OFFLINE_REVIEW.md`)
- [ ] Live letters saved and read
- [ ] iOS and Android *builds* run (Dean)
- [ ] On-device five minutes (Dean)
- [x] RELEASE.md uses only verified / unverified

## Assumptions

- Dean is the only human reviewer. [assumption]
- Default store territory is the US. [assumption] — UK listing would change the KJV work.
- Capacitor (A) remains the mobile path unless Dean names native. [decision #15]

## Unresolved (Dean only)

- Harm-to-others phrasing in the crisis detector
- Whether to add an LLM warmth score
- Whether to seek CUP permission or keep UK distribution out of scope
- The two quality-reference apps
