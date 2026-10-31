const test = require('node:test');
const assert = require('node:assert/strict');
const { watchForHour, keepsScore } = require('../public/data/watch');

test('the night office does not keep score', () => {
  for (const hour of [0, 3, 5, 21, 22, 23]) {
    assert.equal(watchForHour(hour), 'night', String(hour));
    assert.equal(keepsScore(hour), false, String(hour));
  }
});

test('morning, afternoon, and vespers still count', () => {
  assert.equal(watchForHour(6), 'dawn');
  assert.equal(watchForHour(12), 'day');
  assert.equal(watchForHour(17), 'vespers');
  assert.equal(watchForHour(20), 'vespers');
  for (const hour of [6, 10, 12, 16, 17, 20]) {
    assert.equal(keepsScore(hour), true, String(hour));
  }
});
