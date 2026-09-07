# Bot working notes — Red Letter — README — v2 — 2026-09-07

Worker: Cursor cloud agent · owns: `README.md` only · started 2026-09-07 02:20 UTC · mode: non-destructive (branch `cursor/readme-rebuild-fbba`, stacked on `cursor/forty-path-fbba`).

## Ship package

**1. The artifact** — `README.md` on `cursor/readme-rebuild-fbba`; the original is untouched on `cursor/forty-path-fbba`.

**2. Summary** — The README now answers in the order a reviewer on a phone needs: what the room is, why a verse printed in it can be trusted (corpus → map → frame → floor, with dated counts), how to run it, what each check command proves, how it ships. Depth folds under four toggles. The GitHub Pages claim is corrected: Pages is not enabled.

**3. Key changes**
- Added — orientation block (purpose · owner · status · updated · what changed); "Why a verse printed here can be trusted" as the first-screen answer; "Check it" table with what each command proves and what it needs; Node version; an index of the record files; a Rights section with the missing-license decision. Reason: the old page hid its strongest evidence inside prose and never stated the runtime.
- Updated — the four depth paragraphs (frame, ledger, lamp-out, eval) moved under `<details>` unchanged in substance; "GitHub Pages" replaced by "a static host" where the ledger toggle is discussed. Reason: depth after answers.
- Corrected — "the workflow publishes `public/`" → Pages is not enabled on the repo (site and Pages API both 404, 2026-09-07), and the page's root-absolute asset paths mean a `/Ai/` project path would not work; "(Klopsch, 1899)" → Klopsch's 1899 red-letter *New Testament* (the full Bible was 1901). Reason: accuracy.
- Retired — nothing. Every KEEP LIST item is present.

**4. How to use** — Review the PR diff on a phone; if it reads right, merge the PR into `cursor/forty-path-fbba` (it rides into PR #22). Nothing else changes.

**5. Verification performed** — Read: README.md, package.json, both workflows, DEMO.md, headings of LAUNCH/DESIGN/MARKET_STRATEGY/IMPROVEMENT_PLAN, CLAUDE.md, RELEASE.md, `public/index.html` asset paths, `.env.example`. Lookups (6 of budget 8): Pages site URL (404), Pages REST API (404), `gh run list` for pages.yml, one web search, Crossway article opened, American Bible Society article opened. Ran: `npm test` (83/83), `npm run audit` (1,927 verses · 0 named · 13 pronoun), counts of corpus verses (3,779), sayings (660), eval categories (46 = 16/10/6/6/8). QA: Pass A (information) and Pass B (design) run separately; one S1 found (audit "currently none" was false) and repaired; retested. No S1/S2 open.

**6. Assumptions and limits** — Brief was blank; TARGET = README `[assumption]`. Node 20 compatibility of the test suite is inferred from CI config, not run here (this VM has 22.14) `[inference]`. Stale within 90 days: every count, the Pages status, the PR number. `[single-source]`: none — Klopsch dates have two opened sources; Pages status has two independent checks.

**7. Sources** — Crossway, *The Origins of the Red-Letter Bible* (opened 2026-09-07) · American Bible Society, *When Did Publishers Start Printing Red Letter Bibles?* (2011-03-10; opened 2026-09-07) · `https://eyoitsmedean.github.io/Ai/` 404 and `GET /repos/eyoitsmedean/Ai/pages` 404 (2026-09-07) · repo tree at `cursor/forty-path-fbba` HEAD.

**8. Decisions needed from Dean**
- Repo license: none exists. Recommendation: keep the repo private until chosen; if public, MIT for code with the KJV note kept.
- GitHub Pages: enable or drop the workflow. Recommendation: drop until there is a site root (custom domain) — the app's absolute paths will not serve from `/Ai/`.

**9. Cross-section notes**
- `cors` is in `package.json` dependencies but never required (`server.js` sets headers itself). Safe to remove; not touched here.
- `public/index.html` loads assets from `/` — any static host under a sub-path breaks. Belongs to whoever owns the client.
- A separate branch `cursor/world-class-red-letter-4ba9` exists with its own Pages runs failing; not examined, not touched.
