#!/usr/bin/env node
/**
 * How often the no-key Advisor answers from a fitting room.
 *   npm run eval:advisor [-- --misses]
 */
const { adviseTheme } = require('../lib/offline-advisor');
const { rows } = require('../test/fixtures/advisor-themes.json');

let hit = 0;
let general = 0;
const misses = [];
for (const row of rows) {
  const got = adviseTheme(row.text);
  if (got && row.themes.includes(got)) hit += 1;
  else {
    if (!got) general += 1;
    misses.push({ ...row, got });
  }
}
console.log(`fitting room ${hit}/${rows.length} (${Math.round((100 * hit) / rows.length)}%) · general letter ${general} · wrong room ${rows.length - hit - general}`);
if (process.argv.includes('--misses')) {
  for (const m of misses) console.log(`  ${m.got || '(general)'} ≠ ${m.themes.join(' | ')} — ${m.source}: ${m.text}`);
}
module.exports = { hit, total: rows.length };
