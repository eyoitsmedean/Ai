const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { lookup, loadSpoken } = require('../lib/scripture');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'gospels-kjv.json'), 'utf8'));

// Verses per chapter in the KJV 1769. A dropped verse shifts every later citation in the chapter.
const KJV_VERSE_COUNTS = {
  Matthew: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
  Mark: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
  Luke: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
  John: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
};

describe('KJV corpus integrity', () => {
  it('has every chapter of the four Gospels', () => {
    for (const [book, counts] of Object.entries(KJV_VERSE_COUNTS)) {
      assert.equal(Object.keys(corpus.books[book]).length, counts.length, `${book} chapter count`);
    }
  });

  it('has the KJV verse count in every chapter, numbered without gaps', () => {
    for (const [book, counts] of Object.entries(KJV_VERSE_COUNTS)) {
      counts.forEach((expected, i) => {
        const chapter = corpus.books[book][String(i + 1)];
        const verses = Object.keys(chapter).map(Number).sort((a, b) => a - b);
        assert.equal(verses.length, expected, `${book} ${i + 1} has ${verses.length} verses, KJV has ${expected}`);
        verses.forEach((n, idx) => assert.equal(n, idx + 1, `${book} ${i + 1} skips verse ${idx + 1}`));
      });
    }
  });

  it('keeps the verses the original import dropped, in their own place', () => {
    assert.match(lookup('Matthew 2:16').full, /slew all the children/);
    assert.match(lookup('Matthew 22:1').full, /spake unto them again by parables/);
    assert.match(lookup('Matthew 26:38').text, /^My soul is exceeding sorrowful/);
    assert.match(lookup('Mark 4:40').text, /^Why are ye so fearful/);
    assert.match(lookup('Mark 7:11').full, /Corban/);
    assert.match(lookup('Mark 8:8').full, /seven baskets/);
  });

  it('resolves citations after a repaired gap to the right sentence', () => {
    assert.match(lookup('Matthew 22:37').text, /^Thou shalt love the Lord thy God/);
    assert.match(lookup('Matthew 22:40').text, /^On these two commandments/);
    assert.match(lookup('Matthew 26:39').text, /^O my Father, if it be possible/);
    assert.match(lookup('Matthew 26:41').text, /^Watch and pray/);
    assert.match(lookup('Mark 8:34').text, /^Whosoever will come after me/);
  });

  it('spoken corpus never quotes a verse outside the KJV chapter range', () => {
    const spoken = loadSpoken().books;
    for (const [book, chapters] of Object.entries(spoken)) {
      for (const [ch, verses] of Object.entries(chapters)) {
        const max = KJV_VERSE_COUNTS[book][Number(ch) - 1];
        for (const v of Object.keys(verses)) {
          assert.ok(Number(v) >= 1 && Number(v) <= max, `${book} ${ch}:${v} is outside the chapter`);
        }
      }
    }
  });
});
