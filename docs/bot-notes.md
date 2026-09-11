# Bot working notes — Red Letter Advisor — sprint 2026-09-11

Worker: Cursor cloud agent · owns Advisor safety + server letter layer · 2026-09-11

## Five priorities this sprint

1. Paywall must not block a carried safety disclosure (S1).
2. Assault modal shows RAINN; passport/coercive-control detection (S2).
3. Live-path persona / stay-advice guard (`lib/guard.js`) (S2).
4. Extract letters / prompts / report out of `server.js`.
5. Crisis-modal a11y, SSE parse harden, D12/D13, cache v18.

## What ran

- `npm test` after the patches (count recorded in RELEASE.md of this commit).
- `npm run check`.
- `npm run eval` against a local no-key server (count recorded in eval/RESULTS.md).

## Left for Dean

- Live-model eval (`ANTHROPIC_API_KEY`, OQ2).
- Physical-device walk (`docs/DEVICE-CHECKLIST.md`).
