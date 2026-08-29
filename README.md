# Red Letter

A quiet reading room for the **words Jesus actually spoke**.

Not another Bible app. A daily companion constrained to the red letters of Matthew, Mark, Luke, and John — typeset like a small press, simple like a blank page.

## The room

- **Today** — a morning affirmation and word of the day, quoted in crimson
- **Seek** — twelve encouragement rooms (anxiety, grief, forgiveness…)
- **Advisor** — a short correspondence; scripture is verified against a Gospel corpus
- **Journal** — a commonplace book kept on this device

Quoted verses are checked against the public-domain **King James Version** (1769). If the model paraphrases, the page prints the canonical text instead.

This is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US) · [IASP](https://www.iasp.info/suicidalthoughts/).

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
```

## Design

The interface is a folio, not a feed. Chrome whispers. The only loud color is the red letter. Desktop uses a sidebar like a studio notebook; the phone keeps a thin mast and a dock. Share exports a printed card.

## Deploy

- **App (Node):** serve this repo with `npm start`.
- **GitHub Pages:** the workflow publishes `public/`. Today and Seek work from `curated.json`. Advisor needs the API host.

KJV text is public domain. Attribution is printed beside citations.
