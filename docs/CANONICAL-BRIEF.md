# Canonical brief — Red Letter Advisor

**Version:** 2026-09-11 recovery · v1  
**Conversation recovered:** Cursor run `bc-01a04f53-0460-7df6-8db9-24ba39086ab5` (`github.com/eyoitsmedean/Ai`)  
**Transcript:** `/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-31-21Z-3b63/bc-01a04f53-0460-7df6-8db9-24ba39086ab5/transcript.json`  
**Authority:** user-authored wording quoted below. Interpretations are labeled.

This is the system brief for this repository. `CLAUDE.md` remains the decision log. Do not treat Notion pages under “This week” / LH01 as this project — those recover a different conversation (90-day personal options). ATELIER’s “Red Letter Advisor” block is a filled example *and* (in this chat) later became the active product brief.

---

## 1. Intended outcome and audience

**Outcome (settled):** a working, chat-first PWA that applies Jesus’s own words from Matthew, Mark, Luke, and John — quoted from the public-domain World English Bible and machine-verified — to a real life question, in seconds, on a phone.

**Audience:** someone carrying a real question, often at a low moment, on a phone. They want a warm, direct answer with citations they can check. Dean reviews the work in short bursts and must be able to use it without assembling fragments.

**Native artifact:** the app in this repo (not a slide deck, not a native rewrite).

---

## 2. Recovery table — first ten user-authored prompts

Source: 22 human-authored `role: user` messages in the founding transcript (35 `user` entries total; 13 were platform wrappers and were excluded). No per-message timestamps exist on user entries.

| # | Original wording (complete; these ten are short) | Requirement or preference (explicit) | Current implication | Later amendment |
| --- | --- | --- | --- | --- |
| 1 | “Do research on how to improve the project, then do research on those topics online, then come back and build, then QA the results and rebuild and run this loop again as needed to hit a world class standard” | Research → online research → build → QA → rebuild until world-class | This is the founding method. Depth and loops are required, not optional. | #7/#8 re-run this loop; #17–#22 scale the method; do not replace the product with process theater. |
| 2 | “Work on it please ” | Continue the active project | Do not pause for permission on authorized work. | — |
| 3 | “Build baby build ” | Implement; do not stop at research | Shipping code is in-scope. | #16 restates as three lines. |
| 4 | “More research and more building ” | Both tracks, not one | Research that does not change an artifact is incomplete. | — |
| 5 | “Believe you can do more and be ambitious ” | Ambition of depth and craft | Ambition is not a license to change the product into something else. | #6 adds “creative.” |
| 6 | “Believe you can do more and be ambitious and creative ” | Ambition + creative craft | Founding warrant for Encounter / Garden *as craft around the advisor*, not instead of it. | #13 “Amaze me”; #14 “Build something beautiful.” |
| 7 | “Review this project from the top and all related outputs and prompts from me and then run this prompt” + restated #1 + “Be creative and ambitious and exceed your own standards” | Re-read his prompts; re-run the loop; exceed prior work | Recovery before extension. | This commission (#22) restates the same duty. |
| 8 | Verbatim duplicate of #7 | Same | Treat as reinforcement, not a new brief. | — |
| 9 | “Any brilliant ideas I’m missing here?” | Ask for missing ideas | Ideas must serve #1’s loop and the later product lock. | — |
| 10 | Verbatim duplicate of #9 | Same | — | — |

**Access gap:** none for this conversation’s user messages. Two earlier sibling runs exist (`bc-01a04f4e-9c48-7743-8f44-2a60f9bdc7c8`, `bc-01a04f4f-3db7-7cb2-aa15-dc300a204ba9`). They were not the source of this table.

**Platform wrappers (not counted as the first ten):** two `<system_notification source="goal">` entries embed the objective “Elevate Red Letter Advisor to world-class: research-driven product upgrades, trust/verification, viral share cards, brand polish, QA loop.” That is user-provided goal text, but it is not a typed prompt. It matches later work and is recorded as secondary evidence.

---

## 3. Later amendments (preserve; do not reverse)

Quoted from the same transcript after prompt #10.

| Authored # | Wording / excerpt | Effect |
| --- | --- | --- |
| 11 | “Just get back to this project and ignore this issues if they’re irrelevant and boot them from the chat” | Drop irrelevant side issues; stay on RLA. |
| 12 | “Review the very first prompt I gave you then the next 4 and revert to their intent hard” | Re-anchor to #1–#5: research/build/QA loop, not a scholarship tool or a stalled plan. |
| 13 | “Amaze me with something” | Warrant for a memorable craft moment (Encounter). Must not block the first useful answer. |
| 14 | “Build something beautiful” | Warrant for Living Garden and brand craft. Same constraint. |
| 15 | “Complete the app and make it production ready for both iphone and android by tomorrow morning, use as many resources, bots and tokens as needed, and be hard on your QA of this” | Production bar for both phones; hard QA. Does **not** authorize App Store spend (later ATELIER). |
| 16 | `Build` / `Baby ` / `Build` | Continue building. |
| 17 FORGE | Project-agnostic. Finished usable result; inspectable claims; no deploy/spend from a quality request. **Does not name** Red Letter Advisor. | Method. |
| 18 ATELIER | Method + **filled example** that *is* this product: “Ship the Red Letter Advisor as a production-ready, chat-first advisor…” Definition of done (5 statements) below. Authority: “edit code and branches freely; no App Store / Play submission, no production deploy, no spending without sign-off.” | Product lock. |
| 19 UNIVERSAL REBUILD | Inspect and preserve before rebuild; S1/S2 repair. Does not name RLA. | Method. |
| 20–21 | “Massive sprint time get to it pick 5 priorities and push for 45 minutes to an hour” | Time-boxed execution. |
| 22 | This recovery commission: recover first ten prompts; three flagships; five adjacent topics; finish against evidence. | Current operating instruction. |

