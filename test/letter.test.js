const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { finishLetter } = require('../lib/letter');
const { roomFor, CRISIS_SAFE, CRISIS_BEREAVED_OPENING } = require('../lib/advise');
const { spokenAt, CRISIS_NOTICE, DANGER_NOTICE, POISON_LINE } = require('../lib/scripture');

// What a model might send back, and what the reader must never see because of it.
describe('the room holds whichever composer wrote the letter', () => {
  it('a crisis letter cites only from the safe list, whatever the model chose', () => {
    const q = 'I want to kill myself tonight';
    const out = finishLetter('**John 14:2**\n“In my Father’s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.”\nHe has a room ready.\n\nStay tonight.', q);
    assert.ok(out.startsWith(CRISIS_NOTICE));
    assert.doesNotMatch(out, /mansions|prepare a place|John 14:2\b/);
    assert.match(out, /\*\*John 14:27\*\*/);
    assert.match(out, /Stay tonight\./);
    const devil = finishLetter('Please stay.\n\n**John 8:44**\n“Ye are of your father the devil.”\nctx', q);
    assert.doesNotMatch(devil, /devil|John 8:44/);
    const millstone = finishLetter('**Matthew 18:6**\n“x”\nctx\n\n**John 14:27**\n“Peace I leave with you.”\nHe leaves peace.', 'I hanged myself last year and survived, still want to die');
    assert.doesNotMatch(millstone, /millstone|Matthew 18:6/);
    assert.match(millstone, /\*\*John 14:27\*\*/);
  });

  it('the model is handed the room, not the question\'s keywords', () => {
    const crisis = roomFor('I want to kill myself tonight');
    assert.deepEqual(crisis.allowed, CRISIS_SAFE);
    const hanged = roomFor('I hanged myself last year and survived, still want to die');
    assert.deepEqual(hanged.allowed.filter((c) => /Matthew 18|Luke 17|Mark 9/.test(c)), []);
    const widow = roomFor('My wife of 60 years died last month');
    assert.equal(widow.primary, 'Grief & Loss');
    assert.deepEqual(widow.allowed.filter((c) => /Matthew 5:2[89]|Matthew 5:3[0-2]|Matthew 19/.test(c)), []);
    assert.doesNotMatch(widow.allowed.join(' '), /John 14:1\b|John 14:2\b|John 14:3\b/);
    const rest = roomFor('what did Jesus say about rest');
    assert.ok(rest.allowed.some((c) => /Matthew 11:2[6-8]/.test(c)));
  });

  it('a grief letter keeps to the grief room; a stray citation goes, the room refills when nothing is left', () => {
    const q = 'My wife of 60 years died last month';
    const out = finishLetter('**Matthew 5:31**\n“x”\nctx\n\n**Matthew 5:4**\n“Blessed are they that mourn: for they shall be comforted.”\nComfort is promised.', q);
    assert.doesNotMatch(out, /Matthew 5:31|put away/);
    assert.match(out, /\*\*Matthew 5:4\*\*/);
    const empty = finishLetter('**Matthew 5:31**\n“x”\nctx\n\nGo gently.', q);
    assert.match(empty, /Go gently\./);
    assert.match(empty, /\*\*Matthew 5:4\*\*\n“Blessed are they that mourn/);
  });

  it('never tells the one who hit that it was not their fault', () => {
    const q = 'I hit my wife last night';
    const out = finishLetter('What happened to you is not your fault. You did nothing wrong. Breathe.\n\n**Matthew 11:28**\n“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”\nRest.', q);
    assert.ok(out.startsWith(DANGER_NOTICE));
    assert.doesNotMatch(out, /not your fault|nothing wrong/);
    assert.match(out, /Breathe\./);
    assert.match(out, /\*\*Matthew 11:28\*\*/);
  });

  it('the bereaved get the grief room — with 988 after a suicide, without Poison Control after an overdose', () => {
    const overdose = finishLetter('**Matthew 5:4**\n“Blessed are they that mourn: for they shall be comforted.”\nctx', "my best friend died of an overdose and I feel guilty I didn't stop him");
    assert.ok(!overdose.includes(POISON_LINE), 'Poison Control was offered to the bereaved');
    assert.ok(!overdose.includes('988'), 'the bereaved-by-overdose were treated as the one at risk');
    assert.match(overdose, /\*\*Matthew 5:4\*\*/);
    const suicide = roomFor('My daughter died by suicide last year');
    assert.equal(suicide.crisis, true);
    assert.equal(suicide.bereaved, true);
    assert.equal(suicide.opening, CRISIS_BEREAVED_OPENING);
    assert.equal(suicide.primary, 'Grief & Loss');
    const letter = finishLetter('**Matthew 5:4**\n“' + spokenAt('Matthew', 5, 4) + '”\nctx', 'My daughter died by suicide last year');
    assert.ok(letter.startsWith(CRISIS_NOTICE));
    assert.ok(!letter.includes(POISON_LINE));
    assert.match(letter, /\*\*Matthew 5:4\*\*/);
    // The one who wants to follow is the one at risk.
    const both = roomFor('my brother died by suicide and I want to die too');
    assert.equal(both.bereaved, false);
    assert.deepEqual(both.allowed, CRISIS_SAFE);
  });
});
