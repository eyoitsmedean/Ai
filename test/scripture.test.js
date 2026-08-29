const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanKjv,
  lookup,
  parseModelJson,
  parseRef,
  similarity,
  verifyAdvisorText,
  verifyJsonQuotes,
  verifyQuote,
} = require('../lib/scripture');
const { dailyForDate, encouragementFor, themeNames } = require('../lib/curated');

describe('parseRef', () => {
  it('parses full names and ranges', () => {
    assert.deepEqual(parseRef('John 14:27'), { book: 'John', chapter: 14, start: 27, end: 27, raw: 'John 14:27' });
    assert.equal(parseRef('Matthew 5:3-4').end, 4);
    assert.equal(parseRef('Jn 3:16').book, 'John');
    assert.equal(parseRef('Matt. 6:34').book, 'Matthew');
  });

  it('rejects non-gospel books', () => {
    assert.equal(parseRef('Romans 8:28'), null);
    assert.equal(parseRef('Psalm 23:1'), null);
  });
});

describe('lookup', () => {
  it('returns canonical KJV text', () => {
    const hit = lookup('John 14:27');
    assert.match(hit.text, /Peace I leave with you/);
    assert.equal(hit.citation, 'John 14:27');
  });

  it('joins ranges', () => {
    const hit = lookup('Matthew 5:3-4');
    assert.match(hit.text, /poor in spirit/);
    assert.match(hit.text, /they that mourn/);
    assert.equal(hit.citation, 'Matthew 5:3–4');
  });

  it('cleans italic braces and translator notes', () => {
    assert.equal(cleanKjv('Blessed {are} the poor.'), 'Blessed are the poor.');
    assert.equal(cleanKjv('I will come to you. {comfortless: or, orphans}'), 'I will come to you.');
  });
});

describe('verifyQuote', () => {
  it('substitutes paraphrases with corpus text', () => {
    const v = verifyQuote('Matthew 5:44', 'Love your enemies and be nice to people who are mean.');
    assert.equal(v.ok, true);
    assert.match(v.quote, /Love your enemies/);
    assert.ok(v.score < 0.9);
  });

  it('rejects unknown references', () => {
    const v = verifyQuote('Matthew 99:1', 'anything');
    assert.equal(v.ok, false);
  });
});

describe('verifyAdvisorText', () => {
  it('replaces a fabricated quote after a bold citation', () => {
    const input = [
      'I hear the weight you are carrying.',
      '',
      '**John 14:27**',
      '"Do not worry about anything, my peace is like a warm blanket."',
      'This meets the fear directly.',
    ].join('\n');
    const out = verifyAdvisorText(input);
    assert.match(out, /Peace I leave with you/);
    assert.doesNotMatch(out, /warm blanket/);
    assert.match(out, /This meets the fear directly/);
  });
});

describe('verifyJsonQuotes', () => {
  it('rewrites daily fields from the corpus', () => {
    const data = verifyJsonQuotes({
      affirmation: { text: 'You are held.', verse: 'Luke 12:7', quote: 'God likes birds and you too' },
      word: { theme: 'Worth', title: 'Counted', passage: 'your hair is numbered-ish', verse: 'Luke 12:7', reflection: 'Be still.' },
    });
    assert.match(data.affirmation.quote, /hairs of your head/);
    assert.equal(data.verified, true);
  });
});

describe('parseModelJson', () => {
  it('strips fences and leading prose', () => {
    const obj = parseModelJson('Sure.\n```json\n{"theme":"Peace"}\n```');
    assert.equal(obj.theme, 'Peace');
  });
});

describe('curated packs', () => {
  it('covers twelve themes with real verses', () => {
    assert.equal(themeNames().length, 12);
    for (const name of themeNames()) {
      const pack = encouragementFor(name);
      assert.ok(pack.passages.length >= 3);
      for (const p of pack.passages) {
        assert.ok(p.quote.length > 20);
        assert.match(p.verse, /^(Matthew|Mark|Luke|John) /);
      }
    }
  });

  it('rotates daily content with verified quotes', () => {
    const d = dailyForDate(new Date('2026-08-29T12:00:00Z'));
    assert.equal(d.verified, true);
    assert.ok(d.affirmation.quote.length > 10);
    assert.ok(lookup(d.word.verse));
  });
});

describe('similarity', () => {
  it('scores identical text high and paraphrase low', () => {
    const canon = lookup('John 14:1').text;
    assert.ok(similarity(canon, canon) > 0.99);
    assert.ok(similarity(canon, 'try not to be sad, believe more') < 0.5);
  });
});
