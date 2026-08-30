#!/usr/bin/env node
/**
 * Merge public-domain KJV Gospels with a red-letter verse map
 * into spoken-only sayings for verification and the Library.
 */
const fs = require('fs');
const path = require('path');
const { cleanKjv, extractSpoken } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
const SOURCE = process.argv[2] || path.join(ROOT, 'data', 'red-letter-source.json');

const red = JSON.parse(fs.readFileSync(SOURCE, 'utf8')).verses;
const kjv = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gospels-kjv.json'), 'utf8'));

const spoken = {
  attribution: 'KJV 1769 public domain; red-letter spans from open red-letter maps, then spoken-text extraction',
  books: {},
};

let count = 0;
for (const [cite, marker] of Object.entries(red)) {
  const [book, rest] = cite.split(' ');
  if (!GOSPELS.includes(book) || !rest) continue;
  const [ch, vs] = rest.split(':');
  const full = cleanKjv(kjv.books[book]?.[ch]?.[vs] || '');
  if (!full) continue;
  const text = marker && marker !== 'full' ? cleanKjv(marker) : extractSpoken(full, cite);
  if (!text) continue;
  if (!spoken.books[book]) spoken.books[book] = {};
  if (!spoken.books[book][ch]) spoken.books[book][ch] = {};
  spoken.books[book][ch][vs] = text;
  count += 1;
}

function groupSayings() {
  const sayings = [];
  for (const book of GOSPELS) {
    const chapters = spoken.books[book] || {};
    for (const ch of Object.keys(chapters).sort((a, b) => Number(a) - Number(b))) {
      const verses = Object.keys(chapters[ch]).map(Number).sort((a, b) => a - b);
      let i = 0;
      while (i < verses.length) {
        const start = verses[i];
        let end = start;
        const parts = [chapters[ch][String(start)]];
        while (i + 1 < verses.length && verses[i + 1] === end + 1 && parts.length < 5) {
          i += 1;
          end = verses[i];
          parts.push(chapters[ch][String(end)]);
        }
        const citation = start === end ? `${book} ${ch}:${start}` : `${book} ${ch}:${start}–${end}`;
        sayings.push({
          id: `${book}-${ch}-${start}`,
          book,
          chapter: Number(ch),
          start,
          end,
          citation,
          text: parts.join(' '),
        });
        i += 1;
      }
    }
  }
  return sayings;
}

const destSpoken = path.join(ROOT, 'data', 'spoken-gospels.json');
fs.writeFileSync(destSpoken, JSON.stringify(spoken));
const sayings = groupSayings();
fs.writeFileSync(path.join(ROOT, 'public', 'library.json'), JSON.stringify({
  translation: 'KJV',
  count: sayings.length,
  verses: count,
  sayings,
}));
console.log('spoken verses', count, 'sayings', sayings.length, 'bytes', fs.statSync(destSpoken).size);
