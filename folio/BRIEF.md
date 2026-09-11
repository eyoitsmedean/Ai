# PROJECT BRIEF — Ninety Days · One Plan

System of record for the five-plan 90-day cash folio. Decisions, assumptions, and open questions for this project are appended here; the human-facing twin is the Notion hub "Ninety Days · One Plan". Labels follow the atelier convention: VERIFIED · SOURCED · KNOWLEDGE · INFERRED · ESTIMATED · ASSUMED · PROPOSED.

Mission (one line):
Give Dean one offer that can take money before 3 December 2026 without stealing sleep or contaminating the day job — chosen from five fully worked plans in twenty minutes, then run at eight hours a week.

The finished thing (artifact class, file format, where it lives):
Strategy / decision document, delivered as three synchronized surfaces: the paper folio `folio/index.html` (self-contained HTML, prints to one plan); the Cursor review canvas "Ninety Days · Working Papers" (pick flow, gross/after-tax toggle, first-60 checklist, evidence table, falsifiers); and the Notion hub page with one runbook page per plan. Repo branch `cursor/90-day-cash-folio-8754`, PR eyoitsmedean/Ai#15.

Audience and use moment (who, when, in what state of mind):
Dean alone, late evening after the household window is confirmed, tired, with ten to twenty minutes. He wants to choose, copy one ask, and stop — not to read a shelf.

Definition of done (3–5 numbered, checkable statements):
1. Every plan carries a who-pays, 90-day math with the arithmetic shown, twelve dated weeks, a first-60-minutes, a copy-paste ask, and a kill rule; the same numbers appear on all three surfaces.
2. Every load-bearing number, date, or platform rule is labeled Retrieved / Estimate / Assumed / Unknown in the Evidence book with an opened source; forecasts are ranges, never findings.
3. The pick can be made in twenty minutes from the folio or the canvas alone, and produces a written choice receipt.
4. No plan requires the employer's clients, language, data, devices, or time; the Lamp's five truth gates and the clean-room oath are printed, not implied.
5. The after-tax view exists (61–71¢ kept per gross dollar) with its basis shown, so December cash is never read as gross.

Mode: STANDARD for maintenance passes; the original build ran as MASTERWORK.
Team: solo (one mind built, self-reviewed, and elevated; there has been no separate reviewer).
Capabilities this bot has: web search and fetch, shell and code execution, file output, Notion and GitHub tools, Cursor canvas; no memory across sessions beyond this file and the thread.
Budget and size: ≤10 searches per maintenance pass; folio stays under Notion's 200 KB embed cap (86.9 KB on 6 Sep 2026); canvas must pass the TypeScript check on save.

