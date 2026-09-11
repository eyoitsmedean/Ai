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
  assert.equal(out.verified, false);
  assert.doesNotMatch(out.implication, /Peace I leave/);
});

test('askFor: narrator-style or off-corpus query does not dump comfort verses', () => {
  const out = askFor('tell me about the beginning');
  assert.equal(out.crisis, false);
  assert.equal(out.verified, false);
  assert.deepEqual(out.words, []);
  assert.doesNotMatch(out.implication, /In the beginning was the Word/);
});

test('askFor: ordinary suicidal English stops and does not quote', () => {
  for (const q of ['I wish I was dead', 'I cannot go on', "I don't want to be here"]) {
    const out = askFor(q);
    assert.equal(out.crisis, true, q);
    assert.deepEqual(out.words, []);
    assert.equal(out.implication, '');
    assert.match(out.notice, /988/);
  }
});

test('askFor: weary opens the rest invitation, not tomorrow-anxiety', () => {
  const out = askFor('I am so tired and weary');
  assert.equal(out.crisis, false);
  assert.ok(out.words.length >= 1);
  assert.match(out.words.map((w) => w.verse).join(' '), /Matthew 11:28|John 16:33/);
});
