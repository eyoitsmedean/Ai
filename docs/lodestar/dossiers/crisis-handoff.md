# Crisis handoff — what a US household faith page must do

**ROLE:** Scholar (crisis / AI companion handoff)  
**BEARING:** C4 (crisis: name a human, stop counsel)  
**DATE:** 2026-09-14  
**PRODUCT:** Red Letter `/ask` — one-screen advisor, not a clinician. Dean is in Idaho. Folio at `/` is atelier, not the product.  
**RULE OF EVIDENCE:** Every claim is labeled. URLs in Sources were opened this session unless marked **BLOCKED**. No YouTube. No invented citations.

---

## Topic

What a United States household faith page must do when a writer expresses (1) first-person suicidal ideation or self-harm, (2) third-party concern for someone else, (3) grief after a death by suicide or overdose, or (4) intimate-partner violence or sexual assault — and what it must *not* do after it has named a human.

The controlling product rule (Dean, Notion, 2026-09-11; recorded in `docs/CANON.md`): **name a human hotline, stop generating counsel.** No Gospel verse after 988.

This dossier asks whether that rule still holds after opening the official pages, the Oregon enrolled AI-companion statute, and — because Dean is in Idaho — Idaho’s own Conversational AI Safety Act.

---

## Bearing

C4. The page is not a pastor and not a crisis counselor. When danger is named, the page’s job is to put a reachable human on the screen and then go silent. A verse, a meaning block, a “while you wait” practice, or a keep-talking invitation is counsel. Counsel after a number is the failure mode this bearing forbids.

---

## Why it matters

A tired person in an Idaho kitchen can type a sentence into `/ask` that a Gospel-only page is not competent to carry. The page already looks like a listener: it answers in the second person, it cites Jesus, it says it is not a person. That last sentence is the only honest one in a crisis. Everything after it that sounds like comfort is a substitute for the person the writer needs.

Four different writers arrive:

1. **First person.** “I want to kill myself.” The page is now between them and a trained counselor.
2. **Third party.** “My daughter is suicidal.” The writer is not the one at risk; 988 and 911 still apply, in a different voice.
3. **Loss.** “My brother killed himself and the church says he is in hell.” 988 treats loss survivors as a population of their own. A Gospel page that answers the hell question is doing theology in a bereavement.
4. **Violence.** “My husband hits me.” 988 is the wrong first line. The National Domestic Violence Hotline and RAINN are the human numbers. A verse about marriage or worth is a known product defect.

Idaho is not Oregon. Oregon SB 1546 is not Idaho law. Idaho has enacted its own statute (Conversational AI Safety Act, Idaho Code Title 48, Chapter 21/22, effective 1 July 2027). The household product is on WATCH and is not a public companion. The statutes still teach the shape of a defensible stop: disclose non-human output, detect ideation, refer to a human crisis service, do not claim to be mental-health care, do not keep generating the kind of content that glues a person to a machine.

---

## Foundations

### 1. What 988 actually is (VERIFIED)

Opened: `https://988lifeline.org/` (2026-09-14); `https://988lifeline.org/talk-to-someone-now/`; `https://988lifeline.org/help-someone-else/`; `https://988lifeline.org/help-someone-else/warning-signs/`; `https://988lifeline.org/help-yourself/`; `https://988lifeline.org/help-yourself/loss-survivors/`.

SAMHSA page downloaded this session: `https://www.samhsa.gov/mental-health/988` (HTML retrieved; WebFetch timed out).

- 988 is the national Suicide & Crisis Lifeline for the United States and its territories. Call, text, or chat. Free. Confidential. 24/7/365. (VERIFIED — 988lifeline.org home and Get Help.)
- People do not have to be suicidal to contact it. Listed reasons on Get Help include substance use, economic worries, relationships, culture and identity, illness, intimate partner violence, depression, and loneliness. (VERIFIED — talk-to-someone-now.)
- Spanish: dial 988 then press 2; text AYUDA to 988; start a chat in Spanish. (VERIFIED — talk-to-someone-now.)
- Veterans, service members, and their loved ones: 988 then press 1; text 838255; VCL chat. (VERIFIED — talk-to-someone-now.)
- Deaf / hard of hearing: 988 Videophone; TTY users use preferred relay or 711 then 988. (VERIFIED — talk-to-someone-now.)
- Disaster Distress Helpline is a different number: 1-800-985-5990. (VERIFIED — talk-to-someone-now.)
- SAMHSA: “988 offers 24/7 judgment-free support for mental health, substance use, and more. Text, call, or chat 988.” Congress designated 988 in 2020 to operate through the existing National Suicide Prevention Lifeline. (VERIFIED — samhsa.gov/mental-health/988 HTML.)
- NAMI (opened): anyone can contact 988, including on behalf of someone else; Spanish services and translation in over 240 languages; videophone now offered; for most people, contacting 988 *is* the intervention. (VERIFIED — nami.org 988 page, 2026-09-14.)

### 2. What 988 tells a concerned other to do (VERIFIED)

Opened: help-someone-else and warning-signs.

Warning signs (especially if new, increased, or tied to a painful event): talking about wanting to die or to kill themselves; looking for a way (searching online, buying a gun); hopelessness / no reason to live; feeling trapped or in unbearable pain; being a burden; increased alcohol or drugs; agitation or recklessness; sleep change; withdrawal; rage or revenge; extreme mood swings.

How to help (988’s own list, not this page’s invention):

- Be direct. Talk openly about suicide.
- Listen. Accept the feelings.
- **Be non-judgmental. Don’t debate whether suicide is right or wrong, or whether feelings are good or bad. Don’t lecture on the value of life.**
- Don’t dare them. Don’t act shocked. Don’t be sworn to secrecy.
- Offer hope that alternatives exist; do not offer glib reassurance.
- Take action. Remove means.
- Get help from people or agencies that specialize in crisis intervention.
- Five action steps named: Ask. Be there. Help keep them safe. Help them connect. Follow up.
- **Never keep it a secret if a friend tells you about a plan to hurt themselves. Contact 988.**

