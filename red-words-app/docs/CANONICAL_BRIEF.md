# Red Words — canonical brief

Version: 2026-09-11. Owner: Dean. Audience: Dean and any later agent.

## Intended outcome

A production-ready **offline Flutter app** named Red Words on iPhone and Android. One saying of Jesus (World English Bible, Gospels only), one honest step, a home-screen widget of Word + citation + thread. No backend. No chatbot. No invented Scripture.

Who it is for: a person who wants His words in the moment, and Dean as the sole founder who must get it through TestFlight and Play.

## Original requirements (Dean’s first 10 prompts)

Recovered from the 11 Sep 2026 transcript table on `cursor/recovery-flagships-bca4` (`docs/CANONICAL-BRIEF.md`). Wording is excerpted. Later Red Words amendments (WEB, no chatbot, craft law, PR 13 ship line) govern the product shape. They do not erase the founding job.

| # | Wording (excerpt) | Requirement | Later amendment |
| --- | --- | --- | --- |
| 1 | Research best-selling Christian apps, demographics, ads, and red-letter competitors. “Build an app that combines what you learned into the perfect market owning app of spreading the red words… of Jesus, getting encouragement and some guidance using his own words.” Helpful **and** commercial. Long-running. | Own the niche of His spoken words. Not a YouVersion clone. | Commercial launch waits on Dean’s Apple/Play accounts. His words stay free. This tree ships the offline Flutter book (WEB), not the Advisor chatbot. |
| 2 | “Do research on how to improve the project, then… build, then QA… and run this loop again… to hit a world class standard.” | Research → build → QA → rebuild. | Unchanged. This pass is that loop on `red-words-app/`. |
| 3 | “put on your creative design brain… impress a human… beautiful, elegant, complex in build but very simple in usage… Notion… exceed your own expectations… be ambitious.” | Paper, not chrome. Expensive to make, cheap to use. | `DESIGN.md` + bundled Source Serif 4. Crimson is speech only. |
| 4 | “Do what you feel advances this project the most.” | Pick the highest-leverage reversible move. | This pass: type + chrome that leaves + dark paper. Not a second app. |
| 5 | (same autonomy / execute signal as 4 in later threads) | Do not wait for permission on reversible craft. | Unchanged. |
| 6 | Household-level stakes. Depth over polish-for-show. | Do not ship a timid slice or a trust-burning chatbot. | Unchanged in spirit. Grocery money is not for unlicensed launches. |
| 7–9 | Merge-conflict hygiene vs `claude/jesus-teachings-chatbot-bSBhF`. Fetch first. Fix simple conflicts. Report conflicting intents. | Do not smash the Flutter book into the Advisor tree. | Binding. Do not merge PR 12 (KJV / Sit / Seek). |
| 10 | “Believe you can do more and be ambitious.” | Completeness, not a new category. | Ambition is craft and a honest store path, not Journeys or generative Jesus. |

**This-run ship prompt (2026-09-14).** “You are shipping Red Words to production-ready iPhone AND Android… If a Flutter app is already there, complete THAT.” Hierarchy: Word → citation → knot → reflection → chips → One honest step. Offline Ask. WEB 100. Widget Word + citation + thread. Hard QA. That prompt is an amendment of 1–10, not a replacement.

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
| App | `red-words-app/lib/` |
| Pack | `red-words-app/assets/sayings.json` — 100 WEB, first `anxiety-mt-6-34` |
| Android proof | `red-words-app/android/BUILD_PROOF.md` |
| Store answers | `red-words-app/STORE_ANSWERS.md` |
| TestFlight | `red-words-app/MAC-TESTFLIGHT.md` |
| Ship kit (flagship 1) | `red-words-app/docs/FOUNDER_SHIP_KIT.md` |
| Reviewer walkthrough (flagship 2) | `red-words-app/docs/REVIEWER_WALKTHROUGH.md` |
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
