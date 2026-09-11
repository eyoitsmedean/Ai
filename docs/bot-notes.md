# Red Letter — Trust harness — v2 — 2026-09-11

Sprint (2026-09-11): five shipped items — need opens Sit; no-key Advisor writes a themed sealed letter; Amen offers Send a blessing; crisis matchers aligned (`unalive`); comfort cites no longer collide with Matthew 14:27 / 24:39.

# Red Letter — Trust harness — v1 — 2026-09-07

Worker: Cursor Grok 4.6 · owns server + scripture verification + retrieval · 2026-09-07

## THE ARTIFACT

Branch `cursor/trust-harness-rebuild-28bf`. The live harness is `server.js` plus `lib/{config,model,prompts,rate-limit,retrieve,scripture}.js`. Original files were edited in place on this branch (code-repo adapter: new branch + PR; `main` untouched). No files deleted.

## SUMMARY

The Advisor still answers only from retrieved Gospel speech, but the gate now refuses narrator verses at every insertion point, not only in `verifyQuote`. Vague chat no longer dumps an unrelated allow-list. Unverified model JSON falls back to curated pages. The Anthropic client uses current structured-output + adaptive-thinking shape, with effort defaulting to `low` so a short letter is not eaten by thinking tokens.

## KEY CHANGES

- **Added** `lib/config.js`, `lib/model.js`, `lib/prompts.js`, `lib/rate-limit.js` — one place each for env, the SDK, prompts, and the limiter.
- **Updated** `lib/scripture.js` — `spokenLookup` is the only path that may print speech; narrator citations and their glosses leave the page.
- **Updated** `lib/retrieve.js` — theme-first scoring, stop-list of empty verbs, comfort fallback (John 14:27 / Matthew 11:28 / Mark 4:39), allow-list previews.
- **Updated** `server.js` — `createApp()` factory; abort on disconnect; curated fallback when `verified` is false; health reports `model` and `effort`.
- **Corrected** crisis matcher — `unalive`, “don’t want to be alive,” curly apostrophes. `kms` is still unmatched (false-positive risk).
- **Corrected** `@anthropic-ai/sdk` 0.39.0 → 0.124.0; `qs` overridden to 6.16.0 (audit clean after).
- **Retired** process-global Anthropic client and module-load `DAILY_SYSTEM` date — the date is taken at request time.

## HOW TO USE

1. Review the PR diff, then `npm test`.
2. `npm start` and send one Advisor line with no key (fallback letter) and one with a key if you have one.
3. Swap in by merging the branch. Nothing in `public/` changed; GitHub Pages is unaffected.

```bash
npm install
npm test
npm start
```

## VERIFICATION PERFORMED

- Read: README, DESIGN, DEMO, LAUNCH, MARKET_STRATEGY, IMPROVEMENT_PLAN, server.js, all `lib/*`, tests, `package.json`, workflows, `.env.example` (2026-09-07).
- Lookups opened: Anthropic models overview; structured outputs; adaptive thinking; effort; extended thinking (deprecation); TypeScript SDK; Express trust proxy; 988lifeline.org; findahelpline.com; npm `@anthropic-ai/sdk` latest and `express` latest; Wikipedia Easter dates 2026–2028.
- `npm test` — 48 pass, 0 fail (2026-09-07).
- `npm run smoke` against `http://localhost:3000` — 8/8 pass (health, daily, encouragement, verify, library, chat fallback, welcome, folio shell).
- `npm audit` after override — 0 vulnerabilities.
- QA Pass A and Pass B run separately after the build (see below).
- Did **not** call Anthropic (no key in this environment). Did **not** run `npm run qa` (Puppeteer / browser). Did **not** hear or render audio.

## ASSUMPTIONS AND LIMITS

- `[assumption]` TARGET = the Node trust harness (`server.js` + `lib/scripture.js` + retrieval), not the folio UI. `public/index.html` is out of this worker’s section.
- `[assumption]` REBUILD_MODE = non-destructive via branch/PR; in-branch edits of the original files are the repo adapter.
- `[assumption]` Default `ANTHROPIC_EFFORT=low` for a short letter. Dean may raise it.
- `[single-source]` Anthropic model IDs and effort defaults: docs.anthropic.com, opened 2026-09-07.
- `[single-source]` Easter 2026-04-05 / 2027-03-28: Wikipedia list of Easter dates, opened 2026-09-07 (matches existing `lib/year.js` tests).
- Stale-by-90-days: model IDs, SDK version, npm advisories, 988 / Find A Helpline URLs.
- VERIFY LIST if the docs move: `claude-opus-5` still current; `output_config.format` still the structured-output field; `thinking.type: "adaptive"` still accepted on Opus 5.
- Crisis matcher does not treat `kms` as a hit.

## SOURCES (claim / evidence ledger)

