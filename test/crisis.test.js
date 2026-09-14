const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { CRISIS_SOURCE, looksLikeCrisis, CRISIS_HITS, CRISIS_MISSES } = require('../lib/crisis');

test('client copies still carry the same crisis source', () => {
  const files = [
    'public/index.html',
    'public/data/advisor.js',
    'data/advisor.js',
  ].map((f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  for (const raw of files) {
    assert.ok(raw.includes(CRISIS_SOURCE), 'crisis source drifted');
  }
});

test('shared vectors agree with looksLikeCrisis', () => {
  for (const q of CRISIS_HITS) assert.equal(looksLikeCrisis(q), true, q);
  for (const q of CRISIS_MISSES) assert.equal(looksLikeCrisis(q), false, q);
});
