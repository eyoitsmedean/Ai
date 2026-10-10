const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { FORTY, fortyFor, easterSunday } = require('../public/data/forty');
const { isRedLetter, loadSpoken, lookup } = require('../lib/scripture');

const local = (y, m, d) => new Date(y, m - 1, d);

describe('Forty, the Lent path', () => {
  it('is forty counted days, six Sundays, and Easter', () => {
    const count = (k) => FORTY.filter((e) => e.kind === k).length;
    assert.equal(count('day'), 40);
    assert.equal(count('sunday'), 6);
    assert.equal(count('easter'), 1);
    assert.equal(FORTY.length, 47);
  });

  it('runs Ash Wednesday 10 Feb 2027 to Easter 28 Mar 2027', () => {
    assert.equal(fortyFor(local(2027, 2, 9)), null);
    const ash = fortyFor(local(2027, 2, 10));
    assert.equal(ash.day, 1);
    assert.equal(ash.entry.title, 'In Secret');
    const sunday = fortyFor(local(2027, 2, 14));
    assert.equal(sunday.day, null);
    assert.equal(sunday.entry.kind, 'sunday');
    const goodFriday = fortyFor(local(2027, 3, 26));
    assert.equal(goodFriday.day, 39);
    assert.equal(goodFriday.entry.verse, 'Luke 23:34');
    assert.equal(fortyFor(local(2027, 3, 27)).day, 40);
    assert.equal(fortyFor(local(2027, 3, 28)).entry.kind, 'easter');
    assert.equal(fortyFor(local(2027, 3, 29)), null);
  });

  it('lands Sundays on Sundays and Holy Week on its days, every year', () => {
    for (let year = 2025; year <= 2045; year++) {
      const easter = easterSunday(year);
      for (let back = 0; back <= 46; back++) {
        const date = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - back);
        const hit = fortyFor(date);
        assert.ok(hit, `${year}: ${date.toDateString()} should be in Lent`);
        const isSunday = date.getDay() === 0;
        assert.equal(hit.entry.kind !== 'day', isSunday, `${year}: ${date.toDateString()} is ${hit.entry.kind}`);
      }
      const friday = fortyFor(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2));
      assert.equal(friday.entry.title, 'Forgive Them', `${year} Good Friday`);
      assert.equal(friday.day, 39);
    }
  });

  it('quotes only words Jesus spoke, each saying once', () => {
    const verses = FORTY.map((e) => e.verse);
    assert.deepEqual(verses.filter((v) => !isRedLetter(v)), []);
    assert.equal(new Set(verses).size, verses.length);
  });
});

describe('spoken corpus', () => {
  it('prints exact KJV words for every spoken verse', () => {
    const squash = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const books = loadSpoken().books;
    const bad = [];
    for (const book of Object.keys(books)) {
      for (const ch of Object.keys(books[book])) {
        for (const vs of Object.keys(books[book][ch])) {
          const full = squash(lookup(`${book} ${ch}:${vs}`)?.full || '');
          // "…" marks where the narrator speaks between his words.
          const parts = books[book][ch][vs].split('…').map(squash).filter(Boolean);
          if (parts.some((p) => !full.includes(p))) bad.push(`${book} ${ch}:${vs}`);
        }
      }
    }
    assert.deepEqual(bad, []);
  });
});
