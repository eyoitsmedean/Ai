# Start here

**The Red Letter Advisor** is a phone-first reading room. A person types a real life question. The page answers with the spoken words of Jesus in Matthew, Mark, Luke, and John — King James text, checked against a corpus in this repo — and never from memory.

You do not need to assemble anything to *use* the product:

```bash
npm install
npm start          # http://localhost:3000
```

Without an API key the Advisor still writes a letter. The verses in that letter are the ones retrieved for *this* message.

## The three flagships

| # | File | Use it when |
|---|---|---|
| 1 | [`docs/CANONICAL_BRIEF.md`](docs/CANONICAL_BRIEF.md) | You need the recovered intent, the eight original prompts, and what is in / out of scope |
| 2 | [`docs/RESEARCH.md`](docs/RESEARCH.md) | You need a decision, a legal fact, or a source |
| 3 | [`docs/OPERATOR_KIT.md`](docs/OPERATOR_KIT.md) | You have twenty minutes and a key or a phone |

Supporting: `CLAUDE.md` (decisions), `RELEASE.md` (verified vs unverified), `eval/OFFLINE_REVIEW.md` (eight letters, scored 2026-09-11), `DEVICE_CHECKLIST.md`, `docs/CONTINUATION.md` (next agent).

## Your first three actions

1. Open `http://localhost:3000`, acknowledge 988, type *I am so anxious about tomorrow*.
2. Read `eval/OFFLINE_REVIEW.md` — eight real letters, already scored.
3. If you have a key: put it in `.env`, run `npm run eval`, read two files in `eval/letters/`. If you have a phone: `DEVICE_CHECKLIST.md`.

Notion is **out of scope** for this product. Authoritative records live in this repo.
