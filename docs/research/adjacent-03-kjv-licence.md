# Adjacent 03 — KJV copyright, Crown letters patent, US public domain (2026)

**Purpose.** Tell Dean the actual legal status of the King James / Authorised Version as of 2026, whether a US GitHub Pages host that quotes Gospel speech needs an extra licence, and what this product must print beside citations.  
**Owner.** Dean.  
**Product surfaces.** `CLAUDE.md` translation line; `README.md` “KJV text is public domain. Attribution is printed beside citations.”; `public/index.html` / `welcome.html` “ · KJV” and “King James, public domain”; `data/gospels-kjv.json` attribution; `RELEASE.md` “Translation licence recorded.”  
**Retrieved.** 2026-09-11. Official or library sources only. No invented citations.  
**Code.** Not edited.  
**This is not legal advice.** Labels: **[fact]** · **[interpretation]** · **[recommendation]**.

---

## Verdict

**In the United States, the 1611 translation (standardised 1769 text this product uses) is in the public domain. A US GitHub Pages host does not need a US copyright licence to quote Jesus’s spoken words from that text.** **[fact]** + **[interpretation]**

**In the United Kingdom, the Authorised Version is not ordinary expired copyright. Rights to print, publish, and import it are a royal prerogative, preserved beside the 1988 copyright statute, and administered by Cambridge University Press as the Crown’s patentee (with Oxford and the Scottish Bible Board in their own territories).** **[fact]**

**The product already prints ` · KJV` beside citations. That is the right US practice and matches the lightest UK “initials only” habit for materials not offered for sale. Do not print “Reproduced by permission of Cambridge University Press” unless CUP has actually granted permission.** **[recommendation]**

`CLAUDE.md`’s settled line — “KJV, public domain outside the UK (Crown letters patent apply in the UK)” — is directionally correct. The 2026-09-06 verification cited Wikipedia only. This note puts official and library sources under it. **[fact]**

---

## What the product actually quotes

Read from the tree on 2026-09-11. **[fact]**

- Translation: King James Version, 1769-standard text, rebuilt by `scripts/build-kjv.js` from two independent public-domain transcriptions (`aruljohn/Bible-kjv`, `scrollmapper/bible_databases`). Canonical Gospel counts 1071 / 678 / 1151 / 879.
- Scope: spoken words of Jesus in Matthew, Mark, Luke, and John only. Not the complete Gospels, not Paul, not a full Bible.
- `public/library.json`: **663** sayings, **1,934** verses. That is the searchable library a Pages visitor can open with no server.
- Every on-page citation the folio paints is already suffixed ` · KJV` (Today, Sit, Seek, library, vespers, print, blessing card).
- `welcome.html` / root `index.html`: “Quoted speech is King James, public domain.”
- `README.md`: “KJV text is public domain. Attribution is printed beside citations.”
- `data/spoken-gospels.json` attribution: “KJV 1769 public domain; …”
- `CLAUDE.md`: “Translation: **KJV**, public domain outside the UK (Crown letters patent apply in the UK) — settled — VERIFIED 2026-09-06 via Wikipedia, *King James Version*, § Copyright status.”
- Hosting decision: GitHub Pages project path, US-hosted `github.io`, no UK server. Model letters need Node; the quoted corpus does not.

---

## United States (2026)

### Duration

**[fact]** U.S. Copyright Office, Circular 15A *Duration of Copyright*, reviewed 08/2011, **revised 04/2026**, retrieved 2026-09-11:

> “Applying these standards, all works published in the United States before January 1, 1931, are in the public domain.”

**[fact]** Cornell University Library, *Copyright Term and the Public Domain in the United States*, updated **1 January 2026**, retrieved 2026-09-11:

- Works registered or first published in the U.S. **before 1931**: public domain (copyright expiration).
- Works first published **abroad** before 1931: “In the public domain (But see first special case below).”

The 1611 Authorised Version and the 1769 Oxford (Blayney) standardisation are both centuries before that cutoff. **[fact]** (publication dates; Wikisource hosts the 1769 text as a pre-1931 work.)

### Restoration of foreign works

**[fact]** The same Circular 15A describes Uruguay Round Agreements Act restoration (1 January 1996) for *certain* foreign works that had lost U.S. protection through formalities. Restoration is for works that still had copyright in the source country under ordinary copyright terms. See also Cornell’s foreign-publication rows: the pre-1931 foreign row is public domain.

**[interpretation]** URAA does not pull a 1611/1769 English Bible back into U.S. copyright in 2026. Even if one treated the UK letters patent as “still in force in the source country,” the work’s publication date is not in the 1931–1996 restoration window Cornell charts. No U.S. Copyright Office circular retrieved today lists the KJV as a restored work.

