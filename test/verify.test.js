const test = require('node:test');
const assert = require('node:assert/strict');
const s = require('../data/scripture');

test('isGospelRef accepts Mat and rejects Romans', () => {
  assert.equal(s.isGospelRef('Mat 5:3'), true);
  assert.equal(s.isGospelRef('Matthew 6:34'), true);
  assert.equal(s.isGospelRef('Romans 8:28'), false);
});

test('non-Gospel citations are out of scope', async () => {
  const r = await s.verifyPassage({ verse: 'Romans 8:28', quote: 'All things work together.' });
  assert.equal(r.verified, false);
  assert.equal(r.outOfScope, true);
});

test('corpus hit is verified WEB text', async () => {
  const r = await s.verifyPassage({ verse: 'Matthew 11:28', quote: 'Come to me' });
  assert.equal(r.verified, true);
  assert.equal(r.source, 'corpus');
  assert.match(r.quote, /Come to me/);
});

test('John 14:1 prefers the tight range', async () => {
  const r = await s.verifyPassage({ verse: 'John 14:1', quote: '' });
  assert.equal(r.verse, 'John 14:1');
});

test('groundAdvisorText replaces invented quotes', async () => {
  const out = await s.groundAdvisorText('**Matthew 6:34**\n"totally fake pizza quote"');
  assert.equal(out.grounded, 1);
  assert.doesNotMatch(out.text, /pizza/);
});
