# Red Letter Advisor

A faith-based progressive web app that offers guidance drawn **only from the words Jesus spoke** in Matthew, Mark, Luke, and John — quoted from the public-domain World English Bible (WEB), and verified against it before anything is shown.

One red letter a day. Grace over streaks. Installable on iPhone and Android as a home-screen app.

## What the product promises, and how the code keeps the promise

| Promise | Mechanism | How to check it |
| --- | --- | --- |
| Every quote is Jesus' words, verbatim WEB | `data/red-letters.js` is the curated corpus; every passage and every inline client quote is machine-checked against the WEB source text | `npm run verify:corpus` (130/130 verbatim as of this commit: 102 corpus passages + 28 inline client quotes) |
| The Advisor never invents scripture | Model output is passed through `groundAdvisorText()`: each `**Book c:v**` citation is looked up in the corpus, then bible-api (WEB); the quoted line is replaced with the verified text and flagged ✓ WEB or "check" | Ask the Advisor anything and inspect the citation badges |
| Works without AI | With no `ANTHROPIC_API_KEY`, or when the model errors before answering, the Advisor replies from the verified corpus by theme | Start without a key, or with an invalid one |
| Crisis-safe | `detectCrisis()` short-circuits to 988 / IASP resources before any model call | Type a crisis phrase in the Advisor |

## Run locally

```bash
npm install
cp .env.example .env        # optional: add ANTHROPIC_API_KEY for the AI Advisor
npm start                    # http://localhost:3000  (landing at /welcome)
```

Without an API key the app runs in **corpus mode**: daily word, Seek, Library, share cards, and Advisor replies all come from the verified corpus.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | Enables the AI Advisor, daily reflections, and encouragement. Absent → corpus mode. |
| `ANTHROPIC_MODEL` | `claude-opus-5` | Model id for the Advisor. |
| `FREE_CHAT_LIMIT` | `5` | Free Advisor conversations per client per day (in-memory). |
| `PORT` / `HOST` | `3000` / `0.0.0.0` | Bind address. |
| `NODE_ENV` | — | `production` enables HTTPS redirect (behind a proxy) and HSTS. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | generated once | Web Push keys. Generate with `npx web-push generate-vapid-keys`. |
| `VAPID_SUBJECT` | `mailto:hello@redletter.app` | Contact for push services. |
| `PUSH_STORE` | `data/push-store.json` | Where push subscriptions persist. Point at a persistent volume in production. |

## Deploy

The server is a single Node 18+ process serving static files and a small API. Any HTTPS host works; HTTPS is required for installability and Web Push.

**Railway** (config in `railway.toml`): connect the repo, set `ANTHROPIC_API_KEY` and the two VAPID keys, add a volume mounted at `/data` and set `PUSH_STORE=/data/push-store.json`. Health check: `/api/health`.

**Docker**:

```bash
docker build -t red-letter .
docker run -p 3000:3000 -e NODE_ENV=production -e ANTHROPIC_API_KEY=... \
  -e VAPID_PUBLIC_KEY=... -e VAPID_PRIVATE_KEY=... \
  -v red-letter-data:/data -e PUSH_STORE=/data/push-store.json red-letter
```

**Any PaaS with a Procfile**: `web: node server.js`.

After deploying, run the smoke suite against the live URL:

```bash
node scripts/smoke.js https://your-domain
```

### Install on phones

- **iPhone (Safari):** Share → Add to Home Screen. Morning reminders via Web Push work from the installed app on iOS 16.4+.
- **Android (Chrome):** the in-app install banner appears from the second day; or Chrome menu → Install app.

This is a PWA, not an App Store / Play listing. `public/.well-known/assetlinks.json` is a stub for a future Play Trusted Web Activity.

## Quality gates

| Command | What it checks |
| --- | --- |
| `npm test` (`scripts/smoke.js`) | 17 live checks against a running server: health, corpus APIs, grounded chat SSE, security headers, manifest installability, icons/splash, offline route, Web Push lifecycle, service-worker handlers, red-letter purity lint |
| `npm run verify:corpus` | Every shipped quote vs. WEB source text (network). `--fix` rewrites drifted quotes to the exact WEB wording. |
| `npm run icons` | Regenerates all icon and splash assets from `public/icon-1024.png` (needs Python 3 + Pillow). |

Last measured with Lighthouse (mobile, throttled): app `/` — Performance 94, Accessibility 100, Best Practices 100, SEO 100; landing `/welcome` — 98 / 100 / 100 / 100.

## Architecture

```
server.js               Express: security headers, gzip, rate limits, API, Web Push scheduler
data/red-letters.js     Curated WEB red-letter corpus (102 passages, 12 themes)
data/scripture.js       Verification + grounding: corpus → bible-api (WEB) → unverified flag
public/index.html       The app (single file: styles, markup, and client logic)
public/sw.js            Service worker: offline shell, update banner, push + notification click
public/manifest.json    PWA manifest (id, scope, maskable icons, shortcuts, screenshots)
public/offline.html     Offline fallback page
index.html              Marketing landing page served at /welcome
scripts/                smoke.js, verify-corpus.js, generate-icons.py
```

Client state (journal, saved Advisor conversations, settings, garden) lives in `localStorage` on the device. Server state (quotas, rate limits) is in memory and resets on restart; push subscriptions persist to `PUSH_STORE`.

## Known limits

- Quotas and rate limits are per-process and in memory; a multi-instance deployment needs a shared store.
- The AI Advisor has not been exercised end-to-end in this repository's CI (no API key); its failure path to corpus mode is tested.
- bible-api.com is used only as a fallback verifier for citations outside the curated corpus; if it is unreachable, such citations are shown as "check" rather than ✓ WEB.

## Scripture

Scripture quotations are from the World English Bible, which is in the public domain.
