# Topic Dossier — Spoken-only fidelity

**Bearing.** C6  
**Why it matters.** If a letter quotes someone who is not Jesus, the product is a lie.

## Foundations

Red letter is a **publisher’s layer**, not a manuscript feature. **VERIFIED** Crossway 2006: first red-letter NT 1899, Bible 1901, Louis Klopsch, prompted by Luke 22:20. NIV CBT 2011 preface (bible-researcher transcription, **VERIFIED** as circulated text; official Biblica URL **UNRESOLVED**): “the issuing of ‘red-letter’ editions is a publisher’s choice — one the committee does not endorse.” OSIS 2.1.1 (**VERIFIED** CrossWire PDF): `q who="Jesus"` is encoder metadata for search/presentation.

This product: two PD KJV sources must agree (`scripts/build-kjv.js`); the live map is `data/red-letter-source.json`; KEEP LIST (`NOT_SPEECH`, `SPOKEN_OVERRIDES`, `NARRATOR_PREFIXES`, `SPOKEN_ADDITIONS`) is how we tell the truth day to day.

## Frontier

Named witness: eBible.org KJV OSIS 1769, hashed, rebuildable. WEB USFX `<wj>` cross-check. A wholesale swap would add 57 verses (including other speakers) and drop 3 genuine ones — measured 2026-09-07, locked in tests.

## Live controversies

Where does Jesus stop speaking in John 3? NIV 2011 often ends at 3:15. John 7:53–8:11 and Mark 16:9–20 are double-bracketed in NA28. This product keeps the woman and the longer ending because the live map marks them; it does not pretend they are undisputed.

## Methods and limits

Verse-for-verse hash, KEEP LIST, verifier that removes unverifiable quotes. **Limit:** the live map is still unnamed. Cornell 2026 chart (**VERIFIED**): a curated selection of PD works can itself be a compilation. Naming the extraction rule is the scholarly minimum.

## What the top 1% know

Red ink never was in the Greek. “Jesus said” in a synopsis is already an editorial act. The dangerous leak is not a missing beatitude — it is the devil, the voice from the cloud, the angel, or 1 John wearing John’s name.

## Hardest objections

1. *Swap to the named map.* Answer: swap adds other speakers. Name the witness; do not swap.  
2. *Drop John 8 / Mark 16.* Answer: editorial KEEP, not a critical text. Say so.  
3. *KJV is a translation.* Answer: settled constraint; verifier blocks other versions.  
4. *Narrator prefixes are ad hoc.* Answer: 64 verses, text-asserted, because a general stripper eats parable speech.  
5. *1,934 verses exceed CUP’s UK band.* Answer: US host, PD wording; UK print is Dean’s (see licence dossier).

## Implications (what changed)

Colophon and Conscience Book already say KJV + spoken only. This cycle: atlas and first-word print the live first verses so a reviewer can see the cut without opening JSON. No map swap.

## Claim ledger

| Claim | Status | Source |
| --- | --- | --- |
| Red letter begins 1899/1901 with Klopsch | VERIFIED | Crossway 2006 |
| NIV CBT does not endorse red letter | SOURCE-REPORTED as official CBT URL; VERIFIED as 2011 preface text | bible-researcher |
| OSIS `who="Jesus"` is presentation metadata | VERIFIED | OSIS 2.1.1 PDF |
| Swap delta +57 / −3 | VERIFIED | `docs/red-letter-map.md`, tests |

## Sources

Crossway 2006; NIV 2011 preface; OSIS 2.1.1; eBible copyright.htm 2026-08-19; in-repo map docs.  
**Depth.** D4 on editorial practice. Blocker for a critical-text dossier: we are not producing a Greek edition.

## Depth reached

D4 for the editorial question the Charter depends on.
