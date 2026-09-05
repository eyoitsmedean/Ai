const { describe, it } = require('node:test');
const { deepEqual, equal } = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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

/* Western dates 2025–2030 plus the earliest and latest Easters in the next fifteen years, retrieved from a
   published Roman-calendar table (Ash Wednesday · Easter · Pentecost). Forty auto-offers on Lent, so these
   dates carry the launch; both the server and the client copy in public/index.html must agree with them. */
const RETRIEVED = [
  [2025, 20250305, 20250420, 20250608],
  [2026, 20260218, 20260405, 20260524],
  [2027, 20270210, 20270328, 20270516],
  [2028, 20280301, 20280416, 20280604],
  [2029, 20290214, 20290401, 20290520],
  [2030, 20300306, 20300421, 20300609],
  [2035, 20350207, 20350325, 20350513],
  [2038, 20380310, 20380425, 20380613],
];

function loadClientYear() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const start = html.indexOf('function civilDate(');
  const end = html.indexOf('function applySeason(');
  if (start < 0 || end < start) throw new Error('client church-year functions not found in index.html');
  const src = html.slice(start, end);
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${src}\nthis.easterSunday = easterSunday; this.churchYear = churchYear; this.adventSunday = adventSunday;`, ctx);
  return ctx;
}

describe('the calendar the launch hangs on', () => {
  it('server dates match the retrieved table for eight years', () => {
    for (const [y, ash, easter, pent] of RETRIEVED) {
      equal(ymd(ashWednesday(y)), ash, `Ash Wednesday ${y}`);
      equal(ymd(easterSunday(y)), easter, `Easter ${y}`);
      equal(ymd(pentecost(y)), pent, `Pentecost ${y}`);
    }
  });

  it('client copy in index.html agrees with the server for the same years', () => {
    const client = loadClientYear();
    const num = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    for (const [y, , easter] of RETRIEVED) {
      equal(num(client.easterSunday(y)), easter, `client Easter ${y}`);
      equal(num(client.adventSunday(y)), ymd(adventSunday(y)), `client Advent ${y}`);
    }
    for (const [y, m, d] of [[2027, 2, 9], [2027, 2, 10], [2027, 3, 27], [2027, 3, 28], [2027, 5, 16], [2027, 5, 17], [2038, 3, 9], [2038, 3, 10], [2035, 2, 7]]) {
      equal(client.churchYear(new Date(y, m - 1, d)).id, idOn(y, m, d), `season on ${y}-${m}-${d}`);
    }
  });

  it('Lent 2027 opens on Ash Wednesday and closes on Holy Saturday', () => {
    equal(idOn(2027, 2, 9), 'ordinary');
    equal(idOn(2027, 2, 10), 'lent');
    equal(idOn(2027, 3, 27), 'lent');
    equal(idOn(2027, 3, 28), 'easter');
    equal(idOn(2027, 5, 16), 'easter');
    equal(idOn(2027, 5, 17), 'ordinary');
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