### Library and reference confirmations (not statutes)

**[fact]** Wikisource, *Bible (King James)* (1769 Oxford printing), retrieved 2026-09-11: “This work was published before January 1, 1931, and is in the public domain worldwide because the author died at least 100 years ago.” And: “This work is in the public domain in some countries and areas outside the United Kingdom, including the United States.”

**[fact]** Bible Gateway, *King James Version (KJV) — Version Information*, retrieved 2026-09-11: “The KJV is public domain in the United States.”

**[fact]** eBible.org, *King James Version + Apocrypha* copyright page, HTML generated **19 August 2026**, retrieved 2026-09-11: the 1769 text is “firmly in the Public Domain” outside the UK; letters patent “has no effect outside of the UK.” This is the same named witness `docs/red-letter-map.md` already uses.

**[interpretation]** For a product hosted on GitHub Pages (GitHub, Inc., United States) that quotes the 1769 KJV Gospels, **no U.S. copyright licence is required.** Using a GitHub transcription rather than a Cambridge typeset edition does not create a U.S. copyright in the biblical words. A *new* introduction, study note, or typesetting could be copyrighted; this product’s spoken verses are the historic wording.

---

## United Kingdom (2026)

### What the right is (and is not)

**[fact]** This is not ordinary Crown *copyright* of the kind that expires 50 years after publication. It is a **royal prerogative / letters patent** printing privilege that the 1988 statute left standing.

**[fact]** *Copyright, Designs and Patents Act 1988*, s. 171(1)(b), legislation.gov.uk (The National Archives), retrieved 2026-09-11:

> “Nothing in this Part affects— … (b) any right or privilege of the Crown subsisting otherwise than under an enactment;”

s. 171(2) then says that, subject to those savings, no copyright or right in the nature of copyright subsists except under the Act. The AV privilege is the saved prerogative, not a CDPA term that ends in 2039. **[interpretation]** of s. 171 against the Wikipedia “until 2039” aside on the *List of English Bible translations* page — that date is the transitional unpublished-Crown-copyright horizon, not the letters patent. Do not write “KJV Crown copyright expires 2039” into `CLAUDE.md`.

**[fact]** Wikipedia, *King James Version*, § Copyright status, retrieved 2026-09-11 (the source `CLAUDE.md` already cited; used here only where it restates the prerogative and names the patentees):

- Public domain in most of the world.
- In the UK, the right to print, publish, and distribute is a royal prerogative; the Crown licenses publishers under letters patent.
- England, Wales, Northern Ireland: King’s Printer — now Cambridge University Press (via Eyre & Spottiswoode, 1990). Oxford University Press holds its own historic privilege. Scotland: Scottish Bible Board (Collins licensed).
- The letters patent prohibit others from printing, publishing, or **importing** the Authorised Version into the United Kingdom.
- CDPA s. 171(b) is cited as the saving of the prerogative.

**[fact]** Cambridge University Press, imprint in *The Cambridge KJV Family Chronicle Bible* (first published 2021), PDF sample pages on cambridge.org, retrieved 2026-09-11. CUP’s own printed statement:

> “RIGHTS IN THE AUTHORIZED (KING JAMES) VERSION OF THE BIBLE ARE VESTED IN THE CROWN THIS EDITION IS PUBLISHED BY CAMBRIDGE UNIVERSITY PRESS, THE QUEEN’S PRINTER, UNDER ROYAL LETTERS PATENT”
>
> “Rights in the Authorized (King James) Version of the Bible are administered in the United Kingdom by the Crown’s patentee, Cambridge University Press. Applications for permission for liturgical or non-commercial educational use up to a maximum of 500 verses (and less than a full book) not required. Other uses subject to written permission being obtained from Cambridge University Press.”

CUP’s live HTML rights page returned **503** on 2026-09-11; the imprint PDF and the Bibles permissions request form on the same host (`Bibles Request Form - Permissions.pdf`) were retrieved. CUP’s 2026 site still routes “Bibles” permissions to a dedicated team (`permissions@cambridge.org`) separately from PLSClear. **[fact]**

**[fact]** Church of England, *A Brief Guide to Liturgical Copyright*, 3rd ed., Archbishops’ Council, 2000, retrieved 2026-09-11, § “Authorized Version (AV), also known as the King James Version (KJV)”:

- Rights administered by Cambridge University Press.
- “Application not required for liturgical use up to a maximum of 500 verses (not including a complete biblical book).”
- Prescribed acknowledgement: “From The Authorized (King James) Version. Rights in the Authorized Version are vested in the Crown. Reproduced by permission of the Crown’s patentee, Cambridge University Press.”

