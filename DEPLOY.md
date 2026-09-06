# Deploying Red Letter

Two hosting shapes are supported. Pick one; both are exercised by the QA suites.

## A. Railway / Docker (full app: PWA + live Advisor)

1. Deploy from `Dockerfile` (`railway.json` already points at it; healthcheck is `/api/health`).
2. Set environment variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes for live Advisor | — | Without it every route still answers with verified KJV pages: Today and Seek from the curated rotation, the Advisor with a short letter retrieved for the question. |
| `ANTHROPIC_MODEL` | no | `claude-opus-5` | Pinned model ID. |
| `ANTHROPIC_EFFORT` | no | `low` | `output_config.effort`. Opus 5 thinks by default; `low` is the documented setting for chat-style replies. Raise to `medium` only if you also raise `max_tokens` in `server.js`. |
| `ALLOWED_ORIGINS` | only for shape B | — | Comma-separated origins allowed to call `/api/*` cross-origin, e.g. `https://eyoitsmedean.github.io`. Unset = same-origin only. |
| `API_ACCESS_KEY` | no | — | Requires `X-Api-Key` on every `/api/*` call. The browser app never sends one, so setting this turns the deployment into a private API for scripts; leave unset for the public PWA. |
| `PORT` | no | `3000` | Railway injects this. |

3. Watch logs for `stop_reason=max_tokens` warnings. None expected at `low`; if they appear, raise `max_tokens` in `modelParams()`.
4. Trust the proxy: `app.set('trust proxy', 1)` is on so Railway's `X-Forwarded-For` gives the rate limiter real client addresses. If you front the container with a second proxy, raise the hop count.

### What the server guarantees

- The Advisor model never types a verse. It emits `{{John 14:27}}` markers from an allow-list retrieved for the question; the server substitutes the recorded KJV text as tokens stream and holds back any unfinished `{{` so the page never shows a half-filled marker.
- Every letter ends with two extra SSE frames: `replace` (the authoritative letter) and `verify` (per-citation verdicts). The page seals passages from that verdict; the on-device WEB index is only used for offline replies.
- Daily and encouragement JSON are requested as structured output and verified the same way; a pack that loses passages to verification falls back to the curated page.
- `npm test` (48 tests, run by `.github/workflows/ci.yml` on every push) covers routes, verification, streaming hold-back and the church-year calendar.

## B. GitHub Pages front end + Railway API

Pages serves `public/` from `main` at `https://<user>.github.io/Ai/`. It has no `/api`, so:

1. Deploy shape A first and copy its public origin (e.g. `https://red-letter.up.railway.app`).
2. In `public/index.html` set

   ```html
   <meta name="rla-api-base" content="https://red-letter.up.railway.app" />
   ```

   `base.js` then routes every `/api/*` fetch to that origin; assets stay relative.
3. On Railway set `ALLOWED_ORIGINS=https://<user>.github.io`. The server answers `OPTIONS` preflights with `Access-Control-Allow-Origin: <origin>` and `Vary: Origin`; other origins get no header.
4. Leave the meta empty and the Pages build is a corpus-only demo (WEB text from `public/data/corpus.json`); the Advisor toast says "isn't on this host" rather than "offline".

## Cache versioning

Every asset URL carries `?v=N` and the service worker cache is `rla-vN-chapel`. Bump both together (`sed -i 's/?v=15/?v=16/g' public/index.html public/sw.js` and the `CACHE` constant). Installed clients pick the new worker up within the hour (`reg.update()` runs hourly) or on next launch.

## iOS notes (verified against WebKit sources)

- Safari deletes a site's LocalStorage/IndexedDB/SW cache after 7 days without a visit **in a Safari tab**. Home Screen web apps are exempt. The Journal page shows a one-time nudge to install or back up when this applies; Settings → Journal backup exports/restores a JSON file.
- `display_override`, `orientation`, `beforeinstallprompt` are ignored on iOS; `display: standalone` and manifest `icons` are honored.
- Installed iOS with `viewport-fit=cover` under-reports `dvh`/`visualViewport.height` by the safe-area (WebKit 254868); the shell uses `100vh` in standalone.

## Android notes

- Richer install sheet needs a `narrow` screenshot with aspect ≤ 2.3 — `screenshot-narrow.png` is 1170×2532 (2.16).
- `speechSynthesis.pause()` cancels on Android; Listen shows **Stop** there.

## QA

- `npm test` — node:test suites (routes, corpus, retrieval, safety detectors, fake-SDK stream path).
- `node scripts/smoke.js https://your-host` — nine endpoint checks against a deployed server.
- `npm run eval` — the 57-question evaluation set against a running server (`--url` for a remote host). The product rate limit is 10 letters a minute per client; the runner waits the window out and retries, or start a local server with `RATE_LIMIT_OFF=1` to run the set in seconds. Never set `RATE_LIMIT_OFF` in production — the boot log warns when it is on.
- `docs/DEVICE-CHECKLIST.md` — the five-minute pass on a real iPhone and Android phone.
- `RELEASE.md` — what has actually been verified for this build, and what has not.

Playwright suites live outside the repo during development (`/tmp/rla-qa/*.cjs`) and write results to `/opt/cursor/artifacts/red-letter-review/qa-wave{1,2,3}.json`. Run the server with `ALLOWED_ORIGINS=https://eyoitsmedean.github.io node server.js` before wave 3.
