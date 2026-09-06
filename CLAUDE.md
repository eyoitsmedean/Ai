# CLAUDE.md — system of record for The Red Letter Advisor

Read this before designing anything. Decisions here are settled; build on them. If you believe one is wrong, keep it and flag your reasoning in the ship note — never reverse it silently.

## What this is

A quiet reading room for the words Jesus spoke in Matthew, Mark, Luke, and John (King James text, sealed in `data/spoken-gospels.json`). Advisor-first: a person carrying something at 1 a.m. gets one sentence He actually said, cited and verified, then the page closes. Not a scholarship tool. Not a full Bible. Not a person.

## Decisions (locked)

| Decision | Recorded |
| --- | --- |
| Name: **The Red Letter Advisor**; the room is called **Red Letter** / **The Quiet Page** | brief |
| Palette: paper `#F4EFE4`, ink `#1B1610`, crimson `#8F1D1D` used only for His words | DESIGN.md, Codex Ch. II |
| Corpus: Jesus's direct speech only, KJV, verified line by line; the model may not quote from memory (`verifyAndSubstitute`) | lib/scripture.js |
| Face: the bound-book folio; welcome and privacy are the same cream paper | PR #11, #20 |
| Mobile stack: PWA first (reuses the HTML build), Capacitor shells for the stores; no React Native rewrite | PR #11 |
| Local-first: no accounts, no sync; the journal lives on the phone; *Keep a copy* is the backup | Codex Ch. X, PR #20 |
| Crisis: 988 + findahelpline on the title page, in the Advisor, in Carrying, on blessing pages; the notice comes before any verse | lib/scripture.js `CRISIS_PATTERN`, eval C/P rows |
| The Advisor ends: two turns, then the last leaf; "keep writing" once | Codex Ch. IV |
| Money: never weekly, never a gate on His words; sell an object (chapbook) or an annual lamp later | LAUNCH.md, Codex Ch. VIII |
| Refusals: no "Ask Him" phrasing, no OS-dark auto chapel, no streak shame, no parish dashboards, no kids app, no margin conversations, no Codex in the guest dock, no UTC path dates | Codex Ch. IX |
| Dates are local (`todayStr()`); a missed day never skips a room | index.html |

## Decisions made 2026-09-06 (this session; ASSUMED where the brief was silent)

