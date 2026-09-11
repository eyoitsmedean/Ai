# Canonical brief — Red Letter

**Version.** 2026-09-11 (recovery).  
**Audience.** Dean (owner) and any agent continuing this work.  
**Product.** A quiet reading room and an Advisor constrained to the spoken words of Jesus in Matthew, Mark, Luke, and John (KJV).  
**This file is the brief.** `CLAUDE.md` remains the system of record for settled product decisions.

---

## Intended outcome and audience

Dean asked for a **world-class** companion: researched, built, QA’d, and rebuilt until it is beautiful to a human who loves things that are complex in the making and simple in the using. The person holding the phone should meet **His recorded speech**, not a chatbot pretending to be a pastor.

Later he asked that it be **production-ready**, that it **wow him on review**, and that it keep building. The audience is Dean first; then anyone he sends a blessing to; then, if he chooses, a public GitHub Pages reader.

---

## Original requirements (first ten user prompts)

Recovered verbatim from this conversation’s transcript (`bc-01a04f4e-9c48-7743-8f44-2a60f9bdc7c8`). User messages have no native timestamp; times are from the next tool call.

| # | When (approx.) | Original wording (verbatim) | Requirement or preference | Current implication | Later amendment |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-08-29 ~20:56 UTC | “Do research on how to improve the project, then do research on those topics online, then come back and build, then QA the results and rebuild and run this loop again as needed to hit a world class standard” | Research → build → QA → rebuild until world-class | The working method. Not a one-shot sketch. | Repeated as #10 and again in later commissions. |
| 2 | 2026-08-29 ~21:38 UTC | “put on your creative design brain… impress a human… beautiful, elegant, complex in build but very simple in usage… things like Notion… exceed your own expectations… be ambitious.” | Design quality: simple use, ambitious craft. Notion named as a *quality* reference, not as the product. | The folio (Today / Seek / Sit / Advisor / Journal) is that design. Do not invent a Notion workspace unless Dean asks. | #11 repeats this. |
| 3 | 2026-08-29 ~22:00 UTC | “Review the plan and research every single component in excruciating detail then apply any changes, fact check it, qa the design, UI and code… final sign off agent ensuring its world class” | Independent review before calling it done. | Breaker rounds and eval gates are this requirement. | Later: three Breaker passes; D1–D22 repaired. |
| 4 | 2026-08-29 ~22:22 UTC | “Do what you feel advances this project the most” | Autonomy on the next valuable step. | Do not wait for permission on reversible product work. | — |
| 5 | 2026-08-29 ~22:49 UTC | “Build baby build ” | Build; do not stop at plans. | Code and letters over decks. | Repeated #17. |
| 6 | 2026-08-29 ~22:54 UTC | Cursor implement-plan template for “World-Class Red Letter Advisor (Phase 0)” attached at `/opt/cursor/artifacts/plans/world_class_red_letter_82585507.plan.md.plan.md` | Implement the Phase 0 plan; do not edit the plan file. | The room, PWA, curated Advisor, crisis strip, share card. | Later work exceeded Phase 0 (conscience, verifier, map witness). |
| 7 | 2026-08-29 ~23:02 UTC | “Research and build like my success and my families success hangs in the balance on the results” | Stakes are real; family, not a demo. | Safety and trust outrank novelty. | #15 “production ready by tomorrow.” |
| 8 | 2026-08-30 ~02:20 UTC | “Believe you can do more and be ambitious” | Depth and ambition. | — | — |
| 9 | 2026-08-30 ~02:42 UTC | “Believe you can do more and be ambitious and creative” | Same, plus craft. | — | — |
| 10 | 2026-08-30 ~03:07 UTC | “Review this project from the top and all related outputs and prompts from me and then run this prompt” + the text of #1 + “Be creative and ambitious and exceed your own standards” | Recover his words, then run the research–build–QA loop again. | This brief exists because of #10 and the 2026-09-11 recovery commission. | — |

**Explicit vs inferred.** He did **not** name “KJV only,” “988,” or “GitHub Pages” in these ten prompts. Those arrived from the existing repo and later amendments. He **did** name world-class standard, beauty, simplicity, family stakes, build-not-plan, and independent sign-off.

---

## Later amendments (preserve)

Indexed from the same transcript after #10. Wording here is distinctive phrase, not a full reprint of long protocol prompts.

| # | When | What changed |
| --- | --- | --- |
| 12 | 2026-08-30 | “Just ignored irrelevant stuff to the bigger project” — drop side quests. |
| 13 | 2026-08-30 | “Build the best thing you can imagine here.” |
| 14 | 2026-08-30 | “qa time” |
| 15 | 2026-09-02 | **“Make this production ready by tomorrow and use all the resources you need.”** |
| 16 | 2026-09-05 | **“Build on these idea in extreme detail and produce a deliverable that wows for me to review.”** |
| 17 | 2026-09-05 | “Build / Baby / Build” |
| 18–20 | 2026-09-06–07 | FORGE / ATELIER / UNIVERSAL REBUILD — recover state, research, audit, deliver; do not regress Breaker findings. |
| 21 | 2026-09-07 | “Finish with grok” — finish the verse-map witness (named, not swapped). |
| 22 | 2026-09-08 | **“Show me your best finished product”** — the running room, not a report. |
| 23 | 2026-09-11 | Sprint: five concrete priorities, 45–60 minutes. |
| 24 | 2026-09-11 | This recovery commission: first ten prompts, research, three flagships, finish against evidence. |

