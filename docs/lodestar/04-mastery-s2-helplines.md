# Mastery Brief — S2 Helpline verifier
**Bearing:** C6, C8

## Who is world-class
Operator homepages themselves (988lifeline.org, 988.ca, thehotline.org, samaritans.org, lifeline.org.au) plus a US government directory (OVC) when the operator is Cloudflare-gated. **Evidence:** primary pages, not aggregators.

## What world-class looks like
A script a later bot can run; BLOCKED ≠ FAIL; rainn.org never fails CI; `--strict` for humans.

## Difference that makes the difference
Good: a markdown table dated last month. World-class: fetch the page, search for the number, print PASS/FAIL/BLOCKED.

## Process
Fetch → classify block → regex the body → exit 0 unless `--strict` and FAIL.

## Rubric
1. Every About number has a check — **pass**.
2. rainn.org allowed to block — **pass**.
3. Cloudflare interstitial ≠ “number gone” — **pass**.
4. Runnable without secrets — **pass**.
5. Does not rewrite letters — **pass**.

## Practice loop
`npm run helplines` before each release. Dean re-opens rainn.org.

## Traps
Failing the build because this host is banned. Treating Find A Helpline as more authoritative than the operator.

## Sources
Operator URLs in `scripts/verify-helplines.js`. 988 + 988.ca + Hotline opened 2026-09-14 **VERIFIED**. Others run at ship time.
