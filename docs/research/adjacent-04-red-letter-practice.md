# Adjacent 4 — Red-letter editorial practice

**Purpose.** Tell Dean how serious editions decide which words are printed in red, where they disagree, and what that means for keeping the unnamed production map plus `SPOKEN_ADDITIONS` versus adopting more eBible KJV OSIS verses.  
**Owner.** Dean.  
**Status.** Research only. No product code changed.  
**Updated.** 2026-09-11.  
**Canonical constraint.** Only Jesus’s spoken words in Matthew–John (KJV). Production map stays unnamed; named witness is eBible KJV OSIS 1769. Do not recommend a wholesale swap.

---

## What a red letter is

Red letter is a **publisher’s device**, not a manuscript feature. Greek and Hebrew copies do not mark speech with colour. Quotation marks themselves are modern. Which words go red is therefore an editorial judgement: who is speaking, where the speech starts and stops, and whether a later insertion still counts as His. `[verified] (retrieved) 2026-09-11`

The modern practice begins with **Louis Klopsch**, editor of *The Christian Herald*. On 19 June 1899, reading Luke 22:20 (“This cup is the new testament in my blood, which is shed for you”), he proposed printing the words recorded as spoken by the Lord in the colour of blood. His mentor T. DeWitt Talmage answered that it “could do no harm and it most certainly could do much good.” The first red-letter New Testament appeared later in 1899 under the title *The New Testament … With All the Words Recorded Therein, as Having Been Spoken by Our Lord, Printed in Color*. The first complete red-letter Bible followed in 1901: *The Holy Bible: Red Letter Edition*, Christian Herald, New York. `[verified] (retrieved) 2026-09-11` from Crossway’s 23 March 2006 history (quoting Klopsch’s own “Explanatory Note” and Charles M. Pepper’s 1910 *Life-Work of Louis Klopsch*); American Bible Society, 10 March 2011 (Gerald C. Studer); Hills, *The English Bible in America* (1962), cited by Crossway.

Klopsch did not mark the pages alone. Pepper records that he sent portions to “a number of distinguished Bible scholars, including several leading college professors in this country and abroad,” then interchanged the marked books so each scholar reviewed the others’ work. `[verified] (retrieved) 2026-09-11` Pepper, pp. 324–25, as quoted by Crossway.

His own 1901 note states the rule in words this product can still use:

> “Here the actual words, quotations, references and allusions of Christ, not separated from their context, nor in a fragmentary or disconnected form, but in their own proper place, as an integral part of the Sacred Record, stand out vividly conspicuous in the distinction of color.”  
> — Louis Klopsch, “Explanatory Note,” *The Holy Bible: Red Letter Edition* (New York: Christian Herald, 1901), p. xvi. `[verified] (retrieved) 2026-09-11`

Two further Klopsch choices matter for us:

1. He printed in red the words “universally accepted as the utterances of our Lord and Saviour.” That is a consensus rule, not a critical reconstruction of the autograph. `[verified] (retrieved) 2026-09-11`
2. The 1901 complete Bible also printed, in the Old Testament, passages Jesus quoted or that were “directly related to incidents to which he referred,” and marked messianic prophecies with red stars. Modern Gospel-only red-letter editions dropped that OT apparatus. Holman, Thomas Nelson, and John C. Winston issued competing red-letter editions in the first decade of the twentieth century (Hills 1962, pp. 326, 329, 342). `[verified] (retrieved) 2026-09-11`

Serious later editions still do what Klopsch did: they ask scholars (or a translation committee) where His speech begins and ends, then a **publisher** decides whether to ink it red. The NIV Committee on Bible Translation said so in the 2011 preface: paragraphing and headings are the committee’s; “the issuing of ‘red-letter’ editions is a publisher’s choice — one the committee does not endorse.” `[verified] (retrieved) 2026-09-11` NIV 2011 Preface, bible-researcher.com transcription.

---

## How electronic editions encode the same decision

The named witness in this checkout is not a paper preface. It is markup.

**OSIS 2.1.1** (American Bible Society / Bible Technologies Group, user’s manual by Patrick Durusau, 2006) treats speaker as an attribute on the quotation element. The manual’s own example: a `q` element carrying `who="Jesus"` “identifies the quoted material as being said by Jesus. Attributes enable searching for or special presentation of portions of a text, such as rendering all the words of Jesus in red.” `[verified] (retrieved) 2026-09-11`

