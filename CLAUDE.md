# Red Letter — system of record

Read this before designing anything. Decisions here are settled; if you believe one is wrong, keep it and flag your reasoning in the ship note.

## What this is

A quiet reading room, and an advisor, constrained to the direct spoken words of Jesus in Matthew, Mark, Luke, and John (KJV). Four rooms each morning (Today, Seek, Advisor, Journal), a lectio sitting, Seven Days, and a blessing you can send to one person.

The product is advisor-first, not scholarship-first. Scholarship sits behind the answer, never in front of it. This was inverted once; do not invert it again.

## Decisions (settled)

| Decision | Status | Where |
| --- | --- | --- |
| Name: **Red Letter** (the advisor within it is *The Red Letter Advisor*) | settled | README, index.html |
| Palette: parchment and crimson; the only loud colour is the red letter | settled | DESIGN.md |
| Scope: Jesus's spoken words only; never Paul, prophets, or narrative | settled | lib/scripture.js `verifyAdvisorText` |
| Translation: **KJV**, public domain outside the UK (Crown letters patent apply in the UK) | settled — VERIFIED 2026-09-06 via Wikipedia, *King James Version*, § Copyright status | data/gospels-kjv.json |
| Corpus text comes from two independent public-domain KJV sources that must agree verse-for-verse (`scripts/build-kjv.js`); canonical verse counts are asserted in tests | settled 2026-09-06 | scripts/build-kjv.js, test/scripture.test.js |
| Only the red-letter map decides what He said. A verse the map does not mark is never quoted, whatever a model or a URL asks for; six map errors are excluded by name | settled 2026-09-06 | lib/scripture.js `lookup`, `NOT_SPEECH` |
| The verifier removes every quotation it cannot prove — bold blocks outside the Gospels, same-line fabrications, free-standing quotes, prose quoting words not in the corpus, other books, other translations | settled 2026-09-06 | lib/scripture.js `verifyAdvisorText` |
| Quotes are never typed by a model; placeholders `{{Book C:V}}` are filled from the corpus and anything unverifiable is removed | settled | lib/scripture.js `fillPlaceholders`, `verifyAndSubstitute` |
| Without a model key the Advisor writes a letter from the curated rooms only — no saying is pulled in by the question's keywords, because that wounded people (see PR register) | settled 2026-09-06 | lib/advise.js |
| Crisis letters use a fixed safe set (John 14:27, Matthew 11:28, Luke 12:7) and an opening for the person or for the one who loves them | settled 2026-09-06 | lib/advise.js `CRISIS_PASSAGES` |
| Something taken is a medical emergency before it is anything else: **911 / Poison Control 1-800-222-1222** (VERIFIED 2026-09-06 at poisonhelp.org and poisoncenters.org) leads the crisis notice and the page's interrupt | settled 2026-09-06 | lib/scripture.js `POISON_RE`, `POISON_LINE`; lib/letter.js `noticeFor`; public/index.html `#crisis-poison` |
| The one who hit, or is afraid they will, gets the violence notice with an opening addressed to them — never 'this is not your fault' | settled 2026-09-06 | lib/scripture.js `BY_YOU_RE`; lib/advise.js `DANGER_BY_YOU_OPENING` |
| The first passage in a letter belongs to the room the question names; the eval gate checks the first citation, not any citation | settled 2026-09-06 | scripts/eval.js `judge` (G5) |
| Rooms never lead with a command or a condition: Forgiveness opens with 'Be ye therefore merciful' (Matthew 6:14–15 is third, or absent on the client); Conflict opens with 'first be reconciled' and never contains 'love your enemies'; Grief never contains 'many mansions'; the day a betrayal is discovered, Forgiveness is kept out of the letter altogether | settled 2026-09-06 | lib/curated.js, data/curated.js, lib/retrieve.js `BETRAYED_RE`; `test/eval.test.js` |
| Evangelist introductions are trimmed from spoken verses by an explicit, text-asserted list, never by a general pattern, because a parable's own 'and he said' is His narration | settled 2026-09-06 | lib/scripture.js `NARRATOR_PREFIXES` |
| Violence and abuse get their own notice: National Domestic Violence Hotline 1-800-799-7233 / text START to 88788 (VERIFIED 2026-09-06 at thehotline.org) + findahelpline | settled 2026-09-06 | lib/scripture.js `DANGER_NOTICE` |
| Crisis-shaped questions get the human-help notice **before** scripture, on client and server, from one shared pattern | settled | lib/scripture.js `CRISIS_RE`; mirrored in public/index.html |
| Crisis resources: **988** (US call/text/chat, 24/7 — VERIFIED 2026-09-06 at 988lifeline.org) and **findahelpline.com** (175+ countries — VERIFIED 2026-09-06) | settled | lib/scripture.js `CRISIS_NOTICE` |
| The product never claims to be a person, pastor, clinician, or emergency care | settled | title page, CRISIS_NOTICE, ADVISOR_SYSTEM |
| Mobile: the installable PWA **is** the mobile build (iOS/Android via Add to Home Screen). Native store wrappers are a separate decision for Dean; Flutter explorations live on other branches (#12, #13) and are not merged here | settled for now | public/manifest.json, public/sw.js |
| Static hosting: the room runs at a GitHub Pages project path (`…github.io/Ai/`) with no server; only model letters need Node | settled | public/index.html `BASE`, README § Deploy |
| Blessings are links (`/?b=<ref>&n=<note>`), verified against the corpus, nothing stored server-side | settled | README, public/index.html |
| Nothing behind the words is paywalled: His words, lectio, Seek, Seven Days, curated Advisor, journal | settled | LAUNCH.md § What must never be locked |
| Pricing when money exists: annual first, no weekly SKU | settled | LAUNCH.md |
| Evaluation: `npm run eval` and `npm run eval -- --client` must pass (85 questions, five gates, both composers) before any release; results are committed in `eval/` | settled 2026-09-06 | scripts/eval.js, eval/ |
| The three client patterns (crisis, danger/by-you, poisoning) are literal copies of the server's; tests fail when they drift. Never edit the copies by hand — change `lib/scripture.js`, then paste `.source` | settled 2026-09-06 | test/eval.test.js 'keeps the … in step' |

## Assumptions (labelled, correct if wrong)

- ASSUMED: the retrieval advisor is the path evaluated in CI; the model path is evaluated by running `node scripts/eval.js --url <server-with-key>` and is marked unverified until Dean does so.
- ASSUMED: an installable PWA satisfies "builds for iPhone and Android" for this stage. If store presence is required, Capacitor wrapping the existing `public/` is the reuse-the-HTML-build option; Flutter (#12/#13) is the rewrite option.

## Open questions for Dean

1. `data/red-letter-source.json` says its verse map comes from "open red-letter maps" without naming the map or its license. It is aligned to the corrected KJV numbering (1 of 2,007 markers off by a leading 'Saying,') and six entries were other speakers, now excluded. Name the source or authorize a rebuild from a named public-domain red-letter edition.
4. Known false triggers of the crisis notice: 'hurt myself lifting boxes', 'cut myself shaving', 'overdose of caffeine'. A notice is cheap and a miss is not; say if you want them suppressed.
5. The verifier judges quotations, books and translations in prose — not meaning. A model sentence like 'here He promises you will never feel anxiety again' after a real citation passes. Closing that needs either a model-graded eval (costs a key per run) or a shorter, tighter ADVISOR_SYSTEM prompt; say which you want.
2. Store distribution (Capacitor vs Flutter vs PWA-only) — see Assumptions.
3. The household window in the Ninety Days plan is still unconfirmed; nothing here publishes or sends.

## Where things live

- Corpus build: `npm run spoken` → `data/spoken-gospels.json`, `public/library.json`
- Tests: `npm test` (unit + eval gates), `npm run eval` (writes eval/results.*), `npm run smoke` (live HTTP), `npm run qa` (browser, needs Chrome)
- Release checklist: `RELEASE.md`
- Design language: `DESIGN.md` · Launch plan: `LAUNCH.md` · Demo script: `DEMO.md`
