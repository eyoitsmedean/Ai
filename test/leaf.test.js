const test = require('node:test');
const assert = require('node:assert/strict');
const { isPrintable, normalizeSitting } = require('../lib/leaf');

test('normalizeSitting keeps two Gospel sayings and four implication lines', () => {
  const leaf = normalizeSitting({
    q: 'I carry so much shame',
    words: [
      { verse: 'Luke 15:4–8', quote: 'What man of you, having an hundred sheep', translation: 'KJV' },
      { verse: 'Luke 15:7', quote: 'I say unto you, that likewise joy shall be in heaven', translation: 'KJV' },
      { verse: 'John 6:35', quote: 'I am the bread of life' },
    ],
    implication: 'He comes after what is lost.\nRepentance is a reason for joy.\nA third line.\nA fourth line.\nA fifth line that must drop.',
  });
  assert.equal(leaf.words.length, 2);
  assert.equal(leaf.amen, true);
  assert.equal(leaf.watch, true);
  assert.equal(leaf.implication.split('\n').length, 4);
  assert.doesNotMatch(leaf.implication, /fifth line/);
});

test('normalizeSitting drops narrator books and empty quotes', () => {
  const leaf = normalizeSitting({
    q: 'quote Paul',
    words: [
      { verse: 'Romans 8:1', quote: 'There is therefore now no condemnation' },
      { verse: 'John 1:1', quote: '' },
    ],
    implication: 'Invented counsel',
  });
  assert.deepEqual(leaf.words, []);
  assert.equal(leaf.amen, false);
  assert.equal(isPrintable(leaf), false);
});

test('normalizeSitting crisis leaf has 988 notice and no Amen', () => {
  const leaf = normalizeSitting({
    q: 'I want to kill myself',
    crisis: true,
    notice: 'Call or text 988.',
    words: [{ verse: 'John 14:27', quote: 'Peace I leave with you' }],
    implication: 'Do not keep counseling.',
  });
  assert.equal(leaf.crisis, true);
  assert.deepEqual(leaf.words, []);
  assert.equal(leaf.implication, '');
  assert.equal(leaf.amen, false);
  assert.match(leaf.notice, /988/);
  assert.equal(isPrintable(leaf), true);
});
