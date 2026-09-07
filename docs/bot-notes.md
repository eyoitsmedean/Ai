# Bot working notes — Red Letter — CLAUDE.md — v2 — 2026-09-07

Worker: this session. Target: `CLAUDE.md`. Class: knowledge page. Mode: non-destructive. Stakes: high.

## Brief (filled from thread; every blank was assumed)

| Field | Assumption | Reversible? |
| --- | --- | --- |
| PROJECT | Red Letter (system of record), not a new mobile build | yes |
| PLATFORM | GitHub / this repo | yes |
| ARTIFACT_CLASS | knowledge page | yes |
| SCOPE | `CLAUDE.md` plus the files and open PRs needed to audit it | yes |
| TARGET | `CLAUDE.md` | yes |
| READER + PURPOSE | Dean and agents: act from checkout truth | yes |
| STAKES | high | yes |
| REBUILD_MODE | non-destructive | yes |
| RESEARCH_BUDGET | 15 | yes |
| TEAM_MODE | solo | yes |
| OWNER | Dean | — |

Not assumed: a commission to start the mobile MASTERWORK. v1 waited on Dean’s answers. Those answers are still missing. This rebuild does not start that build.

Team line: rebuild-worker · CLAUDE.md v2 · 2026-09-07

---

## GATE log

- GATE 0: read / write / create / browse / run Node / see prior workers. Cannot hear audio (not needed).
- GATE 1: KEEP LIST = v1 decisions, two tensions, authority, 38-test fact, no eval on this tree, no mobile project, Pages publish rule, pricing, palette, Dean-only facts.
- GATE 2: ledger in Sources below. Disconfirm: (a) “eval set not built anywhere” — false, built on sibling PRs, not here; (b) “UK KJV is unchecked folklore” — false, Cambridge PDF states the 500-verse clause; (c) “Capacitor is already settled” — false on this tree; contested on siblings; Apple 4.2 is a review risk.
- GATE 3: change list in KEY CHANGES.
- GATE 4: organizing concept = *checkout truth versus sibling-PR claims*.
- GATE 5: `CLAUDE.md` rebuilt; v1 copied to `docs/CLAUDE.v1-2026-09-06.md`.
- GATE 6: Pass A and Pass B below. One repair cycle applied.

---

## Pass A — Information QA (run separately)

Ran after the first v2 draft, then again after the repair cycle.

