# Forty Days in His Words: listing kit

Everything needed to list the journal today on Etsy, Gumroad or Payhip.

## Files to upload

| File | What it is |
|---|---|
| `dist/forty-days-in-his-words-lent-2027-letter.pdf` | Main product. Dated for Lent 2027, US Letter, 61 pages |
| `dist/forty-days-in-his-words-undated-letter.pdf` | Same journal, no dates, for any 40 days (and for next year) |
| `dist/forty-days-in-his-words-undated-a4.pdf` | Undated, A4, for buyers outside the US |
| `dist/forty-days-in-his-words-free-sample.pdf` | Free 8-page sampler (Days 1 to 3) to give away |
| `listing/1-cover.png` … `4-journey.png` | Four 2000×2000 listing images, in order |

Sell the first three as one bundle. Etsy allows five files per digital listing.

## Price

- **$12** for the bundle. Christian printable journals of this size usually list between $8 and $18; $12 sits in the middle and leaves room for a sale.
- Launch at **$9** (25% off) for the first two weeks to collect early reviews, then hold $12 until Ash Wednesday.
- After Easter, relist the undated edition as an evergreen "40-day journal" at $10.

## Etsy title (≤140 characters)

```
Lent Journal 2027 Printable, 40 Days Words of Jesus KJV, Lenten Devotional PDF, Bible Journal, Christian Gift, Easter Prayer Journal
```

## Etsy tags (13, each ≤20 characters)

```
lent journal
lent 2027
lenten devotional
words of jesus
red letter bible
kjv journal
bible journal pdf
prayer journal
christian printable
easter devotional
ash wednesday
scripture journal
lent printable
```

## Description

```
Walk the forty days of Lent with the words Jesus actually spoke.

FORTY DAYS IN HIS WORDS is a printable Lent journal for 2027. Each day gives you one saying of Jesus from the four Gospels, in the King James Version, set in red the way old Bibles printed his words. A short reflection opens the saying, one question takes it into your day, and the rest of the page is lined for you to write.

The journey follows his life:
• Ash Wednesday: "Repent ye, and believe the gospel"
• Week 1, The Blessed: the Sermon on the Mount and the Lord's Prayer
• Week 2, The Hard Command: love your enemies, judge not, seventy times seven
• Week 3, The Stories He Told: the lost sheep, the prodigal, the Samaritan
• Week 4, In the Storm: "Peace, be still", "Neither do I condemn thee"
• Week 5, I Am: bread, light, shepherd, resurrection, way, vine
• Holy Week: foot washing, Gethsemane, and his seven last words

WHAT YOU GET (instant download, 3 PDFs)
• Dated edition for Lent 2027 (Ash Wednesday 10 February to Holy Saturday 27 March), US Letter
• Undated edition for any forty days, US Letter
• Undated edition, A4
Each is 61 pages: 40 daily pages, a 40-day tracker, 7 weekly theme pages, 6 Sunday look-back pages, the seven last words for Good Friday, an Easter Sunday page and notes pages.

DETAILS
• Every quotation is checked word for word against the King James text
• Ten quiet minutes a day: Read, Reflect, Respond
• Missed a day? Just pick up with today's page
• Print at home or at a print shop; works well hole-punched in a binder
• Suits individuals, small groups, families and church Lent programs

PLEASE NOTE
This is a digital download. No physical item will be shipped. Colors may vary slightly by printer.
For personal and household use. For a church or group license, send a message.
```

## Free sampler (the marketing engine)

Give `forty-days-in-his-words-free-sample.pdf` away: Day 1 to 3, the tracker and how-to pages, ending with a page that points to the full journal.

- Pin it on Pinterest ("Free printable Lent journal sample") linking to the listing; Lent printables are searched heavily from early January.
- Offer it in church Facebook groups and on Instagram in exchange for an email address (Gumroad and Payhip can deliver free files and collect emails).
- Email that list on 1 February ("Lent starts in 9 days") and on Ash Wednesday morning.

## Timeline for Lent 2027

| When | Do |
|---|---|
| This week | List on Etsy (and Gumroad/Payhip as a second shop) at the $9 launch price |
| Early December | Raise to $12; start Pinterest pins for the free sampler |
| Early January | Lent searches climb; post the sampler weekly |
| 1 February | Email the list: "Lent starts in 9 days" |
| 10 February | Ash Wednesday: last big day for sales; email again |
| After Easter | Retitle the undated edition as an evergreen 40-day journal |

## Good to know

- **Copyright.** The KJV is public domain in the United States. In the United Kingdom it remains under Crown patent, so listings aimed at UK buyers carry a small legal grey area; most sellers simply sell through US-based platforms.
- **Fonts.** IM Fell English and Literata are under the SIL Open Font License, which permits embedding them in a PDF you sell.
- **Rebuilding.** Edit `content.js` and run `node products/forty-days/build.js`. The build refuses to run if any quotation differs from the KJV text. For Lent 2028, change `year`, `ashWednesday` (1 March 2028) and `easterDate` (16 April 2028).
