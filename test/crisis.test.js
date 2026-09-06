const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { looksLikeCrisis } = require('../lib/scripture');

/* The sentences a person actually types at 2 a.m. Every one of these must
   open the human-help notice before any scripture. */
const MUST_TRIGGER = [
  'I want to die',
  'i wanna die',
  'I am going to kill myself tonight',
  'thinking about ending my life',
  'I don\'t want to live anymore',
  'I have been cutting myself again',
  'I think I took too many pills',
  'I took a bunch of pills an hour ago',
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
  'my husband hits me and I am scared',
  'he beats me and says he will kill me if I leave',
  'my boyfriend choked me last night',
  'I want to unalive myself',
  'there is no reason to live',
  'I would be better off dead',
];

/* Ordinary grief, anger, and idiom. None of these should get the notice. */
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
];

describe('looksLikeCrisis', () => {
  it('catches the sentences people actually type', () => {
    const missed = MUST_TRIGGER.filter((t) => !looksLikeCrisis(t));
    assert.deepEqual(missed, [], `missed: ${missed.join(' | ')}`);
  });

  it('leaves ordinary grief, idiom, and theology alone', () => {
    const wrong = MUST_NOT_TRIGGER.filter((t) => looksLikeCrisis(t));
    assert.deepEqual(wrong, [], `false positives: ${wrong.join(' | ')}`);
  });

  it('is safe on empty and odd input', () => {
    assert.equal(looksLikeCrisis(''), false);
    assert.equal(looksLikeCrisis(null), false);
    assert.equal(looksLikeCrisis(undefined), false);
    assert.equal(looksLikeCrisis(12), false);
  });
});
