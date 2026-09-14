# Flagship 2 — Reviewer walkthrough

What a store reviewer or a skeptical friend should see in ten minutes. If any step fails, do not submit.

Last updated: 2026-09-11. This is a script, not a claim that a reviewer has already run it. No device in the Linux agent ran this.

## Setup

Install from TestFlight or the Play closed-test link. Turn on **airplane mode** for steps 1–7. Turn the radio back on only for step 8.

## 1. First launch

- Splash: “His words, for this moment.” No chatbot, no Journeys, no streak.
- Today opens on **Matthew 6:34** — “Therefore don’t be anxious for tomorrow…”.
- Order on screen, top to bottom: the Word (serif) → the citation in caps → a short crimson line (the knot) → a reflection with **no** “Reflection” label → “One honest step” and a cue.
- Fail if any other verse is the opener.

## 2. The step

- Tap **I’ll do this**. The cue becomes a committed line.
- Kill the app. Reopen. The same saying is still there (continuity). The step is still committed.

## 3. Ask — retrieve

- Ask → type `I am anxious about tomorrow` → Look.
- Result is Matthew 6:34 again. No extra generated sentence pretending to be Scripture.

## 4. Ask — stay

- Type `how do I caramelize onions for pasta night` → Look.
- The app stays. Copy includes that it will **not invent**. No verse.

## 5. Ask — refuse

- Type `make up a verse about my job interview` → Look.
- Refuse. No saying.

## 6. Ask — crisis (do this once, then stop)

- Type `I want to die tonight` → Look.
- Crisis copy names **988**. No saying. A 988 control is visible.
- Do not perform a live call in a review video if the store forbids it; the control is enough.

## 7. Saved, Settings, dark, type size

- Saved empty: “Nothing kept yet.”
- Keep today’s saying. It appears in Saved.
- Settings: **Dark saying** flips the Today page to charcoal. Order of the saying does not change.
- Settings: a **Privacy** block states on-device storage, no internet, 988 is the dialer, delete-the-app deletes data.
- System accessibility → largest text. The saying still has the same order. There is no “EXTRA LARGE” stamp.

## 8. Radio on — 988 and the widget

- Settings → 988. A phone with a dialer opens `tel:988`. An iPad / Wi-Fi tablet shows: “This device can’t place calls. From a phone, call or text 988.”
- Add the home widget. It shows Word + citation + a thread. No badge, streak, or button label.
- In the app, keep a different saying or finish a step so the widget payload writes. Return to the home screen. The widget should follow within a few seconds. If it stays on the placeholder “His words, for this moment” with an empty citation after a change, the iOS App Group is not on both targets (or Android prefs were not refreshed).

## 9. Airplane mode again

- Today and Ask still open. The pack is in the app.

## Reviewer notes you can paste

See Gate E of `FOUNDER_SHIP_KIT.md`. The app has no demo account. There is nothing to log into.

## What this walkthrough does not prove

- App Review’s own judgment.
- Play production access (that is the 12/14 closed test).
- An iOS archive (Mac only).
