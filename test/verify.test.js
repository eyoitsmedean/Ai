// Truth layer tests. Corpus-backed cases run offline; the one bible-api case is
// skipped unless VERIFY_NETWORK=1 so the suite is deterministic in CI.
const test = require('node:test');
const assert = require('node:assert/strict');
const v = require('../lib/advisor/verify');
const { similarity } = require('../lib/advisor/normalize');

test('isGospelRef: accepts the four Gospels and common abbreviations only', () => {
  for (const r of ['Matthew 5:3', 'Matt 5:3', 'Mat 5:3', 'Mt 5:3', 'Mark 4:39', 'Mk 4:39', 'Luke 12:32', 'Lk 12:32', 'John 14:27', 'Jn 14:27']) {
    assert.equal(v.isGospelRef(r), true, r);
  }
  for (const r of ['Romans 8:28', 'Psalm 23:1', '1 John 4:8', '3 John 1:2', 'Johnson 3:16', 'Markus 1:1', '', null]) {
    assert.equal(v.isGospelRef(r), false, String(r));
  }
});

test('verifyPassage: a non-Gospel citation is out of scope, never verified', async () => {
  const r = await v.verifyPassage({ verse: 'Romans 8:28', quote: 'All things work together for good.' });
  assert.equal(r.verified, false);
  assert.equal(r.outOfScope, true);
  assert.equal(r.source, 'out-of-scope');
});

test('verifyPassage: a corpus passage returns exact WEB text and the corpus citation', async () => {
  const r = await v.verifyPassage({ verse: 'Matthew 11:28', quote: 'Come to me, all you who labor' });
  assert.equal(r.verified, true);
  assert.equal(r.source, 'corpus');
  assert.equal(r.verse, 'Matthew 11:28–30');
  assert.match(r.quote, /^“?Come to me, all you who labor/);
  assert.equal(r.translation, 'WEB');
});

test('verifyPassage: exact range wins over an overlapping wider passage', async () => {
  const one = await v.verifyPassage({ verse: 'John 14:1', quote: '' });
  const three = await v.verifyPassage({ verse: 'John 14:1-3', quote: '' });
  assert.equal(one.verse, 'John 14:1');
  assert.equal(one.quote, 'Don’t let your heart be troubled. Believe in God. Believe also in me.');
  assert.equal(three.verse, 'John 14:1–3');
});

test('verifyPassage: a model quote that diverges from the corpus text is flagged', async () => {
  const r = await v.verifyPassage({ verse: 'John 14:27', quote: 'completely unrelated words about nothing at all' });
  assert.equal(r.verified, true);
  assert.ok(r.similarity < 0.55);
});

test('groundAdvisorText: swaps the model quote for corpus text and corrects the header range', async () => {
  const input = ['**John 14:2**', '"In my Father\'s house are many homes."', 'He prepares a place.'].join('\n');
  const out = await v.groundAdvisorText(input);
  assert.equal(out.text.split('\n')[0], '**John 14:1–3**');
  assert.match(out.text.split('\n')[1], /^"Don’t let your heart be troubled/);
  assert.equal(out.grounded, 1);
  assert.equal(out.citations[0].verse, 'John 14:1–3');
});

test('groundAdvisorText: a Romans citation is counted out of scope and its quote is left alone', async () => {
  const input = ['**Romans 8:28**', '"All things work together for good."'].join('\n');
  const out = await v.groundAdvisorText(input);
  assert.equal(out.grounded, 0);
  assert.equal(out.outOfScope, 1);
  assert.equal(out.citations[0].outOfScope, true);
  assert.match(out.text, /All things work together for good/);
});

test('extractCitations: finds bold Book c:v references once each', () => {
  const cites = v.extractCitations('**Matthew 6:34** and again **Matthew 6:34**, then **John 14:27**');
  assert.deepEqual(cites, ['Matthew 6:34', 'John 14:27']);
});

test('similarity: identical 1, containment 0.92, unrelated near 0', () => {
  assert.equal(similarity('Peace I leave with you', 'peace i leave with you'), 1);
  assert.equal(similarity('Peace I leave with you', 'Peace I leave with you. My peace I give to you'), 0.92);
  assert.ok(similarity('Peace I leave with you', 'the quick brown fox') < 0.2);
});

test(
  'verifyPassage: a Gospel verse outside the corpus is exact WEB text but speaker-unverified (bible-api)',
  { skip: !process.env.VERIFY_NETWORK && 'set VERIFY_NETWORK=1 to hit bible-api.com' },
  async () => {
    const r = await v.verifyPassage({ verse: 'Matthew 1:1', quote: '' });
    assert.equal(r.verified, false);
    assert.equal(r.speakerUnverified, true);
    assert.equal(r.source, 'bible-api');
    assert.match(r.quote, /genealogy/i);
  }
);
