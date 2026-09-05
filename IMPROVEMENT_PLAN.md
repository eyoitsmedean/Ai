# World-Class Improvement Plan

Research → gaps → build targets for The Red Letter Advisor.

## Research synthesis (what winners do)

| Source | Pattern to steal |
| --- | --- |
| Hallow / YouVersion | One clear daily ritual; streak with grace; seasonal challenges |
| YouVersion Verse Images | Shareable red-letter cards = free viral acquisition |
| Bible Chat | Suggestion chips, streaming answers, TikTok-native share moments |
| Prayer Lock / habit apps | Intent onboarding (“what brings you?”) before the home screen |
| Faith AI guidelines (2025–26) | Crisis escalation, not-a-pastor disclaimer, human care > chatbot |
| AI chat UX 2026 | Stable streaming, citation blocks, stop/regenerate, history persist |

## Audit findings (current app)

1. **Critical:** Returning users never hide onboarding — overlay stays up after first visit.
2. **Broken PWA:** `icon-192.png` / `icon-512.png` referenced but missing.
3. **API fragility:** No curated offline daily fallback; daily screen fails hard without keys.
4. **Safety gap:** No crisis resources (988) or explicit pastoral disclaimer in-flow.
5. **Growth gap:** Share is text-only — no YouVersion-style verse image card.
6. **Chat UX gap:** No new-chat, stop, or persisted history; weak empty-state hierarchy.
7. **Root `index.html`:** Stale single-file chat for Pages; diverges from `public/` app.
8. **Model config:** Hard-coded `claude-opus-5`; should be env-overridable + resilient JSON parse.

## Build targets (this iteration) — DONE

1. Fixed onboarding lifecycle + intent micro-onboarding (Peace / Guidance / Encouragement / Jesus’ Words).
2. Curated red-letter daily + encouragement fallbacks (app works with no API key).
3. Crisis safety strip (988) + pastoral disclaimer on Today + Advisor.
4. Canvas verse-share card (crimson brand) via Share on affirmation / word / encouragement.
5. Chat: persist history, new conversation, stop streaming.
6. Generated PWA icons; bumped SW cache to `rla-v2`.
7. Hardened `server.js` (validation, curated fallbacks, `/api/health`, model env, crisis detection).
8. Aligned root / Pages entry with `public/` app (static curated mode).
9. Visual polish: grace streak note, share modal, theme delegation, dark mode + font size.
10. QA loop: API smoke tests + browser QA; fixed Peace theme loading bug.

## Research loop — 30 August 2026

Sources this pass: Appfigures Hallow Lent surge; YesPress / Starter Hallow playbook; Hallow 2026 reviews (Pray40 finish rates, missed-day grace); Vesper (tryvesper.app) lectio product; HolyJot lectio UX 2026; Lectio 365 hours; ScreensDesign Bible app patterns; Chrome Notification Triggers discontinued; Periodic Background Sync as the only honest PWA daily ping.

| Finding | What we built |
| --- | --- |
| Hallow’s path unlocks by sitting; missing a day must not cascade you out | Path day increments only after lectio, next calendar morning |
| First action must be obvious; progress after value | Word is above the letterpress plate; beads mark place without shame |
| Chat should return you to the ritual | Advisor *Sit with this* opens lectio on the sealed verse |
| Vesper: resume, hour-following sky, no streak nag | Lectio draft + resume slip; vespers/night paper; quiet hour is opt-in |
| Push without a server is not reliable | Quiet hour writes prefs; periodicsync may notify if installed; missing it never fails |
| Lent is the payday; Seven is the shippable Pray40 | **Forty** — 40 red-letter rooms ready before Ash Wednesday 10 Feb 2027 |

## Build loop — 5 September 2026

| Finding | What we built |
| --- | --- |
| Forty existed only as data (28 daily words + 12 extras, sliced); it repeated itself and repeated Seven, and the room never showed it | **Forty** is bound as five quires of eight — Come · Light · Mercy · Abide · Go — opening at Matthew 11:28 and ending at John 20:21. Today renders it as a collation of beads; only the next leaf opens; a sitting keeps it |
| A reader arriving in Lent should not have to find a setting | Lent hands a new reader Forty; a reader mid-Seven is invited, never moved. Seven complete → *Begin Forty*. Path also in Room settings and ⌘K |
| The KJV corpus had dropped six verses (Matt 2:16, 22:1, 26:38; Mark 4:40, 7:11, 8:8), so later citations in those chapters were off by one — *Matthew 22:37–40* resolved to 38–41 | Restored the verses, rebuilt the spoken corpus and library, added a verse-count integrity test for all 89 chapters |
| Path data had no test | `test/paths.test.js` verifies every leaf against the corpus, forbids repeats, keeps `public/data` in sync |
| 111 of 1,923 red letters still opened with the evangelist's frame ("Then said Jesus to them again, Peace be unto you" — John 20:21), because the extractor was eleven literal regexes; the `saying` rule also cut 39 of His own sentences in half (Matthew 6:31) | Three ordered frame rules with a block guard, parable speech kept whole, `data/spoken-overrides.json` for the 41 reviewed cases, Luke 13:14 (the ruler) removed, `npm run audit` + `test/spoken.test.js` so a named frame can never ship again |
| LAUNCH named four signals and thresholds; nothing measured them, and a tracker would break "they do not feel managed, scored, or sold" | The ledger: counted on the device, read in Room settings, shared only by choice as day totals with no identifier; `/api/signal/summary` returns the four ratios and says which denominators are exact |
| Lent 2027 was asserted in prose; the client's church-year copy had no test | Server and client checked against a retrieved table for 2025–2030, 2035, 2038 |
| The room never said how the red letters are decided | Room settings: KJV red-letter tradition, John 3:16–21 set red as most KJV editions do, the citation always printed |

## Follow-ups (next iterations)

- Lectio divina (Read / Reflect / Rest / Respond) is the daily ritual — shipped.
- Forty (the Lent path) — shipped; film it in January, name the week before Ash Wednesday.
- Wire live Anthropic key in production and tune prompts against real traffic.
- Add push / local reminder for daily red letter / lectio.
- Soft freemium paywall + annual plan.
- Scripture license path for modern translations beyond KJV curated set.
- Native iOS/Android shell (Expo) for store distribution.
