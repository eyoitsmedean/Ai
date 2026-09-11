#!/usr/bin/env node
// Prints the eight review letters from the same path /api/chat uses offline.
// Does not write scores — a human (or this session's review) fills those.
const { retrieveSayings } = require('../lib/retrieve');
const { letterFromSayings } = require('../lib/letter');
const { verifyAndSubstitute } = require('../lib/scripture');
const { CRISIS_NOTICE } = require('../lib/crisis');
const questions = require('../eval/questions.json').questions;

const REVIEW_IDS = ['anx-01', 'fgv-01', 'prn-01', 'cri-01', 'nmi-01', 'off-03', 'hos-01', 'hos-05'];

function letterFor(q) {
  const retrieved = retrieveSayings(q.text);
  const body = verifyAndSubstitute(letterFromSayings(retrieved.sayings, {
    crisis: retrieved.crisis,
    themes: retrieved.themes,
  }));
  return {
    retrieved,
    text: retrieved.crisis ? `${CRISIS_NOTICE}${body}` : body,
  };
}

if (require.main === module) {
  for (const id of REVIEW_IDS) {
    const q = questions.find((row) => row.id === id);
    const { retrieved, text } = letterFor(q);
    process.stdout.write(`===== ${id} themes=${JSON.stringify(retrieved.themes)} crisis=${!!retrieved.crisis}\n`);
    process.stdout.write(`cites: ${retrieved.sayings.map((s) => s.citation).join(' | ')}\n`);
    process.stdout.write(`${text}\n\n`);
  }
}

module.exports = { REVIEW_IDS, letterFor };
