# CLAUDE.md — system of record

This repository is Dean Ray's atelier. Default product: **Red Letter**. `AGENTS.md` mirrors this file for tools that read that name.

## How to work here

1. Read [`studio/ATELIER-PROTOCOL.md`](studio/ATELIER-PROTOCOL.md) — Dean's governing protocol (6 September 2026). It supersedes `studio/DEANS-MASTERPIECE-PROTOCOL.md`.
2. Read the brief for the work in hand, then its lock for the longer constitution:
   - Red Letter web folio, Advisor, Today / Seek / Sit / Journal → [`studio/briefs/red-letter.md`](studio/briefs/red-letter.md) · [`studio/locks/red-letter.md`](studio/locks/red-letter.md)
   - Red Words Flutter, iPhone + Android, widget → [`studio/briefs/red-words-native.md`](studio/briefs/red-words-native.md) · [`studio/locks/red-words-native.md`](studio/locks/red-words-native.md)
   - 90-day cash plans, folio, Notion OS → [`studio/briefs/ninety-day-folio.md`](studio/briefs/ninety-day-folio.md) · [`studio/locks/ninety-day-folio.md`](studio/locks/ninety-day-folio.md)
   - Muse / Meta Model API → [`studio/briefs/muse.md`](studio/briefs/muse.md) · [`studio/locks/muse.md`](studio/locks/muse.md)
3. If the request names no project, it is Red Letter.
4. Append decisions, assumptions, and open questions to the log below at RELEASE. Do not rewrite earlier entries.

## Decisions log

### 2026-09-06 — Protocol
- ATELIER PROTOCOL adopted verbatim as the governing document; Masterpiece v2 kept as history, marked superseded.
- Briefs (`studio/briefs/`) are the per-project ATELIER Part 2; locks (`studio/locks/`) remain the longer constitutions. Paste files (`studio/paste/`) are self-contained kickoffs: compact protocol + brief + kickoff lines.
- ASSUMED: CLAUDE.md is the system of record (named in Dean's filled brief); AGENTS.md mirrors it.

### 2026-09-06 — Red Letter
- Product name is Red Letter; the Advisor is one of five rooms (Today · Seek · Sit · Advisor · Journal). Dean's filled example called the product "The Red Letter Advisor" and "chat-first"; the recorded room decision is kept and the difference flagged — Dean to confirm or overturn.
- Red Letter is a web folio / PWA. Native iPhone + Android is Red Words. A native Red Letter is not a recorded decision.
- Translation: KJV 1769. VERIFIED: public domain outside the UK; Crown prerogative inside the UK administered by Cambridge University Press. Flag before any paid UK distribution.
- Scripture may only be cut by narrator frames (`data/narrator-frames.json`); custom markers must be the verse's own text; other speakers' words are not sayings. Guarded by `test/corpus.test.js`.
- Evaluation set: `eval/advisor-eval.json` (40+ questions: real, hostile, off-scope, crisis-adjacent) run by `npm run eval` against the letterpress engine; results in `eval/RESULTS.md`. The model path (with a key) is not covered by the eval and is unverified in this environment.
- GitHub Pages: workflow present (`.github/workflows/pages.yml`), last success 30 August 2026, but `https://eyoitsmedean.github.io/Ai/` returned 404 and the Pages API reported no site on 6 September 2026. The public URL is `[PAGES_URL]` until Dean enables Pages (Settings → Pages → Source: GitHub Actions) or names the host. Phone verification: `eval/PHONE-CHECKLIST.md`.
- Open: quality-reference apps (only Dean can name them).

### 2026-09-06 — Red Words
- PR 13 (`cursor/red-words-production-d607`) is the ship line; PR 12 is not this product. WEB text VERIFIED public domain (ebible.org). Identifiers locked in the lock file.

### 2026-09-06 — Ninety Days. One Plan.
- PR 15 folio is the line; five names fixed; every dollar labeled; Notion OS only if the integration is authorized in-session.

### 2026-09-06 — Muse
- "I approve" is authorization to continue, not a password. Stale device code NSXJ-LRXK must not be reused.

## STATE (latest)

- Mission lock: install ATELIER as governing protocol; correct the Red Letter brief; build the missing Advisor evaluation set.
- Work done: see decisions above; `npm test`, `npm run eval`, smoke and browser QA run this session (results in the PR and `eval/RESULTS.md`).
- Next step: Dean pastes `studio/paste/*.prompt.md` into the live chats (`studio/CHAT-UPDATES.md`); names two quality-reference apps; confirms or overturns "Red Letter, Advisor as a room".
- Open risks: the model path is unverified without a key; the eval covers routing, canon, and safety, not warmth (a human read); the public Pages URL is not live (404 on 6 September 2026).

RESUME_FROM: Red Letter — next commission under the ATELIER brief; start with ANCHOR against CLAUDE.md and `studio/briefs/red-letter.md`.
