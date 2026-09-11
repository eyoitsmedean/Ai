# Research sources

Shared bibliography for the adjacent-topic memos. Retrieved 2026-09-11 unless a memo says otherwise. Do not invent citations. Company press and store-intelligence estimates are marked; they are not audited financials.

---

## Adjacent 04 — Red-letter editorial practice

### Edition prefaces and publisher history

- Louis Klopsch, “Explanatory Note,” in *The Holy Bible: Red Letter Edition* (New York: Christian Herald, 1901), p. xvi. Quoted at length in Crossway, “The Origins of the Red-Letter Bible,” 23 March 2006, https://www.crossway.org/articles/red-letter-origin/.
- Charles M. Pepper, *Life-Work of Louis Klopsch: Romance of a Modern Knight of Mercy* (New York: Christian Herald, 1910), esp. pp. 324–25 (scholars enlisted; “instant success”), 314–16, 325. Cited by Crossway 2006.
- Margaret T. Hills, ed., *The English Bible in America* (New York: American Bible Society, 1962), pp. 326 (Holman), 329 (Nelson), 342 (Winston). Cited by Crossway 2006.
- Hugh A. Moran, “Louis Klopsch,” in *Dictionary of American Biography*, ed. Dumas Malone (New York: Scribner’s, 1933), 10:447. Cited by Crossway 2006.
- Crossway, “The Origins of the Red-Letter Bible,” 23 March 2006, https://www.crossway.org/articles/red-letter-origin/.
- American Bible Society, “When Did Publishers Start Printing Red Letter Bibles?” 10 March 2011 (Gerald C. Studer), https://www.americanbible.org/news/articles/when-did-publishers-start-printing-red-letter-bibles/.
- Philip Sellew, “Red Letter Bible,” in *The Oxford Companion to the Bible*, ed. Bruce M. Metzger and Michael D. Coogan (New York: Oxford University Press, 1993), p. 619. Cited by Crossway 2006 (via Funk/Hoover and Laurence S. Heely, Jr.).
- Robert W. Funk, Roy W. Hoover, et al., *The Five Gospels* (New York: Macmillan, 1993), p. 37. Cited by Crossway 2006 for the Luke 22:20 origin story.
- NIV Committee on Bible Translation, “Preface” (2011). Transcription: https://www.bible-researcher.com/niv2011-preface.html. Red-letter editions are “a publisher’s choice — one the committee does not endorse.” Mark 16:9–20 and John 7:53–8:11 set off by brackets and a different typeface.
- Brian LeStourgeon, “My Customer Thought She Found a ‘Major Flaw’ in Her New Bible,” *BBH Church Connection*, 27 December 2011, https://bbhchurchconnection.wordpress.com/2011/12/27/my-customer-thought-she-found-a-major-flaw-in-her-new-bible/. NIV 2011 (following TNIV) ends Jesus’s speech at John 3:15.
- Phillip J. Long, “John 3:16 and Red Letter Bibles,” *Reading Acts*, 17 October 2011, https://readingacts.com/2011/10/17/john-316-and-red-letter-bibles/. Survey of Brown, Moloney, Köstenberger, Witherington, Schnackenburg on where the quotation ends.
- “Red letter edition,” Wikipedia, https://en.wikipedia.org/wiki/Red_letter_bible. Used only for the NIV 3:21 footnote (“Some interpreters end the quotation after verse 15”) and the 1899/1901 titles; Klopsch quotes taken from Crossway / Pepper instead.
- Brian Edwards, “The story behind the red letters in your Bible,” *Christian Today*, https://www.christiantoday.com/news/the-story-behind-the-red-letters-in-your-bible. Secondary narrative; John 3:15 vs 3:21 disagreement.

### OSIS / electronic markup

