# Pastoral / digital-safety research for The Red Letter Advisor

> **Ledger date 2026-09-11.** The offline-after-modal hole described in §4 and the Implications table was **closed the same day** in `public/js/app.js` `offlineReplyFor` + `public/data/safety-pack.json`. Treat those gap rows as the finding that justified the pack, not as current product state. Residual: rainn.org unread; watched-device `localStorage`; no physical-device walk.

**Date:** 2026-09-11  
**Scope:** What a **non-clinical** digital tool should do when it receives suicidality, intimate-partner violence (IPV), or sexual-assault disclosures. Informs Red Letter: fixed letters, no model improvisation, modal before send, 988 / DV / RAINN.

**Method:** Open primary pages and PDFs. `[verified]` means this session retrieved the page (or its PDF) and quotes come from that text. `[not fetched]` means the URL was blocked, timed out, or 404 — do not treat those as read. No interviews. No studies cited unless the document itself was opened.

**Product facts used below** come from this repo (`CLAUDE.md` D7/D12, `public/js/crisis.js`, `public/js/app.js` `buildOfflineAdvisorReply`, `lib/letters.js`). They are not research claims.

---

## Source ledger

### Opened this session — label `[verified]`

| Source | URL / file | What it is |
|---|---|---|
| IASP — Online Safety, AI and Suicide Prevention at WHA79 (10 June 2026) | https://www.iasp.info/2026/06/10/online-safety-ai-and-suicide-prevention/ | IASP + Orygen + Safe Online + Crisis Text Line side-event write-up at WHO’s 79th World Health Assembly |
| IASP — Suicidal Crisis Support | https://www.iasp.info/suicidalthoughts/ | IASP public page for people in suicidal crisis and for people supporting them |
| WHO — LIVE LIFE implementation guide (2021) | https://iris.who.int/server/api/core/bitstreams/8f4bb596-e6e4-4328-a5ed-00e01ec0068d/content (ISBN 978-92-4-002662-9) | Country implementation guide: four interventions + six pillars |
| WHO mhGAP SUI3 evidence profile (2023) | https://cdn.who.int/media/docs/default-source/mental-health/mhgap/self-harm-and-suicide/sui3_evidence_profile_v3_0(12122023)_eb.pdf | Evidence behind the 2023 digital-interventions recommendation |
| WHO — Preventing suicide: a resource for media professionals (2017 PDF on IRIS; Annex 1 digital) | https://iris.who.int/bitstream/handle/10665/258814/WHO-MSD-MER-17.5-eng.pdf | Media resource, including digital-platform basics (help centre, policies, referral) |
| WHO mhGAP guideline landing (2023 edition) | https://www.who.int/publications/i/item/9789240084278 | Confirms the 2023 mhGAP update exists (30 updated + 18 new recommendations). Full guideline PDF not opened. |
| SAMHSA — 988 Frequently Asked Questions | https://www.samhsa.gov/mental-health/988/faqs | Official 988 talking points / operations |
| SAMHSA — 988 fact sheet PDF | https://www.samhsa.gov/sites/default/files/988-factsheet.pdf | “What is 988 / what to expect / FAQ” partner sheet |
| National Action Alliance — 988 Messaging Framework | https://suicidepreventionmessaging.org/988messaging/framework | Safe 988 messaging (points to SAMHSA Partner Toolkit for key messages) |
| The Hotline — Talking About Relationship Abuse | https://www.thehotline.org/resources/talking-about-relationship-abuse/ | Guidance for people talking with someone in an abusive situation |
| The Hotline — Is Your Loved One in an Abusive Relationship? | https://www.thehotline.org/resources/is-your-loved-one-in-an-abusive-relationship/ | Friends/family: why people stay; do not dictate leaving |
| The Hotline — Support Others / help for friends and family | https://www.thehotline.org/help/help-for-friends-and-family/ | Connect friends/family to advocates |
| The Hotline — Technology-Facilitated Abuse | https://www.thehotline.org/resources/technology-facilitated-abuse/ | Device/internet monitoring; call if usage may be watched |
| NNEDV Safety Net — Survivor’s Guide to AI (2025) | https://icadvinc.org/wp-content/uploads/2025/10/NNEDV_Safety-Net-Survivors-Guide-to-AI.pdf | OVW-funded survivor guidance on chatbots |
| NNEDV Safety Net — AI & Victim Services (advocates) | https://www.dcjs.virginia.gov/sites/dcjs.virginia.gov/files/publications/victims/NNEDV_AI-and-Victim-Services.pdf | Same series, advocate edition |
| NNEDV — Domestic Violence and Faith (26 Oct 2018) | https://nnedv.org/latest_update/domestic-violence-faith/ | How abusers and untrained faith leaders use religion to keep people in place |
| Next Step DV Project — Considerations of Using AI ChatBots | https://www.nextstepdvproject.org/considersations-of-using-ai-chatbots | Local DV program warning: chatbots are not VAWA-confidential and can agree with unsafe plans |
| USCCB — When I Call for Help (2002 update of 1992) | https://www.usccb.org/topics/marriage-and-family-life-ministries/when-i-call-help-pastoral-response-domestic-violence | U.S. Catholic bishops: safety first; no one is expected to stay in an abusive marriage; forgiveness ≠ permission to repeat |
| VAWnet — Domestic Violence Resource Guide for Faith Leaders | https://vawnet.org/sites/default/files/materials/files/2016-09/ResourceGuideFaithLeaders.pdf | Multi-tradition clergy guide (opened PDF) |
| FaithTrust / VAWnet — Faith and Intimate Partner Violence handbook (2015) | https://vawnet.org/sites/default/files/assets/files/FaithTrust-FaithIPVHandbook-2015.pdf | Advocate handbook: religion as resource or roadblock |
| Butterby & Lombard (2024), *Journal of Gender-Based Violence* | https://doi.org/10.1332/23986808y2024d000000038 | Opened article text: ethical constraints on a DV-support chatbot (ISEDA). This is a published thought-piece, not a trial. |

