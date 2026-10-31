const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { WATCH, watchFor, adventSunday } = require('../public/data/watch');
const { isRedLetter } = require('../lib/scripture');

const local = (y, m, d) => new Date(y, m - 1, d);
const DAY_NAMES = ['sunday', 'day', 'day', 'day', 'day', 'day', 'day'];

describe('Watch, the Advent path', () => {
  it('is four weeks that open on Sundays, Christmas Eve, and Christmas Day', () => {
    assert.equal(WATCH.length, 29);
    assert.equal(WATCH.filter((e) => e.kind === 'sunday').length, 4);
    assert.deepEqual(WATCH.slice(-2).map((e) => e.kind), ['eve', 'christmas']);
    WATCH.slice(0, -2).forEach((e, i) => assert.equal(e.kind, DAY_NAMES[i % 7], `entry ${i} ${e.title}`));
  });

  it('runs Advent Sunday 29 Nov 2026 to Christmas Day', () => {
    assert.equal(watchFor(local(2026, 11, 28)), null);
    const first = watchFor(local(2026, 11, 29));
    assert.equal(first.day, 1);
    assert.equal(first.total, 26);
    assert.equal(first.entry.verse, 'Mark 13:37');
    assert.equal(watchFor(local(2026, 12, 6)).entry.title, 'Prepare Thy Way');
    assert.equal(watchFor(local(2026, 12, 23)).entry.title, 'His First Words');
    const eve = watchFor(local(2026, 12, 24));
    assert.equal(eve.entry.kind, 'eve');
    assert.equal(eve.day, 26);
    const christmas = watchFor(local(2026, 12, 25));
    assert.equal(christmas.entry.kind, 'christmas');
    assert.equal(christmas.day, null);
    assert.equal(watchFor(local(2026, 12, 26)), null);
    assert.equal(watchFor(local(2026, 7, 4)), null);
    assert.equal(watchFor(new Date('not a date')), null);
  });

  it('keeps Sundays on Sundays and Christmas Eve on the 24th, every year', () => {
    for (let year = 2025; year <= 2050; year++) {
      const start = adventSunday(year);
      assert.equal(start.getDay(), 0, `${year} Advent Sunday`);
      const christmas = local(year, 12, 25);
      const span = Math.round((christmas - start) / 86400000);
      assert.ok(span >= 22 && span <= 28, `${year}: Advent is ${span} days`);
      for (let k = 0; k <= span; k++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + k);
        const hit = watchFor(date);
        assert.ok(hit, `${year}: ${date.toDateString()} should be in Advent`);
        assert.equal(hit.total, span, `${year}: total days`);
        const kind = date.getDate() === 25 && date.getMonth() === 11 ? 'christmas'
          : date.getDate() === 24 && date.getMonth() === 11 ? 'eve'
            : DAY_NAMES[date.getDay()];
        assert.equal(hit.entry.kind, kind, `${year}: ${date.toDateString()} is ${hit.entry.kind}`);
      }
      assert.equal(watchFor(new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1)), null);
    }
  });

  it('quotes only words Jesus spoke, each saying once', () => {
    const verses = WATCH.map((e) => e.verse);
    assert.deepEqual(verses.filter((v) => !isRedLetter(v)), []);
    assert.equal(new Set(verses).size, verses.length);
  });

  it('gives every day a reflection and one small practice', () => {
    for (const e of WATCH) {
      assert.ok(e.title && e.reflection && e.practice, e.verse);
      assert.ok(e.practice.length < 120, `${e.verse} practice is short`);
    }
  });
});
