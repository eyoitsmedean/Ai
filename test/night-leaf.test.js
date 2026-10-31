const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { lookup } = require('../lib/scripture');
const { dailyForDate } = require('../lib/curated');
const { dailyIndex, pickDaily } = require('../public/data/night.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'night.html'), 'utf8');
const index = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'manifest.json'), 'utf8'));

function loadCurated() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'curated.js'), 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.window.RLA_CURATED;
}

test('night leaf is a quiet Compline page', () => {
  assert.match(html, /id="night-word"/);
  assert.match(html, /Compline/);
  assert.match(html, /href="tel:988"/);
  assert.match(html, /findahelpline\.com/);
  assert.match(html, /This page is not a person/);
  assert.match(html, / ·  KJV/);
  assert.match(html, /#E8D8B4/, 'lamp paper, not OLED');
  assert.doesNotMatch(html, /Ask Him|AI Jesus|streak|Roumie|The Chosen/i);
  assert.doesNotMatch(html, /Ask the Advisor/);
});

test('the full room offers the night leaf after twenty-one', () => {
  assert.match(index, /id="night-leaf-link"/);
  assert.match(index, /href="night.html"/);
  assert.match(index, /nightLink\.hidden = !night/);
});

test('the night leaf is precached and a home-screen shortcut', () => {
  assert.match(sw, /rla-v21/);
  assert.match(sw, /night\.html/);
  assert.match(sw, /data\/night\.js/);
  assert.equal(manifest.shortcuts[0].url, './night.html');
});

test('slot math matches the server’s local-midnight clock', () => {
  const dates = [
    new Date(2026, 9, 31, 3, 11),
    new Date(2026, 0, 1, 23, 0),
    new Date(2026, 5, 15, 0, 0),
  ];
  for (const date of dates) {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const expected = Math.floor(local.getTime() / 86400000) % 7;
    assert.equal(dailyIndex(date, 7), expected < 0 ? expected + 7 : expected);
  }
  assert.equal(pickDaily([], new Date()), null);
});

test('every bundled night saying is a locked Gospel verse', () => {
  const curated = loadCurated();
  assert.ok(Array.isArray(curated.daily) && curated.daily.length >= 1);
  for (const day of curated.daily) {
    const hit = lookup(day.word.verse);
    assert.ok(hit, `missing ${day.word.verse}`);
    assert.ok(hit.text.length > 8, `${day.word.verse} came back empty`);
  }
  const tonight = pickDaily(curated.daily, new Date(2026, 9, 31, 3));
  assert.ok(tonight.word.passage);
  assert.ok(lookup(tonight.word.verse));
});

test('the API’s word for a civil day is a real saying', () => {
  const pack = dailyForDate(new Date(2026, 9, 31, 3, 11));
  assert.ok(pack.word.passage);
  assert.ok(lookup(pack.word.verse));
  assert.equal(pack.translation, 'KJV');
});
