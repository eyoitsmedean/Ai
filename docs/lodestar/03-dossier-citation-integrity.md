# Topic Dossier — Red-letter citation integrity
**Bearing:** C5, C8 · **Depth:** D4 on *this product’s* method; D3 on the wider “red letter” tradition  
**Why it matters:** The original product law: the model never types a verse.

## Foundations
D4/D8: model emits `{{Book C:V}}` from a retrieved allow-list; server substitutes KJV 1769 Cambridge; non-spoken verses drop with their sentence. Offline ordinary path uses WEB + `spoken-gospels.json` (1 922 verses). Pack letters seal as KJV (`trust.js` source: `pack`) — a prior bug sealed them against WEB and failed.

## Frontier
No academic standard requires a chatbot to do this. The closest crafts are critical editions (NA28/UBS5 for Greek text) and red-letter print conventions (which disagree on some verses). Red Letter’s law is **stricter than print**: if it is not in the spoken map, it does not render as a quotation.

## Live controversies
Which verses are “spoken”? The map is a product corpus, not a magisterium. Changing it is a Charter-level event.

## Methods and limits
`lib/scripture.js` parse → lookup → substitute → audit. Eval 100/100 retrieval (2026-09-11). Live-model path **UNVERIFIED** (OQ2). This cycle did not re-run eval before the first commit.

## What the top 1% know
The failure mode is not a wrong chapter. It is **the model typing a familiar sentence** (John 3:16, “I am the way”) that looks right and was never retrieved. Placeholder substitution is the whole product.

## Hardest objections
1. *Just prompt “only quote Jesus.”* — Prompts leak. Substitution does not.
2. *WEB vs KJV seals confuse users.* — Pack path must seal against the text it actually printed (KJV). Ordinary offline seals against WEB. That split is honest, not a bug.

## Implications
- No citation pipeline change this cycle (on course).
- Helpline/scripture honesty standard reused for the helpline verifier (same inspectability).

## Claim ledger
| Claim | Status | Source |
|---|---|---|
| Model never types a verse | **SOURCE-REPORTED** | CLAUDE.md D4; code in scripture.js |
| 1 922 spoken verses | **SOURCE-REPORTED** | CLAUDE.md D5 |
| Retrieval eval 100/100 | **SOURCE-REPORTED** | eval/RESULTS.md 2026-09-11; not re-run yet this cycle |

## Sources
`lib/scripture.js`, `CLAUDE.md`, `eval/RESULTS.md`.

## Depth and blockers
D4 for the in-repo method. Wider textual-criticism schools left at D3 — Charter does not depend on NA28 debates.
