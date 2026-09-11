# Red Letter — the verse map

**Purpose.** Tell Dean whether the product’s claim — “only His words” — rests on a named source, and what would change if we swapped the production map for that source.  
**Owner.** Dean.  
**Status.** Named source identified and committed alongside production. Production map unchanged.  
**Updated.** 2026-09-07.  
**What changed.** The unnamed “open red-letter maps” file now has a named public-domain witness; a reproducible build; a locked delta. The live Advisor still reads `data/red-letter-source.json`.

The answer: **keep the production map.** Adopt verses from the named edition one class at a time, never as a wholesale swap.

---

## What the product reads today

`data/red-letter-source.json` (2,007 markers: 1,923 in the Gospels, plus Acts and Revelation). Description: “Words of Jesus Christ (red letter edition)”. No edition, publisher, license, or date. `[verified] (in-scope)`

`scripts/build-spoken.js` turns that map + `data/gospels-kjv.json` into `data/spoken-gospels.json`. A product layer in `lib/scripture.js` then:

- drops 12 verses that are other speakers (`NOT_SPEECH`)
- keeps only His part of 15 shared verses (`SPOKEN_OVERRIDES`)
- trims 64 evangelist introductions (`NARRATOR_PREFIXES`)
- adds Luke 2:49 and the later safe omitted class (`SPOKEN_ADDITIONS`)

That layer is the KEEP LIST. It is how the Advisor currently tells the truth. `[verified] (in-scope)`

---

## The named source

Primary: **King James Version, 1769**, eBible.org OSIS, `<q who="Jesus">` milestones. Public domain. Mirror: [seven1m/open-bibles `eng-kjv.osis.xml`](https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-kjv.osis.xml) at commit `7768dac` (2015-05-07). File revision 2013-07-12. SHA-256 `eeeae647fc28360ce47f9c0d5cc3b397b7fdd9913fe53dc9f44eb6deee50e253`. `[verified] (retrieved) 2026-09-07`

Witness: **World English Bible**, eBible.org USFX, `<wj>` elements. Same mirror, `eng-web.usfx.xml`, same commit. SHA-256 `5ffa2626f170a109a4a96afc90775c06f0821cb4ba81ed34e63663e085708d68`. Used only to ask “does a second edition also mark this verse as His?” — never for wording. `[verified] (retrieved) 2026-09-07`

Derived file: `data/red-letter-ebible-kjv.json`. Rebuild: `npm run red-letter-map` (or `--from DIR` with the two XML files). `[verified] (in-scope)`

| Edition | Matthew | Mark | Luke | John | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Production map (Gospels) | 638 | 289 | 573 | 423 | 1,923 |
| eBible KJV OSIS | 645 | 290 | 599 | 434 | 1,968 |
| WEB USFX | 645 | 287 | 587 | 436 | 1,955 |
| Both editions agree the verse is His | — | — | — | — | 1,950 |

`[verified] (in-scope)` counts from the files built on 2026-09-07.

---

## What the named edition already gets right

These are the S1 defects the unnamed map forced us to patch by hand. The eBible KJV OSIS does not mark them as His:

Mark 9:7 (voice from the cloud) · Mark 16:6 (the angel) · Matthew 15:33 (the disciples) · Luke 13:14 (the synagogue ruler) · Luke 24:32 (the two on the road) · John 7:20 (the people) · John 11:35 (“Jesus wept”) · Mark 4:2 · Mark 5:43.

John 12:34 is still marked (the crowd quoting “The Son of man must be lifted up?”). Luke 19:25 is marked `full` (the hearers). Both stay out of the live corpus via `NOT_SPEECH`. `[verified] (in-scope)`

John 12:28 is His clause only: “Father, glorify thy name.”  
Luke 2:49 is present.

`[verified] (in-scope)` against `data/red-letter-ebible-kjv.json`.

---

## Why not swap

Running the named map through the same product layer (`extractSpoken` + additions) and comparing it to today’s spoken corpus:

| | Count | What it is |
| --- | ---: | --- |
| Verses the named path would **add** | 57 | Mix of genuine speech the production map omitted, other people quoting Him, parable interiors, and 18 OSIS-only narrative leaks |
| Verses the named path would **drop** | 3 | Matthew 13:57 “A prophet is not without honour…” · Mark 9:9 the charge coming down the mountain · Luke 24:45 “Then opened he their understanding…” |
| Spans that would **change** | 70 | Some cleaner (John 8:7, John 11:43, John 21:19). Some worse (parable characters’ lines pulled in as if they were His; a few evangelist intros the product layer does not yet trim) |

`[verified] (in-scope)` computed 2026-09-07.

A wholesale swap would put the centurion, the Pharisee, the Jews, and the healed man in His mouth (Luke 7:4–8, Luke 7:39, John 5:11–12, John 6:41–42, John 8:22, …), and would hand a reader Matthew 24:1 and Mark 8:22–25 as speech — verses the WEB edition does not mark. `[inference] (in-scope)` from reading those spans against the KJV.

The three drops are speech the product already quotes. Matthew 13:57 is marked by WEB, not by the KJV OSIS. `[verified] (in-scope)`

---

## How to take verses from the named edition

Do not replace `data/red-letter-source.json`. Add to the product layer:

1. **Safe to consider adding** (both editions mark the verse; the span is His, not a quotation of Him): Matthew 8:3, 8:32, 12:33, 15:10, 17:23, 26:2; Mark 14:15; Luke 5:37–39, 7:35, 8:5–8, 9:55, 20:23, 21:6, 22:69; John 1:47, 8:41, 21:15. `[recommendation] (in-scope)`
2. **Keep out** — the 18 OSIS-only verses (`osisOnly` in the derived file) and every echo (Peter, the Jews, the healed man remembering His words). `[recommendation] (in-scope)`
3. **Keep in production** even though the KJV OSIS is silent: Matthew 13:57, Mark 9:9, Luke 24:45. `[recommendation] (in-scope)`

`scripts/build-spoken.js` refuses to overwrite `data/spoken-gospels.json` when pointed at the named map. A candidate build is:

```
node scripts/build-spoken.js --source data/red-letter-ebible-kjv.json --out /tmp/spoken-candidate.json --library /tmp/library-candidate.json
```

---

## Stale-by

The XML files last changed in that mirror on 2015-05-07. The hashes above go stale only if eBible.org or the mirror replace the files. Re-run `npm run red-letter-map` after any hash mismatch; do not edit the derived JSON by hand.

Acts (17) and Revelation (67) markers in the production file are out of Gospel scope and are unused by `build-spoken.js`. `[verified] (in-scope)`
