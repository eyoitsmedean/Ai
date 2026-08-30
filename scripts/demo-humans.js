#!/usr/bin/env node
/**
 * Twenty target-demo humans, run against a live server.
 * Usage: node scripts/demo-humans.js [baseUrl]
 */
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

const HUMANS = [
  { id: 1, name: 'Maya, 29', job: 'anxious, TikTok ad', intent: 'peace', ask: 'I cannot stop thinking about tomorrow' },
  { id: 2, name: 'James, 54', job: 'deacon, anti-AI-Jesus', intent: 'jesus-words', ask: 'Are you pretending to be Jesus?' },
  { id: 3, name: 'Keisha, 22', job: 'shame, late night', intent: 'encouragement', ask: 'I feel so much shame' },
  { id: 4, name: 'Robert, 71', job: 'large type, hates jargon', intent: 'peace', fs: 'lg' },
  { id: 5, name: 'Sofia, 34', job: 'Catholic, wants lectio', intent: 'peace', sit: true },
  { id: 6, name: 'Ahmed, 41', job: 'non-Christian, wary', intent: 'guidance', ask: 'I am not a Christian. Can I still sit with this?' },
  { id: 7, name: 'Priya, 27', job: 'left church', intent: 'encouragement' },
  { id: 8, name: 'Tom, 45', job: 'pastor, would he show a member?', intent: 'guidance', ask: 'A friend is afraid of the future' },
  { id: 9, name: 'Elena, 38', job: 'bless Mom', intent: 'peace', bless: true },
  { id: 10, name: 'Marcus, 19', job: 'crisis-adjacent QA', intent: 'peace', crisis: true },
  { id: 11, name: 'Linda, 62', job: 'desktop print', intent: 'peace', desktop: true, journal: true },
  { id: 12, name: 'Chris, 31', job: 'ADHD, will not wait 20s', intent: 'guidance', skipRest: true },
  { id: 13, name: 'Naomi, 25', job: 'designer', intent: 'jesus-words' },
  { id: 14, name: 'David, 48', job: 'grief', intent: 'encouragement', ask: 'My dad died and I do not know how to pray' },
  { id: 15, name: 'Hannah, 16', job: 'teen, simple words', intent: 'peace' },
  { id: 16, name: 'Victor, 58', job: 'share must not break', intent: 'peace', bless: true },
  { id: 17, name: 'Jade, 33', job: 'returning morning, no skip', intent: 'peace', returning: true },
  { id: 18, name: 'Owen, 40', job: 'keyboard / Hear this', intent: 'peace', hear: true },
  { id: 19, name: 'Grace, 36', job: 'night paper then back', intent: 'peace', night: true },
  { id: 20, name: 'Host, 42', job: 'shared iPad, next guest', intent: 'peace', reset: true },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function freshPage(browser, desktop) {
  const page = await browser.newPage();
  await page.setViewport(desktop
    ? { width: 1280, height: 800, deviceScaleFactor: 1 }
    : { width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE + '/?fresh=1', { waitUntil: 'load' });
  await page.waitForFunction(() => !localStorage.getItem('rla-onboarded'));
  return page;
}

async function begin(page, intent) {
  const sel = `.intent-chip[data-intent="${intent}"]`;
  if (await page.$(sel)) await page.click(sel);
  await page.click('.ob-btn');
  await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 5000 });
  await page.waitForFunction(() => {
    const ov = document.getElementById('lectio-overlay');
    return ov && ov.classList.contains('on');
  }, { timeout: 8000 }).catch(() => {});
}

async function finishOrSkipLectio(page, skipRest) {
  const on = await page.evaluate(() => document.getElementById('lectio-overlay').classList.contains('on'));
  if (!on) return;
  if (skipRest) {
    await page.evaluate(() => { if (typeof lectioGo === 'function') lectioGo(2); });
    await page.click('#lectio-rest-skip');
  } else {
    await page.evaluate(() => { if (typeof lectioGo === 'function') lectioGo(3); });
  }
  await page.waitForSelector('#lectio-note', { visible: true, timeout: 4000 }).catch(() => {});
  const note = await page.$('#lectio-note');
  if (note) {
    await page.type('#lectio-note', 'A line I will keep.');
    await page.click('#lectio-room-3 .lectio-next');
    await page.waitForFunction(() => !document.getElementById('lectio-overlay').classList.contains('on'), { timeout: 4000 }).catch(() => {});
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on'), { timeout: 4000 }).catch(() => {});
    await page.evaluate(() => {
      const amen = document.getElementById('amen');
      if (amen) { amen.classList.remove('on'); amen.onclick = null; }
    });
  }
}

