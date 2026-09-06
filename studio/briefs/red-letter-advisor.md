# PROJECT BRIEF — The Red Letter Advisor

Corrected against the repo on 6 September 2026. Lines marked **moved** differ from the example brief Dean supplied; each carries its evidence and label. Lines marked **ask me** are facts only Dean holds. Nothing here reverses a recorded decision; one conflict is flagged, not resolved.

**Mission:** Ship the Red Letter Advisor as a production-ready, chat-first advisor that applies Jesus's own words from the four Gospels to modern life situations.

**The finished thing:** the web app in this repo (`public/` PWA + `server.js` Advisor API) with tests, prompts, and a written evaluation set with results.
*moved.* The example said "a working app that builds for iPhone and Android." The recorded decision of 5 Sep 2026 (`studio/ninety/PROMPT.md`, `CLAUDE.md`) is: no second product architecture for Red Letter or Red Words; native lives in **Red Words** (separate Flutter app, WEB corpus; Android APK exists, iOS archive needs a Mac, store consoles founder-only — SOURCED from prior agent transcripts, not re-verified this session). **Flag, not reversal:** if Dean wants the *Advisor* on iPhone and Android, that is a Red Words commission, or an explicit decision to lift the 5 Sep rule. Recommended default: Advisor ships as the web PWA; Red Words carries native.

**Audience and use moment:** someone carrying a real question about their life, often at a low moment, on a phone; wants a warm, direct answer within seconds with verse citations they can check.

**Definition of done:**
1. Every answer cites a Gospel passage containing Jesus's direct words, quoted from the KJV corpus in `data/gospels-kjv.json` (1769 Cambridge, public domain — VERIFIED, attribution field in the file) and verified against the red-letter map `data/spoken-gospels.json` (1,922 spoken verses — VERIFIED, counted this session). Never from memory. *Status: enforced in `lib/scripture.js` (`verifyQuote`, `verifyAndSubstitute`) and covered by `test/scripture.test.js`, `test/api.test.js` — VERIFIED, 47/47 pass.*
2. Tone reads as a warm advisor; scholarship sits behind the answer, not in front of it. *Status: system prompt `ADVISOR_SYSTEM` in `server.js` line 79 — VERIFIED present; tone not evaluated this session.*
3. Passes an evaluation set of at least 40 real questions — including hostile, off-scope, and crisis-adjacent ones — with reviewed results; crisis-adjacent inputs get a caring handoff to human help inside the product. *Status (6 Sep 2026, second session): the set exists — `eval/questions.json`, 59 turns, `npm run eval`, results in `eval/RESULTS.md`, review in `eval/REVIEW.md`. VERIFIED 59/59 in fallback mode (gate, verifier, transport, validation). A separate Breaker agent found the gate missed 38 of 56 realistic crisis sentences and that `1 John 4:18` was being rewritten as John 4:18; both repaired and pinned in tests. **Live-model run: not performed — no key here. That is the remaining step, and it is Dean's.***
4. *moved.* "Builds without error for iOS and Android" belongs to Red Words. For this repo: `npm test` passes, `scripts/qa-browser.js` passes against `node server.js`, and the PWA installs from an HTTPS URL. *Status: first two VERIFIED this session; HTTPS URL blocked on Pages enablement (founder-only).*
5. The release checklist marks every item verified or unverified — nothing described as passed that was not run.

**Mode:** MASTERWORK (for the evaluation-set commission). Maintenance edits: QUICK.
**Team:** orchestrator + Builder + Breaker (the Breaker built nothing).
**Capabilities this bot has:** web search, code execution, file output, subagents, git push to working branches. No persistent memory beyond this repo. No Anthropic key in the cloud environment — the Advisor runs in fallback mode here (VERIFIED: `server.js` line 38 `hasAnthropic`; README line 27).
**Budget and size:** MASTERWORK research budget; multi-session — end every session with a STATE block in the ship note and a FOR THE RECORD entry in `CLAUDE.md`.

**Hard constraints:**
- Scope is Jesus's spoken words only, not the whole Bible. Four Gospels. Never Paul.
- Mobile-first performance; the folio is paper, not a feed (`DESIGN.md`).
- Translation: KJV 1769, public domain (VERIFIED, corpus attribution). KNOWLEDGE with stale-by warning: the KJV remains under Crown letters patent in the United Kingdom (Cambridge University Press administers it); this is irrelevant for US distribution and should be checked only if a UK store listing is ever planned.
- Never lock scripture. Never a weekly price. Never a model speaking as Jesus or God (`LAUNCH.md`, `MARKET_STRATEGY.md`).
- Clean room: nothing from Dean's employer touches this project (`studio/ninety/PROMPT.md`).
- Third-party: `@anthropic-ai/sdk` (MIT-form permissive licence, Anthropic PBC 2023 — VERIFIED, `node_modules/@anthropic-ai/sdk/LICENSE`); express MIT, cors MIT, dotenv BSD-2-Clause (VERIFIED from installed `package.json` licence fields). All permit commercial use with notice retained. Fonts Fraunces, Source Serif 4, Instrument Sans via Google Fonts (SIL OFL — KNOWLEDGE, stale-by; confirm before bundling files rather than linking).

**Decisions already made (do not re-litigate):** the name "The Red Letter Advisor"; parchment-and-crimson palette; advisor-first, not a scholarship tool; church-year seasons change the paper; Seven Days and *Watch with me* paths; his words stay free. Full table in `CLAUDE.md`.
*moved.* The example said these were "recorded in the repo's CLAUDE.md" — no `CLAUDE.md` existed on any branch until 6 Sep 2026 (VERIFIED: `git ls-tree` on both remote branches). It exists now and is the system of record.
*moved.* "Not yet decided: the mobile stack" — decided. Red Words is Flutter; Red Letter is the web PWA; they do not merge.

**Facts only I have (ask me):**
- Two quality-reference apps and what specifically to match (time to first useful answer; warmth of tone).
- Where the Red Words repo lives (not visible under `eyoitsmedean` on GitHub — VERIFIED via `gh api users/eyoitsmedean/repos`, one public repo: `Ai`).
- Whether an Anthropic key should ever be present in the cloud-agent environment for live Advisor evaluation, or whether evaluation runs on Dean's machine.

**Assets, repos, and system of record:** this repo (`github.com/eyoitsmedean/Ai`, default branch `claude/jesus-teachings-chatbot-bSBhF`, no `main` — VERIFIED). `CLAUDE.md` is the system of record. Working protocol `studio/ATELIER.md`. Design language `DESIGN.md`. Launch doctrine `LAUNCH.md`. Market research `MARKET_STRATEGY.md`. 90-day plan `studio/ninety/`.

**Known risks / what went wrong before:** product intent was inverted once (scholarship-first) — read `CLAUDE.md` and `DESIGN.md` before designing anything. Forty-plus research pages and zero paid users — do not commission more research as the deliverable. An earlier build quoted Matthew 28:20 as *always* (KJV: *alway*) — quotes come only from the corpus, never typed from memory. Unverified checks cannot ship.

**Authority:** edit code, docs, and working branches freely; run tests; open and update PRs. No App Store / Play submission, no production deploy, no Pages enablement (founder-only), no spending, no outreach, no posting without sign-off.

**Quality reference:** **ask me** — two named apps, and what to match.
