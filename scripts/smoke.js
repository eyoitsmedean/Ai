#!/usr/bin/env node
/**
 * Folio smoke QA — run against a live server (npm start).
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
    assert(json.themes >= 12, 'theme rooms missing');
    assert(json.sayings > 100, 'spoken corpus missing from health');
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'missing nosniff');
  });

  await check('daily page', async () => {
    const { json } = await req('/api/daily');
    assert(json.affirmation?.quote && json.word?.passage, 'daily payload incomplete');
  });

  await check('daily local date', async () => {
    const a = await req('/api/daily?date=2026-08-29');
    const b = await req('/api/daily?date=2026-08-30');
    assert(a.json?.word?.verse && b.json?.word?.verse, 'dated daily missing');
    assert(a.json.word.verse + a.json.word.title !== b.json.word.verse + b.json.word.title, 'dates did not rotate');
  });

  await check('missing asset is 404', async () => {
    const { res } = await req('/does-not-exist.js');
    assert(res.status === 404, 'expected 404 for missing js, got ' + res.status);
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
        items: [{
          verse: 'Matthew 11:28',
          quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        }],
      }),
    });
    assert(json.results?.[0]?.ok, 'Matthew 11:28 not sealed');
  });

  await check('library Mark filter', async () => {
    const { json } = await req('/api/library?book=Mark');
    assert(Array.isArray(json.sayings) && json.sayings.length >= 1, 'Mark sayings missing');
    assert(json.sayings.every((p) => p.book === 'Mark'), 'non-Mark slipped through');
  });

  await check('chat without a key still writes', async () => {
    const res = await fetch(BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'I feel so much shame' }] }),
    });
    assert(res.ok, 'chat status ' + res.status);
    const body = await res.text();
    assert(body.includes('data:'), 'not SSE');
    const letter = body
      .split('\n')
      .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
      .map((line) => {
        try { return JSON.parse(line.slice(6)).text || ''; } catch (_) { return ''; }
      })
      .join('');
    assert(/Luke 15|John 6:35|Matthew|Mark/i.test(letter), 'fallback should cite a Gospel');
    assert(/lost|rejoice|bread|shepherd|hunger/i.test(letter), 'shame should retrieve a fitting saying');
  });

  await check('welcome landing', async () => {
    const { res, text } = await req('/welcome');
    assert(res.ok, 'welcome not 200');
    assert(/Red Letter/i.test(text) && text.includes('988'), 'welcome missing brand/trust');
    assert(!text.includes('<<<<<<<'), 'conflict markers on welcome');
  });

  await check('folio shell', async () => {
    const { res, text } = await req('/');
    assert(res.ok, 'app not 200');
    assert(text.includes('sit-step-4'), 'missing lectio respond leaf');
    assert(text.includes('id="resume-slip"'), 'missing resume slip');
    assert(text.includes('compose-line'), 'missing commonplace compose');
    assert(text.includes('id="amen"'), 'missing Amen');
    assert(text.includes('id="epigraph"'), 'missing flyleaf');
    assert(text.includes('churchYear'), 'missing church year');
    assert(text.includes('988'), 'missing crisis line');
    assert(!text.includes('<<<<<<<'), 'conflict markers in app');
    assert(!/Ask <em>Him<\/em>/i.test(text), 'must not pretend the model is Jesus');
  });

  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nAll smoke checks passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