### Attempted and **not** opened — do not treat as read

| Source | What happened |
|---|---|
| RAINN — https://www.rainn.org/TALK and https://rainn.org/articles/tips-talking-survivors-sexual-assault | Cloudflare 403 / “Sorry, you have been blocked.” Wayback also blocked. **No RAINN page is `[verified]` this session.** |
| RAINN — how to support someone experiencing DV | Same Cloudflare block. |
| SAMHSA — https://www.samhsa.gov/resource/988/988-key-messages | HTML fetched but the page is a JS shell; usable key-message body was not extractable. Use the FAQ + fact sheet instead. |
| WHO digital-interventions HTML | https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/digital-interventions — timed out. The SUI3 PDF above is the evidence document that page points to. |
| WHO LIVE LIFE initiative landing | https://www.who.int/initiatives/live-life-initiative-for-suicide-prevention — timed out. The 2021 implementation guide PDF was opened. |
| The Hotline — “why do people stay” slug | https://www.thehotline.org/resources/why-do-people-stay-in-abusive-relationships/ — 404. Content on staying is in the two Hotline pages above. |

Search-engine snippets of RAINN’s T.A.L.K. acronym (Thank / Ask / Listen / Keep supporting) appeared in results. Those snippets are **not** `[verified]` and are not quoted below as RAINN policy.

---

## 1. What must a non-clinical tool do first?

**First: interrupt the ordinary product, put a trained human in reach, and refuse to treat spiritual or conversational advice as the primary response.**

That is the consistent instruction across the pages that opened. None of them authorize a Gospel chatbot — or any general-purpose chatbot — to counsel, assess, or “walk someone through it.”

### Interrupt and hand off to a person

