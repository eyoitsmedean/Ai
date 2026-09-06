# The Red Letter Advisor — system of record

This file is the system of record for product decisions. Read it before designing anything.
Append; do not rewrite history. Entries are dated. Labels: VERIFIED · SOURCED · KNOWLEDGE · INFERRED · ESTIMATED · ASSUMED · PROPOSED.

## Mission

Ship the Red Letter Advisor as a production-ready, chat-first advisor that applies Jesus's own words from the four Gospels to modern life situations.

Audience: someone carrying a real question about their life, often at a low moment, on a phone. They want a warm, direct answer within seconds, with verse citations they can check.

## Decisions (settled — build on them)

| # | Decision | Status | Recorded |
| --- | --- | --- | --- |
| D1 | Name: **The Red Letter Advisor** | settled (Dean) | before 2026-09 |
| D2 | Palette: parchment and crimson | settled (Dean) | before 2026-09 |
| D3 | Advisor-first product, not a scholarship tool. Scholarship sits behind the answer. | settled (Dean) | before 2026-09 |
| D4 | Scope is **Jesus's words only** (Matthew, Mark, Luke, John) — not the whole Bible | settled (Dean) | before 2026-09 |
| D5 | Translation: **World English Bible (WEB)**, public domain. Every shipped quote is machine-verified against WEB source text (`npm run verify:corpus`); nothing is quoted from memory. | settled | 2026-09-05 |
| D6 | Mobile stack: **PWA built from the existing HTML** is the shipped mobile build (installable on iOS 16.4+ and Android; Web Push from the installed app). Store listing, if wanted later, wraps the same `public/` directory with Capacitor — no rewrite. See "Mobile stack" below. | ASSUMED default per brief ("default to the one that reuses the existing HTML build unless I say otherwise") | 2026-09-06 |
| D7 | A citation outside the four Gospels is **never** shown as verified, even when bible-api has the text. It is labelled "not Jesus's words". | settled | 2026-09-06 |
| D8 | Safety handoffs (suicide/self-harm, abuse) are **deterministic** — pattern-gated on the server before any model call and before the paywall. They never consume a free credit and can never be blocked by a 402. | settled | 2026-09-06 |
| D9 | Off-scope requests (code, trivia, finance, medical dosing, homework, weather, jokes) get a warm redirect with **no verse forced onto them**. Hostile input gets a non-defensive reply with 1–2 passages and "no pressure". | settled | 2026-09-06 |
| D10 | Corpus mode (no AI key, or model failure) is a first-class path, not an error: theme opener → 3 hand-curated lead passages with a true one-line "why" each → gentle close. | settled | 2026-09-06 |
| D11 | The evaluation set (`eval/questions.json`, 53 questions) runs in CI in strict mode; a regression in any category blocks the merge. | settled | 2026-09-06 |
| D12 | Grace over streaks: no streak counters, no guilt mechanics. Presence is shown, never scored. | settled (earlier session) | 2026-09-01 |

## Mobile stack — two options considered (D6)

| | A. PWA from the existing HTML (**default**) | B. Capacitor wrapper of the same `public/` |
| --- | --- | --- |
| What ships | `public/` served over HTTPS; users Add to Home Screen | Native iOS/Android shells loading the same files; store listings |
| Reuses current build | 100% | ~100% (API base URL must be absolute; add `capacitor.config`) |
| Builds here | Yes — served and smoke-tested in this repo's CI | No — needs Xcode / Android Studio on Dean's machine |
| Push | Web Push (iOS 16.4+ installed app; Android Chrome) — implemented | Native push via plugin — not implemented |
| Store presence | None | App Store + Play (review, fees, Apple Developer Program) |
| Cost | $0 | Apple $99/yr (KNOWLEDGE — confirm at developer.apple.com), Google $25 once (KNOWLEDGE) |
| Verdict | Ship now | Add only when a store listing is a stated goal |

React Native / Expo rewrite was rejected: it discards the verified HTML build and would re-open every UI and a11y check already passed.

## Evidence ledger (load-bearing claims)

