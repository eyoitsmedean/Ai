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

## Follow-ups (next iterations)

- Lectio divina (Read / Reflect / Rest / Respond) is the daily ritual — shipped.
- Wire live Anthropic key in production and tune prompts against real traffic.
- Add push / local reminder for daily red letter / lectio.
- Soft freemium paywall + annual plan.
- Scripture license path for modern translations beyond KJV curated set.
- Native iOS/Android shell (Expo) for store distribution.
