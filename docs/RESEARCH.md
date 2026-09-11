# Research archive — The Red Letter Advisor

**Review date:** 2026-09-11  
**Method:** Open the page or PDF. Quote only from opened text. Label `[verified]` / `[blocked]` / `[not fetched]`. No invented citations, interviews, or device results.

Session notes (full ledgers): `docs/research/pwa.md`, `docs/research/licences-helplines.md`, `docs/research/pastoral-safety.md`.

This file is the **synthesis** that decisions used. The ledgers are the evidence.

---

## Coverage map

### Core topics (retained)

| ID | Question | Why it is in the brief | Owner | Status |
|---|---|---|---|---|
| C1 | What may the Advisor quote? | D4, D5, D8 | scripture + letters | Settled; corpus pinned in tests |
| C2 | What happens on suicidality / IPV / assault? | D7, D12, prompt #5 stakes | letters + safety-patterns + crisis.js | Settled online; **offline closed this cycle** |
| C3 | What happens on follow-up (“forgive and stay”)? | Breaker finding; D12 | `chatSafety` / `detectConversation` | Settled; greeting doorway added on the client |
| C4 | May a model letter counsel stay / claim to be a person? | D13 | `lib/guard.js` | Settled |
| C5 | iPhone + Android production shape | Prompt #6 | PWA (D6) | Code ready; **device walk is Dean’s** |
| C6 | Which translation, which licence? | About sheet; OQ1 | CLAUDE.md table | US/non-UK fine; UK paid still open |

### Retired as drift

| Topic | Why retired |
|---|---|
| Scholarship-first / study-tool UI | D3: inverted once; do not repeat |
| Capacitor store wrapper | OQ3 deferred |
| Notion workspace | Not requested; destination is this repo |
| Whole-Bible counsel | Out of mission |

### Five adjacent topics (project-wide, not per-agent)

Chosen for usefulness to a decision or a ship problem, not novelty.

| ID | Topic | Why chosen | Informs |
|---|---|---|---|
| A1 | PWA install in 2026 (Chrome + iOS 26) | Prompt #6 is a phone ship | Do not wait on Capacitor; Home Screen is the iOS path |
| A2 | Helpline numbers + KJV/WEB licences, re-checked | D7 / About / OQ1 | About copy; 988.ca; RAINN re-verify gap |
| A3 | Digital pastoral / IPV safety for a non-clinical tool | Prompt #5; D12 | Offline pack; never counsel stay; no companion aftercare |
| A4 | Offline-after-modal (the D12 hole) | Highest-ROI defect | Safety pack + client wiring |
| A5 | Watched-device / stored chat as IPV risk | Hotline + NNEDV; Journal exists | About line; Clear chat; do not write safety plans into storage |

---

## Source register (consequential only)

| Question | Finding | Source | Fetched | Limits | Confidence | Decision affected |
|---|---|---|---|---|---|---|
| Is 988 still the US number? | Yes. Call, text, or chat. | https://988lifeline.org/ ; https://www.samhsa.gov/mental-health/988 | 2026-09-11 | — | High | Keep 988; say **US** |
| Is Canada the same operator? | No. Separate site 988.ca, same short code. | https://988.ca/ | 2026-09-11 | — | High | About + modal distinguish 988.ca |
| DV numbers? | 1-800-799-7233; text START to 88788 | https://www.thehotline.org/ | 2026-09-11 | — | High | Keep |
| RAINN numbers? | 800-656-4673 and hotline.rainn.org still listed on US OVC; rainn.org **blocked** here | https://www.ovc.ojp.gov/help-for-victims/toll-free-text-and-online-hotlines | 2026-09-11 | Operator site unread | Medium–high | Keep numbers; Dean re-opens rainn.org before flip |
| Samaritans / Lifeline? | 116 123 and 13 11 14 still on operator homes | samaritans.org ; lifeline.org.au | 2026-09-11 | — | High | Keep |
| WEB licence? | Public domain; name is eBible.org trademark | https://ebible.org/web/copyright.htm | 2026-09-11 | — | High | Offline corpus stays WEB |
| KJV UK? | Crown + CUP; ≤500 verses liturgical/non-commercial educational; word “perpetual” **not** on opened pages | Yale guide; CoE 2000 PDF; CUP 2021 sample; CUP form Last-Modified 2025-08-18 | 2026-09-11 | Live CUP HTML 403/503 | Medium on 2026 web policy | OQ1 unchanged |
| First duty of a non-clinical tool? | Interrupt; hand to a trained person; do not lead with spiritual advice | IASP WHA79 2026-06-10; IASP crisis page; SAMHSA 988 FAQ; USCCB *When I Call for Help*; NNEDV AI guides | 2026-09-11 | RAINN unread | High | D7/D12 confirmed |
| Counsel stay / forgive-in-place? | Ban is aligned; do not command leaving either | USCCB; VAWnet faith-leader guide; FaithTrust 2015; The Hotline friends/family | 2026-09-11 | — | High | Keep letter wording; D13 stays |
| Persist disclosure? | Not an IASP/WHO standard; needed to avoid the documented follow-up harm | Faith/IPV pages above; Next Step DV on chatbots | 2026-09-11 | No trial of chatbot memory | Medium as *policy*, high as *product logic* | Same-conversation only |
| Offline after modal? | `tel:` is the handoff; thematic retrieval is improvisation | Same sources + repo audit | 2026-09-11 | No PWA-crisis spec exists | High as D12 application | Safety pack |
| Chrome install 2026? | Criteria page last updated 2024-09-19; Red Letter already meets it | web.dev install-criteria; MDN | 2026-09-11 | No newer 2026 replacement found | High that we meet the last published bar | D6 |
| iOS `beforeinstallprompt`? | Still unsupported | MDN BCD | 2026-09-11 | — | High | Keep Share → Add to Home Screen copy |
| 7-day ITP? | Home Screen remains the exemption; `persist()` uses that heuristic | WebKit tracking-prevention; 2023 Storage Policy | 2026-09-11 | — | High | Prompt install; already call `persist()` |
| Watched phone? | Treat the site as public; clear history; prefer voice if monitored | The Hotline technology-facilitated abuse; NNEDV Survivor’s Guide to AI; Next Step DV | 2026-09-11 | — | High | About line + existing modal note |

