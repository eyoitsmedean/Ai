#!/usr/bin/env node
/**
 * One encouragement source. lib/curated.js is canonical.
 * Writes public/data/curated.js (Advisor + tests) and public/curated.json (Seek on static hosts).
 * Daily rotation in public/data/curated.js is kept — Forty's data list is built from it.
 */
const fs = require('fs');
const path = require('path');
const { THEMES, dailyForDate, themeNames, encouragementFor } = require('../lib/curated');

const ROOT = path.join(__dirname, '..');
const JS_PATH = path.join(ROOT, 'public', 'data', 'curated.js');
const JSON_PATH = path.join(ROOT, 'public', 'curated.json');

function packs() {
  const out = {};
  for (const name of themeNames()) {
    const p = encouragementFor(name);
    out[name] = {
      theme: p.theme,
      headline: p.headline,
      opening: p.opening,
      passages: p.passages.map(({ verse, quote, context }) => ({ verse, quote, context })),
      practice: p.practice,
      closing: p.closing,
    };
  }
  return out;
}

function extractDailyArray(src) {
  const start = src.indexOf('daily: [');
  const enc = src.indexOf('\n  encouragement:');
  if (start < 0 || enc < 0) throw new Error('public/data/curated.js: cannot find daily / encouragement markers');
  return src.slice(start, enc).replace(/,+\s*$/, '');
}

function writeClientJs() {
  const prev = fs.readFileSync(JS_PATH, 'utf8');
  const dailyBlock = extractDailyArray(prev);
  const encouragement = packs();
  const aliases = {};
  for (const name of Object.keys(THEMES)) aliases[name] = name;
  const out = [
    '/* Curated red-letter fallbacks — public-domain KJV words of Jesus (four Gospels).',
    '   Encouragement rooms are generated from lib/curated.js (`npm run curated`).',
    '   Do not edit the encouragement object by hand. Daily rotation may be edited here. */',
    'window.RLA_CURATED = {',
    `  ${dailyBlock.trim()},`,
    '  encouragement: ' + JSON.stringify(encouragement, null, 2).replace(/^/gm, '  ').trim(),
    '};',
    '',
    'window.RLA_THEME_ALIASES = ' + JSON.stringify(aliases, null, 2) + ';',
    '',
  ].join('\n');
  fs.writeFileSync(JS_PATH, out);
}

function writeSeekJson() {
  const prev = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const next = {
    daily: prev.daily && prev.daily.affirmation ? prev.daily : dailyForDate(new Date()),
    packs: packs(),
  };
  fs.writeFileSync(JSON_PATH, JSON.stringify(next));
}

writeClientJs();
writeSeekJson();
console.log('Wrote public/data/curated.js and public/curated.json from lib/curated.js (' + themeNames().length + ' rooms)');