| Claim | Source | Confidence | What it changed |
| --- | --- | --- | --- |
| Structured outputs live at `output_config.format` (json_schema); supported on `claude-opus-5` | Anthropic structured outputs, opened 2026-09-07, https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs | `[verified]` (retrieved) | Kept `output_config`; merged with effort instead of dropping one |
| Adaptive thinking is the mode for Opus 5; `type: "enabled"` + `budget_tokens` is rejected on 4.7+ | Anthropic extended thinking + adaptive thinking, opened 2026-09-07 | `[verified]` (retrieved) | Chat and structured calls send `thinking: { type: 'adaptive' }` |
| Effort lives at `output_config.effort`; default `high` almost always thinks; `low` is for latency-sensitive chat; thinking counts against `max_tokens` | Anthropic effort + adaptive thinking, opened 2026-09-07 | `[verified]` (retrieved) | Default `low`; `chatMaxTokens` 2400 |
| Current SDK on npm is 0.124.0 (2026-09-04) | registry.npmjs.org/@anthropic-ai/sdk/latest | `[verified]` (retrieved) | Bumped from 0.39.0 |
| Express 5 is current (5.2.1) but this app stays on Express 4 | registry.npmjs.org/express/latest | `[verified]` (retrieved) | No Express 5 migration (out of scope / breaking) |
| `trust proxy` must match the reverse proxy or clients can spoof `X-Forwarded-For` | Express “behind proxies”, opened 2026-09-07 | `[verified]` (retrieved) | `TRUST_PROXY` opt-in, default off |
| 988 is the US Suicide & Crisis Lifeline; Find A Helpline lists verified lines in 175+ countries | 988lifeline.org; findahelpline.com, opened 2026-09-07 | `[verified]` (retrieved) | Crisis notice URLs kept |
| Western Easter 2026-04-05, 2027-03-28 | Wikipedia “List of dates for Easter”, opened 2026-09-07 | `[verified]` (retrieved) | Year tests already matched; added Ash Wednesday 2027-02-10 |

Disconfirmation sought: (1) that narrator verses were already blocked in `fillPlaceholders` — they were not; `{{Matthew 1:1}}` printed the genealogy. (2) that `thinking: { type: 'adaptive' }` is optional on Opus 5 — docs say adaptive is the mode; we send it explicitly. (3) that weekly/high-effort default is safer — docs say high effort plus small `max_tokens` yields `stop_reason: max_tokens`.

## DECISIONS NEEDED FROM DEAN

- Production `ANTHROPIC_EFFORT` — recommendation: keep `low` until a live letter feels thin, then `medium`.
- Whether to migrate Express 4 → 5 in a later pass — recommendation: not this PR.
- Whether `kms` should count as crisis language — recommendation: no, too many false hits.

## CROSS-SECTION NOTES

- Folio UI (`public/index.html`) still calls the same `/api/*` shapes. Health now includes `model` and `effort`; extra fields are additive.
- `data/scripture.js` + `data/red-letters.js` (WEB-era helpers) are unused by the live server. Another worker can retire them; this one did not delete them.
- Unused `cors` dependency remains. Do not add CORS headers without Dean saying the Advisor is called from another origin.

---

## QA Pass A — Information (isolated)

Ran after the build, against the files on disk and `npm test`.

- Claims in README / health / crisis notice trace to KEEP LIST or the ledger.
- 988 and findahelpline.com URLs were opened this session.
- Easter / Ash Wednesday 2027 recomputed: Easter 28 Mar 2027 − 46 days = 10 Feb 2027 `[calc]`.
- No invented sources. KEEP LIST items (12 themes, KJV gate, placeholders, 988, fallback verses, waitlist, rate limits, curated no-key path) still present.
- Narrator-verse leak (Matthew 1:1 / John 1:1 / Mark 1:1) closed and tested.
- Stale-by-90-days: model IDs, SDK, advisories — flagged above.

Defects found in Pass A: none open after the `usableSecret` “xxx” substring false-positive (fixed; retested).

## QA Pass B — Design (isolated)

Ran after Pass A, reading the module map and server surface.

- Hierarchy: env → config → model / prompts / retrieve / scripture → `createApp` routes. One organizing concept: **the page never prints speech the spoken map did not already contain.**
- First consumer payoff: a letter still streams; without a key it is the same two verses as before.
- No empty containers. Original repo files remain on the parent branch.
- Phone review: no new UI. API errors stay one sentence.

Defects found in Pass B: none S1/S2.

## DEFECT REGISTER

| ID | Sev | Item | Status |
| --- | --- | --- | --- |
| D1 | S2 | `usableSecret` treated any key containing `xxx` as a placeholder | Fixed; test now uses `sk-live-not-a-placeholder` |
| D2 | S3 | Duplicate `'dont'` in retrieve STOP set | Fixed while writing |