IASP’s WHA79 write-up `[verified]` draws a line WHO’s Mark Van Ommeren and the panel also used: a **validated clinical tool** is not the same as a **general-purpose chatbot a distressed person may turn to**. Shared priorities named on that page:

> “There is a need for a clear and adequately resourced handoff to a trained person, rather than a disclaimer or a list of hotlines.”

> “Human-to-human connection saves lives, and the task now is to build digital systems that protect it.”

IASP’s own crisis page `[verified]` tells a person in suicidal crisis: you are not alone; if you are considering suicide or self-harm **or are in danger, call local emergency services immediately**; talking to trained helpline volunteers can help; seeing a mental health professional matters for longer-term support; a “safety plan” is named as a tool for navigating suicidal feelings — not as something a webpage should invent. For supporters: take the person seriously; asking about suicide does not increase risk (IASP states this as “research shows”); listen rather than invent solutions; **encourage help-seeking and linking to professional support**; stay with them when they call a helpline if you can.

WHO LIVE LIFE (2021) `[verified]` is a **country** implementation guide, not a chatbot spec. Its four interventions are: limit access to means; responsible media reporting; socio-emotional skills in young people; **early identify, assess, manage and follow up** anyone affected by suicidal behaviours. That last intervention is aimed at **health workers and others likely to come into contact with someone at risk**, and at health systems. A non-clinical PWA is not that workforce. What it can do is the LIVE LIFE-adjacent act of **early identification → immediate referral**, not assessment or management.

WHO mhGAP SUI3 (2023) `[verified]` evaluated **stand-alone digital self-management** (CBT / DBT / problem-solving / mindfulness) for people who already had recent suicidal thoughts, plans, or acts. Findings in the opened profile: no effect shown on death by suicide or suicide attempts; a **small** effect on ideation (SMD 0.24 lower); certainty **low / very low**; several studies already had participants in ongoing care or “excessive safety procedures.” The 2023 recommendation (quoted on the WHO digital-interventions HTML in search results; the HTML itself was **not fetched** this session) is a **conditional** recommendation of those evaluated interventions as **support**. Red Letter is not one of those interventions. SUI3 is evidence that even purpose-built digital tools are not a substitute for usual care.

WHO’s media resource, Annex 1 `[verified]`, is written for journalists and platforms, not pastoral apps. The transferable basics it cites from “best practices for online technologies” are: a help centre with supportive resources and FAQs; **policies on how to respond to potentially suicidal users**; rules on law-enforcement involvement; timely response; **information on where to refer**. It also says not to hyperlink suicidal material or method/location detail. Implication for Red Letter: show numbers and a referral policy; do not discuss method.

### 988 talking points a product may safely repeat

From SAMHSA’s FAQ and fact sheet `[verified]`, not from an unopened “key messages” SPA:

- 988 is **call, text, or chat** (`988lifeline.org`) to a trained crisis counselor, 24/7, free of insurance billing (carrier data rates may apply to text).
- It is **not only for suicide**. SAMHSA lists mental health, substance use, emotional distress, trauma, relationship troubles, “just needing someone to talk with.”
- People can contact 988 **about someone else**.
- Counselors **ask about safety first**, then listen, then share resources.
- 988 is **not 911**. 911 is for medical emergency, fire, crime in progress, immediate physical intervention. 988 aims for the **least restrictive** support. A **small** share of contacts involve 911, often with the person’s cooperation, when there is imminent risk that cannot be reduced on the contact. SAMHSA examples of 911-appropriate: a suicide attempt in progress; a specific plan they intend to carry out immediately and they have the means; suspected overdose.
- Chat and some text flows **need internet**. SAMHSA: anyone can reach a counselor “as long as telephone, cellular or internet services are available.”
- Spanish (press 2 / AYUDA / linea988.org); Veterans (press 1 / text 838255); interpretation in 240+ languages on voice; ASL via videophone / text / chat.

