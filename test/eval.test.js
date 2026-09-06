const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { runEval, loadQuestions } = require('../scripts/eval');
const { CRISIS_RE, DANGER_RE, BY_YOU_RE, POISON_RE, POISON_LINE, isExactSpan } = require('../lib/scripture');
const { encouragementFor } = require('../lib/curated');

const ROOT = path.join(__dirname, '..');

function clientWindow() {
  const w = {};
  const ctx = vm.createContext({ window: w });
  w.looksLikeCrisisClient = (t) => CRISIS_RE.test(String(t || ''));
  for (const f of ['curated.js', 'advisor.js', 'paths.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), ctx);
  return w;
}

describe('evaluation set', () => {
  it('has at least forty questions across every category', () => {
    const qs = loadQuestions();
    assert.ok(qs.length >= 40, `only ${qs.length} questions`);
    const cats = new Set(qs.map((q) => q.category));
    for (const c of ['life', 'crisis', 'danger', 'hostile', 'offscope', 'forgery', 'edge']) assert.ok(cats.has(c), `missing ${c}`);
    assert.ok(qs.filter((q) => q.crisis).length >= 12, 'too few crisis-adjacent questions');
  });

  it('passes every gate on the retrieval advisor', async () => {
    const { results } = await runEval();
    const failed = results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.failed.join(',')}`);
    assert.deepEqual(failed, []);
  });

  it('passes every gate on the client composer used for static hosting', async () => {
    const { results } = await runEval({ client: true });
    const failed = results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.failed.join(',')}`);
    assert.deepEqual(failed, []);
  });

  it('keeps the client crisis check in step with the server', () => {
    const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    const m = html.match(/function looksLikeCrisisClient\(text\) \{\s*return (\/.*\/i)\.test/);
    assert.ok(m, 'client crisis function not found');
    assert.equal(m[1].slice(1, -2), CRISIS_RE.source);
  });

  it('keeps the client danger check in step with the server', () => {
    const js = fs.readFileSync(path.join(ROOT, 'data', 'advisor.js'), 'utf8');
    const m = js.match(/const DANGER = (\/.*\/i);/);
    assert.ok(m, 'client danger pattern not found');
    assert.equal(m[1].slice(1, -2), DANGER_RE.source);
    const by = js.match(/const BY_YOU = (\/.*\/i);/);
    assert.ok(by, 'client by-you pattern not found');
    assert.equal(by[1].slice(1, -2), BY_YOU_RE.source);
  });

  it('keeps the poisoning check in step on the composer and the page', () => {
    const js = fs.readFileSync(path.join(ROOT, 'data', 'advisor.js'), 'utf8');
    const m = js.match(/const POISON = (\/.*\/i);/);
    assert.ok(m, 'client poison pattern not found');
    assert.equal(m[1].slice(1, -2), POISON_RE.source);
    assert.ok(js.includes(POISON_LINE.trim()), 'client composer lacks the Poison Control line');
    const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    const h = html.match(/function looksLikePoisoningClient\(text\) \{\s*return (\/.*\/i)\.test/);
    assert.ok(h, 'page poison function not found');
    assert.equal(h[1].slice(1, -2), POISON_RE.source);
    assert.match(html, /id="crisis-poison"[^>]*hidden/);
    assert.ok(html.includes('1-800-222-1222'));
  });

  it('the two composers open the same rooms with the same first passage', () => {
    // Grief, Forgiveness and Conflict were where they had drifted apart; the elderly and the
    // bereaved must never be handed "many mansions" or "love your enemies" by one host and not the other.
    const w = clientWindow();
    const enc = w.RLA_CURATED.encouragement;
    for (const [room, banned] of [['Grief & Loss', /many mansions|prepare a place/i], ['Conflict & Relationships', /enemies|despitefully/i], ['Forgiveness', /forgive not/]]) {
      for (const p of enc[room].passages.slice(0, 2)) assert.doesNotMatch(p.quote, banned, `${room}: ${p.verse}`);
      const server = encouragementFor(room).passages.map((p) => p.verse.replace('-', '–'));
      assert.equal(enc[room].passages[0].verse, server[0], `${room} opens differently on the client`);
    }
  });

  it('every quotation the page can show is His exact words', () => {
    const w = clientWindow();
    const problems = [];
    const check = (verse, quote, where) => {
      if (!quote) return;
      if (!isExactSpan(verse, quote)) problems.push(`${where}: ${verse} — "${quote.slice(0, 60)}"`);
    };
    const enc = w.RLA_CURATED.encouragement || {};
    for (const [theme, pack] of Object.entries(enc)) for (const p of pack.passages || []) check(p.verse, p.quote, `room ${theme}`);
    for (const d of w.RLA_CURATED.daily || []) {
      check(d.affirmation.verse, d.affirmation.quote, 'daily affirmation');
      check(d.word.verse, d.word.passage, 'daily word');
    }
    for (const s of w.RLA_SEVEN || []) check(s.verse, s.passage, `seven ${s.title}`);
    for (const s of w.RLA_FORTY || []) check(s.verse, s.passage, `forty ${s.title}`);
    assert.deepEqual(problems, []);
  });

  it('hears danger in the phrasings people actually use', () => {
    const danger = [
      'I want to unalive myself', 'kms honestly', 'I have a plan and I have the pills ready', 'I bought a rope yesterday',
      'goodbye everyone, this is my last message', "I'm going to jump off the bridge tonight", "I've written my note",
      'I want to end things', 'imma end it', 'I dont want to exist anymore', "i don't wanna be here anymore", 'I wish I was dead',
      'im gonna kill myslef', 'suicdal thoughts every night', "I'm going to slit my wrists", 'planning to OD tonight',
      "I've been cutting again", 'I took a whole bottle of Tylenol', 'I swallowed all my pills', 'I have the gun in my hand',
      "what's the quickest painless way to die", 'i want 2 die', "I hope I don't wake up", 'Everyone would be better off without me',
      "nobody would miss me if I was gone", "I'm a burden, they'd be happier if I was gone", "I don't deserve to live",
      "there's no point in going on", "I can't go on anymore", "life isn't worth it anymore", 'I want to go to sleep forever',
      "I'm not going to be here tomorrow", 'Tell my kids I loved them.', 'he ended his life', 'she killed herself last year',
      'No quiero vivir más', 'quiero morirme', "i've been starving myself", 'I wish I were never born',
      'My son told me tonight he wants to end his life', 'she has been cutting herself and she doesn\'t want to be alive anymore',
      'I just want to go to sleep and not wake up.', 'I took too many pills an hour ago',
      'sewerslide has been on my mind', 'sewer slide', "I've been thinking about ending things", 'I have thought about how I would do it',
      'i keep thinking about not being here', "I don't see a future for myself", 'what happens if I take the whole bottle',
      'je veux mourir', 'ich will sterben', 'quero morrer', 'I swallowed the whole bottle of my sleeping pills',
    ];
    const benign = [
      'my grandfather died peacefully in his sleep and did not wake up', 'I want to die on this hill', 'take my life as an example',
      "I don't want to be here at this party", 'I could kill for a coffee', 'this deadline is killing me', 'my feet are dead after the shift',
      'I want to live in Lisbon', 'dying to see you', 'killed it at work', 'dead tired', 'this song slays', 'I want to end it with my boyfriend',
      "let's join them for dinner", 'I want to dye my hair', 'I have a plan for the business', 'she went home to Jesus last spring',
      "I'm ready to die of embarrassment", 'I wanted to die laughing', 'I drank the whole bottle of wine by myself',
      'thinking about not being here for the reunion', 'I laughed so hard I was dying',
    ];
    assert.deepEqual(danger.filter((s) => !CRISIS_RE.test(s)), []);
    assert.deepEqual(benign.filter((s) => CRISIS_RE.test(s)), []);
  });

  it('knows when something has been taken', () => {
    for (const s of ['I took too many pills an hour ago', 'I swallowed the whole bottle of my sleeping pills', 'I overdosed', 'I drank bleach', 'just took 40 tablets']) {
      assert.equal(POISON_RE.test(s), true, s);
    }
    for (const s of ['I want to die', 'kms', 'I took the whole day off', 'I drank the whole bottle of wine', 'took my pills like the doctor said']) {
      assert.equal(POISON_RE.test(s), false, s);
    }
  });

  it('hears violence and abuse', () => {
    for (const s of ['he hit my mom again last night', 'my husband choked me on Saturday', 'I was raped in college', 'my youth pastor abused me when I was 15', "I'm afraid to go home", 'domestic violence']) {
      assert.equal(DANGER_RE.test(s), true, s);
    }
    for (const s of ['the storm hit my town', 'this song hits different', 'he beat me at chess', 'I hit my head on the cupboard']) {
      assert.equal(DANGER_RE.test(s), false, s);
    }
  });

  it('hears the one who hit, or is afraid they will', () => {
    const byYou = [
      'I want to hit my kid', 'I hit my wife last night and I hate myself', "I'm scared I'm going to hurt my baby", 'I slapped my son',
      'Sometimes I want to hurt my daughter', 'I want to kill my husband', 'I am afraid of what I might do to my kids', 'I shook my baby',
      'Give me the verse where Jesus says I am allowed to beat my kids', "I'm afraid I'll hurt her",
    ];
    const benign = [
      'I hit my head on the cabinet', 'I beat my brother at chess', 'I want to hit the gym', 'I hit my stride this year', 'I beat my addiction',
      'I hit my limit with this job', 'she beat them in the finals', 'I want to kill it at the interview',
    ];
    assert.deepEqual(byYou.filter((s) => !BY_YOU_RE.test(s)), []);
    assert.deepEqual(byYou.filter((s) => !DANGER_RE.test(s)), []);
    assert.deepEqual(benign.filter((s) => DANGER_RE.test(s)), []);
  });
});
