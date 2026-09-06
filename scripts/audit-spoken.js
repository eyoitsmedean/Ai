#!/usr/bin/env node
/**
 * Audit the spoken corpus for the evangelist's frame.
 *
 * Prints every spoken verse that still opens like narration ("And Jesus said unto them,"), split into
 *   named    — the frame names the speaker; this must never appear (test/spoken.test.js fails on any)
 *   pronoun  — "he said" frames; legitimate inside a parable, a leak at the start of a speech block.
 *              Each one is either on the reviewed list in test/spoken.test.js or needs a line in
 *              data/spoken-overrides.json.
 *
 *   node scripts/audit-spoken.js            # human-readable
 *   node scripts/audit-spoken.js --json     # machine-readable
 */
const { loadSpoken, frameShape } = require('../lib/scripture');

function audit() {
  const out = { named: [], pronoun: [], total: 0 };
  for (const [book, chapters] of Object.entries(loadSpoken().books || {})) {
    for (const [ch, verses] of Object.entries(chapters)) {
      for (const [v, text] of Object.entries(verses)) {
        out.total += 1;
        const shape = frameShape(text);
        if (shape) out[shape].push({ citation: `${book} ${ch}:${v}`, text });
      }
    }
  }
  return out;
}

if (require.main === module) {
  const result = audit();
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    console.log(`${result.total} spoken verses · ${result.named.length} named frames · ${result.pronoun.length} pronoun frames\n`);
    for (const kind of ['named', 'pronoun']) {
      if (!result[kind].length) continue;
      console.log(kind.toUpperCase());
      for (const { citation, text } of result[kind]) console.log(`  ${citation.padEnd(16)} ${text.slice(0, 96)}`);
      console.log('');
    }
  }
  process.exit(result.named.length ? 1 : 0);
}

module.exports = { audit };