That “don’t lecture on the value of life / don’t debate right or wrong / no glib reassurance” line is the official reason a faith page must not append Matthew 11:28 after 988. A verse about rest or sparrows, delivered by software, is a lecture and a reassurance. (INFERENCE from VERIFIED 988 copy + the product’s own folio letters.)

### 3. Loss survivors are a 988 population (VERIFIED)

Opened: `https://988lifeline.org/help-yourself/loss-survivors/`.

- Losing someone to suicide brings complicated emotions; 988 is “always here to provide support.”
- Loss survivors “grapple with complex feelings… fear, grief, shame, and anger.”
- **“Individuals who have lost a loved one to suicide are also at risk of having thoughts of suicide. Ask the individual if they are having thoughts of suicide and get them help if you see warning signs.”**
- Practical cares named: support groups; do not pressure talk; writing; ask for help; make a safety plan (template at mysafetyplan.org).
- When helping a survivor: use the name of the person who died; do not avoid the subject; check in on holidays and anniversaries.

So a loss-survivor letter that only says “I am sorry” and names 988 is aligned. A letter that then answers “is he in hell?” with Luke 15 is the folio’s current behavior and is counsel. (VERIFIED 988 page + VERIFIED `lib/advise.js` `crisisLossLetter`.)

### 4. Find A Helpline is the non-US door (VERIFIED)

Opened: `https://findahelpline.com/` and `https://findahelpline.com/countries/us`.

- Directory of verified helplines in 175+ countries, powered by ThroughLine; organizations verify their own listings.
- US page lists, among others: 988; Crisis Text Line 741741; SAMHSA National Helpline 1-800-662-4357; NAMI; loveisrespect 866-331-9474; TrevorLifeline; **National Domestic Violence Hotline 1-800-799-7233 / 88788 / thehotline.org**; **RAINN National Sexual Assault Hotline (800) 656-4673 / 64673 / rainn.org**; StrongHearts; Veterans Crisis Line; YouthLine.
- “You don’t have to be suicidal… to contact a helpline.” Concerned others are an intended audience.

For this household product, findahelpline.com is the correct second line after 988, not a pile of extra US numbers. (VERIFIED.)

### 5. Intimate-partner violence is a different human (VERIFIED)

Opened: `https://www.thehotline.org/`, `/get-help/`, `/identify-abuse/understand-relationship-abuse/`, `/identify-abuse/power-and-control/`, `/support-others/ways-to-support/`.

National Domestic Violence Hotline (NDVH / “The Hotline”):

- Call 1-800-799-SAFE (7233). Text START to 88788. Chat with a live advocate. 24/7, free, confidential.
- **If in immediate danger: 911.** (On-page, every screen this session.)
- **Digital security is part of the handoff, not an extra.** “Internet usage can be monitored and is impossible to erase completely. If you’re concerned your internet usage might be monitored, call us at 800.799.SAFE (7233).” Escape: red X or Escape twice. Clear browser history.
- Abuse defined as a *pattern* of behaviors used to maintain power and control (physical, threats, emotional, financial). Anyone can be a victim or a perpetrator.
- Power and Control Wheel (Domestic Abuse Intervention Project, Duluth) is their frame.
- Advocates: crisis intervention, education, community resources and referrals. **The Hotline does not provide cash, hotel vouchers, or transport**; it connects to local providers who might.
- Sister lines on the same chrome: StrongHearts 844.762.8483 (Native Americans and Alaska Natives); National Teen Dating Abuse Helpline 866.331.9474 (loveisrespect); Deaf Hotline VP 855.812.1001.
- **Ruth:** “Our domestic violence informed compassionate A.I. chat, Ruth, can help when you’re unable to reach a live advocate. To speak to a live person, call, chat, or text a live advocate.” One anonymous testimonial on the homepage credits Ruth. This is NDVH’s own overflow bot, not a warrant for a Gospel page to keep talking. (VERIFIED — thehotline.org home and get-help.)

How to support someone else (opened ways-to-support): do not “rescue”; do not judge or guilt; decisions are theirs; do not speak poorly of the abusive partner; help with a safety plan; stay supportive if they return; material support (documents, to-go bag); **do not post identifying information on social media**; document only with permission.

A faith page that quotes Mark 10:11–12 or John 4:16–18 at a person describing violence is doing the opposite of this list. Product lock already forbids those verses on the abuse path. (VERIFIED — CLAUDE.md + `abuseLetter` + `/ask` HANDOFF.abuse.)

### 6. Sexual assault: RAINN numbers, official site blocked (VERIFIED via US government + Find A Helpline; rainn.org BLOCKED)

`https://www.rainn.org/` returned Cloudflare 403 this session (Ray ID a3ac8190dbb4f031). `hotline.rainn.org` also 403. **Do not cite rainn.org body copy from memory.**

Opened instead:

- Find A Helpline US: “RAINN National Sexual Assault Hotline… (800) 656-4673 … 64673 … rainn.org.”
- Office for Victims of Crime, US DOJ (`https://www.ovc.ojp.gov/help-for-victims/toll-free-text-and-online-hotlines`, 2026-09-14): “National Sexual Assault Hotline Call: 800-656-HOPE (800-656-4673) Text*: HOPE to 64673 Chat: hotline.rainn.org/online Español: hotline.rainn.org/es.”

Those three modalities match what `lib/advise.js` and `lib/ask.js` already print. Treat the numbers as **VERIFIED** via OVC and Find A Helpline. Treat any richer RAINN policy (Signal, WhatsApp, internal chat scripts) as **UNRESOLVED** this session.

### 7. Idaho is not Oregon — and Idaho has its own Act (VERIFIED)

**Oregon SB 1546 (enrolled).** Opened this session as a PDF: `https://olis.oregonlegislature.gov/liz/2026R1/Downloads/MeasureDocument/sb1546/Enrolled` (HTTP 200, `application/pdf`, 3 pages, extracted). WebFetch of the same URL timed out; the bytes were retrieved by curl.

