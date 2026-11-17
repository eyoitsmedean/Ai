const test = require('node:test');
const assert = require('node:assert/strict');
const { watchForHour, keepsScore } = require('../public/data/hours');

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

test('the Lamp, the office and the wash turn at the same hour', () => {
  const lamp = require('../public/data/lamp');
  const office = require('../public/data/office');
  const names = { night: 'Compline', dawn: 'Morning', day: 'Afternoon', vespers: 'Vespers' };
  for (let h = 0; h < 24; h++) {
    const d = new Date(2026, 10, 29, h, 30, 0);
    const band = watchForHour(h);
    assert.equal(office.officeName(d), names[band], `${h}:30 office`);
    assert.equal(lamp.isNightHour(h), band === 'night', `${h}:30 lamp`);
    assert.equal(office.isNightOffice(d), band === 'night', `${h}:30 night office`);
    assert.equal(office.isEveningOffice(d), band === 'night' || band === 'vespers', `${h}:30 evening office`);
  }
  assert.equal(watchForHour(11), 'dawn', '11:00 is still Morning');
});

test('an open page repaints when the hour band or the date turns', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert.ok(html.indexOf('src="data/hours.js"') < html.indexOf('src="data/lamp.js"'), 'hours.js must load before the Lamp');
  assert.match(html, /hourKey = key;\s*setWatch\(\);\s*updateDateUI\(\);/);
});
