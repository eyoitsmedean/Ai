const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { guessThemes, retrieveSayings } = require('../lib/retrieve');

describe('guessThemes', () => {
  it('matches inflected forms of the cue stems', () => {
    assert.deepEqual(guessThemes('I cannot forgive my brother'), ['Forgiveness']);
    assert.deepEqual(guessThemes('I am so anxious and worried'), ['Anxiety & Worry']);
    assert.deepEqual(guessThemes('I feel lonely'), ['Loneliness']);
    assert.deepEqual(guessThemes('she abandoned us'), ['Loneliness']);
    assert.deepEqual(guessThemes('my mother died'), ['Grief & Loss']);
  });

  it('keeps the primary theme first when several apply', () => {
    assert.deepEqual(guessThemes('I am afraid of the future'), ['Fear', 'Hope']);
  });

  it('returns nothing for unrelated text', () => {
    assert.deepEqual(guessThemes('what time is the meeting'), []);
  });
});

describe('retrieveSayings', () => {
  it('boosts sayings from the guessed theme', () => {
    const { themes, sayings } = retrieveSayings('I cannot forgive my brother');
    assert.deepEqual(themes, ['Forgiveness']);
    assert.ok(sayings.length >= 3);
    assert.ok(sayings.slice(0, 3).some((s) => /forgiv/i.test(s.text)), sayings.map((s) => s.citation).join(', '));
  });

  it('always returns something to cite', () => {
    const { sayings } = retrieveSayings('zzzz qqqq');
    assert.ok(sayings.length >= 1);
  });
});
