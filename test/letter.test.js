const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { composeLetter, citedBefore } = require('../lib/letter');
const { guessThemes } = require('../lib/retrieve');
const { verifyAndSubstitute, lookup, parseAllRefs, isRedLetter } = require('../lib/scripture');
const { THEMES, themeNames } = require('../lib/curated');

describe('guessThemes hears ordinary phrasing', () => {
  it('matches inflected words, not just stems at word end', () => {
    assert.deepEqual(guessThemes('I am so anxious and worried'), ['Anxiety & Worry']);
    assert.ok(guessThemes('I cannot forgive my brother').includes('Forgiveness'));
    assert.ok(guessThemes('I feel so lonely tonight').includes('Loneliness'));
    assert.ok(guessThemes('I am grieving').includes('Grief & Loss'));
  });

  it('hears doubt without the word doubt', () => {
    assert.ok(guessThemes('I feel nothing when I pray, is God even there').includes('Faith & Doubt'));
  });

  it('returns nothing for a greeting', () => {
    assert.deepEqual(guessThemes('hi'), []);
    assert.deepEqual(guessThemes('thank you'), []);
  });
});

describe('composeLetter', () => {
  it('answers the need that was named', () => {
    const shame = composeLetter('I feel so much shame');
    assert.equal(shame.theme, 'Shame & Guilt');
    assert.deepEqual(shame.citations.slice(0, 2), ['Luke 15:4', 'Luke 15:7']);
    const grief = composeLetter('my mother died last week');
    assert.equal(grief.theme, 'Grief & Loss');
    assert.ok(grief.citations.includes('Matthew 5:4'));
    assert.notDeepEqual(shame.citations, grief.citations);
  });

  it('emits placeholders only, never verse text', () => {
    const { text } = composeLetter('I am afraid');
    assert.match(text, /\{\{Luke 12:32\}\}/);
    assert.doesNotMatch(text, /good pleasure to give you the kingdom/);
    assert.doesNotMatch(text, /hairs of your head are all numbered/);
  });

  it('fills to canonical red-letter KJV', () => {
    for (const q of ['I am afraid', 'I feel ashamed', 'so lonely', 'hi', 'my wife and I keep fighting']) {
      const filled = verifyAndSubstitute(composeLetter(q).text);
      assert.doesNotMatch(filled, /\{\{/);
      const refs = parseAllRefs(filled);
      assert.ok(refs.length >= 2, `${q}: expected at least two passages`);
      for (const ref of refs) {
        assert.ok(isRedLetter(ref), `${q}: ${ref.raw} is not a spoken saying`);
        const hit = lookup(ref);
        assert.ok(filled.includes(hit.text), `${q}: ${ref.raw} text is not canonical`);
      }
    }
  });

  it('falls back to the gentlest sentences for a greeting', () => {
    const { theme, citations } = composeLetter('hi');
    assert.equal(theme, null);
    assert.deepEqual(citations, ['Matthew 11:28', 'John 14:27']);
  });

  it('does not repeat itself across a correspondence', () => {
    const first = composeLetter('I feel so much shame');
    const history = [
      { role: 'user', content: 'I feel so much shame' },
      { role: 'assistant', content: verifyAndSubstitute(first.text) },
    ];
    const second = composeLetter('I still feel ashamed', { history });
    for (const c of second.citations) assert.ok(!first.citations.includes(c), `${c} repeated`);
    assert.ok(second.citations.length >= 1);
  });

  it('reads earlier citations from assistant turns only', () => {
    const seen = citedBefore([
      { role: 'user', content: 'What about John 3:16?' },
      { role: 'assistant', content: '**Luke 15:4**\n“…”' },
    ]);
    assert.deepEqual(seen, ['Luke 15:4']);
  });

  it('has a curated pack for every room', () => {
    for (const name of themeNames()) {
      assert.ok(THEMES[name].opening && THEMES[name].closing, name);
      assert.ok(THEMES[name].passages.length >= 3, name);
    }
  });
});
