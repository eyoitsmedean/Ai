const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { answerAsk, clipMeaning, CANNOT, TRANSLATION } = require('../lib/ask');
const { lookup } = require('../lib/scripture');

describe('clipMeaning', () => {
  it('keeps at most four sentences', () => {
    const text = 'One. Two. Three. Four. Five should drop.';
    const clipped = clipMeaning(text, 4);
    assert.equal(clipped, 'One. Two. Three. Four.');
  });
});

describe('answerAsk', () => {
  it('rejects an empty question', () => {
    const out = answerAsk('   ');
    assert.equal(out.ok, false);
  });

  it('returns a sealed KJV saying for ordinary weight', () => {
    const out = answerAsk('I am afraid of the future');
    assert.equal(out.ok, true);
    assert.equal(out.crisis, false);
    assert.ok(out.words.quote.length > 8);
    assert.match(out.words.citation, /^(Matthew|Mark|Luke|John) /);
    assert.equal(out.words.translation, 'KJV');
    assert.equal(out.translation.label, TRANSLATION.label);
    const sealed = lookup(out.words.citation);
    assert.ok(sealed);
    assert.equal(out.words.quote, sealed.text);
    const sentences = out.meaning.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    assert.ok(sentences.length <= 4);
    assert.match(out.cannot, /not a pastor/i);
    assert.match(CANNOT, /confession/i);
  });

  it('stops counsel on crisis input', () => {
    const out = answerAsk('I want to die');
    assert.equal(out.ok, true);
    assert.equal(out.crisis, true);
    assert.equal(out.stopped, true);
    assert.equal(out.words, null);
    assert.equal(out.meaning, null);
    assert.match(out.helpline.us, /988/);
  });

  it('treats grieving as Grief & Loss, not a crisis', () => {
    const out = answerAsk('I am grieving');
    assert.equal(out.ok, true);
    assert.equal(out.crisis, false);
    assert.equal(out.theme, 'Grief & Loss');
    assert.ok(out.words.quote);
  });

  it('does not answer from Paul', () => {
    const out = answerAsk('What does Paul say about grace?');
    assert.equal(out.ok, true);
    assert.match(out.words.citation, /^(Matthew|Mark|Luke|John) /);
  });
});
