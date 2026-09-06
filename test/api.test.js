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

  function parseStream(raw) {
    const frames = raw
      .split('\n')
      .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
      .map((line) => {
        try { return JSON.parse(line.slice(6)); } catch (_) { return {}; }
      });
    return {
      text: frames.map((f) => f.text || '').join(''),
      replace: frames.filter((f) => typeof f.replace === 'string').map((f) => f.replace),
      verify: frames.find((f) => f.verify)?.verify,
      done: /\[DONE\]/.test(raw),
    };
  }

  it('streams a verified letter shaped by the question', async () => {
    const res = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'I am afraid of the future' }],
    });
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'] || '', /text\/event-stream/);
    assert.equal(res.headers['x-accel-buffering'], 'no');
    const stream = parseStream(res.raw);
    assert.ok(stream.done);
    // Fear pack leads: Luke 12:32 "Fear not, little flock" is the first curated passage.
    assert.match(stream.text, /\*\*Luke 12:32\*\*\n“Fear not, little flock/);
    // Every bold citation is followed by a quoted verse line, no placeholder leaks.
    assert.doesNotMatch(stream.text, /\{\{/);
    assert.equal(stream.replace.length, 1);
    assert.equal(stream.replace[0], stream.text);
    assert.ok(stream.verify, 'server emits a verify frame');
    assert.equal(stream.verify.source, 'server');
    assert.equal(stream.verify.translation, 'KJV');
    assert.ok(stream.verify.total >= 2);
    assert.equal(stream.verify.allVerified, true);
  });

  it('prefixes the crisis notice and still verifies', async () => {
    const res = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'I want to die and I do not see a reason to live' }],
    });
    const stream = parseStream(res.raw);
    assert.match(stream.text, /^If you are in danger/);
    assert.match(stream.text, /988/);
    assert.equal(stream.verify.allVerified, true);
  });

  it('keeps the most recent turns instead of rejecting a long local history', async () => {
    const messages = [];
    for (let i = 0; i < 30; i += 1) {
      messages.push({ role: 'user', content: `turn ${i}` });
      messages.push({ role: 'assistant', content: `reply ${i}` });
    }
    messages.push({ role: 'user', content: 'I feel so alone tonight' });
    const res = await request('POST', '/api/chat', { messages });
    assert.equal(res.status, 200);
    const stream = parseStream(res.raw);
    assert.match(stream.text, /\*\*John 14:18\*\*/);
    assert.ok(stream.done);
  });

  it('rejects an over-long last message and an invalid role', async () => {
    const long = await request('POST', '/api/chat', {
      messages: [{ role: 'user', content: 'x'.repeat(2001) }],
    });
    assert.equal(long.status, 400);
    const role = await request('POST', '/api/chat', {
      messages: [{ role: 'system', content: 'hi' }],
    });
    assert.equal(role.status, 400);
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
