const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { OUT_OF_ROOM, CRISIS_BODY, VOICE } = require('../lib/counsel');

const ROOT = path.join(__dirname, '..');

function loadAdvisor() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', 'advisor.js'), 'utf8'), ctx, { filename: 'advisor.js' });
  return ctx.window;
}

const win = loadAdvisor();

describe('the client lamp-out letter', () => {
  it('says plainly when the question does not reach His words', () => {
    for (const q of ['What is the capital of France?', 'Write me a python script', 'What is Bitcoin?']) {
      const letter = win.RLA_advise(q);
      assert.ok(letter.startsWith(OUT_OF_ROOM.hear), q);
      assert.ok(letter.includes(OUT_OF_ROOM.close), q);
      assert.doesNotMatch(letter, /Psalm 23|Paul|Bitcoin/);
    }
  });

  it('a crisis line gets company, never a scope disclaimer and never a second 988 block', () => {
    const letter = win.RLA_advise('I want to die', { crisis: true });
    assert.ok(letter.startsWith(CRISIS_BODY.hear));
    assert.ok(letter.endsWith(CRISIS_BODY.close));
    assert.ok(!letter.includes(OUT_OF_ROOM.hear));
    assert.doesNotMatch(letter, /988/);
  });

  it('reads the need from the writer’s words', () => {
    const cases = [
      ['I am so worried about rent', 'I hear the spiral'],
      ['My mom died three weeks ago', 'Grief is not a failure of faith'],
      ['I feel so much shame', 'Shame wants you out of the room'],
    ];
    for (const [text, hear] of cases) {
      assert.ok(win.RLA_advise(text).startsWith(hear), text);
    }
  });

  it('keeps the same voice lines as the server', () => {
    for (const [theme, v] of Object.entries(VOICE)) {
      assert.ok(Object.values(win).length >= 0);
      const src = fs.readFileSync(path.join(ROOT, 'data', 'advisor.js'), 'utf8');
      assert.ok(src.includes(v.hear), theme);
      assert.ok(src.includes(v.close), theme);
    }
  });
});