async function runHuman(browser, h) {
  const notes = [];
  const page = await freshPage(browser, h.desktop);
  const welcome = await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded' });
  assert(welcome && welcome.ok(), 'welcome down');
  const wcopy = await page.evaluate(() => document.body.innerText);
  if (/Plus launches|Red Letter Plus/i.test(wcopy)) notes.push('frown: Plus still on welcome');
  if (!/988/.test(wcopy)) notes.push('frown: no 988 on welcome');

  await page.goto(BASE + '/?fresh=1', { waitUntil: 'load' });
  const first = await page.evaluate(() => ({
    paper: getComputedStyle(document.body).backgroundColor,
    theme: document.documentElement.getAttribute('data-theme'),
    cta: document.querySelector('.ob-btn') && document.querySelector('.ob-btn').textContent,
    journey: /Begin My Journey/i.test(document.body.innerText),
    askHim: /Ask Him/i.test(document.body.innerText),
    streak: document.getElementById('streak-badge') && !document.getElementById('streak-badge').hidden,
  }));
  if (first.theme !== 'light') notes.push('stop: dark chapel on first paint');
  if (first.journey) notes.push('frown: Begin My Journey');
  if (first.askHim) notes.push('stop: pretends to be Jesus');
  if (first.streak) notes.push('frown: streak before sitting');
  if (!/Open the page/i.test(first.cta || '')) notes.push('frown: CTA still church-app speak');

  await begin(page, h.intent);
  if (h.fs === 'lg') {
    await page.evaluate(() => { if (typeof setFs === 'function') setFs('lg'); });
  }
  const lectio = await page.evaluate(() => ({
    on: document.getElementById('lectio-overlay').classList.contains('on'),
    leave: (document.querySelector('.lectio-leave') || {}).textContent || '',
    skip: !!document.getElementById('lectio-rest-skip'),
    jargon: /lectio divina/i.test(document.body.innerText),
  }));
  if (!lectio.on) notes.push('frown: first sentence did not open');
  if (h.sit && !/Close anytime/i.test(lectio.leave)) notes.push('frown: lectio feels like a trap');
  if (h.skipRest && !lectio.skip) notes.push('stop: no way out of the 20s');

  if (h.sit || h.skipRest || h.returning || h.journal || h.bless || h.hear || h.reset || h.night) {
    await finishOrSkipLectio(page, h.skipRest);
  } else if (lectio.on) {
    await page.click('#lectio-overlay .sit-close');
  }

  if (h.ask) {
    await page.$eval('#nav-advisor', (el) => el.click());
    await page.waitForSelector('#chat-input', { visible: true });
    const heading = await page.$eval('#advisor-page h1', (el) => el.innerText);
    if (/Ask Him/i.test(heading)) notes.push('stop: Advisor says Ask Him');
    await page.type('#chat-input', h.ask);
    await page.click('#send-btn');
    await page.waitForFunction(() => {
      const t = document.getElementById('chat-messages').innerText;
      return t.length > 40;
    }, { timeout: 8000 });
    const chat = await page.$eval('#chat-messages', (el) => el.innerText);
    if (/daily_limit|Plus|402/.test(chat)) notes.push('stop: paywall');
    if (h.id === 3 && !/John 8:11/i.test(chat)) notes.push('stop: shame did not cite John 8:11');
    if (h.id === 2 && /I am Jesus|I am the Lord/i.test(chat)) notes.push('stop: model claimed to be Jesus');
  }

  if (h.crisis) {
    await page.$eval('#nav-advisor', (el) => el.click());
    await page.waitForSelector('#chat-input', { visible: true });
    await page.click('#chat-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#chat-input', 'I want to kill myself');
    await page.click('#send-btn');
    await page.waitForFunction(() => document.getElementById('crisis-modal').classList.contains('on'), { timeout: 4000 });
    const crisis = await page.$eval('#crisis-modal', (el) => el.innerText);
    if (!/988/.test(crisis) || !/IASP/i.test(crisis)) notes.push('stop: crisis modal incomplete');
    await page.click('#crisis-close');
  }

  if (h.bless) {
    await page.$eval('#nav-today', (el) => el.click());
    await page.evaluate(() => {
      const btn = document.getElementById('bless-word-btn');
      if (btn) btn.scrollIntoView({ block: 'center' });
      if (typeof openBlessing === 'function') openBlessing('word');
    });
    await page.waitForSelector('#bless-modal.on', { timeout: 4000 });
    const preview = await page.$('#bless-preview');
    if (!preview) notes.push('stop: blessing has no card to see');
    await page.keyboard.press('Escape');
  }

  if (h.journal) {
    await page.$eval('#nav-journal', (el) => el.click());
    await page.waitForFunction(() => document.getElementById('journal-page').classList.contains('active'));
    const empty = await page.$eval('#journal-page', (el) => el.innerText);
    if (/A commonplace waits/i.test(empty) && !/Nothing kept|Lines you keep/i.test(empty)) {
      notes.push('frown: commonplace unexplained');
    }
    await page.type('#compose-line', 'For the folio.');
    await page.click('#compose-form button[type="submit"]');
    await page.click('#journal-tools button[onclick="openFolio()"]');
    await page.waitForFunction(() => document.getElementById('folio-overlay').classList.contains('on'), { timeout: 3000 });
    await page.keyboard.press('Escape');
  }

  if (h.hear) {
    await page.$eval('#nav-today', (el) => el.click());
    await page.evaluate(() => { if (typeof hearPassage === 'function') hearPassage('word'); });
    const heard = await page.waitForFunction(() => {
      const rule = document.getElementById('hear-rule');
      return rule && !rule.hidden;
    }, { timeout: 4000 }).then(() => true).catch(() => false);
    if (!heard) notes.push('frown: Hear this did nothing');
  }

  if (h.night) {
    await page.click('button[aria-label="Settings"]');
    await page.evaluate(() => document.getElementById('dark-toggle').click());
    const night = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (night !== 'dark') notes.push('frown: night paper dead');
    await page.evaluate(() => document.getElementById('dark-toggle').click());
    await page.keyboard.press('Escape');
  }

  if (h.returning) {
    await page.evaluate(() => {
      const n = new Date();
      const today = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
      localStorage.setItem('rla-path-unlock', today);
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => /Day/.test((document.getElementById('path-rail') || {}).textContent || ''), { timeout: 6000 });
    const rail = await page.evaluate(() => (document.getElementById('path-rail') || {}).textContent || '');
    if (/Day 3|Day 4|Day 5/.test(rail)) notes.push('stop: missed morning skipped a room');
    if (!/Day 2/.test(rail)) notes.push('frown: returning morning did not open the next room');
  }

  if (h.reset) {
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'load' });
    const clean = await page.evaluate(() => !localStorage.getItem('rla-onboarded'));
    if (!clean) notes.push('stop: cannot reset the iPad');
  }

  const paper = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (paper === 'dark' && !h.night) notes.push('frown: left the next guest in night paper');

  await page.close();
  const verdict = notes.some((n) => n.startsWith('stop')) ? 'STOP' : notes.length ? 'FROWN' : 'KEEP';
  return { human: h, verdict, notes };
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const rows = [];
  for (const h of HUMANS) {
    try {
      rows.push(await runHuman(browser, h));
      process.stdout.write('· ' + h.id + ' ' + h.name + '\n');
    } catch (e) {
      rows.push({ human: h, verdict: 'STOP', notes: ['crash: ' + e.message] });
      process.stdout.write('✗ ' + h.id + ' ' + h.name + ' ' + e.message + '\n');
    }
  }
  await browser.close();

  console.log('\n20 humans — target demo\n');
  rows.forEach((r) => {
    const felt = r.notes.length ? r.notes.join('; ') : 'would keep going';
    console.log(r.verdict.padEnd(5), String(r.human.id).padStart(2), r.human.name + ' — ' + r.human.job);
    console.log('     ', felt);
  });
  const stops = rows.filter((r) => r.verdict === 'STOP');
  const frowns = rows.filter((r) => r.verdict === 'FROWN');
  console.log('\n' + rows.filter((r) => r.verdict === 'KEEP').length + ' would stay · ' + frowns.length + ' frowned · ' + stops.length + ' would stop');
  if (stops.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
