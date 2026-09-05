# Project lock — Red Words (iPhone + Android)

Use with `studio/DEANS-MASTERPIECE-PROTOCOL.md`.

This lock was written on **4 September 2026** after reviewing the three Red Words native chats from 2 September 2026.

**Paste this lock into those chats. It is the constitution for this product.**

---

## Project Brief

* **Project:** Red Words — commercial encouragement-first Flutter app. Brand promise: *His words, for this moment* / *His words. One honest step.*
* **Primary outcome:** Production-shaped iPhone **and** Android of the existing app, honest about what a Linux VM cannot sign. Kid’s-Day / founder-check energy: he will open it on a phone.
* **Audience:** Someone who needs one saying for this moment, offline, without an AI pastor.
* **Context:** Same repo `github.com/eyoitsmedean/Ai`. This is **not** Red Letter’s Today/Sit/Seek/Advisor web folio. Do not start a second app. Do not clone extra repos. Do not touch Storyframe or OneDigital.
* **Existing assets:** Flutter moment-engine + on-device Ask retrieve. Seed pack of **100 WEB** Gospel sayings. PRs 11, 12, 13 and earlier mobile branches. Continue the best **Red Words** line.
* **Required deliverables:** Hardened Flutter app, green `flutter analyze` + `flutter test`, Android assemble proof or an honest toolchain blocker, archive-ready iOS project, PR with a Test plan that distinguishes verified vs founder-only Mac/store steps.
* **Constraints:** Offline-first. No backend. No chatbot. No AI pastor. No invented Scripture. Daily encounter forever free. No accounts, payments, or redesign unless Dean asks.
* **Non-goals:** Importing Red Letter’s Sit/Seek rooms as home. KJV 33-saying architecture from PR 12 if you are on the PR 13 ship line. Journeys, streaks, RW initials, need-picker homepage, account wall, chat bubbles, celebrity.
* **Success:** First launch lands **Matthew 6:34**. Widget is Word only. Tests fail closed. iOS status is honest.
* **Brand:** Warm paper `#F6F0E6`, crimson `#8C1C24`, dark Saying charcoal `#1C1816`.
* **Risk:** Invented Jesus quotes are a ship-stopper. Faking an IPA on Linux is a ship-stopper. Faking store submission is a ship-stopper.
* **As-of date:** 4 September 2026.

---

## Locked product (do not reshuffle)

**Scripture:** World English Bible (WEB), public domain, Gospels only — words Jesus spoke. Reflections are not Scripture.

**Saying hierarchy (never reorder):**

1. Word (serif)
2. Citation (sans caps)
3. Crimson knot
4. Reflection (no “Reflection:” label)
5. Optional quiet chips on Ask only
6. One honest step cue

**Loop:** Splash ≤1.5s → one-stage Saying (Word + reflection) → swipe to One Honest Step → I’ll do this → tomorrow continuity.

**Tabs:** Today · Ask · Saved · Settings.

**Craft law:** Widget = Word + citation + thread. Never badge, streak, CTA, or in-card app name.

**First launch:** Matthew 6:34. Do not invent a different opener.

---

## Locked identifiers (do not invent new ones)

| Item | Value |
| --- | --- |
| Xcode workspace | `ios/Runner.xcworkspace` |
| iOS app bundle | `com.redwords.redWords` |
| Widget extension | `RedWordsWidget` |
| iOS widget bundle | `com.redwords.redWords.RedWordsWidget` |
| App Group | `group.com.redwords.redWords` |
| URL scheme | `redwords` → `redwords://today` |
| Display name | Red Words |
| iOS deployment | 15.0 (Runner + widget) |
| pubspec version | `0.1.0+1` (bump build number only if you produce an uploadable IPA) |

Android `applicationId` must not stay an unexplained `com.redwords.red_words` / label `red_words`. Display name is **Red Words**. Document any Play-required snake_case and fix the user-visible label.

---

## What Dean already told these chats

