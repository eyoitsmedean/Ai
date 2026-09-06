# Red Letter on a phone — five-minute checklist

The tests, smoke, and browser QA run in a Linux VM. Reading on an actual iPhone or Android is your step. Each line is a checkbox; mark it **verified** or **failed** with one word of detail.

## Before you start (once)

- [ ] **Where is the site?** `.github/workflows/pages.yml` publishes `public/` on pushes to `main` and `claude/jesus-teachings-chatbot-bSBhF`. On 6 September 2026 `https://eyoitsmedean.github.io/Ai/` returned 404 and the Pages API reported no site. If that is still true: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**, then re-run the *Deploy to GitHub Pages* workflow. Write the live URL here: `[PAGES_URL]`
- [ ] **No public URL yet?** On a laptop on the same Wi-Fi: `npm start`, find the laptop's LAN address (`hostname -I` / `ipconfig getifaddr en0`), and open `http://<laptop-ip>:3000` on the phone. Everything below works the same, and the Advisor will use the letterpress unless `ANTHROPIC_API_KEY` is set.

## iPhone (Safari) — about 2½ minutes

- [ ] Open the URL. Paper background, ink text, crimson only where He speaks. No layout shift while fonts load.
- [ ] **Today**: morning / vespers / compline shows the right office for the hour; the saying is red, the frame is not.
- [ ] Share → **Add to Home Screen**. Open from the icon: standalone (no Safari bars), title "Red Letter".
- [ ] Airplane mode on. Reopen from the icon. **Today** and **Seek** still work. Airplane mode off.
- [ ] **Advisor**: type *I feel so much shame* → a letter with **Luke 15:4** and **Luke 15:7**, and the mark *Set without a model, from His words only* beneath it (without a key). Type *I want to die* → the 988 / findahelpline notice stands **above** any Scripture, and `988` is tappable.
- [ ] **Sit**: chrome disappears; one saying; nothing else on the page asks for attention.
- [ ] Save a letter to **Journal**, kill the app, reopen: the letter and its mark are still there.
- [ ] Dark mode (Settings → Display) — paper turns to ink, crimson stays legible.
- [ ] Settings → Accessibility → Larger Text at the largest size: nothing clips, nothing overlaps.

## Android (Chrome) — about 2 minutes

- [ ] Open the URL. Same paper, same ink, same crimson.
- [ ] Chrome menu → **Install app** (or *Add to Home screen*). Open from the icon: standalone, title "Red Letter".
- [ ] Airplane mode on, reopen: **Today** and **Seek** work. Airplane mode off.
- [ ] **Advisor**: *my mother died last week* → a letter set from Grief & Loss with two red-letter sayings and the letterpress mark. *I've been thinking about ending my life* → 988 notice first; the `tel:988` link opens the dialer prompt (do not place the call).
- [ ] Rooms switch from the bottom navigation; the system back gesture leaves the app (rooms are not history entries — expected, not a defect).
- [ ] Font size at the largest system setting: readable, no clipping.

## What a failure means

- Wrong verse text, a saying that is not His, or a narrator's words in crimson → **stop; this is a ship-stopper.** Note the citation and open an issue.
- 988 notice missing or below Scripture on a crisis message → **ship-stopper.**
- Layout, font, or install problems → note the device, OS version, and browser; these are S2.

Record the outcome in `CLAUDE.md` under the Red Letter decisions log: date, device, OS, browser, verified / failed lines.
