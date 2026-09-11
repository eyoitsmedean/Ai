# Bot working notes — Red Letter

Working-notes location for rebuild workers (per the Universal Rebuild Pipeline). Append; do not rewrite earlier entries. Decisions belong in `CLAUDE.md`, not here.

---

## Sprint — 2026-09-11 — one composer everywhere

Worker: Cursor cloud agent · five priorities in one hour.

1. **On-device composer = server composer.** `scripts/bundle-advisor.js` generates `public/data/advisor.js` from `lib/advise.js`. Crisis/abuse/themes/refusals no longer rot into a keyword stub on Pages or a dropped API. `npm run eval:device` 82/82. `const CRISIS` still byte-matches `lib/scripture.js`.
2. **Narrator frames stripped.** 47 of 49 evangelist openings removed from the spoken library. Kept: Matthew 24:39 (His flood narration), Luke 20:13 (vineyard lord inside the parable).
3. **Cross in English.** Matthew 27:46 and Mark 15:34 now include the KJV English. Reversible in `data/red-letter-source.json`.
4. **Advisor chips** exercise shame, grief, prodigal, Matthew 11:28, negation. Follow-up chips continue a letter; none on crisis/abuse letters.
5. **Device eval path** so the client cannot silently drift. Suite 64.

Verification run this session: `npm test` 64/64; `npm run eval` 82/82; `npm run eval:device` 82/82; `npm run qa` 14/14.

---

## Red Letter — README.md — v2 — 2026-09-07

Worker: Cursor cloud agent (solo) · owns `README.md` only · started 2026-09-07 02:15 UTC.

### Brief as assumed (every field was blank)

| Field | Assumption `[assumption]` |
| --- | --- |
| PROJECT | Red Letter (`github.com/eyoitsmedean/Ai`) |
| PLATFORM | GitHub repo |
| ARTIFACT_CLASS | knowledge page / doc |
| SCOPE | the repository at branch `cursor/press-atelier-review-8634` |
| TARGET | `README.md` — chosen because it is the artifact that had drifted furthest from the repo it describes (last edited 2026-09-05, before the corpus repair, the curated Advisor, the eval set, Capacitor, and `CLAUDE.md`) and the one every reader opens first |
| READER + PURPOSE | Dean on a phone, a reviewer of PR #18, a contributor or the next worker; decide in one screen what this is, whether to trust it, and how to run it |
| STAKES | medium — the page makes claims about crisis handling and scripture rights that a reader acts on |
| REBUILD_MODE | non-destructive: a code repo's "alongside" is the branch and PR; the original is intact in git history (`git show 6121501:README.md`) and the PR diff shows every change. No second README was added because two front doors is a defect for the reader |
| RESEARCH_BUDGET | 15 lookups; 8 used |
| TEAM_MODE | solo |
| YOUR_TOOLS | read/write files, run code, browse (fetch + search), tmux-hosted server and headless Chrome, gh (read-only). Cannot see audio/images beyond screenshots; no model key |

### Source map (read this session)

`README.md` (2026-09-05), `CLAUDE.md`, `MOBILE.md`, `REVIEW.md`, `DEMO.md`, `DESIGN.md` (first 40 lines), `LAUNCH.md` (first 30), `IMPROVEMENT_PLAN.md` and `MARKET_STRATEGY.md` (openings), `.env.example`, `.github/workflows/ci.yml`, `.github/workflows/pages.yml`, `server.js` (env, routes, access-key check, model calls), `package.json`, `data/gospels-kjv.json` and `data/spoken-gospels.json` (counts), `eval/questions.json`, `scripts/qa-browser.js`, git log for the doc files, `gh repo view` (default branch).

### Keep list (survived unchanged or in meaning)

Brand "Red Letter"; the five room descriptions; the not-a-person sentence; 988 and findahelpline; every environment variable name; `npm run spoken` and the corpus description; the design paragraph ("a folio, not a feed … the only loud color is the red letter"); Node and GitHub Pages deploy; the KJV public-domain attribution line.

### Claim / evidence ledger

