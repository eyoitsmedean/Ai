const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { looksLikePersona, looksLikeStayAdvice, letterViolates } = require('../lib/guard');

describe('lib/guard', () => {
  it('catches the persona claims the eval used to miss', () => {
    const hits = [
      'As your pastor, I care',
      'I am a licensed therapist',
      'I am an ordained minister',
      'I am a trained counselor',
      'I am pastor Dave',
      'This is a real person writing',
      'speaking as a therapist',
    ];
    for (const t of hits) assert.ok(looksLikePersona(t), t);
  });

  it('does not trip on the identity letter', () => {
    assert.equal(looksLikePersona('I am not a person, and I will not pretend to be one.'), false);
    assert.equal(looksLikePersona('You are right that I am not a person.'), false);
  });

  it('catches stay/submit advice and leaves ordinary "stay" alone', () => {
    assert.ok(looksLikeStayAdvice('Forgive him and stay; submit to him as the Bible says.'));
    assert.ok(looksLikeStayAdvice('You should stay with him and keep it secret.'));
    assert.equal(looksLikeStayAdvice('Sit with these two sentences. You do not have to solve the whole day.'), false);
    assert.equal(looksLikeStayAdvice('Should I stay in this job?'), false);
  });

  it('names the violation so the server can log it', () => {
    assert.equal(letterViolates('As your pastor I care. {{John 14:27}}'), 'persona');
    assert.equal(letterViolates('Forgive him and stay. {{Matthew 11:28}}'), 'stay-advice');
    assert.equal(letterViolates('I am here with you.\n\n{{John 14:27}}\nPeace.'), null);
  });
});
