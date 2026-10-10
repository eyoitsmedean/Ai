# Hide It in Your Heart: listing kit

Everything needed to launch **Hide It in Your Heart: a memory game for the words of Jesus**. The game is one self-contained file, `dist/hide-it.html` (about 260 KB). It runs in any modern browser, works offline, and keeps progress on the player's own device.

## Which way to launch

There are two good routes. Pick one; running both at once means charging for something that is also free.

| Route | What it is | Best for |
|---|---|---|
| **A. Free web game (recommended first)** | Host the file at a Red Letter web address. Anyone can play on a phone or computer, no sign-up. | Growing an audience for the paid Red Letter products (Table Talk, Forty Days). A daily memory game brings people back every day, which no printable does. |
| **B. Paid download** | Sell the file plus a one-page Start here PDF on Payhip or Gumroad, and on Etsy as a digital download. | Earning from the game itself once there is an audience that already trusts the brand. |

**Why A first.** A memory game is used a few minutes a day, mostly on phones. A link is the easiest thing to share in a church group chat, and a phone can open a link but cannot easily open a downloaded HTML file. Free play builds the email list and the reviews that make Route B (and the other products) sell.

**Hosting for Route A.** Rename `dist/hide-it.html` to `index.html` and upload it to any static host: Netlify (drag and drop), Cloudflare Pages, or a GitHub Pages repository of its own. It makes no network requests, so hosting costs nothing at this size. Players can choose Add to Home Screen on their phones.

**Collecting emails for Route A.** The game itself has no sign-up form, and it should stay that way so it feels like a gift. Put the game on a simple page with a short line under it: "Want a new saying each week? Join the Red Letter letter." Payhip and Gumroad can also list the game as a free ($0+) product that asks for an email address and delivers the same files as Route B.

**Platforms for Route B.**

| Platform | Why |
|---|---|
| **Payhip or Gumroad** | Lowest fees, accepts an HTML file directly, supports pay-what-you-want, and can send buyers a link to a hosted copy for phone play. |
| **Etsy (digital download)** | Shoppers already search for "bible memory verse" and "scripture memory" products there. Etsy buyers mostly expect printables, so the description says plainly that this is a browser game and how to open it. |

The Game Crafter and MakePlayingCards are not a fit for this product as it stands. A physical memory-card deck would be a separate product.

## Price

- **Route A: free.** It is a lead magnet. Its job is to bring people to the Red Letter email list and shop.
- **Route B: $5 one-time.** Scripture memory printables on Etsy (verse cards, memory journals) mostly sell in the $3 to $10 range, and memory apps usually charge a subscription. A single $5 purchase for 55 sayings, four practice modes and spaced review, with no ads and no account, sits comfortably in that range. Check current Etsy listings before setting the final figure.
- **Launch: $4** for the first two weeks to collect early reviews.
- **Pay what you want on Payhip (optional):** minimum $0, suggested $5, if you prefer to keep the game free while letting people support it.
- **Church or group license: $20.** Lets one church, school or small group share the file with its members. Payhip lets you sell this as a separate product with its own license text.

## Etsy title (under 140 characters)

```
Bible Memory Verse Game, Words of Jesus KJV, Scripture Memorization, Christian Digital Download, Offline Browser Game
```

## Etsy tags (13, each 20 characters or fewer)

```
bible memory verse
scripture memory
memory verse game
words of jesus
kjv bible verses
bible game
christian game
scripture game
bible study tool
red letter
lords prayer
beatitudes
christian gift
```

## Description

```
Learn the words of Jesus by heart, a few minutes a day.

HIDE IT IN YOUR HEART is a quiet memory game with 55 sayings of Jesus from the King James Version. You practice each saying four ways, then it comes back for review right before you would forget it.

A few of the sayings:
• "Peace, be still." (Mark 4:39)
• "Come unto me, all ye that labour and are heavy laden, and I will give you rest." (Matthew 11:28)
• "I am the good shepherd" (John 10:11)
• "Let not your heart be troubled" (John 14:1)

FOUR WAYS TO PRACTICE
1. Read: read it aloud, then hide it and bring it back a phrase at a time.
2. Fade: each round hides a few more words. Tap a blank to peek.
3. First Letters: type the saying from memory with only first letters showing.
4. Build: tap the shuffled words in the right order.

REVIEW THAT FITS YOUR MEMORY
Once you know a saying, it comes back tomorrow, then in a few days, then a week, then two weeks, then a month. A daily streak keeps you going, and two grace days a week mean one missed day does not undo your progress.

SEVEN COLLECTIONS
First Words (9) · The Beatitudes (7) · I Am (7) · Comfort (9) · Prayer, including the Lord's Prayer line by line (8) · Love One Another (8) · Seek First (7)

DETAILS
• Every saying is checked word for word against the red-letter text of the King James Version
• Capitals and punctuation never count against you; small typos are forgiven, while old words like thee, hath and shalt are spelled as written
• No account, no ads, no internet needed after download. Nothing is sent anywhere: progress stays in your browser on your device
• Light and dark themes, large readable type, works with a keyboard and screen readers
• Good for personal devotion, families, homeschool, Sunday school and small groups

WHAT YOU GET (instant download)
• hide-it.html: the game, one file. Double-click to open it in Chrome, Edge, Firefox or Safari on a computer
• Start here PDF: how to open it, how to play, and how your progress is saved

PLEASE NOTE
This is a digital download. No physical item will be shipped. The game runs in a web browser and works best on a computer or tablet; progress is saved in the browser you use, so open it the same way each time.
For personal and household use. Please do not share or resell the file. For a church or group license, send a message.
This is a memory aid for personal devotion. It is not a substitute for a church community, pastoral care or professional counseling.
```

