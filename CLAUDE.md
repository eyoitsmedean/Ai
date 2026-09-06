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
| Translation: **KJV 1769**, public domain outside the UK (Crown letters patent apply in the UK) | settled — VERIFIED 2026-09-06 via Wikipedia, *King James Version*, § Copyright status | data/gospels-kjv.json |
| Quotes are never typed by a model; placeholders `{{Book C:V}}` are filled from the corpus and anything unverifiable is removed | settled | lib/scripture.js `fillPlaceholders`, `verifyAndSubstitute` |
| Without a model key the Advisor still writes a letter from the curated rooms + retrieval — the words stay free | settled | lib/advise.js, LAUNCH.md |
| Crisis-shaped questions get the human-help notice **before** scripture, on client and server, from one shared pattern | settled | lib/scripture.js `CRISIS_RE`; mirrored in public/index.html |
| Crisis resources: **988** (US call/text/chat, 24/7 — VERIFIED 2026-09-06 at 988lifeline.org) and **findahelpline.com** (175+ countries — VERIFIED 2026-09-06) | settled | lib/scripture.js `CRISIS_NOTICE` |
| The product never claims to be a person, pastor, clinician, or emergency care | settled | title page, CRISIS_NOTICE, ADVISOR_SYSTEM |
| Mobile: the installable PWA **is** the mobile build (iOS/Android via Add to Home Screen). Native store wrappers are a separate decision for Dean; Flutter explorations live on other branches (#12, #13) and are not merged here | settled for now | public/manifest.json, public/sw.js |
| Static hosting: the room runs at a GitHub Pages project path (`…github.io/Ai/`) with no server; only model letters need Node | settled | public/index.html `BASE`, README § Deploy |
| Blessings are links (`/?b=<ref>&n=<note>`), verified against the corpus, nothing stored server-side | settled | README, public/index.html |
| Nothing behind the words is paywalled: His words, lectio, Seek, Seven Days, curated Advisor, journal | settled | LAUNCH.md § What must never be locked |
| Pricing when money exists: annual first, no weekly SKU | settled | LAUNCH.md |
| Evaluation: `npm run eval` must pass (50 questions, five gates) before any release; results are committed in `eval/results.md` | settled 2026-09-06 | scripts/eval.js, eval/ |

## Assumptions (labelled, correct if wrong)

- ASSUMED: the retrieval advisor is the path evaluated in CI; the model path is evaluated by running `node scripts/eval.js --url <server-with-key>` and is marked unverified until Dean does so.
- ASSUMED: an installable PWA satisfies "builds for iPhone and Android" for this stage. If store presence is required, Capacitor wrapping the existing `public/` is the reuse-the-HTML-build option; Flutter (#12/#13) is the rewrite option.

## Open questions for Dean

1. `data/red-letter-source.json` says its verse map comes from "open red-letter maps" without naming the map or its license. The map is factual (which verses are speech) and the text is KJV, but the provenance should be recorded. Name the source or authorize a rebuild from a named public-domain red-letter edition.
2. Store distribution (Capacitor vs Flutter vs PWA-only) — see Assumptions.
3. The household window in the Ninety Days plan is still unconfirmed; nothing here publishes or sends.

## Where things live

- Corpus build: `npm run spoken` → `data/spoken-gospels.json`, `public/library.json`
- Tests: `npm test` (unit + eval gates), `npm run eval` (writes eval/results.*), `npm run smoke` (live HTTP), `npm run qa` (browser, needs Chrome)
- Release checklist: `RELEASE.md`
- Design language: `DESIGN.md` · Launch plan: `LAUNCH.md` · Demo script: `DEMO.md`
