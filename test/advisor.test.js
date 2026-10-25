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

describe('offline crisis letters', () => {
  const { advise } = require('../lib/offline-advisor');
  it('point beyond the U.S. to findahelpline, for every kind of crisis', () => {
    for (const text of ['I want to kill myself', 'my son says he wants to die', 'my husband hits me', 'I was raped']) {
      assert.match(String(advise(text)), /findahelpline\.com/, text);
    }
  });
});
