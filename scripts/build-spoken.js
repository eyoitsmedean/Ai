#!/usr/bin/env node
/**
 * Merge public-domain KJV Gospels with a red-letter verse map
 * into spoken-only sayings for verification and the Library.
 */
const fs = require('fs');
const path = require('path');
const { cleanKjv, extractSpoken, SPOKEN_ADDITIONS } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
const PROD_SOURCE = path.join(ROOT, 'data', 'red-letter-source.json');
const PROD_SPOKEN = path.join(ROOT, 'data', 'spoken-gospels.json');
const PROD_LIBRARY = path.join(ROOT, 'public', 'library.json');

function flag(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : fallback;
}
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--') && process.argv[process.argv.indexOf(a) - 1] !== '--source' && process.argv[process.argv.indexOf(a) - 1] !== '--out' && process.argv[process.argv.indexOf(a) - 1] !== '--library');
const SOURCE = flag('--source', positional[0] || PROD_SOURCE);
const destSpoken = flag('--out', PROD_SPOKEN);
const destLibrary = flag('--library', PROD_LIBRARY);
const fromNamed = path.resolve(SOURCE) !== path.resolve(PROD_SOURCE);
if (fromNamed && destSpoken === PROD_SPOKEN && !process.argv.includes('--out')) {
  console.error('Refusing to overwrite data/spoken-gospels.json from a non-production map. Pass --out <file>.');
  process.exit(1);
}

const red = JSON.parse(fs.readFileSync(SOURCE, 'utf8')).verses;
const kjv = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gospels-kjv.json'), 'utf8'));

const spoken = {
  attribution: fromNamed
    ? 'KJV 1769 public domain; red-letter spans from the eBible.org KJV OSIS (see data/red-letter-ebible-kjv.json), then spoken-text extraction'
    : 'KJV 1769 public domain; red-letter spans from open red-letter maps, then spoken-text extraction',
  books: {},
};

let count = 0;
for (const [cite, marker] of Object.entries(red)) {
  const [book, rest] = cite.split(' ');
  if (!GOSPELS.includes(book) || !rest) continue;
  const [ch, vs] = rest.split(':');
  const full = cleanKjv(kjv.books[book]?.[ch]?.[vs] || '');
  if (!full) continue;
  const text = extractSpoken(full, cite, marker);
  if (!text) continue;
  if (!spoken.books[book]) spoken.books[book] = {};
  if (!spoken.books[book][ch]) spoken.books[book][ch] = {};
  spoken.books[book][ch][vs] = text;
  count += 1;
}
for (const [cite, text] of Object.entries(SPOKEN_ADDITIONS)) {
  const [book, rest] = cite.split(' ');
  const [ch, vs] = rest.split(':');
  if (!kjv.books[book]?.[ch]?.[vs]) continue;
  if (!spoken.books[book]) spoken.books[book] = {};
  if (!spoken.books[book][ch]) spoken.books[book][ch] = {};
  if (!spoken.books[book][ch][vs]) count += 1;
  spoken.books[book][ch][vs] = text;
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
        // Character offset where each verse begins, so a static client can
        // show one verse out of a grouped saying without the server.
        const cuts = [];
        let offset = 0;
        for (const part of parts) {
          cuts.push(offset);
          offset += part.length + 1;
        }
        sayings.push({
          id: `${book}-${ch}-${start}`,
          book,
          chapter: Number(ch),
          start,
          end,
          citation,
          text: parts.join(' '),
          cuts,
        });
        i += 1;
      }
    }
  }
  return sayings;
}

fs.writeFileSync(destSpoken, JSON.stringify(spoken));
const sayings = groupSayings();
fs.writeFileSync(destLibrary, JSON.stringify({
  translation: 'KJV',
  count: sayings.length,
  verses: count,
  sayings,
}));
console.log('spoken verses', count, 'sayings', sayings.length, 'bytes', fs.statSync(destSpoken).size);