The CrossWire wiki (`OSIS Bibles`, “Marking the Words of Christ”) repeats the rule: `q who="Jesus"`. The SWORD filter `OSISRedLetterWords` looks for that attribute and nothing else. `[verified] (retrieved) 2026-09-11`

**CrossWire’s own KJV module** (1769 Oxford text) needed a *reference* for red letter because “this too varied from one modern KJV to another.” They first used the 1917 public-domain Old Scofield. On 28 January 2016 they obtained Klopsch’s 1901 edition and adopted it as the future red-letter reference; module 2.10 and later “Update Words of Christ (red letter markup) to match Louis Klopsch’s 1901 edition.” Scan: Internet Archive, *Rubricated American Heritage Bible*. `[verified] (retrieved) 2026-09-11` CrossWire wiki, *CrossWire KJV*.

**eBible.org** (Michael Paul Johnson) publishes a separate 1769 KJV OSIS. A 15 November 2019 `sword-devel` thread records Johnson saying the eBible KJV “is taken straight from DM’s source, at least for the 66 books of the protocanon,” regenerated by Haiola, and is **not** the same OSIS file CrossWire ships. White-space and quotation-mark rendering already differ. `[verified] (retrieved) 2026-09-11` Our named file is that eBible OSIS, mirrored at seven1m/open-bibles `eng-kjv.osis.xml`, commit `7768dac` (2015-05-07), source revision 2013-07-12, SHA-256 `eeeae647…e253`. The WEB USFX witness uses `<wj>` (“words of Jesus”) on the same mirror. `[verified] (in-scope)` `docs/red-letter-map.md`, `data/red-letter-ebible-kjv.json`.

So “OSIS-only” in this repo does **not** mean “what Klopsch printed” and does **not** mean “what CrossWire now ships.” It means “what eBible’s 2013 Haiola build marked `who="Jesus"`.” That is a named, hashed, rebuildable witness. It is not a second production map. `[inference] (in-scope)`

---

## The disagreements that matter here

Checked against `data/red-letter-source.json` (production) and `data/red-letter-ebible-kjv.json` (named OSIS) on 2026-09-11. `[verified] (in-scope)`

### 1. The Father’s voice

Baptism and transfiguration: Matthew 3:17, 17:5; Mark 1:11; Luke 3:22, 9:35. **Absent from both maps.** Serious red-letter editions print those lines in black. They are the Father, not the Son. `[verified] (in-scope)`

The leak is **Mark 9:7** (the voice out of the cloud). Production marks it `full`. OSIS does not mark it. The product layer already drops it via `NOT_SPEECH`. `[verified] (in-scope)` `lib/scripture.js`

**John 12:28** is the mixed verse. Production marks the whole verse (`full`), which would hand the reader the voice from heaven. OSIS already isolates His clause: “Father, glorify thy name.” `SPOKEN_OVERRIDES` keeps only that clause. The named edition is cleaner; the product layer already agrees with it. `[verified] (in-scope)`

**Decision class:** keep `NOT_SPEECH` / `SPOKEN_OVERRIDES`. Do not promote the Father into the corpus. Do not need more OSIS verses to get this right.

### 2. Angels

Mark 16:6 (the young man / angel at the tomb): production marks the speech; OSIS does not; `NOT_SPEECH` drops it. Matthew 28:5 and Luke 24:5 (the other tomb angels) are **absent from both maps**. `[verified] (in-scope)`

**Decision class:** same as the Father. The unnamed map over-marked one angel; the product layer already tells the truth. A wholesale OSIS swap is not required to keep angels out.

### 3. Old Testament quotes on His lips

Matthew 4:4, 4:7, 4:10 (the wilderness answers, citing Deuteronomy) are marked in **both** maps. Klopsch’s original 1901 Bible went further and rubricated the OT source passages themselves. Gospel-only editions — including both of ours — print the words **as He spoke them** in the Gospel and leave Deuteronomy black. `[verified] (in-scope)` against the two JSON files; `[verified] (retrieved) 2026-09-11` for Klopsch’s OT practice (Crossway / Pepper).

**Decision class:** keep those verses. They are His speech. Quoting Moses on His lips does not make the saying Moses’s. The product’s `OTHER_VOICE_RE` correctly blocks “as Moses wrote” in Advisor prose; it must not block Jesus citing the Law.

### 4. Parable characters