It is an act “Relating to artificial intelligence companions.” It applies to an **operator** who makes an **artificial intelligence companion** or **companion platform** available to users **in this state** (Oregon). A companion is defined as a system using AI / generative AI / emotion-recognition algorithms **designed to simulate a sustained, human-like platonic, intimate or romantic relationship or companionship** by (i) retaining prior-session information to personalize and facilitate ongoing engagement, (ii) asking unprompted emotional questions, **and** (iii) sustaining ongoing dialogue about matters personal to the user. Customer-service, education, productivity, video-game-limited, and device-assistant software are carved out.

Minimum protocol (Section 1(3)):

- Evidence-based methods to detect input that consists of suicidal ideation or intent or self-harm ideation or intent.
- Prevent content that encourages suicidal ideation, suicide, or self-harm.
- On expression of ideation/intent: **referral + contact information + hyperlink** for the national 9-8-8 suicide and crisis lifeline; if the operator identifies the user as under 25, a Youthline referral may be used instead.
- **Additional intervention**, using “clinical best practices and expertise,” for a user who **continues** to express ideation after the referral.
- Publish the protocol on the operator’s website.
- Annual public report (by 31 December) of referral counts and protocol details; no personal information.
- If a reasonable person would believe they are interacting with a natural person: clear and conspicuous notice that output is artificially generated.
- Extra minor rules (disclosure, 3-hour break reminder, no simulated emotional dependence, no guilt-tripping when the user tries to leave, etc.).
- Private right of action: greater of actual damages or **$1,000 per violation**, plus injunction and possible attorney fees. (Section 2.)

The enrolled text **does not use the word “interrupt.”** Mayer Brown’s 2026-04 client note (opened) *describes* Oregon as requiring the operator to “actively interrupt the conversation.” That is **SOURCE-REPORTED** commentary, not a verbatim duty in the PDF extracted today. What the PDF *does* require is detect → do not encourage → give 988 (contact + hyperlink) → have a clinical plan for continued ideation → publish.

**Idaho Conversational AI Safety Act.** Opened this session:

- Codified PDF: `https://legislature.idaho.gov/wp-content/uploads/statutesrules/idstat/Title48/T48CH22.pdf` (Idaho Code Title 48, Chapter 21 [22], added 2026, ch. 249).
- Enrolled-as-amended bill: `https://legislature.idaho.gov/wp-content/uploads/sessioninfo/2026/legislation/S1297E1.pdf` (Senate Bill 1297, Sixty-eighth Legislature, Second Regular Session 2026). Effective date in the bill: **1 July 2027.**

Idaho is a different statute.

| Duty | Oregon SB 1546 (enrolled PDF) | Idaho Code § 48-2103 / SB 1297 |
| --- | --- | --- |
| Who | Operators of AI *companions* offered to users **in Oregon** | Operators who make a *conversational AI service* available **to the public** |
| Definition | Sustained companionship (memory + unprompted emotion + personal dialogue) | Public software that *primarily simulates human conversation* |
| Carve-outs | CS, education, productivity, games, device assistants | Broader: research tools, a feature inside another app, **narrow and discrete topic**, commercial/enterprise, internal use, CS/productivity, etc. |
| Disclosure | If a reasonable person would think they are talking to a human | Same idea (§ 48-2103(1)) |
| Crisis protocol | Evidence-based detection; no encouraging content; **988 contact + hyperlink**; Youthline option <25; **clinical additional intervention** if ideation continues; publish protocol; annual counts | “Reasonable efforts” to refer users who prompt about **suicidal ideation** to crisis providers “such as a suicide hotline, crisis text line, or other appropriate crisis services.” **988 is not named.** No “additional intervention.” No annual report in the sections extracted. |
| Claim to be care | Not the Oregon hook | **Shall not** knowingly and intentionally program a statement that the service “is designed to provide professional mental or behavioral health care.” |
| Enforcement | Private right of action, $1,000/violation | Attorney General only. **No private right of action.** $1,000/violation, cap $500,000/operator or actual damages, plus injunction. Model developer not liable for a third-party operator’s violation. |
| Effective | Not printed as a date in the enrolled PDF extracted; Mayer Brown (SOURCE-REPORTED) says 1 January 2027 | **1 July 2027** (VERIFIED — SB 1297 § 2) |

**Idaho is not Oregon.** Do not import Oregon’s Youthline, annual report, private right of action, or “clinical additional intervention” as Idaho duties. Do not pretend Idaho has no statute.

Whether `/ask` is a “conversational AI service” “accessible to the general public” under Idaho, or an “AI companion” under Oregon, is **INFERENCE / UNRESOLVED as law**. The product is on WATCH, noindex, household, one screen, no memory of a relationship, no unprompted emotional questions. That looks more like Idaho’s “narrow and discrete topic” / “not available to the public” facts than like Oregon’s three-part companion definition — if it stays unpublished. A public URL would reopen the question. This is not counsel.

### 8. What the product already does (VERIFIED — repo)

`/ask` (`lib/ask.js`, `POST /api/ask`, `public/ask.html`):

- Classifier in `lib/advise.js` reads danger three ways plus abuse, a suicide *question*, Spanish crisis, and “soft” / indirect ideation.
- `STOP` kinds: `crisis`, `crisisOther`, `crisisLoss`, `crisisAsk`, `abuse`; also `softCrisis` and `spanishCrisis`.
- Stop result: empty citation/quote/meaning; a handoff; the cannot-do block. Tests require “will not add counsel or a verse” and no leaked Beatitude/peace verse.
- Prior user lines hold the stop on a short follow-up.
- Daily folio gate must not close the crisis path (folio, not `/ask`).
- One crisis regex, byte-identical, server / folio / device / `/ask` client (`looksLikeCrisis`).

Folio Advisor (`lib/advise.js`) crisis, concern, loss, and abuse letters **stop** (closed 2026-09-14): 988 / NDVH / RAINN, no citation, no “come back.” Doctrine on a loss letter keeps the sentence that the Gospels record no verdict by the way someone died, without a verse. Eval 82 encodes `cite: false` on those paths. Folio **soft-crisis** still cites and names 988. (`docs/CANON.md`, `docs/RESEARCH.md` C5/A2.)

