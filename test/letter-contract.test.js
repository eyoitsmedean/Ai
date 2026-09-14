const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { composeLetter, letterPassesFloor, VOICE } = require('../lib/counsel');
const { letterPassesContract, PERSONA } = require('../lib/letter-contract');
const { verifyAndSubstitute, CRISIS_NOTICE, ABUSE_NOTICE } = require('../lib/scripture');

describe('letter contract', () => {
  it('every offline everyday letter passes the contract', () => {
    for (const q of [
      'I can\'t stop worrying about money. Rent is due and I don\'t have it.',
      'My boss wants me to lie to a customer.',
      'What is the capital of France?',
    ]) {
      const letter = verifyAndSubstitute(composeLetter(q));
      const result = letterPassesContract(letter, { outOfRoom: q.includes('France') });
      assert.ok(result.ok, `${q} → ${result.failures.join(',')}`);
    }
  });

  it('fails a pastor impersonation even if a verse is present', () => {
    const letter = 'As your pastor I forgive you.\n\n**John 14:27**\n“Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.”';
    assert.ok(PERSONA.test(letter));
    assert.ok(!letterPassesContract(verifyAndSubstitute(letter)).ok);
  });

  it('a served crisis letter must open with the human door', () => {
    const body = verifyAndSubstitute(composeLetter('I want to die'));
    assert.ok(letterPassesFloor(body));
    assert.ok(!letterPassesContract(body, { crisis: true }).ok, 'body alone is not the served letter');
    const served = `${CRISIS_NOTICE}\n${body}`;
    assert.deepEqual(letterPassesContract(served, { crisis: true }).failures, []);
  });

  it('a served abuse letter fails if enemy-love is cited', () => {
    const poisoned = `${ABUSE_NOTICE}\n${VOICE.Integrity.hear}\n\n**Matthew 5:44**\n“Love your enemies, bless them that curse you.”\n`;
    assert.ok(letterPassesContract(poisoned, { abuse: true }).failures.includes('no_enemy_love')
      || letterPassesContract(poisoned, { abuse: true }).failures.includes('floor'));
  });
});
