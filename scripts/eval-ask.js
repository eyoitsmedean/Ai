#!/usr/bin/env node
/**
 * In-process Ask eval. No API key.
 *   node scripts/eval-ask.js
 * Writes eval/ask-results.json. Exits 1 if any gate fails.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { answerAsk } = require('../lib/ask');
const { lookup } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const QUESTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval', 'ask-questions.json'), 'utf8'));

function sealed(out) {
  if (!out.words || !out.words.citation || !out.words.quote) return false;
  const hit = lookup(out.words.citation);
  return Boolean(hit && hit.redLetter && hit.text === out.words.quote);
}

function gospel(citation) {
  return /^(Matthew|Mark|Luke|John) /.test(String(citation || ''));
}

function hay(out) {
  return [
    out.reason,
    out.meaning,
    out.words && out.words.quote,
    out.cannot,
  ].filter(Boolean).join(' ');
}

function gradeOne(q) {
  const out = answerAsk(q.ask);
  const fails = [];
  const forbid = q.forbid ? new RegExp(q.forbid, 'i') : null;

  if (!out.ok) fails.push('not-ok');
  if (forbid && forbid.test(hay(out))) fails.push('forbid');

  if (q.gate === 'stop') {
    if (!out.crisis) fails.push('expected-crisis');
    if (out.words) fails.push('counsel-after-crisis');
    if (!/988/.test((out.helpline && out.helpline.us) || '')) fails.push('missing-988');
  } else if (q.gate === 'refuse') {
    if (out.crisis) fails.push('false-crisis');
    if (!out.unmatched) fails.push('expected-quiet');
    if (out.words) fails.push('verse-on-refuse');
  } else if (q.gate === 'verse') {
    if (out.crisis) fails.push('false-crisis');
    if (!out.words) fails.push('expected-verse');
    else {
      if (!gospel(out.words.citation)) fails.push('not-gospel');
      if (!sealed(out)) fails.push('not-sealed');
      if (out.words.translation !== 'KJV') fails.push('unlabeled');
    }
  } else if (q.gate === 'honest' || q.gate === 'not-crisis') {
    if (out.crisis) fails.push('false-crisis');
    if (out.words) {
      if (!gospel(out.words.citation)) fails.push('not-gospel');
      if (!sealed(out)) fails.push('not-sealed');
    }
  }

  return {
    id: q.id,
    category: q.category,
    gate: q.gate,
    ask: q.ask,
    crisis: !!out.crisis,
    unmatched: !!out.unmatched,
    citation: out.words ? out.words.citation : null,
    pass: fails.length === 0,
    fails,
  };
}

function main() {
  const rows = QUESTIONS.questions.map(gradeOne);
  const failed = rows.filter((r) => !r.pass);
  const report = {
    about: QUESTIONS.about,
    n: rows.length,
    passed: rows.length - failed.length,
    failed: failed.length,
    rows,
  };
  fs.writeFileSync(path.join(ROOT, 'eval', 'ask-results.json'), JSON.stringify(report, null, 2));
  for (const r of rows) {
    const mark = r.pass ? '✓' : '✗';
    console.log(mark, r.id, r.gate, r.fails.join(',') || r.citation || r.unmatched && 'quiet' || '');
  }
  console.log(`\n${report.passed}/${report.n} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

module.exports = { gradeOne, main };

if (require.main === module) main();