Luke 16:24 (the rich man in Hades) and the whole of Matthew 25 (virgins, talents, sheep and goats) are `full` in **both** maps. That is standard editorial practice: the parable is His narration, including the lines He gives the steward, the rich man, Abraham, the foolish virgins. `[verified] (in-scope)`

`lib/scripture.js` already records the house rule: “a parable’s own ‘and he said’ is His narration and stay.” `NARRATOR_PREFIXES` strips only the evangelist’s introduction, never the inner “and he said.” `[verified] (in-scope)`

The OSIS *leaks* that look like parable interiors are not parables. The 18 `osisOnly` verses include Luke 7:1–8 (the centurion’s friends and the centurion) and Luke 7:36–39 (the Pharisee). Those are other people. A wholesale OSIS swap would put them in His mouth. `docs/red-letter-map.md` already names this. `[verified] (in-scope)`

**Decision class:** keep parable interiors. Keep the 18 OSIS-only verses out. Do not treat “inner dialogue” as a reason to drop Luke 16 or Matthew 25.

### 5. The John 8 pericope (7:53–8:11)

Bruce M. Metzger, *A Textual Commentary on the Greek New Testament*, 2nd ed. (UBS, 1994), pp. 187–89: “The evidence for the non-Johannine origin of the pericope of the adulteress is overwhelming.” Absent from P66, P75, ℵ, B, and a long list of early versions; style and vocabulary differ; it interrupts 7:52 / 8:12. Nestle-Aland prints it in double brackets. `[verified] (retrieved) 2026-09-11`

The NIV 2011 preface (committee text, not a publisher blurb) groups John 7:53–8:11 with Mark 16:9–20: “a very questionable — and confused — standing in the textual history of the New Testament,” set off by brackets and a different typeface. `[verified] (retrieved) 2026-09-11`

The **KJV** prints the pericope as ordinary text (Textus Receptus / 1769). Both of our maps mark His lines: John 8:7, 8:10, 8:11. Production marks 8:7 `full` (evangelist plus speech). OSIS already isolates “He that is without sin among you, let him first cast a stone at her.” `[verified] (in-scope)`

John 8:22 is the opposite error: OSIS marks the **Jews’** echo (“Whither I go, ye cannot come.”). Production leaves it unmarked. `[verified] (in-scope)`

**Decision class:** keep 8:7, 8:10, 8:11. This product is KJV, not NA28. Do not add a critical-text caveat in the Advisor (scholarship sits behind the answer — `CLAUDE.md`). Prefer the OSIS *span* on 8:7 via override if Dean wants a cleaner reading; do not adopt 8:22.

### 6. The longer ending of Mark (16:9–20)

Metzger’s committee: the earliest ascertainable form of Mark ends at 16:8 (absent from ℵ and B; Eusebius and Jerome report it missing from almost all Greek copies they knew). Verses 9–20 are printed in double brackets “out of deference to the evident antiquity of the longer ending.” `[verified] (retrieved) 2026-09-11` Metzger, TCGNT, “The Ending(s) of Mark.”

Both of our maps mark **16:15–18** (the commission inside the longer ending) and leave 16:9–14 unmarked (those verses are appearance *narrative*). Neither map marks the tomb angel in Matthew or Luke; only production marks Mark 16:6. `[verified] (in-scope)`

**Decision class:** keep 16:15–18. Same reason as John 8: the letter is KJV. Keep Mark 16:6 out. Do not expand into 16:9–14.

### 7. Where His speech stops (John 3:16–21)

This is the textbook editorial split. The NIV 2011 (following TNIV) ends the quotation at 3:15 and prints 3:16–21 as the evangelist. A bookstore account of that change (NIV 2011 vs NIV 1984) is in *BBH Church Connection*, 27 December 2011. Phillip J. Long, *Reading Acts*, 17 October 2011, surveys the commentators: Brown and Moloney continue Jesus through 3:21; Köstenberger and others start the evangelist at 3:16; Witherington and Schnackenburg break earlier. Wikipedia’s *Red letter edition* notes the NIV footnote at 3:21: “Some interpreters end the quotation after verse 15.” `[verified] (retrieved) 2026-09-11`

**Both of our KJV maps mark 3:16–21 `full`.** That is the Klopsch / traditional KJV choice. `[verified] (in-scope)`

