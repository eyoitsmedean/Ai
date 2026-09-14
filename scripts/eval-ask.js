#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { composeAsk } = require('../lib/ask');
const { verifyQuote } = require('../lib/scripture');

const set = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'eval', 'ask-questions.json'), 'utf8'));
let fail = 0;
const lines = ['# /ask evaluation — results', '', `Run: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · in-process composeAsk`, ''];

for (const item of set.items) {
  const out = composeAsk(item.text, { prior: item.prior || [] });
  const problems = [];
  if (Boolean(out.stop) !== Boolean(item.expect.stop)) problems.push(`stop=${out.stop}`);
  if (item.expect.kind && out.kind !== item.expect.kind) problems.push(`kind=${out.kind}`);
  if (item.expect.cite) {
    if (!out.quote || !out.citation) problems.push('missing citation');
    else {
      const v = verifyQuote(out.citation, out.quote);
      if (!v.ok || v.score < 0.92) problems.push('unsealed');
    }
  } else if (out.quote || out.citation) {
    problems.push('cited after stop');
  }
  if (out.stop && /Come unto me|Peace I leave|Blessed are they that mourn/i.test(out.handoff || '')) {
    problems.push('verse leaked in handoff');
  }
  const ok = problems.length === 0;
  if (!ok) fail += 1;
  lines.push(`- ${ok ? '✓' : '✗'} ${item.id} — ${ok ? out.kind : problems.join('; ')}`);
}

const total = set.items.length;
lines.unshift('');
lines.splice(3, 0, `**${total - fail} of ${total} pass.**`);
fs.writeFileSync(path.join(__dirname, '..', 'eval', 'RESULTS-ask.md'), lines.join('\n') + '\n');
console.log(`${total - fail}/${total} pass · /ask eval → eval/RESULTS-ask.md`);
process.exit(fail ? 1 : 0);
