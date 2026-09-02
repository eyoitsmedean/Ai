const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { adviseLetter } = require('../lib/advise');

describe('adviseLetter', () => {
  it('answers shame from the shepherd side, not a generic peace letter', () => {
    const letter = adviseLetter('I feel so much shame and guilt');
    assert.match(letter, /Luke 15|John 6:35/);
    assert.match(letter, /lost|rejoice|bread|shepherd|hunger/i);
    assert.doesNotMatch(letter, /Let not your heart be troubled, neither let it be afraid[\s\S]*Come unto me, all ye that labour/);
  });

  it('answers fear with the little flock, not only John 14', () => {
    const letter = adviseLetter('I am afraid of the future');
    assert.match(letter, /Luke 12|Mark 5:36|Matthew 6/);
    assert.match(letter, /flock|hairs|fear not|believe/i);
  });

  it('still writes a Gospel letter when the page is blank', () => {
    const letter = adviseLetter('   ');
    assert.match(letter, /\*\*(Matthew|Mark|Luke|John) /);
    assert.match(letter, /[“"]/);
  });
});
