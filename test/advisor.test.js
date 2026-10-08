const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('offline Advisor rooms (npm run eval:advisor)', () => {
  it('answers at least 90% of the pooled everyday questions from a fitting room', () => {
    const { adviseTheme } = require('../lib/offline-advisor');
    const { rows } = require('./fixtures/advisor-themes.json');
    const hits = rows.filter((r) => r.themes.includes(adviseTheme(r.text))).length;
    assert.ok(hits / rows.length >= 0.9, `${hits}/${rows.length}`);
  });
});
