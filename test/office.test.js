const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const office = require('../public/data/office');
const { dailyForDate } = require('../lib/curated');
const { lookup } = require('../lib/scripture');

describe('this hour’s saying', () => {
  it('names the folio hours', () => {
    assert.equal(office.officeName(new Date(2026, 9, 31, 5, 59, 0)), 'Compline');
    assert.equal(office.officeName(new Date(2026, 9, 31, 6, 0, 0)), 'Morning');
    assert.equal(office.officeName(new Date(2026, 9, 31, 11, 59, 0)), 'Morning');
    assert.equal(office.officeName(new Date(2026, 9, 31, 12, 0, 0)), 'Afternoon');
    assert.equal(office.officeName(new Date(2026, 9, 31, 16, 59, 0)), 'Afternoon');
    assert.equal(office.officeName(new Date(2026, 9, 31, 17, 0, 0)), 'Vespers');
    assert.equal(office.officeName(new Date(2026, 9, 31, 20, 59, 0)), 'Vespers');
    assert.equal(office.officeName(new Date(2026, 9, 31, 21, 0, 0)), 'Compline');
  });

  it('Hear speaks only this hour’s saying — His words, not the pastoral line', () => {
    const morning = new Date(2026, 9, 31, 9, 0, 0);
    const vespers = new Date(2026, 9, 31, 18, 0, 0);
    const day = dailyForDate(morning);
    const am = office.pickOfficeSaying(day, morning);
    const pm = office.pickOfficeSaying(day, vespers);
    assert.equal(am.card, 'aff');
    assert.equal(am.office, 'Morning');
    assert.equal(am.quote, office.spokenOnly(day.affirmation.quote));
    assert.equal(lookup(am.verse).text, am.quote);
    assert.equal(office.officeScript(day, morning), am.quote);
    assert.notEqual(office.officeScript(day, morning), office.spokenOnly(day.affirmation.text));
    assert.doesNotMatch(office.officeScript(day, morning), /Morning|Afternoon|Vespers|Compline/);
    assert.equal(pm.card, 'word');
    assert.equal(pm.office, 'Vespers');
    assert.equal(pm.quote, office.spokenOnly(day.word.passage));
    assert.equal(lookup(pm.verse).text, pm.quote);
    assert.equal(office.officeScript(day, vespers), pm.quote);
    assert.notEqual(office.officeScript(day, vespers), office.spokenOnly(day.word.reflection));
    assert.doesNotMatch(office.officeScript(day, vespers), /What are you laying down/);
  });

  it('in the evening, Hear speaks the Vespers saying the page shows, not the morning word', () => {
    const vespers = new Date(2026, 9, 31, 18, 0, 0);
    const compline = new Date(2026, 9, 31, 23, 0, 0);
    const morning = new Date(2026, 9, 31, 9, 0, 0);
    const day = dailyForDate(morning);
    const evening = { verse: 'John 14:27', quote: lookup('John 14:27').text };
    for (const d of [vespers, compline]) {
      const line = office.pickOfficeSaying(day, d, evening);
      assert.equal(line.card, 'vespers');
      assert.equal(line.verse, 'John 14:27');
      assert.equal(line.quote, office.spokenOnly(evening.quote));
      assert.equal(lookup(line.verse).text, line.quote);
      assert.equal(office.officeScript(day, d, evening), line.quote);
    }
    assert.equal(office.pickOfficeSaying(day, morning, evening).card, 'aff', 'morning keeps the affirmation');
  });
});