- Patrick Durusau, *OSIS 2.1.1 User’s Manual* (American Bible Society / Bible Technologies Group, 2006). `q` / `who="Jesus"` example and red-letter presentation. PDF via CrossWire: https://crosswire.org/svn/jsword/trunk/jsword/etc/osis/OSIS2_1_1UserManual.pdf.
- CrossWire Bible Society, “OSIS Bibles” wiki, “Marking the Words of Christ,” `q who="Jesus"`. https://wiki.crosswire.org/OSIS_Bibles.
- CrossWire Bible Society, “CrossWire KJV” wiki. Red-letter reference: Old Scofield (modules 2.3–2.9); Louis Klopsch 1901 adopted 28 January 2016 for module 2.10+. Scan: https://archive.org/details/rubricated-american-heritage-bible-e-book. https://wiki.crosswire.org/CrossWire_KJV.
- SWORD `OSISRedLetterWords` filter source: looks for `who="Jesus"` on `q`. https://www.crosswire.org/sword/apiref/osisredletterwords_8cpp_source.html.
- Michael Paul Johnson / David Haslam / DM Smith, `sword-devel` thread “KJV with strong numbers,” 15 November 2019. eBible KJV taken from DM’s source; Haiola regeneration; not the same OSIS file as CrossWire KJV. http://crosswire.org/pipermail/sword-devel/2019-November/047417.html.
- eBible.org KJV OSIS 1769, this checkout’s named witness: seven1m/open-bibles `eng-kjv.osis.xml` at commit `7768dac` (2015-05-07), source revision 2013-07-12, SHA-256 `eeeae647fc28360ce47f9c0d5cc3b397b7fdd9913fe53dc9f44eb6deee50e253`. WEB USFX witness, same commit, SHA-256 `5ffa2626f170a109a4a96afc90775c06f0821cb4ba81ed34e63663e085708d68`. Recorded in `docs/red-letter-map.md` and `data/red-letter-ebible-kjv.json` (built 2026-09-07).

### Textual criticism (John 8; Mark 16)

