# Fact-check: "Testosterone Isn't a Personality" (Oct 24, 2026)

Adversarial pass on article-page.html, testosterone-isnt-a-personality.md, video/video.html and charts.py. I ran 16 WebSearch queries in two parallel batches. WebFetch and curl were blocked, so every verdict rests on search-result text, not full source pages. If a claim says "memory", I checked it against what I already knew because the search budget ran out. Those need a check by hand before publishing.

Files changed: article-page.html and testosterone-isnt-a-personality.md (same edits in both). video/video.html was not changed. No video claim is WRONG; one source line is DISPUTED (see "Video notes").

## Table

| Claim | Verdict | Source URL | Fix applied |
|---|---|---|---|
| Jul 15, 2026: Hegseth's "High-T Department of War" video plus memo; mandatory screening in the annual health assessment for active-duty and reserve troops 30+; under 30 can opt in; treatment optional | OK | https://www.stripes.com/theaters/us/2026-07-15/hegseth-approve-testosterone-testing-troops-22274442.html · https://www.legion.org/information-center/news/security/2026/july/hegseth-announces-annual-testosterone-screenings-for-servicemembers-age-30-or-older | None |
| Hegseth quote: "not about artificial enhancement; it's about restoring and optimizing your natural capabilities" | OK (the headline slug matches; the full quote wasn't visible) | https://fortune.com/2026/07/15/hegseth-testosterone-not-artificial-enhancement/ | None |
| About 2 million troops 30+; no cost estimate given; no funding source named | OK (cost and 2M); "no funding source" UNVERIFIED | https://www.wfmz.com/news/hegseths-high-t-mandate-for-troops-comes-without-cost-figure/article_7df453b0-bb49-53cc-97b7-e48fabab1bc2.html | None |
| Sept 2 guidance posted; Sept 3 "temporarily rescinded"; adviser called it posted "inadvertently" | OK (Reuters, Sep 3; adviser Tim Parlatore on CNN) | https://gvwire.com/2026/09/03/pentagon-temporarily-rescinds-guidance-on-testosterone-screening-for-us-troops/ · https://www.goodmorningamerica.com/news/story/pentagon-temporarily-rescinds-new-testosterone-guidelines-136205208 | None |
| Sept 17 reissue, men only | OK, roughly (Military Times reported the men-only guidelines on Sep 18; Sep 17 as the release date fits but I didn't see it directly) | https://www.militarytimes.com/news/your-military/2026/09/18/pentagon-updates-guidance-on-low-testosterone-testing-for-males/ | None |
| Guidance says T "is not a performance enhancer"; evidence doesn't support it for energy, vitality, physical function or cognition | UNVERIFIED. Two searches found no outlet using the phrase. The search-visible coverage of the withdrawn draft applies the "no evidence of benefit" language to women. This is the piece's main hook, so check it against the DHA PDF before publishing. | https://www.militarytimes.com/news/your-military/2026/09/18/pentagon-updates-guidance-on-low-testosterone-testing-for-males/ | None (flagged). It also appears in the video (scene 2) and chart-5 (charts.py line 207). |
| Sept 30, 2026 State of the Force at Quantico: "The ideological clowns are out. The patriotic cowboys are in with testosterone testing on top." | OK (quote and date); "about 600 troops" UNVERIFIED | https://www.advocate.com/politics/national/pete-hegseth-embarrassing-quantico-speech | None |
| Military Times "four of six physicians"; Endocrine Society "high number of false positives"; Fugh-Berman quote | UNVERIFIED (Stripes ran a "medical skeptics" story and the Endocrine Society opposed population screening, but I didn't see the exact quotes) | https://www.stripes.com/theaters/us/2026-07-17/pentagon-testosterone-screening-medical-skeptics-22289998.html | None |
| Guidance flow: symptom questionnaire first, then a morning draw against 300 ng/dL | UNVERIFIED | — | None |
| NHANES 4,045 men aged 15–39, 605 → 451 ng/dL (about 25%); normal-weight men 665 → 529; low point 2011–12 | OK (memory: Lokeshwar 2021, 605.39 → 450.83); the 665/529 split wasn't checked | https://pubmed.ncbi.nlm.nih.gov/32081788 | None |
| Boston about 1.2%/yr (1987–2004); Finland birth cohorts | OK (memory) | https://pubmed.ncbi.nlm.nih.gov/17062768 | None |
| RFK Jr. on Fox: teen "has less testosterone than a 68-year-old man"; "dropped 50 percent" | OK (Jesse Watters Primetime, about Apr 22–23, 2025; matches the video's "April 2025"). "Dropped 50 percent" wasn't in the search snippets: UNVERIFIED | https://www.mediaite.com/media/tv/wait-wait-fox-news-host-stunned-by-wild-rfk-rant-about-sperm-counts-and-teenagers-testosterone/ | None |
| Epic Research 0.83% (2013) → 0.64% (2021) → 0.93% (2025); 0.95% mid-2026 (video and chart) | OK | https://www.epicresearch.org/articles/after-nearly-a-decade-long-decrease-testosterone-prescribing-rates-rising-again/ | None |
| "Every age group 30 and up is now above its old peak" | UNVERIFIED (confirmed only for 50–64: 1.57% vs 1.30%) | same as above | None |
| IQVIA 7.3M (2019) → more than 11M (2024) prescriptions | OK (prescriptions. Wired says "men", which can't square with Epic's about 0.9%, so the article's wording is the safer one) | https://wewillcure.com/therapeutics/care-delivery/startups-disrupt-testosterone-therapy-market-as-younger-men-fuel-demand · https://bioethics.com/?p=101941 | None |
| Hims low-T at $99–$199/month, enclomiphene | OK on price ($99 on a 10-month prepaid plan, $199 on a 3-month plan) and on enclomiphene. The Sept 2025 launch date is UNVERIFIED | https://www.hims.com/blog/enclomiphene-price | None |
| Influencer study: 46 posts, 72% financial ties, 31% claimed to be doctors | OK on the numbers | https://www.ctvnews.ca/health/article/social-media-testosterone-and-masculinity-how-influencers-are-reshaping-mens-health/ | — |
| Influencer study attribution "(University of Sydney)" | DISPUTED. CTV says Sydney; a Guardian-derived summary gives a University of Copenhagen lead author (Social Science & Medicine, Jan 2026) | same as above | Dropped "(University of Sydney)" from Sources in both article files. Video src line left as is (see notes) |
| "Zero posts cited evidence" | UNVERIFIED | — | None |
| FDA Feb 28, 2025: removed the cardiovascular-outcomes boxed-warning language; added a BP warning | OK (some trade-press coverage calls the boxed-warning removal a recommendation) | https://www.fda.gov/drugs/drug-safety-and-availability/fda-issues-class-wide-labeling-changes-testosterone-products | None |
| HHS June 2026: asked manufacturers to drop the age-related low-T limitation of use | OK (Urology Times, Jun 19, 2026) | https://www.urologytimes.com/view/hhs-requests-testosterone-therapy-label-updates-citing-new-safety-data | None |
| DEA telemedicine flexibilities run out Dec 31, 2026 | OK (fourth extension; no final special-registration rule or new extension found) | https://www.mcdermottplus.com/insights/dea-extends-telemedicine-flexibilities-for-controlled-substance-prescribing-for-2026/ | None (recheck the Federal Register on publish day) |
| TRAVERSE: 5,246 men aged 45–80; MACE 7.0% vs 7.3%; AF 3.5% vs 2.4%; AKI 2.3% vs 1.5% | OK (memory: Lincoff, NEJM 2023) | https://www.nejm.org/doi/full/10.1056/NEJMoa2215025 | None |
| WHO 1990: 65% azoospermic within 6 months (video: 271 men, 200 mg weekly) | OK (memory) | — | None |
| Liu 2006: 67% recovered at 6 months, 90% at 12 | OK (memory) | — | None |
| Stop or cut the dose if hematocrit goes above 54% | OK (memory: Endocrine Society threshold) | — | None |
| AUA: under 300 ng/dL on two early-morning tests, plus symptoms | OK (memory; also consistent with the coverage on confirming low results with two early-morning tests) | — | None |
| Symptomatic deficiency about 5.6% of men 30–79 (Araujo 2007) | OK | https://pubmed.ncbi.nlm.nih.gov/17698901 | None |
| "About 29% of American men have a 'low' lab number on its own" | **WRONG**. The cited source (Araujo/BACH, men 30–79) gives 24% low total T, 11% low free T | https://pubmed.ncbi.nlm.nih.gov/17698901 · https://www.healthday.com/health-news/general-health/1-in-4-men-over-30-has-low-testosterone-608084.html | Changed to "About 24% of men 30 to 79 have a 'low' lab number on its own. Only about 5.6% have symptomatic deficiency." in both article files |
| EHJ 2025: 20,286 male IFBB athletes; 121 deaths; mean age at death 45; 38% SCD; pros 5.2× amateurs; enlarged hearts on autopsy | OK (HR 5.23; autopsies cover only about 10% of SCD cases) | https://www.healthday.com/healthpro-news/cardiovascular-diseases/mortality-sudden-cardiac-death-higher-for-male-professional-bodybuilders | None |
| Denmark: 2.8% vs 1.0% deaths over about 11 years (chart: all-cause death 2.8×) | UNVERIFIED (the JAMA 2024 results weren't visible; an older 2019 cohort was 1.3% vs 0.4%) | https://jamanetwork.com/journals/jama/article-abstract/2816584 | None. Read the JAMA letter before publishing |
| Circulation 2025: MI about 3× (HR 3.00), heart failure about 3.6× (HR 3.63) | OK | https://www.healthymale.org.au/research-reviews/health-consequences-androgenic-anabolic-steroid-use | None |
| Shawn Rhoden: heart attack at 46; Golem Yefimchyk: died at 36 after a heart attack (per his wife) | OK (memory) | — | None |
| Einar Méndez collapsed at a gym "last month" at 48 | OK (died Sept 4, 2026, Mexico City gym; "last month" works for an Oct 28 post) | https://tmz.com/2026/09/09/einar-mendez-dead | None |
| Swoll hospitalized 3 days after Sept 30 (Oct 3); third heart scare since 2023; 2024 angiogram tool broke; "never claimed to be natural" | OK ("never claimed to be natural" not checked) | https://www.dexerto.com/entertainment/joey-swoll-rushed-to-hospital-with-another-heart-scare-3415857/ | None |
| Swoll discharged and cleared for light workouts Oct 13 | OK | https://generationiron.com/joey-swoll-returns-to-gym/ | None |
| Sources line "his Oct 5 post" | DISPUTED (Dexerto and Generation Iron date the post Oct 6; the research kit links a specific X post dated Oct 5. Probably a time-zone gap) | https://www.dexerto.com/entertainment/joey-swoll-rushed-to-hospital-with-another-heart-scare-3415857/ | None. Check the X post's timestamp |
| Sleep: under 5 h for one week, T down 10–15% | OK (memory: Leproult & Van Cauter, JAMA 2011) | — | None |
| Corona 2013: about +83 ng/dL on diet, about +250 after bariatric surgery | OK (memory: 2.87 and 8.73 nmol/L) | — | None |
| Opening: Miramar clip and "Low-T Pete" | UNVERIFIED (as in REFRESH; no search budget left) | — | None |

## WRONG items and changes
1. **"About 29% of American men have a 'low' lab number on its own."** The cited Araujo 2007 BACH paper gives **24%** low total testosterone among men 30–79. Changed in `article-page.html` (the `<p>` in the TRT section) and `testosterone-isnt-a-personality.md` to: "About 24% of men 30 to 79 have a "low" lab number on its own. Only about 5.6% have symptomatic deficiency." The research kit (research-kit.html lines 277 and 393) still says 29%, and I left it alone because it's out of scope. No chart or video scene uses 29%.

## DISPUTED softening
- Influencer study Sources line: removed "(University of Sydney)" because the lead institution is contested. Both article files.

## Video notes (not re-rendered)
- No WRONG video claims.
- Scene 7 (`SCENES[6]`, video/video.html line 35), src line: "46 high-reach Instagram and TikTok testosterone posts. Social Science & Medicine, 2026 (University of Sydney)." The attribution is DISPUTED. If you re-render, consider dropping "(University of Sydney)".
- Scene 2 (`s2`, lines 218–223 and 243) shows the "is not a performance enhancer" quote, which is UNVERIFIED. Confirm it against the DHA document before the Nov 2 post.

## Must-check before publishing
1. The DHA Sept 17 guidance text for the "is not a performance enhancer" quote (article, video scene 2, chart-5, publish-desk hooks).
2. The JAMA 2024 Danish mortality figures (2.8% vs 1.0%).
3. The timestamp of Swoll's hospital post (Oct 5 vs Oct 6).
4. The Federal Register for any new DEA telemedicine action.

## Resolution (Oct 24)

The quote marks now cover only "not a performance enhancer", the wording The Center Square and MEAWW both report from the Sept 17 guidance, everywhere it appears: the article, hooks, the research kit, chart 5 and video scene 2. The video and chart 5 are re-rendered. The research kit's 29% is corrected to 24%.
