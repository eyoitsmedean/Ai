# Canonical brief — The Red Letter Advisor

**Version:** 2026-09-11 recovery  
**Audience:** Dean (owner) and any later agent. This is the orientation document, not a reader-facing page.  
**Transcript used:** `/tmp/cursor/cloud-agent-transcripts/2026-09-11T21-30-39Z-2d94/bc-01a04f4f-3db7-7cb2-aa15-dc300a204ba9/transcript.json` (this cloud run). Role=`user` entries: 19. Five of those are GitHub/system/subagent notifications, not Dean. Fourteen are Dean-authored. The first ten Dean-authored prompts are listed below. Wording is quoted from that file, not reconstructed.

---

## Intended outcome and audience

Ship **The Red Letter Advisor** (short: Red Letter) as a production PWA a person can install on iPhone Safari and Android Chrome. It is a chat-first advisor that applies **only the spoken words of Jesus** in Matthew, Mark, Luke, and John to a present-tense life. Scholarship sits behind the answer. Dean is the owner and the only person who can deploy, run the live-model eval, and walk a physical device. The end user is someone who opened the chapel-like page on a phone, often in a hard hour.

This is a **product**, not a report. Code, letters, and the ship checklist are the work. Notion is out of scope.

---

## Recovery table — first ten Dean-authored prompts

Notifications (CI conclusions, subagent-finished) were skipped. They are not user instructions.

| # | Date in thread | Original wording (abridged where long; full text is in the transcript) | Requirement or preference | Current implication | Later amendment |
|---|---|---|---|---|---|
| 1 | earliest | “Do research on how to improve the project, then do research on those topics online, then come back and build, then QA the results and rebuild and run this loop again as needed to hit a world class standard” | Research → build → QA → rebuild until the standard is world-class. Not a one-pass sketch. | The operating loop. Eval, tests, and RELEASE.md exist because of this. | Still in force. |
| 2 | | “put on your creative design brain… impress a human… beautiful, elegant, complex in build but very simple in usage… Notion… exceed your own expectations… be ambitious.” | Beauty and simplicity of use. Craft that a design-literate person would respect. | Palette, type, Quiet Chapel UI, About sheet. Do not add chrome that fights simplicity. | Still in force. Not a request to restart the visual system. |
| 3 | | “Build baby build ” | Execute. Stop planning. | Later FORGE/atelier prompts repeat this more formally. | Still in force. |
| 4 | | “More research and more building ” | Depth of both, not one or the other. | Adjacent research in `docs/RESEARCH.md` and the safety-pack build. | Still in force. |
| 5 | | “Research and build like my success and my families success hangs in the balance on the results ” | Stakes: treat errors as costly. Especially safety and trust. | D12/D13, fixed letters, no invented citations. | Still in force. |
| 6 | | “Complete this and make it production ready for both iphone and android by tomorrow morning, use as many resources, bots and tokens as needed, and be hard on your QA of this” | Production-ready PWA on both phones. Hard QA. | D6 = PWA, not Capacitor. Device checklist is Dean-only. Agent QA is tests + smoke + eval + headless where possible. | “Tomorrow morning” is past; the bar remains: shippable, not demo. |
| 7 | | “Build on these idea in extreme detail and produce a deliverable that wows for me to review ” | Finished work Dean can review, not an outline. | Flagships: offline safety pack, this brief + research, `docs/SHIP.md`. | Still in force. |
| 8 | | “Build / Baby / Build” (three lines) | Same as #3. | Do not substitute a plan. | Still in force. |
| 9 | | FORGE PROTOCOL — EXECUTE NOW (19,251 chars). “THE PROJECT IS ALREADY HERE. Mine this thread. Then do the work.” Standard: would this embarrass us in front of a sharp, skeptical client who already knows the domain? No outlines-as-deliverables. | Production pipeline on the existing project. | This recovery + the three flagships. | Superseded in *form* by later atelier/commission prompts; the *standard* remains. |
| 10 | | FORGE — Universal Project Execution Prompt (14,960 chars). “the intended user can use the result for its stated purpose, and a knowledgeable, skeptical reviewer can inspect the important claims and decisions.” | Usable result + inspectable claims. | RELEASE.md honesty rules; no invented test results. | Still in force. |

### Later Dean-authored amendments (preserve these)

| # | Prompt | What it changed |
|---|---|---|
| 11 | ATELIER PROTOCOL — MASTERWORK (43,053 chars) | Truth over polish; report only work actually done; finished artifact with provenance. |
| 12 | UNIVERSAL REBUILD PIPELINE (brief fields were `{{placeholders}}`) | Template, not a filled brief. Did **not** rename the product or move it to Notion. |
| 13 | “Massive sprint time get to it pick 5 priorities and push for 45 minutes to an hour” | Scoped the previous sprint (paywall, assault modal, live-path guard, letter modules, a11y/v18). That sprint is done. |
| 14 | UNIVERSAL PROJECT RECOVERY… (this commission) | Recover first ten prompts; diagnose drift; research core + five adjacent topics; three flagship deliverables; organize for reuse. |