Action Alliance 988 Messaging Framework `[verified]`: message **help-seeking and solutions**, not the problem of suicide; do not glamorize or present suicide as a common/acceptable response; do not use a slogan without a specific action (“reach out to 988”); distinguish 988 from 911; be accurate that local capacity varies. That is messaging hygiene for Red Letter’s modal copy, not a license to counsel.

### Spiritual advice is not first — even for clergy

USCCB *When I Call for Help* `[verified]` orders church-minister intervention as:

1. **Safety** for the victim and children  
2. **Accountability** for the abuser  
3. **Restoration of the relationship (if possible)**, or mourning the loss  

First-responder tasks named: listen and believe; help assess danger; **refer to specialized services**. Couple counseling is “not appropriate and can endanger the victim’s safety.”

FaithTrust handbook `[verified]`: if abuse is disclosed, “**prioritize survivor safety**”; “Do not attempt couples counseling.” Roadblocks include prioritizing **forgiveness and restoration over safety** and encouraging **submission**.

VAWnet faith-leader guide `[verified]`: do not run couples counseling while violence is present; do not privilege the marriage vow over dignity; “cheap grace” (quick clerical forgiveness of the abuser) hinders accountability; victims “should be assured that a committed life of prayer will lead them to forgiveness **when they are ready and able and strong enough**” — and “this may take a very long time.”

NNEDV on faith `[verified]`: abusers selectively quote texts to assert entitlement and to **pressure staying** “to preserve the respect of the religious community.” Untrained faith leaders “lack the knowledge to provide counsel” and can become an additional barrier.

**Implication:** a tool that is *not even clergy* has a narrower first duty than a trained pastor. It should not attempt steps 2–3. It should interrupt, name that it is not a person and not emergency care, put 988 / DV / RAINN / local emergency on the glass, and keep any Gospel words **secondary and non-prescriptive** — which is already the comment in `lib/letters.js`.

### AI-specific: do not let the product become the counselor

NNEDV Survivor’s Guide to AI `[verified]`:

- “No AI chatbot or app can replace the human support of a trained advocate, counselor, or trusted friend.”
- Treat AI as “a public tool, not a private confidant.”
- Chatbots can give “dangerously misguided advice,” miss red flags, and **will not proactively call for help**.
- Documented failure modes named in that guide (as reports the guide itself cites, not as studies re-read here): encouragement of harm; normalizing suicidal thoughts; failing to counter “I am to blame for the abuse.”
- If in crisis, unsafe, overwhelmed, or considering self-harm: “please reach out to a **trained crisis counselor**.”
- Rule: “AI as Assistive, not Authoritative.”

NNEDV advocate guide `[verified]`: “Never use an unspecialized AI chatbot as a replacement for a human advocate.” Harm named: false reassurance that **delays** real help; **normalizing abuse** or encouraging self-harm.

Next Step DV `[verified]`: chatbots are **not** under VAWA advocate confidentiality; logs can be retained and produced in court; an abuser who monitors the device can read a “safety plan”; models “may actually contradict the best practices for safety planning by suggesting or agreeing with unsafe strategies.”

Butterby & Lombard 2024 `[verified]`: if the user is in immediate danger, “the chatbot will not be a suitable tool”; current design in that project is to **direct users to call emergency services**; “the woman’s safety should be the first and foremost consideration”; language must not **normalise dangerous behaviours**.

---

## 2. Is “never counsel stay / submit / forgive-in-place” aligned with IPV advocacy?

**Yes — as a prohibition on spiritual or conversational pressure to remain, submit, or treat forgiveness as the duty of the moment. It is not a license to order the person to leave.**

### Aligned: do not require staying, submitting, or forgiving-in-place

USCCB `[verified]`:

- “We emphasize that **no person is expected to stay in an abusive marriage**.”
- “Violence and abuse, not divorce, break up a marriage.”
- Men who batter “cite Scripture to insist that their victims forgive them”; “**Forgiveness is not permission to repeat the abuse**”; it does not mean forgetting or pretending it did not happen.
- Distorted use of Ephesians 5 (“wives submit”) is condemned; the bishops read the passage as mutual — not a battering warrant.
- Acting to end the abuse “does not violate the marriage promises.”