---

## Syntheses

### C2 / C3 / A3 / A4 — Safety, follow-up, offline

**Answer:** Online, Red Letter already does what the opened sources allow a non-clinical Gospel page to do: stop, put a callable number first, say it is not a person, and refuse to improvise. The remaining hole was **continue + failed fetch**. Theme retrieval could answer “should I forgive him and stay?” from the Forgiveness pack after the danger modal. That is the clerical failure VAWnet and FaithTrust describe (Matthew 18 / “forgive and forget” used to send someone back).

**Decision:** Precache the same KJV notices and letters the server would send. If `crisisKind` is set, never call `buildOfflineAdvisorReply`. A greeting after a disclosure (“ok thanks”) is a doorway, not another handoff — same as `lib/retrieve.js`.

**What did not change:** Letter wording. No new safety-plan text. No long-lived “I remember you” companion (NNEDV: AI is not aftercare).

### A1 — PWA in 2026

**Answer:** Android Chrome still wants name, 192+512 icons, start_url, display, HTTPS, and a short engagement heuristic. Screenshots 1170×2532 and 1920×1080 pass the 2.3 ratio rule. A service worker is **not** a 2026 install gate on the last fetched criteria page; we keep one for offline. iOS still has no `beforeinstallprompt`. Safari 26 treats Home Screen as a web app by default, with a user override.

**Decision:** Stay on D6. Do not start Capacitor this cycle. Device checklist step 2 (iPhone) and Android step 1 remain the proof, and only Dean can run them.

### A2 — Numbers and licences

**Answer:** 988, DV, Samaritans, Lifeline, WEB trademark, and KJV Crown/CUP are still as CLAUDE.md described, with two precision fixes: **988 is two operators** (US / Canada), and **“perpetual” is our adjective**. RAINN’s own site was blocked; OVC still lists 800-656-4673 and text HOPE to 64673.

**Decision:** About now says 988 (US), 988.ca (Canada), and RAINN. Do not add HOPE/64673 to the modal until rainn.org is actually opened (Dean, before flip). OQ1 unchanged.

### A5 — Watched device

**Answer:** The Hotline and NNEDV treat a chatbot log as something an abuser can open. Next Step: not VAWA-confidential; may be produced in court.

**Decision:** Modal already warns to clear the conversation. About now points at Settings → Clear Advisor chat. Do not add an in-app safety plan that would sit in `localStorage`. Journal backup is a feature for ordinary saved verses; it is the wrong tool for a disclosure.

---

## Chain used this cycle

Original requirement (D12, prompts #5–#6)  
→ Question: what does the page do when the API is down after a modal?  
→ Evidence: pastoral ledger §4 + `app.js` fetch-fail path  
→ Finding: theme retrieval violates D12  
→ Decision: ship a filled KJV pack; never fall through  
→ Work: `lib/letters.js` `buildSafetyPack`, `public/data/safety-pack.json`, `offlineReplyFor`  
→ Next: Dean’s device steps 5, 6, 8 and live eval (OQ2)

---

## Gaps left open on purpose

- rainn.org unread this session.
- Live CUP HTML rights page unread.
- No physical device.
- No live-model eval.
- No user testing (do not claim any).
- HOPE-to-64673 and Lifeline SMS 0477 13 11 14 are documented additions, not shipped (avoid growing the modal without operator-page confirmation for RAINN SMS).
