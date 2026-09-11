# CLAUDE.md — The Red Letter Advisor: system of record

Read this before designing anything. Decisions listed here are settled; build on
them. If you believe one is wrong, keep it and flag your reasoning in the ship
note — never reverse it silently.

## Mission

Ship The Red Letter Advisor as a production-ready, chat-first advisor that applies
Jesus's own words from the four Gospels to modern life situations. Advisor first;
scholarship sits behind the answer, not in front of it. The scope is Jesus's
words only — not the whole Bible.

## Decisions (settled)

| # | Decision | Recorded |
|---|---|---|
| D1 | Name: **The Red Letter Advisor** (short: Red Letter). | Brief, 2026-09 |
| D2 | Palette: parchment and crimson. Type: Fraunces (display), Literata (reading), Figtree (UI), self-hosted. | Brief; `public/css/app.css`, `public/fonts/` |
| D3 | Advisor-first product, not a scholarship tool. The intent was inverted once (scholarship-first); do not repeat. | Brief |
| D4 | The model never types a verse. It emits `{{Book C:V}}` markers from a retrieved allow-list; the server substitutes the recorded corpus text and verifies every citation before it reaches the page. | PR #10 (merged base pipeline) |
| D5 | Server corpus: **King James Version (1769 Cambridge)** in `data/gospels-kjv.json`; offline PWA corpus: **World English Bible** in `public/data/corpus.json`. Red-letter membership comes from `data/spoken-gospels.json` (1 922 verses). | PR #10 |
| D6 | Mobile stack: **PWA** (installable on iPhone Safari and Android Chrome) reusing the single HTML build. A Capacitor wrapper for store listing is the alternative, not chosen. | This session (default per brief: reuse the existing HTML build) |
| D7 | Safety handoffs live in the product on both sides: server prefixes the letter with a notice (988 for suicidality; 1-800-799-7233 / RAINN 1-800-656-4673 for danger and assault; findahelpline.com elsewhere), and the client interrupts with a modal before sending. Letters for these cases are fixed, never retrieval. | This session |
| D8 | Only red-letter verses may be rendered as quotations. Narrator lines, other authors and unknown references are dropped from a letter together with their context sentence; a model letter left with zero verifiable sayings is replaced by the retrieval letter. | This session |
| D9 | Off-scope, hostile and greeting inputs receive fixed honest letters with one open door (`Matthew 11:28`), never a verse chosen by coincidence. | This session |
| D10 | The evaluation set is `eval/questions.json`, run by `npm run eval`; `eval/RESULTS.md` is generated, never hand-edited, and states which path (retrieval or live model) it ran against. | This session |
| D11 | Cache versioning: bump `?v=N` in `public/index.html`, the matching entries in `public/sw.js`, and the cache name `rla-vN-chapel` together. Currently **v19**. | DEPLOY.md |
| D12 | Suicidality, assault and abuse are answered by the fixed letters and never by the model, on the first turn and on every follow-up of that conversation. The one thing the page must not do in that moment is improvise. | `lib/letters` path / `server.js` `chatSafety`; recorded 2026-09-07, in force since cf575f2 |
| D13 | A model letter that claims to be a person or that counsels staying/submitting in place is discarded and replaced by the retrieval letter. Same regex is used by `scripts/eval.js`. | `lib/guard.js`, 2026-09-11 |

## Third-party material and licences (checked 2026-09-11)