**[fact]** eBible.org copyright page (19 Aug 2026): to **print** this translation in the UK or **import printed copies** into the UK, permission is required; CUP, OUP, and Collins hold the exclusive UK print right; “this royal decree has no effect outside of the UK.”

### The 500-verse figure

**[fact]** CUP’s 2021 imprint and the Church of England 2000 guide both say **500 verses**, not a complete book, liturgical / (CUP) non-commercial educational use, no application required.

**[fact]** Wikipedia’s *Permission* subsection (retrieved 2026-09-11) instead says “at most 500 **words**” and cites CUP “Bibles.” That wording disagrees with CUP’s own imprint and with the Church of England guide. **Do not use Wikipedia’s “500 words.”** Prefer CUP’s printed “500 verses.”

Secondary write-ups (not used as authority) often add “and not 25 per cent or more of the quoting work” and a shorter “just put KJV at the end” rule for church bulletins and similar materials not for sale. Those extra clauses were **not** on the CUP imprint PDF retrieved today. Treat them as **unverified against CUP’s current page**.

---

## Does this US GitHub Pages host need an extra licence?

### United States

**No extra U.S. copyright licence.** **[interpretation]** from Circular 15A + Cornell 2026 + the product’s 1769 Gospel extracts.

The host is GitHub Pages. The text is the historic KJV wording, not a modern translation (NIV, ESV, NKJV, …). `lib/scripture.js` already forbids those names in Advisor prose. **[fact]**

### United Kingdom

**[interpretation]** Three different UK questions get collapsed into one. Keep them apart.

1. **Is the wording still restricted in the UK?** Yes, as a prerogative over printing, publishing, and importing, not as a 50-year Crown copyright. CUP is the patentee to ask.
2. **Does a US website that UK readers can open “publish in the UK”?** Not answered by any official source retrieved today. eBible and CUP’s imprint talk about **printing** and **importing printed copies**. No official CUP or National Archives page retrieved today states that a US-hosted HTML extract is, or is not, a UK publication. This note will not invent a case.
3. **If CUP’s own 500-verse exemption were applied as if this were a UK publication, would the product fit?** The on-page letter quotes would. The **library** would not: `public/library.json` holds **1,934** spoken verses, which is above 500, even though it is not a complete Gospel. Seek / The letters is a substantial extract of the AV text, not a bulletin. That is the UK-shaped risk if Dean later treats the site as a UK publication or ships a UK store build.

**[interpretation]** For the settled architecture — US GitHub Pages, advisor-first, spoken Gospels only — the honest position is the one `CLAUDE.md` already took: public domain **outside** the UK; letters patent **in** the UK. A US host quoting Gospel speech does **not** need a U.S. licence. It does **not** currently hold a CUP licence, and it should not pretend to.

**[recommendation]**

- **Ship on GitHub Pages as planned.** Do not block the US host on a UK printing privilege.
- **Do not write CUP for a licence** unless Dean decides to (a) sell the folio in the UK, (b) print or import physical copies in the UK, (c) ship an App Store / Play build that CUP would treat as a UK publication, or (d) put the full 1,934-verse library on a UK-facing commercial product. If he does any of those, the address is CUP Bibles permissions (`permissions@cambridge.org` on the 2026 CUP form), and the ask is for the spoken-Gospels extract, not a full Bible.
- **Do not swap to NIV/ESV/etc.** to “avoid” this. Those need publisher licences everywhere.
- Native wrappers (`CLAUDE.md` open question 4) are a **new** distribution decision. A UK store listing is closer to “publishing in the UK” than a US Pages URL is. Revisit this note then.

---

## What the product must print beside citations

### What it prints today

**[fact]** `public/index.html` suffixes every painted citation with ` · KJV` (Today word, affirmation, Sit, Seek passages, library folio, vespers, print sheet, canvas card). Blessing preview uses the same. `welcome.html`: “Quoted speech is King James, public domain.”

### What the sources require

| Jurisdiction / situation | Required notice | Source |
| --- | --- | --- |
| United States, public-domain 1769 text | **Nothing.** Attribution is courtesy and good scholarship, not a copyright condition. | Circular 15A; Cornell 2026; Bible Gateway; Wikisource |
| UK, CUP liturgical / non-commercial educational exemption (≤500 verses, not a complete book) | CUP’s prescribed Crown line (Church of England 2000; CUP imprint points at written permission for anything else) | CofE *Brief Guide*; CUP 2021 imprint |
| UK, materials not for sale (bulletins, posters) — **secondary**, not on the CUP imprint PDF | Initials **KJV** at the end of the quotation | Reported CUP “Rights and Permissions: KJV” text in secondary discussions; **not independently retrieved as a live CUP HTML page on 2026-09-11** |
| UK, above 500 verses or commercial / complete book | Written CUP permission; then whatever acknowledgement CUP sets | CUP 2021 imprint |

