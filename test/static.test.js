/* What GitHub Pages ships must be the same corpus-verified text the server serves. */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { artifacts } = require('../scripts/build-curated');
const { verifyQuote, isRedLetter, lookup } = require('../lib/scripture');
const press = require('../data/letterpress');
const { THEMES, COMMONS, themeNames } = require('../lib/curated');

const ROOT = path.join(__dirname, '..');

// Values built inside the vm sandbox carry another realm's prototypes; compare by value.
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadBrowserGlobals() {
  const window = {};
  const sandbox = { window, self: window, module: undefined };
  sandbox.globalThis = sandbox;
  for (const name of ['curated.js', 'letterpress.js', 'advisor.js', 'paths.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'public', 'data', name), 'utf8');
    vm.runInNewContext(src, sandbox);
  }
  return window;
}

// A quote is honest when it is the canonical text, letter for letter, or an unaltered excerpt of it.
function assertCanonical(verse, quote, where) {
  const v = verifyQuote(verse, quote);
  assert.ok(v.ok, `${where}: ${verse} is not a spoken saying (${v.reason})`);
  const canon = lookup(verse).text.toLowerCase();
  const shipped = String(quote).toLowerCase().replace(/[.:;,!?]+$/, '');
  assert.ok(canon.includes(shipped), `${where}: ${verse} text is altered\n  shipped: ${quote}\n  canon:   ${v.quote}`);
  assert.ok(isRedLetter(verse), `${where}: ${verse} is not red letter`);
}

describe('static artifacts', () => {
  it('are generated from lib/curated.js and current on disk', () => {
    for (const [rel, content] of Object.entries(artifacts())) {
      const current = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      assert.equal(current, content, `${rel} is stale — run npm run curated`);
    }
  });

  it('ship only canonical red-letter text', () => {
    const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'curated.json'), 'utf8'));
    let checked = 0;
    for (const day of json.daily) {
      assertCanonical(day.affirmation.verse, day.affirmation.quote, 'daily.affirmation');
      assertCanonical(day.word.verse, day.word.passage, 'daily.word');
      checked += 2;
    }
    for (const [name, pack] of Object.entries(json.packs)) {
      for (const p of [...pack.passages, ...pack.more]) {
        assertCanonical(p.verse, p.quote, `pack ${name}`);
        checked += 1;
      }
    }
    for (const p of json.commons) {
      assertCanonical(p.verse, p.quote, 'commons');
      checked += 1;
    }
    for (const [name, days] of Object.entries(json.paths)) {
      for (const day of days) {
        assertCanonical(day.verse, day.passage, `${name} ${day.title}`);
        assert.equal(day.passage, lookup(day.verse).text, `${name} ${day.title} is not the whole saying`);
        checked += 1;
      }
    }
    const { RLA_SEVEN, RLA_FORTY, RLA_CURATED } = loadBrowserGlobals();
    assert.deepEqual(plain(RLA_CURATED), json);
    assert.deepEqual(plain(RLA_SEVEN), json.paths.seven);
    assert.deepEqual(plain(RLA_FORTY), json.paths.forty);
    assert.equal(RLA_SEVEN.length, 7);
    assert.ok(checked >= 100, `only ${checked} quotes checked`);
  });
});

describe('the static Advisor is the server Advisor', () => {
  const window = loadBrowserGlobals();

  it('exposes the same engine in the browser bundle', () => {
    assert.equal(typeof window.RLA_LETTERPRESS.composeLetter, 'function');
    assert.equal(window.RLA_LETTERPRESS.NEED_CUES.length, press.NEED_CUES.length);
  });

  it('writes the same letter for the same need', () => {
    for (const q of ['I feel so much shame', 'my mother died last week', 'hi', 'I am afraid of losing my job']) {
      const browser = window.RLA_LETTERPRESS.composeLetter(q, { packs: window.RLA_CURATED.packs, commons: window.RLA_CURATED.commons });
      const server = press.composeLetter(q, { packs: THEMES, commons: COMMONS });
      assert.deepEqual(plain(browser.citations), server.citations, q);
      assert.equal(browser.opening, server.opening, q);
      for (const p of browser.passages) {
        assert.equal(p.quote, lookup(p.verse).text, `${q}: ${p.verse} browser quote is not canonical`);
      }
    }
  });

  it('RLA_advise renders the letter with real text, no placeholders, and a crisis notice first', () => {
    const letter = window.RLA_advise('I feel so much shame', []);
    assert.match(letter, /\*\*Luke 15:4\*\*/);
    assert.match(letter, /go after that which is lost/);
    assert.doesNotMatch(letter, /\{\{/);
    const crisis = window.RLA_advise('I want to die', []);
    assert.ok(crisis.indexOf('988') < crisis.indexOf('**'), '988 must come first');
    const second = window.RLA_advise('still ashamed', [{ role: 'assistant', content: letter }]);
    assert.doesNotMatch(second, /Luke 15:4\*\*/);
    assert.match(second, /^You have stayed with this/);
  });

  it('does not re-read a room opening after a crisis notice stood before it', () => {
    const first = window.RLA_advise('I want to die, I am so ashamed', []);
    assert.match(first, /^If you are in danger/);
    assert.match(first, /Shame says you are the lost sheep/);
    const second = window.RLA_advise('still ashamed', [{ role: 'assistant', content: first }]);
    assert.doesNotMatch(second, /lost sheep/);
    assert.match(second, /^You have stayed with this/);
  });

  it('counts abbreviated citations from a model turn as already sent', () => {
    const letter = press.composeLetter('I feel ashamed', {
      packs: THEMES, commons: COMMONS,
      history: [{ role: 'assistant', content: 'Remember Lk. 15:4 and luke 15:7.' }],
    });
    assert.ok(!letter.citations.includes('Luke 15:4') && !letter.citations.includes('Luke 15:7'), letter.citations.join(', '));
  });

  it('keeps every room in the browser data', () => {
    for (const name of themeNames()) {
      assert.ok(window.RLA_CURATED.packs[name], name);
      assert.equal(window.RLA_CURATED.packs[name].passages.length + window.RLA_CURATED.packs[name].more.length, 5, name);
    }
  });
});