| Claim | Label | Source | Checked | If wrong |
| --- | --- | --- | --- | --- |
| WEB is public domain: "you may freely copy it in any form, including electronic and print formats"; the name is a trademark usable to identify faithful copies | VERIFIED | https://worldenglish.bible/ ("About the World English Bible") | 2026-09-06 | Translation choice and store distribution would need re-licensing |
| bible-api.com: default translation WEB; free "as long as you don't abuse my server"; rate limit **15 requests / 30 s per IP**; no availability guarantee; suggests self-hosting the open data | VERIFIED | https://bible-api.com/ (Terms of Use) | 2026-09-06 | Fallback verifier could be throttled; product must not depend on it (it doesn't — corpus is local) |
| 988 Suicide & Crisis Lifeline: call/text 988, 24/7, free, confidential (US) | VERIFIED | https://988lifeline.org/ | 2026-09-06 | Crisis copy would need a new number |
| National Domestic Violence Hotline: 1-800-799-7233, text START to 88788, chat at thehotline.org, 24/7 | VERIFIED | https://www.thehotline.org/ | 2026-09-06 | Abuse copy would need a new number |
| IASP suicide resources page is live | VERIFIED (HTTP 200) | https://www.iasp.info/suicidalthoughts/ | 2026-09-06 | Replace international link |
| HotPeachPages lists abuse agencies by country | VERIFIED | https://www.hotpeachpages.net | 2026-09-06 | Replace international DV link |
| Web Push works for Home Screen web apps on iOS/iPadOS 16.4+; no Developer Program membership required | VERIFIED | https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ | 2026-09-06 | Reminder feature copy on iOS would be wrong |
| Capacitor drops into an existing web app given package.json, a web assets dir, and index.html; `npx cap add ios/android`, `npx cap sync` | VERIFIED | https://capacitorjs.com/docs/getting-started (v8) | 2026-09-06 | Option B effort estimate changes |
| Fonts Fraunces, Source Serif 4, Figtree are OFL-1.1 | VERIFIED | GitHub API `license.spdx_id` for undercasetype/Fraunces, adobe-fonts/source-serif, erikdkennedy/figtree | 2026-09-06 | Font swap needed for commercial use |
| `web-push` is MPL-2.0; `express` is MIT | VERIFIED | `npm view <pkg> license` | 2026-09-06 | Dependency swap |
| Anthropic SDK license permits app use | KNOWLEDGE (MIT) — not re-checked this session | — | — | Confirm at github.com/anthropics/anthropic-sdk-typescript before store submission |
| Every shipped quote (102 corpus + 28 inline client) is verbatim WEB | VERIFIED (130/130) by `scripts/verify-corpus.js` against bible-api WEB | 2026-09-06 (re-run, exit 0) | — | Corpus text would need `--fix` |

## Third-party material

- Scripture: World English Bible — public domain (ledger row 1). Attribution kept in README and app footer.
- Fonts: Google Fonts (OFL-1.1) loaded from fonts.googleapis.com.
- Verification API: bible-api.com — hobby service, no SLA; used only as a fallback verifier for Gospel citations outside the local corpus.
- Runtime: Express (MIT), web-push (MPL-2.0), @anthropic-ai/sdk (KNOWLEDGE: MIT), cors (MIT), dotenv (BSD-2, KNOWLEDGE).

## Assumptions (correct in ten seconds)

- ASSUMED: D6 default (PWA) stands until Dean says a store listing is a goal.
- ASSUMED: US hotlines first, international directory second — the audience is primarily US (brief did not say).
- ASSUMED: Quality references (brief left "<Dean to name two apps>" blank) — treated as Hallow (time to first useful screen) and YouVersion (verse presentation) from KNOWLEDGE; no feature copied.
- ASSUMED: Free tier of 5 Advisor conversations/day; "Plus" paywall copy exists but no payment processor is wired (nothing to spend without sign-off).

## Open — only Dean can decide

1. Store listing (Option B) — yes/no. Default: not now.
2. Two quality-reference apps to match on time-to-first-answer and warmth.
3. Production hostname and ANTHROPIC_API_KEY for a model-mode eval run (`npm run eval` against the deployed URL).
4. Whether the app should open on the Advisor tab rather than Today. The brief says "chat-first"; the current build opens on Today (daily red letter) with the Advisor one tap away. Flagged, not changed (protocol §1.6).

## Known risks / what went wrong before

- Product intent was inverted once (scholarship-first). D3 exists because of it.
- Parallel file edits raced during 2026-09-06 and silently dropped a block; the build was caught by `node -e "require(...)"` and re-applied. Run the syntax check after every edit batch.
- bible-api.com rate limit (15/30 s) makes `verify:corpus` slow (~5 min) and CI-advisory only.

## Log

- 2026-09-01 — Encounter (cinematic daily open) and Living Garden shipped. Grace over streaks (D12).
- 2026-09-02..05 — Production hardening: PWA manifest/icons/splash, SW offline, Web Push, threads, voice input, Lighthouse fixes, corpus expanded 55 → 102 and machine-verified (D5), README, CI.
- 2026-09-06 — ATELIER pass: Gospel-only scope guard (D7), deterministic safety/off-scope/hostile gate before paywall (D8, D9), corpus-mode tone (D10), evaluation set 53/53 in corpus mode (D11), this file, RELEASE.md.
