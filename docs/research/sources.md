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

---

## Adjacent 02 — iOS / Android PWA install reality (2026)

All URLs retrieved **2026-09-11** unless a page carries its own date, which is noted.

| ID | Source | URL | Date on page | Used for |
| --- | --- | --- | --- | --- |
| PWA-01 | WebKit, *WebKit Features in Safari 26.0* (Jen Simmons et al.) | https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ | 15 Sep 2025 | iOS 26 / iPadOS 26: every site can be a Home Screen web app; “Open as Web App” default; manifest still used for icons; service workers never required for iOS installability; “zero requirements for installability” |
| PWA-02 | Apple Developer Documentation, *Sending web push notifications in web apps and browsers* | https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers | © 2026 Apple Inc. | Web Push on Home Screen web apps iOS 16.4+; user-gesture subscribe; VAPID; `https://*.push.apple.com`; no Apple Developer Program required; no silent push |
| PWA-03 | web.dev, *What does it take to be installable?* (Pete LePage) | https://web.dev/articles/install-criteria | Last updated 2024-09-19 UTC | Chrome `beforeinstallprompt` criteria: HTTPS, 192+512 icons, `start_url`, `display`, engagement (1 tap + 30s), not already installed |
| PWA-04 | web.dev, *How to provide your own in-app install experience* (Pete LePage) | https://web.dev/articles/customize-install | Published 14 Feb 2020 | `beforeinstallprompt` / `prompt()` / `userChoice` / `appinstalled`; `display-mode` + `navigator.standalone` detection pattern |
| PWA-05 | web.dev, *Installation prompt* | https://web.dev/learn/pwa/installation-prompt | (live learn module; retrieved 2026-09-11) | Richer Android dialog needs `description` + `screenshots`; Chrome/Edge on iOS cannot install; iOS fallback is Share → Add to Home Screen; hide install UI in `standalone` |
| PWA-06 | MDN, *Making PWAs installable* | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable | retrieved 2026-09-11 | Chromium required manifest members; HTTPS; `beforeinstallprompt` not on iOS; Android WebAPK vs shortcut; iOS 16.4+ Share-menu install from other browsers |
| PWA-07 | MDN, `Window: beforeinstallprompt event` | https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event | retrieved 2026-09-11 | Event shape; `prompt()`; limited availability |
| PWA-08 | MDN, Web app manifest `display` | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display | retrieved 2026-09-11 | `standalone` = no URL bar, status bar may remain; fallback chain |
| PWA-09 | MDN, *Notifications API* | https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API | retrieved 2026-09-11 | Persistent vs non-persistent; mobile must use service-worker notifications |
| PWA-10 | MDN, `Notification()` constructor | https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification | retrieved 2026-09-11 | Throws `TypeError` on nearly all mobile browsers; use `ServiceWorkerRegistration.showNotification()` |
| PWA-11 | MDN, *Using the Notifications API* | https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API | retrieved 2026-09-11 | Permission from a user gesture; same mobile `TypeError` warning |
| PWA-12 | MDN, `SpeechSynthesis` | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis | retrieved 2026-09-11 | Baseline widely available since Sep 2018 |
| PWA-13 | MDN, `Navigator.share()` | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share | retrieved 2026-09-11 | Secure context; user activation; PNG among shareable types |
| PWA-14 | GitHub Docs, *Securing your GitHub Pages site with HTTPS* | https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https | retrieved 2026-09-11 | `github.io` sites created after 15 Jun 2016 are HTTPS automatically; Enforce HTTPS |

Product files read (not web sources): `public/manifest.json`, `public/sw.js`, `public/index.html` (Keep, reminder, `speechSynthesis`, share, SW register), `RELEASE.md` § Phone, `CLAUDE.md` mobile decision, `.github/workflows/pages.yml`.

Not used as authority: third-party blogs (MacRumors, heise, firt.dev, Stack Overflow) were skimmed only to find the official WebKit / Apple URLs.

---

