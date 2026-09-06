#!/usr/bin/env node
/**
 * Repair data/gospels-kjv.json where a verse was dropped and the rest of the
 * chapter shifted up by one. Found by auditing all 3,779 Gospel verses against
 * two independent public-domain KJV sources (bible-api.com KJV and
 * github.com/aruljohn/Bible-kjv); both agree on the six missing verses below.
 *
 * Idempotent: a chapter is only shifted when its verse count is one short.
 *   node scripts/repair-corpus.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'gospels-kjv.json');

const MISSING = [
  { book: 'Matthew', chapter: 2, verse: 16, expected: 23, text: 'Then Herod, when he saw that he was mocked of the wise men, was exceeding wroth, and sent forth, and slew all the children that were in Bethlehem, and in all the coasts thereof, from two years old and under, according to the time which he had diligently enquired of the wise men.' },
  { book: 'Matthew', chapter: 22, verse: 1, expected: 46, text: 'And Jesus answered and spake unto them again by parables, and said,' },
  { book: 'Matthew', chapter: 26, verse: 38, expected: 75, text: 'Then saith he unto them, My soul is exceeding sorrowful, even unto death: tarry ye here, and watch with me.' },
  { book: 'Mark', chapter: 4, verse: 40, expected: 41, text: 'And he said unto them, Why are ye so fearful? how is it that ye have no faith?' },
  { book: 'Mark', chapter: 7, verse: 11, expected: 37, text: 'But ye say, If a man shall say to his father or mother, It is Corban, that is to say, a gift, by whatsoever thou mightest be profited by me; he shall be free.' },
  { book: 'Mark', chapter: 8, verse: 8, expected: 38, text: 'So they did eat, and were filled: and they took up of the broken meat that was left seven baskets.' },
];

const raw = fs.readFileSync(FILE, 'utf8');
const corpus = JSON.parse(raw);
const pretty = /\n\s+"/.test(raw);
let changed = 0;
for (const m of MISSING) {
  const chapter = corpus.books[m.book][String(m.chapter)];
  const count = Object.keys(chapter).length;
  if (count === m.expected) continue;
  if (count !== m.expected - 1) throw new Error(`${m.book} ${m.chapter}: ${count} verses, expected ${m.expected - 1} before repair`);
  const repaired = {};
  for (let v = 1; v <= m.expected; v += 1) {
    if (v < m.verse) repaired[String(v)] = chapter[String(v)];
    else if (v === m.verse) repaired[String(v)] = m.text;
    else repaired[String(v)] = chapter[String(v - 1)];
  }
  corpus.books[m.book][String(m.chapter)] = repaired;
  changed += 1;
  console.log(`inserted ${m.book} ${m.chapter}:${m.verse}; chapter now ${m.expected} verses`);
}
if (changed) fs.writeFileSync(FILE, pretty ? JSON.stringify(corpus, null, 1) + '\n' : JSON.stringify(corpus));
console.log(changed ? `repaired ${changed} chapter(s)` : 'corpus already whole');
