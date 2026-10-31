const { describe, it } = require('node:test');
const { deepEqual, equal } = require('node:assert/strict');
const {
  ALL_SAINTS,
  adventSunday,
  ashWednesday,
  churchYear,
  easterSunday,
  feastDay,
  pentecost,
  ymd,
} = require('../lib/year');
const { verifyQuote } = require('../lib/scripture');
const { unsafeSaying } = require('../public/data/crisis');

function idOn(y, m, d) {
  return churchYear(new Date(y, m - 1, d)).id;
}

describe('easterSunday', () => {
  it('knows the western dates we care about', () => {
    equal(ymd(easterSunday(2025)), 20250420);
    equal(ymd(easterSunday(2026)), 20260405);
    equal(ymd(easterSunday(2027)), 20270328);
  });
});

describe('adventSunday', () => {
  it('falls on the Sunday from Nov 27 through Dec 3', () => {
    equal(ymd(adventSunday(2025)), 20251130);
    equal(ymd(adventSunday(2026)), 20261129);
    equal(ymd(adventSunday(2027)), 20271128);
  });
});

describe('ashWednesday / pentecost', () => {
  it('tracks Easter', () => {
    equal(ymd(ashWednesday(2026)), 20260218);
    equal(ymd(pentecost(2026)), 20260524);
  });
});

describe('churchYear', () => {
  it('names Advent, Christmas, Lent, Easter, and Ordinary Time', () => {
    equal(idOn(2026, 11, 29), 'advent');
    equal(idOn(2026, 12, 24), 'advent');
    equal(idOn(2026, 12, 25), 'christmas');
    equal(idOn(2026, 1, 3), 'christmas');
    equal(idOn(2026, 1, 10), 'ordinary');
    equal(idOn(2026, 2, 18), 'lent');
    equal(idOn(2026, 4, 4), 'lent');
    equal(idOn(2026, 4, 5), 'easter');
    equal(idOn(2026, 5, 24), 'easter');
    equal(idOn(2026, 6, 1), 'ordinary');
  });

  it('keeps a running head a book would print', () => {
    deepEqual(churchYear(new Date(2026, 11, 1)).runningHead, 'Advent');
    equal(churchYear(new Date(2026, 6, 15)).name, 'Ordinary Time');
  });

  it('leaves All Hallows and All Saints in Ordinary Time', () => {
    equal(idOn(2026, 10, 31), 'ordinary');
    equal(idOn(2026, 11, 1), 'ordinary');
  });
});

describe('feastDay', () => {
  it('names the vigil on 31 October and the feast on 1 November', () => {
    const vigil = feastDay(new Date(2026, 9, 31));
    equal(vigil.id, 'all-saints');
    equal(vigil.vigil, true);
    equal(vigil.runningHead, 'All Hallows');
    const feast = feastDay(new Date(2026, 10, 1));
    equal(feast.vigil, false);
    equal(feast.runningHead, 'All Saints');
    equal(feastDay(new Date(2025, 9, 31)).id, 'all-saints');
    equal(feastDay(new Date(2027, 10, 1)).id, 'all-saints');
  });

  it('is silent the rest of the year', () => {
    equal(feastDay(new Date(2026, 9, 30)), null);
    equal(feastDay(new Date(2026, 10, 2)), null);
    equal(feastDay(new Date(2026, 11, 25)), null);
  });

  it('sits with a verified spoken saying that is safe after a self-harm disclosure', () => {
    const v = verifyQuote(ALL_SAINTS.verse, ALL_SAINTS.quote);
    equal(v.ok, true);
    equal(v.substituted, false);
    equal(ALL_SAINTS.translation, 'KJV');
    equal(unsafeSaying('self', ALL_SAINTS.quote), false);
  });
});
