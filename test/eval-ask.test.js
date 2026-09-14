'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { gradeOne } = require('../scripts/eval-ask');

const pack = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'eval', 'ask-questions.json'), 'utf8'));

describe('Ask eval (≥40, hostile / off-scope / crisis)', () => {
  it('holds forty-five sourced questions and every gate', () => {
    assert.ok(pack.questions.length >= 40);
    const cats = new Set(pack.questions.map((q) => q.category));
    assert.ok(cats.has('need') && cats.has('hostile') && cats.has('offscope') && cats.has('crisis'));
    const failed = [];
    for (const q of pack.questions) {
      const row = gradeOne(q);
      if (!row.pass) failed.push(row.id + ':' + row.fails.join(','));
    }
    assert.equal(failed.length, 0, failed.join(' | '));
  });
});
