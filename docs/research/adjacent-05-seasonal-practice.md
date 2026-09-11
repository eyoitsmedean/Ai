# Adjacent 5 — Seasonal faith-app practice

**Purpose.** Tell Dean what actually works for daily sitting products, verify Ash Wednesday 2027, and decide whether Forty should appear in the UI before Lent or whether Seven Days remains the only path.  
**Owner.** Dean.  
**Status.** Research only. No product code changed.  
**Updated.** 2026-09-11.  
**Canonical constraint.** Forty-day Lent path is data-only in this checkout; Seven Days ships. Launch thesis: nobody owns “live daily life guided only by the red letters.”

Figures below are tagged **company-reported**, **third-party estimate**, or **survey**. None of the download or revenue numbers in this memo are audited financial statements.

---

## What this checkout already ships

**Seven Days** is the only path the page paints. `public/index.html` `paintSeven()` / `sevenDays()` read `window.RLA_SEVEN` (Come, Peace, Light, Love, Forgive, Abide, Go). The kicker is hard-coded “Seven Days.” `[verified] (in-scope)`

**Forty** exists as data. `public/data/paths.js` builds `window.RLA_FORTY` from the curated daily words plus twelve extra rooms, then `slice(0, 40)`. `RLA_pathList('forty')` is defined and **never called** from the page. Tests (`test/eval.test.js`) already require every Forty quotation to be His exact words. `[verified] (in-scope)`

The paper already changes clothes for Lent (`lib/year.js`, `DESIGN.md`). The user is not asked to name the church year (`README.md`: “You never have to name the church year.”). `[verified] (in-scope)`

`LAUNCH.md` already wrote the operating sentence: until Lent, “Seven Days with His words is the Pray40 you can ship.” Day-7 health line: more than 18% of those who started. `[verified] (in-scope)`

---

## Ash Wednesday 2027

**10 February 2027.** Easter Sunday **28 March 2027.**

Three independent witnesses agree:

| Witness | Date | Kind |
| --- | --- | --- |
| USCCB, *Liturgical Calendar for the Dioceses of the United States of America — 2027*, “Principal Celebrations,” first printing April 2025, emendation February 2026 | Ash Wednesday February 10, 2027; Easter Sunday March 28, 2027 | Official Western Catholic ordo for the US |
| Church of England, Common Worship “The Calendar,” year 2027 | Ash Wednesday 10 February; Easter Day 28 March | Official Western Anglican calendar |
| `lib/year.js` `ashWednesday(2027)` / `easterSunday(2027)` (Anonymous / Meeus Gregorian computus) | `ymd` 20270210 / 20270328 | In-repo computation, already tested for Easter 2027 |

`[verified] (retrieved) 2026-09-11` USCCB PDF at usccb.org/resources/2027cal.pdf; CoE calendar page. `[verified] (in-scope)` `node` run of `lib/year.js` on 2026-09-11. `test/year.test.js` asserts Easter 2027 but does not yet assert Ash Wednesday 2027 (it asserts Ash Wednesday 2026 = 18 February). The computus is the same function.

Western Lent is forty *fasting* days. Sundays are not fast days, so the season from Ash Wednesday to Holy Saturday is **forty-six calendar days**. A 40-room path that sits every calendar day from 10 February 2027 ends on **21 March 2027** (Palm Sunday). Hallow’s Pray40 is the consecutive-calendar model, not the Sunday-skipping fast. `[verified] (retrieved) 2026-09-11` USCCB calendar span 10 February – 16 May 2027 is “Lent, Triduum, Easter”; the forty-day count is traditional, not a USCCB table.

---

## What the named seasonal products actually do

### Hallow — Pray40 (the payday)

Hallow does not sell a Bible reader. It sells a **named forty-day commitment that the calendar already named**.

**Third-party estimates (Appfigures Intelligence, article dated 24 February 2026, Ariel):**