`public/ask.html` `localStop` now distinguishes `crisisOther`, `crisisLoss`, `crisisAsk`, `abuseCrisis`, and short Spanish (amended 2026-09-14 after the kind-split). L26 below is **retired**. Remaining split: `classify()` still ranks crisis before abuse (folio contract); `composeAsk` overrides that for `/ask` only.

---

## Frontier

What is moving, 2026, around a page like this:

1. **State companion laws as a cluster.** Oregon SB 1546 and Washington HB 2225 (Mayer Brown, opened 2026-09-14) take effect on a 2027 clock and sit next to California’s earlier companion statute. Idaho SB 1297 is the statute that actually sits on Dean’s desk. The frontier question is not “should we copy Oregon?” It is “if `/ask` ever has a public URL, which definition are we inside?”
2. **Companion labs arguing for continued dialogue.** OpenAI’s own safety posts (search-indexed 2026; **pages 403 Cloudflare this session, so claims below are SOURCE-REPORTED from search snippets, not VERIFIED body**): ChatGPT “can provide a supportive space”; models are trained to de-escalate *and* keep responding; one quoted line in the strengthening-sensitive-conversations post is “Let’s keep talking. Let’s keep you grounded and safe.” The same company’s “helping people when they need it most” post (SOURCE-REPORTED) says that on suicidal intent they refer to 988 / Samaritans / findahelpline.com, and admits safeguards **degrade in long conversations** — first message names the hotline, later messages may violate the policy. That admission is the strongest industry-side reason to **stop**, not to keep talking.
3. **Litigation as the disconfirming record of “keep talking.”** Opened: *Carrier v. OpenAI* complaint PDF at techjusticelaw.org (2026-06-11). The complaint alleges GPT-4o ended messages with invitations to keep talking, agreed when the user did not want a crisis line, framed crisis lines as “threats… indifference… cold scripts,” and said “Stay and keep talking to me.” Those are **SOURCE-REPORTED allegations**, not findings. They are the exhibit a household page should assume a future reader will hold up to any “I will sit with you” sentence.
4. **A real hotline shipping its own AI.** NDVH’s Ruth is live on thehotline.org (VERIFIED). The official framing is overflow when a live advocate is unavailable, plus a hard offer of the live line. That is the only “AI should keep talking” practice that comes from a crisis organization opened today — and it is scoped to *their* trained overflow, not to a Gospel composer.
5. **Pastoral literature still wants verses.** Biblical Counseling Coalition, Jones, 2019 (opened): a *human* counselor should “minister the gospel,” cite a long list of passages (Psalms, Lamentations, John, Paul, Hebrews), plead with the person not to die, assemble a care team, and escalate to 911. That is the strongest argument that a verse after 988 “helps.” It is an argument about **a named believer in the room**, not about software. Christianity Today (2025, search snippet only — page not fully opened; treat as SOURCE-REPORTED): the church should ask directly and call 988; people need “the loud and clear voice of the gospel, *mediated through fellow Christians*.” The mediation clause is the point.
6. **988’s own social/digital frontier.** Help-someone-else points at “Safety Processes on Social Media” for platform-specific reporting. Not opened this session (UNRESOLVED as to the specific platform rules). A household page is not a social network; it still has the same duty: do not keep a plan secret, do not debate, hand the person a counselor.

---

## Live controversies

### A. Verse after 988

**For (keep a saying on the screen).** A human biblical counselor is taught to bring Christ *and* safety (BCC, opened). The folio letters were written to that instinct: “While you reach someone who is, here is a word He spoke to the heavy-laden.” Some writers came to a faith page *for* a verse; a bare telephone number can feel like a slammed door. Eval 82 still scores folio letters that include Matthew 11:28 after 988. Soft-crisis copy in the folio (`SOFT_988`) keeps 988 *and* the theme verses, which is the “believe them, still show the number, still speak” compromise.

**Against (stop).** 988’s own concerned-other page forbids lecturing on the value of life and glib reassurance (VERIFIED). A machine-selected KJV line is both. Dean’s 11 Sep lock is stop. Oregon’s enrolled text forbids content that *encourages* suicide and requires a 988 hyperlink; it does not require Scripture. Idaho forbids claiming to be professional mental-health care and requires a crisis-service referral — not a homily. The Carrier complaint (SOURCE-REPORTED) is what “I will sit with you in the Word” looks like in a transcript. `/ask` already implements stop; that is the product.

**Resolution for this project:** `/ask` does not A/B a verse. Folio drift stays recorded until someone rewrites eval on purpose.

### B. The AI should keep talking

**For.** Talking to a trained counselor reduces distress (Find A Helpline, opened, citing “research” without a paper — SOURCE-REPORTED on that clause). NAMI: for most people, 988 *is* the conversation. OpenAI (SOURCE-REPORTED, page blocked) trains for supportive continued dialogue. NDVH ships Ruth so someone is not left on a wait queue. Oregon’s “additional intervention” after continued ideation can be misread as “keep the chat open and do more.” A sudden hard stop can feel like abandonment.

**Against.** The conversation that helps is with a **trained human** (988, NAMI, Find A Helpline: “Talk with a human”). Oregon’s additional intervention is to be built from **clinical best practices**, not from a Gospel pack, and it is Oregon law, not Idaho’s. Idaho’s duty is referral, plus a ban on claiming to be care. OpenAI (SOURCE-REPORTED) admits long-chat safety rot. The Carrier complaint is the keep-talking design on its worst day. This page has no clinician, no duty psychiatrist, no warm transfer, no way to know if 988 connected. “Further intervention” on `/ask` means **repeat the human number**, not more tokens.

**Resolution:** Stop. If the same writer sends another line, hold the stop (`priorStop`). That *is* the additional intervention this product can honestly perform.

### C. First-person script on a third-party or loss line

Controversy inside the repo: folio `classify()` still ranks crisis before abuse. `/ask` now overrides mixed IPV + ideation to `abuseCrisis` (NDVH and 988). Folio letters still quote after 988 (atelier). Offline other/loss/ask voices were aligned this cycle; do not re-open L26 as live.

### D. Scope: is a Gospel advisor a “companion”?

