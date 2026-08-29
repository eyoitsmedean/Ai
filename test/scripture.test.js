const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanKjv,
  lookup,
  looksLikeCrisis,
  parseModelJson,
  parseRef,
  similarity,
  verifyAdvisorText,
  verifyJsonQuotes,
  verifyQuote,
  isRedLetter,
  spokenAt,
} = require('../lib/scripture');
const { dailyForDate, encouragementFor, themeNames } = require('../lib/curated');
const { searchLibrary, verseCount, sayingCount } = require('../lib/library');
const { themesForSaying, isKnownTheme } = require('../lib/themes');

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

describe('extractSpoken', () => {
  it('strips narrator wrappers from red-letter verses', () => {
    const mark = lookup('Mark 4:39');
    assert.equal(mark.text, 'Peace, be still.');
    assert.match(mark.full, /rebuked the wind/);
    assert.doesNotMatch(lookup('John 8:12').text, /Then spake Jesus/);
    assert.match(lookup('John 8:12').text, /^I am the light/);
    assert.equal(lookup('Mark 5:36').text, 'Be not afraid, only believe.');
  });

  it('does not invent speech when the verse is already spoken', () => {
    const hit = lookup('John 14:27');
    assert.match(hit.text, /Peace I leave with you/);
    assert.equal(hit.text, hit.full);
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

  it('does not stamp verified when a citation is unknown', () => {
    const data = verifyJsonQuotes({
      affirmation: { text: 'No.', verse: 'Matthew 99:1', quote: 'a fabricated saying' },
    });
    assert.equal(data.verified, false);
    assert.equal(data.affirmation.quote, 'a fabricated saying');
  });

  it('drops unverifiable passages instead of keeping fabrications', () => {
    const data = verifyJsonQuotes({
      passages: [
        { verse: 'John 14:27', quote: 'peace-ish', context: 'ok' },
        { verse: 'Romans 8:28', quote: 'all things work together', context: 'no' },
      ],
    });
    assert.equal(data.passages.length, 1);
    assert.equal(data.verified, false);
    assert.match(data.passages[0].quote, /Peace I leave with you/);
  });
});

describe('looksLikeCrisis', () => {
  it('detects clear self-harm language and ignores ordinary grief', () => {
    assert.equal(looksLikeCrisis('I want to kill myself tonight'), true);
    assert.equal(looksLikeCrisis('I am grieving and feel overwhelmed'), false);
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
        assert.ok(p.quote.length > 8);
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

describe('spoken corpus', () => {
  it('treats genealogy as narrator, not red-letter', () => {
    assert.equal(isRedLetter('Matthew 1:1'), false);
    const v = verifyQuote('Matthew 1:1', lookup('Matthew 1:1').text);
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'not-red-letter');
  });

  it('uses the spoken span for Mark 4:39 and John 8:12', () => {
    assert.match(spokenAt('Mark', 4, 39), /Peace, be still/i);
    assert.doesNotMatch(spokenAt('Mark', 4, 39), /he arose/i);
    assert.match(spokenAt('John', 8, 12), /^I am the light of the world/i);
    assert.equal(lookup('Mark 4:39').redLetter, true);
  });

  it('groups sayings and can be searched', () => {
    assert.ok(verseCount() > 1800);
    assert.ok(sayingCount() > 500);
    const beatitudes = searchLibrary({ q: 'blessed are the poor', limit: 5 });
    assert.ok(beatitudes.sayings.length >= 1);
    assert.match(beatitudes.sayings[0].text, /Blessed are the poor/i);
    const john = searchLibrary({ book: 'John', q: 'I am the way', limit: 3 });
    assert.ok(john.sayings.length >= 1);
    assert.match(john.sayings[0].citation, /^John /);
  });

  it('filters the library by encouragement room', () => {
    assert.equal(isKnownTheme('Peace'), true);
    const peace = searchLibrary({ theme: 'Peace', limit: 20 });
    assert.ok(peace.sayings.some((s) => /14:27|4:39|16:33/.test(s.citation)));
    const still = themesForSaying({ book: 'Mark', chapter: 4, start: 39, end: 39, text: 'Peace, be still.' });
    assert.ok(still.includes('Peace'));
  });
});
