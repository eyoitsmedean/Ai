const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { composeLetter, themesFor, VOICE, OUT_OF_ROOM } = require('../lib/counsel');
const { verifyAndSubstitute, lookup, parseRef, looksLikeCrisis } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');

describe('the lamp-out letter', () => {
  it('reads the need from the writer\u2019s words', () => {
    const cases = [
      ['My mom died three weeks ago and I feel nothing at all', 'Grief & Loss'],
      ['We lost the baby at 14 weeks', 'Grief & Loss'],
      ['I got fired and I haven\'t told my wife. I feel like such a failure.', 'Shame & Guilt'],
      ['My dad was cruel to us growing up. I still hate him.', 'Forgiveness'],
      ['I go to church every week and feel completely invisible there', 'Loneliness'],
      ['The doctor said stage 3.', 'Suffering & Pain'],
      ['I have no idea what to do with my life', 'Purpose & Direction'],
      ['I am so worried about rent', 'Anxiety & Worry'],
      ['i am so lonely', 'Loneliness'],
      ['is god even real', 'Faith & Doubt'],
    ];
    for (const [text, room] of cases) assert.equal(themesFor(text)[0], room, text);
  });

  it('"still" no longer summons the Peace room', () => {
    assert.ok(!themesFor('I still hate him').includes('Peace'));
    assert.equal(themesFor('how do I find peace in the chaos')[0], 'Peace');
  });

  it('every letter cites only His words and quotes the corpus exactly', () => {
    const { questions } = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval', 'questions.json'), 'utf8'));
    for (const q of questions) {
      const letter = verifyAndSubstitute(composeLetter(q.text));
      const lines = letter.split('\n');
      const cites = lines.map((l, i) => [l.trim().match(/^\*\*([^*]+)\*\*$/), i]).filter(([m]) => m);
      assert.ok(cites.length >= 2, `#${q.id} has scripture`);
      for (const [m, i] of cites) {
        const hit = lookup(parseRef(m[1]));
        assert.ok(hit && hit.redLetter, `#${q.id} ${m[1]} is His`);
        assert.equal(lines[i + 1].trim(), `“${hit.text}”`, `#${q.id} ${m[1]} quotes the corpus`);
      }
      assert.doesNotMatch(letter, /\{\{|\[text to be inserted/, `#${q.id} has no unfilled marker`);
    }
  });

  it('says plainly when the question does not reach His words', () => {
    for (const q of ['What is the capital of France?', 'Write me a python script', 'Quote Psalm 23 for me', 'Prove Jesus existed.']) {
      const letter = composeLetter(q);
      assert.ok(letter.startsWith(OUT_OF_ROOM.hear), q);
      assert.doesNotMatch(letter, /Psalm 23|Paul/);
    }
  });

  it('uses the same voice as the client\u2019s offline advisor', () => {
    const client = fs.readFileSync(path.join(ROOT, 'public', 'data', 'advisor.js'), 'utf8');
    for (const [theme, v] of Object.entries(VOICE)) {
      assert.ok(client.includes(v.hear), `${theme} hear line is in data/advisor.js`);
      assert.ok(client.includes(v.close), `${theme} close line is in data/advisor.js`);
    }
  });

  it('client and server agree on what a crisis sounds like', () => {
    const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    const client = html.match(/function looksLikeCrisisClient\(text\) \{\n\s+return (\/.*\/i)\.test/);
    const server = fs.readFileSync(path.join(ROOT, 'lib', 'scripture.js'), 'utf8').match(/function looksLikeCrisis\(text\) \{\n[^\n]*\n\s+return (\/.*\/i)\.test/);
    assert.ok(client && server, 'both detectors found');
    assert.equal(client[1], server[1]);
    for (const t of ['I want to die', 'I have the pills next to me and I don\'t want to be here anymore', 'Nobody would notice if I disappeared', 'I just want to end it all']) {
      assert.ok(looksLikeCrisis(t), t);
    }
    for (const t of ['My dog died', 'I could die laughing', 'the deadline is killing me']) assert.ok(!looksLikeCrisis(t), t);
  });
});
