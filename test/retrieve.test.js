const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sayingTouchesCitation } = require('../lib/themes');
const {
  CRISIS_CITATIONS,
  DEFAULT_CITATIONS,
  LEXICON,
  buildIndex,
  formatAllowList,
  guessThemes,
  retrieveSayings,
  stem,
  tokens,
} = require('../lib/retrieve');
const held = require('./heldout-retrieve.json');

function hitsAt(query, expect, n) {
  const r = retrieveSayings(query);
  return expect.filter((cite) => r.sayings.slice(0, n).some((s) => sayingTouchesCitation(s, cite)));
}

describe('retrieve stemmer and index', () => {
  it('maps modern and KJV forms of the same word to one stem', () => {
    const pairs = [
      ['believeth', 'believe'],
      ['forgiven', 'forgive'],
      ['troubled', 'trouble'],
      ['comfortless', 'comfort'],
      ['labour', 'labor'],
      ['sorrowful', 'sorrow'],
      ['enemies', 'enemy'],
      ['died', 'die'],
      ['death', 'die'],
      ['lost', 'lose'],
      ['praying', 'prayer'],
      ['worried', 'worry'],
      ['afraid', 'fear'],
      ['seeketh', 'seek'],
      ['found', 'find'],
    ];
    for (const [a, b] of pairs) {
      assert.equal(stem(a), stem(b), `${a} (${stem(a)}) vs ${b} (${stem(b)})`);
    }
  });

  it('keeps "thought" so Matthew 6 can match "take no thought"', () => {
    assert.ok(tokens('thought').includes(stem('thought')));
    assert.ok(tokens('Take therefore no thought for the morrow').includes(stem('thought')));
  });

  it('indexes every lexicon term against the spoken corpus', () => {
    const { idf } = buildIndex();
    const missing = [];
    for (const entry of LEXICON) {
      for (const phrase of entry.terms) {
        for (const t of tokens(phrase)) {
          if (!idf.has(t)) missing.push(`${phrase} -> ${t}`);
        }
      }
    }
    assert.deepEqual(missing, []);
  });
});

describe('retrieve themes', () => {
  it('maps everyday phrasing to the room the letter should open', () => {
    assert.ok(guessThemes('I am so anxious about tomorrow').includes('Anxiety & Worry'));
    assert.ok(guessThemes('my father is dying').includes('Grief & Loss'));
    assert.ok(guessThemes('How do I forgive my brother').includes('Forgiveness'));
    assert.ok(guessThemes('I feel completely alone').includes('Loneliness'));
    assert.ok(guessThemes('I am afraid of the future').includes('Fear'));
    assert.ok(guessThemes('I got fired today').includes('Purpose & Direction'));
    assert.ok(guessThemes('I was raped when I was nineteen').includes('Suffering & Pain'));
    assert.ok(guessThemes('I cannot stop drinking').includes('Shame & Guilt'));
  });

  it('does not open the wrong room on common phrasing', () => {
    assert.ok(!guessThemes("I'm dying to know if God hears me").includes('Grief & Loss'));
    assert.ok(!guessThemes('I still love him').includes('Peace'));
    assert.ok(!guessThemes('I lost my keys').includes('Purpose & Direction'));
    assert.ok(!guessThemes('This is a scam. Prove Jesus even existed or admit you are making money off desperate people').includes('Anxiety & Worry'));
    assert.ok(!guessThemes('My father died last month and I cannot stop crying').includes('Shame & Guilt'));
  });
});

describe('retrieveSayings', () => {
  it('hands a crisis reader only the fixed comfort verses', () => {
    const r = retrieveSayings('I want to kill myself');
    assert.equal(r.crisis, true);
    assert.deepEqual(r.sayings.map((s) => s.citation), CRISIS_CITATIONS);
    assert.match(formatAllowList(r.sayings), /^\{\{Matthew 11:28\}\}\n\{\{John 14:27\}\}/);
  });

  it('places the well-known saying in the first three for load-bearing needs', () => {
    assert.ok(hitsAt('I am so anxious about tomorrow I cannot sleep', ['Matthew 6:34'], 3).length);
    assert.ok(hitsAt('How do I love people who are cruel to me', ['Matthew 5:44'], 3).length);
    assert.ok(hitsAt('I feel so alone since my divorce', ['John 14:18'], 3).length);
    assert.ok(hitsAt("My teenager won't speak to me", ['Luke 15:20', 'Luke 15:24', 'Luke 15:4'], 8).length);
    assert.ok(hitsAt('This is a scam. Prove Jesus even existed', ['Mark 11:33', 'Matthew 21:24', 'Luke 4:12', 'Matthew 12:39'], 8).length);
  });

  it('falls back to known comfort verses when nothing maps', () => {
    const r = retrieveSayings('What is the weather in Denver this weekend?');
    assert.ok(r.sayings.length >= 3);
    const defaults = DEFAULT_CITATIONS.filter((c) => r.sayings.some((s) => sayingTouchesCitation(s, c) || s.citation === c));
    assert.ok(defaults.length >= 1, `expected a default comfort verse, got ${r.sayings.map((s) => s.citation)}`);
  });

  it('hits every locked held-out question in the top eight', () => {
    const missed = [];
    for (const q of held.questions) {
      if (!hitsAt(q.text, q.expect, 8).length) {
        missed.push(`${q.text} -> ${retrieveSayings(q.text).sayings.slice(0, 4).map((s) => s.citation).join(', ')}`);
      }
    }
    assert.deepEqual(missed, []);
  });
});
