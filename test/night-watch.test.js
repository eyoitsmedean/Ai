const test = require('node:test');
const assert = require('node:assert/strict');
const { pickNightWatch, extractFirstSaying, watchDates } = require('../public/data/night-watch');
const { unsafeSaying } = require('../public/data/crisis');

const SIT = {
  date: '2026-10-30',
  verse: 'John 14:27',
  quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.',
};
const LETTER = {
  date: '2026-10-30',
  verse: 'Matthew 6:34',
  quote: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.',
};
const DAILY = {
  verse: 'Luke 12:32',
  quote: 'Fear not, little flock; for it is your Father’s good pleasure to give you the kingdom.',
};

test('a sitting from this evening is the night office', () => {
  const picked = pickNightWatch({
    sit: SIT,
    letter: LETTER,
    daily: DAILY,
    now: new Date(2026, 9, 30, 22, 10),
  });
  assert.equal(picked.source, 'sit');
  assert.equal(picked.verse, 'John 14:27');
});

test('a letter is kept when they have not sat', () => {
  const picked = pickNightWatch({
    letter: LETTER,
    daily: DAILY,
    now: new Date(2026, 9, 30, 21, 0),
  });
  assert.equal(picked.source, 'letter');
  assert.equal(picked.verse, 'Matthew 6:34');
});

test('before dawn the night is still last evening', () => {
  const dates = watchDates(new Date(2026, 9, 31, 2, 15));
  assert.equal(dates.today, '2026-10-31');
  assert.equal(dates.lastNight, '2026-10-30');
  const picked = pickNightWatch({
    sit: SIT,
    daily: DAILY,
    now: new Date(2026, 9, 31, 2, 15),
  });
  assert.equal(picked.verse, 'John 14:27');
  assert.equal(picked.source, 'sit');
});

test('after sunrise yesterday’s sitting is no longer the office', () => {
  const picked = pickNightWatch({
    sit: SIT,
    daily: DAILY,
    now: new Date(2026, 9, 31, 8, 0),
  });
  assert.equal(picked.source, 'daily');
  assert.equal(picked.verse, 'Luke 12:32');
});

test('a crisis day will not keep an unsafe saying', () => {
  const death = {
    date: '2026-10-30',
    verse: 'John 11:25',
    quote: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.',
  };
  const picked = pickNightWatch({
    letter: death,
    daily: DAILY,
    now: new Date(2026, 9, 30, 22, 0),
    crisisKind: 'self',
    unsafeSaying,
  });
  assert.equal(picked.verse, 'Luke 12:32');
  assert.equal(picked.source, 'daily');
});

test('no kept word still offers rest, never an empty page', () => {
  const picked = pickNightWatch({ now: new Date(2026, 9, 30, 23, 0) });
  assert.equal(picked.source, 'rest');
  assert.equal(picked.verse, 'Matthew 11:28');
});

test('extractFirstSaying reads a sealed letter', () => {
  const saying = extractFirstSaying(
    'I hear the spiral.\n\n**Matthew 6:34**\n"Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself."\nOne day is enough.\n'
  );
  assert.ok(saying);
  assert.equal(saying.verse, 'Matthew 6:34');
  assert.match(saying.quote, /no thought for the morrow/);
});
