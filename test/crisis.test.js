const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { assessCrisis } = require('../public/data/crisis');

// Real phrasings, as people type them: lowercase, no apostrophes, curly
// quotes from phones, slang. Each one must reach a helpline.
const SELF_EN = [
  'I feel suicidal',
  'thinking about suicide again',
  'I want to kill myself',
  'i have been self-harming',
  'I keep cutting myself',
  'I want to end it all',
  'I just want to die',
  'i wanna die',
  'i dont want to live anymore',
  'I don’t want to be here anymore',
  'I do not want to wake up tomorrow',
  'I can’t go on',
  'I cant keep going like this',
  'there is no reason to live',
  'no point in living',
  'I have nothing to live for',
  'everyone would be better off without me',
  'I would be better off dead',
  'I wish I was dead',
  'I wish I had never been born',
  'I want to unalive myself',
  'thinking of how to take my own life',
  'planning to overdose tonight',
  'I saved pills to end it',
  'I want to jump off the bridge',
  'honestly kms',
];

const SELF_ES = [
  'quiero morir',
  'Quiero morirme',
  'me quiero matar',
  'pienso en matarme',
  'quiero quitarme la vida',
  'voy a acabar con mi vida',
  'ya no quiero vivir',
  'no quiero seguir viviendo',
  'ya no quiero estar aquí',
  'pienso en suicidarme',
  'me corto, quiero hacerme daño',
  'estaría mejor muerta',
  'no tengo razón para vivir',
];

const DANGER = [
  ['my husband hits me', 'en'],
  ['he chokes me when he is angry', 'en'],
  ['she threatened to kill me', 'en'],
  ['I am not safe at home', 'en'],
  ['I am afraid for my life', 'en'],
  ['mi esposo me pega', 'es'],
  ['me va a matar, tengo miedo', 'es'],
  ['no estoy segura en mi casa', 'es'],
];

// Heavy days that are not a crisis. A helpline here would feel like being
// handled, not heard.
const NOT_CRISIS = [
  'I am tired of work',
  'I feel lonely tonight',
  'my dad died last year and I miss him',
  'this job is killing me',
  'I am dying to see my grandkids',
  'I am anxious about the exam',
  'I feel ashamed of what I said',
  'I cannot forgive my brother',
  'my marriage is falling apart',
  'I lost my job and I am scared',
  'I have no energy to live the way I used to',
  'How should I live my life?',
  'what did Jesus say about death?',
  'Lazarus died and Jesus wept',
  'estoy cansada del trabajo',
  'me siento sola',
  'mi madre murió el año pasado',
  'no me quiero ir de casa',
];

describe('crisis language', () => {
  for (const text of SELF_EN) {
    it(`reaches a helpline: ${text}`, () => {
      assert.deepEqual(assessCrisis(text), { kind: 'self', lang: 'en' });
    });
  }
  for (const text of SELF_ES) {
    it(`reaches a helpline in Spanish: ${text}`, () => {
      assert.deepEqual(assessCrisis(text), { kind: 'self', lang: 'es' });
    });
  }
  for (const [text, lang] of DANGER) {
    it(`sees someone else as the danger: ${text}`, () => {
      assert.deepEqual(assessCrisis(text), { kind: 'danger', lang });
    });
  }
  for (const text of NOT_CRISIS) {
    it(`lets a heavy day be a heavy day: ${text}`, () => {
      assert.equal(assessCrisis(text), null);
    });
  }
  it('treats self-harm as the first need when both are present', () => {
    assert.equal(assessCrisis('he hits me and I want to die').kind, 'self');
  });
  it('keeps English when English sentences use no and me', () => {
    assert.equal(assessCrisis('I want to kill myself, no one cares about me').lang, 'en');
  });
});

describe('pooled crisis corpus (npm run eval:crisis)', () => {
  const { rows } = require('./fixtures/crisis-corpus.json');
  const visible = rows.filter((r) => !r.heldOut);
  const rate = (list) => list.filter((r) => assessCrisis(r.text)).length / list.length;

  // Floors, not targets: lowering one needs a reason in the commit.
  it('reaches help for at least 95% of crisis and danger messages', () => {
    assert.ok(rate(visible.filter((r) => r.expect === 'crisis')) >= 0.95);
    assert.ok(rate(visible.filter((r) => r.expect === 'danger')) >= 0.95);
  });

  it('raises no alarm on ordinary messages, idioms and denials', () => {
    const alarms = visible.filter((r) => r.expect === 'none' && assessCrisis(r.text)).map((r) => r.text);
    assert.deepEqual(alarms, []);
  });

  it('sends sexual violence to RAINN and fear for someone else to 988', () => {
    assert.equal(assessCrisis('I was raped in college and never told anyone').kind, 'assault');
    assert.equal(assessCrisis('my son says he wants to die').kind, 'other');
  });
});
