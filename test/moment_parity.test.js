const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { dailyForDate } = require('../lib/curated');
const { lookup, isRedLetter } = require('../lib/scripture');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'moments', 'catalog.json'), 'utf8')
);

describe('Flutter catalog stays locked to the spoken corpus', () => {
  it('exports only red-letter KJV text', () => {
    for (const [citation, row] of Object.entries(catalog.verses)) {
      const hit = lookup(citation);
      assert.ok(hit, `missing ${citation}`);
      assert.equal(row.text, hit.text);
      assert.equal(row.citation, hit.citation);
      assert.equal(isRedLetter(citation), true);
    }
  });

  it('daily slots match dailyForDate hydration', () => {
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < 21; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const live = dailyForDate(d);
      const idx = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000) %
        catalog.daily.length;
      assert.equal(catalog.daily[idx].word.verse, live.word.verse);
      assert.equal(catalog.daily[idx].word.passage, live.word.passage);
    }
  });

  it('does not include celebrity or store chrome', () => {
    const raw = JSON.stringify(catalog);
    assert.doesNotMatch(raw, /Roumie|The Chosen|streak|badge|Subscribe/);
  });
});