---

## Current scope

**In**

- Chat-first Advisor with server-substituted KJV sayings (`{{Book C:V}}` only).
- Fixed letters for crisis, danger, assault, off-scope, hostility, greeting, identity.
- Safety detectors shared by page and server (`public/js/safety-patterns.js`).
- Offline Today / Seek / Journal from WEB `public/data/corpus.json`.
- Offline **safety** letters from `public/data/safety-pack.json` (KJV, same wording as the server).
- PWA install (iPhone Home Screen + Android Chrome).
- Eval set `eval/questions.json` (retrieval path in CI).

**Out**

- Capacitor / App Store / Play (OQ3).
- Whole-Bible or Pauline counsel.
- Clinical assessment, safety-planning, or “stay with me” companion aftercare.
- Notion workspace rebuild.
- Paid UK release until OQ1 is decided.
- Invented live-model or device results.

---

## Existing assets (authoritative locations)

| Asset | Path |
|---|---|
| Settled decisions | `CLAUDE.md` |
| Fixed letters (Dean’s voice) | `lib/letters.js` — do not rewrite wording without Dean |
| Prompts | `lib/prompts.js` |
| Verification | `lib/scripture.js`, `lib/report.js` |
| Persona / stay guard | `lib/guard.js` |
| Retrieval / scope | `lib/retrieve.js` |
| Shared detectors | `public/js/safety-patterns.js` |
| Crisis / danger / assault modal | `public/js/crisis.js` |
| Chat + offline paths | `public/js/app.js` |
| Offline safety pack | `public/data/safety-pack.json` (generated by `npm run safety-pack`) |
| Server corpus | `data/gospels-kjv.json`, `data/spoken-gospels.json` |
| Offline WEB corpus | `public/data/corpus.json` |
| Eval | `eval/questions.json`, `scripts/eval.js`, `eval/RESULTS.md` |
| Device walk | `docs/DEVICE-CHECKLIST.md` |
| Release honesty | `RELEASE.md` |
| Deploy | `DEPLOY.md` |
| This brief | `docs/CANONICAL-BRIEF.md` |
| Research archive | `docs/RESEARCH.md`, `docs/research/` |
| Ship package | `docs/SHIP.md` |

---

## Obstacles to value

1. **Dean-only:** Railway + `ANTHROPIC_API_KEY`; live `npm run eval`; physical iPhone and Android (checklist steps 5–6 are blockers).
2. **Was (closed this cycle):** after a safety modal, a failed `/api/chat` used theme retrieval (Forgiveness / Peace). That violated D12. Closed by the safety pack.
3. **Licence:** KJV UK Crown still in force on opened sources; “perpetual” is our word, not CUP’s. OQ1 remains.
4. **RAINN.org** could not be re-opened this session (Cloudflare). Numbers still listed on US OVC and Find A Helpline.

---

## Preserve / improve / complete / retire

| Action | What |
|---|---|
| **Preserve** | Letter wording; D1–D13; Quiet Chapel UI; shared detector; eval set; corpus restorations. |
| **Improve** | Offline safety (done); About numbers (988 US vs 988.ca, RAINN, watched-phone line); greeting skip on the client (done). |
| **Complete** | Dean’s three actions in `docs/SHIP.md`. |
| **Retire** | Theme retrieval as an answer to a safety kind. Do not revive it. |

---

## Observable acceptance criteria

- `npm test` green. Safety pack JSON equals `buildSafetyPack()`. No `{{` in the pack.
- After a crisis/danger/assault modal, if `/api/chat` fails, the page shows **notice + the matching filled letter**, never a WEB theme pack.
- “ok thanks” after a disclosure does not re-open the modal (same as the server greeting doorway).
- About lists 988 (US), 988.ca (Canada), DV, RAINN.
- Cache `?v=19` and `rla-v19-chapel` together; SW precaches `data/safety-pack.json`.
- RELEASE.md does not mark live-model or device rows verified unless they ran.

---

## Assumptions and unresolved decisions

| ID | Status | Note |
|---|---|---|
| A1 | Assumed | Off-scope/hostile/greeting carry Matthew 11:28 only. |
| A2 | Assumed | Workplace bullying is not a hotline case. |
| A3 | Assumed | Eval latency is a warning, not a fail. |
| OQ1 | Dean | KJV → WEB on the server before a paid UK release? |
| OQ2 | Dean | Live-model eval with his key. |
| OQ3 | Dean | Capacitor later. |

---

## How a later agent should continue

1. Read this file, then `CLAUDE.md`, then `docs/SHIP.md`.
2. Do not rewrite letters. Do not invent citations. Do not claim device or live-model QA.
3. Bump cache `?v=N` and `rla-vN-chapel` together if you change client assets.
4. After changing `lib/letters.js` safety letters, run `npm run safety-pack` and commit the JSON.
5. Record remaining work in `docs/bot-notes.md`.