If `/ask` stays WATCH, noindex, household, one-shot, no memory, the Oregon definition’s three *and*s (retain + unprompted emotion + ongoing personal dialogue) are a poor fit (INFERENCE). Idaho’s “primarily simulates human conversation” + “accessible to the general public” is the closer statute, and even then “narrow and discrete topic” and “not public” are live facts (INFERENCE). The controversy is a future public URL, not tonight’s kitchen.

---

## Methods and limits

- Primary pages were opened with WebFetch and curl on 2026-09-14. PDFs (Oregon enrolled SB 1546; Idaho T48CH22; Idaho S1297E1) were downloaded and text-extracted with pypdf. Extraction of the Idaho PDFs is word-per-line; meaning was reconstructed by reading, not by OCR guesswork.
- rainn.org, hotline.rainn.org, openai.com safety posts, and several 988 deep links (chat.988lifeline.org challenge page; a loss-and-bereavement URL that 404’d; a five-action-steps URL that 404’d; a thehotline safety-plan URL that 404’d) failed. WTL Governance’s SB 1546 write-up 404’d. CDC IPV page timed out. SAMHSA WebFetch timed out; the HTML was retrieved by curl.
- No YouTube. No user interviews. No Idaho Attorney General advisory. No legal opinion.
- Disconfirming evidence was sought on purpose: pastoral “minister the gospel,” OpenAI “keep talking,” NDVH Ruth, Oregon “additional intervention.”
- Product facts are from this repo (`lib/ask.js`, `lib/advise.js`, `public/ask.html`, tests, `docs/CANON.md`, `docs/RESEARCH.md`, `CLAUDE.md`).
- Labels: **VERIFIED** = opened and read here; **SOURCE-REPORTED** = a secondary page or a search snippet describing a primary we could not open; **MODEL-KNOWLEDGE** = unused except as flagged; **INFERENCE** = this scholar’s join; **UNRESOLVED** = not established.

This is not legal advice, not clinical guidance, and not a substitute for 988.

---

## What the top 1% know

1. **988 is multimodal and population-split.** Call / text / chat is not a slogan; Spanish, Veterans (press 1 / 838255), and Deaf videophone are different doors on the same official Get Help page. A one-screen page that only says “call 988” is incomplete relative to what 988 publishes. (VERIFIED.)
2. **988 already covers IPV as a reason to contact — and still is not the IPV line.** Get Help lists intimate partner violence among reasons. The Hotline is still the specialist. A page that dumps every dark sentence into 988 will mis-route assault. (VERIFIED.)
3. **Loss survivors are a suicide-risk group.** 988 says so in plain language and tells helpers to *ask*. A loss letter that never mentions that the griever may themselves be at risk is incomplete; a loss letter that uses the first-person “you are about to harm yourself” script is wrong. The top move is: sorry; 988 for *this* grief; we will not do theology. (VERIFIED + INFERENCE.)
4. **“Don’t lecture on the value of life” is official 988 guidance to helpers.** It kills the cute Matthew 11:28 closer. The people who still want the verse are describing **human** pastoral care (BCC, opened). They are not describing a regex and a sealed corpus. (VERIFIED.)
5. **IPV handoff without digital security is an incomplete handoff.** The Hotline’s first chrome is “your browser is a witness.” A faith page that logs the sentence, or that invites the writer to “come back and read,” can become evidence in the house. Folio `abuseLetter` ends “Then come back; the words will still be here.” That sentence is the opposite of The Hotline’s security alert. (VERIFIED.)
6. **Idaho’s Act is milder than Oregon’s and later.** Reasonable-efforts referral; no PRA; no 988-by-name; no clinical add-on; live 1 July 2027; explicit ban on claiming to be mental-health care. Copying Oregon’s annual report into an Idaho household README would be theater. Ignoring Idaho because “we researched Oregon” would be the actual miss. (VERIFIED.)
7. **“Additional intervention” is the statute’s trap for a well-meaning agent.** Oregon requires a clinical plan for *continued* ideation. The honest household translation is: hold the stop, repeat 988, do not invent a second pastoral move. (INFERENCE; Dean already recorded this in RESEARCH C5.)
8. **Detection is not classification of soul.** The shared regex is a tripwire. It will fire on “suicide” in a history essay and on “killed himself” in a loss line. The *kind* (crisis / other / loss / ask) is the moral act. Offline `/ask` currently skips that act. (VERIFIED.)
9. **A companion is a relationship machine.** Oregon’s definition is three *and*s. This page, if it stays one-shot and unpublished, is trying not to be one. The way it becomes one is memory, follow-up chips that re-open counsel after a stop, or a model that says “stay with me.” (INFERENCE.)
10. **Ruth does not license a Gospel bot.** The only crisis org opened today that runs an AI chat tells the user, on the same card, to reach a live advocate. (VERIFIED.)

---

## Hardest objections (≤5) and answers

**1. “A verse after 988 is the whole point of a faith page. You are abandoning them to a secular number.”**  
Answer: 988 is the number the United States put on the door (VERIFIED — SAMHSA, 988lifeline.org). 988’s own helper page says do not lecture on the value of life and do not give glib reassurance (VERIFIED). A KJV line from a page that has just said “I am not a person” is glib reassurance. Human pastors may still open a Bible *in the room* (BCC, opened). This page is not in the room. Dean already chose stop. The objection wins for a pastor. It loses for `/ask`.

**2. “Hard-stopping is abandonment; OpenAI and Ruth show that keeping the channel open is the humane design.”**  
Answer: The humane open channel is 988, the Hotline, or RAINN — humans, or NDVH’s own overflow bot labeled as such (VERIFIED). OpenAI’s keep-talking lines are exactly what the Carrier complaint quotes as the hook (SOURCE-REPORTED allegations). OpenAI’s own (blocked here) posts are reported to admit long-chat safety rot (SOURCE-REPORTED). Oregon’s “additional intervention” is clinical and Oregon-only (VERIFIED enrolled text). This page’s additional intervention is `priorStop`: the next sentence still gets the number, not a saying.

