const { describe, it } = require('node:test');
const { deepEqual, equal } = require('node:assert/strict');
const {
  adventSunday,
  ashWednesday,
  churchYear,
  easterSunday,
  pentecost,
  ymd,
} = require('../lib/year');

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
});
