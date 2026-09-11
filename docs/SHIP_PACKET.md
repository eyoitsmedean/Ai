# Ship packet — what to do with Red Letter tonight

You can use the room on a phone without launching anything. Nothing here asks you to publish, spend, or submit.

## The three flagships (this cycle)

| # | Deliverable | Where | Who uses it |
|---|---|---|---|
| 1 | Canonical brief + recovery table | `docs/CANONICAL_BRIEF.md` | You, or the next agent, before touching code |
| 2 | The second human door (abuse / present danger) | the running app + eval 47–50 | A writer who types that they are being hurt |
| 3 | This packet | `docs/SHIP_PACKET.md` | You, in the next twenty minutes |

Research that shaped them: `docs/RESEARCH.md`.

## How to run it (two minutes)

```bash
cd /path/to/Ai
git checkout cursor/recovery-commission-fbba   # or merge the PR into forty-path
cp .env.example .env                           # add a key only if you want the live lamp
npm install
npm start                                      # http://localhost:3000
```

On a phone on the same network: `http://YOUR-LAN-IP:3000`.

Without a key the Advisor still writes. After five *live* letters the room still writes.

## How to check it (the brief’s definition of done)

| Brief item | Status | What you run |
|---|---|---|
| 1. Cites His words from the corpus | **verified** on the offline path | `npm test` · `npm run eval` |
| 2. Warm advisor, scholarship behind | **verified** offline; **unverified** on the model path | Read `eval/RESULTS.md` tone column after a keyed eval |
| 3. ≥40 questions including crisis | **50 questions**; offline was 46/46 (2026-09-06); abuse 47–50 new | `npm run eval` |
| 4. iOS / Android builds | **unverified** (no Xcode here) | `RELEASE.md` checklist — your step |
| 5. Nothing called passed that was not run | **held** | `RELEASE.md` |

## Do not merge from other agents tonight

Open PRs from other running chats (Spanish, RAINN-on-another-branch, share cards, omitted sayings) are **other lines**. Ideas can be copied under test. Merging them raw will fork the corpus and the detectors.

This line: `cursor/forty-path-fbba` ← `cursor/advisor-sprint-fbba` (#33) ← `cursor/recovery-commission-fbba` (this PR).

## First three useful actions

1. **Open the room on your phone.** Type “I can’t stop worrying about money.” Then “My husband hits me when he’s drunk.” You should see thehotline **before** any verse, and you should not see Matthew 5:44.
2. **If you have an Anthropic key:** put it in `.env`, run `npm run eval`, read the tone column of `eval/RESULTS.md` as the writer would. That is the only remaining check on definition-of-done #2.
3. **Leave the store alone.** No Pages enable, no Capacitor submit, no paid switch. If you want a public URL later, pick a Node host and write to Cambridge before any UK paid tier.

## If you have twenty more minutes

`RELEASE.md` — five-minute on-device checklist (cold open, sit, advisor, blessing, airplane mode, ledger, safe areas). Write *verified on &lt;device&gt;* or the defect.

## Blockers that are not code

- No production host (your decision).
- No model key in this environment (your key).
- No Xcode / Android SDK here (your machines).
