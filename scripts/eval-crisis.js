#!/usr/bin/env node
/**
 * Measure public/data/crisis.js against test/fixtures/crisis-corpus.json.
 *
 *   npm run eval:crisis            summary
 *   npm run eval:crisis -- --misses  also list every miss and false alarm
 *
 * "Reached help" counts any notice for a crisis or danger row; "right door"
 * also needs the kind to match (danger rows want danger/assault, not 988).
 */
const { assessCrisis } = require('../public/data/crisis');
const { rows } = require('../test/fixtures/crisis-corpus.json');

const showMisses = process.argv.includes('--misses');
const groups = { visible: rows.filter((r) => !r.heldOut), 'held-out': rows.filter((r) => r.heldOut) };

function measure(list) {
  const r = { crisis: [0, 0], danger: [0, 0], door: [0, 0], none: [0, 0], misses: [], alarms: [] };
  for (const row of list) {
    const got = assessCrisis(row.text);
    if (row.expect === 'crisis' || row.expect === 'danger') {
      const bucket = r[row.expect];
      bucket[1] += 1;
      if (got) bucket[0] += 1;
      else r.misses.push(row);
      r.door[1] += 1;
      const want = row.expect === 'danger' ? ['danger', 'assault'] : ['self', 'other'];
      if (got && want.includes(got.kind)) r.door[0] += 1;
    } else if (row.expect === 'none') {
      r.none[1] += 1;
      if (got) { r.none[0] += 1; r.alarms.push({ ...row, got }); }
    }
  }
  return r;
}

const pct = ([a, b]) => `${a}/${b}${b ? ` (${Math.round((100 * a) / b)}%)` : ''}`;
const results = {};
for (const [name, list] of Object.entries(groups)) {
  const r = measure(list);
  results[name] = r;
  console.log(`${name}: crisis reached help ${pct(r.crisis)} · danger reached help ${pct(r.danger)} · right door ${pct(r.door)} · false alarms ${pct(r.none)}`);
  if (showMisses) {
    for (const m of r.misses) console.log(`  MISS [${m.expect}] ${m.source}: ${m.text}`);
    for (const a of r.alarms) console.log(`  ALARM [${a.got.kind}] ${a.source}: ${a.text}`);
  }
}
module.exports = results;