| Signal | Figure | Caveat |
| --- | --- | --- |
| Ash Wednesday 18 February 2026 downloads | 263,000 that day | Appfigures estimate, not Apple-reported |
| Day before / day after | 77,000 / 236,000 | Same |
| “Normal” daily average cited | ~10,000 | Same; ~25× spike |
| First 22 days of February 2026 | 1.2 million downloads | Same |
| 2025 monthly average (most months) | ~280,000 downloads | Same |
| Ash Wednesday 2024 / 2025 / 2026 | 263k / 226k / 263k | Same; 2024 next-day peak 310k |
| Lent-month downloads 2023 / 2024 / 2025 | 1.2M / 2.0M / 1.5M | Same; 2024 was the peak |
| Net revenue, March 2024 / April 2025 | $10M / $9.7M | Appfigures *estimate*, after fees; not audited |
| Net revenue, calendar 2025 | ~$40M | Appfigures *estimate* |
| February 2026 revenue “so far” (as of 24 Feb) | ~$1.3M | Same; article notes conversion lags the trial |

Appfigures’ own reading: the Ash Wednesday *day* is clockwork; the weeks around it have shrunk since 2024; revenue follows **one or two months later** because of the free trial. That is the pattern to copy, not the celebrity roster. `[verified] (retrieved) 2026-09-11` https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue

**Company-reported participation (not audited):**

- 6 March 2025, ChurchLeaders, quoting CEO Alex Jones on Ash Wednesday week: “1.3 million as of today!”; the piece headlines “over 1.4 million.” `[verified] (retrieved) 2026-09-11`
- Hallow’s own Pray40 2026 page: “In 2025, nearly two-million people joined Pray40.” That is a later, higher company figure for the same season. `[verified] (retrieved) 2026-09-11` hallow.com/pray40
- ZENIT, 4 March 2025, repeating a Hallow announcement: “In 2024, nearly 1.7 million people joined Hallow’s Pray40.” `[verified] (retrieved) 2026-09-11`

Treat 1.3–1.4 million (March 2025, CEO in the week) as the least-inflated company number for 2025. Treat “nearly two million” as a later marketing total. Neither is an audited subscriber count. Appfigures’ 226k Ash Wednesday 2025 *downloads* and Hallow’s 1.4 million *challenge joins* can both be true: most joiners were already installed.

**Company-reported finance (press, not 10-K):** PR Newswire, 18 May 2023 — Series C $50 million led by Goodwater Capital, “bringing the total funding raised for Hallow to $105 million”; “passed 10 million downloads” and “225 million prayers prayed,” “largest prayer app in the world according to Sensor Tower.” Goodwater’s Eric Kim is quoted saying Hallow has reached “consumer engagement and retention levels shared by only a few companies throughout time.” **No retention percentage is published in that release.** `[verified] (retrieved) 2026-09-11`

