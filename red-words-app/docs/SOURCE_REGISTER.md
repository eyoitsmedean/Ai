# Source register — 2026-09-11 recovery

| ID | Question | Finding | Source | Date retrieved | Confidence | Affects |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Play production for new personal accounts? | Closed test, ≥12 testers opted in 14 continuous days, then apply. | [Play Console Help 14151465](https://support.google.com/googleplay/android-developer/answer/14151465) | 2026-09-11 | High | Ship kit Gate A/C. Older “upload AAB to production” advice is retired. |
| S2 | 12 or 20 testers? | Official Help says 12. Secondary posts say Google lowered it from 20. | Same Help page; testogethr.com 2026 explainer (secondary) | 2026-09-11 | High on 12 (primary). 20 is historical. | Do not tell Dean to find 20. |
| S3 | Apple privacy in-app? | 5.1.1(i): policy URL in App Store Connect **and** within the app, easily accessible. Must state what is collected, third parties, deletion. | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | 2026-09-11 | High | Settings `PrivacyNotice`; `docs/privacy.html`. |
| S4 | 988 call + text? | Nationwide since 2022-07-16. | FCC 988 page (prior session) | 2026-09-05 | High | Copy unchanged. |
| S5 | WEB licence? | Public domain; name is a trademark for faithful copies. | worldenglish.bible (prior session) | 2026-09-05 | High | Unmodified pack. |
| S6 | `containerBackground` iOS version? | iOS 17+; unguarded fails a 15.0 target. | Multiple secondary + model; Apple page JS-blocked | 2026-09-05 | High | Already guarded on PR 13. |
| S7 | iOS prefs vs App Group? | Legacy `shared_preferences` → `UserDefaults.standard`. | flutter/packages SharedPreferencesPlugin.swift | 2026-09-05 | High | Widget channel on PR 13. |
| S8 | Play target API 2026? | New apps/updates target API 36 from 31 Aug 2026. | Play Console Help 11926878 | 2026-09-05 | High | AAB already target 36. |

## Five adjacent topics (project-level, not per-agent)

1. **Play 12/14 closed test** — chosen because it is the actual production blocker for a new personal account and was missing from every prior founder doc. Changes the week-one plan.
2. **Apple 5.1.1(i) in-app policy** — chosen because a hosted URL alone is not enough; Settings had no privacy block. Code changed.
3. **Store listing + review notes** — chosen because Dean would otherwise write them under time pressure and drift the product (chatbot language).
4. **Physical-device widget follow** — chosen because static tests cannot see a home screen. Walkthrough step 8 is the test; still unrun here.
5. **Organization vs personal Play account** — chosen because it decides whether Gate A is a 14-day wait. Unresolved until Dean looks at the Dashboard. Assumption: personal / after 2023-11-13.

## Topics retired as drift

- Sit/Seek, KJV 33, Advisor/chat PRs 24–38 on the same repo — other products. Do not merge.
- Notion “Red Words” search in Dean’s workspace returned unrelated “red”/iPhone ops pages, not this app. New draft page created rather than editing those.
