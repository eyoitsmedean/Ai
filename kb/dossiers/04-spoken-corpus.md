# Dossier — Spoken Gospel corpus (what “His words” means in code)

**Topic:** Extracting and sealing Jesus’s speech from the four Gospels  
**Bearing:** C2 · C7  
**Why it matters:** C2 dies if narrator, Paul, or a model-typed verse can pass as His speech. The product’s only load-bearing asset is the spoken store.

## Foundations
Red-letter printing marks reported speech of Jesus; it is a typographic tradition, not a critical edition. Louis Klopsch’s 1899 New Testament popularized the convention in English Bibles (**MODEL-KNOWLEDGE** — not re-opened this session; Research Order below). The KJV 1769 text is public domain in the US (**INFERENCE** from Cornell PD cutoff + 1769; see dossier 01). This repo does not trust a model to type the verse. It stores a spoken map (`data/spoken-gospels.json`) and a grouped library (`public/library.json`).

**What the files actually contain (VERIFIED 14 Sep 2026 by counting on this tree):**
- `lib/library.js` → `sayingCount()` = **662** sayings; `verseCount()` = **1,922** spoken verses.
- `lookup()` returns `redLetter: true` only when `spokenAt(book, chapter, verse)` hits the spoken map.
- `extractSpoken()` strips narrator wrappers (`he saith…`, `, saying,`) so the stored string is speech, not “Jesus said, …”

## Frontier
Critical editions (NA28, UBS5) and the Jesus Seminar’s color votes are **not** this product. Those methods argue authenticity of sayings. This product argues **attribution in the received Gospel text**: if the Evangelist presents it as Jesus speaking, it may enter the store; if not, it may not. Synoptic parallels are stored as separate sayings (same speech, two citations) — **DESIGN CHOICE**, so a Mark 4:39 retrieve does not silently become Matthew.

Live corpus remains KJV until Dean records WEB/BSB/OEB on `/colophon` (**C7**).

## Live controversies
1. **Johannine discourses** — long “I am” speeches vs synoptic brevity. We keep them; C2 said four Gospels, not three.
2. **Narrator bleed** — Mark 4:39 / John 8:12 tests exist because wrappers used to leak. Residual risk: any verse whose spoken map is wrong.
3. **Red-letter disagreement** — publishers differ on whether “Talitha cumi” transliterations, OT quotations in Jesus’s mouth, and the longer ending of Mark count. Our map is a local instrument, not a church decision.

## Methods and limits
- Method: human-or-script tagged spoken span → JSON map → `lookup` prefers red-only spans → Ask retrieves then seals.
- Limit: the map is not independently re-tagged this cycle. Counts are verified; **every verse’s tag was not re-audited**.
- Limit: KJV punctuation and verse splits are 18th-century, not 1st-century speech acts.
- Disconfirmation attempted: Need page quotes were checked against `lookup()`; six rooms were abbreviated or altered. **Fixed this pass** (full sealed text).

## What the top 1% know
A “Jesus said” chatbot that lets the model type the quote will eventually invent one. Placeholder-then-insert (`{{John 14:27}}`) is the only architecture that makes C2 testable. Silence is a successful retrieve. A comfort fallback (Matthew 11:28 for garbage) is a theological lie.

## Hardest objections
1. *The spoken map could be wrong.* **Answer:** True. Tests cover wrappers and a few citations, not 1,922 verses. Next cycle: a verse-audit script, not a model rewrite.
2. *Four Gospels already interpret Jesus.* **Answer:** C2 chose the Evangelists’ report, not a reconstructed ipsissima verba. Stated.
3. *KJV English is not what He spoke.* **Answer:** Translation is C7. Speech-vs-narrator is C2. Do not confuse them.
4. *Synoptic duplicates inflate 662.* **Answer:** Yes. The number is sayings-as-stored, not unique logia.
5. *John 8:1–11 / Mark 16:9–20 are text-critically disputed.* **UNRESOLVED** for this map; do not advertise “every scholar agrees.”

## Implications (what changed)
- `/ask` already refuses unmatched and off-scope without a Matthew 11:28 fig leaf.
- `/need` now prints the **full** sealed saying for each of twelve rooms (was clipping six).
- `/sit` (Director’s Cut) only offers four citations that `lookup` seals.
- Colophon count 662 / 1,922 remains correct (**VERIFIED** this session).

## Claim ledger
| Claim | Status | Source |
| --- | --- | --- |
| 662 sayings, 1,922 verses on this tree | VERIFIED | `sayingCount()` / `verseCount()` 14 Sep 2026 |
| `lookup` requires spoken map for redLetter | VERIFIED | `lib/scripture.js` |
| Ask no longer falls back to 11:28 | VERIFIED | `test/ask.test.js` |
| Need quotes = full sealed text | VERIFIED after repair | `test/need.test.js` |
| Klopsch 1899 popularized red letter | MODEL-KNOWLEDGE | not fetched |
| Map equals scholarly consensus | UNRESOLVED | not audited |

## Sources
- `data/spoken-gospels.json`, `public/library.json`, `lib/scripture.js`, `lib/library.js` (opened this session)
- Dossier 01 (translation)
- Klopsch: **not fetched** — Research Order

## Depth
**D4 on method and this repo’s instrument.** D3 on the history of red-letter printing (primary 1899 pages not opened). Blocker: no verse-by-verse re-tag; no Klopsch/Cambridge facsimile this session.
