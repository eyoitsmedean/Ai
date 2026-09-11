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

### 2026-09-11 — Recovery commission (evening)
- This Cursor thread has **six** user-authored prompts, not ten. Transcript recovered; one `role: user` wrapper skipped. Table: `studio/CANONICAL-BRIEF.md`.
- Later Notion law (opened this session) outranks earlier ship energy: **WATCH** — no publish, no launch, no store-submit. One-screen spec. Crisis = hotline then **stop counsel**. Translation is a human gate (WEB/KJV-US). No sixth hub; Grok F1–F3 left untouched.
- Crisis path no longer prepends a letter after 988. `composeLetter` returns notice-only; `/api/chat` does not start the model. A later turn in the same correspondence stays stopped. Collapse phrasing (`can't go on`, `end it all`) is treated as crisis, not Hope counsel. Eval crisis cases require no Scripture.
- One-screen WATCH advisor: `public/one-screen.html` (`/ask`). Meaning is curated `context`, ≤4 sentences. Quotes labeled King James Version (1769). Corpus not switched to WEB.
- Adjacent research filed under `studio/research/` (WEB vs KJV, crisis stop, one-screen vs folio, WATCH vs Pages, meaning vs words).
- ASSUMED: Dean still wants KJV voice on paper until he records another text. Folio rooms stay.

### 2026-09-11 — Red Letter sprint
- Short room names (`Anxiety`, `grief`) resolve to the locked room names on `/api/encouragement`, the library filter, and Seek's static fallback. Unknown names still 400.
- Crisis cue carves out accidental cuts (`shaving`, `cooking`, `on a knife/glass/paper`). The page modal uses the same engine as the letter.
- Generic letter opening states that only His words are kept, not that every question was answered.
- After Day 7 the Today ribbon shows the next week of `paths.more` (11 further days). First week still labelled Seven Days. Storage key `rla-seven` unchanged.
- Advisor empty state: eight room chips (Shame, Grief, Loneliness, Suffering, Doubt, Conflict, Hope, Peace) send phrases the letterpress already hears. Existing four suggestion chips kept.

## STATE (latest)

- Mission lock: Universal recovery commission (11 September 2026 evening) — recover this thread, align to Notion WATCH, deliver three flagships.
- Decisions this session: six prompts recovered; crisis stops counsel; one-screen is the WATCH surface; folio rooms preserved; KJV stays labeled; Pages not enabled; no sixth Notion hub.
- Work done: `studio/CANONICAL-BRIEF.md`, `studio/research/*`, `studio/HANDOFF.md`, `public/one-screen.html`, crisis stop in letterpress + `/api/chat`, eval/QA updated. Notion child under the existing one-screen page.
- Next step: Dean opens `/ask` locally if he wants; records (or refuses) a translation before any public URL; does not enable Pages while WATCH holds. Paste files still require Dean to paste.
- Open risks: model path unverified without a key; eval does not judge warmth; Pages URL last checked 6 September 2026 (stale-by: re-curl; moot under WATCH); crisis detector is keyword-plus-carve-out, not contextual; Notion crisis *sentence* not swapped in (existing notice kept).

RESUME_FROM: Read `studio/CANONICAL-BRIEF.md` and `studio/FUTURE-AGENTS.md`. Do not publish. Do not switch the corpus. Do not open a sixth hub.
