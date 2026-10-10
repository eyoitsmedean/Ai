# Words in Frame: listing kit

Everything needed to list the twelve prints today on Etsy, with Payhip as a second shop.

## Where to sell

1. **Etsy (digital download).** Printable Christian wall art is one of Etsy's busiest digital categories, and buyers search there for exactly this: "bible verse print", "scripture wall art", "gallery wall set". Etsy brings the traffic; you pay a $0.20 listing fee plus about 10% in fees per sale.
2. **Payhip (second shop).** Lower fees (5% on the free plan), no file-count limit, and it can collect email addresses for free downloads. Use it for your own link-in-bio shop and for the free print below.
3. **Later, physical prints.** The masters are 300 dpi up to 24 x 36 in, so they suit a print-on-demand service (Gelato, Prodigi, Printful) connected to Etsy. Order a proof of each design first; red grounds in particular vary between printers.

Gumroad also works, but its 10% fee buys you nothing over Payhip for this product. The Game Crafter and MakePlayingCards are for card decks and do not apply here.

## Price

| Listing | Price | Why |
|---|---|---|
| Full set of 12 | **$16** (launch at **$12** for two weeks) | Sets of 6 to 12 printable scripture prints sell for about $10 to $25 on Etsy. Twelve designs in five shapes each is at the generous end, so $16 is fair and still an easy gift purchase. |
| Single design | **$4.50** | Singles usually sell for $3 to $6. Twelve single listings give you twelve more ways to be found in search, and each one points to the set. |
| Pick any 3 (optional) | $9.50 | Fill in later with a "choose your three" listing if buyers ask for it. |

At $16 the set is the obvious value against 12 x $4.50 = $54, which is the point. Run Etsy's 25% sale once a quarter rather than living on discounts.

## Etsy title (140 characters or fewer)

```
Words of Jesus Wall Art Set of 12, Printable KJV Bible Verse Prints, Red Letter Scripture Typography, Christian Gallery Wall Download
```

Single-design title pattern (fill in the saying and reference):

```
Peace Be Still Print, Mark 4:39 KJV Words of Jesus Wall Art, Printable Bible Verse, Red Christian Typography Poster, Instant Download
```

## Etsy tags (13, each 20 characters or fewer)

```
bible verse print
scripture wall art
christian wall art
words of jesus
kjv wall art
printable wall art
red letter
bible verse set
gallery wall set
christian decor
typography print
faith wall decor
jesus quote print
```

`node products/wall-art/listing.js --check` counts these and the title and fails if any is too long.

## Description

```
Twelve short sayings of Jesus, set in type and made to hang on your wall.

WORDS IN FRAME is a set of twelve printable typographic prints. Each one carries a saying of Jesus from the King James Version, the words old Bibles printed in red. Every print is drawn as its own design, with the line breaks set by hand, and the twelve sit together as one family: warm paper, soft stone, deep ink and a strong red.

THE TWELVE PRINTS
01 Light: "Ye are the light of the world." (Matthew 5:14)
02 Rest: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." (Matthew 11:28)
03 Treasure: "For where your treasure is, there will your heart be also." (Matthew 6:21)
04 Ask, Seek, Knock: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you" (Matthew 7:7)
05 Be Still: "Peace, be still." (Mark 4:39)
06 Only Believe: "Be not afraid, only believe." (Mark 5:36)
07 Lilies: "Consider the lilies how they grow" (Luke 12:27)
08 Sparrows: "Fear not therefore: ye are of more value than many sparrows." (Luke 12:7)
09 Within: "Behold, the kingdom of God is within you." (Luke 17:21)
10 Untroubled: "Let not your heart be troubled" (John 14:1)
11 Love One Another: "Love one another, as I have loved you." (John 15:12)
12 Good Cheer: "Be of good cheer; I have overcome the world." (John 16:33)

WHAT YOU GET (instant download)
• 60 high-resolution JPG files: all 12 designs in 5 frame shapes
• 4:5 for 8x10 and 16x20 in
• 3:4 for 12x16 and 18x24 in
• 2:3 for 8x12, 12x18, 16x24, 20x30 and 24x36 in
• 11x14 in
• ISO A for A5, A4, A3 and A2 (and 5x7 in)
• A 2-page size guide that tells you which file fits your frame
• A preview sheet of all twelve designs
Each shape is designed on its own, so nothing is cropped or stretched. Files are 300 dpi with a clear margin around the words.

HOW IT WORKS
1. Download the zip for your frame shape (one zip per shape)
2. Print at home, at a local print shop or with an online photo lab
3. Frame and hang

DETAILS
• Every word is checked against the King James text of the words of Jesus
• Looks best on matte or lightly textured paper
• Lovely as a gallery wall of three, six or all twelve
• A thoughtful gift for a new home, a baptism, a confirmation or a friend going through a hard season

PLEASE NOTE
This is a digital download. No physical item or frame will be shipped. Colours vary a little between screens and printers, especially the red; a print shop proof is worth it for large sizes.
License: for personal use. Print as many copies as you like for your own home and to give as gifts. Please do not share, resell or redistribute the files, or sell prints of them. For church or business use, send a message.
```

