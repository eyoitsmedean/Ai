const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { cleanKjv, loadSpoken, lookup } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const kjv = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gospels-kjv.json'), 'utf8')).books;
const red = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'red-letter-source.json'), 'utf8')).verses;
const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];

const norm = (s) => cleanKjv(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const verseOf = (cite) => {
  const [book, rest] = cite.split(' ');
  const [ch, v] = rest.split(':');
  return kjv[book]?.[ch]?.[v];
};

/* Verses inside the great discourses that belong to someone else, so the map rightly leaves them black. */
const INTERLOCUTORS = {
  'John 14': [5, 8, 22],
  'John 16': [18, 29, 30],
};

/* Full-marked verses where a speech verb appears mid-sentence because Jesus is quoting or narrating
   another voice inside His own words. Anything else the scan finds is a reply printed in red. */
const HIS_OWN_QUOTATION = [
  'Matthew 5:22', 'Matthew 9:5', 'Matthew 20:7', 'Matthew 23:3', 'Mark 2:9', 'Luke 5:23', 'Luke 7:33', 'Luke 7:34',
  'Luke 14:18', 'Luke 18:4', 'Luke 19:31', 'John 16:15',
];

describe('red-letter map integrity', () => {
  it('every partial marker quotes the KJV verse it points at, span by span', () => {
    const wrong = [];
    for (const [cite, marker] of Object.entries(red)) {
      if (marker === 'full' || !GOSPELS.includes(cite.split(' ')[0])) continue;
      const verse = verseOf(cite);
      if (!verse) { wrong.push(`${cite}: no such verse`); continue; }
      for (const span of marker.split(' … ')) {
        if (!norm(verse).includes(norm(span))) wrong.push(`${cite}: "${span.slice(0, 50)}" is not in "${cleanKjv(verse).slice(0, 60)}…"`);
      }
    }
    assert.deepEqual(wrong, []);
  });

  it('marks nothing outside the four Gospels as spoken', () => {
    assert.deepEqual(Object.keys(loadSpoken().books).sort(), GOSPELS.slice().sort());
  });

  it('covers the great discourses, leaving only the disciples\u2019 questions black', () => {
    const blocks = [
      ['Matthew', 5, 3, 48], ['Matthew', 6, 1, 34], ['Matthew', 7, 1, 27],
      ['Matthew', 24, 4, 51], ['Matthew', 25, 1, 46],
      ['Luke', 6, 20, 49], ['Luke', 15, 4, 32],
      ['John', 14, 1, 31], ['John', 15, 1, 27], ['John', 16, 1, 33], ['John', 17, 1, 26],
    ];
    const missing = [];
    for (const [book, ch, start, end] of blocks) {
      const allowed = INTERLOCUTORS[`${book} ${ch}`] || [];
      for (let v = start; v <= end; v++) {
        if (!red[`${book} ${ch}:${v}`] && !allowed.includes(v)) missing.push(`${book} ${ch}:${v}`);
      }
    }
    assert.deepEqual(missing, []);
  });

  it('keeps the sayings a reader will look for first', () => {
    const famous = [
      'Matthew 11:28', 'Matthew 28:19', 'Matthew 28:20', 'Matthew 27:46', 'Mark 15:34', 'Luke 23:34', 'Luke 23:43',
      'Luke 23:46', 'John 3:3', 'John 8:11', 'John 11:25', 'John 13:34', 'John 14:6', 'John 19:30', 'John 20:29',
      'John 21:15', 'John 21:16', 'John 21:17', 'Luke 22:69', 'Luke 17:36', 'Matthew 12:33', 'Luke 15:17', 'John 8:41',
    ];
    assert.deepEqual(famous.filter((c) => !red[c]), []);
  });

  it('never leaves another speaker\u2019s reply inside a red verse', () => {
    const reply = /[.?!;:] (?:And |But |Then |So )?(?:[A-Z][a-z]+ )?(?:[a-z]+ ){0,3}(?:say|said|saith|answered|answering|asked)\b[^,]{0,25}, /;
    const found = [];
    for (const [book, chapters] of Object.entries(loadSpoken().books)) {
      for (const [ch, verses] of Object.entries(chapters)) {
        for (const [v, text] of Object.entries(verses)) {
          const cite = `${book} ${ch}:${v}`;
          if (red[cite] === 'full' && reply.test(text) && !HIS_OWN_QUOTATION.includes(cite)) found.push(`${cite}: ${text.slice(0, 80)}`);
        }
      }
    }
    assert.deepEqual(found, []);
    for (const cite of HIS_OWN_QUOTATION) assert.equal(red[cite], 'full', `${cite} should still be a full verse`);
  });

  it('cuts the replies that were printed in red', () => {
    assert.equal(lookup('Matthew 21:25').text, 'The baptism of John, whence was it? from heaven, or of men?');
    assert.doesNotMatch(lookup('Mark 8:19').text, /Twelve/);
    assert.doesNotMatch(lookup('Mark 8:20').text, /Seven\.$/);
    assert.equal(lookup('John 13:11').text, 'Ye are not all clean.');
    assert.equal(lookup('John 21:15').text, 'Simon, son of Jonas, lovest thou me more than these? … Feed my lambs.');
    assert.equal(lookup('Luke 17:36').text, 'Two men shall be in the field; the one shall be taken, and the other left.');
  });

  it('corpus carries KJV italics in braces but no editorial notes', () => {
    const notes = [];
    for (const book of GOSPELS) {
      for (const [ch, verses] of Object.entries(kjv[book])) {
        for (const [v, text] of Object.entries(verses)) {
          for (const m of text.matchAll(/\{([^}]+)\}/g)) {
            // Italic supplies run to a few words ("that had been the wife"); a note talks about copies and verses.
            if (m[1].includes(':')) continue;
            if (/\b(copies|verse|manuscripts|Greek|omit|add these words)\b/i.test(m[1]) || m[1].trim().split(/\s+/).length > 8) {
              notes.push(`${book} ${ch}:${v}: {${m[1]}}`);
            }
          }
        }
      }
    }
    assert.deepEqual(notes, []);
  });
});
