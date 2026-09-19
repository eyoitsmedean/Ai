const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');
const { motifFromRef, motifFromAsk, notesFromQuote, tonesOf, BPM, DRONE, SCALE } = require('../lib/music');
const { lookup } = require('../lib/scripture');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(path.startsWith('http') ? path : `http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => resolve({ status: res.statusCode, raw }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let server;

describe('saying maker', () => {
  it('makes a sealed, deterministic motif from His speech and refuses what is not His', () => {
    const a = motifFromRef('John 16:33');
    const b = motifFromRef('John 16:33');
    assert.equal(a.ok, true);
    assert.equal(a.stop, false);
    assert.equal(a.citation, 'John 16:33');
    assert.equal(a.bpm, BPM);
    assert.equal(a.drone, DRONE);
    assert.ok(a.phrases >= 2);
    const tones = tonesOf(a.notes);
    assert.ok(tones.length >= 8);
    assert.deepEqual(a.notes, b.notes);
    const hit = lookup('John 16:33');
    assert.equal(a.quote, hit.text);
    assert.ok(tones.every((n) => n.hz > 0 && n.beats > 0 && n.word && n.name));
    assert.ok(a.notes.some((n) => n.kind === 'rest' && n.hz === 0));

    const angel = motifFromRef('Luke 2:14');
    assert.equal(angel.ok, false);
    assert.equal(angel.notes.length, 0);

    const empty = motifFromRef('');
    assert.equal(empty.ok, false);
  });

  it('never turns crisis or abuse into music', () => {
    const crisis = motifFromAsk('I want to kill myself');
    assert.equal(crisis.stop, true);
    assert.equal(crisis.notes.length, 0);
    assert.equal(crisis.quote, '');
    assert.match(crisis.handoff, /988/);

    const abuse = motifFromAsk('my husband hits me');
    assert.equal(abuse.stop, true);
    assert.equal(abuse.notes.length, 0);
    assert.match(abuse.handoff, /thehotline\.org/);

    const fromRef = motifFromRef('I want to kill myself');
    assert.equal(fromRef.stop, true);
    assert.equal(fromRef.notes.length, 0);
  });

  it('opens the tired counsel the same way /ask does', () => {
    const tired = motifFromAsk('I am so tired');
    assert.equal(tired.ok, true);
    assert.match(tired.citation, /John 16:33/);
    assert.ok(tonesOf(tired.notes).length >= 8);
  });

  it('keeps the word-to-note map stable and breathes at a stop', () => {
    const notes = notesFromQuote('Peace I leave with you');
    const tones = tonesOf(notes);
    assert.equal(tones.length, 5);
    assert.equal(tones[0].word, 'Peace');
    assert.equal(tones[4].word, 'you');
    assert.equal(tones[4].hz, SCALE[0]);
    assert.deepEqual(notes, notesFromQuote('Peace I leave with you'));

    const phrased = notesFromQuote('Peace I leave with you, my peace I give unto you.');
    assert.ok(phrased.some((n) => n.kind === 'rest'));
    assert.ok(phrased[phrased.length - 1].kind === 'rest' || phrased[phrased.length - 1].word === 'you');
    const lastTone = [...phrased].reverse().find((n) => n.kind === 'tone');
    assert.equal(lastTone.hz, SCALE[0]);
    const half = phrased.find((n) => n.kind === 'rest' && n.beats === 0.5);
    assert.ok(half);
  });
});

describe('saying maker routes', () => {
  it('serves /make and will not play a verse that is not His', async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    try {
      const page = await request('GET', '/make');
      assert.equal(page.status, 200);
      assert.match(page.raw, /Watch/i);
      assert.match(page.raw, /will not play until you ask/i);
      assert.match(page.raw, /a comma is a breath/i);
      assert.doesNotMatch(page.raw, /googleapis/);

      const letter = await request('GET', '/letter');
      assert.equal(letter.status, 200);
      assert.match(letter.raw, /Hear it as a motif/);

      const ok = await request('GET', '/api/make?ref=John%2016:33');
      assert.equal(ok.status, 200);
      const motif = JSON.parse(ok.raw);
      assert.equal(motif.ok, true);
      assert.ok(tonesOf(motif.notes).length >= 8);
      assert.ok(motif.phrases >= 2);
      assert.equal(motif.drone, DRONE);

      const angel = await request('GET', '/api/make?ref=Luke%202:14');
      assert.equal(angel.status, 404);

      const crisis = await request('POST', '/api/make', { text: 'I want to kill myself' });
      assert.equal(crisis.status, 200);
      const stop = JSON.parse(crisis.raw);
      assert.equal(stop.stop, true);
      assert.equal(stop.notes.length, 0);
      assert.match(stop.handoff, /988/);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