### ATELIER definition of done (filled example — now the product DoD)

1. Every answer cites a Gospel passage containing Jesus’s direct words, quoted from a public-domain or licensed translation opened during the build — never from memory.  
2. Tone reads as a warm advisor; scholarship sits behind the answer, not in front of it.  
3. Passes an evaluation set of at least 40 real questions — including hostile, off-scope, and crisis-adjacent ones — with reviewed results; crisis-adjacent inputs get a caring handoff to human help inside the product.  
4. Builds without error for iOS and Android targets; on-device testing is Dean’s step and ships as a written five-minute checklist.  
5. The release checklist marks every item verified or unverified — nothing described as passed that was not run.

---

## 4. Current scope and exclusions

**In scope**

- Chat-first Advisor; verified WEB red letters; Gospel-only scope.  
- Deterministic crisis / abuse / passive / off-scope / hostile routing before model and paywall.  
- PWA installable on iPhone (Safari Add to Home Screen) and Android (Chrome install).  
- Encounter, Garden, Today rhythm — available, not the front door.  
- Share cards + `?ref=` deep links.  
- Evaluation set, unit tests, smoke, UI check, honest RELEASE.md.  
- Safety / privacy / terms page.

**Out of scope (explicit or still unauthorized)**

- App Store / Play submission, production deploy, spending (ATELIER).  
- Capacitor / React Native rewrite (D6).  
- Payment processor (Plus is copy + waitlist file only).  
- Whole-Bible trivia, streaks, therapist or pastor persona.  
- NIV / ESV / NLT corpus (publisher gratis windows cannot cover this product).  
- Overwriting Dean’s other Notion projects (LH01, Ninety Days, AETHER).

---

## 5. Existing assets (authoritative locations)

| Asset | Path |
| --- | --- |
| App shell | `public/index.html` |
| Server / safety replies | `server.js` |
| Corpus | `data/red-letters.js` |
| Verify + intent | `data/scripture.js`, `lib/advisor/` if present |
| PWA | `public/manifest.json`, `public/sw.js` |
| Legal | `public/legal.html` (`/legal`) |
| Eval | `eval/questions.json`, `eval/RESULTS.md` |
| Decisions | `CLAUDE.md` |
| Release honesty | `RELEASE.md` |
| This brief | `docs/CANONICAL-BRIEF.md` |
| Research | `docs/KNOWLEDGE.md` |
| Dean’s next actions | `docs/OPERATOR-KIT.md` |

---

## 6. Obstacles

| Obstacle | Kind | Remedy this cycle |
| --- | --- | --- |
| No production HTTPS URL | External / unauthorized | Operator kit tells Dean exactly what to deploy; we do not deploy. |
| Returning users landed on Today + Encounter | Product drift vs chat-first | Default tab is Advisor; Encounter skipped on Advisor. |
| iOS install was a toast | Usability | Illustrated Home Screen sheet; Settings entry. |
| Crisis copy said “US & Canada” for 988 | Unsupported geography | Corrected to US + IASP; added 911 and 988 chat. |
| No privacy/terms page | Production gap | `/legal`. |
| Model-mode eval | Missing key | Still unverified; listed honestly. |
| Dean on-device checklist | Dean’s step | Written and current; results empty until he runs it. |

---

## 7. Preserve / improve / complete / retire

- **Preserve:** WEB corpus + verify loop; safety gate; parchment/crimson; grace-over-streaks; Encounter/Garden as optional beauty; eval harness.  
- **Improve:** chat-first path; install coach; crisis geography; waitlist persistence.  
- **Complete:** legal page; operator kit; research archive; doc sync (91→92, STATE).  
- **Retire as current guidance:** MARKET_STRATEGY lines that revive streaks, a React Native rewrite, or modular `public/js` that does not exist. File kept as history with a banner.

---

## 8. Observable acceptance criteria

1. First ten prompts recovered from the transcript with quoted wording — this file.  
2. Default phone path: open `/` → Advisor composer, no Encounter intercept.  
3. Crisis reply: 911, 988 call/text, `chat.988lifeline.org`, IASP; no “US & Canada”; no scripture lead.  
4. `/legal` is live and linked from Settings and the landing footer.  
5. iOS install sheet exists and is opened from Settings / How.  
6. Share URLs use `/?tab=advisor&ref=`.  
7. Unit / smoke / eval / ui-check pass on this branch.  
8. RELEASE.md still marks on-device and model-mode **UNVERIFIED**.

---

## 9. Assumptions and unresolved decisions

| Item | Status |
| --- | --- |
| PWA, not store listing | ASSUMED default (D6) until Dean says otherwise |
| US hotlines first | ASSUMED; IASP second |
| Quality references | Hallow (time-to-useful), YouVersion (verse/share craft); Bible Chat as anti-pattern. Dean never named two apps. |
| Production hostname + Anthropic key | Dean only |
| Plus price / payment | Copy only; do not spend |
| Companion-statute scope (NY/CA) | Unresolved; conservative interrupt already shipped |

---

## 10. How a future agent continues

1. Read this file, then `CLAUDE.md` STATE.  
2. Do not invent first-prompt wording; the table above is the recovered source.  
3. Do not deploy, purchase, or open store listings.  
4. If Dean pastes on-device results, record them in RELEASE.md §C as VERIFIED/UNVERIFIED per line.
