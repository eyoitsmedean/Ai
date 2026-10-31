# Guest Leaf — sit with this tonight

Dean: this is the locked product on a cream page. No Flutter, no Xcode, no Play. A person can open it on any phone in a minute.

Not a second app. Same spine: splash → Word → citation → knot → reflection → One honest step in their own words → optional Amen → “You said you'd ___”. Ask is on-device retrieve. 988 is a phone link.

## One file (AirDrop this)

`RedWords.html` is the same leaf with the pack and the serif inside it. No server. No install.

Rebuild after a pack change:

```bash
python3 red-words-app/tool/build_guest.py
python3 red-words-app/tool/build_one_file.py
```

Open the file in Safari or Chrome. Add to Home Screen if you want it on the phone.

## Open the folder instead

From the repo, on this computer:

```bash
cd red-words-app/guest
python3 -m http.server 8765
```

Then open `http://localhost:8765` — or, on a phone on the same Wi-Fi, `http://<this-computer-ip>:8765`.

Safari → Share → Add to Home Screen. Chrome → Install app. The leaf stays on the phone.

Or open `index.html` as a file. The pack is in `pack.js`; the serif is `../fonts/`.

## What a guest should do (eight minutes)

1. Arrive. Splash is the promise, not a chatbot.
2. Today is Matthew 6:34. Order: Word, citation, knot, reflection. No “Reflection:” label.
3. One honest step — their words — I’ll do this — Amen if they want it.
4. Kill the tab. Reopen. “You said you'd ___”.
5. Ask “I am anxious about tomorrow.” Same saying. Ask a recipe. It stays. Ask to invent a verse. It refuses.

Between guests: Settings is local only. Clear site data, or use a private window (`?` is enough if they use a fresh profile).

## Store frames

`store-frames/` is six 1290×2796 listing images (iPhone 6.7"), rendered from the same WEB line and type. Paste into App Store Connect / Play. Rebuild:

```bash
python3 red-words-app/tool/render_store_frames.py
```

## Rebuild the pack

```bash
python3 red-words-app/tool/build_guest.py
```

That copies `assets/sayings.json` into `guest/pack.js`. Do not invent verses here.
