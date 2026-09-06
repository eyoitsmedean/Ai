/* The corpus is the constitution. Every chapter must hold exactly the KJV's verses,
   numbered as the KJV numbers them, with no translator's margin notes in the text. */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { cleanKjv, lookup } = require('../lib/scripture');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'gospels-kjv.json'), 'utf8'));

// Verses per chapter in the KJV (1769), the four Gospels.
const KJV_VERSES = {
  Matthew: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
  Mark: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
  Luke: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
  John: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
};

describe('KJV corpus', () => {
  it('has every chapter of the four Gospels with the KJV verse count, contiguously numbered', () => {
    for (const [book, counts] of Object.entries(KJV_VERSES)) {
      const chapters = corpus.books[book];
      assert.equal(Object.keys(chapters).length, counts.length, `${book} chapter count`);
      counts.forEach((expected, i) => {
        const chapter = chapters[String(i + 1)];
        const numbers = Object.keys(chapter).map(Number).sort((a, b) => a - b);
        assert.equal(numbers.length, expected, `${book} ${i + 1} verse count`);
        assert.deepEqual(numbers, numbers.map((_, j) => j + 1), `${book} ${i + 1} numbering`);
      });
    }
  });

  it('keeps the verses that were once missing, where the KJV places them', () => {
    const anchors = {
      'Matthew 2:16': /^Then Herod, when he saw that he was mocked/,
      'Matthew 22:1': /^And Jesus answered and spake unto them again by parables/,
      'Matthew 26:38': /^Then saith he unto them, My soul is exceeding sorrowful/,
      'Mark 4:40': /^And he said unto them, Why are ye so fearful/,
      'Mark 7:11': /^But ye say, If a man shall say to his father or mother, It is Corban/,
      'Mark 8:8': /^So they did eat, and were filled/,
      // The verse after each gap must be the KJV's, not its neighbour's.
      'Matthew 22:39': /^And the second is like unto it/,
      'Matthew 26:41': /^Watch and pray, that ye enter not into temptation/,
      'Mark 8:36': /^For what shall it profit a man/,
    };
    for (const [ref, re] of Object.entries(anchors)) {
      const [book, cv] = ref.split(' ');
      const [c, v] = cv.split(':');
      assert.match(cleanKjv(corpus.books[book][c][v]), re, ref);
    }
  });

  it('carries no margin notes into verse text', () => {
    for (const [book, chapters] of Object.entries(corpus.books)) {
      for (const [c, verses] of Object.entries(chapters)) {
        for (const [v, raw] of Object.entries(verses)) {
          const text = cleanKjv(raw);
          assert.doesNotMatch(text, /[{}]|ancient copies|not found in most|Gr\. |\bSyr\. /, `${book} ${c}:${v}: ${text}`);
        }
      }
    }
  });

  it('narrator frames are the corpus’s own words, verse by verse', () => {
    const frames = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'narrator-frames.json'), 'utf8'));
    assert.ok(Object.keys(frames).length >= 70);
    for (const [cite, frame] of Object.entries(frames)) {
      const [book, cv] = cite.split(' ');
      const [c, v] = cv.split(':');
      const full = cleanKjv(corpus.books[book][c][v]);
      assert.ok(full.startsWith(frame.intro), `${cite}: intro is not how the verse begins`);
      if (frame.tail) assert.ok(full.endsWith(frame.tail), `${cite}: tail is not how the verse ends`);
    }
  });

  it('the spoken corpus opens with His words, not the narrator’s', () => {
    const spoken = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'spoken-gospels.json'), 'utf8')).books;
    // Inside a parable He narrates his own characters; those stay.
    const inParable = new Set(['Matthew 12:44', 'Luke 13:8', 'Luke 15:26', 'Luke 15:29', 'Luke 16:2', 'Luke 16:24', 'Luke 19:13']);
    const narrator = [
      /^[^,.;:!?]{0,90}\bJesus\b/,
      /^((And|But|Then|Now|When) )?(he|Jesus)( also)? (answered|answering|said|saith|spake|cried|called)\b[^,]{0,60}, /i,
    ];
    for (const [book, chapters] of Object.entries(spoken)) {
      for (const [c, verses] of Object.entries(chapters)) {
        for (const [v, text] of Object.entries(verses)) {
          const cite = `${book} ${c}:${v}`;
          if (inParable.has(cite)) continue;
          for (const re of narrator) assert.doesNotMatch(text, re, `${cite} keeps the narrator: ${text.slice(0, 80)}`);
        }
      }
    }
    assert.equal(spoken.John['11']['35'], undefined, 'Jesus wept is not a saying');
    assert.equal(spoken.John['20']['21'], 'Peace be unto you: as my Father hath sent me, even so send I you.');
    assert.equal(spoken.Mark['4']['39'], 'Peace, be still.');
  });

  it('serves the spoken text under the right number', () => {
    assert.match(lookup('Matthew 22:39').text, /love thy neighbour as thyself/);
    assert.match(lookup('Matthew 26:41').text, /^Watch and pray/);
    assert.match(lookup('Mark 8:36').text, /gain the whole world/);
    assert.match(lookup('Mark 4:40').text, /Why are ye so fearful/);
  });
});
