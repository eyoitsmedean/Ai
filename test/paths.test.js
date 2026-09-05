const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { verifyQuote, parseRef } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');

function loadPaths() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const file of ['curated.js', 'advisor.js', 'paths.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8'), ctx, { filename: file });
  }
  return ctx.window;
}

const win = loadPaths();
const SEVEN = win.RLA_SEVEN;
const FORTY = win.RLA_FORTY;

function checkLeaves(name, list) {
  list.forEach((leaf, i) => {
    const where = `${name} ${i + 1} (${leaf.verse})`;
    assert.ok(leaf.title && leaf.title.length <= 24, `${where} needs a short title`);
    assert.ok(leaf.theme, `${where} needs a theme`);
    assert.ok(parseRef(leaf.verse), `${where} has an unparseable citation`);
    assert.ok(leaf.passage && leaf.passage.length > 20, `${where} needs a passage`);
    assert.ok(leaf.reflection && leaf.reflection.length > 20, `${where} needs a reflection`);
    const verified = verifyQuote(leaf.verse, leaf.passage);
    assert.ok(verified.ok, `${where} does not verify: ${verified.reason}`);
    assert.ok(verified.score >= 0.6, `${where} drifts from the KJV (score ${verified.score.toFixed(2)})`);
  });
}

describe('named paths', () => {
  it('Seven has seven leaves, every one His words', () => {
    assert.equal(SEVEN.length, 7);
    checkLeaves('Seven', SEVEN);
  });

  it('Forty has forty leaves in five quires of eight', () => {
    assert.equal(FORTY.length, 40);
    assert.equal(win.RLA_FORTY_QUIRES.length, 5);
    assert.equal(win.RLA_quireOf(0), 0);
    assert.equal(win.RLA_quireOf(7), 0);
    assert.equal(win.RLA_quireOf(8), 1);
    assert.equal(win.RLA_quireOf(39), 4);
    checkLeaves('Forty', FORTY);
  });

  it('Forty never repeats a saying, and never repeats Seven', () => {
    const seen = new Set();
    for (const leaf of FORTY) {
      assert.ok(!seen.has(leaf.verse), `Forty repeats ${leaf.verse}`);
      seen.add(leaf.verse);
    }
    for (const leaf of SEVEN) {
      assert.ok(!seen.has(leaf.verse), `Forty repeats Seven's ${leaf.verse}`);
    }
  });

  it('Forty tells a story: opens with an invitation, ends with a sending', () => {
    assert.match(FORTY[0].passage, /^Come unto me/);
    assert.match(FORTY[39].passage, /send I you/);
  });

  it('RLA_pathList returns the right list for each kind', () => {
    assert.equal(win.RLA_pathList('seven').length, 7);
    assert.equal(win.RLA_pathList('forty').length, 40);
    assert.equal(win.RLA_pathList('anything-else').length, 7);
  });

  it('public/data mirrors data for the files the page loads', () => {
    for (const file of ['advisor.js', 'curated.js', 'paths.js']) {
      const src = fs.readFileSync(path.join(ROOT, 'data', file), 'utf8');
      const pub = fs.readFileSync(path.join(ROOT, 'public', 'data', file), 'utf8');
      assert.equal(pub, src, `public/data/${file} is out of sync with data/${file}`);
    }
  });
});