Chart position (#1 on the US App Store on Ash Wednesday 2026, also 2024) is independently reported by Aleteia (20 February 2026) and ZENIT (22 February 2026). Rank is not revenue. `[verified] (retrieved) 2026-09-11`

### YouVersion — free plans, named holy days

YouVersion does not monetize. It does prove that **named days, not generic streaks, move daily sitting**.

**Company-reported (YouVersion Impact / newsroom, not audited):**

| Signal | Figure | Date / source |
| --- | --- | --- |
| Family-of-apps installs | 1 billion all-time | youversion.com/impact, “Your 2025” |
| Bible App installs | 757 million+ | Same |
| Bible Plan completions, 2025 | 57 million | Same |
| Easter Sunday 2026 DAU | 21.6 million | Newsroom, 9 April 2026 |
| Holy Week 2026 average DAU | 18.7 million | Same |
| Holy Week DAU vs 2025 | +15% global; +37% Sub-Saharan Africa | Same |
| Definition of “engagement” | DAU across Bible App, Lite, Kids | Same article, methodology note |

`[verified] (retrieved) 2026-09-11`

**Partner guidance (YouVersion Connect, not a consumer boast):**

- Devotional body: **400 words or fewer** per day, because “beyond that, people are less likely to engage consistently and complete the reading.”
- Plan length: minimum 3 days, maximum 365. They are “accepting fewer 365-day Plans (especially in English) because our Community is more likely to complete shorter Plans.”
- “We generally see spikes in completion success between **3 days and 21 days**.”
- “If your Plan makes the most sense at 30 days long, don’t cut it down to 21.” Length follows the story, not a growth hack.
- Easter 2026 partner blog: “Around 40% of Plan day completions are coming from longer Bible Plans, even though these make up less than 1% of the current Plan library.” That is *day* completions (pages sat), not *plan* completions (people who finish). Longer plans can dominate page-views while still finishing worse.

`[verified] (retrieved) 2026-09-11` partner-support.youversion.com, “Bible Plan FAQ’s”; youversion.com/church-blog/helping-your-easter-reading-plan.

YouVersion does **not** publish a public 40-day Lent finish rate. Anyone citing one is inventing it.

### Lectio 365 — the daily sitting, not the season

24-7 Prayer’s Lectio 365 (launched 2019) is the closest product to our lectio room: morning / midday / night, P.R.A.Y., no celebrity Lent machine.

**Company-reported (31 March 2026, lectio365.com):** 2 million downloads; “just last year” (2025) “over 50 million times of prayer completed.” Homepage / community page: “over 330k people worldwide” using the app. Wonderful’s case study (bewonderful.co.uk, undated, figures on the page): 1,325,414 total downloads and 250,000 active monthly users — an earlier snapshot than the March 2026 post. `[verified] (retrieved) 2026-09-11`

These are first-party marketing numbers. No D7, no finish rate, no audited MAU. What they do show: a **short daily rite**, repeated, without a 40-day gate, can accumulate tens of millions of sittings. That is Seven Days plus lectio, not Forty.

### Barna — the habit outside any one app

Barna / Gloo *State of the Church 2025*: weekly Bible reading among US adults rose from 30% in 2024 to **42%** in 2025 (more than 12,000 adults interviewed); 50% among self-identified Christians; Millennials 50% (+16 points). `[verified] (retrieved) 2026-09-11` barna.com/trends/bible-reading-trends/. Survey research, not an app metric. Useful only as demand weather: more people are opening Scripture again. They will not stay for a second path that is not yet a season.

---

## Retention: published ranges, not our numbers

We have **no** shipped D1 / D7 / D30 of our own. Until we do, use category bands and say so.

Industry aggregators (Adjust *Mobile App Trends 2024*; AppsFlyer retention write-ups 2023–2025; republished by Phiture, EngageLab, Sonar) put **cross-category** Day 1 near 25%, Day 7 near 8–13%, Day 30 near 5–7%. Health & fitness / education bands are a little higher on Day 7 (roughly 13–18% in those write-ups). Definitions differ (calendar day vs any session in seven days). The 2024 Adjust report is the most often cited primary; the blog restatements are secondary. `[verified] (retrieved) 2026-09-11` with the caveat that the percentages are **vendor estimates**, not a faith-app census.

`LAUNCH.md` already set Day-7 of Seven Days at **> 18% of starters**. That is the top of the health-and-fitness band, not a casual-app average. It is a target, not a measurement. `[verified] (in-scope)`

What the published products actually reveal, without pretending we have their cohort tables:

1. **A named season beats a generic 40.** Hallow’s spike is dated to Ash Wednesday, three years running, by a third party. YouVersion’s record DAU is dated to Easter Sunday 2026 by the company. Nobody publishes a matching spike for “start a 40-day plan on a random Tuesday.”
2. **Finish rates favour 3–21 days** when the publisher is YouVersion and the object is a Plan. Seven Days sits in that band. Forty does not, unless Lent is doing the naming.
3. **Longer journeys still get sat** (YouVersion: 40% of *day* completions from <1% of plans; Lectio 365: 50 million sittings in 2025 with no 40-day gate). Sitting ≠ finishing. A 40-room path shown in ordinary time will be opened and abandoned. A 40-room path that starts when the church is already fasting has a reason to be finished.
4. **Missed-day grace is load-bearing.** Hallow’s own reviews and our prior improvement note record that Pray40 does not cascade a user out for a missed day. Our Seven Days already increments only after lectio, next calendar morning (`IMPROVEMENT_PLAN.md`). Forty must inherit that, or a missed Wednesday in week three kills the season. `[inference] (in-scope)` from product behaviour already shipped; Hallow’s exact grace rule is not in a public spec.
5. **Celebrity is not transferable.** Pray40’s 2026 page leads with Roumie, Wahlberg, Pratt, Daigle. Appfigures treats that as the curiosity engine. `LAUNCH.md` already refused “celebrity as the product.” The sentence is the celebrity. Do not wait for a narrator before shipping Seven; do not add one to justify surfacing Forty early.

---

## Should Forty appear in the UI before Lent?

**No. Keep Seven Days as the only path in the UI. Keep Forty data-only until the week of 10 February 2027.**

Reasons, in order:

1. **The calendar is the launch.** Hallow’s own machine is “Ash Wednesday creates urgency, and the 40-day commitment locks users through Easter” (Appfigures, 24 February 2026). Surfacing Forty in ordinary time gives us the length without the urgency. We would be asking people to finish a Lent path while the paper is still Ordinary Time.

2. **Seven Days is the length that completes.** YouVersion’s published completion band is 3–21 days. Seven is seven. Forty is forty. Shipping both now splits the one habit we have not yet measured. The Day-7 target in `LAUNCH.md` (>18% of starters) is already ambitious against category Day-7 bands. A second ribbon on Today would lower both paths.

3. **Forty is not finished as a *story*.** It is a concatenation: curated daily words plus twelve extras, sliced at 40. Tests prove the quotations are His. They do not prove the forty rooms are a single Lent journey (wilderness → cross → the day before Palm Sunday). Hallow and YouVersion both say a long plan must “move the narrative or theme forward.” Ours does not, yet. Showing it would be showing a stack.

4. **The folio already refuses to name the church year.** `README.md` and `lib/year.js` change the paper in silence. A Forty kicker in September would be the first time the product asks the user to keep a liturgical score. That is a Lent privilege, not an ordinary-time feature.

5. **The data can stay live without the UI.** Quotes are already gated. Editors can keep writing rooms. `RLA_pathList('forty')` can stay. The page continues to call `sevenDays()`. On or after 3 February 2027 (one week before Ash Wednesday) — not before — the kicker may become “Forty,” the ribbon may grow, and the first room may be the wilderness or the ashes saying (Matthew 6:16–18 is the USCCB Ash Wednesday Gospel; it is His, and it is already in scope). Until then, Day 7 invites them to begin Seven again, which is what `LAUNCH.md` already says.

6. **Holy Week is a coda, not a forty-first room.** A consecutive 40 from 10 February 2027 lands on Palm Sunday 21 March. That is a good shape: Forty carries them to the gate; Holy Week can reuse Seven (Come / Peace / Light / Love / Forgive / Abide / Go) or sit in lectio on the Passion sayings. Do not invent a 46-day path to match the civil span of Lent. `[recommendation] (in-scope)`

---

## Implications — product decision

**Seven Days remains the only named path in the UI. Forty stays data-only until Lent 2027. Ash Wednesday is 10 February 2027; that date is the launch, not a soft-open in the autumn.**

Build now, off-stage:

- Make the forty rooms a single story that can start on Ash Wednesday and end on Palm Sunday 21 March 2027. Do not ship the current `fromDaily() + EXTRA` slice as if it were that story.
- Keep every quotation on the existing verifier. No Paul, no narrative, no angel, no Father’s voice.
- Inherit Seven’s grace: a missed day does not cascade the user out.
- Do not paywall Forty. `LAUNCH.md` already forbade locking the words. If a later paid tier exists, it is extra sittings or the live Advisor, not the path.
- Film in January 2027. Do not film Forty ads in ordinary time; the ads would promise a season the page does not yet keep.

Measure Seven first. The only retention number that matters before Lent is **Day-7 of Seven Days, as a share of people who sat Day 1**. Until that number exists, do not add a second path for the calendar to ignore.

`[recommendation] (in-scope)`
