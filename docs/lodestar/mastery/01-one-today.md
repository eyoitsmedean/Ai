# Mastery Brief — One Today

**Summit.** Structural. Static morning page uses the same rotation as `/api/daily`.  
**Bearing.** C7

## Who is world-class

Single-source-of-truth calendaring: RFC 5545 local dates; Temporal `PlainDate` (not UTC epoch-day). Daily offices: Book of Common Prayer — the office is the same whether you are in the cathedral or a kitchen. Evidence: the BCP text; web.dev date advice; this product’s own miss (UTC `%` vs local midnight).

**No videos cited** (no transcript access). Research Order: “calendar date vs UTC day index bugs” talks.

## What world-class looks like

Given `YYYY-MM-DD`, every host prints the same affirmation and word. A build artifact is not “today.”

## The difference that makes the difference

Index from **local civil date**, not `Date.now()/86400000`. Export the hydrated rotation; do not freeze one day into `curated.json`.

## Process

1. Canonical slots in `lib/curated.js`.  
2. `dailyIndexForDate` shared.  
3. `npm run curated` writes `rotation` + `RLA_dailyForDate`.  
4. Page prefers API, else that function.  
5. Test five dates both sides.

## Checklist

- [x] Same verse for 2026-08-29 and 2026-09-14 on client and server  
- [x] Forty’s long `daily` list left intact  
- [x] No UTC fallback as the happy path  

## Practice loop

Change a slot → `npm run curated` → `npm test` → `npm run sit`.

## Traps

Using the Forty list as Today. Using UTC. Treating `curated.json.daily` as a brain.

## Sources

`lib/curated.js`; RFC 5545 (MODEL-KNOWLEDGE for the spec number; not re-opened). Tests this cycle: **VERIFIED**.
