const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');

let server;
let base;

function sseText(raw) {
  return raw
    .split('\n')
    .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
    .map((line) => {
      try { return JSON.parse(line.slice(6)).text || ''; } catch (_) { return ''; }
    })
    .join('');
}

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
    const letter = sseText(res.raw);
    // Without a model the harness writes the letter itself, from the need the writer named.
    assert.match(letter, /Luke 12:32/);
    assert.match(letter, /Fear not, little flock/);
    assert.doesNotMatch(letter, /\{\{/, 'placeholders must be filled with corpus text');
    assert.match(res.raw, /"source":"letterpress"/);
    assert.match(res.raw, /\[DONE\]/);
  });

  it('writes a different letter for a different need', async () => {
    const shame = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'I feel so much shame' }],
    });
    const shameLetter = sseText(shame.raw);
    assert.match(shameLetter, /Luke 15:4/);
    assert.doesNotMatch(shameLetter, /little flock/);
    const grief = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'my mother died last week' }],
    });
    const griefLetter = sseText(grief.raw);
    assert.match(griefLetter, /Matthew 5:4/);
    assert.match(griefLetter, /Blessed are they that mourn/);
  });

  it('keeps the crisis notice ahead of the letter', async () => {
    const res = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'I want to die' }],
    });
    const letter = sseText(res.raw);
    assert.ok(letter.indexOf('988') < letter.indexOf('**'), '988 must come before the first passage');
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

  it('searches the spoken library', async () => {
    const res = await request('GET', '/api/library?q=Peace%2C%20be%20still');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.ok(data.sayings.some((s) => /4:39/.test(s.citation)));
  });
});
