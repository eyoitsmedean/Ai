const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Never write test signups into the real list.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rla-test-'));
process.env.WAITLIST_PATH = path.join(tmp, 'waitlist.jsonl');

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
    const invented = await request('POST', '/api/verify', {
      items: [{ verse: 'John 3:16', quote: 'the moon is made of cheese' }],
    });
    const row = JSON.parse(invented.raw).results[0];
    assert.equal(row.ok, false);
    assert.equal(row.reason, 'quote-mismatch');
    assert.match(row.quote, /God so loved the world/);
    const missing = await request('POST', '/api/verify', { verse: '' });
    assert.equal(missing.status, 200);
    assert.equal(JSON.parse(missing.raw).allVerified, false);
  });

  it('searches the spoken library', async () => {
    const res = await request('GET', '/api/library?q=Peace%2C%20be%20still');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.ok(data.sayings.some((s) => /4:39/.test(s.citation)));
  });
});

describe('hardening', () => {
  it('sends security headers and hides the framework', async () => {
    const res = await request('GET', '/api/health');
    assert.match(res.headers['content-security-policy'], /frame-ancestors 'none'/);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-powered-by'], undefined);
  });

  it('answers unknown API routes and bad JSON with JSON, not a stack trace', async () => {
    const missing = await request('GET', '/api/nope');
    assert.equal(missing.status, 404);
    assert.deepEqual(JSON.parse(missing.raw), { error: 'Not found.' });

    const bad = await new Promise((resolve, reject) => {
      const req = http.request(`${base}/api/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => resolve({ status: res.statusCode, raw }));
      });
      req.on('error', reject);
      req.end('{bad');
    });
    assert.equal(bad.status, 400);
    assert.doesNotMatch(bad.raw, /node_modules|at JSON\.parse/);
    assert.ok(JSON.parse(bad.raw).error);
  });

  it('keeps earlier signups when one line of the list is torn', async () => {
    fs.writeFileSync(process.env.WAITLIST_PATH, '{"email":"a@example.com"}\n{"email":"b@exa');
    const res = await request('POST', '/api/waitlist', { email: 'c@example.com' });
    assert.equal(res.status, 200);
    const text = fs.readFileSync(process.env.WAITLIST_PATH, 'utf8');
    assert.match(text, /a@example\.com/);
    assert.match(text, /c@example\.com/);
  });

  it('404s a missing file instead of sending the page', async () => {
    assert.equal((await request('GET', '/data/missing.js')).status, 404);
    assert.equal((await request('GET', '/deep/path')).status, 302);
  });
});

describe('crisis notices', () => {
  const letter = async (content) => {
    const res = await request('POST', '/api/chat', { messages: [{ role: 'user', content }] });
    return res.raw.split('\n')
      .filter((l) => l.startsWith('data: ') && !l.includes('[DONE]'))
      .map((l) => JSON.parse(l.slice(6)).text)
      .join('');
  };

  it('answers Spanish in Spanish, with 988', async () => {
    const text = await letter('ya no quiero vivir');
    assert.match(text, /^Si estás en peligro/);
    assert.match(text, /988/);
  });

  it('points someone being hurt to 911 and the hotline, not 988', async () => {
    const text = await letter('my husband hits me and I am scared');
    assert.match(text, /1-800-799-7233/);
    assert.match(text, /911/);
  });
});
