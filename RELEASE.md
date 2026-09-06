# Release checklist

Every line is marked **verified** (run in this environment, with what was run) or **unverified** (what it would take). Nothing below is described as passed that was not run. Last run: 2026-09-06 at the commit in `eval/results.md`.

## Words

| Item | Status | Evidence |
| --- | --- | --- |
| Every Advisor quote is exact KJV speech for its citation | verified | `npm run eval` gate `exact`, 50/50; `test/scripture.test.js` |
| Nothing outside Matthew–John can be quoted, even when asked for Psalms, Romans, 1 Corinthians, or placeholders injected in the question | verified | eval `scope` gate on offscope-05/06, forgery-01..04 |
| Fabricated "Jesus said" quotes are not expanded or repeated | verified | eval forgery-02, forgery-03 |
| Blessing links only open for Gospel references; `Romans 8:28` opens nothing | verified | `npm run qa` — "a forged blessing is dropped" |
| Static hosting shows the exact verse, not its five-verse block | verified | `npm run qa` — "static hosting still shows the exact verse" |
| Translation licence recorded | verified | KJV public domain outside the UK — CLAUDE.md, source cited |
| Red-letter verse map provenance | **unverified** | `data/red-letter-source.json` names no source. Dean to name it or authorize a rebuild. |

## Safety

| Item | Status | Evidence |
| --- | --- | --- |
| Crisis-shaped questions get 988 + findahelpline before any scripture, server-side | verified | eval `crisis` gate, 8/8 crisis inputs incl. third-person ("wants to end his life"), "too many pills", "not wake up", "cutting myself" |
| Client shows the crisis interrupt before send with the same pattern | verified | `test/eval.test.js` asserts client regex == `CRISIS_RE`; `npm run qa` — "crisis language interrupts before send" |
| Idiom does not trigger the notice ("kill for a coffee", "deadline is killing me") | verified | eval edge-05; `test/eval.test.js` |
| The product says it is not a person / therapy / emergency care on the title page and in every crisis letter | verified | title page copy; `CRISIS_NOTICE` |
| 988 and findahelpline are live services | verified 2026-09-06 | fetched 988lifeline.org (call/text/chat, 24/7) and findahelpline.com (175+ countries) |
| Model-written letters (with an Anthropic key) pass the same gates | **unverified** | run `node scripts/eval.js --url http://<host>` against a server with `ANTHROPIC_API_KEY`; ~6 minutes at the 10/min rate limit; read `eval/results.md` |

## Room

| Item | Status | Evidence |
| --- | --- | --- |
| Unit tests | verified | `npm test` — 48 pass |
| Live HTTP smoke | verified | `npm run smoke` — 10 checks |
| First-session browser walk (title page, lectio, journal, Seek, Advisor, crisis, library, blessing, desktop rail) | verified | `npm run qa` — 17 checks, headless Chrome 390×844 and 1100×800 |
| Offline: precache complete, Today renders, blessing link opens from cache | verified | service-worker check in headless Chrome (10/10 precached assets) |
| GitHub Pages project path (`github.io/Ai/`) with no API | verified | Chrome with host mapped to a static server under `/Ai/`: Today, Seek, library, curated Advisor, blessing links, zero page errors |
| Security headers, no `x-powered-by`, missing assets 404 | verified | `test/api.test.js`, smoke |
| Health endpoint reports version, sayings, model status | verified | `GET /api/health` |
| HTTPS in production | **unverified** | host-dependent; HSTS header is sent when `NODE_ENV=production` |

## Phone — Dean's five minutes

On-device testing cannot be run here. This is the whole check:

1. Open the deployed URL on iPhone Safari. Share → **Add to Home Screen**. Open from the icon: it should launch full-screen on the title page with no browser bar. (Android Chrome: menu → **Install app**.)
2. Tick the acknowledgment, **Turn the page**, **Just the morning page**. A sitting should open by itself with a red sentence. Tap through Reflect → Rest → write one word → Amen.
3. Turn on Airplane Mode. Reopen from the icon. Today should still render; the offline banner may show. Turn Airplane Mode off.
4. Type "I want to die" in the Advisor. The crisis interrupt must appear **before** the message sends, with 988.
5. Today → **Send a blessing** → add a note → **Send it**. The share sheet should offer Messages with a card and a link. Send it to yourself. Open the link: your note, the verse, *Turn the page*.

If any step fails, that is the release blocker; the number of the step is the bug report.

## Not done, on purpose

- No App Store / Play submission, no production deploy, no spending, no message sent to anyone. Each needs Dean's word.
- The Ninety Days folio (#19) is a separate review.
