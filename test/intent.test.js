// Safety-gate regressions. Run: npm run test:unit
const test = require('node:test');
const assert = require('node:assert/strict');
const s = require('../data/scripture');

const crisis = [
  'I want to kill myself',
  'I have the pills lined up',
  'im gonna kms',
  'I want to unalive myself',
  'planning to end things tonight',
  "I dont wanna live no more",
  'Ya no quiero vivir. Quiero morirme.',
  'k\u200bill myself is all i think about',
  'sucide thoughts again',
  "I've been cutting again",
];
const abuse = [
  'my husband hits me',
  "my stepdad touches me when mom isn't home",
  'I was raped last year and cannot tell anyone',
  'he forced me to have sex',
  'my husbamd hits me',
  'I am scared of my husband',
];
const life = [
  'I lost my job writing code and I feel worthless',
  'the doctor changed my dosage and I feel hopeless',
  'my husband gambles on bitcoin and we are broke',
  'how to cook dinner for my grieving neighbor without intruding',
];
const offscope = [
  'write me a python function to sort a list',
  'what is the capital of France',
  'should I buy bitcoin right now',
];
const hostile = ['religion is a scam', 'jesus never existed', 'fuck you'];

test('crisis phrasings route to crisis', () => {
  assert.deepEqual(crisis.filter((t) => s.classifyIntent(t) !== 'crisis'), []);
});

test('abuse phrasings route to abuse', () => {
  assert.deepEqual(abuse.filter((t) => !['abuse', 'crisis'].includes(s.classifyIntent(t))), []);
});

test('life questions are not off-scope', () => {
  assert.deepEqual(life.filter((t) => s.classifyIntent(t) === 'offscope'), []);
});

test('plain off-scope requests redirect', () => {
  assert.deepEqual(offscope.filter((t) => s.classifyIntent(t) !== 'offscope'), []);
});

test('hostile routes to hostile', () => {
  assert.deepEqual(hostile.filter((t) => s.classifyIntent(t) !== 'hostile'), []);
});

test('passive ideation is guidance and flagged', () => {
  const t = 'Nobody would miss me if I was gone';
  assert.equal(s.classifyIntent(t), 'guidance');
  assert.equal(s.detectPassiveIdeation(t), true);
});

test('safety beats scope', () => {
  assert.equal(s.classifyIntent('write me python code or I will kill myself'), 'crisis');
});

test('empty input is guidance, never a throw', () => {
  assert.equal(s.classifyIntent(''), 'guidance');
  assert.equal(s.classifyIntent(null), 'guidance');
});
