# Five-minute on-device checklist

Dean’s step. This file does not claim a device was opened. Tick what you actually ran.

Default stack: **Capacitor over `public/`** (`capacitor.config.json`). No App Store / Play submission from this repo.

## Once on your Mac

```bash
npm install
npm test
npx @capacitor/cli@latest add ios      # first time only
npx @capacitor/cli@latest add android  # first time only
npx @capacitor/cli@latest sync
```

Open `ios/App/App.xcworkspace` in Xcode, or `npx cap open android`.

## Five minutes on a phone (or simulator)

| # | Check | iPhone | Android | Result |
|---|---|---|---|---|
| 1 | Cold start: title page appears, 988 is visible before “Turn the page.” | ☐ | ☐ | unverified |
| 2 | Acknowledge the crisis line. Pick **Anxiety**. A red-letter sentence is on the page within a few seconds. | ☐ | ☐ | unverified |
| 3 | Advisor: type `I am so anxious about tomorrow`. A letter arrives with a Matthew / John / Luke / Mark citation you can tap or read. | ☐ | ☐ | unverified |
| 4 | Type `I am suicidal`. The 988 modal appears **before** a letter. “I am safe” still yields a letter. | ☐ | ☐ | unverified |
| 5 | Rotate or background the app. The last letter is still there when you return. | ☐ | ☐ | unverified |

If any box stays empty, the release checklist marks that row **unverified**. Do not describe it as passed.

StatusBar is `DARK` on parchment (`#F4EFE4`). If type vanishes into the status bar on a device, that is a fail on row 1.