## Adjacent 03 — KJV copyright / Crown letters patent / US public domain (2026)

All URLs retrieved **2026-09-11** unless noted.

| ID | Source | URL | Date on page | Used for |
| --- | --- | --- | --- | --- |
| KJV-01 | U.S. Copyright Office, Circular 15A *Duration of Copyright* | https://copyright.gov/circs/circ15a.pdf | Reviewed 08/2011, **revised 04/2026** | Works published in the U.S. before 1 Jan 1931 are public domain; URAA restoration described (does not re-protect 1611/1769) |
| KJV-02 | Cornell University Library, *Copyright Term and the Public Domain in the United States* | https://guides.library.cornell.edu/copyright/publicdomain | Updated **1 January 2026** | U.S. and foreign-publication charts as of Public Domain Day 2026; pre-1931 foreign works PD |
| KJV-03 | UK statute, *Copyright, Designs and Patents Act 1988*, s. 171 | https://www.legislation.gov.uk/ukpga/1988/48/section/171 | 1988 c. 48; page notes no outstanding effects | s. 171(1)(b) saves Crown privileges “subsisting otherwise than under an enactment” — the letters-patent prerogative, not a 50-year Crown copyright |
| KJV-04 | Cambridge University Press, sample pages for *The Cambridge KJV Family Chronicle Bible* | https://www.cambridge.org/sites/default/files/media/documents/Sample%20Text%20Pages.pdf | Edition first published **2021** | CUP’s own imprint: rights vested in the Crown; Queen’s Printer under royal letters patent; liturgical / non-commercial educational use ≤ **500 verses** and less than a full book — no application; other uses need written permission |
| KJV-05 | Cambridge University Press, *Bibles and Prayer Books* permissions request form | https://www.cambridge.org/sites/default/files/media/documents/Bibles%20Request%20Form%20-%20Permissions.pdf | retrieved 2026-09-11 | Dedicated Bibles team; return to `permissions@cambridge.org`; KJV listed among versions that may need a form |
| KJV-06 | Cambridge University Press & Assessment, *Permissions requests* | https://www.cambridge.org/rights-and-permissions/permissions | page © **2026** | Bibles / BCP permissions are a separate team from PLSClear / RightsLink. (The dedicated HTML rights article returned HTTP 503 on 2026-09-11; imprint PDF used instead.) |
| KJV-07 | Church of England / Archbishops’ Council, *A Brief Guide to Liturgical Copyright*, 3rd ed. | https://www.churchofengland.org/sites/default/files/2017-11/Brief%20guide%20to%20liturgical%20copyright.pdf | Third edition © 2000 (PDF hosted 2017) | AV/KJV: CUP; no application for liturgical use ≤ 500 verses, not a complete book; prescribed Crown acknowledgement text |
| KJV-08 | eBible.org, *King James Version + Apocrypha* copyright page | https://ebible.org/eng-kjv/copyright.htm | HTML generated **19 Aug 2026** | 1769 text public domain outside the UK; letters patent restrict UK printing and import of printed copies; names CUP, OUP, Collins |
| KJV-09 | Wikisource, *Bible (King James)* (1769 Oxford / Blayney) | https://en.wikisource.org/wiki/Bible_(King_James) | retrieved 2026-09-11 | Pre-1 Jan 1931; public domain in the United States; not necessarily restriction-free in the UK |
| KJV-10 | Bible Gateway, *King James Version (KJV) — Version Information* | https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/ | retrieved 2026-09-11 | “The KJV is public domain in the United States.” |
| KJV-11 | Wikipedia, *King James Version*, § Copyright status | https://en.wikipedia.org/wiki/King_James_Version#Copyright_status | retrieved 2026-09-11 | Already cited by `CLAUDE.md` (2026-09-06). Used only as a cross-check of the prerogative / patentees. **Do not use** its Permission subsection “500 words” (conflicts with KJV-04 and KJV-07, which say 500 **verses**). Ignore “expires 2039” on the related *List of English Bible translations* table — that is the unpublished-Crown-copyright horizon, not the letters patent. |

