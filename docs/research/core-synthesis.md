# Core synthesis

Original requirement → question → evidence → finding → decision → work → next action.

Retrieved and built 2026-09-11. Labels: **FACT** / **INTERPRETATION** / **RECOMMENDATION**.

---

## 1. What did he originally want?

**Requirement.** World-class research–build–QA loop; beautiful and simple; family stakes; then production-ready; then a wow he can sit; then keep building.

**Finding.** The project is a software + editorial + pastoral product. It is not a Notion database and not a new app.

**Decision.** Recover the brief; repair the live room; write two documents he can use without assembly.

**Work.** `docs/BRIEF.md`; flagships.

---

## 2. Spoken-only fidelity

**Question.** Are the red letters His, and can we name the source?

**Evidence.** `docs/red-letter-map.md`; adjacent-04; eBible OSIS SHA `eeeae647…`; WEB witness; `lib/scripture.js` KEEP LIST.

**Finding.** The live map is still unnamed. The witness is named. A swap adds 57 (including other speakers) and drops 3 genuine sayings. Red letter is a publisher’s judgement (Klopsch 1901; NIV CBT 2011 does not endorse it).

**Decision.** Keep the production map. Do not add more OSIS-only verses this cycle.

**Next.** Dean may later take another *safe* omitted class, one at a time.

---

## 3. Room conscience

**Question.** Does the first verse belong to the life in the question, on every host?

**Evidence.** Audit of `lib/curated.js` vs `public/data/curated.js` vs `public/curated.json`; eval theme gate only checked room name; `danger-05` / `life-44` first cites differed.

**Finding.** Static Seek led Conflict with Matthew 5:44. Static Advisor led by-you and veteran with John 8:11. Server used Luke 15:4.

**Decision.** One source (`npm run curated`); client special lists match `lib/advise.js`; first-citation tests.

**Work.** Done this cycle.

---

## 4. Crisis, poison, danger, bereaved

**Question.** Are the notices current, and is the false-positive policy still right?

**Evidence.** Adjacent-01; official pages 2026-09-11 (see sources.md).

**Finding.** 988, 1-800-222-1222, 1-800-799-7233 / 88788, findahelpline.com are current. 988 chat was omitted. DV pages warn the screen can be seen. APA 2025: disclose not-a-professional; fire a path to a human. IASP WHA79 2026: a disclaimer is not a handoff. Keep “a notice is cheap.”

**Decision.** Add chat URL and one digital-safety sentence. Do not suppress known idioms. Do not add Press 3.

**Work.** `public/data/signals.js`.

---

## 5. Production / PWA

**Question.** Can this ship as an installable phone room without a store?

**Evidence.** Adjacent-02; WebKit Safari 26 (15 Sep 2025); web.dev install criteria; GitHub Pages HTTPS docs.

**Finding.** Yes, on current iOS Safari and Android Chrome, after HTTPS + this manifest. iPhone will not fire `beforeinstallprompt`. `new Notification()` from a timer is not a morning ping after you leave.

**Decision.** Keep PWA-only. Sitting and RELEASE § Phone stay the proof. Do not promise push.

**Next.** Dean’s five minutes on the deployed URL.

---

## 6. KJV licence

**Question.** May a US Pages host quote 1,934 spoken verses?

**Evidence.** Adjacent-03; Copyright Office Circular 15A (rev. Apr 2026); Cornell chart 1 Jan 2026; CDPA 1988 s. 171(1)(b); CUP 2021 imprint ≤500 verses liturgical.

**Finding.** US: public domain, no extra licence. Print ` · KJV`. UK: letters patent; this library exceeds CUP’s no-application band.

**Decision.** No change to US copy. Do not print “reproduced by permission of Cambridge.” Flag UK as Dean’s decision if he publishes there.

---

## 7. Named season

**Question.** Should Forty appear in the UI now?

**Evidence.** Adjacent-05; USCCB 2027 ordo; Church of England calendar; `lib/year.js`; YouVersion partner FAQ (completion spikes 3–21 days); Hallow Lent figures are company or Appfigures estimates, not audited.

**Finding.** Ash Wednesday 2027 is 10 February; Easter 28 March. Seven Days is the shippable named path. Forty in ordinary time is Lent length without Lent.

**Decision.** Keep Forty data-only. Build rooms off-stage. Surface in the week of 10 February 2027.

---

## Investigations that confirmed a direction

- Helpline numbers: confirmed, not replaced.
- Map: confirmed do-not-swap.
- False-positive policy: confirmed keep.
- PWA as mobile: confirmed for this stage; phone walk still required.

## Remaining gaps

- Model-path meaning (needs a key).
- On-device walk (needs Dean’s phone).
- Pages at this commit (needs Dean’s merge).
- Production map provenance (unnamed; witness is named).
- Companion-chatbot statute applicability (counsel, not this repo).
