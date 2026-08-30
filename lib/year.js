/**
 * Western church year — complex to compute, silent in the room.
 * Seasons change the paper. The user never has to name them.
 */

function civil(y, m, d) {
  return new Date(y, m - 1, d);
}

function ymd(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function addDays(date, n) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Gregorian Easter (Anonymous / Meeus). */
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return civil(year, month, day);
}

/** First Sunday of Advent: Sunday from Nov 27 through Dec 3. */
function adventSunday(year) {
  const start = civil(year, 11, 27);
  const add = (7 - start.getDay()) % 7;
  return addDays(start, add);
}

function ashWednesday(year) {
  return addDays(easterSunday(year), -46);
}

function pentecost(year) {
  return addDays(easterSunday(year), 49);
}

const SEASONS = {
  advent: {
    id: 'advent',
    name: 'Advent',
    runningHead: 'Advent',
    note: 'A violet thread. Waiting is the work.',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    runningHead: 'Christmas',
    note: 'The Word became flesh, and the paper warms.',
  },
  lent: {
    id: 'lent',
    name: 'Lent',
    runningHead: 'Lent',
    note: 'Unbleached paper. Fewer ornaments. The sentence is enough.',
  },
  easter: {
    id: 'easter',
    name: 'Easter',
    runningHead: 'Easter',
    note: 'Gold in the rule. He is not in the tomb.',
  },
  ordinary: {
    id: 'ordinary',
    name: 'Ordinary Time',
    runningHead: 'Ordinary Time',
    note: 'The long green season. Stay.',
  },
};

function churchYear(date) {
  const d = date instanceof Date ? date : new Date(date || Date.now());
  const year = d.getFullYear();
  const n = ymd(d);

  const xmasStart = ymd(civil(year, 12, 25));
  const xmasEnd = ymd(civil(year, 12, 31));
  const xmasTailEnd = ymd(civil(year, 1, 5));
  if (n >= xmasStart && n <= xmasEnd) return { ...SEASONS.christmas, date: d };
  if (n <= xmasTailEnd) return { ...SEASONS.christmas, date: d };

  const advent = ymd(adventSunday(year));
  const christmasEve = ymd(civil(year, 12, 24));
  if (n >= advent && n <= christmasEve) return { ...SEASONS.advent, date: d };

  const ash = ymd(ashWednesday(year));
  const holySaturday = ymd(addDays(easterSunday(year), -1));
  if (n >= ash && n <= holySaturday) return { ...SEASONS.lent, date: d };

  const easter = ymd(easterSunday(year));
  const whit = ymd(pentecost(year));
  if (n >= easter && n <= whit) return { ...SEASONS.easter, date: d };

  return { ...SEASONS.ordinary, date: d };
}

module.exports = {
  addDays,
  adventSunday,
  ashWednesday,
  churchYear,
  easterSunday,
  pentecost,
  ymd,
};
