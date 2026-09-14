const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { letterFor } = require('../lib/letter');
const { verifyAndSubstitute } = require('../lib/scripture');

describe('letterFor', () => {
  it('writes a shame letter from the curated pack, then seals the speech', () => {
    const raw = letterFor('I feel so much shame');
    assert.match(raw, /\{\{Luke 15:4\}\}/);
    assert.doesNotMatch(raw, /Peace I leave with you/);
    const sealed = verifyAndSubstitute(raw);
    assert.match(sealed, /go after that which is lost/);
    assert.doesNotMatch(sealed, /\{\{/);
  });

  it('writes a fear letter from the curated pack', () => {
    const sealed = verifyAndSubstitute(letterFor('I am afraid of the future'));
    assert.match(sealed, /Fear not, little flock|Be not afraid|hairs of your head/);
  });

  it('keeps the comfort letter when nothing is named', () => {
    const sealed = verifyAndSubstitute(letterFor('I do not know what to say'));
    assert.match(sealed, /Peace I leave with you|Come unto me|Peace, be still/);
  });
});
