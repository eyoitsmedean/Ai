const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const letters = require('../lib/letters');
const fs = require('fs');
const path = require('path');
const { lookup, verifyAndSubstitute } = require('../lib/scripture');
const { dailySystem } = require('../lib/prompts');
const { judgeQuote } = require('../lib/report');

describe('lib/letters contracts', () => {
  it('every marker in every exported letter is a red-letter saying', () => {
    const count = letters.selfCheckCuratedCitations();
    assert.ok(count >= 40, count);
  });

  it('boundary / hostile / greeting / identity carry only the Matthew 11:28 door', () => {
    for (const name of ['BOUNDARY_LETTER', 'HOSTILE_LETTER', 'GREETING_LETTER', 'IDENTITY_LETTER']) {
      const markers = [...letters[name].matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
      assert.deepEqual(markers, ['Matthew 11:28'], name);
    }
  });

  it('safety follow-up never uses the forgiveness-condition verse', () => {
    assert.doesNotMatch(letters.DANGER_FOLLOWUP_LETTER, /forgive not|neither will your Father/);
    assert.doesNotMatch(letters.DANGER_LETTER, /forgive not|neither will your Father/);
  });

  it('chatSafety carries a disclosure when the full conversation is passed', () => {
    const followup = 'Should I forgive him and stay?';
    const messages = [
      { role: 'user', content: 'My husband hits me when he drinks.' },
      { role: 'assistant', content: 'You named it.' },
      { role: 'user', content: followup },
    ];
    assert.deepEqual(letters.chatSafety(messages, followup), { kind: 'danger', carried: true });
  });

  it('chatSafety treats a bare thanks after a disclosure as a greeting', () => {
    const thanks = 'ok thanks';
    const messages = [
      { role: 'user', content: 'My husband hits me when he drinks.' },
      { role: 'assistant', content: 'You named it.' },
      { role: 'user', content: thanks },
    ];
    assert.deepEqual(letters.chatSafety(messages, thanks), { kind: null, carried: false });
  });
});

describe('offline safety pack', () => {
  it('fills every marker, stays red-letter, and matches the committed JSON', () => {
    const pack = letters.buildSafetyPack();
    assert.equal(pack.translation, 'KJV');
    assert.equal(pack.kinds.assault.followup, verifyAndSubstitute(letters.DANGER_FOLLOWUP_LETTER));
    for (const kind of ['crisis', 'danger', 'assault']) {
      const entry = pack.kinds[kind];
      assert.doesNotMatch(entry.letter, /\{\{/);
      assert.doesNotMatch(entry.followup, /\{\{/);
      assert.match(entry.letter, /\*\*(Matthew|Mark|Luke|John) \d+:\d+/);
      assert.match(entry.notice, /findahelpline\.com/);
    }
    assert.doesNotMatch(pack.kinds.greeting.letter, /\{\{/);
    assert.match(pack.kinds.greeting.letter, /\*\*Matthew 11:28\*\*/);
    assert.match(pack.kinds.crisis.notice, /988/);
    assert.match(pack.kinds.danger.notice, /1-800-799-7233/);
    assert.match(pack.kinds.assault.notice, /1-800-656-4673/);
    const onDisk = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'safety-pack.json'), 'utf8'));
    assert.deepEqual(onDisk, pack);
  });
});

describe('lib/prompts and lib/report', () => {
  it('Daily prompt carries the date it is asked for', () => {
    const a = dailySystem(new Date(2026, 0, 1));
    const b = dailySystem(new Date(2026, 11, 25));
    assert.match(a, /Thu Jan 01 2026/);
    assert.match(b, /Fri Dec 25 2026/);
  });

  it('judgeQuote reports a mismatch honestly', () => {
    const wrong = judgeQuote('John 14:27', 'Fear not, the sky is green.');
    assert.equal(wrong.verified, false);
    assert.equal(wrong.reason, 'quote-mismatch');
    assert.match(wrong.quote, /^Peace I leave with you/);
    assert.equal(judgeQuote('John 11:35', 'Jesus wept.').reason, 'not-red-letter');
    assert.equal(lookup('Matthew 11:28').redLetter, true);
  });
});
