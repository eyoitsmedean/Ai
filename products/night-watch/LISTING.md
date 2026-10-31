# The Night Watch: publishing kit (Amazon KDP)

A 72-page, 5 × 8 in gift book for new parents: thirty nights of the words Jesus spoke (KJV, in red), each with a short reflection for the small hours, a one-line prayer and room to write, plus a page of postpartum help lines. Built from the app's verified red-letter text.

## Files

| File | Upload as |
|---|---|
| `dist/the-night-watch-interior-5x8.pdf` | Paperback manuscript: 72 pages, 5 × 8 in, no bleed |
| `dist/the-night-watch-cover.pdf` | Paperback cover: 10.4121 × 8.25 in wraparound, 0.125 in bleed, spine 0.1621 in |
| `dist/listing-cover-front.png` | Front cover image (ads, social, A+ content) |
| `dist/listing-spread.png` | Inside spread, Night 16 (A+ content, social) |

## Paperback setup

- **Ink and paper: Standard color, white paper.** His words are printed in red; a black & white interior would print them grey. Standard color needs at least 72 pages, and the book has exactly 72. If you add pages, rebuild the cover.
- **Trim size:** 5 × 8 in. **Bleed:** none. **Cover finish:** matte.
- **Spine:** 72 pages is below KDP's 79-page minimum for spine text, so the spine is plain night-blue.
- **Barcode:** the lower right of the back cover is kept clear; KDP prints the barcode there.
- **Margins:** inside 0.75 in, outside 0.5 in, mirrored, well inside KDP's gutter rule for 24–150 pages.
- The cover PDF is written at KDP's exact width (749.671 pt); Chrome alone would round it to 750 pt.

## Public domain

KDP will ask whether the book is public domain. The King James text is, so answer **yes**, and state what is original:

> Original selection of thirty sayings of Jesus for new parents; thirty original reflections and prayers written for the night feeds; an original guide to postpartum help lines; original design, journaling pages and index.

## Title and subtitle

- **Title:** The Night Watch
- **Subtitle:** Words of Jesus for New Parents, in the Small Hours
- **Author / Contributor:** Red Letter (as author of the reflections), or your own name

## Description

```html
<p><b>For the feeds at two, the rocking at four, and the long walk down the hall while the house sleeps.</b></p>
<p>The Night Watch gives a new parent thirty nights of the words Jesus spoke, printed in red from the King James Version. Each night is one page-turn: on the left, his words; on the right, a short reflection written for someone holding a baby in the half-dark, a prayer short enough to say with your eyes closed, and a few lines to write what you noticed.</p>
<ul>
<li><b>Written for the small hours.</b> Short enough to read one-handed, by lamplight or the glow of a phone.</li>
<li><b>His words, checked word for word.</b> Thirty sayings from Matthew, Mark, Luke and John: "Peace, be still", "Come unto me, all ye that labour", "Feed my lambs", "I am with you alway".</li>
<li><b>No schedule to keep.</b> No night to fall behind on. If you missed a night, you were holding a child.</li>
<li><b>Honest about the hard nights.</b> A page of help lines for postpartum depression and anxiety, for mothers and fathers.</li>
<li><b>A keepsake.</b> Pages to write down the first smile, the first full night, and the night you cried too.</li>
</ul>
<p>A gift for a baby shower, a hospital bag, or a friend who just brought someone home.</p>
```

## Keywords (7 boxes)

```
new parent gift christian
new mom devotional
gift for new dad faith
baby shower gift christian
words of jesus kjv
postpartum devotional
night feeding prayers
```

## Categories (choose three)

- Religion & Spirituality › Christian Books & Bibles › Christian Living › Parenting
- Religion & Spirituality › Christian Books & Bibles › Devotionals
- Parenting & Relationships › Parenting › Babies & Toddlers

## Price

| Format | List price | Estimated royalty per sale |
|---|---|---|
| Paperback, standard color, 72 pages | **$12.99** | about $4.90 (60% of list, minus about $2.90 printing) |

Confirm the printing cost in KDP's royalty calculator before publishing; color rates change. Gift books in this niche list between $9.99 and $16.99.

## Before you publish

1. Order one author proof copy and read it at night, by a lamp, one-handed. That is the real test.
2. Check the help lines are still current: 988; the National Maternal Mental Health Hotline, 1-833-852-6262; the Postpartum Support International HelpLine, 1-800-944-4773.
3. If you put your own name on it, change `compiler` in `content.js` and rebuild.

## Rebuilding

`node products/night-watch/build.js` (or `--check` to verify only). The build stops if any saying is not exact red-letter KJV, if any page overflows, or if the document is longer than its pages.
