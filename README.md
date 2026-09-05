# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

## The room

- **Today** — morning, vespers, or compline; hear the office; a catchword stays until dawn
- **Seek** — twelve encouragement rooms, plus **The letters**: a searchable library of every spoken saying, turned like leaves
- **Sit** — read a saying, rest one minute while the words arrive, reply with one sentence
- **Advisor** — a short correspondence that survives the day; scripture is verified against a Gospel corpus before it is written on the page
- **Journal** — a commonplace book kept on this device, with a quire of words you have sat with

Quoted verses are checked against the public-domain **King James Version** (1769). The Advisor first retrieves allowed sayings, then the model may emit only `{{John 14:27}}` placeholders. The harness inserts the spoken corpus text, so the model never types the verse. Daily and encouragement JSON are requested as structured output, then verified the same way.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com).

## Run it

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
```

Without an API key the room still opens: Today and Seek use curated, corpus-verified pages; the Advisor replies with a small verified letter.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
```

```bash
npm test
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). `GET /api/library` searches grouped sayings; GitHub Pages falls back to `public/library.json`.

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** `npm start` on any host with Node 18+. Bind is `0.0.0.0`. HTTPS belongs on the reverse proxy.
- **iPhone:** Safari → Share → Add to Home Screen. The room opens standalone. His words stay on the phone. This is also what keeps the journal: WebKit deletes a site's script storage after seven days of Safari use without a visit, and home-screen apps are exempt ([webkit.org/tracking-prevention](https://webkit.org/tracking-prevention/)). The room asks for persistent storage after the first kept sit and offers Settings → **Keep a copy** as a no-account backup.
- **Android:** Chrome → Install app / Add to Home screen. Same paper, same corpus.
- **Privacy policy:** `/privacy` — link it in App Store Connect → App Information → Privacy Policy URL and in Play Console → Data safety. It is also reachable in-app from Settings without an account (Guideline 5.1.1(i)).
- **Store shells:** `npx cap add android` and `npx cap add ios`, then `npm run android` / `npm run ios`. The WebView loads `public/`. Chat works offline from the curated Advisor; a live key is optional.
- **GitHub Pages:** the workflow publishes `public/`. Today and Seek work from `curated.json`. Blessing pages and the Advisor API need the Node host.

A blessing is a URL (`/b/…`) — one cream page, no install wall.

KJV text is public domain in most of the world. In the United Kingdom, printing or importing the Authorised Version is a Crown prerogative administered by Cambridge University Press; a *sold* printed chapbook shipped into the UK needs CUP permission. Attribution (KJV) is printed beside citations.
