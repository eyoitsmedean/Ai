#!/usr/bin/env node
/**
 * Re-check that published operator pages still name the numbers we print.
 * Bearing: C6, C8
 *
 * Default: exit 0 even when a site is blocked (rainn.org often is).
 * --strict exits 1 on any FAIL (not on BLOCKED).
 * --json prints the report as JSON.
 */
'use strict';

const CHECKS = [
  {
    id: '988-us',
    name: '988 Suicide & Crisis Lifeline (US)',
    url: 'https://988lifeline.org/',
    must: [/988/],
  },
  {
    id: '988-ca',
    name: 'Talk Suicide Canada / 988.ca',
    url: 'https://988.ca/',
    must: [/988|9-8-8/i],
  },
  {
    id: 'hotline-us',
    name: 'National Domestic Violence Hotline',
    url: 'https://www.thehotline.org/',
    must: [/799/, /88788/],
  },
  {
    id: 'samaritans',
    name: 'Samaritans (UK & Ireland)',
    url: 'https://www.samaritans.org/',
    must: [/116\s*123/],
  },
  {
    id: 'lifeline-au',
    name: 'Lifeline Australia',
    url: 'https://www.lifeline.org.au/',
    must: [/13\s*11\s*14|131114/],
  },
  {
    id: 'ovc-rainn',
    name: 'US OVC listing for RAINN (rainn.org often blocked)',
    url: 'https://www.ovc.ojp.gov/help-for-victims/toll-free-text-and-online-hotlines',
    must: [/656-4673|6564673|800656HOPE/i],
  },
  {
    id: 'rainn-org',
    name: 'RAINN homepage',
    url: 'https://www.rainn.org/',
    must: [/656|RAINN/i],
    allowBlocked: true,
  },
];

const UA = 'RedLetterAdvisor/helpline-verify (+https://github.com/eyoitsmedean/Ai)';

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
      },
    });
    const text = await res.text();
    return { status: res.status, ok: res.ok, text, blocked: false };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { status: 0, ok: false, text: '', blocked: true, error: message };
  } finally {
    clearTimeout(timer);
  }
}

function looksBlocked(result) {
  if (result.blocked) return true;
  if (result.status === 403 || result.status === 503 || result.status === 429) return true;
  const body = result.text || '';
  return /cloudflare|sorry, you have been blocked|attention required/i.test(body)
    && body.length < 8000;
}

async function runCheck(check) {
  const result = await fetchText(check.url);
  if (looksBlocked(result) || !result.ok) {
    const blocked = looksBlocked(result) || result.status === 0;
    return {
      id: check.id,
      name: check.name,
      url: check.url,
      status: blocked ? 'BLOCKED' : 'FAIL',
      http: result.status,
      detail: result.error || `HTTP ${result.status}`,
    };
  }
  const missing = check.must.filter((re) => !re.test(result.text));
  if (missing.length) {
    return {
      id: check.id,
      name: check.name,
      url: check.url,
      status: 'FAIL',
      http: result.status,
      detail: `opened, missing: ${missing.map((re) => re.toString()).join(', ')}`,
    };
  }
  return {
    id: check.id,
    name: check.name,
    url: check.url,
    status: 'PASS',
    http: result.status,
    detail: 'expected numbers or names still published',
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const rows = [];
  for (const check of CHECKS) {
    rows.push(await runCheck(check));
  }

  const report = {
    checkedAt: new Date().toISOString(),
    rows,
    pass: rows.filter((r) => r.status === 'PASS').length,
    fail: rows.filter((r) => r.status === 'FAIL').length,
    blocked: rows.filter((r) => r.status === 'BLOCKED').length,
  };

  if (args.has('--json')) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    console.log(`Helpline verify ${report.checkedAt}`);
    for (const row of rows) {
      console.log(`${row.status.padEnd(7)} ${row.id}  ${row.detail}  (${row.url})`);
    }
    console.log(`${report.pass} pass · ${report.fail} fail · ${report.blocked} blocked`);
    console.log('BLOCKED is not a failing number — rainn.org is often Cloudflare-gated from this host.');
  }

  if (args.has('--strict') && report.fail > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { CHECKS, looksBlocked, runCheck };