Product files read: `CLAUDE.md` translation row; `README.md` last paragraph; `RELEASE.md` “Translation licence recorded”; `public/index.html` citation suffixes; `public/welcome.html`; `public/library.json` (`count` 663, `verses` 1934); `scripts/build-kjv.js`; `docs/red-letter-map.md`.

Not used as authority: Law Stack Exchange, LegalClarity, kjbhistory.com, TBS commentary, LinkedIn. They helped locate CUP PDFs; they are not cited in the brief as law.

Attempted and failed on 2026-09-11: `https://www.cambridge.org/bibles/about/rights-and-permissions/` and the `/gb/universitypress/…` redirect (HTTP 503 / Cloudflare). `https://www.cambridge.org/about-us/who-we-are/queens-printers-patent` (linked from eBible) timed out. The 2021 CUP imprint (KJV-04) is the official CUP text used instead.

---

## Adjacent 01 — Crisis standards (suicidal ideation, poisoning, DV, bereavement)

Retrieved 2026-09-11. Full synthesis: `docs/research/adjacent-01-crisis-standards.md`. Official pages were read on that date; numbers below are as printed then.

### Official helplines and scope

- 988 Suicide & Crisis Lifeline, homepage, https://988lifeline.org/. 988; 24/7/365; free; confidential; mental health, emotional distress, alcohol or drug use, “just need someone.”
- 988 Lifeline, “Get Help,” https://988lifeline.org/get-help/. Call, text, or chat; Veterans: 988 then 1 or text 838255; Spanish: 988 then 2 or text AYUDA; Deaf videophone; TTY 711 then 988; people do not have to be suicidal; intimate-partner violence listed among reasons.
- 988 Lifeline, “Loss Survivors,” https://988lifeline.org/help-yourself/loss-survivors/. 988 for suicide-loss survivors; those survivors are also at risk of suicidal thoughts.
- 988 Lifeline FAQ, “Does 1-800-273-TALK (8255) still work?,” https://988lifeline.org/faq/about-us/faq-does-1-800-273-talk-8255-still-work/. Old 10-digit number remains in service after the 16 July 2022 conversion.
- 988 Lifeline FAQ, LGBTQI+ specialized services, https://988lifeline.org/faq/calling-the-988-lifeline/faq-are-there-specialized-services-for-lgbtqi-youth-who-reach-out-to-988/. Press 3 / text PRIDE / pre-chat box closed 17 July 2025.
- SAMHSA, “988 Frequently Asked Questions,” https://www.samhsa.gov/mental-health/988/faqs. Full 988 scope; 240+ languages; 988 vs 911 (attempt in progress, plan with means, suspected overdose); old number still works; no insurance required.
- SAMHSA, “988 Suicide & Crisis Lifeline,” https://www.samhsa.gov/mental-health/988. Hub; page last-updated stamp 26 September 2025.
- SAMHSA, “988 Key Messages,” https://www.samhsa.gov/mental-health/988/key-messages. Call/text/chat; worried about a loved one; last updated 17 July 2025.
- SAMHSA, “Crisis Help,” https://www.samhsa.gov/find-support/in-crisis. 988 plus SAMHSA Helpline 1-800-662-4357 (treatment referral, not a 988 substitute).
- FCC, “988 Suicide & Crisis Lifeline,” https://www.fcc.gov/988-suicide-and-crisis-lifeline. Voice/text/chat/videophone; Veterans press 1; Spanish press 2 / AYUDA / Spanish chat.
- America’s Poison Centers, PoisonHelp.org, https://www.poisonhelp.org/. 1-800-222-1222; 911 if collapse, seizure, trouble breathing, or cannot be awakened; “Serious poisonings don’t always have early signs”; © 2026; self-harm interstitial still shows 1-800-273-8255.
- America’s Poison Centers, “Get Poison Help,” https://poisoncenters.org/get-poison-help. Same number; 24/7 specialists. One homepage paragraph still says “54” centers.
- America’s Poison Centers, “Our Members,” https://www.poisoncenters.org/about/our-members. 53 U.S. centers; 1-800-222-1222.
- HRSA, “Poison Centers,” https://poisonhelp.hrsa.gov/poison-centers. Federal page for the same number.
- National Domestic Violence Hotline, https://www.thehotline.org/. 1-800-799-SAFE (7233); text START to 88788; 911 if immediate danger; 24/7; “Ruth” AI as overflow; StrongHearts 844-762-8483; teen 866-331-9474; Deaf VP 855-812-1001.
- The Hotline, “Internet Safety for Survivors,” https://www.thehotline.org/plan-for-safety/internet-safety/. Internet use can be monitored and “is impossible to erase completely”; Escape / red X; clear history; incognito is not enough.
- Find A Helpline, https://findahelpline.com/. Verified helplines in 175+ countries; ThroughLine; lists 988, Crisis Text Line, Trevor as U.S. examples.
- IASP, “Crisis Centres & Helplines,” https://www.iasp.info/crisis-centres-helplines/. IASP is not a crisis centre; partners with ThroughLine / Find A Helpline (copy says 150+ countries).
- IASP, “Suicidal Crisis Support,” https://www.iasp.info/suicidalthoughts/. Local emergency services if in danger; helplines; asking about suicide does not increase risk.
- IASP Helplines Best Practices SIG, https://www.iasp.info/specialinterestgroups/helplinesbestpractices/. Practice exchange; not a binding digital detection spec.
- IASP, “Updates from the Helplines Best Practices Special Interest Group,” 26 May 2022, https://www.iasp.info/2022/05/26/updates-from-the-helplines-best-practices-special-interest-group/. Earlier public statement that Find A Helpline is the official IASP partner.
- ThroughLine, https://www.throughlinecare.com/. Operator of Find A Helpline; 1,500+ services; 170+ countries (count differs slightly from the consumer 175+).
- The Trevor Project, “Closed: … 988 … LGBTQ+ Youth Specialized Services,” 17 July 2025, https://www.thetrevorproject.org/blog/closed-trump-admin-officially-shuts-down-the-988-suicide-crisis-lifelines-lgbtq-youth-specialized-services/. Advocacy confirmation of the 17 July 2025 closure; Trevor’s own 1-866-488-7386 / text START to 678678. Not a SAMHSA page.
- U.S. GAO, *GAO-26-108114, Suicide Prevention: Capacity and Federal Assessment of the 988 Lifeline*, https://www.gao.gov/assets/gao-26-108114.pdf. 200+ independent centers; routing/capacity context.

