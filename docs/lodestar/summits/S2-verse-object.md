# Mastery Brief — S2 Verse object

**The summit:** The saying is a thing you can hold: copy, context, plant, sit, share, open WEB.  
**Bearing:** C2, C8

## Who is world-class
YouVersion’s verse object (text + reference + version + share). eBible’s chapter+anchor as the public check. **SOURCE-REPORTED** / prior KNOWLEDGE.

## What world-class looks like
A 44px row under every scripture block. No mystery meat. WEB name only on corpus text.

## The difference that makes the difference
Actions live *on the saying*, not in a distant Library tab.

## Process
Render block → attach actions → context hits `/api/verse-object` → plant writes garden → sit opens lectio → share uses `/share?ref=`.

## Checklist
- [x] Copy includes WEB  
- [x] Context names same-chapter neighbors  
- [x] Plant does not erase other same-day plants  
- [x] WEB opens eBible  
- [x] Touch targets 44px  

## Practice loop
ui-check asserts copy + sit + after-path.

## Traps
A toolbar that looks like a social app. Context that invents verses outside the corpus.

## Sources
D-web-citation; D-competitive-bar. No videos.

## Rubric
| Category | 1–5 |
| --- | --- |
| Completeness of the object | 5 |
| Edition honesty | 5 |
| Touch / a11y | 4 |
| Distinct from share-card-only | 5 |
| Context depth (full chapter text) | 3 |
| Beauty | 4 |

Iterate: context now explains when the chapter is not in the local library instead of failing silently.
