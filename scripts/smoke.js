#!/usr/bin/env node
/**
 * Red Letter Advisor smoke QA — run against a live server (npm start).
 * Usage: node scripts/smoke.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3000';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': 'smoke-qa',
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
  });

  await check('library books + Mark filter', async () => {
    const { json } = await req('/api/library?book=Mark');
    assert(Array.isArray(json.books) && json.books.includes('Mark'), 'missing books');
    assert(json.passages.length >= 3, 'Mark passages missing');
    assert(json.passages.every((p) => p.book === 'Mark'), 'non-Mark slipped through');
  });

  await check('daily verified', async () => {
    const { json } = await req('/api/daily');
    assert(json.affirmation?.quote && json.word?.passage, 'daily payload incomplete');
    assert(json.affirmation.verified !== false && json.word.verified !== false, 'daily not verified');
  });

  await check('encouragement grounded', async () => {
    const { json } = await req('/api/encouragement', {
      method: 'POST',
      body: JSON.stringify({ theme: 'Anxiety & Worry' }),
    });
    assert(json.passages?.length >= 1, 'no passages');
    assert(json.passages.every((p) => p.verified), 'unverified encouragement');
  });

  await check('scripture grounding transform', async () => {
    const { groundAdvisorText } = require('../data/scripture');
    const raw = [
      'Here is comfort.',
      '',
      '**Matthew 6:34**',
      '"Totally fake invented Jesus quote about pizza."',
      '',
      'Rest in Him.',
    ].join('\n');
    const out = await groundAdvisorText(raw);
    assert(out.citations.length >= 1, 'no citations');
    assert(out.citations[0].verified === true, 'citation not verified');
    assert(!/pizza/i.test(out.text), 'fake quote not replaced');
    assert(/anxious for tomorrow|don't be anxious|don’t be anxious/i.test(out.text), 'corpus text missing');
    assert(out.grounded >= 1, 'grounded count');
  });

  await check('chat SSE offline grounded', async () => {
    const res = await fetch(BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Id': 'smoke-chat-' + Date.now() },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'I feel anxious about tomorrow' }] }),
    });
    assert(res.ok, 'chat status ' + res.status);
    const body = await res.text();
    assert(body.includes('data:'), 'not SSE');
    assert(/Matthew|Mark|Luke|John/.test(body), 'no gospel citation');
    assert(/"done"\s*:/.test(body) || body.includes('"done":true'), 'no done event');
  });

  await check('welcome + app shells', async () => {
    const app = await fetch(BASE + '/');
    const welcome = await fetch(BASE + '/welcome');
    assert(app.ok && welcome.ok, 'shells not 200');
    const appHtml = await app.text();
    const welcomeHtml = await welcome.text();
    assert(appHtml.includes('share-modal') && appHtml.includes('presence-btn'), 'app missing core UI');
    assert(appHtml.includes('lib-search') && appHtml.includes('carry-card'), 'missing search/carry');
    assert(appHtml.includes('Stories 9:16') && appHtml.includes('Square 1:1'), 'missing share ratios');
    assert(appHtml.includes('sit-overlay') && appHtml.includes('reflect-box') && appHtml.includes('pray-box'), 'missing sit/reflect/pray');
    assert(appHtml.includes('examen-box') && appHtml.includes('plan-card') && appHtml.includes('mem-box'), 'missing examen/plan/memorize');
    assert(appHtml.includes('midday-card') && appHtml.includes('amen-overlay') && appHtml.includes('cmd-overlay'), 'missing midday/amen/cmd');
    assert(/Red Letter/i.test(welcomeHtml) && welcomeHtml.includes('988'), 'welcome missing brand/trust');
  });

  await check('corpus + verses + verify APIs', async () => {
    const corpusRes = await req('/api/corpus');
    assert(corpusRes.res.ok && corpusRes.json.passages?.length >= 40, 'corpus api');
    const verses = await req('/api/verses');
    assert(verses.res.ok && verses.json.count >= 40, 'verses api');
    const verify = await req('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ citations: [{ verse: 'Matthew 6:34', quote: "don't be anxious for tomorrow" }] }),
    });
    assert(verify.res.ok && verify.json.results?.[0]?.verified, 'verify api');
  });

  await check('library search payload', async () => {
    const { json } = await req('/api/library');
    assert(json.passages.some((p) => /parable/i.test(p.note || '')), 'parable notes missing for filter');
    assert(json.passages.every((p) => p.text && p.verse), 'passage fields incomplete');
  });

  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nAll smoke checks passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