If you host a copy for phone play (see the notes), add this line under WHAT YOU GET: "• A private link to play on your phone".

## Files buyers receive

| Upload | Source | Size |
|---|---|---|
| `hide-it.html` | `dist/hide-it.html` | about 260 KB |
| `hide-it-start-here.pdf` | `listing/hide-it-start-here.pdf` | about 160 KB |

Etsy accepts up to five files per digital listing, 20 MB each. If a platform refuses a bare `.html` file, zip the two files together:

```
cd products/hide-it && zip -j -X hide-it.zip dist/hide-it.html listing/hide-it-start-here.pdf
```

The Start here PDF only includes a phone section if you build it with the hosted address, for example `HIDEIT_URL=play.example.com node listing/build-listing.js`. Without it, the PDF covers computer use only.

**Listing images**, in this order (2000 x 2000 px, built from real screenshots of the game):

1. `listing/1-cover.png`: title and three phones (Fade, First Letters, Build)
2. `listing/2-four-modes.png`: the four practice modes on one saying
3. `listing/3-review.png`: a review card, the progress page and the review schedule
4. `listing/4-whats-inside.png`: the sayings list on a computer, the seven collections, a dark-mode phone

The progress screens use a sample save (about two weeks of play, 15 sayings started). Those numbers are an illustration, not a claim about what any player will reach. For Route A, the same images work on the landing page and on Pinterest.

## Launch plan

| When | Do |
|---|---|
| Day 1 | Host the game (Route A). Make a simple page around it with the email line. Test it on an iPhone and an Android phone: open, practice one saying, close the browser, reopen, and check progress is still there. |
| Day 1 | List it free ($0+) on Payhip with the same images and description, so there is a downloadable copy that collects emails. |
| Week 1 | Share the link where self-promotion is allowed: church and homeschool parent groups, Sunday school teacher forums, your own social accounts. One short message: what it is, that it is free, and one screenshot. |
| Week 1 to 4 | Pin each listing image on Pinterest ("bible memory verse", "scripture memory for kids", "Lord's Prayer memory") linking to the game page. |
| Every week | Email the list one saying from the game, with a link back. Mention one paid Red Letter product every few weeks. |
| September and January | The two best seasons: back-to-school and Sunday school start, and New Year's resolutions ("memorize scripture this year"). Lent is a third. |
| After 2 to 3 months | If the free game has a steady audience, decide on Route B: either keep it free and add a $20 group license, or list the paid download on Etsy and Payhip at $5 and take the free copy down. |

## Good to know

- **Scripture copyright.** The King James Version is in the public domain in the United States. In the United Kingdom it remains under Crown patent, administered through Cambridge University Press, so selling KJV text to UK buyers is a small legal grey area. Free distribution of a short memory game is very low risk; for paid sales, most sellers simply sell through US-based platforms.
- **Fonts.** IM Fell English and Literata are under the SIL Open Font License, which allows embedding them in software you sell. They are embedded in the HTML file as subsets; the OFL text is in `src/fonts/OFL.txt`. The fonts are not sold on their own.
- **License for buyers.** Personal and household use only; no sharing, reselling or uploading the file elsewhere. A church or group license is sold separately. On Payhip, attach this as the product's license text.
- **Progress lives in one browser.** There is no account and no sync. Clearing site data erases progress, and a computer and a phone keep separate progress. The description and Start here PDF both say so. Some phone browsers clear data for sites you have not visited in a while; adding the game to the home screen helps.
- **Phones and the download.** Phones cannot easily open a downloaded HTML file. If you sell Route B and want buyers to play on phones, host a copy at an unlisted address and give buyers the link in the Start here PDF (see above). Otherwise keep the description's wording, which says it works best on a computer or tablet.
- **Tone.** The game is non-denominational and for personal devotion. Its About page says it is not a substitute for a church community, pastoral care or professional counseling, and the description repeats that.
- **Quotations.** Every saying in the game is checked against the red-letter KJV corpus by `node verify.js` and again by `node build.js`. The quotations in the description above are checked by `node listing/check-listing.js`, which also checks the title length, the 13 tags and the image sizes.
- **Rebuilding.** Edit `src/content.js`, then run `node products/hide-it/build.js` and `node products/hide-it/listing/build-listing.js`. Both stop if a quotation differs from the corpus, and the listing build stops if any text on an image overflows, overlaps or runs off the edge.
