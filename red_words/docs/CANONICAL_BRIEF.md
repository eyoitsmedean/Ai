# Red Words — canonical brief

Version: 2026-09-11. Owner: Dean. Audience: Dean and any later agent.

## Intended outcome

A production-ready **offline Flutter app** named Red Words on iPhone and Android. One saying of Jesus (World English Bible, Gospels only), one honest step, a home-screen widget of Word + citation + thread. No backend. No chatbot. No invented Scripture.

Who it is for: a person who wants His words in the moment, and Dean as the sole founder who must get it through TestFlight and Play.

## Original requirements (user prompts 1–3, this run)

Recovered from the conversation transcript of [this agent](https://cursor.com/agents/bc-7dd9f8e0-513b-402b-9429-a2632015d607). Eight user prompts exist in the thread, not ten.

| # | Wording (excerpt) | Requirement | Later amendment |
| --- | --- | --- | --- |
| 1 | “You are shipping Red Words to production-ready iOS and Android. Be hard on QA.” Locked product: WEB, Gospels only, hierarchy Word → citation → knot → reflection → chips → One honest step. Offline Ask. No invented Scripture. | Ship the existing product, hard QA, one PR. | — |
| 2 | “Do not rewrite from scratch. Fix these production holes…” Widget pbxproj target; Android id/label; release signing + R8; adaptive icon; 988 `tel` queries + tests; knot/Gospel/refuse tests; honest iOS. | Fix listed holes. Keep analyze + tests green. | — |
| 3 | “PR 12 just landed… do NOT merge or copy its product.” Today/Sit/Seek on 33 KJV. “Keep your draft …/pull/13 as the ship line.” | PR 13 is the ship line. Fail if KJV/Sit-Seek is taken. | — |
| 4 | “Build Baby Build” | Execute, do not plan. | Repeated as the operating signal. |
| 5–6 | FORGE / Universal Rebuild | Research then build; do not paper over widget/988/iOS 17 holes. | Widget channel, 988 fallback, iOS 17 guard shipped on PR 13. |
| 7 | “pick 5 priorities and push” | Ask retriever rebuild. | PR 36. |
| 8 | This recovery commission | Recover intent, finish what Dean can actually use. | This document. |

## Current scope

- `red_words/` on `cursor/red-words-production-d607` ([PR 13](https://github.com/eyoitsmedean/Ai/pull/13)) + Ask rebuild on `cursor/ask-retriever-rebuild-d607` ([PR 36](https://github.com/eyoitsmedean/Ai/pull/36)) + this recovery branch.
- Identifiers: iOS `com.redwords.redWords`, widget `com.redwords.redWords.RedWordsWidget`, App Group `group.com.redwords.redWords`, URL `redwords://today`, Android `com.redwords.redwords`, label Red Words.

## Explicit exclusions

- PR 12 product (KJV 33, Today/Sit/Seek).
- Streaks, chat, Journeys, badges, widget CTAs.
- Invented verses, citations, or red-letter text.
- Faking an iOS compile on Linux.
- Merging to main without Dean.

## Existing assets (authoritative)

| Asset | Where |
| --- | --- |
| App | `red_words/lib/` |
| Pack | `red_words/assets/sayings.json` — 100 WEB, first `anxiety-mt-6-34` |
| Android proof | `red_words/android/BUILD_PROOF.md` |
| Store answers | `red_words/STORE_ANSWERS.md` |
| TestFlight | `red_words/TESTFLIGHT.md` |
| Ship kit (flagship 1) | `red_words/docs/FOUNDER_SHIP_KIT.md` |
| Reviewer walkthrough (flagship 2) | `red_words/docs/REVIEWER_WALKTHROUGH.md` |
| This brief (flagship 3 spine) | this file |

## Main obstacles

1. **No Mac in this environment** — iOS archive unproven. Residual, not fakeable.
2. **No device** — widget follow and `tel:988` unobserved.
3. **Play production lock for new personal accounts** — closed test, **12 testers opted in for 14 continuous days**, then apply (Play Console Help 14151465, retrieved 2026-09-11). Earlier docs omitted this.
4. **Privacy URL is founder-hosted** — Apple 5.1.1(i) also requires the policy **inside the app**. In-app copy is now in Settings (`PrivacyNotice`). The public URL is still Dean’s to host (`docs/privacy.html`).
5. **Placeholder keystore** — not Play-uploadable.

## Preserve / improve / retire

- Preserve: pack, hierarchy, product lock tests, widget channel, 988 fallback, PR 13 identifiers.
- Improve: founder path (this kit), in-app privacy, Ask retriever (PR 36).
- Retire: any instruction that says “upload AAB to production tomorrow” without the 12/14 closed test.

## Acceptance criteria (observable)

- `flutter analyze` clean; `flutter test` all pass.
- First launch Matthew 6:34; Gospels only; no invented Scripture.
- Settings shows the privacy notice without a network.
- Ship kit names the 12/14 Play rule with the official Help URL.
- Reviewer walkthrough matches the running UI.
- iOS compile remains labeled blocked on Mac.

## Assumptions

- Dean’s Play account is a **personal** account created after 13 Nov 2023 until he confirms otherwise. If it is an organization account, the 12/14 rule may not apply — check the Dashboard.
- Dean can host `docs/privacy.html` on any HTTPS URL (GitHub Pages is enough).
- “Build Baby Build” means ship the founder path, not invent a second product.
