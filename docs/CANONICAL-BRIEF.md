# Canonical brief — Red Words native book

**Version:** 2026-09-11 recovery (v2, after source verification)  
**Audience:** Dean (builder) and any later agent. Not store copy.  
**Conversation:** six user prompts — `docs/RECOVERY.md`. Prompts 7–10 do not exist.

## Intended outcome

The existing Red Letter / Ai Gospel book, bound as a Flutter **iPhone + Android** app, reaches TestFlight Internal and Play internal testing. The home-screen widget shows **the Word only**. One archive. One store listing. Kid’s Day (2 Sep 2026, ~7:00 Boise) has passed; the ship date is “as soon as Dean archives on a Mac with Xcode 26.”

## Audience of the book

A person who wants His words for this hour — not a social graph, not a streak, not a celebrity pastor.

## Original requirements (prompt 1, recovered)

- Production-ready iPhone + Android on the **existing** repo.
- Inspect `main` and existing PRs; do not invent a second app.
- Widget = Word only (no badge, streak, CTA, or in-card app name).
- Locked identifiers (bundle, group, scheme, applicationId).
- `flutter test` as the gate this environment can run.
- PR + TestFlight / Play checklist.
- Fail-closed: empty catalog = blank page, never invented verses.
- No accounts, payments, redesign, invented verses, celebrity, gamification.
- Do not touch Storyframe or OneDigital.

## Later amendments (prompts 2–6)

- Deepen office, lectio, Seven Days, blessing, silk, printer’s mark — wow via **folio**, not a new product.
- FORGE / rebuild / sprint: finish the **operator artifact** and hollow rooms; non-destructive; QA twice; never commit to main.
- This recovery: first-ten (six exist), diagnose drift, five adjacent topics, **three flagships**, Notion when applicable.

## Current scope

**In:** Flutter book; iOS/Android widgets; App Group / SharedPreferences; SceneDelegate URL consume-once; Sit Read/Reflect/Rest/Respond (quiet minute, persisted reply); Bless Send; Seven ribbon; church-year paper; store listing copy; privacy HTML; Mac-day runbook; folio; iPhone-only family.

**Out:** Storyframe, OneDigital, Advisor-as-this-ship, Journal-as-app, payments, accounts, 40 Lent rooms, UK listing without CUP written permission, fake store submit, iPad (13″ screenshot wall), the other workstream that says “do not merge PR 12.”

## Assets (authoritative)

| What | Where |
| --- | --- |
| Book | `lib/red_words/` |
| Catalog | `assets/moments/catalog.json` via `lib/red_words/moment/catalog.dart` (7+7+12, 37 verses) |
| Widget seed | `scripts/export-widget-seed.js` → Swift/Kotlin `BEGIN_SEED` |
| Operator | `TESTFLIGHT.md` |
| Mac sitting | `docs/MAC-DAY.md` |
| Stores | `docs/STORE-LISTING.md` |
| Privacy | `PRIVACY.md`, `public/privacy.html` |
| Research | `docs/RESEARCH.md` |
| Recovery | `docs/RECOVERY.md` |
| Later agents | `docs/AGENTS.md` |
| Folio | `review/folio.html` (`npm run folio`) |
| PR | https://github.com/eyoitsmedean/Ai/pull/12 |

## Obstacles

1. This Linux VM cannot produce a signed IPA.  
2. Xcode **26** / iOS 26 SDK required for App Store Connect uploads since 28 Apr 2026.  
3. Play upload keystore not in repo (debug-signs release).  
4. Privacy HTTPS URL after Pages merge (workflow deploys `public/` from `main` / `claude/jesus-teachings-chatbot-bSBhF` only) or any other host of `PRIVACY.md`.  
5. UK KJV Crown / Cambridge — Dean decision.  
6. First Archive: confirm Embed Foundation Extensions sits above Thin Binary.  
7. Competing Notion draft from `founder-recovery-d607` — do not treat it as this brief.

## Preserve / improve / retire

- **Preserve:** identifiers, fail-closed catalog, Word-only widget, web `src/` until native replaces it in the same repo.  
- **Improve (this cycle):** Mac-day, Sit Rest/Respond, Bless Send, Seven ribbon, iPhone-only family, source-verified operator copy.  
- **Retire:** APK SHA-256 theater; Kid’s Day as a live deadline; iPad family.

## Decisions locked this cycle

| Decision | Basis |
| --- | --- |
| Archive only with Xcode 26 | Apple Upcoming Requirements, fetched 2026-09-11 |
| Sit Rest has no countdown digits | Product beat; not attested as lectio |
| Bless Send is Word + citation + `· KJV` | Craft law |
| iPhone family, not iPad | Interpreted (prompt 1 said iPhone + Android, not iPad). Avoids a 13″ screenshot wall. Android phones remain. |
| Play Data safety deferred while exclusive-internal | Play Help, fetched 2026-09-11 |
| UK is Dean’s call | CUP + IPO; store listing is commercial |
| Lent 40 is out | Adjacent topic; Ash Wednesday 2027-02-10 |

## Acceptance (observable)

- `flutter analyze` clean; `flutter test` + `npm test` green.  
- Widget before first open shows a seeded Word.  
- Sit Rest is a quiet minute without a countdown; “When you are ready.” after 60s; Respond persists for the civil day.  
- Bless Send is Word + citation + `· KJV`.  
- Seven ribbon bead opens that day.  
- Dean can archive from `docs/MAC-DAY.md` without reading the chat.

## Assumptions

- Boise / Mountain Time for “today.”  
- Catalog stays the locked KJV red-letter verses already in the JSON.  
- GitHub Pages will not serve this branch’s `public/privacy.html` until merge.

## Unresolved (Dean)

1. Host a public HTTPS privacy URL (Pages after merge, or any host of `PRIVACY.md`).  
2. Exclude United Kingdom, or email `permissions@cambridge.org`.  
3. Create a Play upload keystore off git.  
4. Install Xcode 26 and archive `0.1.0+4`.
