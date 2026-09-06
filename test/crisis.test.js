const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { CRISIS_PATTERN, CRISIS_NOTICE, looksLikeCrisis } = require('../lib/crisis');
const { retrieveSayings, formatAllowList, CRISIS_CITATIONS } = require('../lib/retrieve');
const scripture = require('../lib/scripture');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('crisis detection', () => {
  it('is the same function scripture.js exports', () => {
    assert.equal(scripture.looksLikeCrisis, looksLikeCrisis);
  });

  it('fires on explicit and oblique first-person statements', () => {
    for (const text of [
      'I am suicidal',
      'I have been thinking about suicide',
      'I want to kill myself',
      'I don\'t want to live anymore',
      'I do not want to be alive',
      'everyone would be better off without me',
      'I can\'t go on like this',
      'there is no point in living',
      'I want to end it all',
      'I have been cutting myself again',
      'I don\'t want to be here anymore',
      'I wish I was dead',
      'I am so tired of living',
      'I keep thinking about ending it',
      'Sometimes I just want to die',
    ]) {
      assert.equal(looksLikeCrisis(text), true, `should fire: ${text}`);
    }
  });

  it('stays quiet on grief, hyperbole, and everyday phrasing', () => {
    for (const text of [
      'My father died last month and I cannot stop crying',
      'I killed it at the interview but I still feel empty',
      'This job is killing me',
      'I am dying to know whether God hears me',
      'I want to end my marriage',
      'I feel dead inside',
      'My brother overdosed and I am angry at him',
      'I can\'t go on holiday this year because of money',
      'I could just die of embarrassment',
      'I want to live a better life',
      'Is it a sin to be so tired of everything?',
    ]) {
      assert.equal(looksLikeCrisis(text), false, `should not fire: ${text}`);
    }
  });

  it('hands a crisis reader only the fixed comfort verses', () => {
    const r = retrieveSayings('I am suicidal and I do not know why I am typing this');
    assert.equal(r.crisis, true);
    assert.deepEqual(r.sayings.map((s) => s.citation), CRISIS_CITATIONS);
    assert.match(formatAllowList(r.sayings), /^\{\{Matthew 11:28\}\}\n\{\{John 14:27\}\}/);
    for (const s of r.sayings) assert.ok(s.text.length > 20, `${s.citation} has spoken text`);
    const plain = retrieveSayings('I am anxious about tomorrow');
    assert.equal(plain.crisis, undefined);
  });

  it('separates the notice from the letter with a blank line', () => {
    assert.match(CRISIS_NOTICE, /988/);
    assert.match(CRISIS_NOTICE, /findahelpline\.com/);
    assert.ok(CRISIS_NOTICE.endsWith('\n\n'));
  });

  it('is copied verbatim into every client', () => {
    const literal = `/${CRISIS_PATTERN.source}/i`;
    const html = read('public/index.html');
    const fn = html.match(/function looksLikeCrisisClient\(text\) \{\n\s+return (\/.*\/i)\.test/);
    assert.ok(fn, 'public/index.html must define looksLikeCrisisClient');
    assert.equal(fn[1], literal, 'public/index.html crisis pattern drifted from lib/crisis.js');
    for (const rel of ['data/advisor.js', 'public/data/advisor.js']) {
      const m = read(rel).match(/const CRISIS = (\/.*\/i);/);
      assert.ok(m, `${rel} must define CRISIS`);
      assert.equal(m[1], literal, `${rel} crisis pattern drifted from lib/crisis.js`);
    }
  });
});
