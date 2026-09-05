const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { lookup, extractSpoken, verifyQuote, frameShape } = require('../lib/scripture');
const { audit } = require('../scripts/audit-spoken');

const ROOT = path.join(__dirname, '..');

/* Pronoun frames that are His words: inside a parable Jesus narrates other speakers.
   Anything the audit finds that is not on this list is a leak and fails the build. */
const REVIEWED_PARABLE_SPEECH = {
  'Matthew 12:44': 'the unclean spirit, in the parable of the empty house',
  'Matthew 22:8': 'the king, in the parable of the wedding feast',
  'Matthew 25:22': 'the servant with two talents',
  'Matthew 25:24': 'the servant with one talent',
  'Luke 13:7': 'the owner, in the parable of the fig tree',
  'Luke 13:8': 'the dresser of the vineyard',
  'Luke 15:29': 'the elder brother, in the parable of the prodigal',
  'Luke 16:2': 'the rich man, in the parable of the unjust steward',
  'Luke 16:5': 'the steward',
  'Luke 16:24': 'the rich man in torment',
  'Luke 19:13': 'the nobleman, in the parable of the pounds',
  'John 7:38': 'His own sentence — "He that believeth on me, as the scripture hath said"',
};

describe('spoken corpus: the frame is cut, the words are kept', () => {
  const result = audit();

  it('never opens a red letter with the evangelist naming the speaker', () => {
    assert.deepEqual(result.named.map((r) => `${r.citation}: ${r.text.slice(0, 60)}`), []);
  });

  it('every remaining "he said" frame is reviewed parable speech', () => {
    const unreviewed = result.pronoun
      .filter((r) => !REVIEWED_PARABLE_SPEECH[r.citation])
      .map((r) => `${r.citation}: ${r.text.slice(0, 70)}`);
    assert.deepEqual(unreviewed, []);
    const stale = Object.keys(REVIEWED_PARABLE_SPEECH).filter((c) => !result.pronoun.some((r) => r.citation === c));
    assert.deepEqual(stale, [], 'reviewed entries that the audit no longer finds');
  });

  it('cuts frames the old literal list missed', () => {
    assert.match(lookup('John 20:21').text, /^Peace be unto you: as my Father hath sent me/);
    assert.match(lookup('Luke 5:31').text, /^They that are whole need not a physician/);
    assert.match(lookup('Luke 13:2').text, /^Suppose ye that these Galilaeans/);
    assert.match(lookup('Mark 10:14').text, /^Suffer the little children to come unto me/);
    assert.match(lookup('Matthew 15:32').text, /^I have compassion on the multitude/);
    assert.equal(lookup('John 19:28').text, 'I thirst.');
    assert.equal(lookup('John 1:43').text, 'Follow me.');
  });

  it('keeps His own narration whole where the old "saying" rule cut it', () => {
    assert.match(lookup('Matthew 6:31').text, /^Therefore take no thought, saying, What shall we eat/);
    assert.match(lookup('Matthew 18:26').text, /^The servant therefore fell down/);
    assert.match(lookup('Matthew 25:37').text, /^Then shall the righteous answer him, saying/);
    assert.match(lookup('Luke 19:16').text, /^Then came the first, saying/);
    assert.match(lookup('Matthew 21:37').text, /^But last of all he sent unto them his son/);
  });

  it('still cuts the narrator "saying" frame after a red verse', () => {
    assert.match(lookup('Matthew 26:39').text, /^O my Father, if it be possible/);
    assert.match(lookup('Matthew 26:42').text, /^O my Father, if this cup may not pass/);
    assert.equal(lookup('Luke 22:20').text, 'This cup is the new testament in my blood, which is shed for you.');
    assert.match(lookup('Matthew 13:24').text, /^The kingdom of heaven is likened unto a man/);
  });

  it('does not confuse a parable\'s lord or a quoted Psalm with the evangelist\'s "the Lord"', () => {
    assert.match(lookup('Matthew 20:8').text, /^So when even was come, the lord of the vineyard saith/);
    assert.match(lookup('Luke 14:23').text, /^And the lord said unto the servant/);
    assert.match(lookup('Matthew 22:44').text, /^The LORD said unto my Lord/);
    assert.match(lookup('Mark 14:14').text, /The Master saith, Where is the guestchamber/);
    assert.match(lookup('Luke 13:15').text, /^Thou hypocrite, doth not each one of you/);
  });

  it('drops the ruler of the synagogue and the voice from heaven', () => {
    assert.equal(lookup('Luke 13:14'), null);
    assert.equal(lookup('John 12:28').text, 'Father, glorify thy name.');
    assert.equal(lookup('Mark 4:2'), null);
  });

  it('honours the block guard for pronoun frames', () => {
    const text = 'And he said unto them, Come ye after me.';
    assert.equal(extractSpoken(text, null, { previousRed: false }), 'Come ye after me.');
    assert.equal(extractSpoken(text, null, { previousRed: true }), text);
    assert.equal(extractSpoken('And Jesus said unto them, Come ye after me.', null, { previousRed: true }), 'Come ye after me.');
  });

  it('frameShape names the shapes the audit reports', () => {
    assert.equal(frameShape('And Jesus answering said unto them, Have faith in God.'), 'named');
    assert.equal(frameShape('Then said he unto them, Nation shall rise against nation'), 'pronoun');
    assert.equal(frameShape('Peace, be still.'), null);
  });

  it('keeps the curated pages verifiable after the rebuild', () => {
    const src = fs.readFileSync(path.join(ROOT, 'data', 'curated.js'), 'utf8');
    const refs = [...src.matchAll(/"(?:passage|quote)":\s*"((?:[^"\\]|\\.)+)",\s*"verse":\s*"([^"]+)"/g)];
    assert.ok(refs.length >= 56, `curated pages carry ${refs.length} verse + text pairs; expected 28 words and 28 affirmations`);
    const failing = refs
      .map(([, passage, verse]) => ({ verse, ok: verifyQuote(verse, JSON.parse(`"${passage}"`)) }))
      .filter((r) => !r.ok.ok || r.ok.score < 0.6)
      .map((r) => `${r.verse} (${r.ok.reason || r.ok.score})`);
    assert.deepEqual(failing, []);
  });

  it('override file keys are real citations and the public library mirrors the corpus', () => {
    const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'spoken-overrides.json'), 'utf8')).verses;
    for (const [cite, text] of Object.entries(overrides)) {
      assert.match(cite, /^(Matthew|Mark|Luke|John) \d+:\d+$/);
      assert.equal(typeof text, 'string');
    }
    const lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'library.json'), 'utf8'));
    const john2021 = lib.sayings.find((s) => s.book === 'John' && s.chapter === 20 && s.start <= 21 && s.end >= 21);
    assert.ok(john2021, 'John 20:21 is in the library');
    assert.doesNotMatch(john2021.text, /Then said Jesus/);
  });
});
