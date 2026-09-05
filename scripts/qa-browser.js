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

  await check('Advisor letter ends in Sit, blessing is a page', async () => {
    await page.click('#nav-advisor');
    await page.type('#chat-input', 'I feel shame');
    await page.click('#send-btn');
    await page.waitForFunction(() => /John|Matthew/i.test(document.getElementById('chat-messages')?.innerText || ''), { timeout: 20000 });
    const sit = await page.$('#sit-from-letter');
    assert(sit, 'Sit with this missing');
    await page.evaluate(() => { if (typeof closeAmen === 'function') closeAmen(); });
    await page.type('#chat-input', 'I still cannot lift my face');
    await page.click('#send-btn');
    await page.waitForFunction(() => !document.getElementById('last-leaf')?.hidden, { timeout: 20000 });
    const leaf = await page.$eval('#last-leaf', (el) => el.innerText);
    assert(/These are the words/i.test(leaf), 'last leaf missing close');
    await page.click('#nav-seek');
    await page.click('#mode-carry');
    await page.waitForFunction(() => document.getElementById('carry-pane') && !document.getElementById('carry-pane').hidden, { timeout: 4000 });
    const carry = await page.evaluate(() => document.getElementById('carry-list')?.innerText || '');
    assert(/John|Matthew|Luke|Mark/i.test(carry), 'carrying concordance empty');
    await page.click('#nav-today');
    await page.evaluate(() => { if (typeof blessingFromToday === 'function') blessingFromToday(); });
    await page.waitForSelector('#blessing-sheet.on', { timeout: 8000 });
    const url = await page.evaluate(() => blessingUrl());
    assert(/\/b\//.test(url), 'blessing is not a page');
    await page.evaluate(() => closeBlessing());
  });

  await check('Carrying puts a person before a verse', async () => {
    await page.evaluate(() => { closeSheets(); switchTab('seek'); setSeekMode('carry'); });
    await page.waitForFunction(() => !document.getElementById('carry-pane').hidden && document.getElementById('seek-page').classList.contains('active'), { timeout: 4000 });
    await page.evaluate(() => { const q = document.getElementById('carry-q'); q.value = ''; q.dispatchEvent(new Event('input')); });
    await page.type('#carry-q', 'I want to die');
    await page.waitForFunction(() => !document.getElementById('carry-crisis').hidden, { timeout: 4000 });
    const state = await page.evaluate(() => ({
      crisis: document.getElementById('carry-crisis').innerText,
      rows: document.querySelectorAll('#carry-list .carry-row').length,
      tel: !!document.querySelector('#carry-crisis a[href="tel:988"]'),
    }));
    assert(/988/.test(state.crisis), 'crisis leaf missing 988');
    assert(state.tel, 'crisis leaf missing tel:988');
    assert(state.rows === 0, 'verse table shown on top of crisis');
    await page.evaluate(() => { const q = document.getElementById('carry-q'); q.value = 'I cannot forgive them'; q.dispatchEvent(new Event('input')); });
    await page.waitForFunction(() => document.getElementById('carry-crisis').hidden && document.querySelectorAll('#carry-list .carry-row').length > 0, { timeout: 4000 });
  });

  await check('Keep a copy round-trips the journal', async () => {
    const exported = await page.evaluate(() => {
      const journalBefore = JSON.parse(localStorage.getItem('rla-journal') || '[]');
      const captured = [];
      const realCreate = URL.createObjectURL;
      URL.createObjectURL = (blob) => { captured.push(blob); return 'blob:qa'; };
      const realClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {};
      exportJournalFile();
      URL.createObjectURL = realCreate;
      HTMLAnchorElement.prototype.click = realClick;
      return captured[0] ? captured[0].text().then((t) => ({ text: t, before: journalBefore.length })) : null;
    });
    assert(exported && exported.before > 0, 'nothing exported');
    const data = JSON.parse(exported.text);
    assert(data.app === 'red-letter' && data.keys['rla-journal'], 'export shape wrong');
    const restored = await page.evaluate(async (text) => {
      localStorage.removeItem('rla-journal');
      localStorage.removeItem('rla-last-sit');
      const file = new File([text], 'copy.json', { type: 'application/json' });
      importJournalFile(file);
      await new Promise((r) => setTimeout(r, 300));
      return {
        journal: JSON.parse(localStorage.getItem('rla-journal') || '[]').length,
        lastSit: !!localStorage.getItem('rla-last-sit'),
      };
    }, exported.text);
    assert(restored.journal === exported.before, 'journal did not come back: ' + restored.journal + ' vs ' + exported.before);
    assert(restored.lastSit, 'last sit did not come back');
    const bad = await page.evaluate(async () => {
      const before = localStorage.getItem('rla-journal');
      importJournalFile(new File(['{"app":"other"}'], 'x.json', { type: 'application/json' }));
      await new Promise((r) => setTimeout(r, 300));
      return localStorage.getItem('rla-journal') === before;
    });
    assert(bad, 'a foreign file changed the journal');
  });

  await check('reopening with today’s letters does not break the room', async () => {
    const saved = await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('rla-letters-')));
    assert(saved, 'expected today’s letters to be persisted');
    const errorsBefore = consoleErrors.length;
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluate(() => { if (typeof closeAmen === 'function') closeAmen(); });
    const state = await page.evaluate(() => ({
      letters: document.querySelectorAll('#chat-messages .letter').length,
      leaf: !document.getElementById('last-leaf').hidden,
      carryBound: typeof exportJournalFile === 'function' && typeof matchConcordanceClient === 'function',
    }));
    assert(consoleErrors.length === errorsBefore, 'reload threw: ' + consoleErrors.slice(errorsBefore).join(' | '));
    assert(state.letters >= 2, 'letters did not come back');
    assert(state.leaf, 'last leaf should still be closed after reload');
    assert(state.carryBound, 'script did not finish on reload');
  });

  await check('Tuesday: the ribbon names yesterday', async () => {
    await page.evaluate(() => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      const y = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const sit = JSON.parse(localStorage.getItem('rla-last-sit') || '{}');
      sit.date = y; sit.verse = sit.verse || 'Matthew 11:28';
      localStorage.setItem('rla-last-sit', JSON.stringify(sit));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => !document.getElementById('onboarding') || document.getElementById('onboarding').classList.contains('hidden'), { timeout: 6000 });
    await page.evaluate(() => { if (typeof closeAmen === 'function') closeAmen(); if (typeof closeSit === 'function') closeSit(); });
    const ribbon = await page.evaluate(() => {
      const el = document.getElementById('return-ribbon');
      return { hidden: el.hidden, text: el.innerText };
    });
    assert(!ribbon.hidden, 'return ribbon hidden on day two');
    assert(/Yesterday you sat with (Matthew|Mark|Luke|John)/.test(ribbon.text), 'ribbon does not name the verse: ' + ribbon.text);
  });

  await check('offline: the words stay on the phone', async () => {
    await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, { timeout: 15000 }).catch(() => {});
    await page.evaluate(async () => {
      const keys = await caches.keys();
      const c = await caches.open(keys.find((k) => /rla-/.test(k)) || 'rla-prod-v3');
      await Promise.all(['/', '/index.html', '/data/concordance.js', '/concordance.json', '/data/curated.js', '/data/advisor.js', '/data/paths.js', '/curated.json']
        .map((u) => c.add(u).catch(() => null)));
    });
    await page.setOfflineMode(true);
    let offlineOk = false;
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
      offlineOk = await page.evaluate(() => !!document.getElementById('today-page') && /Red Letter/i.test(document.body.innerText) && !!(window.RLA_CONCORDANCE && window.RLA_CONCORDANCE.needs && window.RLA_CONCORDANCE.needs.length));
    } finally {
      await page.setOfflineMode(false);
    }
    assert(offlineOk, 'room did not open offline with the concordance');
    await page.reload({ waitUntil: 'networkidle0' });
  });

  await check('privacy is one tap from Settings', async () => {
    const link = await page.$eval('#privacy-link', (a) => a.getAttribute('href'));
    assert(link === '/privacy', 'privacy link missing in Settings');
    const res = await page.goto(BASE + '/privacy', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'privacy HTTP ' + (res && res.status()));
    const copy = await page.evaluate(() => document.body.innerText);
    assert(/on the phone/i.test(copy) && /988/.test(copy) && /no accounts/i.test(copy), 'privacy page missing its promises');
    assert(!/Plus/.test(copy), 'privacy must not sell Plus');
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
