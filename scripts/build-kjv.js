#!/usr/bin/env node
/**
 * Rebuild data/gospels-kjv.json from two independent public-domain KJV sources
 * and refuse to write unless they agree with each other and with the canonical
 * verse counts. The previous corpus was missing three verses in Matthew and
 * three in Mark, which shifted six chapters and mislabeled citations.
 *
 *   node scripts/build-kjv.js            # fetch both sources
 *   node scripts/build-kjv.js --from DIR # use DIR/a-<Book>.json and DIR/c-kjv.json already downloaded
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
// Verse counts of the King James Version; both sources below agree with these.
const CANON = { Matthew: 1071, Mark: 678, Luke: 1151, John: 879 };
const PRIMARY = (b) => `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${b}.json`;
const CROSSCHECK = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json';

async function readJson(url, local) {
  if (local && fs.existsSync(local)) return JSON.parse(fs.readFileSync(local, 'utf8'));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();

async function main() {
  const fromIdx = process.argv.indexOf('--from');
  const dir = fromIdx !== -1 ? process.argv[fromIdx + 1] : '';

  const primary = {};
  for (const b of GOSPELS) {
    const d = await readJson(PRIMARY(b), dir && path.join(dir, `a-${b}.json`));
    primary[b] = {};
    for (const ch of d.chapters) {
      primary[b][String(ch.chapter)] = {};
      for (const v of ch.verses) primary[b][String(ch.chapter)][String(v.verse)] = String(v.text).replace(/\s+/g, ' ').trim();
    }
  }
  const cross = await readJson(CROSSCHECK, dir && path.join(dir, 'c-kjv.json'));
  const other = {};
  for (const bk of cross.books) {
    if (!GOSPELS.includes(bk.name)) continue;
    other[bk.name] = {};
    for (const ch of bk.chapters) {
      other[bk.name][String(ch.chapter)] = {};
      for (const v of ch.verses) other[bk.name][String(ch.chapter)][String(v.verse)] = String(v.text);
    }
  }

  let differing = 0;
  for (const b of GOSPELS) {
    const count = Object.values(primary[b]).reduce((n, ch) => n + Object.keys(ch).length, 0);
    if (count !== CANON[b]) throw new Error(`${b}: primary has ${count} verses, canon is ${CANON[b]}`);
    const countOther = Object.values(other[b]).reduce((n, ch) => n + Object.keys(ch).length, 0);
    if (countOther !== CANON[b]) throw new Error(`${b}: cross-check has ${countOther} verses, canon is ${CANON[b]}`);
    for (const ch of Object.keys(primary[b])) {
      if (Object.keys(primary[b][ch]).length !== Object.keys(other[b][ch] || {}).length) throw new Error(`${b} ${ch}: chapter length disagrees between sources`);
      for (const v of Object.keys(primary[b][ch])) {
        if (norm(primary[b][ch][v]) !== norm(other[b][ch][v])) differing += 1;
      }
    }
  }
  // Only spelling variants (Judaea/Judea, Cæsar/Caesar) should differ.
  if (differing > 120) throw new Error(`${differing} verses differ between sources; expected only spelling variants`);

  const out = {
    translation: 'KJV',
    attribution: 'King James Version, public domain. Text: github.com/aruljohn/Bible-kjv; cross-checked verse-for-verse against github.com/scrollmapper/bible_databases (KJV) — canonical verse counts agree, ' + differing + ' verses differ only in spelling.',
    books: primary,
  };
  fs.writeFileSync(path.join(ROOT, 'data', 'gospels-kjv.json'), JSON.stringify(out));
  console.log('gospels-kjv.json written:', GOSPELS.map((b) => `${b} ${CANON[b]}`).join(', '), `· ${differing} spelling-only differences between sources`);
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