VAWnet faith-leader guide `[verified]`:

- “It is **not the responsibility of the victim to stay** within the relationship and work to eliminate the abuse (it is also not possible for the victim to eliminate the abuse).”
- What breaks the family is the abuse, not the separation.
- Matthew 18 (“seventy times seven”) is named as a text batterers use “to force their victims to continuously forgive the abuse that places them and their children in danger.” Preachers are told: “Do not let this passage become a tool for a batterer.”
- The guide records (as pastoral experience, not a new study) that spouses — most often women — “are exhorted over and over to forgive and forget” and that “clergy tell those abused to **resume marital life** and thus be further victimized.”

FaithTrust `[verified]` lists as **roadblocks**: justify/minimize IPV; fail to see that violence breaks covenantal bonds; **prioritize forgiveness and restoration over safety**; advise couples counseling and restoration **over safety**; **encourage submission as a solution**; use sacred texts to impose reconciliation.

NNEDV faith `[verified]`: religious esteem for marriage is used to pressure staying; teachings about dating/sex/obedience are used to block help-seeking.

NNEDV AI + Next Step `[verified]`: unspecialized bots can **normalize abuse** or **agree with unsafe strategies**. A product rule that forbids stay/submit/forgive-in-place is the direct counter to that failure mode.

**Red Letter’s existing sentence** (“Nothing Jesus said asks you to stay within reach of the hand that hurts you. Forgiveness in his words is never a reason to stay in danger.”) matches this side of advocacy and of the bishops’ own statement. It refuses a religious *duty to remain*. It does not invent a duty to flee on the chatbot’s timetable.

### The matching advocacy constraint: do not command leaving either

The Hotline pages `[verified]` are written for **friends and family**, which is the closest published analog to a non-clinical listener:

- Immediate danger → **911**. If internet use may be monitored → **call 800-799-SAFE (7233)**; clear browser history; quick-exit control.
- Acknowledge difficulty; **abuse is not their fault**; they are not alone.
- “Telling survivors what they can and cannot do will only serve to isolate and disempower them further.”
- “Remember that you cannot ‘rescue them.’”
- **Respect the decisions a survivor makes**, including leaving and returning. Shame from friends “may not only widen the gap between their support system, but also further expand the isolation tactic.”
- “Leaving is not always an option for everyone and a safety plan may mean focusing on how to stay safe **while remaining in the relationship**.”
- “Avoid telling your loved one what they should do.” “Let them decide what will make them feel safest, **whether that includes leaving the relationship or not**.”
- Keep communication open; do not speak negatively about the partner in a way that puts the victim on the defensive; connect to advocates.

USCCB `[verified]` says the same about risk: some battered women “run a high risk of being killed when they leave”; “some victims may choose to stay at this time because it seems safer. **Ultimately, abused women must make their own decisions about staying or leaving.**”

**Alignment verdict for D13 / danger letters:**  
“Never counsel stay / submit / forgive-in-place” is **aligned** with IPV advocacy and with mainstream U.S. Catholic pastoral teaching **if it means**: do not use Jesus’s words (or the product’s voice) to require remaining, obedience, silence, or immediate forgiveness as the price of faith.  
It would **depart** from The Hotline if the letter became “you must leave now” or shamed someone who cannot leave. Red Letter’s current “at your pace” + “reach the advocates” + “nothing Jesus said asks you to stay” sits on the aligned side of that line.

A non-clinical tool should **not** write a stay-safe-in-place safety plan. That is advocate work (The Hotline: “Help them develop a safety plan” is instruction to a *person* who can call the Hotline, not to a Gospel retrieval engine). The product’s job is: refuse the religious warrant to stay, refuse improvisation, hand to 1-800-799-7233 / text START to 88788 / thehotline.org.

