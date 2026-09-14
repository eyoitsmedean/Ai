# Phone review — household only

**Bearing:** C1, C5 · **Summit:** Reach  
**WATCH.** This is not a public URL and not a store build.

## What it is

A way to sit with `/ask` on a phone that is on the same Wi-Fi as the laptop running Node. No Pages. No tunnel. No store.

## What to do

1. On the laptop: `npm start`. The log should print `Red Letter /ask → http://localhost:3000/ask`.
2. Find the laptop’s LAN address (macOS/Linux: `ipconfig getifaddr en0` or `hostname -I`). Example: `192.168.1.20`.
3. On the phone, same Wi-Fi: open `http://192.168.1.20:3000/ask`.
4. Sit with: a tired line · a crisis line · an abuse line. Confirm 988 / NDVH and **no verse** on the last two.
5. Optional: `/gate` to record WEB vs KJV-US on that browser; `/letter` to print one saying.

If the phone cannot reach the laptop, the OS firewall is the usual cause. Do not “fix” that by enabling GitHub Pages.

## What this is not

Not a deploy. Not Idaho “available to the public.” Not authorization to publish.

## Verification

Written 2026-09-14. I did **not** open Dean’s phone. LAN steps are ordinary household networking (MODEL-KNOWLEDGE for the `ipconfig`/`hostname` commands). Browser QA (`npm run qa`, 390×844) is a script in this repo; whether it was re-run after this cycle’s edits is recorded in `docs/lodestar/SHIP.md`, not here.
