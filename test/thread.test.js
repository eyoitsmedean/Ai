const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractGospelRefs,
  looksLikeFollowUp,
  looksVagueGuidance,
  guessThemeFromThread,
  verseObject,
  classifyIntent,
  offlineContinuedReply,
} = require('../data/scripture');

test('extractGospelRefs finds Matthew Mark Luke John only', () => {
  const refs = extractGospelRefs('See **Matthew 6:34** and John 14:27 then Romans 8:28');
  assert.deepEqual(refs, ['Matthew 6:34', 'John 14:27']);
});

test('looksVagueGuidance is only short Hope, never crisis', () => {
  assert.equal(looksVagueGuidance('help'), true);
  assert.equal(looksVagueGuidance("I can't sleep because I'm terrified about losing my job next month."), false);
  assert.equal(looksVagueGuidance('I want to kill myself'), false);
});

test('looksLikeFollowUp catches short continuations', () => {
  assert.equal(looksLikeFollowUp('What about my kids?'), true);
  assert.equal(looksLikeFollowUp('and my marriage'), true);
  assert.equal(looksLikeFollowUp("I can't sleep because I'm terrified about losing my job next month."), false);
});

test('guessThemeFromThread continues the last saying on a follow-up', () => {
  const messages = [
    { role: 'user', content: "I can't sleep because I'm terrified about losing my job." },
    { role: 'assistant', content: '**Matthew 6:34**\n"Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself."\n' },
    { role: 'user', content: 'What about my kids?' },
  ];
  const out = guessThemeFromThread(messages[2].content, messages);
  assert.equal(out.theme, 'Anxiety & Worry');
  assert.equal(out.continuedTheme, 'Anxiety & Worry');
  assert.ok(out.continuedRefs.includes('Matthew 6:34'));
});

test('crisis still wins on a follow-up turn', () => {
  assert.equal(classifyIntent('I want to kill myself'), 'crisis');
});

test('offlineContinuedReply leads with the prior saying, not a first-visit pack', () => {
  const thread = guessThemeFromThread('What about my kids?', [
    { role: 'user', content: 'I am terrified about losing my job.' },
    { role: 'assistant', content: '**Matthew 6:34**\n"Therefore don’t be anxious for tomorrow."\n' },
    { role: 'user', content: 'What about my kids?' },
  ]);
  const pack = offlineContinuedReply(thread, 'What about my kids?');
  assert.match(pack.opener, /Still with Matthew 6:34/);
  assert.match(pack.opener, /What about my kids/);
  assert.equal(pack.passages[0].verse, 'Matthew 6:34');
});

test('verseObject returns WEB link and neighbors for Matthew 6:34', () => {
  const obj = verseObject('Matthew 6:34');
  assert.ok(obj);
  assert.equal(obj.verse, 'Matthew 6:34');
  assert.match(obj.webUrl, /ebible\.org\/eng-web\/MAT06\.htm#V34/);
  assert.ok(obj.text.includes('anxious for tomorrow') || obj.text.includes('don’t be anxious'));
});
