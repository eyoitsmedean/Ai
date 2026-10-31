const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createScreenKeeper } = require('../public/data/wake');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');

function fakeLock(mode) {
  const sentinels = [];
  return {
    sentinels,
    async request() {
      if (mode === 'deny') throw new Error('NotAllowedError');
      const sentinel = {
        released: false,
        addEventListener() {},
        async release() { this.released = true; },
      };
      sentinels.push(sentinel);
      return sentinel;
    },
  };
}

test('a sitting holds the screen, and leaving releases it', async () => {
  const lock = fakeLock();
  const keeper = createScreenKeeper(lock);
  const held = await keeper.hold('sit');
  assert.equal(held.held, true);
  assert.equal(lock.sentinels.length, 1);
  const still = await keeper.hold('hear');
  assert.equal(still.held, true);
  assert.equal(lock.sentinels.length, 1, 'one lock covers sit and hear');
  const hearing = await keeper.release('sit');
  assert.equal(hearing.held, true);
  assert.equal(lock.sentinels[0].released, false);
  const gone = await keeper.release('hear');
  assert.equal(gone.held, false);
  assert.equal(lock.sentinels[0].released, true);
});

test('a refusal is not reported as a lit screen', async () => {
  const denied = await createScreenKeeper(fakeLock('deny')).hold('sit');
  assert.equal(denied.held, false);
  assert.equal(denied.denied, true);
  const missing = await createScreenKeeper(null).hold('sit');
  assert.equal(missing.held, false);
  assert.equal(missing.supported, false);
});

test('the page asks only while sitting or hearing, and the worker keeps the file', () => {
  assert.match(html, /data\/wake\.js/);
  assert.match(html, /The screen stays lit while you sit/);
  assert.match(html, /holdScreen\('sit'\)/);
  assert.match(html, /holdScreen\('hear'\)/);
  assert.match(html, /releaseScreen\('sit'\)/);
  assert.match(html, /releaseScreen\('hear'\)/);
  assert.match(html, /Listening — the screen stays lit/);
  assert.match(sw, /rla-v22/);
  assert.match(sw, /data\/wake\.js/);
});
