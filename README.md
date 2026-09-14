# Red Words

**His words, for this moment.**

A bound book on the phone for the sentences Jesus spoke in Matthew, Mark, Luke, and John. The home-screen widget is the Word only — sentence and citation, no badge, no streak, no app name on the card.

This is the existing Ai Gospel / Red Letter corpus. It is not a second app.

## On a Mac (the ship)

One sitting: **[`docs/MAC-DAY.md`](docs/MAC-DAY.md)**. Version `0.1.0+6`. Archive with **Xcode 26**.

- Listing paste: [`docs/STORE-LISTING.md`](docs/STORE-LISTING.md)
- Runbook: [`TESTFLIGHT.md`](TESTFLIGHT.md)
- Privacy (host this at HTTPS): [`PRIVACY.md`](PRIVACY.md) / [`public/privacy.html`](public/privacy.html)
- Brief for later work: [`docs/CANONICAL-BRIEF.md`](docs/CANONICAL-BRIEF.md)

```bash
flutter pub get
flutter test
npm test
```

- Workspace: `ios/Runner.xcworkspace` — bundle `com.redwords.redWords`
- Widget: **Word** / `RedWordsWidget` (`com.redwords.redWords.RedWordsWidget`)
- App Group: `group.com.redwords.redWords`
- Deep link: `redwords://today`
- iPhone only. Android `applicationId`: `com.redwords.red_words`

```bash
flutter build apk          # debug-signed in this repo — not a Play upload
flutter build appbundle    # same signing until you point at an upload keystore
node scripts/export-moments.js   # refresh assets/moments/catalog.json from lib/curated.js
```

Quoted verses are the King James Version (1769). The KJV is public domain outside the United Kingdom. In the UK, rights in the Authorized Version are vested in the Crown and administered by Cambridge University Press — decide UK availability before first release.

This is not a person, and it is not therapy, medical care, or pastoral counseling. In crisis: [988](tel:988) (US, call or text) · [Find A Helpline](https://findahelpline.com).

## The book

- **Today** — one Gospel sentence; the office name follows the civil clock
- **Sit** — Read, Reflect, Rest (a quiet minute, no countdown), Respond (one sentence on this device)
- **Seven Days** — Come, Peace, Light, Love, Forgive, Abide, Go. A missed day is never a failure
- **Seek** — twelve rooms
- **Bless** — one cream leaf; Send is the Word, not the brand
- **Word** widget — bundled seven; rotates at local midnight

Empty catalog = a blank page. Nothing is invented to fill the silence.

## Web room (same corpus, not this archive)

The Node folio is still in this repo. It is not the TestFlight binary.

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY if you want live generation
npm install
npm start              # http://localhost:3000
```

Without an API key, Today and Seek still open from curated pages. Advisor and Journal live here, not in the Flutter book.

```
ANTHROPIC_API_KEY=     # or ANTHROPIC_AUTH_TOKEN
ANTHROPIC_MODEL=claude-opus-5
PORT=3000
API_ACCESS_KEY=        # optional gate for /api/*
```

```bash
npm run spoken   # rebuild data/spoken-gospels.json and public/library.json
```

The spoken corpus is `data/spoken-gospels.json` (KJV Gospels × `data/red-letter-source.json`). GitHub Pages publishes `public/` from `main` and `claude/jesus-teachings-chatbot-bSBhF`.