### Digital-safety practice (abuse)

- NNEDV Safety Net Project, “Exit From This Website Quickly,” https://www.techsafety.org/exit-from-this-website-quickly. Quick Exit is for over-the-shoulder use; does not clear history or defeat spyware.
- NNEDV Safety Net Project, “Agency Website Safety Tips,” https://www.techsafety.org/agency-website-safety-tips. Safety alert on every page; Quick Exit to a neutral fast-loading page; other ways to get help.

### Professional / official AI and suicide-prevention guidance

- IASP, “Online Safety, AI and Suicide Prevention at WHA79,” 10 June 2026, https://www.iasp.info/2026/06/10/online-safety-ai-and-suicide-prevention/. Co-hosted with Orygen, Safe Online, Crisis Text Line. Handoff to a trained person, not a disclaimer or a list of hotlines; distinguish a validated clinical tool from a general-purpose chatbot.
- WHO, LIVE LIFE Initiative for Suicide Prevention, https://www.who.int/initiatives/live-life-initiative-for-suicide-prevention. Four evidence-based interventions plus pillars.
- WHO, *LIVE LIFE: An implementation guide for suicide prevention in countries*, 17 June 2021, https://www.who.int/publications/i/item/9789240026629. National implementation guide, not an app spec.
- WHO, “World leaders adopt a historic global declaration on noncommunicable diseases and mental health,” 16 December 2025, https://www.who.int/news/item/16-12-2025-world-leaders-adopt-a-historic-global-declaration-on-noncommunicable-diseases-and-mental-health. After the 25 September 2025 high-level meeting; digital harms named.
- American Psychological Association, *Health Advisory on the Use of Generative AI Chatbots and Wellness Applications for Mental Health*, November 2025. Official landing page https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-chatbots-wellness-apps (JS shell did not render in this environment). Full text read from the advisory PDF hosted at https://www.infocop.es/wp-content/uploads/2025/11/health-advisory-ai-chatbots-wellness-apps-mental-health.pdf. Crisis path + 988 + clickable human resources + “not a licensed professional.”
- New York Governor Kathy Hochul, “Governor Hochul Pens Letter to AI Companion Companies…,” 10 November 2025, https://www.governor.ny.gov/news/governor-hochul-pens-letter-ai-companion-companies-notifying-them-safeguard-requirements-are. GBL Article 47 effective 5 November 2025. Detect suicidal ideation / self-harm and refer to crisis services; recurring “not a human” notices.
- California Senate Bill 243 (Chapter 677, Statutes of 2025), https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB243. Signed 13 October 2025; operative 1 January 2026. Companion-chatbot protocol, crisis-service notification, published protocol, Office of Suicide Prevention reports from 1 July 2027.
- Illinois 104th General Assembly, SB 3384 (introduced 4 February 2026), https://ilga.gov/ftp/legislation/104/SB/10400SB3384.htm. Proposed companion-safety act; bill effective date 1 January 2027. **Not confirmed enacted as of 2026-09-11.**

