# Red Words — store listing (paste-ready)

**Use.** App Store Connect + Play Console. Written 2026-09-11.  
**Sources.** Recovered brief; `DESIGN.md`; Apple screenshot specifications (App Store Connect Help, fetched 2026-09-11); App Review Guidelines 4.2, 1.1.5, 5.1.1(i) (fetched 2026-09-05).  
**Do not put** Roumie, The Chosen, Hallow, streaks, or “AI Bible” in this listing.

## Name

Red Words

## Subtitle (30 characters)

His words, for this moment.

## Promotional text (170 characters)

A quiet page for the words Jesus spoke. Today, Sit, Seven Days, and a home-screen card that is the sentence only — no badge, no streak.

## Description

Red Words is a bound book on your phone for the sentences Jesus spoke in Matthew, Mark, Luke, and John.

Each morning the page turns to one Gospel sentence. Sit walks Read, Reflect, Rest, and Respond. Seven Days is Come, Peace, Light, Love, Forgive, Abide, Go — a missed day is never a failure. Seek holds twelve rooms. Bless is one cream leaf you can send.

The home-screen widget is the Word only: the sentence and its address. No badge. No streak. No app name on the card. Tap it and you are in Today.

The words stay on this device. There is no account and no feed. Quoted verses are the King James Version (1769), locked to a corpus the app cannot invent.

This is not a person, and it is not therapy. In the United States: 988, call or text.

## Keywords (100 characters, comma-separated)

Jesus,Gospel,KJV,devotional,prayer,verse,Matthew,John,offline

(61 characters.)

## Category

Lifestyle (primary). Reference optional.

## SKU / primary language

SKU: `red-words`. Primary language: English (US).

## Copyright

© 2026 Dean Ray. Scripture quotations: King James Version (1769).

## Support URL

The GitHub repo until you have a site: `https://github.com/eyoitsmedean/Ai` — or your hosted privacy page.

## Availability

Exclude the **United Kingdom** at first release, *or* have written permission from Cambridge University Press (`permissions@cambridge.org`). Do not enable iPad.

## Age rating (2026 questions)

Answer from what the app actually is: a quiet Gospel reader. No user-generated public content. No violence-as-gameplay. Religious text only. No accounts. No chat with strangers.

## Review notes (paste into App Review)

All Scripture is the King James Version (1769), quoted verbatim from a locked Gospel corpus. The app cannot display a verse that is not in that corpus. The home-screen widget shows the sentence and citation only. No account, no analytics. Share and 988 open the system sheet or dialer; Gospel text and Sit replies are not uploaded. Privacy policy: [paste your hosted URL]. United Kingdom is excluded pending CUP permission (or attach the permission letter).

## Privacy nutrition / Data safety

Data Not Collected. Nothing is transmitted off the device. A first-open flag and an optional one-sentence reply stay in local storage. The widget’s seven-slot rotation is the Word only.

Play’s Data safety form is **not required** while the app lives only on the internal testing track. Complete it (all No) before closed, open, or production.

## Screenshots

Apple (fetched 2026-09-11 from [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)): the required iPhone class is **6.9" Display**. Accepted portrait sizes: **1260×2736**, **1290×2796**, **1320×2868**. One to ten images. No alpha. This binary is **iPhone-only** (`TARGETED_DEVICE_FAMILY = 1`) and portrait-only. Do not enable iPad in App Store Connect unless you also shoot a 13" set (2064×2752).

Paste-ready strings live in `docs/store/listing.json` (lengths checked by `test/store-listing.test.js`).

Draft frames, rendered by `flutter test --dart-define=STORE_SHOTS=true test/store_frames_test.dart`, are widget-test images at the accepted pixel sizes. They are not photographs of a phone. 988 is in the frame because it is on every leaf. Do not typeset a caption on top.

| # | Room | iOS 6.9" (1290×2796) | Play phone (1080×1920) |
| --- | --- | --- | --- |
| 1 | Title | `docs/store/ios-6.9/01-title.png` | `docs/store/play-phone/01-title.png` |
| 2 | Today | `docs/store/ios-6.9/02-today.png` | `docs/store/play-phone/02-today.png` |
| 3 | Sit · Rest | `docs/store/ios-6.9/03-sit-rest.png` | `docs/store/play-phone/03-sit-rest.png` |
| 4 | Seven Days | `docs/store/ios-6.9/04-seven.png` | `docs/store/play-phone/04-seven.png` |
| 5 | Seek | `docs/store/ios-6.9/05-seek.png` | `docs/store/play-phone/05-seek.png` |
| 6 | Bless | `docs/store/ios-6.9/06-bless.png` | `docs/store/play-phone/06-bless.png` |

Play feature graphic draft (1024×500): `docs/store/play-feature.png`.

**Still a phone.** Shot 6 in the original list is the home-screen **Word** widget (sentence + citation only). This VM cannot capture WidgetKit or an Android home screen. Replace `06-bless` with that home-screen photo before a public listing, or add it as a seventh image and keep Bless.

## What 4.2 is looking for

Guideline 4.2 rejects apps that are “simply a book.” These screenshots are the proof you are not: a daily engine, Sit, a seven-day path, twelve rooms, a widget that turns itself at midnight. Do not lead the listing with the widget alone.
