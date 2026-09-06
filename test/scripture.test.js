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
  verifyAndSubstitute,
  verifyJsonQuotes,
  verifyQuote,
  isRedLetter,
  spokenAt,
  fillPlaceholders,
  loadCorpus,
  NARRATOR_PREFIXES,
  POISON_LINE,
  CRISIS_NOTICE,
  DANGER_NOTICE,
} = require('../lib/scripture');
const { retrievalLetter } = require('../lib/letter');
const { retrieveSayings, guessThemes } = require('../lib/retrieve');
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
    assert.equal(verifyAndSubstitute(input), out);
  });

  it('fills placeholders from the spoken corpus and drops unknown books', () => {
    const filled = fillPlaceholders('Hold this.\n{{John 14:27}}\nStay.');
    assert.match(filled, /Peace I leave with you/);
    assert.match(filled, /\*\*John 14:27\*\*/);
    assert.doesNotMatch(fillPlaceholders('See {{Romans 8:28}}.'), /Romans/);
    const via = verifyAndSubstitute('{{QUOTE:Mark 4:39}}');
    assert.match(via, /Peace, be still/);
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
    assert.equal(looksLikeCrisis('I have no reason to live'), true);
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

  it('accepts a YYYY-MM-DD local date string', () => {
    const fromString = dailyForDate('2026-08-29');
    const fromLocal = dailyForDate(new Date(2026, 7, 29));
    assert.equal(fromString.word.verse, fromLocal.word.verse);
    assert.equal(fromString.affirmation.verse, fromLocal.affirmation.verse);
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
    assert.equal(lookup('Matthew 1:1'), null);
    const v = verifyQuote('Matthew 1:1', 'The book of the generation of Jesus Christ');
    assert.equal(v.ok, false);
    assert.equal(v.reason, 'not-red-letter');
  });

  it('never puts other voices in His mouth', () => {
    // the devil, Mary, Judas's death, the narrator, the synagogue ruler, the crowd
    for (const ref of ['Matthew 4:9', 'Luke 4:6', 'Luke 1:46', 'Matthew 27:5', 'John 11:35', 'Mark 5:5', 'Luke 13:14', 'John 7:20', 'John 12:34', 'Luke 24:32', 'John 8:48']) {
      assert.equal(lookup(ref), null, ref);
      assert.equal(fillPlaceholders(`{{${ref}}}`), '', ref);
    }
  });

  it('carries the canonical KJV verse counts', () => {
    const books = loadCorpus().books;
    const counts = { Matthew: 1071, Mark: 678, Luke: 1151, John: 879 };
    for (const [book, expected] of Object.entries(counts)) {
      const n = Object.values(books[book]).reduce((sum, ch) => sum + Object.keys(ch).length, 0);
      assert.equal(n, expected, book);
    }
    assert.match(books.Matthew['26']['39'], /^And he went a little farther, and fell on his face, and prayed/);
    assert.match(books.Mark['4']['40'], /^And he said unto them, Why are ye so fearful/);
    assert.match(books.Matthew['22']['14'], /^For many are called, but few are chosen/);
  });

  it('drops what the model may not say, wherever it puts it', () => {
    assert.equal(verifyAndSubstitute('**John 14:27** “God helps those who help themselves.”'), '**John 14:27**\n“' + spokenAt('John', 14, 27) + '”');
    assert.equal(verifyAndSubstitute('**Psalm 23:1**\n“The LORD is my shepherd; I shall not want.”\nHe leads.'), 'He leads.');
    assert.equal(verifyAndSubstitute('**Matthew 4:9**\n“All these things will I give thee.”\nctx'), 'ctx');
    assert.equal(verifyAndSubstitute('Your mother is gone. Jesus said, “God helps those who help themselves and their families always.” Rest now.'), 'Your mother is gone. Rest now.');
    assert.equal(verifyAndSubstitute('Proverbs 13:24 says spare the rod. But peace is near.'), 'But peace is near.');
    assert.equal(verifyAndSubstitute('Hold on.\n“Your mother will come back to you if you only believe hard enough tonight.”\nAmen.'), 'Hold on.\nAmen.');
    assert.equal(verifyAndSubstitute('He said “Peace I leave with you, my peace I give unto you” to frightened men.'), 'He said “Peace I leave with you, my peace I give unto you” to frightened men.');
  });

  it('leaves no orphan when a quotation is split, short, or under a look-alike heading', () => {
    // A quotation the model broke across two lines: the tail must not survive as prose.
    const split = verifyAndSubstitute('Hear this.\n\n**John 14:27**\n“Peace I leave with you,\nmy peace I give unto you.”\nHe leaves peace.');
    assert.equal(split, 'Hear this.\n\n**John 14:27**\n“' + spokenAt('John', 14, 27) + '”\nHe leaves peace.');
    // Three-word fabrications in prose go; a real short phrase of His stays.
    assert.equal(verifyAndSubstitute('Jesus said “just let go.” Stay with that. He also said “trust the process” and it works.'), 'Stay with that.');
    assert.equal(verifyAndSubstitute('He said “Peace, be still.” Stay with that.'), 'He said “Peace, be still.” Stay with that.');
    // A heading that only looks like a citation, and whatever it vouched for.
    assert.equal(verifyAndSubstitute('**Jn 14.27**\n“x”\n\nGo well.'), 'Go well.');
    assert.equal(verifyAndSubstitute('**Jesus said**\n“Everything happens for a reason.”\n\nGo well.'), 'Go well.');
    assert.equal(verifyAndSubstitute('**John 14:27**\n“Peace”\n\nGo well.'), '**John 14:27**\n“' + spokenAt('John', 14, 27) + '”\nGo well.');
  });

  it('strips the evangelist intro but keeps speech inside parables', () => {
    assert.equal(spokenAt('Mark', 11, 22), 'Have faith in God.');
    assert.match(spokenAt('Luke', 13, 8), /^And he answering said unto him, Lord, let it alone/);
    assert.match(spokenAt('Matthew', 10, 38), /^And he that taketh not his cross/);
    // The explicit list: each prefix matches the verse it names, and the trimmed verse begins with His words.
    const corpus = loadCorpus().books;
    for (const [cite, prefix] of Object.entries(NARRATOR_PREFIXES)) {
      const p = parseRef(cite);
      const full = cleanKjv(corpus[p.book][p.chapter][p.start]);
      assert.ok(full.startsWith(prefix), `${cite} does not begin with its listed prefix`);
      assert.equal(spokenAt(p.book, p.chapter, p.start), full.slice(prefix.length).trim(), cite);
    }
    assert.match(spokenAt('Luke', 22, 31), /^Simon, Simon, behold/);
    assert.match(spokenAt('Mark', 9, 19), /^O faithless generation/);
    assert.match(spokenAt('John', 16, 19), /^Do ye enquire among yourselves/);
    // Characters inside His parables keep their "and he said": that is His narration.
    assert.match(spokenAt('Luke', 16, 2), /^And he called him, and said unto him/);
    assert.match(spokenAt('Matthew', 25, 24), /^Then he which had received the one talent/);
    assert.match(spokenAt('Luke', 15, 29), /^And he answering said to his father/);
  });

  it('puts 911 and Poison Control ahead of 988 when something was taken', () => {
    const taken = retrievalLetter("I took too many pills an hour ago and now I'm scared.");
    assert.ok(taken.startsWith(POISON_LINE), 'emergency line must come first');
    assert.ok(taken.indexOf(POISON_LINE) < taken.indexOf(CRISIS_NOTICE.split('\n')[0]));
    assert.match(taken, /1-800-222-1222/);
    const wish = retrievalLetter('I want to die.');
    assert.ok(wish.startsWith(CRISIS_NOTICE.split('\n')[0]));
    assert.doesNotMatch(wish, /Poison Control/);
    assert.doesNotMatch(retrievalLetter('I drank the whole bottle of wine and I feel ashamed.'), /988|Poison Control/);
    const byYou = retrievalLetter('I want to hit my kid.');
    assert.ok(byYou.startsWith(DANGER_NOTICE.split('\n')[0]));
    assert.match(byYou, /You asked about hurting someone/);
    assert.doesNotMatch(byYou, /not your fault/);
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

  it('retrieves fear sayings for a frightened writer', () => {
    assert.ok(guessThemes('I am afraid of the future').includes('Fear'));
    const hit = retrieveSayings('I am afraid of the future', { limit: 8 });
    assert.ok(hit.sayings.length >= 3);
    assert.ok(hit.sayings.some((s) => /fear not|be not afraid|troubled/i.test(s.text)));
  });
});
