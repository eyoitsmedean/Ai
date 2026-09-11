# Ship package — what Dean does next

This is the usable handoff. The product is a PWA. You are the only person who can finish the three things an agent cannot: deploy with your key, run the live-model eval, and walk a real iPhone and a real Android.

**Do not skip the order.** The first item makes the other two possible.

---

## First three actions

### 1. Deploy the API (about 15 minutes if Railway is already connected)

1. Merge or deploy branch `cursor/sprint-safety-modules-4ba9` (PR against `cursor/world-class-red-letter-4ba9`) using `DEPLOY.md` section A.
2. Set `ANTHROPIC_API_KEY` on the host. Leave `API_ACCESS_KEY` unset (the browser does not send one).
3. Confirm the log line `✝ The Red Letter Advisor` and `GET /api/health` returns ok.
4. Open the deployed URL on your laptop once so the service worker can install.

Without this, the Advisor on a phone is retrieval-only (still safe; not the product you want to review).

### 2. Live-model eval (OQ2) — about 20 minutes

On a machine that has the key:

```bash
ANTHROPIC_API_KEY=… RATE_LIMIT_OFF=1 node server.js
# other terminal
npm run eval
```

Commit the regenerated `eval/RESULTS.md`. The file must say it ran the **live model** path. Any FAIL row is a release blocker. Do not hand-edit the table.

### 3. Device checklist, blockers first — about 10 minutes

Print or open `docs/DEVICE-CHECKLIST.md`. On **each** phone, prove these three things before anything else (iPhone rows 5, 6, 8; Android rows 3 and 6):

| Check | What you are proving |
|---|---|
| Danger modal | `tel:1-800-799-7233` opens the dialer; continue → letter starts with the hotline and never says stay. |
| Crisis modal | 988 opens the dialer. |
| Offline after a disclosure | Airplane Mode → reopen from the Home Screen icon. Today still opens. After a danger or crisis continue, the reply is the **same fixed letter + numbers**, not a WEB “Forgiveness” or “Peace” pack. |

Then finish the rest of the sheet. Tick **ok** / **fail (what you saw)**. Steps 5 and 6 are release blockers.

---

## What you are reviewing (the three flagships)

| # | What | Where | How to use it |
|---|---|---|---|
| 1 | Offline safety pack | `public/data/safety-pack.json` + `public/js/app.js` `offlineReplyFor` | After a modal, turn on Airplane Mode and send (or continue). The letter must match the online one. |
| 2 | Canonical brief + research | `docs/CANONICAL-BRIEF.md`, `docs/RESEARCH.md` | Brief = what we are building and why. Research = evidence for numbers, licences, pastoral rules, PWA. |
| 3 | This ship package | `docs/SHIP.md` | Your checklist. |

Letter wording was not rewritten. If a sentence in a safety letter feels wrong, say so; do not let an agent paraphrase it.

---

## What already passed here (do not re-run unless you change code)

Recorded in `RELEASE.md` after this cycle’s commands. Typical:

- `npm test`
- `npm run check`
- `npm run eval` on a **no-key** server (retrieval path)
- `npm run smoke` against a local port

Live-model and physical-device rows stay **UNVERIFIED** until you run them.

---

## Decisions that stay settled

See `CLAUDE.md` D1–D13. In one line: advisor-first, red-letter only, model never types a verse, PWA, fixed letters for crisis/danger/assault, cache version bump is atomic (`?v=19` + `rla-v19-chapel`).

Open: OQ1 (KJV→WEB before paid UK), OQ2 (this package, action 2), OQ3 (Capacitor later).

---

## If something fails on a phone

Write: step number, phone model, OS version, what you saw. Put it on the PR. Do not “fix forward” steps 5 or 6.

If Airplane Mode after a disclosure shows a Forgiveness pack or a Peace pack, that is a **regression of D12** — reopen the safety-pack path (`offlineReplyFor`, `public/data/safety-pack.json` in the service worker cache).

---

## Helplines to glance at before you flip

| Open | Expect |
|---|---|
| https://988lifeline.org/ | 988 still listed |
| https://988.ca/ | Canadian 9-8-8 |
| https://www.thehotline.org/ | 1-800-799-7233 / START 88788 |
| https://rainn.org/help-and-healing/ | 1-800-656-4673 — **blocked from the build agent**; you can open it |
| https://www.samaritans.org/ | 116 123 |
| https://www.lifeline.org.au/ | 13 11 14 |

If a number has changed, stop the release and change `lib/scripture.js` notices, `public/js/crisis.js`, the About sheet, and `npm run safety-pack` together.