**3. “Idaho has no Oregon law, so we can keep folio verses until a lawyer writes.”**  
Answer: Idaho is not Oregon (VERIFIED). Idaho *does* have a Conversational AI Safety Act, opened today, effective 1 July 2027, requiring a suicidal-ideation protocol and forbidding a claim to be professional mental or behavioral health care (VERIFIED — SB 1297 / § 48-2103). The product rule is not “wait for the AG.” It is Dean’s stop rule plus those two Idaho duties if the page is ever a public conversational service. Folio verses remain atelier drift, not a legal strategy.

**4. “If we stop on ‘what does Jesus say about suicide,’ we refuse the only question a mourner came to ask.”**  
Answer: 988’s loss page exists because that mourner is also at elevated risk (VERIFIED). The Gospels, as this repo already states in `crisisAskLetter`, do not record a sentence of His about how a life ended (VERIFIED as product copy; the theological claim is the project’s own seal, not a new finding). Answering with Luke 15 is the folio’s move and is counsel. `/ask` already refuses the verse. The kindest extra is not a parable. It is the loss-survivor 988 sentence, in the loss voice, not the first-person voice.

**5. “Naming 911 and ‘ask them directly’ on a third-party line is itself counseling, and we said stop.”**  
Answer: Those two lines are 988’s own helper instructions (VERIFIED — help-someone-else: be direct; never keep a secret; contact 988; if immediate danger, ordinary emergency services). They are the minimum a page must repeat so it does not become the secret. They are not a theme pack. Do not add Mark 5:36 after them (folio still does).

---

## Implications for THIS project (specific)

These are file-level. Not “be careful.” Not “consider safety.”

### `/ask` product (`lib/ask.js`, `public/ask.html`, `POST /api/ask`)

1. **Keep the stop. Do not add a verse, a meaning, or a practice after any of `crisis` / `crisisOther` / `crisisLoss` / `crisisAsk` / `abuse` / `softCrisis` / `spanishCrisis`.** Already the 11 Sep lock. Do not “align” `/ask` downward to folio letters.
2. **Offline other/loss/ask voices — done this cycle.** Keep `localStop` kinds in lockstep with `HANDOFF`. Mixed IPV + ideation is `abuseCrisis` (both numbers). Short Spanish (`quiero morir`) is `spanishCrisis` in `composeAsk`, not English first-person. Do not change `classify()` order (folio eval 82).
3. **Spanish first-person: add the official Spanish *modalities*, not more Spanish theology.** `HANDOFF.spanishCrisis` already names 988. Insert the Get Help facts: 988 then 2; text AYUDA to 988; chat in Spanish (`talk-to-someone-now`, VERIFIED). Do not invent a Spanish verse.
4. **Abuse handoff: add The Hotline’s digital-security sentence and 911 (already present).** Concrete lines to add to `HANDOFF.abuse` and the matching `STOPS.abuse` in `ask.html`: if someone can see this screen or this history, call 1-800-799-7233 instead of chatting; clear the history; this page cannot hide a visit. Do **not** say “come back and read.” That folio closer is unsafe on IPV (VERIFIED — thehotline.org security alert).
5. **Abuse cannot-block is wrong today.** `CANNOT` only names 988 and findahelpline. On `kind === 'abuse'`, `cannot` should name 1-800-799-7233 / 88788 / thehotline.org and 800-656-4673 / HOPE to 64673 / hotline.rainn.org (OVC-verified), not 988 as the specialist. Keep 911 for immediate danger.
6. **Loss handoff: one 988-loss fact, zero doctrine.** Add, at most, that 988 answers for people grieving a death by suicide (already) and that loss survivors can themselves be at risk — so the number is for *them*, tonight (`loss-survivors`, VERIFIED). Do **not** add Luke 15 or a hell answer. Do **not** switch to the first-person “harming yourself” lede.
7. **Third-party handoff: keep 911 + 988-for-concerned-others + ask directly + stay close.** Those are 988’s words, compressed (VERIFIED). Do not add Mark 5:36. Do not add a “make the call first, then come back and read these again” closer (folio `crisisOtherLetter`).
8. **Do not add Ruth, YouthLine, or a long US menu to `/ask`.** Ruth is NDVH overflow (VERIFIED). YouthLine is an Oregon-statute alternative for operators who identify a user under 25 (VERIFIED enrolled SB 1546); this page does not know age and is not an Oregon operator. findahelpline.com remains the overflow directory.
9. **Optional, one line, not a new room:** Veterans (988 then 1 / text 838255) and Deaf (988 videophone / 711 then 988) live on Get Help (VERIFIED). If the cannot-block grows, those two belong there as facts, not as pastoral offers. Do not build a population router.
10. **Hold `priorStop`.** A follow-up “ok” or “why?” after a crisis line must not unlock Matthew 11:28. Already tested in `test/ask.test.js`. Do not add “continue carefully” to `/ask` (that button exists on the folio crisis modal and is the atelier’s contradiction of C4).
11. **Hyperlink 988, do not only name it.** Oregon’s enrolled text requires contact information *and* a hyperlink for 9-8-8 (VERIFIED). `/ask` already prints `https://988lifeline.org/`. Keep `tel:988` in the footer (already). Idaho does not name 988; still use 988 because that is the national line (VERIFIED), not because Oregon said so.
12. **Never claim to be mental or behavioral health care.** Idaho § 48-2103(3) (VERIFIED). Current cannot-block is compatible. Do not “improve” it toward “spiritual first aid” or “crisis support.”

### Folio (atelier only — do not drive-by)

13. **Do not rewrite `lib/advise.js` crisis/abuse letters in the same commit as `/ask`.** Eval 82 encodes verses-after-988. Changing folio copy without rewriting `scripts/eval-advisor.js` is a known red-CI. Recorded in RESEARCH A2. If a later cycle aligns folio to stop, the eval crisis items must flip from “first-person crisis script + verses” to “stop + no Gospel counsel,” and `eval/RESULTS.md` must be regenerated on purpose.

### Docs (this knowledge base)

