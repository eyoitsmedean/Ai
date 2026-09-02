#!/usr/bin/env node
/**
 * Export the curated, corpus-verified moment catalog for the Flutter shell.
 * Never invent verses: every quote is lookup() from the spoken KJV Gospels.
 */
const fs = require('fs');
const path = require('path');
const { dailyForDate, encouragementFor, themeNames } = require('../lib/curated');
const { churchYear } = require('../lib/year');
const { lookup, isRedLetter } = require('../lib/scripture');

const dates = [];
const start = new Date(2026, 0, 1);
for (let i = 0; i < 400; i++) {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
  dates.push(d);
}

const dailyGoldens = dates.map((d) => {
  const moment = dailyForDate(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const season = churchYear(d);
  return {
    date: `${y}-${m}-${day}`,
    index: Math.floor(new Date(y, d.getMonth(), d.getDate()).getTime() / 86400000) % 7,
    season: season.id,
    runningHead: season.runningHead,
    word: {
      theme: moment.word.theme,
      title: moment.word.title,
      passage: moment.word.passage,
      verse: moment.word.verse,
      reflection: moment.word.reflection,
    },
    affirmationVerse: moment.affirmation.verse,
  };
});

const themes = {};
for (const name of themeNames()) {
  themes[name] = encouragementFor(name);
}

const catalog = {
  translation: 'KJV',
  source: 'curated',
  brand: {
    name: 'Red Words',
    promise: 'His words, for this moment.',
  },
  daily: [],
};

for (let i = 0; i < 7; i++) {
  // Reconstruct rotation by walking dates until each index appears.
  const hit = dailyGoldens.find((g) => g.index === i);
  const moment = dailyForDate(new Date(hit.date + 'T12:00:00'));
  catalog.daily.push({
    affirmation: moment.affirmation,
    word: moment.word,
    translation: 'KJV',
    verified: true,
    source: 'curated',
  });
}

const citations = new Set();
function collect(cite) {
  if (cite) citations.add(cite);
}
for (const slot of catalog.daily) {
  collect(slot.affirmation.verse);
  collect(slot.word.verse);
}
for (const pack of Object.values(themes)) {
  for (const p of pack.passages) collect(p.verse);
}

const verses = {};
for (const cite of [...citations].sort()) {
  const hit = lookup(cite);
  if (!hit) throw new Error(`Catalog citation missing from corpus: ${cite}`);
  if (!isRedLetter(cite) && !hit.redLetter) {
    throw new Error(`Catalog citation is not red-letter: ${cite}`);
  }
  verses[hit.citation] = {
    citation: hit.citation,
    text: hit.text,
    redLetter: true,
  };
}

const outDir = path.join(__dirname, '..', 'assets', 'moments');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'catalog.json'),
  JSON.stringify({ ...catalog, themes, verses }, null, 2) + '\n'
);

const goldenDir = path.join(__dirname, '..', 'test', 'goldens');
fs.mkdirSync(goldenDir, { recursive: true });
fs.writeFileSync(
  path.join(goldenDir, 'moments.json'),
  JSON.stringify({ daily: dailyGoldens, themeNames: themeNames() }, null, 2) + '\n'
);

console.log(`exported ${catalog.daily.length} daily slots, ${Object.keys(themes).length} rooms, ${Object.keys(verses).length} verses`);