1. Production-ready for **both** iPhone and Android. Be hard on QA.
2. Inspect current default branch and open mobile PRs first. Continue the real app.
3. [Red Words iOS+Android ship](https://cursor.com/agents/bc-77a3cafc-3f0f-47a8-8f1c-a315b89bc2d6) and [production](https://cursor.com/agents/bc-8a7c91b4-9d95-42b8-a1fd-1d4da36f820b) may run in parallel — if they opened a PR, build on it instead of forking a third architecture.
4. Independent hard QA already found holes. Fix them. Do not rewrite from scratch. Do not break the green suite.
5. **PR 12 is not the ship line** if you are on PR 13: PR 12 is Today/Sit/Seek on 33 KJV sayings. Locked product is WEB 100, Mt 6:34 first, Today/Ask/Saved/Settings, One Honest Step.
6. Finish: analyze + full test counts on the PR, Android assemble log proof, pbxproj widget target, R8, 988 `tel` queries, Red Words label, not debug-signing for release (placeholder keystore + docs). Honest iOS: blocked on Mac unless you actually have a Mac.

---

## Sibling work — do not collide

| Chat | Branch / PR | Role |
| --- | --- | --- |
| [Red Words iOS+Android hard QA](https://cursor.com/agents/bc-7dd9f8e0-513b-402b-9429-a2632015d607) | `cursor/red-words-production-d607` · **PR 13 draft — ship line** | WEB 100, Ask, widget pbxproj, R8, 988 queries |
| [Red Words iOS+Android ship](https://cursor.com/agents/bc-77a3cafc-3f0f-47a8-8f1c-a315b89bc2d6) | `cursor/red-words-native-c2d6` · PR 12 | Different IA (Sit/Seek, KJV 33). Do not merge that product into PR 13. |
| [Red Words iOS+Android production](https://cursor.com/agents/bc-8a7c91b4-9d95-42b8-a1fd-1d4da36f820b) | empty transcript | Dead start. Ignore. |
| Red Letter web chats | PRs 7–11 | Different product. Do not import folio rooms into Flutter home. |

---

## Known defects that must stay fixed

From the 2 September hard QA (verify current tree; do not regress):

* iOS WidgetKit sources must have a real **pbxproj extension target**
* Android label **Red Words**; icon adaptive / real mipmaps
* Release signing placeholder + README for Dean’s keystore; R8/ProGuard on
* Android `<queries>` for `tel:988` plus a test that constructs the intent (do not fake a call)
* Tests for knot Y-order, Gospel-book whitelist, Ask jailbreak/sexual refuse
* No invented verses; no extra “EXTRA LARGE” stamp

---

## Quality gates for this lock

* `flutter analyze` clean
* Full `flutter test`; add tests for any bug you find; fail closed
* Android: `assembleRelease` or honest SDK/Java/keystore blocker, with log proof
* iOS: archive-ready project; **do not fake a compile on Linux**; leave a precise TestFlight checklist
* Manual checklist in the PR: first launch, return visit, Ask no-retrieve, Ask refusal, empty Saved, load fail, dark mode, Dynamic Type/XL, home widget, airplane mode
* Fail the PR if the Scripture pack is missing, verses are invented, Saying hierarchy is reshuffled, streaks/chat/Journeys appear, or Android build fails for a reason you papered over

---

## Success rubric

1. **Scripture integrity** — 100 WEB Gospel sayings, no invention, Mt 6:34 first
2. **Product lock** — Today / Ask / Saved / Settings and Saying hierarchy intact
3. **Widget craft** — Word only; deep-link `redwords://today`
4. **Both platforms** — Android proven or honestly blocked; iOS archive-ready or honestly blocked
5. **Hard QA** — empty, first-open, offline, refuse paths, 988
6. **One architecture** — PR 13 ship line, not a third fork
7. **Honest release notes** — verified vs founder-only store steps
8. **No costume production** — no fake IPA, no fake Play upload
