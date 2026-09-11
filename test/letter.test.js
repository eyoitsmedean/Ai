const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { letterFromSayings, FALLBACK_OPEN } = require('../lib/letter');
const { retrieveSayings } = require('../lib/retrieve');
const { verifyAndSubstitute, verifyQuote } = require('../lib/scripture');

function passages(letter) {
  return letter.split('\n').filter((l) => /^\*\*/.test(l.trim()));
}

describe('letterFromSayings', () => {
  it('opens with the same line the eval uses to detect the fallback voice', () => {
    assert.match(letterFromSayings([], { themes: ['Fear'] }), new RegExp(FALLBACK_OPEN));
  });

  it('does not pretend warmth when no need was recognized', () => {
    const printed = letterFromSayings([], { themes: [] });
    assert.match(printed, /Matthew, Mark, Luke, and John/);
    assert.doesNotMatch(printed, new RegExp(FALLBACK_OPEN));
  });

  it('cites the sayings retrieval chose for this question, then verifies them', () => {
    const { sayings } = retrieveSayings('I am so anxious about tomorrow that I cannot sleep');
    const printed = verifyAndSubstitute(letterFromSayings(sayings));
    assert.match(printed, /Matthew 6:34|Matthew 6:26|Matthew 6:31/);
    const cites = passages(printed);
    assert.ok(cites.length >= 1);
    for (const line of cites) {
      const cite = line.replace(/\*\*/g, '').trim();
      const next = printed.split('\n')[printed.split('\n').indexOf(line) + 1] || '';
      const quote = next.replace(/^[“"]|[”"]$/g, '');
      assert.equal(verifyQuote(cite, quote).ok, true, cite);
    }
  });

  it('hands a crisis reader only comfort verses', () => {
    const { sayings, crisis, themes } = retrieveSayings('I am suicidal');
    assert.equal(crisis, true);
    const printed = verifyAndSubstitute(letterFromSayings(sayings, { crisis, themes }));
    assert.match(printed, new RegExp(FALLBACK_OPEN));
    assert.match(printed, /Matthew 11:28/);
    assert.doesNotMatch(printed, /wars and rumours of wars/);
  });
});