Hard constraints (money, tech, brand, legal, tone; third-party material and its license):
- Eight hours a week all-in including failed asks; two evenings maximum; household window must be Confirmed before any optional work.
- Clean room: personal accounts, personal time, public or synthetic inputs only. Never the employer graph, and nothing insurance, benefits, HR, or safety-training adjacent.
- Colorado: C.R.S. § 24-34-402.5 protects lawful off-hours work from termination only (Butler v. Bd. of Cnty. Comm'rs, 2021 COA 32, VERIFIED 6 Sep 2026), with job-relatedness and conflict-of-interest exceptions — so the Lamp is gated on the handbook's outside-work clause.
- Tone: quiet surface, depth folded under `<details>`; family-safe public copy; the private Notion twin carries real names.
- Third-party material: Google Fonts (Fraunces, Instrument Sans, Source Serif 4) under the SIL Open Font License, loaded by link, not redistributed (KNOWLEDGE — stale-by: verify if fonts are ever bundled). Market figures (Mercor listings, Appfigures estimates, coaching and audit price surveys) are quoted as short facts with links, not reproduced. Nothing in the folio is for resale.
- Not tax or legal advice; the federal bracket is Dean's to fill.

Decisions already made (do not re-litigate):
- Five plans, one active at a time: I The Lamp (AI artifact evaluator, Mercor listings at $80–$120/hr), II The Room ($349 pitch rehearsal; $649 two-session variant), III The Handoff ($1,500 beta → $2,250 standard, 20 hours locked, two units is the twelve-week ceiling), IV The Storefront ($295 friction audit → $450 after five, never alongside the Handoff), V The Folio (Red Letter Advent; $0–$2,000 honest range).
- Default picks: grocery money → Lamp; Lamp blocked → Room; owned IP → Folio.
- Seven laws (One, Home, Clean room, Payment, Eight hours, Floor ~$100/all-in hour after the first paid unit, Stop) plus the Honesty clause.
- The M4 DeanOS sprint remains the only sprint; this pack authorizes no external action by itself.
- Lamp gates 4 and 5 as rewritten 5 Sep 2026: handbook disclosure question; separate personal machine for Insightful monitoring; explicit consent to the March 2026 Mercor breach exposure.
- Not shipped via GitHub Pages; Notion content is not parented under "Start here".
- The clock: 4 Sep → 3 Dec 2026; Advent 29 Nov 2026; Ash Wednesday 10 Feb 2027 (USCCB calendar, VERIFIED 5 Sep 2026).

Facts only Dean has (values, or "ask me"):
- `[HANDBOOK_OUTSIDE_WORK_CLAUSE]` — does it require disclosure or approval, and does it name conflict of interest or its appearance? (Gate 4; "I will not read it" is Blocked.)
- `[FEDERAL_MARGINAL_BRACKET]` — assumed 12–22% in the keep table; replace with the real one.
- `[HOUSEHOLD_WINDOW]` — Confirmed / Not confirmed each evening; nothing in this project overrides it.
- `[TEN_HUMANS]` — the ten people outside the employer graph the Room needs; the plan is unrunnable without them.
- Whether placing a video interview and ID on a platform breached in March 2026 is acceptable to him (Gate 5).

Assets, repos, and system of record (where things live; where decisions get written):
- Repo `eyoitsmedean/Ai`, branch `cursor/90-day-cash-folio-8754`: `folio/index.html`, this file, `LAUNCH.md` and `MARKET_STRATEGY.md` (Red Letter market claims, corrected 5 Sep 2026).
- Cursor canvas `b3b46f02-22d2-4ee2-a621-72ba3f54eb84` (source `source.canvas.tsx`).
- Notion hub `3d1b7d53f96981579062da42fa6c9efb` and runbooks I–V beneath it; the folio HTML is embedded there as a file upload and must be re-uploaded whenever `folio/index.html` changes.
- Decisions get written here (this file), then mirrored to the Notion hub's dated audit note.

Known risks / what went wrong before:
- First draft omitted the Mercor breach and the Colorado statute's exceptions; fixed 5 Sep 2026.
- Hallow revenue was stated as fact; it is an Appfigures estimate. Bible Chat "ratings rotting" was wrong; complaint volume rises, stars hold. Both corrected in the folio and the launch docs.
- The Handoff's stretch cash was $4,500 on the folio and canvas while the plan's own weeks allow at most two units; reconciled to $3,750 on 6 Sep 2026 across folio, canvas, and Notion.
- Notion file-upload URLs expire in minutes; create the upload and POST the file in the same step.
- Curl-based link checks hit bot walls (Justia 403, midpage 429); those links open in a browser, but each such row now carries a second source.

Authority (what you may do without asking; what always needs sign-off):
- Without asking: edit `folio/`, the canvas, the Notion hub and runbook pages this project created, `LAUNCH.md` and `MARKET_STRATEGY.md` for factual corrections; commit and push to the working branch; update PR #15.
- Always needs sign-off: any application, outreach message, purchase, publish (including GitHub Pages), deploy, client work, edits to Notion pages outside this project's tree, merging the PR, force-push or history rewrite.

Quality reference (two named examples of the best of this kind, and what specifically to match):
PROPOSED, Dean to confirm or replace: a Stripe Atlas guide — one decision per page, numbers with their basis inline; a Tufte one-page economics table — every cell traceable, nothing decorative. Match: time from opening to a written choice under twenty minutes, and zero numbers without a shown calculation or a labeled source.

---

## Decision log

| Date | Decision | Label | Where it shows |
| --- | --- | --- | --- |
| 2026-09-04 | Five plans, one active; seven laws; 4 Sep → 3 Dec clock | recorded | folio §Constitution, canvas, Notion hub |
| 2026-09-05 | Lamp gates 4–5 rewritten for the handbook clause and monitoring; breach consent added | VERIFIED sources | folio Plan I risk card, canvas Evidence, Notion Lamp runbook |
| 2026-09-05 | Storefront priced $295 against human-walkthrough audits, not $595 | SOURCED | folio Plan IV, Notion hub table |
| 2026-09-05 | After-tax keep table 61–71¢ (SE 15.3% on 92.35%, half deductible; CO 4.4%; federal 12–22% ASSUMED) | INFERRED from sources | folio §What you keep, canvas After-tax toggle |
| 2026-09-06 | Colorado 4.4% for 2026 re-confirmed; TABOR can lower it temporarily (SB24-228 mechanism) | VERIFIED | folio Evidence book note "TABOR-adjustable" |
| 2026-09-06 | Handoff ceiling $3,750 (beta + one standard unit), not $4,500; hourly stretch ≈ $94 blended | INFERRED from the plan's own weeks | folio Scoreboard, 90-day math, economics, keep table; canvas III; Notion hub and runbook |
| 2026-09-06 | Butler v. San Miguel County gets a second citation (491 P.3d 506, vLex) | VERIFIED | folio Evidence book, canvas Evidence |
| 2026-09-11 | Run sprint: phone layout, tonight strip, scoreboard lock, copy-ready Saturday asks | recorded | folio title page, scoreboard, tonight dock |

## Open questions (batched; recommended default in parentheses)

1. Is the Red Letter Advisor brief in the atelier prompt a live commission for this workshop, or the worked example it is labeled as? (Default: example only — it starts on its own kickoff, on its own branch, with `CLAUDE.md` as its system of record.)
2. Replace `[FEDERAL_MARGINAL_BRACKET]` with the real figure so the keep table narrows from 61–71¢ to one number. (Default: keep the range.)
3. Should the Notion hub's Handoff row read "$3,750 ceiling" or stay at "$3,000 for two betas"? (Default: as now written — both, with the ceiling explained.)
