# Working in this repo

Read this before you branch. It applies to every agent — Cursor, Claude, Copilot, anyone.

Red Letter is a quiet reading room for the words Jesus spoke. The owner is a new parent. The product is finished enough; what it needs is fewer versions of itself, not more.

## One trunk

- Trunk is `claude/jesus-teachings-chatbot-bSBhF`. Every PR targets trunk.
- Do not stack a PR on another open PR. If the work you need is not on trunk yet, stop and say so.
- Do not open a PR that restates, re-plans, or "recovers" another agent's work. Improve trunk or leave it.
- One PR does one thing a person would notice. No charters, cycles, dossiers, cockpits, or process folios in this repo.
- Before you start, list open PRs. If one already covers your change, stop.

## Hold — never without Dean saying so in writing

- No public launch, store submission, TestFlight, or native build (no Flutter, Expo, or Xcode work).
- No new deploy targets. Pages deploys trunk only.
- No emails, waitlist outreach, ads, purchases, or messages sent on anyone's behalf.
- No paywall or pricing change. Never a weekly price. His words are never locked.

## The words

- Quote only the spoken words of Jesus from Matthew, Mark, Luke, and John.
- Text comes from the bundled corpus (`data/spoken-gospels.json`, KJV). The model emits `{{Book C:V}}` placeholders; the harness inserts the text. Never let a model type a verse.
- Allowed translations: KJV and WEB (US public domain). Nothing else without a license on file.
- Label every quote with its reference and translation. No invented sayings. No prosperity overlay. No political mascot.
- It is software, not a person. Never "Ask Him", never "AI Jesus".

## Crisis

- `CRISIS_PATTERN` in `lib/scripture.js` is the one detector. The page and `data/advisor.js` carry copies; `npm test` fails if they drift. Change all three together.
- On crisis input: name 988 and findahelpline.com, then stop generating counsel. The model is not called.
- A crisis line on every screen stays. That is not optional.

## Before you push

```bash
npm test
npm start &            # then:
npm run smoke          # API + shell
CHROME_PATH=/opt/pw-browsers/chromium npm run qa   # first session in a real browser
```

Bump `CACHE` in `public/sw.js` when you change anything under `public/` that the service worker precaches.
