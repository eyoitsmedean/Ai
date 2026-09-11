#!/usr/bin/env node
/**
 * First-session browser QA for the editorial folio.
 * Usage: node scripts/qa-browser.js [baseUrl]
 * Requires a running server and system Chrome.
 */
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const fails = [];
  const ok = (name) => console.log('✓', name);
  const check = async (name, fn) => {
    try {
      await fn();
      ok(name);
    } catch (e) {
      fails.push(name + ': ' + e.message);
      console.error('✗', name, e.message);
    }
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await check('welcome landing', async () => {
    const res = await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'welcome HTTP ' + (res && res.status()));
    const copy = await page.evaluate(() => document.body.innerText);
    assert(/Red Letter/i.test(copy), 'missing brand');
    assert(/988/.test(copy), 'missing 988');
    const href = await page.$eval('a.btn', (a) => a.getAttribute('href'));
    assert(href === '/' || href.endsWith('/'), 'CTA should open the folio');
    assert(!/Plus/i.test(copy), 'welcome must not sell Plus');
  });

  await check('fresh start wipes the last reader', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem('rla-onboarded', '1');
      localStorage.setItem('rla-letters-' + new Date().toISOString().slice(0, 10), '{"messages":[]}');
    });
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
    const wiped = await page.evaluate(() => ({
      onboarded: localStorage.getItem('rla-onboarded'),
      title: !document.getElementById('onboarding').classList.contains('hidden'),
    }));
    assert(!wiped.onboarded, 'fresh=1 left the last reader');
    assert(wiped.title, 'fresh=1 should open the title page');
  });

  await check('title page, then lectio', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(theme === 'light', 'default theme is ' + theme);
    const season = await page.evaluate(() => document.documentElement.getAttribute('data-season'));
    assert(season, 'church year missing');

    const onboarding = await page.$eval('#onboarding', (el) => ({
      hidden: el.classList.contains('hidden'),
      text: el.innerText,
    }));
    assert(!onboarding.hidden, 'title page should show');
    assert(/Turn the page/i.test(onboarding.text), 'missing Turn the page');
    assert(/988/.test(onboarding.text), 'title page missing crisis');
    assert(/Ask Him/i.test(onboarding.text) === false, 'must not say Ask Him');

    await page.click('#ob-ack');
    await page.click('#ob-open');
    await page.waitForSelector('#ob-need.on', { timeout: 4000 });
    await page.click('.tp-skip');
    await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 4000 });
    await page.waitForFunction(() => document.getElementById('sit-sheet').classList.contains('on'), { timeout: 8000 });
    const quote = await page.$eval('#sit-quote', (el) => el.textContent);
    assert(quote && quote.length > 8, 'lectio opened without a sentence');
    const marks = await page.$$eval('.sit-office span', (els) => els.map((e) => e.textContent.trim()));
    assert(marks.join(' ').includes('Reflect'), 'lectio missing Reflect leaf');
  });

  await check('respond writes Amen and a catchword', async () => {
    await page.evaluate(() => { if (typeof goSitReflect === 'function') goSitReflect(); });
    await page.waitForSelector('#sit-step-2.on');
    await page.evaluate(() => { if (typeof startSitRest === 'function') startSitRest(); });
    await page.waitForSelector('#sit-step-3.on');
    await page.evaluate(() => { if (typeof finishSitRest === 'function') finishSitRest(); });
    await page.waitForSelector('#sit-step-4.on');
    await page.evaluate(() => {
      const reply = document.getElementById('sit-reply');
      reply.value = 'Peace.';
      if (typeof keepSitReply === 'function') keepSitReply();
    });
    await page.waitForFunction(() => document.getElementById('amen').classList.contains('on'), { timeout: 4000 });
  });

  await check('Today is a folio, not a dashboard', async () => {
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on'), { timeout: 6000 });
    const today = await page.evaluate(() => ({
      season: document.documentElement.getAttribute('data-season'),
      seven: document.querySelectorAll('.seven-day').length,
      silk: !!document.querySelector('.silk'),
      askHim: document.body.innerText.includes('Ask Him'),
      sitting: document.documentElement.classList.contains('sitting'),
    }));
    assert(today.season, 'season lost after sit');
    assert(today.seven === 7, 'expected 7 named days, got ' + today.seven);
    assert(today.silk, 'silk ribbon missing');
    assert(!today.askHim, 'must not pretend the model is Jesus');
    assert(!today.sitting, 'chrome should return after sit');
    const gate = await page.evaluate(() => !!document.getElementById('chat-gate'));
    assert(!gate, 'paywall gate must not exist');
  });

  await check('the helpline is visible before anyone types', async () => {
    await page.evaluate(() => { if (typeof closeSheets === 'function') closeSheets(); switchTab('advisor'); });
    await page.waitForFunction(() => document.getElementById('advisor-page').classList.contains('active'), { timeout: 4000 });
    const help = await page.evaluate(() => {
      const el = document.getElementById('composer-help');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { text: el.innerText, tel: !!el.querySelector('a[href="tel:988"]'), onScreen: r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight };
    });
    assert(help, '#composer-help missing');
    assert(help.tel && /findahelpline/.test(help.text), 'helpline line lacks 988 or findahelpline');
    assert(help.onScreen, 'helpline line is not on screen: ' + JSON.stringify(help));
  });

  await check('Advisor letter ends in Sit, blessing is a page', async () => {
    await page.click('#nav-advisor');
    await page.type('#chat-input', 'I feel shame');
    await page.click('#send-btn');
    await page.waitForFunction(() => /John|Matthew/i.test(document.getElementById('chat-messages')?.innerText || ''), { timeout: 20000 });
    const sit = await page.$('#sit-from-letter');
    assert(sit, 'Sit with this missing');
    const actions = await page.evaluate(() => {
      const keep = [...document.querySelectorAll('.msg-save-btn')].map((b) => b.textContent.trim());
      const row = document.querySelector('.letter-actions');
      return { keep, hasRow: !!row, rowText: row ? row.innerText.replace(/\s+/g, ' ') : '' };
    });
    assert(actions.hasRow && /Keep in the journal/i.test(actions.rowText) && /Sit with this/i.test(actions.rowText), 'letter actions collided: ' + actions.rowText);
    await page.evaluate(() => { if (typeof closeAmen === 'function') closeAmen(); });
    await page.type('#chat-input', 'I still cannot lift my face');
    await page.click('#send-btn');
    await page.waitForFunction(() => !document.getElementById('last-leaf')?.hidden, { timeout: 20000 });
    const closed = await page.evaluate(() => {
      const el = document.getElementById('composer-help');
      const composer = document.querySelector('#advisor-page .composer');
      const r = el.getBoundingClientRect();
      return {
        leaf: /These are the words/i.test(document.getElementById('last-leaf').innerText),
        composerHidden: !composer || getComputedStyle(composer).display === 'none',
        helpOn: r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight,
      };
    });
    assert(closed.leaf, 'last leaf missing close');
    assert(closed.composerHidden && closed.helpOn, 'helpline must stay when the page closes: ' + JSON.stringify(closed));
    await page.click('#nav-today');
    await page.evaluate(() => { if (typeof blessingFromToday === 'function') blessingFromToday(); });
    await page.waitForSelector('#blessing-sheet.on', { timeout: 8000 });
    const url = await page.evaluate(() => blessingUrl());
    assert(/\/b\//.test(url), 'blessing is not a page');
    await page.evaluate(() => closeBlessing());
  });

  await check('Letters search puts a person before a verse', async () => {
    await page.evaluate(() => { switchTab('seek'); setSeekMode('letters'); });
    await page.waitForFunction(() => !document.getElementById('letters-pane').hidden, { timeout: 4000 });
    await page.evaluate(() => { const q = document.getElementById('lib-q'); q.value = ''; q.dispatchEvent(new Event('input')); });
    await page.type('#lib-q', 'I want to die');
    await page.waitForFunction(() => !document.getElementById('lib-crisis').hidden, { timeout: 4000 });
    const state = await page.evaluate(() => ({
      crisis: document.getElementById('lib-crisis').innerText,
      rows: document.querySelectorAll('#lib-list .saying, #lib-list .lib-row, #lib-list button').length,
      tel: !!document.querySelector('#lib-crisis a[href="tel:988"]'),
    }));
    assert(/988/.test(state.crisis), 'letters crisis missing 988');
    assert(state.tel, 'letters crisis missing tel:988');
    assert(state.rows === 0, 'verse list shown on top of crisis');
  });

  await check('one-screen ask: words, then silence, then stop', async () => {
    const res = await page.goto(BASE + '/ask', { waitUntil: 'networkidle0' });
    assert(res && res.ok(), 'ask HTTP ' + (res && res.status()));
    const before = await page.evaluate(() => ({
      text: document.body.innerText,
      dock: !!document.getElementById('dock') || !!document.querySelector('.dock'),
    }));
    assert(/What is weighing on you today/.test(before.text), 'missing Ask heading');
    assert(/988/.test(before.text), '988 must show before a question');
    assert(/What this bot cannot do/i.test(before.text), 'missing cannot-do');
    assert(/King James/i.test(before.text), 'must label KJV');
    assert(!before.dock, 'ask must not grow a dock');
    await page.type('#question', 'I am afraid of the future');
    await page.click('#send');
    await page.waitForFunction(() => !document.getElementById('words-block').classList.contains('hidden'), { timeout: 8000 });
    const after = await page.evaluate(() => ({
      quote: document.getElementById('quote').innerText,
      cite: document.getElementById('cite').innerText,
      meaning: document.getElementById('meaning').innerText,
      meaningHidden: document.getElementById('meaning-block').classList.contains('hidden'),
    }));
    assert(after.quote.length > 8, 'missing sealed words');
    assert(/Matthew|Mark|Luke|John/i.test(after.cite), 'missing Gospel citation');
    assert(/KJV/.test(after.cite), 'citation must name KJV');
    assert(!after.meaningHidden && after.meaning.length > 0, 'missing meaning');
    await page.evaluate(() => { document.getElementById('question').value = ''; });
    await page.type('#question', 'I want to die');
    await page.click('#send');
    await page.waitForFunction(() => document.getElementById('status').innerText.includes('human'), { timeout: 8000 });
    const crisis = await page.evaluate(() => ({
      wordsHidden: document.getElementById('words-block').classList.contains('hidden'),
      meaningHidden: document.getElementById('meaning-block').classList.contains('hidden'),
      status: document.getElementById('status').innerText,
      has988: /988/.test(document.body.innerText),
    }));
    assert(crisis.wordsHidden, 'crisis still showed a verse');
    assert(crisis.meaningHidden, 'crisis still showed meaning');
    assert(/human/i.test(crisis.status), 'crisis did not stop counsel');
    assert(crisis.has988, '988 vanished after crisis');
  });

  await check('no page errors', async () => {
    assert(consoleErrors.length === 0, consoleErrors.join(' | '));
  });

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nBrowser QA passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