- **Concordance floor.** On the no-key path `bestNeed` requires score ≥ `NEED_FLOOR` (14); below it the standing letter (John 14:27 + Matthew 11:28) is sent. Rationale: single-word hits (score 6–7) sent "I want revenge" to Mark 4:39. Precision over recall for a room that claims "the map, not the model."
- **The helpline is the primary safety control; detection is secondary.** 988 + findahelpline are printed above the Advisor composer at all times (not only after a match), on the title page, in Carrying, on blessing pages, and in `/privacy`. Reason: the Breaker measured the detector on held-out phrasings at 0/16 (flat regex) and 1/20 (first cue scorer) — a control that depends on recognising the sentence cannot be the only one. RELEASE.md row 2b carries the measured numbers.
- **One safety core.** `lib/safety-core.js` (no Node globals) holds the crisis cue scorer, the medical/identity/decision/scope patterns, the notices, and `verseSafeFor`; `npm run safety` copies it verbatim to `public/data/safety.js` so Carrying, the Advisor modal, and the offline Advisor run the same code as the server. `test/safety.test.js` fails if they drift. Precedence: crisis → medical → identity → decision → scope.
- **Crisis scoring, not a phrase list.** Explicit language, acts in progress, first-person intent + death/means object in a short window, strong hopelessness, and third-person disclosure fire alone; weaker cues (own death, means, finality, hopelessness, "tonight") fire in combination; benign contexts (range, carbs, farewell, vacation, debt, baptism) raise the bar but never silence the strong cues. Discipleship idioms ("die to self", "crucified with Christ", "the old me is dead") are excluded from explicit triggers.
- **Death-verse block.** Any first-person mention of one's own death that is not fear or grief for another gets the standing letter — never John 11:25/26, John 10:10, Matthew 5:4 — regardless of whether the scorer fired (`verseSafeFor`).
- **Crisis pattern widened** to the C-SSRS screener phrasings, 988 warning-sign language, slang and misspellings (kms, unalive, sucide), past tense and theological ("if I killed myself"), means and plans (pills ready, bought a gun, how much tylenol, wrote the letter to my kids, gave the dog away and said goodbye), and third person ("my son says he wants to die" — the notice now speaks to the one who loves them). Sources: cssrs.columbia.edu; SAMHSA 988 warning-signs card PEP23-08-03-001; the Breaker's 2026-09-06 probe. Crisis inputs always get the standing letter, never a death/mourning verse. "I want the pain to stop" and "I can't take it anymore" were deliberately dropped as triggers (toothaches, bad bosses).
- **Medical notice** only for treatment *decisions* (stop/skip/instead of/rather pray); prescription glasses and a praying therapist are not medical.
- **Identity notice** for "Are you Jesus?" and "chatbot pretending to be Jesus": plainly software, not Him. Bare "robot" is not a trigger.
- **Decision notice** for stay/leave/sue/give/quit questions: the room will not make the decision, and says so.
- **Scope notice** only when a book name looks like a citation or a request to quote ("Psalm 23", "what did Paul say", "read me Genesis"); "my friend Paul died" and "a revelation about my marriage" are needs. Chores (résumé, joke, weather, homework) need a request verb.
- **Concordance coverage boost.** A question that restates ≥ 60 % of a carry line's tokens is that line ("I am not a Christian. Can I still read this?" → John 6:37). Eight gravity rules added (dying, money, exhausted, far from God, sick child → Mark 5:36, lost → Luke 15:20, lied → John 8:11); "dying to see my grandkids" is excluded as idiom. The client Carrying matcher now receives the stop list, gravity, and floor from `public/data/concordance.js`.
- **Rate limit** is configurable via `CHAT_RATE_PER_MIN` (default 40) so the evaluation harness can run in-process.
- **Evaluation set** lives in `eval/questions.json` (149 rows; crisis rows include every held-out phrasing the Breaker wrote in rounds 2–3, and 40 `ordinary` sentences that must trigger nothing); `npm run eval` writes `eval/RESULTS.md`. Add failing phrasings there before touching a pattern. A claim that detection improved requires a fresh held-out set from an agent that did not see the code.

## Where things live

- `public/index.html` — the room (monolith, no build step) · `public/codex.html` — the founder's studio book at `/codex` (never linked for guests) · `public/privacy.html` — `/privacy`
- `lib/scripture.js` — corpus, verification · `lib/safety-core.js` — crisis scorer, routing, notices (shared with the room) · `lib/safety.js` — server face · `lib/concordance.js` — Concordance of Need (88 sealed lines) · `lib/blessing.js` — `/b/{token}` pages
- `scripts/` — smoke, qa-browser, qa-mobile, demo-humans, eval, build-concordance
- `RELEASE.md` — every claim VERIFIED or UNVERIFIED, plus the on-device checklist · `DEMO.md` — hosting a guest · `LAUNCH.md` — the 90 days · `DESIGN.md` — type and paper

## Open questions (only Dean can decide)

1. Which two apps are the quality reference for time-to-first-useful-answer and warmth of tone.
2. Whether to run the model-path evaluation (`ANTHROPIC_API_KEY=… npm run eval`) before store submission — recommended yes.
3. Whether the printed chapbook is sold into the UK (requires Cambridge University Press permission).

## Known risks / what went wrong before

- Product intent was inverted once (scholarship-first). Advisor-first stands.
- Unverified checks cannot ship; see `RELEASE.md` for what is still UNVERIFIED and what it takes.
- Two live defects were found only by simulating a second visit and a first-time tap: reopening with saved letters threw (fixed 6d07ada); the dimmed title-page button read as stuck (fixed c88fffa). Test the second session, not just the first.