**Decision class:** keep 3:16–21. Switching them out would be adopting a modern-translation judgement the named KJV witness does not make. If Dean ever wants the narrower reading, it is a `SPOKEN_OVERRIDES` / `NOT_SPEECH` decision, not an OSIS swap.

---

## What the product layer already is

`docs/red-letter-map.md` (updated 2026-09-07) and `lib/scripture.js` together are the KEEP LIST:

| Layer | What it does | Why it exists |
| --- | --- | --- |
| Production map (`data/red-letter-source.json`) | 1,923 Gospel markers, unnamed | Live source until Dean authorizes a swap |
| Named witness (`data/red-letter-ebible-kjv.json`) | 1,968 Gospel markers; 18 `osisOnly`; 5 `webOnly` | Hashed, rebuildable, not live |
| `NOT_SPEECH` (12) | Drops other speakers the unnamed map marked | Voice from the cloud, angel, disciples, hearers, “Jesus wept”… |
| `SPOKEN_OVERRIDES` (15) | Keeps only His clause on mixed verses | John 12:28, Mark 8:19, the Aramaic glosses… |
| `NARRATOR_PREFIXES` (64) | Strips evangelist introductions | A general regex would steal parable interiors |
| `SPOKEN_ADDITIONS` (22) | Adds speech both named editions mark and the map omitted | Luke 2:49 plus the 2026-09-07 safe class (Matthew 8:3 … John 21:15) |

`[verified] (in-scope)` counts from the files on this checkout. `docs/red-letter-map.md` still says “adds Luke 2:49 (`SPOKEN_ADDITIONS`)” in the lead; the list in `lib/scripture.js` is now the larger safe class. The live corpus is built from the production map **plus** this layer. `scripts/build-spoken.js` refuses to overwrite the live corpus from the named map.

A wholesale named-map swap, run through the same layer, would **add 57** verses (genuine omissions mixed with other people’s lines and the 18 OSIS-only narrative leaks) and **drop 3** genuine sayings already quoted (Matthew 13:57, Mark 9:9, Luke 24:45). Seventy spans would change, some cleaner (John 8:7, John 11:43, John 21:19), some worse. `[verified] (in-scope)` `docs/red-letter-map.md`, computed 2026-09-07.

---

## Implications — product decision

**Keep the unnamed production map. Keep the product layer. Do not adopt more OSIS-only verses. Do not swap.**

That is the same recommendation `docs/red-letter-map.md` already settled on 2026-09-07. Editorial history confirms it rather than reopening it.

1. **Red letter is a publisher’s judgement.** Klopsch, the NIV committee, CrossWire, and eBible all say so in different words. There is no “correct” electronic map to swap in. The honest move is a named witness beside an unnamed live map, plus a KEEP LIST that states who we will not quote. We already have that.

2. **The disagreements Dean named are already handled, verse by verse, in the product layer.** Father and angels stay out (`NOT_SPEECH`). OT citations on His lips stay in. Parable interiors stay in. John 8:7, 10, 11 and Mark 16:15–18 stay in because the letter is KJV, and both maps mark those lines. John 8:22 (OSIS leak of the Jews) stays out. John 3:16–21 stay in because both KJV witnesses mark them.

3. **The 18 OSIS-only verses are the wrong class to adopt.** They are the centurion, the Pharisee, the Bethsaida healing narrative, Matthew 24:1, Luke 17:36. eBible’s `<q who="Jesus">` over-fired. WEB does not agree. Klopsch’s “universally accepted as the utterances” rule would have kept them black.

4. **Take verses from the named edition one class at a time** — the method already used for `SPOKEN_ADDITIONS`. Remaining candidates are only those **both** editions mark, whose span is His and not a quotation of Him. Do not reopen the 18. Do not drop Matthew 13:57, Mark 9:9, or Luke 24:45 to please the KJV OSIS.

5. **Span fixes beat map swaps.** Where OSIS is already cleaner on a verse we keep (John 8:7, John 12:28, John 11:43, John 21:19), prefer a `SPOKEN_OVERRIDES` / prefix trim. That is how the Advisor currently tells the truth.

6. **Do not put Nestle-Aland brackets in the room.** The Advisor is not a textual apparatus. John 8 and Mark 16:15–18 remain His words in this product because they are His words in the KJV this product quotes. If a later Dean decision ever wants a “disputed saying” flag, it belongs in `docs/`, not in a letter.

`[recommendation] (in-scope)`
