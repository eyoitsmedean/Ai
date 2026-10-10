# Every Word He Spoke: publishing kit (Amazon KDP)

A 292-page paperback and a Kindle ebook: every word Jesus speaks in the four Gospels (KJV), a guide to his words for twelve life situations, and a complete concordance of his vocabulary, all generated from the app's verified red-letter text.

## Files

| File | Upload as |
|---|---|
| `dist/every-word-he-spoke-interior-6x9.pdf` | Paperback manuscript (292 pages, 6 × 9 in, no bleed) |
| `dist/every-word-he-spoke-cover.pdf` | Paperback cover (12.9076 × 9.25 in wraparound, 0.125 in bleed, spine 0.6576 in) |
| `dist/every-word-he-spoke.epub` | Kindle ebook manuscript |

The cover is sized for **292 pages on white paper**. If the page count changes, rebuild: `node products/every-word/build.js` recomputes the spine (pages × 0.002252 in) and the cover width.

## Paperback setup

- **Ink and paper:** Black & white interior, white paper
- **Trim size:** 6 × 9 in
- **Bleed:** No bleed
- **Cover finish:** Matte suits the cover
- **ISBN:** Use the free KDP ISBN (or your own)
- Margins already meet KDP's gutter rule for 151 to 300 pages (inside 0.8 in, outside 0.55 in, top and bottom 0.75 in)

## Public domain: declare it and describe what is new

The King James text is public domain, so KDP will ask whether the book is public domain. Answer **yes**, and in the description and the "differentiation" field state what is original:

> Original selection and arrangement of the words of Jesus, verse by verse, checked against an independent red-letter edition; an original 2,366-entry concordance of every word he speaks with keyword-in-context lines; an original guide to his words for twelve life situations; an introduction, statistics and a verse-by-verse chart of where his voice falls in each Gospel.

Keep "with a Complete Concordance" in the subtitle: it names the original content in the title, which is what KDP's public-domain guidance asks for. Public-domain ebooks may be limited to the 35% Kindle royalty; the paperback royalty is unaffected.

## Title and subtitle

- **Title:** Every Word He Spoke
- **Subtitle:** The Words of Jesus from the Four Gospels, with a Complete Concordance (King James Version)
- **Author / Contributor:** Red Letter (as compiler)

## Description (paste into KDP; basic HTML is allowed)

```html
<p><b>Every word Jesus speaks in Matthew, Mark, Luke and John, and only his words.</b></p>
<p>No narration, no other speakers, no commentary: just what he said, in the King James Version, in the order the Gospels give it. Read straight through, it is a little over two hours aloud.</p>
<p><b>Inside</b></p>
<ul>
<li><b>His words, verse by verse.</b> All 40,276 of them, checked against an independent red-letter edition. Parables are printed whole, as he told them.</li>
<li><b>A complete concordance of his words.</b> 2,366 words, each with every place he says it, shown in context. Look up <i>peace</i>, <i>father</i>, <i>afraid</i> or <i>forgive</i> and find every time he said it.</li>
<li><b>His words for life.</b> Sayings gathered for twelve situations: worry, grief, forgiveness, loneliness, conflict, fear, purpose, doubt, suffering, shame, peace and hope.</li>
<li><b>Where his voice falls.</b> For each Gospel, a verse-by-verse chart of where Jesus speaks, and how much of each Gospel is his (from 37% of Mark to 58% of Matthew).</li>
</ul>
<p>For daily reading, for study, for small groups, and for finding the place where he said it.</p>
```

## Keywords (7 boxes)

```
words of jesus
red letter bible kjv
concordance of the gospels
king james version gospels
sayings of jesus
jesus quotes bible study
christian gifts for men women
```

## Categories (choose three)

- Religion & Spirituality › Bibles › King James Version
- Religion & Spirituality › Christian Books & Bibles › Bible Study & Reference › Concordances
- Religion & Spirituality › Christianity › Jesus, the Gospels & Acts

## Price

| Format | List price | Estimated royalty per sale |
|---|---|---|
| Paperback | **$19.99** | about $7.49 (60% of list, minus about $4.50 printing for 292 B&W pages) |
| Kindle | **$4.99** | about $1.75 at 35%, or about $3.45 if eligible for 70% |

Confirm the printing cost in KDP's royalty calculator; its rates change.

## Launch

1. Publish the paperback first and order one author proof copy (about $5 plus shipping) to check print quality before ordering more.
2. Publish the Kindle edition and link the two on the same product page.
3. Turn on Amazon Ads with the keywords above at a small daily budget ($5 to $10) for two weeks and keep the keywords that convert.
4. Pair it with the Lent journal in `products/forty-days/`: the journal sells in January and February, the book all year and as a gift at Easter, Father's Day and Christmas.

## Rebuilding

`node products/every-word/build.js` regenerates all three files from `data/spoken-gospels.json`. The build stops if any page overflows or any concordance line would be cut, so a correction to the red-letter text flows straight into a clean new edition.
