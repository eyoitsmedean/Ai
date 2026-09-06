# CLAUDE.md — system of record for Red Letter

Read this before designing anything. Decisions here are settled; disagree in a ship note, never by silent reversal.

## What this is

A chat-first advisor that answers a real life question from the direct words of Jesus in Matthew, Mark, Luke, and John, quoted from the KJV — with a reading room around it (Today, Sit, Seek, Advisor, Journal; the Seven Days and Forty paths). The reader is often on a phone at a low moment. **Advisor-first, not a scholarship tool.** The scholarship (corpus integrity, frame-cutting, the red-letter map) sits *behind* the answer so the answer can be trusted; it is never the product.

## Decisions (settled)

| Decision | Status | Where it lives |
|---|---|---|
| Product wordmark **Red Letter**; the advisor voice is **The Red Letter Advisor** | settled | `public/manifest.json`, `server.js` `ADVISOR_SYSTEM` |
| Parchment-and-crimson palette; Fraunces italic mark; verse citations small-caps crimson | settled | `DESIGN.md` |
| Scope is His words only — never Paul, prophets, Psalms, Acts, Revelation | settled | `lib/scripture.js`, `test/map.test.js`, `eval/` |
| Translation: **KJV (1769 Cambridge text)**. Public domain in the US and most of the world; in the UK the text is Crown prerogative administered by Cambridge University Press (500-verse non-commercial limit). A paid tier distributed in the UK needs Cambridge's permission or a UK geo-restriction. | settled; UK point OPEN for Dean | `README.md`, this file |
| Every quoted verse is filled from the corpus, never typed by the model or by us (`{{Book c:v}}` markers → `verifyAndSubstitute`) | settled | `lib/scripture.js` |
| Red-letter map is verse-level with partial markers; interrupted verses use ` … ` spans; hand-reviewed cases live in `data/spoken-overrides.json`; John 3:16–21 set red as most KJV editions do | settled, disclosed in Room settings | `data/`, `test/spoken.test.js`, `test/map.test.js` |
| Privacy: journal and ledger stay on the device; anonymous day totals shared only by an explicit toggle; no tracker, no account | settled | `LAUNCH.md`, `README.md` |
| Crisis: detector on client *and* server (kept identical by test); the modal offers 988 and findahelpline before a crisis line is sent; the server prepends the notice before any verse | settled | `public/index.html`, `lib/scripture.js`, `test/counsel.test.js` |
| When no model is available the server writes the letter from the curated rooms for *this* question; never one fixed page | settled 2026-09-06 | `lib/counsel.js` |
| **Mobile stack: Capacitor around the existing HTML build** (default per brief). Alternative considered: a React Native / Expo rewrite — rejected for now because it duplicates 4,300 lines of working UI and the church-year, path, and ledger logic, and puts two clients on one corpus. Risk accepted: Apple guideline 4.2 / 4.2.2 rejects "repackaged websites"; the shell must ship with the offline reading room, install-free paths, share sheet, and haptics-free quiet — see `RELEASE.md`. | settled 2026-09-06 | `capacitor.config.json`, `scripts/build-shell.js`, `RELEASE.md` |
| One HTML build serves every host: `<meta name="rla-api-base">` (empty = same origin) routes `/api`; the server answers other origins only when named in `RLA_ALLOWED_ORIGINS` | settled 2026-09-06 | `public/index.html` `apiUrl()`, `server.js` |
| Free tier: 5 Advisor letters a day; Plus is annual, not weekly | settled | `LAUNCH.md`, `public/index.html` `FREE_CHATS` |

## Open (Dean decides)

1. **UK distribution** of a paid tier quoting ~1,900 KJV verses: ask Cambridge (they generally do not charge; they check the source text) or geo-restrict the paid tier. Recommended: write to Cambridge before the paid switch is flipped.
2. **Production API host.** GitHub Pages cannot run `/api/*`. The room runs fully offline there; the Advisor's model path, the ledger summary, and the native shell all need a host. Recommended: any Node host with `ANTHROPIC_API_KEY`, `RLA_ALLOWED_ORIGINS`, and `API_ACCESS_KEY` set.
3. **Naming**: the brief says "The Red Letter Advisor"; the shipped wordmark is "Red Letter" with "The Red Letter Advisor" as the voice. Recommended: keep both as they are (product / persona).
4. **Quality references** — two named apps to match on time-to-first-answer and warmth (brief left blank).

## Known risks / what went wrong before

- Product intent was inverted once (scholarship-first). Every new surface starts from the reader's question, not the corpus.
- The KJV corpus once had six dropped verses, so citations were off by one; the red-letter map had holes, misquotes, and other speakers printed in red. All now under test (`npm test`); do not edit `data/` without running the suite.
- "Verified" was once claimed for things not run. `RELEASE.md` marks every item verified or unverified with the rung.

## How to check the work

`npm test` (81) · `npm run qa` (14 browser checks; needs a running server and Chrome) · `npm run eval` (46 questions against a live server; writes `eval/RESULTS.md`) · `npm run audit` (frame audit).

## Session log

- **2026-09-06** — Red-letter map repaired and tested; mid-verse named frames cut; lamp-out letter written per question; evaluation set (46) with results; crisis detector widened and synchronised; API-base switch with CORS allow-list; Capacitor decision and shell build; this file and `RELEASE.md` created. PR [#22](https://github.com/eyoitsmedean/Ai/pull/22).