### What this product should print

**[recommendation]** — specific to Red Letter, not a general Bible-app sermon.

1. **Keep ` · KJV` beside every citation.** It is already there. It is the correct US attribution. It is also the lightest mark CUP’s secondary notices describe for things not for sale. Do not remove it. Do not replace it with `NKJV` or a living translation name.
2. **Do not add** “Reproduced by permission of the Crown’s patentee, Cambridge University Press” **unless CUP has granted that permission.** Printing that line without a grant is a false claim.
3. **Do not change `CLAUDE.md`** to “public domain worldwide.” The UK prerogative is real. The current sentence is the accurate one-line version.
4. **Tighten the public sentences when someone next edits copy** (not this note):
   - `README.md` “KJV text is public domain” → “KJV text is public domain in the United States. In the United Kingdom, rights in the Authorised Version are vested in the Crown.”
   - `welcome.html` “King James, public domain” → the same distinction, or simply “King James Version (1769).”
   - A colophon / Settings line may say: spoken words from the King James Version (1769); public domain in the United States; UK Crown letters patent administered by Cambridge University Press. That is a **status** line, not a permission line.
5. **`RELEASE.md` “Translation licence recorded”** is true for the US host decision. It is not a CUP grant. Leave the row; do not upgrade it to “UK licence obtained.”
6. **The 1,934-verse library** is the one surface that would matter if Dean ever asks CUP. Letters and daily rooms quote far fewer than 500 verses at a time.

---

## Implications for the three named files

### `CLAUDE.md` copyright line

Settled text: “Translation: **KJV**, public domain outside the UK (Crown letters patent apply in the UK) … VERIFIED 2026-09-06 via Wikipedia, *King James Version*, § Copyright status.”

**[interpretation]** The claim survives a 2026-09-11 check against CUP’s own imprint, CDPA s. 171, Circular 15A, Cornell 2026, eBible 2026-08-19, Wikisource, and Bible Gateway. Wikipedia remains a fair summary of the prerogative; it is no longer the only citation, and its “500 words” permission aside should be ignored.

**[recommendation]** Keep the settled line. If Dean later wants the verification row updated, point it at this note plus Circular 15A (04/2026) and the CUP 2021 imprint. Do not add “2039.” Do not add “we are licensed by Cambridge.”

### `public/manifest.json`

**[interpretation]** No licence field belongs here. The manifest is the install document (`adjacent-02`). Scripture status is copy, not `display` / `start_url`.

### `RELEASE.md`

**[interpretation]** “Translation licence recorded” = the US public-domain decision is written down. The five-minute phone walk does not need a copyright step. If Dean ever ships a UK store build, add a row: “CUP written permission — unverified until obtained.”

---

## Sources (retrieval 2026-09-11)

Full bibliography: `docs/research/sources.md` § Adjacent 03.

Primary:

- U.S. Copyright Office, Circular 15A *Duration of Copyright*, revised 04/2026, https://copyright.gov/circs/circ15a.pdf
- Cornell University Library, *Copyright Term and the Public Domain in the United States*, updated 1 January 2026, https://guides.library.cornell.edu/copyright/publicdomain
- UK, *Copyright, Designs and Patents Act 1988*, s. 171, https://www.legislation.gov.uk/ukpga/1988/48/section/171
- Cambridge University Press, *The Cambridge KJV Family Chronicle Bible* sample pages (2021 imprint), https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf
- Cambridge University Press, Bibles permissions request form, https://www.cambridge.org/sites/default/files/media/documents/Bibles%20Request%20Form%20-%20Permissions.pdf
- Church of England / Archbishops’ Council, *A Brief Guide to Liturgical Copyright*, 3rd ed. (2000), https://www.churchofengland.org/sites/default/files/2017-11/Brief%20guide%20to%20liturgical%20copyright.pdf
- eBible.org, KJV 1769 copyright page, generated 19 August 2026, https://ebible.org/eng-kjv/copyright.htm
- Wikisource, *Bible (King James)* (1769), https://en.wikisource.org/wiki/Bible_(King_James)
- Bible Gateway, KJV version information, https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/
- Wikipedia, *King James Version*, § Copyright status (already cited by `CLAUDE.md`; cross-check only), https://en.wikipedia.org/wiki/King_James_Version#Copyright_status
