# A4 — PWA / Pages vs WATCH

**Question.** Should this session enable GitHub Pages or treat the folio as unpublished paper?

**Connection.** Early briefs treat “reachable at a public URL” as definition-of-done. Notion 11 Sep: WATCH — do not publish, do not launch, do not store-submit. This week: external publish = HOLD.

## Answer

Do not enable Pages. Do not curl-and-celebrate a URL. Do not register a service worker as a launch. Local `/ask` and the existing static folio are the deliverable.

## Deeper explanation

`.github/workflows/pages.yml` already publishes `public/` when Pages is enabled on `main` / the default branch. On 6 Sep 2026 the default GitHub Pages URL returned 404 and the Pages API reported no site. That was not re-checked tonight (`stale-by: re-curl`). Re-checking would not authorize enablement.

A PWA install on a phone is a *kind* of distribution. The one-screen sends `noindex, nofollow` and prints WATCH. The folio’s existing SW is left as it was, cache bumped only because a new static file was added. Enabling the Pages source in GitHub Settings is Dean’s act.

## Disagreements

- ATELIER DoD item 4 (public URL, phone install) vs Notion WATCH.
- Later law wins. The DoD item is **blocked** on a human gate, not failed.

## Practical implication

CLAUDE.md next-step no longer says “enable GitHub Pages” as if it were the agent’s job. It says: WATCH holds; Dean enables hosting only after he records a translation.

## Decision

**Boundary established.** Paper. No publish.