| Material | Status | Source | What it permits |
|---|---|---|---|
| King James Version text | Public domain **outside the United Kingdom**. In the UK, rights are vested in the Crown and administered by Cambridge University Press (Crown's patentee): up to 500 verses for liturgical / non-commercial educational use, less than a full book, without application; acknowledgement printed in the About sheet; other UK uses need written permission from CUP. The word “perpetual” is ours — opened CUP/CoE/Yale pages (2026-09-11) do not use it. Live CUP HTML rights page was not opened (403/503). | [Yale Library guide](https://guides.library.yale.edu/newtestament/kjv); [Church of England liturgical copyright guide (PDF)](https://www.churchofengland.org/sites/default/files/2017-11/Brief%20guide%20to%20liturgical%20copyright.pdf); CUP 2021 sample + 2025 permissions form (see `docs/research/licences-helplines.md`) | Fine for a US / non-UK release. **Open decision for Dean before any paid UK release** — see OQ1. |
| World English Bible text | Public domain worldwide; "World English Bible" is a trademark of eBible.org (do not rename altered text). | [ebible.org/web/copyright.htm](https://ebible.org/web/copyright.htm) | Copy, sell, distribute freely. |
| Fraunces, Literata, Figtree fonts | SIL Open Font License 1.1. | [fraunces OFL](https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt), [figtree OFL](https://github.com/google/fonts/blob/main/ofl/figtree/OFL.txt), [literata OFL](https://raw.githubusercontent.com/googlefonts/literata/3.103/OFL.txt) | Embed and sell with software; fonts may not be sold alone. |
| Helpline numbers | 988 (US, 988lifeline.org) and 9-8-8 (Canada, 988.ca) are two operators, one short code. Samaritans 116 123 and Lifeline 13 11 14: re-checked on operator pages 2026-09-11. 1-800-799-7233 / text START 88788 / thehotline.org: re-checked 2026-09-11. RAINN 800-656-4673 / hotline.rainn.org: rainn.org blocked this session; same numbers still on US OVC 2026-09-11. | [988lifeline.org](https://988lifeline.org/), [988.ca](https://988.ca/), [thehotline.org](https://www.thehotline.org/), [OVC hotlines](https://www.ovc.ojp.gov/help-for-victims/toll-free-text-and-online-hotlines), [samaritans.org](https://www.samaritans.org/), [lifeline.org.au](https://www.lifeline.org.au/) | Re-check before each release (`RELEASE.md`). Dean must re-open rainn.org. |

## Open questions for Dean

| # | Question | Recommended default |
|---|---|---|
| OQ1 | Move the **server** corpus from KJV to WEB so the whole product is public domain worldwide (removes the UK Crown constraint before any paid UK release)? Cost: fetch WEB Gospels from ebible.org, regenerate `data/spoken-gospels.json` and the curated packs' wording, re-run tests and eval; roughly one focused session. | Yes, before a UK or App-Store release; not required for a US web launch. |
| OQ2 | Run `npm run eval` against a server with `ANTHROPIC_API_KEY` set and commit the live-model `eval/RESULTS.md`. Only Dean holds the key. | Run it before flipping the PR from draft; treat any failure as a blocker. |
| OQ3 | Capacitor wrapper for App Store / Play listing (D6 alternative). | Defer until the PWA has real users; store submission needs Dean's sign-off anyway. |

## Assumptions made in the absence of instruction

- A1 (ASSUMED): Off-scope and hostile letters carry exactly one verse, Matthew 11:28, offered as an open door — so every letter still contains a Gospel citation.
- A2 (ASSUMED): Danger detection covers physical abuse, threats, sexual assault and "not safe at home"; workplace bullying and verbal conflict are routed to the ordinary advisor path.
- A3 (ASSUMED): The eval runner's latency check is soft (warning only), because a live-model first byte depends on the provider.

## How to work here

- `npm test` (node:test), `npm run smoke -- http://localhost:3000`, `npm run eval` (server must be running; set `RATE_LIMIT_OFF=1` locally).
- Never describe a check as passed unless it ran. `RELEASE.md` is the checklist that records verified vs unverified.
- Verbatim scripture enters the code only from the corpus files; hand-picked citations in `lib/letters.js` are self-checked when the module loads (`selfCheckCuratedCitations`) against `lookup()` and must be red-letter — a bad citation stops the server from booting.
- Layout: `server.js` is routes only. Fixed letters: `lib/letters.js`. Prompts: `lib/prompts.js`. Verdicts: `lib/report.js`. Persona/stay guard: `lib/guard.js`. Detectors shared with the page: `public/js/safety-patterns.js`. Offline safety letters: `npm run safety-pack` → `public/data/safety-pack.json` (commit the JSON whenever a safety letter or notice changes).
- Orientation for a later agent: `docs/CANONICAL-BRIEF.md`, then `docs/SHIP.md`.
