#!/usr/bin/env node
/**
 * Quiet Page smoke QA — run against a live server (npm start).
 * Usage: node scripts/smoke.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3000';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { res, text, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const fails = [];
  const ok = (name) => console.log('✓', name);
  const check = async (name, fn) => {
    try { await fn(); ok(name); }
    catch (e) { fails.push(name + ': ' + e.message); console.error('✗', name, e.message); }
  };

  await check('health', async () => {
    const { res, json } = await req('/api/health');
    assert(res.ok && json.ok, 'health not ok');
    assert(json.corpusPassages >= 40, 'corpus too small: ' + json.corpusPassages);
    assert(json.llm === false || json.llm === true, 'llm flag missing');
  });

  await check('quota is unlimited', async () => {
    const { json } = await req('/api/quota');
    assert(json.unlimited === true, 'words must not be metered');
  });

  await check('daily curated', async () => {
    const { json } = await req('/api/daily');
    assert(json.affirmation?.quote && json.word?.passage, 'daily payload incomplete');
  });

  await check('encouragement', async () => {
    const { json } = await req('/api/encouragement', {
      method: 'POST',
      body: JSON.stringify({ theme: 'Anxiety & Worry' }),
    });
    assert(json.passages?.length >= 1, 'no passages');
  });

  await check('verify Matthew 11:28', async () => {
    const { json } = await req('/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        citations: [{
          verse: 'Matthew 11:28',
          quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        }],
      }),
    });
    assert(json.results?.[0]?.verified, 'Matthew 11:28 not sealed');
  });

  await check('library Mark filter', async () => {
    const { json } = await req('/api/library?book=Mark');
    assert(Array.isArray(json.books) && json.books.includes('Mark'), 'missing books');
    assert(json.passages.length >= 1, 'Mark passages missing');
    assert(json.passages.every((p) => p.book === 'Mark'), 'non-Mark slipped through');
  });

  await check('chat shame → John 8:11', async () => {
    const res = await fetch(BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'I feel so much shame' }] }),
    });
    assert(res.ok, 'chat status ' + res.status);
    const body = await res.text();
    assert(body.includes('data:'), 'not SSE');
    assert(/John 8:11/i.test(body), 'shame should cite John 8:11');
    assert(!/daily_limit|unlock Plus/i.test(body), 'chat must not paywall');
  });

  await check('welcome landing', async () => {
    const { res, text } = await req('/welcome');
    assert(res.ok, 'welcome not 200');
    assert(/Red Letter/i.test(text) && text.includes('988'), 'welcome missing brand/trust');
    assert(text.includes('href="/"'), 'welcome missing Open the Advisor');
  });

  await check('Quiet Page shell', async () => {
    const { res, text } = await req('/');
    assert(res.ok, 'app not 200');
    assert(text.includes('lectio-overlay'), 'missing lectio');
    assert(text.includes('flyleaf'), 'missing flyleaf');
    assert(text.includes('hear-word-btn'), 'missing Hear this');
    assert(text.includes('path-beads'), 'missing path beads');
    assert(text.includes('id="amen"'), 'missing Amen');
    assert(text.includes('crisis.js'), 'missing crisis');
    assert(!text.includes('<<<<<<<'), 'conflict markers in app');
  });

  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nAll smoke checks passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