| Claim | Label | Source | Checked | If wrong |
| --- | --- | --- | --- | --- |
| 988 answers by call, text, or chat, 24/7 | `[verified]` (retrieved) | https://988lifeline.org/ | 2026-09-07 | README and product copy overstate a modality |
| findahelpline.com lists verified lines in 175+ countries | `[verified]` (retrieved) | https://findahelpline.com/ | 2026-09-07 | the non-U.S. path is weaker than stated |
| KJV public domain in the U.S. | `[verified]` (retrieved, two sources) | Yale Library guide https://guides.library.yale.edu/newtestament/kjv; Law SE https://law.stackexchange.com/questions/82267 quoting Cambridge | 2026-09-07 | licensing section wrong |
| U.K.: Crown prerogative administered by Cambridge UP; 500 verses for liturgical / non-commercial educational use with the prescribed acknowledgement | `[verified]` two secondaries; Cambridge's own page unreachable (Cloudflare check, timeout) | same two; acknowledgement text matches `public/index.html:2294` byte for byte | 2026-09-07 | U.K. listing risk mis-stated |
| Disconfirmation: Wikipedia says "500 words", not verses | recorded | https://en.wikipedia.org/wiki/King_James_Version | 2026-09-07 | README follows the two sources quoting Cambridge's text ("verses") |
| Prerogative may extend to Commonwealth jurisdictions | `[single-source]` | Law SE answer above | 2026-09-07 | flagged in README as single-source |
| 61 tests, 82/82 eval, 14 browser walks | `[verified]` (in-scope, ran) | `npm test`, `npm run eval`, `npm run qa` | 2026-09-07 | table wrong |
| 3,779 corpus verses; 1,923 red-letter verses; 663 grouped sayings; 12 themes | `[verified]` (in-scope, computed) | node one-liners over `data/*.json`, `/api/health` | 2026-09-07 | counts wrong |
| Android debug build succeeded | `[verified]` (prior-worker, 2026-09-06, `CLAUDE.md`) | not re-run today | 2026-09-06 | dated in README |
| `@capacitor/*` ^8.5.1 is the current major | `[verified]` (retrieved) | `npm view @capacitor/core version` → 8.5.1 | 2026-09-07 | — |
| `@anthropic-ai/sdk` ^0.39.0 is far behind current 0.124.0; `express` ^4 vs current 5.2.1 | `[verified]` (retrieved) | `npm view` | 2026-09-07 | cross-section note, not README content |

Stopping rule: budget not exhausted; stopped because the last two lookups (Wikipedia, kjbhistory) repeated the Cambridge policy text already held.

### Change list versus the original

| Element | Action | Reason |
| --- | --- | --- |
| "the Advisor replies with a small verified letter" | corrected | it now reads the question (82-item eval) |
| 988 "call or text" | corrected | chat is a real modality (retrieved) |
| Orientation block, crisis paragraph moved to the first screen | added | knowledge-page profile: answer first; safety criterion |
| "How the Advisor stays honest" | added | the product's one rule was implied, never stated |
| "Verify it yourself" table | added | organizing concept; nothing described as passed that was not run |
| Configure table (`CHAT_RATE_LIMIT`, `x-api-key`) | updated | two env vars and the gate mechanism were undocumented |
| Phones section | added | Capacitor did not exist when the README was written |
| Deploy: Pages triggers on the default branch; on-device fallback | updated | the workflow file says so; a reader deploying should know |
| Rights section | updated | U.K. position now labeled with sources and the >500-verse open question |
| "Where things live" | added | `CLAUDE.md` is the system of record and was not linked |
| Design paragraph, room list, attribution line | kept | keep list |
| `.env` block listing variables | retired | replaced by the Configure table (one source of truth) |

Stale within 90 days: dependency versions, hotline details, the test/eval counts, the "last run" date.

### Organizing concept

Every claim is one command from proof. The README states what the room does and what it refuses, and beside each load-bearing claim puts the command that demonstrates it and the last observed result.

### QA

Two passes, run separately, one repair cycle.

Pass A — information: all counts recomputed; all three commands re-run 2026-09-07; every external claim traced to the ledger. Defect S2: `API_ACCESS_KEY` described as a bearer gate; `server.js:74` reads `x-api-key`. Repaired and re-read.

Pass B — design: headings H1→H2 with no skipped level; all 30 referenced paths resolve; tables consistent (2- and 3-column); first screen carries name, rule, orientation, crisis line, run command. S3 left for Dean: 1,514 words is long for a README read on a phone — the first screen is the payoff, the rest is reference.

### Cross-section notes

1. `@anthropic-ai/sdk` is pinned at ^0.39.0; current is 0.124.0. An upgrade is a code change with behaviour risk on the live path; out of scope for a README rebuild.
2. Merging PR #18 into the default branch will trigger `pages.yml` — a GitHub Pages deploy if Pages is enabled on the repo. That is an external, visible action; Dean should merge knowing it.
3. `package.json` `description` still says "A chatbot that responds with guidance…" and the name is `red-letter-advisor`; harmless, but drifts from the brand decision in `CLAUDE.md`.
