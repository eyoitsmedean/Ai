const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');

let server;
let base;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, raw });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('smoke routes', () => {
  it('serves health', async () => {
    const res = await request('GET', '/api/health');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.equal(data.ok, true);
    assert.equal(data.themes, 12);
  });

  it('serves a verified daily page', async () => {
    const res = await request('GET', '/api/daily');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.equal(data.verified, true);
    assert.match(data.affirmation.verse, /^(Matthew|Mark|Luke|John) /);
    assert.ok(data.affirmation.quote.length > 8);
  });

  it('rejects an unknown encouragement theme', async () => {
    const res = await request('POST', '/api/encouragement', { theme: 'Astrology' });
    assert.equal(res.status, 400);
  });

  it('serves a verified encouragement pack', async () => {
    const res = await request('POST', '/api/encouragement', { theme: 'Peace' });
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.equal(data.verified, true);
    assert.ok(data.passages.length >= 3);
    assert.match(data.passages[0].quote, /Peace/i);
  });

  it('rejects an empty chat', async () => {
    const res = await request('POST', '/api/chat', { messages: [] });
    assert.equal(res.status, 400);
  });

  it('streams a verified letter for chat', async () => {
    const res = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'I am afraid of the future' }],
    });
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] || '', /text\/event-stream/);
    assert.equal(res.headers['x-accel-buffering'], 'no');
    const letter = res.raw
      .split('\n')
      .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
      .map((line) => {
        try { return JSON.parse(line.slice(6)).text || ''; } catch (_) { return ''; }
      })
      .join('');
    assert.match(letter, /John 14:27/);
    assert.match(letter, /Peace I leave with you/);
    assert.match(res.raw, /\[DONE\]/);
  });

  it('accepts a waitlist email and rejects a bad one', async () => {
    const bad = await request('POST', '/api/waitlist', { email: 'not-an-email' });
    assert.equal(bad.status, 400);
    const ok = await request('POST', '/api/waitlist', { email: 'reader@example.com' });
    assert.equal(ok.status, 200);
    assert.equal(JSON.parse(ok.raw).ok, true);
  });

  it('verifies a real saying and rejects a missing verse', async () => {
    const ok = await request('POST', '/api/verify', {
      items: [{ verse: 'John 14:27', quote: 'Peace I leave with you' }],
    });
    assert.equal(ok.status, 200);
    const data = JSON.parse(ok.raw);
    assert.equal(data.allVerified, true);
    assert.match(data.results[0].quote, /Peace I leave with you/);
    const missing = await request('POST', '/api/verify', { verse: '' });
    assert.equal(missing.status, 200);
    assert.equal(JSON.parse(missing.raw).allVerified, false);
  });

  it('opens the Press review gathering', async () => {
    const res = await request('GET', '/review');
    assert.ok(res.status === 302 || res.status === 301);
    assert.match(res.headers.location || '', /review=1/);
  });

  it('carries season and leaf into the review, and drops junk', async () => {
    const res = await request('GET', '/review?season=lent&leaf=forty');
    const loc = res.headers.location || '';
    assert.match(loc, /season=lent/);
    assert.match(loc, /leaf=forty/);
    const junk = await request('GET', '/review?season=carnival&leaf=%3Cscript%3E');
    const bad = junk.headers.location || '';
    assert.doesNotMatch(bad, /season=/);
    assert.doesNotMatch(bad, /leaf=/);
  });

  it('keeps 988 by call, text, and chat, and names the Crown’s patentee', async () => {
    const res = await request('GET', '/index.html');
    assert.equal(res.status, 200);
    assert.ok((res.raw.match(/href="tel:988"/g) || []).length >= 4, '988 must be reachable from the title page, Advisor, settings, and crisis modal');
    assert.ok(/988lifeline\.org/.test(res.raw), 'chat is a real 988 modality and must be offered');
    assert.ok(/findahelpline\.com/.test(res.raw), 'a non-U.S. path must remain');
    assert.ok(/Crown’s patentee, Cambridge University Press/.test(res.raw), 'the U.K. acknowledgement must be printed');
    assert.ok(/not a person/i.test(res.raw), 'the page must say it is not a person');
    const sw = await request('GET', '/sw.js');
    assert.ok(/rla-phase0-v14/.test(sw.raw) && /\/data\/press\.js/.test(sw.raw), 'service worker must carry the Press offline under a fresh cache name');
  });

  it('seals every crimson sentence in the Press against the Gospel corpus', async () => {
    const vm = require('node:vm');
    const fs = require('node:fs');
    const path = require('node:path');
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'press.js'), 'utf8'), ctx);
    const press = ctx.window.RLA_PRESS;
    assert.ok(press && press.parable && press.parable.leaves.length === 5, 'five parable leaves');
    assert.ok(press.blessing.seeds.length >= 6, 'blessing seeds');
    const items = [
      { verse: press.reveal.verse, quote: press.reveal.quote },
      { verse: press.breath.verse, quote: press.breath.quote },
      { verse: press.examen.verse, quote: press.examen.quote },
      ...press.parable.leaves.map((l) => ({ verse: l.verse, quote: l.quote })),
      ...press.blessing.seeds,
    ];
    for (let i = 0; i < items.length; i += 12) {
      const res = await request('POST', '/api/verify', { items: items.slice(i, i + 12) });
      assert.equal(res.status, 200);
      const data = JSON.parse(res.raw);
      // ok means the reference is genuine red-letter speech; the score means the words are His, not a clipping.
      const failed = data.results.filter((r) => !r.ok || r.score < 0.92).map((r) => r.verse + ' (' + (r.ok ? 'score ' + r.score.toFixed(2) : r.reason) + ')');
      assert.deepEqual(failed, [], 'unsealed: ' + failed.join(', '));
    }
  });

  it('searches the spoken library', async () => {
    const res = await request('GET', '/api/library?q=Peace%2C%20be%20still');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.ok(data.sayings.some((s) => /4:39/.test(s.citation)));
  });
});