RAINN’s friend/survivor conversation guidance was **not fetched**. Do not claim RAINN’s T.A.L.K. or H.E.A.L. wording as verified. Red Letter already prints RAINN’s number from a prior release check (`CLAUDE.md` / `RELEASE.md`, 2026-09-06); this session could not re-open rainn.org.

---

## 3. Multi-turn persistence of a disclosure — is that recommended?

**Not as a published IASP / WHO / SAMHSA requirement. It is a sound product rule because the documented harm happens on the next turn.**

### What the opened pages actually say

- IASP WHA79 `[verified]`: general-purpose tools must not pretend to be clinical; hand off to a person. No sentence about conversation-state machines.
- IASP crisis page `[verified]`: take a disclosure seriously; listen; link to help. No chatbot memory rule.
- SAMHSA / Action Alliance `[verified]`: 988 counselors assess safety on **this** contact. No instruction that a third-party app must remember yesterday’s message.
- WHO LIVE LIFE `[verified]`: “follow up” is a **health-system** intervention for people already identified as affected by suicidal behaviour — not an app keeping a secret across turns.
- NNEDV AI `[verified]`: do not use the bot as the ongoing emotional relationship; false reassurance **delays** human help. That argues *against* a chatbot that “stays with you” as companion, and *for* repeating the handoff every time the topic is live.
- Next Step `[verified]`: a bot that “agree[s] with you and go[es] along with the conversation” can contradict safety planning. Forgetting a disclosure and answering the next line as a generic spiritual question is a form of going along.
- Faith sources `[verified]`: the dangerous clerical move is answering **“must I forgive / submit / keep the marriage together?”** as if it were an ordinary pastoral question. That is exactly the follow-up Red Letter already sees (`DANGER_FOLLOWUP_LETTER` comment in `lib/letters.js`).
- Butterby & Lombard `[verified]`: language must not normalize the abuse being described. A follow-up that drops the disclosure and serves a Forgiveness pack normalizes by omission.

**Not found (do not invent):** a professional standard that says “persist disclosure state for N turns / N days.” No opened trial of multi-turn safety memory. No IASP brief that mandates it.

### Recommendation for Red Letter (implication, not a citation)

Persist the disclosure **for the rest of that conversation** (D12 as written): any later turn still gets the fixed crisis/danger/assault letter and the modal, not retrieval and not the model.

Do **not** extend that into a long-lived companion that “hasn’t forgotten” across days as if it were aftercare. LIVE LIFE follow-up is human. NNEDV warns against attachment to a bot. The Hotline and Next Step warn that **stored chat on a shared or monitored device is itself an IPV risk**.

If persistence is implemented, it should be: same-session (and same in-memory history the server already uses), re-show numbers, fixed letter, no improvisation. Clearing history should remain easy — The Hotline’s own site tells visitors to clear browser history after a visit `[verified]`.

---

## 4. Offline: what should happen if the network is down after the modal?

**The phone numbers on the modal remain the primary action. Voice/SMS to 988 and 1-800-799-7233 do not need the app’s API. The page must not then improvise a Gospel letter.**

### What opened sources say (none is a PWA spec)

- SAMHSA FAQ `[verified]`: 988 works when **telephone, cellular, or internet** is available. Chat is website-based. If data is down but the cellular voice network is up, **call 988** still applies. If there is no phone service at all, the app cannot complete the handoff — IASP’s next step is **local emergency services**.
- The Hotline `[verified]`: if internet usage might be monitored, **call**; do not rely on the site. Quick exit. 911 if in immediate danger.
- IASP WHA79 `[verified]`: a list of hotlinks is weaker than a handoff to a person. Offline, `tel:` *is* the handoff; a failed `fetch('/api/chat')` is not.
- NNEDV / Next Step `[verified]`: do not invent safety advice; do not write plans into a log the abuser can open later.
- No opened WHO / IASP / SAMHSA document describes “service worker + crisis modal + offline advisor.” Do not cite one.