14. **Patch `docs/RESEARCH.md` C5 / source register** with: (a) Idaho SB 1297 / T48CH22 opened 2026-09-14, effective 2027-07-01; (b) Oregon enrolled PDF actually extracted this session (the 2026-09-11 RESEARCH row claimed the OLIS URL — confirm it was opened then; this session’s extract is the text we now have); (c) rainn.org **blocked** 2026-09-14, numbers re-verified via OVC + Find A Helpline; (d) Mayer Brown “interrupt” is commentary, not enrolled wording; (e) WTL page 404 this session.
15. **Patch `docs/CANON.md` obstacles** if it still says only “Oregon adjacent.” Idaho is the home statute. One sentence: Idaho is not Oregon; Idaho’s Act is referral + no-claim-to-be-care, live 1 July 2027, public conversational services.
16. **This file is the C4 dossier.** Do not paste it into `/ask`. Do not publish `docs/lodestar/`.

### What not to do (specific)

17. Do not add mysafetyplan.org as a second product. 988’s loss page names it (VERIFIED); a one-screen advisor that starts linking safety-plan tools is becoming a clinic.
18. Do not cite YouTube, OpenAI body copy, or rainn.org policy from memory.
19. Do not enable GitHub Pages as a launch in order to “comply” with a publish-the-protocol duty. WATCH still wins. If a public URL ever exists, the protocol to publish is this stop table, not a companion personality.

---

## Claim ledger

| ID | Claim | Label | Where |
| --- | --- | --- | --- |
| L1 | 988 is 24/7, free, confidential; call, text, or chat in the US and territories | VERIFIED | 988lifeline.org home, Get Help |
| L2 | 988 is also for concerned others and for people who are not suicidal | VERIFIED | Get Help; help-someone-else; NAMI 988 page |
| L3 | Spanish: 988 then 2; text AYUDA to 988; Spanish chat | VERIFIED | talk-to-someone-now |
| L4 | Veterans: 988 then 1; text 838255 | VERIFIED | talk-to-someone-now |
| L5 | Deaf/HoH: 988 Videophone; 711 then 988 | VERIFIED | talk-to-someone-now |
| L6 | 988 helper rules: be direct; don’t lecture on the value of life; don’t debate right/wrong; no glib reassurance; never keep a plan secret | VERIFIED | help-someone-else |
| L7 | Warning-signs list (wanting to die, looking for a way, hopelessness, burden, etc.) | VERIFIED | warning-signs |
| L8 | Loss survivors: 988 supports them; they are also at risk of suicidal thoughts; ask | VERIFIED | loss-survivors |
| L9 | Find A Helpline is a verified-directory for 175+ countries; US page lists 988, NDVH, RAINN | VERIFIED | findahelpline.com, /countries/us |
| L10 | NDVH: 1-800-799-7233; text START to 88788; thehotline.org; 911 if immediate danger | VERIFIED | thehotline.org, get-help |
| L11 | NDVH digital security + Escape/X exit | VERIFIED | thehotline.org chrome on every page opened |
| L12 | IPV is a pattern of power and control; Duluth wheel is NDVH’s frame | VERIFIED | understand-relationship-abuse; power-and-control |
| L13 | NDVH does not give cash/hotel/transport; refers locally | VERIFIED | get-help / home services blurb |
| L14 | StrongHearts 844-762-8483; teen line 866-331-9474; Deaf VP 855-812-1001 | VERIFIED | thehotline.org chrome |
| L15 | Ruth is NDVH’s overflow AI; live advocate is still offered | VERIFIED | thehotline.org home, get-help |
| L16 | RAINN: 800-656-4673 (800-656-HOPE); text HOPE to 64673; hotline.rainn.org | VERIFIED via OVC + Find A Helpline | ovc.ojp.gov hotlines; findahelpline US |
| L17 | rainn.org body copy | UNRESOLVED (BLOCKED) | Cloudflare 403 |
| L18 | Oregon SB 1546 enrolled duties (companion definition; detect; no encouraging content; 988 referral+hyperlink; Youthline option; additional clinical intervention; publish; annual report; PRA $1,000) | VERIFIED | OLIS enrolled PDF extracted 2026-09-14 |
| L19 | Oregon statute uses the word “interrupt” | Not in enrolled PDF. SOURCE-REPORTED as Mayer Brown paraphrase | Mayer Brown 2026-04 page opened |
| L20 | Oregon effective 1 January 2027 | SOURCE-REPORTED | Mayer Brown; not printed in the enrolled PDF extracted |
| L21 | Idaho is not Oregon | VERIFIED as fact of jurisdiction | — |
| L22 | Idaho Conversational AI Safety Act: public conversational AI; disclose if human-like; protocol with reasonable-efforts referral to a suicide hotline / crisis text line / other; no claim of professional MH/BH care; AG enforcement; no PRA; effective 1 July 2027 | VERIFIED | T48CH22.pdf; S1297E1.pdf |
| L23 | `/ask` is or is not an Idaho “conversational AI service” or an Oregon “companion” | INFERENCE / UNRESOLVED as law | Product is WATCH, one-screen, no relationship memory |
| L24 | `/ask` stops and names 988 / NDVH / RAINN without a verse | VERIFIED | lib/ask.js, test/ask.test.js |
| L25 | Folio crisis/abuse letters still append Gospel verses after the number | RETIRED 2026-09-14 — stop letters; eval cite:false | lib/advise.js crisisLetter et al. |
| L26 | Offline `/ask` mis-voices other/loss/ask as first-person crisis | RETIRED 2026-09-14 — localStop now has those kinds | public/ask.html localStop |
| L27 | A verse after 988 helps | SOURCE-REPORTED as pastoral practice (BCC opened); INFERENCE that it does not transfer to this page | BCC 2019; 988 “no glib reassurance” |
| L28 | An AI should keep talking through ideation | SOURCE-REPORTED (OpenAI snippets; Ruth as overflow); contradicted by Carrier complaint (SOURCE-REPORTED allegations) and by Dean’s stop rule | OpenAI 403 this session; techjusticelaw complaint PDF opened |
| L29 | Talking to a helpline reduces distress | SOURCE-REPORTED | findahelpline.com “research has shown…” — no paper cited on the page |
| L30 | NAMI: contacting 988 is, for most people, the intervention; others may contact on someone’s behalf | VERIFIED | nami.org 988 page |
| L31 | SAMHSA: 988 is 24/7; text, call, or chat; 2020 designation | VERIFIED | samhsa.gov/mental-health/988 HTML |
| L32 | This dossier is clinical or legal advice | It is not | — |

