const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const SIGNAL_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rla-signals-')), 'signals.jsonl');
process.env.RLA_SIGNAL_PATH = SIGNAL_FILE;
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

  it('searches the spoken library', async () => {
    const res = await request('GET', '/api/library?q=Peace%2C%20be%20still');
    const data = JSON.parse(res.raw);
    assert.equal(res.status, 200);
    assert.ok(data.sayings.some((s) => /4:39/.test(s.citation)));
  });
});

function dayAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

describe('the ledger (/api/signal)', () => {
  it('keeps plain day totals and answers the four launch questions', async () => {
    const first = await request('POST', '/api/signal', {
      v: 1,
      rows: [
        { day: dayAgo(3), open: 1, lectio: 1, sevenStart: 1, newOpen: 1, day1Lectio: 1 },
        { day: dayAgo(2), open: 1, blessing: 1 },
        { day: dayAgo(1), open: 1, advisor: 2 },
      ],
    });
    assert.equal(first.status, 200, first.raw);
    assert.equal(JSON.parse(first.raw).kept, 3);

    const second = await request('POST', '/api/signal', {
      v: 1,
      rows: [{ day: dayAgo(2), open: 1, newOpen: 1 }],
    });
    assert.equal(second.status, 200);

    const summary = JSON.parse((await request('GET', '/api/signal/summary?days=30')).raw);
    assert.equal(summary.deviceDays, 4);
    assert.equal(summary.totals.newOpen, 2);
    assert.equal(summary.launch.day1LectioPct.value, 50);
    assert.equal(summary.launch.day1LectioPct.target, 40);
    assert.equal(summary.launch.sevenDonePct.value, 0);
    assert.equal(summary.launch.blessingPct.value, 25);
    assert.equal(summary.launch.advisorPct.value, 50);
    assert.match(summary.launch.blessingPct.of, /no id is sent/);

    const stored = fs.readFileSync(SIGNAL_FILE, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(stored.length, 4);
    for (const row of stored) {
      assert.deepEqual(
        Object.keys(row).filter((k) => !['day', 'receivedAt', 'open', 'lectio', 'blessing', 'advisor', 'sevenStart', 'sevenDone', 'newOpen', 'day1Lectio'].includes(k)),
        [],
        'a stored row carries nothing but day totals',
      );
    }
  });

  it('refuses anything that is not a completed day of small integer totals', async () => {
    const cases = [
      { v: 1, rows: [{ day: dayAgo(0), open: 1 }] },
      { v: 1, rows: [{ day: dayAgo(1), open: 1, email: 'x@y.z' }] },
      { v: 1, rows: [{ day: dayAgo(1), open: 1.5 }] },
      { v: 1, rows: [{ day: dayAgo(1), open: 999 }] },
      { v: 1, rows: [{ day: dayAgo(1), day1Lectio: 1 }] },
      { v: 1, rows: [{ day: dayAgo(1), open: 1 }, { day: dayAgo(1), open: 1 }] },
      { v: 1, rows: [{ day: dayAgo(90), open: 1 }] },
      { v: 1, rows: [] },
      { v: 2, rows: [{ day: dayAgo(1), open: 1 }] },
      { rows: 'nope' },
    ];
    for (const body of cases) {
      const res = await request('POST', '/api/signal', body);
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });

  it('caps the summary window and never caches it', async () => {
    const res = await request('GET', '/api/signal/summary?days=9999');
    assert.equal(res.status, 200);
    assert.equal(JSON.parse(res.raw).days, 365);
    assert.equal(res.headers['cache-control'], 'no-store');
  });
});
