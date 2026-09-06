# Release checklist

Every line is marked **verified** (run in this environment, with what was run) or **unverified** (what it would take). Nothing below is described as passed that was not run. Last run: 2026-09-06 at the commit in `eval/results.md`.

An independent review on 2026-09-06 (a Breaker agent that built nothing) found the corpus shifted in six chapters, the verifier printing non-dominical verses under bold citations, and the crisis pattern missing two-thirds of realistic phrasings. All three are repaired below and tested; the register is in the PR description.

## Words

| Item | Status | Evidence |
| --- | --- | --- |
| The KJV corpus carries the canonical verse counts (1071/678/1151/879) and correct numbering | verified | rebuilt by `scripts/build-kjv.js` from two independent public-domain sources that agree verse-for-verse; `test/scripture.test.js` asserts counts and Matthew 26:39 / Mark 4:40 / Matthew 22:14 |
| Every Advisor quote is exact KJV speech for its citation, on the server composer and the static-hosting composer | verified | `npm run eval` gate `exact`, 75/75 both; `test/scripture.test.js` |
| No verse the red-letter map does not mark as spoken can be quoted, even under a bold citation (the devil, Mary, Judas's death, the narrator, the synagogue ruler, the crowd) | verified | `test/scripture.test.js` — 'never puts other voices in His mouth' |
| Every quotation the page itself can show (rooms, daily words, Seven, Forty) is His exact words | verified | `test/eval.test.js` — 'every quotation the page can show' |
| Nothing outside Matthew–John can be quoted, even when asked for Psalms, Romans, 1 Corinthians, or placeholders injected in the question | verified | eval `scope` gate on offscope-05/06, forgery-01..04 |
| Fabricated "Jesus said" quotes are not expanded or repeated | verified | eval forgery-02, forgery-03 |
| Blessing links only open for Gospel references; `Romans 8:28` opens nothing | verified | `npm run qa` — "a forged blessing is dropped" |
| Static hosting shows the exact verse, not its five-verse block | verified | `npm run qa` — "static hosting still shows the exact verse" |
| Translation licence recorded | verified | KJV public domain outside the UK — CLAUDE.md, source cited |
| Red-letter verse map is aligned to the corrected numbering | verified | 2,007 markers checked against the rebuilt text: 1 mismatch (a leading 'Saying,'); 6 non-dominical entries excluded by name in `lib/scripture.js` |
| Red-letter verse map provenance | **unverified** | `data/red-letter-source.json` names no source. Dean to name it or authorize a rebuild from a named public-domain red-letter edition. |

## Safety

| Item | Status | Evidence |
| --- | --- | --- |
| Crisis-shaped questions get 988 + findahelpline before any scripture, and only crisis-safe passages | verified | eval `crisis` gate, 15/15 crisis inputs on both composers, incl. 'unalive', 'kms', 'pills ready', farewells, 'better off without me', third person, Spanish |
| The pattern hears the phrasings people use and not idiom | verified | `test/eval.test.js` — 43 danger phrasings caught, 17 idioms not; known false triggers: 'hurt myself lifting boxes', 'cut myself shaving', 'overdose of caffeine' (a notice, not a harm) |
| Violence or abuse gets the National Domestic Violence Hotline (1-800-799-7233 / text START to 88788) + findahelpline before scripture, and an opening that speaks to the one hurt — or to someone frightened of their own anger | verified | eval `danger` category 4/4 + hostile-04 on both composers; hotline VERIFIED 2026-09-06 at thehotline.org |
| Client shows the crisis interrupt before send with the same pattern | verified | `test/eval.test.js` asserts client regex == `CRISIS_RE`; `npm run qa` — "crisis language interrupts before send" |
| Idiom does not trigger the notice ("kill for a coffee", "deadline is killing me") | verified | eval edge-05; `test/eval.test.js` |
| The product says it is not a person / therapy / emergency care on the title page and in every crisis letter | verified | title page copy; `CRISIS_NOTICE` |
| 988 and findahelpline are live services | verified 2026-09-06 | fetched 988lifeline.org (call/text/chat, 24/7) and findahelpline.com (175+ countries) |
| Model-written letters (with an Anthropic key) pass the same gates | **unverified** | run `node scripts/eval.js --url http://<host>` against a server with `ANTHROPIC_API_KEY`; ~8 minutes at the 10/min rate limit; read `eval/results.md`. The verifier the model path passes through is the one tested above. |
| Live server over HTTP/SSE, no key | see PR | `node scripts/eval.js --url http://127.0.0.1:3000` — result recorded in the PR description |

## Room

| Item | Status | Evidence |
| --- | --- | --- |
| Unit tests | verified | `npm test` — 56 pass (includes both eval runs) |
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
