const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ALL, EVE, adventFor, adventSunday, pathForYear } = require('../public/data/advent');
const { adventSunday: yearAdvent, ymd } = require('../lib/year');
const { isRedLetter } = require('../lib/scripture');

const local = (y, m, d) => new Date(y, m - 1, d);

describe('Advent, the waiting path', () => {
  it('keeps twenty-nine unique spoken sayings: four Sundays, twenty-four weekdays, Christmas Eve', () => {
    assert.equal(ALL.length, 29);
    const verses = ALL.map((e) => e.verse);
    assert.equal(new Set(verses).size, verses.length);
    assert.deepEqual(verses.filter((v) => !isRedLetter(v)), []);
    assert.equal(ALL.filter((e) => e.kind === 'sunday').length, 4);
    assert.equal(ALL.filter((e) => e.kind === 'day').length, 24);
    assert.equal(ALL.filter((e) => e.kind === 'eve').length, 1);
  });

  it('agrees with the church year on First Sunday', () => {
    for (const year of [2025, 2026, 2027, 2028]) {
      assert.equal(ymd(adventSunday(year)), ymd(yearAdvent(year)));
    }
  });

  it('runs 29 Nov 2026 to Christmas Eve, twenty-six leaves', () => {
    assert.equal(adventFor(local(2026, 11, 28)), null);
    const first = adventFor(local(2026, 11, 29));
    assert.equal(first.day, 1);
    assert.equal(first.total, 26);
    assert.equal(first.entry.title, 'Look Up');
    assert.equal(first.entry.kind, 'sunday');
    const second = adventFor(local(2026, 12, 6));
    assert.equal(second.entry.kind, 'sunday');
    assert.equal(second.entry.week, 'Peace');
    const gaudete = adventFor(local(2026, 12, 13));
    assert.equal(gaudete.entry.week, 'Joy');
    const fourth = adventFor(local(2026, 12, 20));
    assert.equal(fourth.entry.title, 'With You');
    const eve = adventFor(local(2026, 12, 24));
    assert.equal(eve.entry.kind, 'eve');
    assert.equal(eve.entry.verse, 'John 14:18');
    assert.equal(eve.day, 26);
    assert.equal(adventFor(local(2026, 12, 25)), null);
  });

  it('lands Sundays on Sundays and Christmas Eve on 24 Dec, every year', () => {
    for (let year = 2025; year <= 2045; year++) {
      const start = adventSunday(year);
      const eve = local(year, 12, 24);
      const path = pathForYear(year);
      const total = path.length;
      assert.ok(total >= 22 && total <= 28, `${year} length ${total}`);
      assert.equal(path[0].kind, 'sunday', `${year} should open on Sunday`);
      assert.equal(path[path.length - 1].kind, 'eve');
      assert.equal(path[path.length - 1].verse, EVE.verse);
      const before = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1);
      assert.equal(adventFor(before), null, `${year} day before Advent`);
      for (let i = 0; i < total; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const hit = adventFor(date);
        assert.ok(hit, `${year}: ${date.toDateString()} should be in Advent`);
        assert.equal(hit.entry, path[i]);
        assert.ok(hit.entry, `${year}: missing entry ${i}`);
        const isEve = date.getMonth() === 11 && date.getDate() === 24;
        if (isEve) {
          assert.equal(hit.entry.kind, 'eve', `${year} Christmas Eve`);
        } else if (date.getDay() === 0) {
          assert.equal(hit.entry.kind, 'sunday', `${year}: ${date.toDateString()}`);
        } else {
          assert.equal(hit.entry.kind, 'day', `${year}: ${date.toDateString()}`);
        }
      }
      assert.equal(adventFor(local(year, 12, 25)), null);
      assert.ok(sameDay(eve, new Date(start.getFullYear(), start.getMonth(), start.getDate() + total - 1)));
    }
  });
});

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
