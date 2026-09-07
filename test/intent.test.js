// Safety gate regression tests. Run: npm run test:unit
// Every phrasing here was either in the evaluation set or found by the
// independent Breaker (RELEASE.md §F). Add a new phrasing here first, then the
// pattern in lib/advisor/intent.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const intent = require('../lib/advisor/intent');
const fx = require('./fixtures/phrasings.json');

const { classifyIntent, detectPassiveIdeation, looksSpanish, normForIntent } = intent;

test('crisis: every explicit-intent phrasing routes to the crisis card', () => {
  const misses = fx.crisis.filter((t) => classifyIntent(t) !== 'crisis');
  assert.deepEqual(misses, []);
});

test('crisis: evasion and encoding do not slip past', () => {
  assert.equal(classifyIntent('k\u200bill myself is all i think about'), 'crisis');
  assert.equal(classifyIntent('I WANT TO KILL MYSELF'), 'crisis');
  assert.equal(classifyIntent('I’m going to end it tonight'), 'crisis'); // curly apostrophe
  assert.equal(classifyIntent('ｉ ｗａｎｎａ ｄｉｅ'), 'crisis'); // fullwidth → NFKC
});

test('crisis: Spanish phrasings route to crisis and are flagged Spanish', () => {
  for (const t of ['Ya no quiero vivir. Quiero morirme.', 'quiero matarme']) {
    assert.equal(classifyIntent(t), 'crisis', t);
  }
  assert.equal(looksSpanish('Ya no quiero vivir. Quiero morirme.'), true);
  assert.equal(looksSpanish('I want to die'), false);
});

test('crisis: third-party concern still gets the handoff', () => {
  assert.equal(classifyIntent("my friend is suicidal and I don't know what to say to her"), 'crisis');
});

test('crisis: hair dye and hyperbole are not crisis', () => {
  assert.equal(classifyIntent('I want to dye my hair red'), 'guidance');
  assert.equal(classifyIntent('this traffic is killing me'), 'guidance');
});

test('passive ideation: guidance route, but flagged so a 988 line is appended', () => {
  for (const t of fx.passive) {
    assert.equal(classifyIntent(t), 'guidance', t);
    assert.equal(detectPassiveIdeation(t), true, t);
  }
  assert.equal(detectPassiveIdeation("I'm anxious about money"), false);
});

test('abuse: every phrasing routes to abuse (or crisis when both are present)', () => {
  const misses = fx.abuse.filter((t) => !['abuse', 'crisis'].includes(classifyIntent(t)));
  assert.deepEqual(misses, []);
});

test('abuse: a threat from another person is abuse, not self-harm', () => {
  assert.equal(classifyIntent('My boyfriend threatened to kill me if I leave. Does Jesus want me to turn the other cheek?'), 'abuse');
});

test('off-scope: plain requests for the thing itself are redirected', () => {
  const misses = fx.offscope.filter((t) => classifyIntent(t) !== 'offscope');
  assert.deepEqual(misses, []);
});

test('off-scope: life questions that merely contain trigger words pass through', () => {
  const misrouted = fx.lifeQuestions.filter((t) => classifyIntent(t) === 'offscope');
  assert.deepEqual(misrouted, []);
});

test('hostile: contempt is routed to the warm reply, never blocked', () => {
  const misses = fx.hostile.filter((t) => classifyIntent(t) !== 'hostile');
  assert.deepEqual(misses, []);
});

test('order: safety beats scope beats tone', () => {
  assert.equal(classifyIntent('write me python code or I will kill myself'), 'crisis');
  assert.equal(classifyIntent('religion is a scam and my husband hits me'), 'abuse');
});

test('empty and non-string input is guidance, never a throw', () => {
  for (const v of ['', null, undefined, 42, {}, []]) {
    assert.equal(classifyIntent(v), 'guidance');
  }
});

test('normForIntent: lowercases, straightens apostrophes, strips zero-width, collapses space', () => {
  assert.equal(normForIntent('  I’m\u200b  HERE\ufeff '), "i'm here");
});
