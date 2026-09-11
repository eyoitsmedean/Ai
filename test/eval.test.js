const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { runEval, loadQuestions } = require('../scripts/eval');
const { isExactSpan, looksLikeCrisis, looksLikeDanger, looksLikePoisoning, looksLikeByYou, looksLikeBereaved, fold } = require('../lib/scripture');
const SIGNALS = require('../public/data/signals.js');
const { encouragementFor } = require('../lib/curated');

const ROOT = path.join(__dirname, '..');

function clientWindow() {
  const w = {};
  const ctx = vm.createContext({ window: w, self: w });
  for (const f of ['signals.js', 'curated.js', 'advisor.js', 'paths.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'public', 'data', f), 'utf8'), ctx);
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

  it('the page, the composer and the server listen with the same ears', () => {
    // One file. The server requires it; the page and the static composer load it.
    const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    assert.ok(html.includes('<script src="./data/signals.js"></script>'), 'page does not load signals.js');
    assert.ok(html.indexOf('data/signals.js') < html.indexOf('data/advisor.js'), 'signals.js must load before the composer');
    assert.match(html, /function looksLikeCrisisClient\(text\) \{\s*return window\.RLA_SIGNALS\.looksLikeCrisis\(text\)/);
    assert.match(html, /function looksLikePoisoningClient\(text\) \{\s*return window\.RLA_SIGNALS\.looksLikePoisoning\(text\)/);
    assert.match(html, /id="crisis-poison"[^>]*hidden/);
    assert.ok(html.includes('1-800-222-1222'));
    const js = fs.readFileSync(path.join(ROOT, 'public', 'data', 'advisor.js'), 'utf8');
    assert.ok(js.includes('window.RLA_SIGNALS'), 'composer does not use signals.js');
    assert.doesNotMatch(js, /const (?:DANGER|BY_YOU|POISON|CRISIS) = \//, 'composer still carries its own copy of a pattern');
    const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
    assert.ok(sw.includes("'./data/signals.js'"), 'service worker does not precache signals.js');
    // The server's functions are the module's functions, not copies.
    assert.equal(looksLikeCrisis, SIGNALS.looksLikeCrisis);
    assert.equal(looksLikeDanger, SIGNALS.looksLikeDanger);
    // And the browser copy, loaded the way the page loads it, agrees on every probe.
    const w = clientWindow();
    for (const probe of ['I want to kill myself', 'I took 30 pills', 'my husband hits me', 'I hit my wife', 'my son died last year', 'what did Jesus say about rest']) {
      for (const fn of ['looksLikeCrisis', 'looksLikePoisoning', 'looksLikeDanger', 'looksLikeByYou', 'looksLikeBereaved']) {
        assert.equal(w.RLA_SIGNALS[fn](probe), SIGNALS[fn](probe), `${fn}(${probe})`);
      }
    }
  });

  it('the two composers open the same rooms with the same first passage', () => {
    // Grief, Forgiveness and Conflict were where they had drifted apart; the elderly and the
    // bereaved must never be handed "many mansions" or "love your enemies" by one host and not the other.
    const w = clientWindow();
    const enc = w.RLA_CURATED.encouragement;
    for (const [room, banned] of [['Grief & Loss', /many mansions|prepare a place/i], ['Conflict & Relationships', /enemies|despitefully/i], ['Forgiveness', /forgive not/], ['Suffering & Pain', /^These things I have spoken/]]) {
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
    const disguised = [
      's u i c i d e', 'sui.cide', 'k/y/s', 'su1c1de', 'I want to k!ll myself', 'I want to d1e', 'i want to di3', 'k\u200bill my\u200bself',
      "my brother told me he doesn't want to be here anymore", 'my son keeps saying he wishes he was dead', 'I want to disappear',
      "I keep thinking my family would be happier if I wasn't around", 'I have a plan and a date', "I've been giving away my things and saying goodbye to people",
      "I've taken 30 paracetamol", 'I took 40 tylenol', 'I took every pill in the house',
    ];
    const bereavedNotCrisis = ["my best friend died of an overdose and I feel guilty I didn't stop him", 'my brother overdosed two years ago and I still miss him'];
    assert.deepEqual(danger.filter((s) => !looksLikeCrisis(s)), []);
    assert.deepEqual(disguised.filter((s) => !looksLikeCrisis(s)), []);
    assert.deepEqual(benign.filter((s) => looksLikeCrisis(s)), []);
    assert.deepEqual(bereavedNotCrisis.filter((s) => looksLikeCrisis(s)), []);
    assert.deepEqual(['I want to disappear for a week on vacation', 'I have 3 kids', 'the dose is 30mg', 'I am ok', 'my dad hit a home run at the reunion'].filter((s) => looksLikeCrisis(s)), []);
    assert.equal(fold('s u i c i d e'), 'suicide');
    assert.equal(fold('su1c1de'), 'suicide');
  });

  it('knows when something has been taken — and when it was someone else, or long ago', () => {
    const taken = [
      'I took too many pills an hour ago', 'I swallowed the whole bottle of my sleeping pills', 'I overdosed', 'I drank bleach', 'just took 40 tablets',
      "I've taken 30 paracetamol", 'I took 40 tylenol', 'I took 30 pills', 'i swallowed a bottle of pills', 'I drank a bottle of antifreeze',
      'I took every pill in the house', "I ate all my mom's blood pressure meds", "I ate a handful of my grandma's heart pills",
      'I took way more than I should have of my xanax', 'I just swallowed all my insulin', 'I took an overdose an hour ago',
      'my son overdosed last year and tonight I took all my pills',
    ];
    const notTaken = [
      'I want to die', 'kms', 'I took the whole day off', 'I drank the whole bottle of wine', 'took my pills like the doctor said',
      "my best friend died of an overdose and I feel guilty I didn't stop him", 'I took 2 advil for my headache', 'I take all my meds at night',
      'my brother overdosed two years ago and I still miss him', 'I overdosed two years ago and I am still ashamed', "my son OD'd last spring",
    ];
    assert.deepEqual(taken.filter((s) => !looksLikePoisoning(s)), []);
    assert.deepEqual(notTaken.filter((s) => looksLikePoisoning(s)), []);
  });

  it('knows the bereaved from the one at risk', () => {
    for (const s of ['My daughter died by suicide last year', "my best friend died of an overdose and I feel guilty I didn't stop him", 'my husband passed away in March', 'we lost our son to suicide']) {
      assert.equal(looksLikeBereaved(s), true, s);
    }
    for (const s of ['my brother died by suicide and I want to die too', 'I want to kill myself', 'I am 82 and my wife of 60 years died last month and I want to join her']) {
      assert.equal(looksLikeBereaved(s), false, s);
    }
  });

  it('hears violence and abuse, received or witnessed, and not the idioms', () => {
    const heard = [
      'he hit my mom again last night', 'my husband choked me on Saturday', 'I was raped in college', 'my youth pastor abused me when I was 15', "I'm afraid to go home", 'domestic violence',
      'my husband hits me and I am scared', 'he controls all the money and checks my phone', 'he threw a plate at me', "he won't let me leave the house",
      'my husband threw me against the wall', 'my husband pushed me', 'my boyfriend put his hands around my neck', 'my husband threatens to take the kids if I leave',
      'my dad touches me at night', 'my uncle touched me when I was little', 'my husband forces me to have sex', 'my partner is abusive',
      "my daughter's boyfriend hits her", "my friend's husband beats her", 'my neighbor beats his kids and I hear it through the wall', "my mom's boyfriend beats her",
      'husband hit me last night',
    ];
    const idiom = [
      'the storm hit my town', 'this song hits different', 'he beat me at chess', 'I hit my head on the cupboard',
      'my husband hit a home run at the game', 'she beat cancer', 'my husband hit the jackpot', 'my son hit me up for money', 'my boyfriend hit me up last night',
      "she hit me with the news that she's moving", 'my brother hit his head', 'it hit me hard when she left', 'the news hit me like a truck',
      'my husband pushed me to apply for the job', 'he pushed me away emotionally', 'my dad threw the ball at me and I missed',
    ];
    assert.deepEqual(heard.filter((s) => !looksLikeDanger(s)), []);
    assert.deepEqual(idiom.filter((s) => looksLikeDanger(s)), []);
  });

  it('hears the one who hit, or is afraid they will', () => {
    const byYou = [
      'I want to hit my kid', 'I hit my wife last night and I hate myself', "I'm scared I'm going to hurt my baby", 'I slapped my son',
      'Sometimes I want to hurt my daughter', 'I want to kill my husband', 'I am afraid of what I might do to my kids', 'I shook my baby',
      'Give me the verse where Jesus says I am allowed to beat my kids', "I'm afraid I'll hurt her",
      'I lose my temper with the kids and it gets physical', 'I pushed her', 'I pushed my wife down the stairs', 'I grabbed her by the throat',
      'I locked my son in his room for two days', 'I threw my phone at my wife', 'I put my hands on my wife', 'I burned my kid with a cigarette',
      'I keep leaving bruises on my son', 'I screamed at my toddler and grabbed her arm so hard it bruised',
    ];
    const benign = [
      'I hit my head on the cabinet', 'I beat my brother at chess', 'I want to hit the gym', 'I hit my stride this year', 'I beat my addiction',
      'I hit my limit with this job', 'she beat them in the finals', 'I want to kill it at the interview',
      'I want to kill my sourdough starter', 'I pushed my son to study harder', 'I hurt my back at work', 'I want to hurt my chances', 'I hit my snooze button',
    ];
    assert.deepEqual(byYou.filter((s) => !looksLikeByYou(s)), []);
    assert.deepEqual(byYou.filter((s) => !looksLikeDanger(s)), []);
    assert.deepEqual(benign.filter((s) => looksLikeDanger(s)), []);
    assert.deepEqual(benign.filter((s) => looksLikeByYou(s)), []);
  });
});
