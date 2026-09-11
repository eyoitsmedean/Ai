const test = require('node:test');
const assert = require('node:assert/strict');
const { askFor, CANNOT } = require('../lib/ask');
const { CRISIS_NOTICE } = require('../lib/scripture');

test('askFor: shame returns spoken words and at most four lines of implication', () => {
  const out = askFor('I carry so much shame');
  assert.equal(out.crisis, false);
  assert.ok(out.words.length >= 1);
  assert.ok(out.words.every((w) => w.quote && w.verse && w.translation === 'KJV'));
  assert.ok(out.implication);
  assert.ok(out.implication.split('\n').length <= 4);
  assert.equal(out.cannot, CANNOT);
  assert.equal(out.translation, 'KJV');
  assert.equal(out.watch, true);
  assert.match(out.words.map((w) => w.verse).join(' '), /Luke 15|Matthew/);
});

test('askFor: crisis returns 988 and nothing else to counsel with', () => {
  const out = askFor('I want to kill myself');
  assert.equal(out.crisis, true);
  assert.equal(out.notice, CRISIS_NOTICE.trim());
  assert.deepEqual(out.words, []);
  assert.equal(out.implication, '');
  assert.equal(out.cannot, CANNOT);
  assert.match(out.notice, /988/);
});

test('askFor: empty query does not invent speech', () => {
  const out = askFor('   ');
  assert.equal(out.crisis, false);
  assert.deepEqual(out.words, []);
  assert.equal(out.implication, '');
});

test('askFor: narrator-style query still only emits spoken-lookup verses', () => {
  const out = askFor('tell me about the beginning');
  assert.ok(out.words.length >= 1);
  for (const w of out.words) {
    assert.ok(w.quote.length > 8);
    assert.ok(!/^In the beginning was the Word/.test(w.quote));
    assert.ok(!/^The book of the generation/.test(w.quote));
  }
});