Settled product law from those later turns (already in `CLAUDE.md`): spoken Gospels only; verifier exactness; one set of ears; crisis / poison / danger / bereaved human-help first; room decided once; no wholesale map swap; no production deploy or store submit without Dean’s word.

---

## Current scope and exclusions

**In scope.** The folio on this branch; the Advisor on server and static hosts; safety notices; Seven Days; blessings; journal; eval / RELEASE; named red-letter witness; the three flagships listed below.

**Out of scope (explicit or inferred from later “ignore irrelevant”).** Native store wrappers; Flutter; locking scripture; weekly pricing; pretending the model is Jesus; wholesale map swap; Ninety Days income folio on other branches; Mercor / tax / memoir side projects on the same GitHub account; Notion rebuild (Notion was a design-quality metaphor, not a destination).

---

## Existing assets (authoritative locations)

| Asset | Where |
| --- | --- |
| System of record | `CLAUDE.md` |
| This brief | `docs/BRIEF.md` |
| Product | `public/index.html`, `public/data/*`, `lib/*`, `server.js` |
| Spoken corpus | `data/spoken-gospels.json`, `public/library.json` |
| Live map / named witness | `data/red-letter-source.json`, `data/red-letter-ebible-kjv.json`, `docs/red-letter-map.md` |
| Safety patterns | `public/data/signals.js` |
| Rooms | `lib/curated.js` → `npm run curated` → `public/data/curated.js`, `public/curated.json` |
| Eval | `eval/questions.json`, `scripts/eval.js`, `eval/results.md` |
| Release evidence | `RELEASE.md` |
| Flagship 1 (product) | this branch — one conscience path |
| Flagship 2 | `docs/flagship-conscience.md` |
| Flagship 3 | `docs/flagship-sitting.md` |
| Research | `docs/research/` |

---

## Obstacles

1. **Static vs server conscience** — *repaired this cycle.* Seek and the no-key Advisor were handing different first passages than the server (Conflict / Shame / by-you / veteran / affair).
2. **Stale records** — RELEASE / README still said 112 questions and 68 tests after the sprint.
3. **Deploy** — GitHub Pages publishes `main` / `claude/jesus-teachings-chatbot-bSBhF`. This stack is not on that path until Dean merges. **Blocked on Dean.**
4. **Model path** — unverified without an Anthropic key. **Blocked on Dean.**
5. **On-device walk** — unverified here. **Blocked on Dean’s phone.**
6. **UK KJV privilege** — US host needs no extra licence; a UK commercial print of 1,934 verses is outside CUP’s ≤500-verse liturgical exception. **Decision if Dean publishes in the UK.**

---

## Preserve / improve / complete / retire

| Action | What |
| --- | --- |
| Preserve | `signals.js`, `roomFor` / `finishLetter`, spoken map + KEEP LIST, Breaker gates, Seven Days, parchment/crimson, no map swap |
| Improve | Client special rooms now match server; curated export; 988 chat URL; DV digital-safety sentence |
| Complete | Flagships 2–3; current eval; this brief |
| Retire | Treating `public/curated.json` as a second editorial brain; claiming Forty is a shipped path; claiming 112/68 after sprint |

---

## Acceptance criteria (observable)

- First ten prompts recovered from the transcript, not reconstructed.
- Server, client composer, and Seek JSON open every room on the same first passage.
- `danger-05`, `life-27`, `life-44` open on Luke 15:4; `life-36` on Matthew 11:28 — both composers.
- `npm test` and both eval composers pass at HEAD.
- Helpline numbers re-verified 2026-09-11.
- Dean can sit the product from `docs/flagship-sitting.md` without assembling a third document.
- Forty stays data-only until Lent 2027.

---

## Assumptions and unresolved decisions

- ASSUMED: retrieval + curated rooms are the path a reader without a key gets, and the path CI proves.
- ASSUMED: PWA-on-Home-Screen is “iPhone and Android” for this stage.
- UNRESOLVED (Dean): merge this stack to the Pages branch; run model-path eval; five-minute phone walk; suppress known crisis idioms (recommend **no**); UK publication; store wrappers; household Ninety Days folio.

---

## Three flagships (this cycle)

1. **One conscience path** — the running Advisor and Seek, same rooms on every host.
2. **The Conscience Book** — `docs/flagship-conscience.md`.
3. **The Review Sitting** — `docs/flagship-sitting.md`.