- Claims in the live file trace to this checkout, to a sibling file I opened, to a URL I opened, or to v1 labeled `(prior-worker)`.
- Recomputed: `FREE_CHATS` = 5; curated daily = 28; `RLA_FORTY`.length = 40; this-tree tests 38/38; open PRs = 21 on the second `gh pr list`.
- First draft said “eighteen other PRs.” That was wrong (old list, and it counted this PR as “other”). Repaired to 21 including #24. `[S1 repaired]`
- First draft said every open PR carries a `CLAUDE.md`. False (#2, #11, #12, #13, #14, #19, #21 had none when checked). Repaired. `[S2 repaired]`
- “see Sources” pointed at a missing section. Sources block added. `[S2 repaired]`
- KEEP LIST items present: tensions 1–2, authority, Dean-only facts, KJV, crisis path, no eval here, no mobile project, Pages rule, pricing, palette, append-only log, v1 preserved.
- Sibling suite numbers are what `npm test` printed in `/tmp/wt/*` on 2026-09-07. #8’s script is a live-server smoke (15 fetch fails, no server). #23 failed two files for missing `openai` in the symlinked `node_modules`.
- PRs #26–#28 were not read. Stated.
- No product code changed. `npm test` on this tree: 38/38.

Open S1/S2 after repair: none.

S3 noted: LAUNCH’s “four rooms each morning” vs five shipped rooms — kept as LAUNCH’s sentence, not silently edited.

---

## Pass B — Design QA (run separately, after Pass A)

- Hierarchy is H1 then H2; no skipped levels.
- First screen is the five-point answer.
- Links that must resolve: `docs/CLAUDE.v1-2026-09-06.md`, `ATELIER.md`, `REBUILD.md` — all present.
- Original preserved at `docs/CLAUDE.v1-2026-09-06.md` (byte copy of the 2026-09-06 file).
- Orientation block present. Epistemic labels visible on load-bearing rows.
- Cursor rule no longer claims `folio/BRIEF.md` lives on this branch.
- Phone: short units, tables, answer first.

Open S1/S2 after repair: none.

---

## Ship package

### 1. THE ARTIFACT

- Live: [`CLAUDE.md`](../CLAUDE.md)
- Original: [`docs/CLAUDE.v1-2026-09-06.md`](CLAUDE.v1-2026-09-06.md)
- Protocol: [`REBUILD.md`](../REBUILD.md)
- Branch / PR: `cursor/atelier-protocol-8754` · https://github.com/eyoitsmedean/Ai/pull/24

### 2. SUMMARY

Agents can now tell checkout fact from sibling-PR claim. Dean can see which definition-of-done items are actually true on this tree. UK KJV and Apple 4.2 are sourced from pages opened this session, not from folklore. No product behavior changed.

### 3. KEY CHANGES

- **Added:** contested-PR table; sources block; `REBUILD.md`; v1 archive; stale-by flags; product-line tension.
- **Updated:** UK rights from KNOWLEDGE to `[verified]` `(retrieved)`; mobile stack from “A or B at next kickoff” to “PWA here; Capacitor is a 4.2 risk, not a decision”; eval status from “not built” to “not on this tree.”
- **Corrected:** open-PR count; “every PR has CLAUDE.md”; Handoff-style overclaim on suites.
- **Retired:** the instruction to start a mobile MASTERWORK from this file’s `RESUME_FROM` without Dean naming a product line.

### 4. HOW TO USE

Read `CLAUDE.md` on a phone, first screen first. If the v2 map is wrong, revert to `docs/CLAUDE.v1-2026-09-06.md` and leave a dated log row. Swap-in is already done on this branch; merge still publishes Pages if Pages is enabled and still needs sign-off.

### 5. VERIFICATION PERFORMED

- Read: `CLAUDE.md` (v1), `ATELIER.md`, `IMPROVEMENT_PLAN.md`, `README.md`, `DESIGN.md`, `LAUNCH.md`, `package.json`, `pages.yml`, `data/paths.js`, `data/curated.js` (via node), `public/index.html` (targeted), sibling `CLAUDE.md` files on the PRs listed in the contested table.
- Lookups opened: Cambridge sample pages PDF; worldenglish.bible; Apple App Store Review Guidelines; `https://eyoitsmedean.github.io/Ai/` (404); GitHub Pages API (404); `gh run list --workflow=pages.yml`; `gh pr list`.
- Tests: `npm test` on this tree → 38/38. Sibling suites as in `CLAUDE.md`.
- Not run: `npm run smoke`, `npm run qa`, live-model eval, iOS/Android builds, reading PRs #26–#28.
- QA: Pass A, then Pass B, then one repair cycle (PR count, CLAUDE.md-overclaim, missing Sources, leftover “eighteen” in STATE, atelier rule folio pointer).

### 6. ASSUMPTIONS AND LIMITS

- Blank brief assumed the target was `CLAUDE.md`, not a mobile rewrite.
- Fonts = SIL OFL is `[assumption]` `(model-knowledge)`.
- Spoken-Gospel verse count vs the 500-verse UK ceiling is `[inference]` (the shipped corpus is the four Gospels’ speech, which exceeds 500 verses).
- Sibling suite runs used this workspace’s `node_modules` via symlink; #23’s `openai` miss is an environment limit, not proof that branch is broken.
- Open-PR count is stale by construction.

### 7. SOURCES

See the Sources table at the bottom of `CLAUDE.md`. Dated 2026-09-07.

### 8. DECISIONS NEEDED FROM DEAN

1. Product line — which PR, if any. Recommendation: none until you read the contested table.
2. Paid UK path — write Cambridge / geo-restrict / switch to WEB. Recommendation: write Cambridge; do not silently change translation.
3. Mobile posture — PWA / Capacitor / Red Words. Recommendation: PWA-only for now.
4. Enable GitHub Pages. Recommendation: when you want the static room public.
5. Name and front door. Recommendation: Red Letter = app; Advisor = room; do not move the front door here.
6. Two quality-reference apps. No default.

### 9. CROSS-SECTION NOTES

- `IMPROVEMENT_PLAN.md` on this tree is stale (Forty data and a reminder checkbox already exist). Out of scope.
- `LAUNCH.md` / `MARKET_STRATEGY.md` Hallow “~$40M” wording is still uncorrected here; PR #15 holds the fix.
- `folio/BRIEF.md` lives on PR #15, not this branch.
- PRs #26 README rebuild, #27 safety-module rebuild, #28 release-checklist v2 opened during this session and were not read. They may overlap this rebuild.
- Do not merge this PR as a substitute for choosing a product line.