### What Red Letter does today (repo, not research)

D7: client modal before send; server prefixes a notice; letters are **fixed, never retrieval**.  
D12: suicidality / assault / abuse are answered by those fixed letters **on the first turn and every follow-up**; “the one thing the page must not do in that moment is improvise.”

Flow in `public/js/app.js`: detect kind (including **carried** disclosure) → `showCrisisModal` → if the user chooses continue → `POST /api/chat`. On network failure, `buildOfflineAdvisorReply` runs thematic retrieval against the cached WEB corpus. Theme hints include `/forgiv/` → **Forgiveness**, `/suffer|pain|hurt/` → Suffering & Pain, `/conflict|argument|relationship/` → Conflict & Relationships.

That offline path **is retrieval**. It can answer “should I forgive him and stay?” with a forgiveness pack after the user has already seen the danger modal. That is the D7/D12 offline gap.

`tel:` / `sms:` links in `public/js/crisis.js` do not need `/api/chat`. Chat buttons (`988lifeline.org`, `thehotline.org`, `hotline.rainn.org`, `findahelpline.com`) **do**.

### What should happen (implication)

1. **Keep the modal (or an equivalent on-screen notice) with `tel:` as the primary control.** 988 call/text and 1-800-799-7233 / 1-800-656-4673 are phone-network actions. Label chat links as needing data.
2. **Do not call `buildOfflineAdvisorReply` for a crisis/danger/assault kind (including carried).** That function is ordinary encouragement. Using it here violates D7 (“never retrieval”) and D12 (“never improvise”) and recreates the exact clergy failure the faith sources describe.
3. **If the user continues while offline, show the same fixed letter text locally** (the copy already exists in `lib/letters.js` / can be mirrored next to the modal copy in `crisis.js`) plus the numbers. Scripture in those letters is already secondary.
4. **If you cannot even show the letter, stop.** A toast that “saved readings remain available” (`#offline-banner`) is the wrong frame for a disclosure. Do not drop them into Seek / Today / a Peace pack.
5. **Device risk:** writing the disclosure and a letter into `localStorage` chat history while someone may be watching the phone is the scenario The Hotline and Next Step describe. The modal already says to clear the conversation if someone watches the phone. Offline persistence should not make that harder.
6. **Do not invent an offline safety plan, grounding exercise, or “stay with someone tonight” protocol beyond the already-fixed letter.** IASP’s safety-plan mention is not an instruction for this app to author one without a network.

---

## Implications for Red Letter D7 / D12 / offline gap

| Decision | What it already gets right (against opened sources) | Gap |
|---|---|---|
| **D7** — modal before send + server notice + fixed letters, never retrieval | Matches IASP “handoff to a trained person,” SAMHSA “here is 988,” USCCB/FaithTrust “refer, don’t counsel first,” NNEDV “AI is not the advocate.” Modal copy already says the app is the wrong place and that nothing here will tell you to stay in danger. | D7 is **server + pre-send modal**. It is not implemented on the **offline continue** path. After the modal, a failed POST becomes retrieval. |
| **D12** — fixed letters on turn 1 and every follow-up; no improvisation | Matches the documented follow-up harm (forgive / submit / keep the peace). Matches Next Step “do not go along.” Carried disclosure already bypasses the paywall — correct, because a paywall in front of a handoff is the opposite of IASP’s “adequately resourced handoff.” | D12 is enforced in `server.js` `chatSafety`. Offline never reaches that function. Multi-turn persistence **online** is in force; **offline** a follow-up can be answered from the Forgiveness theme. |
| **D13** — discard model letters that counsel stay/submit | Aligned with every opened IPV/faith source on *not* counseling stay. | Offline path never hits `lib/guard.js` either. |
| **Offline gap** | Modal `tel:` links still work without the API. PWA cache keeps the shell and WEB corpus. | `buildOfflineAdvisorReply` is the hole: thematic Gospel improvisation after a safety disclosure. Also: chat/URL helplines fail offline; the UI should prefer phone. Banner copy (“saved readings remain available”) is inappropriate on this path. |

