const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { verifyQuote, isRedLetter } = require('../lib/scripture');

function loadBrowserData() {
  const window = {};
  const ctx = vm.createContext({ window });
  ['curated.js', 'advisor.js', 'paths.js'].forEach((file) => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8');
    vm.runInContext(src, ctx, { filename: file });
  });
  return window;
}

describe('public/data mirrors data/', () => {
  it('ships the same paths.js and advisor.js the tests verify', () => {
    ['paths.js', 'advisor.js', 'curated.js'].forEach((file) => {
      const a = fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8');
      const b = fs.readFileSync(path.join(__dirname, '..', 'public', 'data', file), 'utf8');
      assert.equal(a, b, `${file} differs between data/ and public/data/`);
    });
  });
});

describe('Watch with me (Advent path)', () => {
  const w = loadBrowserData();
  const advent = w.RLA_ADVENT;

  it('has four named weeks and twenty-eight rooms', () => {
    assert.equal(advent.name, 'Watch with me');
    assert.deepEqual([...advent.weeks], ['Watch', 'Wait', 'Prepare', 'Near']);
    assert.equal(advent.days.length, 28);
    assert.deepEqual([...advent.days.map((d) => d.week)], Array.from({ length: 28 }, (_, i) => Math.floor(i / 7)));
  });

  it('opens with Seven Days in seasonal clothes', () => {
    assert.deepEqual([...advent.days.slice(0, 7).map((d) => d.verse)], [...w.RLA_SEVEN.map((d) => d.verse)]);
  });

  it('never repeats a room', () => {
    const verses = advent.days.map((d) => d.verse);
    assert.equal(new Set(verses).size, verses.length);
    const titles = advent.days.map((d) => d.title);
    assert.equal(new Set(titles).size, titles.length);
  });

  it('keeps titles short enough for seven across a phone', () => {
    advent.days.forEach((d) => assert.ok(d.title.length <= 8, `${d.title} is too long for the ribbon`));
  });

  it('quotes only his spoken words, exactly as the KJV has them', () => {
    advent.days.forEach((d) => {
      assert.ok(isRedLetter(d.verse), `${d.verse} is not red-letter`);
      const v = verifyQuote(d.verse, d.passage);
      assert.ok(v.ok, `${d.verse}: ${v.reason}`);
      assert.ok(v.score >= 0.9, `${d.verse} drifts from the KJV (score ${v.score})`);
      assert.ok(d.reflection && d.reflection.length > 20, `${d.title} needs a reflection`);
    });
  });

  it('is reachable through RLA_pathList', () => {
    assert.equal(w.RLA_pathList('advent').length, 28);
    assert.equal(w.RLA_pathList('seven').length, 7);
  });
});
