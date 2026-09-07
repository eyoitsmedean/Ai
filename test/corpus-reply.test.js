// Corpus-mode reply tests: every curated lead exists, every reply is verified
// by construction, and the wounding defaults recorded in RELEASE.md §F stay out.
const test = require('node:test');
const assert = require('node:assert/strict');
const cr = require('../lib/advisor/corpus-reply');
const corpus = require('../data/red-letters');

const ids = new Set(corpus.passages.map((p) => p.id));
const THEMES = Object.keys(cr.THEME_LEADS);

test('every theme has four curated leads, an opener, and generic context lines', () => {
  for (const theme of THEMES) {
    assert.equal(cr.THEME_LEADS[theme].length, 4, theme);
    assert.ok(cr.THEME_OPENER[theme], `opener missing for ${theme}`);
    assert.ok(cr.THEME_CONTEXT[theme]?.length >= 3, `context missing for ${theme}`);
  }
});

test('every lead id resolves to a corpus passage and has a non-empty why', () => {
  for (const theme of THEMES) {
    for (const [id, why] of cr.THEME_LEADS[theme]) {
      assert.ok(ids.has(id), `${theme}: unknown passage id ${id}`);
      assert.ok(why && why.length > 10, `${theme}: empty why for ${id}`);
    }
  }
});

test('offlineEncouragement: first two leads fixed, third rotates by seed, all verified', () => {
  const a = cr.offlineEncouragement('Fear', 'seed-a');
  const b = cr.offlineEncouragement('Fear', 'seed-b');
  assert.equal(a.passages.length, 4);
  assert.deepEqual(a.passages.slice(0, 2).map((p) => p.verse), b.passages.slice(0, 2).map((p) => p.verse));
  assert.ok(a.passages.every((p) => p.verified && p.source === 'corpus' && p.quote && p.context));
  assert.equal(a.opener, cr.THEME_OPENER.Fear);
  assert.equal(a.verified, true);
});

test('offlineEncouragement: unknown theme falls back to the whole corpus without throwing', () => {
  const r = cr.offlineEncouragement('Not A Theme', 'x');
  assert.equal(r.passages.length, 4);
  assert.ok(r.passages.every((p) => p.verified));
});

test('default (Hope), Fear and Suffering leads contain none of the phrases the Breaker flagged as wounding', () => {
  const banned = [/cheer up/i, /steal, kill, and destroy/i, /because of your unbelief/i];
  for (const theme of ['Hope', 'Fear', 'Suffering & Pain', 'Grief & Loss']) {
    const r = cr.offlineEncouragement(theme, 'any');
    for (const p of r.passages.slice(0, 3)) {
      for (const re of banned) assert.doesNotMatch(p.quote, re, `${theme}: ${p.verse}`);
    }
  }
});

test('offlineDaily: deterministic by date, verified, and different dates differ', () => {
  const a1 = cr.offlineDaily('2026-09-07');
  const a2 = cr.offlineDaily('2026-09-07');
  const b = cr.offlineDaily('2026-01-01');
  assert.deepEqual(a1, a2);
  assert.equal(a1.verified, true);
  assert.equal(a1.affirmation.verified, true);
  assert.equal(a1.word.verified, true);
  assert.ok(a1.affirmation.verse !== b.affirmation.verse || a1.word.verse !== b.word.verse);
});
