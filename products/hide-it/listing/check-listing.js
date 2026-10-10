#!/usr/bin/env node
'use strict';
// Checks LISTING.md and the listing images. Exits non-zero on any failure.
//  - Etsy title: under 140 characters
//  - Etsy tags: exactly 13, each 20 characters or fewer, no duplicates
//  - Every quotation of Jesus written as "text" (Book c:v) matches the red-letter corpus
//    (each " … " part must be a substring of his words in that verse)
//  - 3 or 4 listing images, each a 2000 x 2000 PNG
const fs = require('fs');
const path = require('path');
const { quoteMatches } = require('../verify.js');
const { lookup } = require(require('path').join(__dirname, '../../..', 'lib/scripture'));

const HERE = __dirname;
const md = fs.readFileSync(path.join(HERE, '..', 'LISTING.md'), 'utf8');
const problems = [];

function blockAfter(heading) {
  const i = md.indexOf(heading);
  if (i < 0) return null;
  const m = md.slice(i).match(/```\n([\s\S]*?)```/);
  return m ? m[1] : null;
}

const title = (blockAfter('## Etsy title') || '').trim();
if (!title) problems.push('no Etsy title block');
else if (title.length >= 140) problems.push(`title is ${title.length} characters (must be under 140)`);
if (/\n/.test(title)) problems.push('title spans more than one line');

const tags = (blockAfter('## Etsy tags') || '').split('\n').map((t) => t.trim()).filter(Boolean);
if (tags.length !== 13) problems.push(`expected 13 tags, found ${tags.length}`);
for (const t of tags) if (t.length > 20) problems.push(`tag "${t}" is ${t.length} characters`);
if (new Set(tags.map((t) => t.toLowerCase())).size !== tags.length) problems.push('duplicate tags');

// Quotations: "text" (Book c:v) or “text” (Book c:v).
const re = /["“]([^"”]+)["”]\s*\(((?:Matthew|Mark|Luke|John) \d+:\d+)\)/g;
let n = 0;
for (const m of md.matchAll(re)) {
  n++;
  const v = lookup(m[2]);
  if (!v) { problems.push(`${m[2]} has no words of Jesus in the corpus`); continue; }
  if (!quoteMatches(m[1].replace(/’/g, "'"), v.text)) problems.push(`quotation ${m[2]} "${m[1]}" differs from: ${v.text}`);
}
if (n === 0) problems.push('no quotations found to check (expected some in the description)');
// Any other "(Book c:v)" citation of a Gospel must be one of the checked quotations.
const cites = [...md.matchAll(/\(((?:Matthew|Mark|Luke|John) \d+:\d+)\)/g)].length;
if (cites !== n) problems.push(`${cites} Gospel citations but only ${n} quotations in the "text" (Book c:v) form`);

const imgs = fs.readdirSync(HERE).filter((f) => f.endsWith('.png')).sort();
if (imgs.length < 3 || imgs.length > 4) problems.push(`expected 3 or 4 listing images, found ${imgs.length}`);
for (const f of imgs) {
  const b = fs.readFileSync(path.join(HERE, f));
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (w !== 2000 || h !== 2000) problems.push(`${f} is ${w}x${h}`);
}

console.log(`title: ${title.length} chars`);
console.log(`tags: ${tags.length} [${tags.map((t) => `${t} (${t.length})`).join(', ')}]`);
console.log(`quotations checked against the corpus: ${n}`);
console.log(`images: ${imgs.join(', ')}`);
if (problems.length) {
  console.error('FAIL\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('PASS: listing title, tags, quotations and images');
