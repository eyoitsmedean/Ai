#!/usr/bin/env node
/**
 * Director's Cut — the conscience in twenty seconds.
 * Prints the first word of every room and the hard letters.
 */
const { encouragementFor, themeNames, dailyForDate } = require('../lib/curated');
const { retrievalLetter } = require('../lib/letter');

function first(letter) {
  const m = String(letter).match(/\*\*([^*\n]+)\*\*/);
  return m ? m[1].trim() : '—';
}

const morning = dailyForDate(new Date());
console.log('TODAY  ' + morning.word.verse + '  ' + morning.word.title);
console.log('');
console.log('ROOMS');
for (const name of themeNames()) {
  const p = encouragementFor(name).passages[0];
  console.log('  ' + name.padEnd(26) + p.verse.padEnd(22) + p.quote.slice(0, 52) + '…');
}
console.log('');
console.log('HARD LETTERS');
const hard = [
  ['empty', ''],
  ['crisis', 'I want to die.'],
  ['poison', 'I took too many pills'],
  ['by-you', 'I want to hit my kid.'],
  ['affair', 'My wife has been having an affair for two years. I found out on Tuesday.'],
  ['veteran', 'I killed people in Afghanistan and I cannot sleep.'],
];
for (const [id, q] of hard) {
  console.log('  ' + id.padEnd(10) + first(retrievalLetter(q)));
}