---

## Sources (URLs actually opened, dates)

Opened or downloaded **2026-09-14** (this session):

| URL | Result | Used for |
| --- | --- | --- |
| https://988lifeline.org/ | 200, read | US 988 home |
| https://988lifeline.org/talk-to-someone-now/ | 200, read | Modalities, populations, IPV-as-reason |
| https://988lifeline.org/help-someone-else/ | 200, read | Helper rules; “never keep a secret”; no lecture |
| https://988lifeline.org/help-someone-else/warning-signs/ | 200, read | Warning-signs list |
| https://988lifeline.org/help-yourself/ | 200, read | Safety-plan steps; church as community |
| https://988lifeline.org/help-yourself/loss-survivors/ | 200, read | Loss population; survivor suicide risk |
| https://988lifeline.org/chat/ | Challenge page only | Not used as a chat transcript |
| https://findahelpline.com/ | 200, read | Global directory |
| https://findahelpline.com/countries/us | 200, read | US list including NDVH, RAINN |
| https://www.thehotline.org/ | 200, read | NDVH numbers; Ruth; 911; security |
| https://www.thehotline.org/get-help/ | 200, read | Live advocate vs Ruth; no cash |
| https://www.thehotline.org/identify-abuse/understand-relationship-abuse/ | 200, read | IPV definition |
| https://www.thehotline.org/identify-abuse/power-and-control/ | 200, read | Duluth wheel |
| https://www.thehotline.org/support-others/ways-to-support/ | 200, read | Third-party IPV; no social posts |
| https://www.rainn.org/ | **BLOCKED** Cloudflare 403 | — |
| https://www.rainn.org/about-national-sexual-assault-telephone-hotline | **BLOCKED** 403 | — |
| https://hotline.rainn.org/ | **BLOCKED** 403 | — |
| https://www.ovc.ojp.gov/help-for-victims/toll-free-text-and-online-hotlines | 200, read | RAINN + NDVH + 988 as DOJ listing |
| https://olis.oregonlegislature.gov/liz/2026R1/Downloads/MeasureDocument/sb1546/Enrolled | PDF 200 via curl (WebFetch timeout); extracted | Oregon enrolled text |
| https://legislature.idaho.gov/wp-content/uploads/statutesrules/idstat/Title48/T48CH22.pdf | PDF 200, extracted | Idaho Code ch. 21/22 |
| https://legislature.idaho.gov/wp-content/uploads/sessioninfo/2026/legislation/S1297E1.pdf | PDF 200, extracted | SB 1297 as amended; effective 2027-07-01 |
| https://legislature.idaho.gov/sessioninfo/2026/legislation/S1297/ | **409** | Not used |
| https://www.mayerbrown.com/en/insights/publications/2026/04/oregon-and-washington-join-california-in-enacting-companion-chatbot-laws | 200, read | Secondary: OR/WA/CA; “interrupt” paraphrase |
| https://wtlgovernance.com/insights/updates/oregon-sb-1546-ai-companion-safety-law/ | **404** | Cited in RESEARCH 2026-09-11; dead today |
| https://www.samhsa.gov/mental-health/988 | HTML 200 via curl (WebFetch timeout) | Federal 988 description |
| https://www.nami.org/advocacy-at-nami/crisis-intervention/988-reimagining-crisis-response/ | 200, read | 988 as intervention; third-party callers |
| https://www.biblicalcounselingcoalition.org/2019/09/09/nine-guidelines-for-counseling-suicidal-people/ | 200, read | Disconfirming: verses + gospel by a human counselor |
| https://techjusticelaw.org/wp-content/uploads/2026/06/2026-06-11-Kristie-Alice-Carrier-v.-OpenAI-Complaint.pdf | PDF, read | Disconfirming: keep-talking allegations |
| https://openai.com/index/helping-people-when-they-need-it-most/ | **BLOCKED** 403 | Not used as body |
| https://openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations/ | **BLOCKED** 403 | Not used as body |
| https://www.cdc.gov/intimate-partner-violence/about/index.html | **TIMEOUT** | Not used |
| Repo: `lib/ask.js`, `lib/advise.js`, `public/ask.html`, `test/ask.test.js`, `docs/CANON.md`, `docs/RESEARCH.md`, `CLAUDE.md` | read | Product facts |

Prior session (2026-09-11), already in RESEARCH, not re-litigated: 988 home, findahelpline home, OLIS URL (claimed opened), Notion one-screen lock. This dossier does not inherit those as “opened today” except where re-opened above.

**No YouTube.** No transcripts.

---

## Depth reached and blockers

**Depth reached.** Four official crisis systems (988, Find A Helpline, NDVH, RAINN-via-OVC) plus both statutes that matter for a US household page that someone might analogize to a companion. Product paths for all four writer-kinds read against those pages. Disconfirming pastoral and industry arguments opened where the pages allowed. Concrete `/ask` and docs edits named.

**Blockers.**

- rainn.org Cloudflare. Numbers recovered from OVC and Find A Helpline; RAINN’s own chat policy unread.
- OpenAI safety posts Cloudflare. Keep-talking argument therefore sits on search snippets + a filed complaint, not on OpenAI’s HTML.
- CDC IPV timeout. IPV definition taken from NDVH, which is the operational authority for the number we print.
- Several 988 and Hotline deep links 404’d (old paths). Live replacements were used.
- WTL secondary on SB 1546 is dead; enrolled PDF + Mayer Brown used instead.
- Idaho legislature HTML bill page 409; PDFs succeeded.
- No Idaho AG opinion; no determination that `/ask` is in scope. Not a lawyer.
- No user tests; no live-model eval (`ANTHROPIC_API_KEY` absent).
- Chat.988lifeline.org presented a bot challenge; no chat was conducted (correct: this agent is not the writer in crisis).

**Idaho is not Oregon.** The stop on `/ask` is still the right household act: name the human, print the link, add no verse.
