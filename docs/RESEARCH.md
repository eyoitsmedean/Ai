# Research — Red Letter · 2026-09-11

Questions that control whether a letter is safe to put in front of a person at a low moment. Only URLs opened this session are cited. Everything else is marked.

## Coverage map

| Topic | Kind | Status | Changes the product? |
|---|---|---|---|
| What counts as His words | core | settled, disclosed | John 3:16–21 stay red; map under test |
| Crisis / suicide handoff | core | implemented 2026-09-06; confirmed | Keep 988 first; company after |
| Present danger / IPV | core, was missing | **implemented this cycle** | New door; never enemy-love first |
| KJV rights | core | US public domain; UK Crown | No UK paid tier without Cambridge |
| Eval method | core | 50 questions; offline green | Model path still unverified |
| Translation alternative (WEB) | adjacent 1 | researched, not swapped | Dean decides |
| App Store 4.2 / no launch | adjacent 2 | blocked by brief | Checklist only |
| Chatbot crisis over-trigger | adjacent 3 | confirmed our regex is narrow | Do not spam 988 on ordinary grief |
| One-screen vs folio | adjacent 4 | folio stays | Advisor remains the first useful answer |
| Parallel-agent drift | adjacent 5 | diagnosed | Do not merge the other PRs blindly |

## Core

### 1. His words

The room prints speech, not the evangelist. The KJV has no quotation marks. Frame-cutting and the red-letter map are tested (`test/spoken.test.js`, `test/map.test.js`). John 3:16–21 stay red as most KJV editions do; Room settings says so.

Klopsch’s red-letter *New Testament* is 1899; the full Bible is 1901. Opened: [Crossway](https://www.crossway.org/articles/red-letter-origin/), [American Bible Society](https://www.americanbible.org/news/articles/when-did-publishers-start-printing-red-letter-bibles/) (2011-03-10).

### 2. Suicide / 988

APA Health Advisory (2025): apps that people use in distress must put human-led crisis routes on screen (988, clickable). Opened summary via the advisory PDF retrieved this session.

988 Lifeline (opened [988lifeline.org](https://988lifeline.org/) 2026-09-11): call, text, or chat, 24/7, free, confidential, US.

**Decision kept:** notice first, then a short letter of company — never a scope disclaimer, never a verse before the number. Contrary view (Techdirt 2026-05-06): reflexive 988 on every sad sentence can shame. Our detector stays specific (`looksLikeCrisis`); “my dog died” does not fire it. `[verified in test/counsel.test.js]`

### 3. Present danger from another person (the gap)

**Finding:** on this line, “My husband hits me” scored as Conflict / Forgiveness and could print Matthew 5:44 (“Love your enemies”). That is a known pastoral failure mode.

**Evidence opened this session:**

- National Domestic Violence Hotline — [thehotline.org/get-help](https://www.thehotline.org/get-help/) (2026-09-11): 1-800-799-SAFE (7233); text START to 88788; quick-exit on the site because a partner may be watching the screen.
- USCCB, *When I Call for Help* — [usccb.org](https://www.usccb.org/topics/marriage-and-family-life-ministries/when-i-call-help-pastoral-response-domestic-violence): “The person being assaulted needs to know that acting to end the abuse does not violate the marriage promises.” Couple counseling is not appropriate and can endanger the victim. Men who abuse often misuse Scripture.
- DOJ OVW resources list (updated 2026-04-08): same hotline; sexual assault 1-800-656-HOPE (4673).

**Decision:** a second door, same shape as crisis. Human numbers first. Then two of His sayings that do not tell the writer to stay: Matthew 10:23 (flee when persecuted) and John 10:10 (the thief comes to steal and kill; He came that they might have life). Matthew 5:39 / 5:44 / Luke 6:27–28 are forbidden on this path. Ordinary marital conflict (“we fight about everything”) does **not** open the door.

### 4. KJV

Public domain in the US. UK Crown prerogative remains. This household is US (Idaho, per the license-lock page — `(prior-worker)`). Attribution is printed as courtesy.

### 5. Eval

The brief asked for ≥40 questions including hostile, off-scope, and crisis. We had 46. This cycle adds 4 abuse questions (47–50). Offline path was 46/46 on 2026-09-06. Model path has never been run here (no key).

## Adjacent five

### A1. WEB (or BSB) as a second labeled text

**Why:** the brief allows any public-domain or licensed translation. KJV is safe and already tested. A modern line would lower time-to-first-useful-answer for readers who stumble on “ye” / “unto.”

**Opened/confirmed via prior-worker research in Notion, not re-fetched in full here:** WEB is dedicated to the public domain (eBible). **Not swapped.** One corpus, one test suite. Adding WEB is a Dean decision and a second map.

### A2. App Store 4.2 / “not a launch”

Prompt 4 already forbids submission without sign-off. Capacitor is the settled stack. `RELEASE.md` has the five-minute device checklist. **Do not submit.** The adjacent value is: stop spending cycles on store packaging until Dean has a host and a key.

### A3. Over-triggering crisis

California-style liability talk (2026) pushes products to spam 988. We will not. Grief, shame, and “I can’t go on like this” are already in the crisis set (conservative). Ordinary worry is not. Abuse is a *different* door so we do not send an assaulted person only to a suicide line.

### A4. One-screen vs the folio

A parallel Notion spec (`one screen · not a launch`) wants Ask / The words / What this bot cannot do. The shipped product is a folio. **The folio stays.** The Advisor tab *is* that one screen, inside the room. Deleting Sit / Seven / Forty would reverse accepted work (LAUNCH, DESIGN, Forty).

### A5. Parallel-agent drift

As of 2026-09-11 this repo has many open PRs from other running agents (safety modules, Spanish, share cards, omitted sayings). **Do not merge them from this brief.** Salvage ideas, re-implement on this line under test. The obstacle to Dean using the product is fragmentation, not a missing feature list.

## Source register (opened this session)

| Date | Source | Used for |
|---|---|---|
| 2026-09-11 | https://www.thehotline.org/get-help/ | IPV number, text, quick-exit |
| 2026-09-11 | https://www.usccb.org/topics/marriage-and-family-life-ministries/when-i-call-help-pastoral-response-domestic-violence | Do not tell an assaulted spouse that leaving breaks the vow |
| 2026-09-11 | https://988lifeline.org/ | 988 still live |
| 2026-09-11 | https://www.justice.gov/ovw/resources-victims-and-survivors | 988 / 799-SAFE / 656-HOPE listed together (page dated 2026-04-08) |
| 2026-09-07 | Crossway; American Bible Society | Klopsch 1899 NT / 1901 Bible |
| 2026-09-11 | APA advisory PDF (retrieved) | Human crisis route on-screen |

RAINN.org itself timed out this session. The 1-800-656-HOPE number is taken from the DOJ OVW page above `[single-source for the RAINN URL; number corroborated]`.
