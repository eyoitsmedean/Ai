# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

## The room

- **Today** — morning, vespers, or compline; hear the office; a silk ribbon follows the church year; a catchword stays until dawn
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves
- **Sit** — lectio in four leaves: Read → Reflect → Rest (one minute) → Respond
- **Advisor** — a short correspondence that survives the day; scripture is verified against a Gospel corpus before it is written on the page
- **Journal** — a commonplace book kept on this device: compose a line, export Markdown, print the book

Quoted verses are checked against the public-domain **King James Version** (1769). The Advisor first retrieves allowed sayings, then the model may emit only `{{John 14:27}}` placeholders. The harness inserts the spoken corpus text, so the model never types the verse. Without an API key the same retrieval writes the letter. Daily and encouragement JSON are requested as structured output, then verified the same way.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com).

## Run it

Needs Node 20+.

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://0.0.0.0:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor retrieves a fitting letter from the spoken Gospels.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
TRUST_PROXY=1          # set this behind Railway, Render, nginx, or any reverse proxy
API_ACCESS_KEY=        # optional gate for /api/*
```

```bash
npm test
npm run smoke    # against a running server
npm run qa       # first-session browser walk (needs Chrome)
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`.

`GET /api/health` reports version, saying count, and whether Anthropic is configured. Placeholder keys such as `your_api_key_here` are treated as unset.

`GET /api/daily?date=YYYY-MM-DD` uses the reader's local calendar, not UTC.

`/?fresh=1` or Settings → **Begin again** wipes `rla-*` storage on this device.

`/?b=John%2014:27&n=For%20you` is a blessing. It opens the room on a leaf with the note and the verse, then turns to the title page or Today. The reference is looked up in the spoken corpus (`/api/verify`, or `library.json` when static); anything outside Matthew–John is dropped, and the note is capped at 140 characters. Nothing is stored server-side. **Send a blessing** builds this link, shares it with the card on a phone, and copies it on a desktop.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card. Seven Days (Come, Peace, Light, Love, Forgive, Abide, Go) sit in the margin. You never have to name the church year.

## Deploy

- **App (Node):** `npm start`. Bind `0.0.0.0`. Set `TRUST_PROXY=1` behind a load balancer so rate limits see the real client. Health check: `GET /api/health`.
- **GitHub Pages:** the workflow publishes `public/` from `main`. Today, Seek, the spoken library, the Advisor (curated letters), and blessing links all work without the Node host; assets, `manifest.json`, and `sw.js` resolve relative to the folio, so a project URL such as `…github.io/Ai/` works. The landing lives at `welcome.html`. Only rate-limited model letters need Node.
- A process manager can use the included `Procfile` (`web: node server.js`).

KJV text is public domain. Attribution is printed beside citations.
