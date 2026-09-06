const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { looksLikeCrisis } = require('../lib/scripture');

/* The sentences a person actually types at 2 a.m. Every one of these must
   open the human-help notice before any scripture. The second block came
   from a separate Breaker pass on 6 Sep 2026 that found 38 misses. */
const MUST_TRIGGER = [
  'I want to die',
  'i wanna die',
  'I WANT TO DIE',
  'I am going to kill myself tonight',
  'im gonna kill my self',
  'thinking about ending my life',
  'I don\'t want to live anymore',
  'I have been cutting myself again',
  'I think I took too many pills',
  'I took a bunch of pills an hour ago',
  'I swallowed all my pills',
  'everyone would be better off without me',
  'I don\'t want to be here anymore',
  'I\'ve been thinking about ending it all',
  'I am planning to end things this weekend',
  'my life isn\'t worth living',
  'I wish I was dead',
  'I wish I were dead',
  'I\'m going to jump off the bridge',
  'I want to hurt someone',
  'I want to hurt my kids',
  'I am going to kill him',
  'I want to kill my wife',
  'my husband hits me and I am scared',
  'my wife hits me',
  'he beats me and says he will kill me if I leave',
  'my boyfriend choked me last night',
  'I want to unalive myself',
  'there is no reason to live',
  'I would be better off dead',
  'why shouldn\'t I just kill myself',
  // Breaker pass
  'I\'m so tired of being alive',
  'I keep thinking everyone would be happier if I wasn\'t around',
  'I don\'t think I\'ll be here next week',
  'what does Jesus say about someone who is planning to not wake up tomorrow',
  'I\'m done. I can\'t do this anymore. tonight is the night',
  'I want to kms',
  'honestly wanna unalive rn',
  'I have the gun in my hand right now',
  'I am going to end it',
  'i dont wanna live anymore',
  'I want to kill myslef',
  'I feel sucidal',
  'no point living anymore',
  'life is not worth it anymore',
  'my life is worthless and pointless and I should just disappear forever',
  'they\'d be better off if I was gone',
  'i cut again last night',
  'I burned myself on purpose again',
  'I took the whole bottle of tylenol',
  'I took 40 tylenol an hour ago',
  'I OD\'d last night and I\'m scared',
  'I drank a bottle of bleach',
  'he threw me against the wall and I have bruises',
  'my boyfriend put his hands around my throat',
  'he says he\'ll kill me if I leave',
  'he said he would kill me',
  'my dad beats my mom',
  'he keeps hitting me',
  'my stepdad touches me and I can\'t tell anyone',
  'I\'m going to shoot up my school tomorrow',
  'I want to strangle my baby when she cries',
  'so I\'ve been reading Matthew a lot and my pastor says God has a plan but honestly I dont think im going to be around much longer, what does Jesus say about heaven',
  'I don`t want to live anymore',
  'I don´t want to live anymore',
  'quiero morirme',
  'no quiero vivir más',
  'mi esposo me golpea',
];

/* Ordinary grief, anger, idiom, Bible history, and "die to self" theology.
   None of these should get the notice. */
const MUST_NOT_TRIGGER = [
  'I am afraid of the future',
  'my father died last month and I miss him',
  'I am dying to know what Jesus said about money',
  'my marriage feels dead',
  'I killed it in my interview today, thank you God',
  'my plants keep dying no matter what I do',
  'I am so tired of my job',
  'how do I forgive my brother',
  'what did Jesus say about anxiety',
  'I feel like a failure as a parent',
  'my dog died',
  'I am angry at God',
  'Jesus died on the cross for us, right?',
  'I want to live a better life',
  'I can\'t sleep',
  'this job is killing me',
  'I\'m dead tired',
  'just killing time before church',
  'how did the Romans kill Jesus',
  'did Judas hang himself',
  'my grandmother is dying',
  'hanging in there',
  'my mom is gonna kill me when she sees my grades',
  'my boss will kill me if I\'m late again',
  // Breaker pass
  'Herod wanted to kill him as a baby, why',
  'the Pharisees wanted to kill him after he healed on the sabbath',
  'I want to die to my old self like Jesus talked about',
  'I want to be dead to sin like Paul says',
  'I don\'t want to live in fear anymore',
  'I don\'t want to live like this anymore, always angry at my kids',
  'how do I end things with my boyfriend the Christian way',
  'the hurricane hit me hard financially',
  'the sermon really hit me today',
  'he hit me up on Instagram after ten years, should I respond',
  'my son beat me at chess',
  'I\'m cutting myself off from social media for Lent',
  'I\'m cutting my hours at work, is it wrong to want rest',
  'I am cutting my hair',
  'I hurt my back and can\'t go to church',
  'I hurt my daughter\'s feelings and she won\'t speak to me',
  'the movie about the martyrs shows them hanging people, why did God allow that',
  'hanging my pictures',
  'shooting my film',
  'I took all my meds this morning like the doctor said and still feel anxious',
  'Jesus said take up your cross, what does that mean',
  'I want to end the fight with my sister',
];

describe('looksLikeCrisis', () => {
  it('catches the sentences people actually type', () => {
    const missed = MUST_TRIGGER.filter((t) => !looksLikeCrisis(t));
    assert.deepEqual(missed, [], `missed: ${missed.join(' | ')}`);
  });

  it('leaves ordinary grief, idiom, Bible history, and theology alone', () => {
    const wrong = MUST_NOT_TRIGGER.filter((t) => looksLikeCrisis(t));
    assert.deepEqual(wrong, [], `false positives: ${wrong.join(' | ')}`);
  });

  it('is safe on empty, odd, and very long input', () => {
    assert.equal(looksLikeCrisis(''), false);
    assert.equal(looksLikeCrisis(null), false);
    assert.equal(looksLikeCrisis(undefined), false);
    assert.equal(looksLikeCrisis(12), false);
    const t0 = Date.now();
    looksLikeCrisis('took '.repeat(400));
    looksLikeCrisis('a'.repeat(2000));
    looksLikeCrisis('kill kill '.repeat(200));
    assert.ok(Date.now() - t0 < 200, 'pathological input must not backtrack');
  });
});
