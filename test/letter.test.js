const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { composeLetter, citedBefore } = require('../lib/letter');
const { guessThemes, retrieveSayings } = require('../lib/retrieve');
const { verifyAndSubstitute, lookup, parseAllRefs, isRedLetter } = require('../lib/scripture');
const { THEMES, themeNames } = require('../lib/curated');

describe('guessThemes hears ordinary phrasing', () => {
  it('matches inflected words, not just stems at word end', () => {
    assert.deepEqual(guessThemes('I am so anxious and worried'), ['Anxiety & Worry']);
    assert.ok(guessThemes('I cannot forgive my brother').includes('Forgiveness'));
    assert.ok(guessThemes('I feel so lonely tonight').includes('Loneliness'));
    assert.ok(guessThemes('I am grieving').includes('Grief & Loss'));
    assert.ok(guessThemes('I keep sinning').includes('Shame & Guilt'));
    assert.ok(guessThemes('I am terrified').includes('Fear'));
  });

  it('hears doubt without the word doubt', () => {
    assert.ok(guessThemes('I feel nothing when I pray, is God even there').includes('Faith & Doubt'));
  });

  it('puts the heavier need first', () => {
    assert.equal(guessThemes('I am so worried, my mother died yesterday')[0], 'Grief & Loss');
    assert.equal(guessThemes('I am afraid and I am ashamed and I am alone')[0], 'Fear');
  });

  it('does not hear a need in ordinary words', () => {
    for (const q of [
      'hi', 'thank you', 'I love my husband', 'my boss gave me a raise', 'my mother is visiting',
      'painting my room this weekend', 'Are you still there?', 'tomorrow is my birthday',
      'lost my keys', 'guilty pleasure', 'I feel fearless today', 'a bittersweet ending', 'shameless', 'hopefully',
      'my sister and I are going to the beach', 'my daughter always makes me laugh', 'I am dying to see the new film',
      'I have faith in my team', 'hope you are well', 'peace out',
    ]) {
      assert.deepEqual(guessThemes(q), [], q);
    }
  });

  it('hears the ways people actually write about hurt', () => {
    const cases = [
      ['I miss my mom', 'Grief & Loss'],
      ["I can't stop crying", 'Grief & Loss'],
      ['I had a miscarriage last month', 'Grief & Loss'],
      ['lost my dog yesterday', 'Grief & Loss'],
      ['I feel worthless', 'Shame & Guilt'],
      ['I keep failing at everything', 'Shame & Guilt'],
      ['I hurt someone I love', 'Shame & Guilt'],
      ['my best friend betrayed me', 'Forgiveness'],
      ['I am angry at God', 'Faith & Doubt'],
      ['I feel so far from God', 'Faith & Doubt'],
      ['why does God let this happen', 'Faith & Doubt'],
      ["I don't know how to keep going", 'Hope'],
      ['I got laid off today and I have two kids', 'Anxiety & Worry'],
      ["I'm drowning in debt", 'Anxiety & Worry'],
      ['I feel numb', 'Faith & Doubt'],
      ['I lost my job', 'Purpose & Direction'],
    ];
    for (const [q, theme] of cases) {
      assert.ok(guessThemes(q).includes(theme), `${q} -> ${guessThemes(q)}`);
    }
  });

  it('still hears conflict when a relationship is actually strained', () => {
    assert.equal(guessThemes('I love my husband but we fight every night')[0], 'Conflict & Relationships');
    assert.equal(guessThemes('my husband and I are not speaking')[0], 'Conflict & Relationships');
  });

  it('falls back to three gentle sayings for a content-free message', () => {
    const cites = retrieveSayings('hi').sayings.map((s) => s.citation);
    assert.equal(cites.length, 3);
    assert.ok(cites.some((c) => /Matthew 11:2/.test(c)));
    assert.ok(cites.some((c) => /John 14:2/.test(c)));
    assert.ok(cites.some((c) => /Mark 4:39/.test(c)));
  });
});

