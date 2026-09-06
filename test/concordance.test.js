const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { allNeeds, sealedNeeds, matchNeed, bestNeed, formatNeedLetter } = require('../lib/concordance');
const { verifyQuote } = require('../lib/scripture');

describe('concordance of need', () => {
  it('seals every line against the spoken corpus', () => {
    const rows = allNeeds();
    assert.ok(rows.length >= 80, 'expected at least 80 needs');
    const bad = rows.filter((r) => !r.ok);
    assert.deepEqual(bad.map((r) => r.verse), []);
    for (const row of sealedNeeds()) {
      const v = verifyQuote(row.verse, row.quote);
      assert.equal(v.ok, true, row.verse + ' failed seal');
      assert.ok(row.quote.length > 8);
    }
  });

  it('maps shame to John 8:11', () => {
    const hit = bestNeed('I feel so much shame I cannot lift my face');
    assert.ok(hit);
    assert.match(hit.verse, /John 8:11/);
    assert.match(hit.quote, /condemn/i);
  });

  it('maps anxiety to Matthew 6', () => {
    const hit = bestNeed('I cannot sleep because tomorrow is already here');
    assert.ok(hit);
    assert.match(hit.verse, /Matthew 6:34/);
  });

  it('maps grief to John 11', () => {
    const hits = matchNeed('my dad died and I do not know how to pray', { limit: 3 });
    assert.ok(hits.some((h) => /John 11:25/.test(h.verse)));
  });

  it('writes a letter that cites and then closes', () => {
    const letter = formatNeedLetter(bestNeed('I feel shame'));
    assert.match(letter, /John 8:11/);
    assert.match(letter, /Sit with this/);
  });

  it('does not invent a need from empty air', () => {
    assert.deepEqual(matchNeed(''), []);
  });
});
