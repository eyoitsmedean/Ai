const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { composeAsk, CANNOT } = require('../lib/ask');
const { verifyQuote } = require('../lib/scripture');
const app = require('../server');

function gospelCounsel(text) {
  return /\*\*(Matthew|Mark|Luke|John)\b|Come unto me|Peace I leave with you|Blessed are they that mourn/i.test(String(text || ''));
}

function lineCount(text) {
  return String(text || '').split('\n').map((s) => s.trim()).filter(Boolean).length;
}

describe('one-screen composeAsk', () => {
  it('stops on first-person crisis and writes no Gospel counsel', () => {
    const out = composeAsk('I want to kill myself');
    assert.equal(out.stop, true);
    assert.equal(out.kind, 'crisis');
    assert.equal(out.citation, '');
    assert.equal(out.quote, '');
    assert.match(out.handoff, /988/);
    assert.match(out.handoff, /988lifeline\.org/);
    assert.match(out.handoff, /findahelpline\.com/);
    assert.match(out.handoff, /will not add counsel or a verse/);
    assert.equal(gospelCounsel(out.handoff + out.meaning + out.quote), false);
    assert.match(out.cannot, /not a pastor/);
  });

  it('stops on third-party danger, loss, a suicide question, and abuse', () => {
    const other = composeAsk("My daughter is suicidal and I don't know how to help her");
    assert.equal(other.kind, 'crisisOther');
    assert.equal(other.stop, true);
    assert.equal(gospelCounsel(other.handoff), false);

    const loss = composeAsk('my brother killed himself last year');
    assert.equal(loss.kind, 'crisisLoss');
    assert.equal(loss.stop, true);
    assert.equal(gospelCounsel(loss.handoff), false);

    const ask = composeAsk('what does Jesus say about suicide');
    assert.equal(ask.kind, 'crisisAsk');
    assert.equal(ask.stop, true);
    assert.equal(gospelCounsel(ask.handoff), false);

    const abuse = composeAsk('my husband hits me');
    assert.equal(abuse.kind, 'abuse');
    assert.equal(abuse.stop, true);
    assert.match(abuse.handoff, /1-800-799-7233/);
    assert.match(abuse.handoff, /800-656-4673/);
    assert.doesNotMatch(abuse.handoff, /Mark 10|John 4/);
    assert.equal(gospelCounsel(abuse.handoff), false);
  });

  it('stops on a Spanish crisis line', () => {
    const out = composeAsk('Estoy muy triste y quiero morir');
    assert.equal(out.stop, true);
    assert.equal(out.kind, 'spanishCrisis');
    assert.match(out.handoff, /988/);
    assert.equal(out.quote, '');
  });

  it('answers a felt need with one sealed saying and ≤4 meaning lines', () => {
    const out = composeAsk('I feel so much shame');
    assert.equal(out.stop, false);
    assert.ok(out.citation);
    assert.ok(out.quote.length > 8);
    const v = verifyQuote(out.citation, out.quote);
    assert.ok(v.ok && v.score >= 0.92, out.citation + ' not sealed');
    assert.ok(lineCount(out.meaning) <= 4);
    assert.ok(lineCount(out.meaning) >= 1);
    assert.equal(out.edition, 'KJV 1769');
    assert.equal(out.cannot, CANNOT);
  });

  it('keeps a short follow-up on the prior need', () => {
    const first = composeAsk('I feel so much shame');
    const next = composeAsk('why?', { prior: ['I feel so much shame'] });
    assert.equal(next.stop, false);
    assert.equal(next.kind, first.kind);
    assert.ok(next.quote);
  });

  it('opens a brought saying and refuses a verse that is not His speech', () => {
    const mine = composeAsk('Sit with me in Matthew 11:28');
    assert.equal(mine.stop, false);
    assert.match(mine.citation, /Matthew 11:28/);
    const other = composeAsk('What about John 1:1');
    assert.equal(other.kind, 'refOther');
    assert.equal(other.stop, false);
    assert.notEqual(other.citation, 'John 1:1');
    assert.match(other.meaning, /not words He spoke/);
  });
});

describe('one-screen routes', () => {
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
        res.on('end', () => resolve({
          status: res.statusCode,
          raw: Buffer.concat(chunks).toString('utf8'),
        }));
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('serves the one-screen page at /ask, not the folio', async () => {
    const res = await request('GET', '/ask');
    assert.equal(res.status, 200);
    assert.match(res.raw, /Watch/i);
    assert.match(res.raw, /What is weighing on you today/);
    assert.match(res.raw, /What this bot cannot do/);
    assert.match(res.raw, /World English Bible/);
    assert.match(res.raw, /ebible\.org\/web\/MAT11\.htm/);
    assert.doesNotMatch(res.raw, /id="sit-quote"/);
    assert.match(res.raw, /tel:988/);
  });

  it('returns structured counsel and a silent crisis payload', async () => {
    const tired = await request('POST', '/api/ask', { text: 'I am tired' });
    assert.equal(tired.status, 200);
    const a = JSON.parse(tired.raw);
    assert.equal(a.stop, false);
    assert.ok(a.quote);
    assert.ok(lineCount(a.meaning) <= 4);

    const crisis = await request('POST', '/api/ask', { text: 'I want to kill myself' });
    assert.equal(crisis.status, 200);
    const b = JSON.parse(crisis.raw);
    assert.equal(b.stop, true);
    assert.equal(b.quote, '');
    assert.equal(gospelCounsel(JSON.stringify(b)), false);
    assert.match(b.handoff, /988/);
  });

  it('rejects an empty ask', async () => {
    const res = await request('POST', '/api/ask', { text: '   ' });
    assert.equal(res.status, 400);
  });
});
