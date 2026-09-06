const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { holdPlaceholders } = require('../lib/stream');
const { fillPlaceholders } = require('../lib/scripture');

describe('holdPlaceholders', () => {
  it('passes plain prose straight through', () => {
    assert.deepEqual(holdPlaceholders('I hear you. '), { flush: 'I hear you. ', rest: '' });
  });

  it('holds everything from an unclosed {{', () => {
    assert.deepEqual(
      holdPlaceholders('Read this.\n{{John 14'),
      { flush: 'Read this.\n', rest: '{{John 14' }
    );
  });

  it('holds a trailing single brace that may become {{', () => {
    assert.deepEqual(holdPlaceholders('Read this.\n{'), { flush: 'Read this.\n', rest: '{' });
  });

  it('releases a closed placeholder together with the text before it', () => {
    assert.deepEqual(
      holdPlaceholders('Read this.\n{{John 14:27}}\nIt meets'),
      { flush: 'Read this.\n{{John 14:27}}\nIt meets', rest: '' }
    );
  });

  it('holds only the second, unclosed placeholder', () => {
    const { flush, rest } = holdPlaceholders('{{John 14:27}}\nctx\n\n{{Matt');
    assert.equal(flush, '{{John 14:27}}\nctx\n\n');
    assert.equal(rest, '{{Matt');
  });

  it('flushes all when forced at end of stream', () => {
    assert.deepEqual(holdPlaceholders('{{John 14', true), { flush: '{{John 14', rest: '' });
  });

  it('token-by-token streaming fills exactly what the whole text would', () => {
    const letter = 'You are not alone.\n\n{{John 14:27}}\nPeace is left with you.\n\n{{Matthew 11:28}}\nRest is offered.\n\nSit with it.';
    const tokens = letter.match(/.{1,3}/gs);
    let pending = '';
    let out = '';
    for (const token of tokens) {
      pending += token;
      const { flush, rest } = holdPlaceholders(pending, false);
      pending = rest;
      if (flush) out += fillPlaceholders(flush);
    }
    const tail = holdPlaceholders(pending, true);
    if (tail.flush) out += fillPlaceholders(tail.flush);
    assert.equal(out, fillPlaceholders(letter));
    assert.match(out, /\*\*John 14:27\*\*\n“Peace I leave with you/);
    assert.doesNotMatch(out, /\{\{/);
  });
});
