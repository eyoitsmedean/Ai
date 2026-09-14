# Guide for future agents

Read this after `CLAUDE.md` and `studio/CANONICAL-BRIEF.md`.

## Where authoritative instructions live

1. **Later household law** — Notion [one-screen](https://app.notion.com/p/3d8b7d53f969812f9d88eac827b219e0) and [license lock](https://app.notion.com/p/3d8b7d53f96981958a71e8effc74a2d5). WATCH. No publish.
2. **This thread’s recovered brief** — `studio/CANONICAL-BRIEF.md` (six prompts, not ten).
3. **Atelier decisions** — `CLAUDE.md` (append; do not rewrite history).
4. **Product constitution** — `studio/briefs/red-letter.md` + `studio/locks/red-letter.md`.
5. **Design** — `DESIGN.md`.

Grok F1–F3 under This week are a *different* first-ten. Do not overwrite them. Do not open a sixth hub.

## How to recover current state

1. Read `CLAUDE.md` STATE and `RESUME_FROM`.
2. Read `studio/CANONICAL-BRIEF.md` if the task is Red Letter / this commission.
3. `git log -5 --oneline` on the current branch.
4. Fetch Notion one-screen + This week before inventing a new operator page.

## Evidence vs interpretation vs approved direction

- **Evidence:** `studio/research/SOURCE-REGISTER.md`, `eval/RESULTS.md`, test runs, opened URLs.
- **Interpretation:** syntheses in `studio/research/0*.md`.
- **Approved direction (until Dean overturns):** KJV labeled on paper; crisis = stop; one-screen is WATCH; folio rooms stay; no Pages.

## Add findings without duplication

Append a row to `SOURCE-REGISTER.md`. Update `COVERAGE.md` status. Only then change code. If a Grok page already holds the same finding, mention it; do not copy the essay.

## Coordinate edits

- Engine: `data/letterpress.js` then `npm run curated` (copies `public/data/*`).
- Sayings: `lib/curated.js` only; never type Scripture into HTML.
- Do not edit `public/data/letterpress.js` by hand.
- Notion writes: child of an existing Red Letter page. Check the page exists before creating.

## Record completed work

Append a dated block to `CLAUDE.md` Decisions log and refresh STATE. Link the PR. List what is still blocked (WATCH, translation gate).
