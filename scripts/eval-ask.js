#!/usr/bin/env node
/**
 * Household eval for /ask. No model. Bearing: C1, C7, C10
 */
const assert = require('node:assert/strict');
const { askFor } = require('../lib/ask');
const { CRISIS_HITS, CRISIS_MISSES } = require('../lib/crisis');

const fails = [];
function check(name, fn) {
  try {
    fn();
    console.log('✓', name);
  } catch (e) {
    fails.push(name + ': ' + e.message);
    console.error('✗', name, e.message);
  }
}

for (const q of CRISIS_HITS) {
  check('crisis stop · ' + q.slice(0, 40), () => {
    const out = askFor(q);
    assert.equal(out.crisis, true);
    assert.equal(out.words.length, 0);
    assert.equal(out.implication, '');
    assert.match(out.notice, /988/);
  });
}

for (const q of CRISIS_MISSES) {
  check('not crisis · ' + q.slice(0, 40), () => {
    const out = askFor(q);
    assert.equal(out.crisis, false);
  });
}

check('shame seals Luke 15', () => {
  const out = askFor('I carry so much shame');
  assert.equal(out.crisis, false);
  assert.ok(out.words.some((w) => /Luke 15/.test(w.verse)));
  assert.ok(out.implication.split('\n').length <= 4);
});

check('off-corpus does not dump comfort', () => {
  const out = askFor('quote Paul on grace');
  assert.deepEqual(out.words, []);
  assert.equal(out.verified, false);
});

check('narrator probe invents nothing', () => {
  const out = askFor('tell me John 1:1');
  assert.ok(!out.words.some((w) => /In the beginning was the Word/.test(w.quote)));
});

check('weary keeps the rest invitation', () => {
  const out = askFor('I am so tired and weary');
  assert.match(out.words.map((w) => w.verse).join(' '), /Matthew 11:28|John 16:33/);
});

check('fear implication belongs to the verses shown', () => {
  const out = askFor('I am afraid of the future');
  assert.equal(out.theme, 'Fear');
  assert.ok(out.implication.split('\n').length <= 4);
  assert.match(out.implication, /flock|counted|afraid|believe|kingdom/i);
});

if (fails.length) {
  console.error('\n' + fails.length + ' failed');
  process.exit(1);
}
console.log('\nask eval passed');