- Bruce M. Metzger, *A Textual Commentary on the Greek New Testament*, 2nd ed. (New York: United Bible Societies, 1994), pp. 187–89 (John 7:53–8:11); “The Ending(s) of Mark” (16:9–20). Consulted via the Biblis / commentary reprint of the John 7:53–8:11 article (https://www.bibliaplus.org/en/commentaries/428/a-textual-commentary-on-the-greek-new-testament-by-bruce-m-metzger/john/7/53-11) and the standard TCGNT extract on the longer ending.
- Nestle-Aland, *Novum Testamentum Graece*, 28th ed.: both pericopes in double brackets (status as cited in secondary discussion; the preface statement used above is NIV CBT 2011).
- Logos / Mark Ward, “‘The Earliest Manuscripts Do Not Have …’: How to Preach Mark 16 & John 8,” https://www.logos.com/grow/min-preaching-john-8-mark-16/. Popular summary of the critical consensus; not used as a primary edition.

### In-repo witnesses

- `docs/red-letter-map.md` (updated 2026-09-07): production vs eBible OSIS vs WEB counts; +57 / −3 / 70-span delta; do-not-swap recommendation.
- `lib/scripture.js`: `NOT_SPEECH`, `SPOKEN_OVERRIDES`, `NARRATOR_PREFIXES`, `SPOKEN_ADDITIONS`, `extractSpoken`.
- `data/red-letter-source.json`, `data/red-letter-ebible-kjv.json`: verse-level check of Father, angels, OT-on-His-lips, parable interiors, John 8, Mark 16 (run 2026-09-11).
- `CLAUDE.md`, `docs/bot-notes.md`: settled map decision.

---

## Adjacent 05 — Seasonal faith-app practice

### Calendars (Ash Wednesday 2027)

- United States Conference of Catholic Bishops, *Liturgical Calendar for the Dioceses of the United States of America — 2027*, “Principal Celebrations of the Liturgical Year 2027”: Ash Wednesday February 10, 2027; Easter Sunday March 28, 2027. First printing April 2025; emendation February 2026. https://www.usccb.org/resources/2027cal.pdf.
- USCCB Divine Worship, calendar index (2027 file listed; updated 5 February 2026 for the optional memorial of St John Henry Newman). https://www.usccb.org/committees/divine-worship/liturgical-calendar.
- Church of England, Common Worship, “The Calendar,” year 2027: Ash Wednesday 10 February; Easter Day 28 March. https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/calendar.
- `lib/year.js` `easterSunday` / `ashWednesday` (Anonymous / Meeus). `ymd(ashWednesday(2027))` = 20270210; `ymd(easterSunday(2027))` = 20270328. `test/year.test.js` asserts Easter 2027 and Ash Wednesday 2026.

### Hallow / Pray40

- Ariel, “The Most Predictable Spike in the App Store,” Appfigures, 24 February 2026. Ash Wednesday 2026: 263k downloads; 2024/2025/2026 day-of figures; Lent-month download series; ~$40M 2025 net-revenue *estimate*; $10M March 2024 / $9.7M April 2025 *estimates*. https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue. **Third-party store intelligence, not audited.**
- Hallow, “Pray40: The Return” (2026 product page): “In 2025, nearly two-million people joined Pray40.” https://hallow.com/pray40/. **Company marketing.**
- Jessica Mouser, “Over 1.4 Million People Join Hallow’s Prayer Challenge for Lent,” ChurchLeaders, 6 March 2025. Quotes CEO Alex Jones, “1.3 million as of today!” https://churchleaders.com/news/507269-million-join-hallow-prayer-challenge-lent.html. **Company-reported, same-week.**
- ZENIT, “Hallow Announces Worldwide Lent Prayer Challenge … Pray40: The Way,” 4 March 2025. Repeats Hallow’s “nearly 1.7 million” for Pray40 2024. https://zenit.org/2025/03/03/hallow-announces-worldwide-lent-prayer-challenge-leading-up-to-easter-pray40-the-way/. **Company announcement.**
- Aleteia, “Hallow Catholic prayer app tops charts at #1,” 20 February 2026. https://aleteia.org/2026/02/20/hallow-catholic-prayer-app-tops-charts-at-1/.
- ZENIT, “Hallow surpasses WhatsApp and ChatGPT…,” 22 February 2026. https://zenit.org/2026/02/22/hallow-surpasses-whatsapp-and-chatgpt-to-become-the-most-downloaded-app-in-the-apple-store/.
- Hallow / PR Newswire, “Hallow App Crosses 10 Million Downloads, tops App Store, and closes $50 Million Series C Fundraise,” 18 May 2023. $50M Series C, $105M total raised; 10M downloads; 225M prayers; Sensor Tower “largest prayer app.” https://www.prnewswire.com/news-releases/hallow-app-crosses-10-million-downloads-tops-app-store-and-closes-50-million-series-c-fundraise-301828490.html. **Company press.**
- Alex Jones, “10 Million Downloads & Series C Funding,” Hallow blog, May 2023. https://hallow.com/blog/10-million-installs/.

### YouVersion / lectio / surveys

- YouVersion, “Your 2025” impact report: 1B family-of-apps installs; 757M+ Bible App installs; 57M Bible Plan completions (2025). https://www.youversion.com/impact. **Company-reported.**
- YouVersion newsroom, “Easter marks the highest Bible engagement day in YouVersion history for Sub-Saharan Africa and globally,” 9 April 2026. 21.6M Easter Sunday 2026 DAU; 18.7M Holy Week average DAU; +15% YoY. Engagement = DAU across Bible App, Lite, Kids. https://youversion.com/news/easter-marks-the-highest-bible-engagement-day-in-youversion-history-for-sub-saharan-africa-and-globally. **Company-reported.**
- YouVersion Connect, “Bible Plan FAQ’s” (updated ~June 2026): ≤400 words/day; completion success spikes between 3 and 21 days; fewer 365-day English plans because shorter plans complete. https://partner-support.youversion.com/l/en/article/9ldbls6m05-bible-plan-faq-s.
- YouVersion church blog, “Helping Your Easter Reading Plan Reach and Serve More People”: ~40% of Plan *day* completions from longer plans, which are <1% of the library. https://www.youversion.com/church-blog/helping-your-easter-reading-plan.
- Lectio 365 / 24-7 Prayer, “Lectio 365 – 2 Million Downloads,” 31 March 2026. 2M downloads; “over 50 million times of prayer completed” in 2025. https://lectio365.com/spotlight-and-resources/lectio-365-2-million-downloads/. **Company marketing.**
- Lectio 365 homepage / community: “over 330k people worldwide.” https://lectio365.com/ ; https://lectio365.com/community/.
- Wonderful, “Lectio 365 | Transforming a Daily Prayer App Experience”: 1,325,414 downloads; 250,000 AMU (earlier snapshot). https://www.bewonderful.co.uk/work/lectio-365/.
- Barna Group, “Gen Z and Millennials Fuel a Bible Reading Comeback,” *State of the Church 2025* (with Gloo). Weekly Bible reading 30% (2024) → 42% (2025) of US adults; n > 12,000. https://www.barna.com/trends/bible-reading-trends/. **Survey.**

### Retention benchmarks (category estimates, not faith-app audits)

- Adjust, *Mobile App Trends 2024* (commonly cited: ~25% D1, steep drop by D7/D30; category splits). Restated by Sonar, Phiture, EngageLab (2024–2026). Vendor estimates; definitions of “Day 7” vary.
- AppsFlyer retention benchmark write-ups, 2023–2025, as restated by EngageLab, “How to Increase App Retention in 2026.” Cross-category D7 often quoted in the low teens.

### In-repo witnesses

- `public/data/paths.js`, `public/data/advisor.js` (`RLA_SEVEN`), `public/index.html` (`paintSeven`, `sevenDays`). Forty data-only; Seven Days is the UI path.
- `LAUNCH.md`, `IMPROVEMENT_PLAN.md`, `README.md`, `DESIGN.md`, `lib/year.js`, `test/eval.test.js` (Forty quotations must be His).