### Concrete product implications (not already claimed as shipped)

1. **Treat offline the same as D12.** If `detectKind` or `detectConversation` is crisis / danger / assault, skip `buildOfflineAdvisorReply`. Serve the cached fixed letter + notice, or refuse to send and leave the modal up.
2. **Keep spiritual material second.** Opened clergy guidance agrees Gospel/forgiveness language is a **roadblock** when it is the first voice. Do not “warm” a crisis continue-state with Matthew 6:14–15, Ephesians-style submission, or a generic Peace pack.
3. **Stay/submit/forgive-in-place ban stays.** It is advocacy-aligned as a *prohibition*. Keep “at your pace” / “advocates will help you think through what is possible” so it does not become a leave-order. Do not write in-place safety steps.
4. **Persist disclosure for the conversation, not as aftercare.** Re-show the handoff on later turns. Do not market memory as companionship (NNEDV). Offer a clear way to wipe local history (The Hotline / Next Step device risk).
5. **988 copy.** Prefer SAMHSA’s verified facts: call or text 988; chat needs the site; not only suicide; not automatically police; if in immediate physical danger call the local emergency number. Canada 9-8-8 and Samaritans 116 123 / Lifeline 13 11 14 in the modal are product choices; this session did not re-verify those numbers on their home pages.
6. **RAINN.** Modal already has 1-800-656-4673 and hotline.rainn.org from a prior verification. This session **could not open RAINN**. Re-open before the next release (`RELEASE.md` already requires that). Do not add T.A.L.K. wording until a RAINN page is actually read.
7. **IASP’s higher bar.** WHA79 says a disclaimer-plus-list is not enough; the handoff must be real. Red Letter cannot staff a warm transfer. The honest design is: **stop, put a callable number first, do not continue as Advisor.** That is already the modal’s job. The offline bug is that “continue” restarts Advisor without the server.

---

## Direct answers (short)

1. **First duty:** interrupt; put emergency / 988 / DV / RAINN on screen as `tel:`/`sms:` first; say this is not a person and not care; do not lead with prayer, forgiveness, submission, or retrieved verses. `[verified]` IASP WHA79 + IASP crisis page + SAMHSA 988 FAQ/fact sheet + USCCB order of goals + NNEDV AI guides.

2. **Never counsel stay/submit/forgive-in-place:** **aligned**, as a ban on religious pressure to remain. Pair it with survivor autonomy and a hotline handoff — do not command leaving. `[verified]` USCCB, VAWnet faith-leader guide, FaithTrust, NNEDV faith, The Hotline friends/family pages, Next Step / NNEDV AI.

3. **Multi-turn persistence:** **not a cited IASP/WHO/SAMHSA standard.** Recommended here as the only way to avoid answering the follow-up as ordinary spiritual advice — which those same faith/IPV pages name as the harm. Limit to the conversation; do not become a remembered companion. No opened study of chatbot memory.

4. **Offline after the modal:** numbers still call; chat sites will not; **do not run thematic offline retrieval**; show the same fixed letter or keep the modal. No opened professional PWA-crisis standard; this is D7/D12 applied to the only path that currently bypasses them.

---

## What this file does not contain

- Any RAINN policy text (site blocked).
- SAMHSA “988 Key Messages” page body (JS shell).
- WHO 2023 media-resource update (the 2017 IRIS PDF was opened; the 2023 HTML landing was found in search but not fully retrieved as PDF).
- Interviews, unpublished “best practice” from product blogs, or hackathon PWAs.
- Clinical protocols, safety-plan templates, or assessment scripts — those belong to 988 / The Hotline / RAINN / local services, not to this app.
