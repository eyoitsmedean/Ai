#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { composeAsk } = require('../lib/ask');
const { verifyQuote } = require('../lib/scripture');

const device = Boolean(process.env.EVAL_DEVICE);
let run = composeAsk;
if (device) {
  const ctx = { window: { RLA_LIBRARY: require('../public/library.json') } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'public/data/advisor.js'), 'utf8'), ctx);
  run = ctx.window.composeAsk;
}

const set = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'eval', 'ask-questions.json'), 'utf8'));
let fail = 0;
const outFile = device ? 'eval/RESULTS-ask-device.md' : 'eval/RESULTS-ask.md';
const lines = ['# /ask evaluation — results', '', `Run: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${device ? 'on-device composeAsk' : 'in-process composeAsk'}`, ''];

for (const item of set.items) {
  const out = run(item.text, { prior: item.prior || [] });
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
fs.writeFileSync(path.join(__dirname, '..', outFile), lines.join('\n') + '\n');
console.log(`${total - fail}/${total} pass · /ask eval → ${outFile}`);
process.exit(fail ? 1 : 0);
