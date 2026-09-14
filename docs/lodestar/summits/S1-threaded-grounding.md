# Mastery Brief — S1 Threaded grounding

**The summit:** A second sentence still stands on the last saying of Jesus.  
**Bearing:** C2, C4, C6

## Who is world-class
Pastoral conversation that does not change the text when the person leans in (classical care of souls). Product analog: retrieval chat that binds follow-ups to the last cited objects. Evidence: Guigo (stay with a short text); YouVersion object permanence. **INFERENCE** from dossiers, not a named living “master” interview.

## What world-class looks like
“What about my kids?” after Matthew 6:34 still yields anxiety/provision sayings, verified. “I want to kill myself” after the same thread still yields the crisis card.

## The difference that makes the difference
Theme is taken from the *last assistant refs* when the new line is a continuation — not from a lonely keyword on the new line.

## Process
1. Classify the latest turn (safety first).  
2. If guidance, detect follow-up.  
3. Extract Gospel refs from the last assistant turn.  
4. Resolve theme from those passages.  
5. Answer from that theme’s corpus leads.

## Checklist
- [x] Crisis still wins  
- [x] First full story still uses `guessTheme`  
- [x] Eval f01/f02/c21  
- [x] Sitting-with strip when continued  

## Practice loop
Add a follow-up phrasing to `eval/questions.json` whenever a real miss appears.

## Traps
Treating every short message as a follow-up when there is no prior saying. Forcing a verse onto off-scope.

## Sources
`data/scripture.js` (`guessThemeFromThread`); dossier D-advisor-craft. No videos.

## Rubric (self-grade after build)
| Category | 1–5 | Note |
| --- | --- | --- |
| Safety order preserved | 5 | c21 |
| Theme inheritance | 5 | unit + f01 |
| Distinct from Hope default | 5 | |
| Honest when no prior refs | 5 | |
| Model-mode proven | 2 | no key |
| Usable in the UI | 4 | chips + strip |

Iterate: after-answer “Ask about this” writes a sitting-with prompt so the next turn is unambiguously a follow-up.