## What buyers receive

Etsy allows five files per digital listing, 20 MB each, so the set ships as five zips, one per frame shape. Each zip also holds the size guide and the preview sheet.

| Zip | Contents | Size |
|---|---|---|
| `words-in-frame-4x5.zip` | 12 JPGs, 4800 x 6000 px (16 x 20 in at 300 dpi) + 2 PDFs | about 7 MB |
| `words-in-frame-3x4.zip` | 12 JPGs, 5400 x 7200 px (18 x 24 in) + 2 PDFs | about 8 MB |
| `words-in-frame-2x3.zip` | 12 JPGs, 7200 x 10800 px (24 x 36 in) + 2 PDFs | about 12 MB |
| `words-in-frame-11x14.zip` | 12 JPGs, 3300 x 4200 px (11 x 14 in) + 2 PDFs | about 4.5 MB |
| `words-in-frame-iso.zip` | 12 JPGs, 3508 x 4961 px (A3) + 2 PDFs | about 5 MB |

`node products/wall-art/listing.js --zip` builds these into `products/wall-art/upload/` (ignored by git) and checks that each is under 20 MB. For a single-design listing, upload one zip holding that design's five JPGs from `dist/<design-name>/` and the size guide (`--zip` builds these too, as `single-XX-name.zip`).

On Payhip, upload one zip of everything (about 32 MB) instead.

### Listing images

| File | Shows |
|---|---|
| `listing/1-gallery.png` | Three prints framed on a wall, in three different shapes |
| `listing/2-all-twelve.png` | All twelve designs with their titles and references |
| `listing/3-whats-included.png` | One design in all five shapes, the files and the size guide |
| `listing/4-detail.png` | A full-resolution crop of a master, to show the print quality |

All four are 2000 x 2000 px and are built from the finished files in `dist/` by `node products/wall-art/listing.js`. For single-design listings, use that design's 4:5 master as the first image and image 2 as the second.

## Free print (lead magnet)

Give one design away free on Payhip in exchange for an email address. Design 01, "Light", is the best choice: it is bright, simple and works in any room. Add a short note on the free download page pointing to the full set at the launch price. Pin it on Pinterest as "free printable bible verse wall art", which is searched all year.

## Launch plan

| When | Do |
|---|---|
| Day 1 | List the set on Etsy at $12 with all four images. List the 12 singles at $4.50. |
| Day 1 | Open the Payhip shop with the full set and the free "Light" print. |
| Week 1 | Pin all four listing images and one pin per design on Pinterest, linking to Etsy. Pinterest is where wall-art buyers browse. |
| Week 1 | Share the free print in faith and home-decor Facebook groups that allow freebies. |
| Week 2 | Ask early buyers for a photo of their wall; real photos sell prints better than mockups. |
| Day 15 | Raise the set to $16. |
| November | Gift season: add "Christmas gift" and "housewarming gift" phrases to the description and run a 25% sale in the week after Thanksgiving. |
| Later | Add physical prints through a print-on-demand service once you have ordered proofs. |

## Honest notes

- **Copyright of the text.** The King James Version is in the public domain in the United States. In the United Kingdom it is still covered by a perpetual Crown patent administered by Cambridge University Press. Short quotations used in this way are generally treated leniently, but it is a grey area; selling through a US-based platform is the common practice.
- **Fonts.** IM Fell English and Literata are under the SIL Open Font License. Using them in artwork you sell is permitted. The fonts themselves are not included in the download.
- **Accuracy.** Every saying is checked word for word against the red-letter KJV corpus (`data/spoken-gospels.json`) by `verify.js`, and the build stops if one differs. `listing.js --check` checks the quotations in this description the same way.
- **License for buyers.** Personal use only, as stated in the description. A church or business license (for example, printing for a church foyer or selling framed prints) can be offered on request; $40 is a reasonable starting price.
- **Colour.** The red (#a3142c) and the dark ink grounds print darker on some home inkjets. The description says so to avoid disappointed buyers.
- **Mockups.** Image 1 is a drawn mockup, not a photograph. Etsy allows this; replace it with a real photo of your own framed prints when you can.
- **Not counselling.** These are prints for a home. If a buyer writes about a hard time, be kind, and point them to someone who can help in person.