### Scholarly and research (no invented papers)

- Ngo et al., “Natural language processing system for rapid detection and intervention of mental health crisis chat messages,” *npj Digital Medicine* (2023), https://doi.org/10.1038/s41746-023-00951-3. Staffed detector; stakeholder false-positive : false-negative cost 1:20; about four in ten surfaced messages still false positives.
- Szanto, Nock, et al., “Consensus Statement on Ethical & Safety Practices for Conducting Digital Monitoring Studies with People at Risk of Suicide and Related Behaviors,” *Psychiatric Research and Clinical Practice* (2021), https://doi.org/10.1176/appi.prcp.20200029. Research-protocol consensus; human outreach for imminent risk. Not a consumer-app spec.
- Baffsky, Robinson, et al., “Best practice for integrating digital interventions into clinical care for young people at risk of suicide: a Delphi study,” *BMC Psychiatry* (2024), https://doi.org/10.1186/s12888-023-05448-7. Clinician guidelines; panel did not agree exact actions by risk band.
- “Suicide- and crisis-risk detection using large language models in mental-health chatbots,” medRxiv 2026.01.12.26343914, https://www.medrxiv.org/content/10.64898/2026.01.12.26343914v1. **Preprint.** Near-zero-miss raised false-positive rate from ~41% to ~49%.
- “Development of a Consensus Statement to Guide AI Chatbot Responses to Suicide Risk Disclosure,” OSF / PsyArXiv, https://doi.org/10.31234/osf.io/txpem_v1. **Preprint.** Delphi February–May 2026. Crisis resources at higher C-SSRS-styled risk; encourage human contact across levels.
- Partnership on AI, “AI and Suicide Prevention: A Cross-Sector Primer,” arXiv:2605.04321, https://doi.org/10.48550/arxiv.2605.04321. **Preprint / industry primer.** Escalation rules unaligned; warm handoff unsolved.

### In-repo witnesses

- `CLAUDE.md` (settled crisis / poison / danger / bereaved decisions; open question 2 on known false triggers).
- `public/data/signals.js` (`CRISIS_NOTICE`, `POISON_LINE`, `DANGER_NOTICE`, detectors).
- `public/index.html` (title-page checkbox, Advisor trust line, `#crisis-modal`).
