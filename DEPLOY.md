# Deploying Red Letter

Two hosting shapes are supported. Pick one; both are exercised by the QA suites.

## A. Railway / Docker (full app: PWA + live Advisor)

1. Deploy from `Dockerfile` (`railway.json` already points at it; healthcheck is `/api/health`).
2. Set environment variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes for live Advisor | — | Without it `/api/daily` and `/api/encouragement` serve the corpus and `/api/chat` returns 503; the app shows saved words. |
| `ANTHROPIC_MODEL` | no | `claude-opus-5` | Pinned model ID. |
| `ANTHROPIC_EFFORT` | no | `low` | `output_config.effort`. Opus 5 thinks by default; `low` is the documented setting for chat-style replies. Raise to `medium` only if you also raise `max_tokens` in `server.js`. |
| `ALLOWED_ORIGINS` | only for shape B | — | Comma-separated origins allowed to call `/api/*` cross-origin, e.g. `https://eyoitsmedean.github.io`. Unset = same-origin only. |
| `PORT` | no | `3000` | Railway injects this. |

3. Watch logs for `stop_reason=max_tokens` warnings. None expected at `low`; if they appear, raise `max_tokens` in `modelParams()`.

## B. GitHub Pages front end + Railway API

Pages serves `public/` from `main` at `https://<user>.github.io/Ai/`. It has no `/api`, so:

1. Deploy shape A first and copy its public origin (e.g. `https://red-letter.up.railway.app`).
2. In `public/index.html` set

   ```html
   <meta name="rla-api-base" content="https://red-letter.up.railway.app" />
   ```

   `base.js` then routes every `/api/*` fetch to that origin; assets stay relative.
3. On Railway set `ALLOWED_ORIGINS=https://<user>.github.io`. The server answers `OPTIONS` preflights with `Access-Control-Allow-Origin: <origin>` and `Vary: Origin`; other origins get no header.
4. Leave the meta empty and the Pages build is a corpus-only demo; the Advisor toast says "isn't on this host" rather than "offline".

## Cache versioning

Every asset URL carries `?v=N` and the service worker cache is `rla-vN-chapel`. Bump both together (`sed -i 's/?v=14/?v=15/g' public/index.html public/sw.js` and the `CACHE` constant). Installed clients pick the new worker up within the hour (`reg.update()` runs hourly) or on next launch.

## iOS notes (verified against WebKit sources)

- Safari deletes a site's LocalStorage/IndexedDB/SW cache after 7 days without a visit **in a Safari tab**. Home Screen web apps are exempt. The Journal page shows a one-time nudge to install or back up when this applies; Settings → Journal backup exports/restores a JSON file.
- `display_override`, `orientation`, `beforeinstallprompt` are ignored on iOS; `display: standalone` and manifest `icons` are honored.
- Installed iOS with `viewport-fit=cover` under-reports `dvh`/`visualViewport.height` by the safe-area (WebKit 254868); the shell uses `100vh` in standalone.

## Android notes

- Richer install sheet needs a `narrow` screenshot with aspect ≤ 2.3 — `screenshot-narrow.png` is 1170×2532 (2.16).
- `speechSynthesis.pause()` cancels on Android; Listen shows **Stop** there.

## QA

Playwright suites live outside the repo during development (`/tmp/rla-qa/*.cjs`) and write results to `/opt/cursor/artifacts/red-letter-review/qa-wave{1,2,3}.json`. Run the server with `ALLOWED_ORIGINS=https://eyoitsmedean.github.io node server.js` before wave 3.