describe('composeLetter', () => {
  it('answers the need that was named', () => {
    const shame = composeLetter('I feel so much shame');
    assert.equal(shame.theme, 'Shame & Guilt');
    assert.deepEqual(shame.citations, ['Luke 15:4', 'Luke 15:7']);
    const grief = composeLetter('my mother died last week');
    assert.equal(grief.theme, 'Grief & Loss');
    assert.deepEqual(grief.citations, ['Matthew 5:4', 'John 11:25']);
  });

  it('emits placeholders only, never verse text', () => {
    const { text } = composeLetter('I am afraid');
    assert.match(text, /\{\{Luke 12:32\}\}/);
    assert.doesNotMatch(text, /good pleasure to give you the kingdom/);
    assert.doesNotMatch(text, /hairs of your head are all numbered/);
  });

  it('fills to canonical red-letter KJV', () => {
    for (const q of ['I am afraid', 'I feel ashamed', 'so lonely', 'hi', 'my wife and I keep fighting', 'diagnosed with cancer']) {
      const filled = verifyAndSubstitute(composeLetter(q).text);
      assert.doesNotMatch(filled, /\{\{/);
      const refs = parseAllRefs(filled);
      assert.ok(refs.length >= 2, `${q}: expected two passages`);
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

  it('never counsels the hurting with a conditional or a scolding', () => {
    const walk = (q, turns) => {
      const history = [];
      const out = [];
      for (let i = 0; i < turns; i++) {
        const filled = verifyAndSubstitute(composeLetter(q, { history }).text);
        out.push(filled);
        history.push({ role: 'assistant', content: filled });
      }
      return out.join('\n');
    };
    const sick = walk('diagnosed with cancer', 4);
    assert.doesNotMatch(sick, /thy sins be forgiven/);
    assert.doesNotMatch(sick, /thy faith hath made thee whole/);
    const doubter = walk('I feel nothing when I pray, is God even there', 4);
    assert.doesNotMatch(doubter, /Because of your unbelief/);
    const betrayed = walk('my husband cheated on me', 4);
    assert.doesNotMatch(betrayed, /Go first/);
    assert.doesNotMatch(betrayed, /bring thy gift to the altar/);
  });

  it('reads a new room’s opening even after another room was visited', () => {
    const fear = verifyAndSubstitute(composeLetter('I am afraid').text);
    const hope = composeLetter('I feel hopeless', { history: [{ role: 'assistant', content: fear }] });
    assert.equal(hope.theme, 'Hope');
    assert.match(hope.text, /^Hope is not optimism/);
    assert.ok(!hope.citations.includes('Luke 12:32'), 'must not repeat the fear letter');
  });

  it('walks a room to exhaustion without repeating, then says so', () => {
    const history = [];
    const seen = new Set();
    const turns = [];
    for (let i = 0; i < 8; i++) {
      const letter = composeLetter('I still feel ashamed', { history });
      const filled = verifyAndSubstitute(letter.text);
      turns.push({ citations: letter.citations, filled });
      history.push({ role: 'user', content: 'I still feel ashamed' }, { role: 'assistant', content: filled });
    }
    // Five sentences kept for shame, then the commons, before anything repeats.
    for (const t of turns.slice(0, 6)) {
      for (const c of t.citations) {
        assert.ok(!seen.has(c), `${c} repeated before the room was spent`);
        seen.add(c);
      }
    }
    assert.ok(seen.size >= 11, `only ${seen.size} distinct sayings before exhaustion`);
    const last = turns[turns.length - 1];
    assert.match(last.filled, /every sentence I hold/);
    assert.deepEqual(last.citations, ['Matthew 11:28']);
  });

  it('reads the room opening only on the first turn there', () => {
    const first = composeLetter('I feel so much shame');
    assert.match(first.text, /^Shame says you are the lost sheep/);
    const second = composeLetter('I still feel ashamed', {
      history: [{ role: 'assistant', content: verifyAndSubstitute(first.text) }],
    });
    assert.doesNotMatch(second.text, /lost sheep/);
    assert.match(second.text, /^You have stayed with this/);
    assert.match(second.text, /shepherd to walk\.$/);
  });

  it('moves to the second named need when the first is spent', () => {
    const history = [];
    for (let i = 0; i < 3; i++) {
      const letter = composeLetter('my father died and I cannot forgive him', { history });
      history.push({ role: 'assistant', content: verifyAndSubstitute(letter.text) });
    }
    const fourth = composeLetter('my father died and I cannot forgive him', { history });
    assert.ok(fourth.citations.some((c) => /Matthew 6:14|Luke 6:36|Luke 6:27|Matthew 18:22|Luke 23:34/.test(c)), fourth.citations.join(', '));
  });

  it('reads earlier citations from assistant turns only', () => {
    const seen = citedBefore([
      { role: 'user', content: 'What about John 3:16?' },
      { role: 'assistant', content: '**Luke 15:4**\n“…”' },
    ]);
    assert.deepEqual(seen, ['Luke 15:4']);
  });

  it('keeps five spoken sayings for every room', () => {
    for (const name of themeNames()) {
      const pack = THEMES[name];
      assert.ok(pack.opening && pack.closing, name);
      assert.equal(pack.passages.length + pack.more.length, 5, name);
      for (const p of [...pack.passages, ...pack.more]) {
        assert.ok(isRedLetter(p.verse), `${name}: ${p.verse}`);
        assert.doesNotMatch(p.quote, /^(Then|And) (said|saith|spake) /, `${name}: ${p.verse} keeps a narrator`);
        assert.doesNotMatch(p.quote, /^(Because of your|Therefore|Teaching them)/, `${name}: ${p.verse} starts mid-answer`);
      }
    }
  });
});
