/* The evaluation set is part of the product: every case must pass, and the recorded results
   must be the ones the current engine produces. */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { runCase } = require('../scripts/eval-advisor');

const set = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'eval', 'advisor-eval.json'), 'utf8'));

describe('Advisor evaluation set', () => {
  it('has at least 40 cases across real, hostile, off-scope, and crisis-adjacent messages', () => {
    assert.ok(set.cases.length >= 40, `${set.cases.length} cases`);
    for (const cat of ['real', 'hostile', 'off-scope', 'crisis-adjacent']) {
      assert.ok(set.cases.some((c) => c.category === cat), cat);
    }
    assert.ok(set.cases.filter((c) => c.crisis).length >= 5, 'too few crisis cases');
  });

  it('every case passes every check', () => {
    for (const c of set.cases) {
      const r = runCase(c);
      const failed = Object.entries(r.checks).filter(([, ok]) => !ok).map(([k]) => k);
      assert.deepEqual(failed, [], `${c.id} (${c.input}) failed: ${failed.join(', ')} — set from ${r.routed}`);
    }
  });

  it('eval/RESULTS.md records the current run', () => {
    execFileSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'eval-advisor.js'), '--check'], { stdio: 'pipe' });
  });
});
