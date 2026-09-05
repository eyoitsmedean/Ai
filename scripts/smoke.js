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

  await check('security headers + no powered-by', async () => {
    const res = await fetch(BASE + '/api/health');
    assert(!res.headers.get('x-powered-by'), 'x-powered-by leaked');
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'missing nosniff');
    assert(/SAMEORIGIN/i.test(res.headers.get('x-frame-options') || ''), 'missing frame options');
    assert(/Content-Security-Policy/i.test([...res.headers.keys()].join(' ') ) || res.headers.get('content-security-policy'), 'missing CSP');
    const csp = res.headers.get('content-security-policy') || '';
    assert(csp.includes("default-src 'self'"), 'weak CSP');
  });

  await check('manifest installable', async () => {
    const { res, json } = await req('/manifest.json');
    assert(res.ok && json.name && json.short_name, 'manifest incomplete');
    assert(json.id && json.start_url && json.display === 'standalone', 'missing id/start/display');
    const purposes = (json.icons || []).map((i) => i.purpose).join(' ');
    assert(purposes.includes('any') && purposes.includes('maskable'), 'need separate any + maskable icons');
    assert((json.icons || []).some((i) => i.sizes === '512x512'), 'missing 512 icon');
    assert(Array.isArray(json.shortcuts) && json.shortcuts.length >= 2, 'missing shortcuts');
  });

  await check('production icons + splash + offline', async () => {
    const paths = [
      '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png',
      '/apple-touch-icon.png', '/favicon.png', '/og-image.png',
      '/splash/iphone-14.png', '/offline.html', '/robots.txt',
      '/.well-known/assetlinks.json',
    ];
    for (const p of paths) {
      const res = await fetch(BASE + p);
      assert(res.ok, p + ' ' + res.status);
      if (p.endsWith('.png')) {
        const buf = Buffer.from(await res.arrayBuffer());
        assert(buf.length > 2000, p + ' still a placeholder (' + buf.length + 'b)');
      }
    }
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
    assert(appHtml.includes('breath-overlay') && appHtml.includes('parable-overlay') && appHtml.includes('draw-stage'), 'missing breath/parable/draw');
    assert(appHtml.includes('rhythm-shell') && appHtml.includes('day-poles') && appHtml.includes('more-practices'), 'missing rhythm/poles');
    assert(appHtml.includes('crisis-pill') && appHtml.includes('bless-name'), 'missing crisis/bless');
    assert(appHtml.includes('focus-overlay') && appHtml.includes('rest-overlay') && appHtml.includes('advisor-context'), 'missing focus/rest/context');
    assert(appHtml.includes('ob-close-scale') && appHtml.includes('simple-toggle'), 'missing closeness/simple');
    assert(appHtml.includes('lectio-overlay') && appHtml.includes('harvest-card') && appHtml.includes('return-ribbon'), 'missing lectio/harvest/return');
    assert(appHtml.includes('Lock screen') && appHtml.includes('verify-chip') && appHtml.includes('status-live'), 'missing lock/verify/status');
    assert(appHtml.includes('silence-overlay') && appHtml.includes('rhythm-closure') && appHtml.includes('privacy-toggle'), 'missing silence/closure/privacy');
    assert(appHtml.includes('trust-strip') && appHtml.includes('advisor-hero') && appHtml.includes('Ask the Advisor'), 'missing trust/advisor hero');
    assert(appHtml.includes('share-caption') && /VERIFIED · WEB|Verified · WEB/.test(appHtml), 'missing viral trust share chrome');
    assert(appHtml.includes('garden-canvas') && appHtml.includes('garden-detail'), 'missing living garden');
    assert(appHtml.includes('apple-mobile-web-app-capable'), 'missing iOS A2HS meta');
    assert(appHtml.includes('apple-touch-startup-image'), 'missing iOS splash');
    assert(appHtml.includes('black-translucent'), 'missing iOS status bar');
    assert(appHtml.includes('id="ob-begin-btn"') && !/id="ob-begin-btn" disabled/.test(appHtml), 'Begin still gated');
    assert(appHtml.includes('wireKeyboardInset') && appHtml.includes('wireAndroidBack'), 'missing mobile shell');
    assert(appHtml.includes('Add to Home Screen') || appHtml.includes('install-copy'), 'missing iOS install copy');
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

  await check('waitlist + offline routes', async () => {
    const bad = await req('/api/waitlist', { method: 'POST', body: JSON.stringify({ email: 'nope' }) });
    assert(bad.res.status === 400, 'waitlist should reject bad email');
    const ok = await req('/api/waitlist', { method: 'POST', body: JSON.stringify({ email: 'friend@example.com' }) });
    assert(ok.res.ok && ok.json.ok, 'waitlist failed');
    const off = await fetch(BASE + '/offline');
    assert(off.ok, 'offline route');
    const html = await off.text();
    assert(html.includes('Offline') || html.includes('offline'), 'offline page copy');
  });

  await check('web push: VAPID key + subscribe lifecycle', async () => {
    const key = await req('/api/push/key');
    assert(key.res.ok && /^[A-Za-z0-9_-]{80,90}$/.test(key.json.publicKey || ''), 'VAPID public key malformed');
    const bad = await req('/api/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription: {} }) });
    assert(bad.res.status === 400, 'subscribe should reject invalid subscription');
    const fake = {
      endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/smoke-' + Date.now(),
      keys: { p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM', auth: 'tBHItJI5svbpez7KI4CCXg' },
    };
    const sub = await req('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription: fake, time: '07:30', tz: 'America/New_York' }),
    });
    assert(sub.res.ok && sub.json.ok && sub.json.tz === 'America/New_York', 'subscribe failed');
    const test = await req('/api/push/test', { method: 'POST', body: '{}' });
    assert(test.res.status === 200 || test.res.status === 502, 'test push should attempt delivery (got ' + test.res.status + ')');
    const un = await req('/api/push/unsubscribe', { method: 'POST', body: '{}' });
    assert(un.res.ok && un.json.ok, 'unsubscribe failed');
    const gone = await req('/api/push/test', { method: 'POST', body: '{}' });
    assert(gone.res.status === 404, 'subscription should be removed after unsubscribe');
  });

  await check('service worker: push + notificationclick + cache bump', async () => {
    const sw = await (await fetch(BASE + '/sw.js')).text();
    assert(sw.includes("addEventListener('push'"), 'sw missing push handler');
    assert(sw.includes("addEventListener('notificationclick'"), 'sw missing notificationclick');
    assert(sw.includes('showNotification'), 'sw does not show notifications');
    assert(!sw.includes("'rla-v24'") && !sw.includes("'rla-v25'"), 'sw cache version not bumped');
    assert(sw.includes('url.origin !== self.location.origin') && sw.includes("status: 504"), 'sw must skip cross-origin and never resolve undefined');
  });

  await check('advisor threads + voice shell', async () => {
    const html = await (await fetch(BASE + '/')).text();
    for (const id of ['advisor-bar', 'resume-row', 'threads-sheet', 'thread-list', 'chat-mic', 'reminder-desc']) {
      assert(html.includes('id="' + id + '"'), 'missing #' + id);
    }
    for (const fn of ['saveCurrentThread', 'openThread', 'deleteThread', 'resumeLastThread', 'toggleVoice', 'subscribePush', 'unsubscribePush', 'sendTestPush']) {
      assert(html.includes('function ' + fn), 'missing ' + fn + '()');
    }
    assert(html.includes("'threads-sheet'"), 'threads sheet not wired to Android back');
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
