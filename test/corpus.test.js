const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const kjv = require('../data/gospels-kjv.json');
const spoken = require('../data/spoken-gospels.json');

// Verses per chapter in the 1769 KJV. A dropped verse shifts every later
// verse number, so "verified" citations would quote the wrong words.
const KJV_VERSES = {"Matthew":[25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],"Mark":[45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],"Luke":[80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],"John":[51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25]};

describe('KJV Gospel corpus', () => {
  for (const [book, counts] of Object.entries(KJV_VERSES)) {
    it(`${book} has every chapter and verse`, () => {
      const chapters = kjv.books[book];
      assert.equal(Object.keys(chapters).length, counts.length);
      counts.forEach((n, i) => {
        const verses = Object.keys(chapters[String(i + 1)] || {}).map(Number).sort((a, b) => a - b);
        assert.deepEqual(verses, Array.from({ length: n }, (_, j) => j + 1), `${book} ${i + 1}`);
      });
    });
  }

  it('keeps sayings on their own verse numbers', () => {
    assert.equal(spoken.books.Mark['7']['16'], 'If any man have ears to hear, let him hear.');
    assert.match(spoken.books.Mark['8']['36'], /^For what shall it profit a man/);
    assert.match(spoken.books.Matthew['22']['45'], /^If David then call him Lord/);
    assert.match(kjv.books.Matthew['26']['38'], /My soul is exceeding sorrowful/);
  });
});

describe('red-letter map', () => {
  const { lookup, cleanKjv } = require('../lib/scripture');
  const red = (cite) => {
    const [book, cv] = cite.split(' ');
    const [c, v] = cv.split(':');
    return spoken.books[book]?.[c]?.[v] || null;
  };

  // Decisions from scripts/red-letter-corrections.js, checked against an
  // independent red-letter KJV and the text itself.
  it('does not put other voices or narration in red', () => {
    for (const cite of ['Mark 9:7', 'Mark 16:6', 'Luke 13:14', 'John 7:20', 'John 11:35', 'Matthew 15:33']) {
      assert.equal(red(cite), null, cite);
    }
    assert.equal(red('John 12:28'), 'Father, glorify thy name.');
    assert.equal(red('Matthew 21:25'), 'The baptism of John, whence was it? from heaven, or of men?');
  });

  it('keeps sayings the map had missed', () => {
    assert.match(red('Luke 2:49'), /about my Father's business/);
    assert.equal(red('Matthew 8:3'), 'I will; be thou clean.');
    assert.match(red('Luke 8:5'), /^A sower went out to sow his seed/);
    assert.match(red('John 21:15'), /lovest thou me more than these\? … Feed my lambs\./);
  });

  it('keeps a parable whole instead of lifting a character’s line out of it', () => {
    assert.match(red('Matthew 18:26'), /^The servant therefore fell down/);
    assert.match(red('Luke 18:13'), /^And the publican, standing afar off/);
  });

  it('leaves the translators’ textual notes out of the verse', () => {
    assert.doesNotMatch(lookup('Luke 17:36').text, /Greek copies/);
    assert.doesNotMatch(cleanKjv(kjv.books.Luke['10']['22']), /ancient copies/);
    assert.match(cleanKjv(kjv.books.Matthew['25']['14']), /the kingdom of heaven is/);
  });
});
