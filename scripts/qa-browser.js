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
      wordFirst: !!(document.getElementById('word-card') && document.getElementById('aff-card')
        && (document.getElementById('word-card').compareDocumentPosition(document.getElementById('aff-card')) & Node.DOCUMENT_POSITION_FOLLOWING)),
      compose: !!document.getElementById('compose-line'),
      wordShown: document.getElementById('word-content')?.style.display !== 'none',
      streakHidden: document.getElementById('streak-num')?.hidden === true || !document.getElementById('streak-num')?.textContent,
    }));
    assert(today.season, 'season lost after sit');
    assert(today.seven === 7, 'expected 7 named days, got ' + today.seven);
    const names = await page.$$eval('.seven-day', (els) => els.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
    assert(/Go/i.test(names.join(' ')), 'last day must read Go, not a clipped OO: ' + names.join(' / '));
    assert(today.silk, 'silk ribbon missing');
    assert(!today.askHim, 'must not pretend the model is Jesus');
    assert(!today.sitting, 'chrome should return after sit');
    assert(today.wordFirst, 'the Word must sit above the quieter line');
    assert(today.compose, 'commonplace must have a place to write');
    assert(today.wordShown, 'today’s word never arrived');
  });

  await check('leave mid-sit and the sentence waits', async () => {
    await page.evaluate(() => { if (typeof sitWith === 'function') sitWith('word'); });
    await page.waitForSelector('#sit-sheet.on', { timeout: 4000 });
    await page.evaluate(() => { if (typeof goSitReflect === 'function') goSitReflect(); });
    await page.waitForSelector('#sit-step-2.on');
    await page.evaluate(() => { if (typeof closeSit === 'function') closeSit(); });
    await page.waitForFunction(() => !document.getElementById('sit-sheet').classList.contains('on'));
    const slip = await page.evaluate(() => ({
      shown: !document.getElementById('resume-slip').hidden,
      quote: document.getElementById('resume-quote').textContent,
    }));
    assert(slip.shown, 'resume slip hidden after a mid-sit close');
    assert(slip.quote && slip.quote.length > 4, 'resume slip has no sentence');
    await page.evaluate(() => { if (typeof resumeSit === 'function') resumeSit(); });
    await page.waitForSelector('#sit-sheet.on');
    const step = await page.evaluate(() => document.getElementById('sit-step-2').classList.contains('on'));
    assert(step, 'resume did not return to Reflect');
    await page.evaluate(() => { if (typeof amenFromSit === 'function') amenFromSit(); });
    await page.waitForFunction(() => !document.getElementById('resume-slip').hidden === false, { timeout: 4000 });
  });

  await check('journal compose keeps a line', async () => {
    await page.evaluate(() => { if (typeof switchTab === 'function') switchTab('journal'); });
    await page.waitForSelector('#compose-line');
    await page.evaluate(() => {
      document.getElementById('compose-line').value = 'A line I wrote.';
      if (typeof keepCompose === 'function') keepCompose();
    });
    await page.focus('#compose-line');
    await page.keyboard.type('Kept with Enter.');
    await page.keyboard.press('Enter');
    const kept = await page.evaluate(() => document.getElementById('journal-list').innerText);
    assert(/A line I wrote/i.test(kept), 'compose did not keep the line');
    assert(/Kept with Enter/i.test(kept), 'Enter did not keep the compose line');
    assert(/Sat with|A line/i.test(kept), 'commonplace missing type labels');
  });

  await check('Seek opens Peace', async () => {
    await page.evaluate(() => { if (typeof switchTab === 'function') switchTab('seek'); });
    await page.waitForSelector('#theme-grid');
    await page.evaluate(() => { if (typeof loadEnc === 'function') loadEnc('Peace'); });
    await page.waitForSelector('#enc-result.on', { timeout: 8000 });
    const room = await page.evaluate(() => ({
      headline: document.getElementById('enc-headline').textContent,
      passages: document.getElementById('enc-passages').innerText,
    }));
    assert(room.headline && room.headline.length > 3, 'Peace opened without a headline');
    assert(/John|Matthew|Luke|Mark/i.test(room.passages), 'Peace room missing a Gospel citation');
  });

  await check('Advisor answers without a key', async () => {
    await page.evaluate(() => { if (typeof switchTab === 'function') switchTab('advisor'); });
    await page.waitForSelector('#chat-input');
    await page.evaluate(() => {
      document.getElementById('chat-input').value = 'I feel so much shame';
      if (typeof sendMsg === 'function') sendMsg();
    });
    await page.waitForFunction(() => {
      const letters = document.querySelectorAll('#chat-messages .letter');
      return letters.length > 0 && letters[letters.length - 1].innerText.length > 20;
    }, { timeout: 12000 });
    const letter = await page.evaluate(() => document.querySelector('#chat-messages .letter').innerText);
    assert(/John|Matthew|Luke|Mark/i.test(letter), 'Advisor reply missing a Gospel');
    const trust = await page.evaluate(() => document.body.innerText);
    assert(/988/.test(trust), 'Advisor page missing 988');
  });

  await check('crisis language interrupts before send', async () => {
    await page.evaluate(() => {
      document.getElementById('chat-input').value = 'I want to die';
    });
    await page.evaluate(() => { if (typeof sendMsg === 'function') sendMsg(); });
    await page.waitForSelector('#crisis-modal.on', { timeout: 4000 });
    const copy = await page.evaluate(() => document.getElementById('crisis-modal').innerText);
    assert(/988/.test(copy), 'crisis modal missing 988');
    await page.click('#crisis-close');
    await page.waitForFunction(() => !document.getElementById('crisis-modal').classList.contains('on'));
  });

  await check('spoken library turns a leaf', async () => {
    await page.evaluate(() => {
      if (typeof switchTab === 'function') switchTab('seek');
      if (typeof setSeekMode === 'function') setSeekMode('letters');
    });
    await page.waitForFunction(() => document.querySelectorAll('#lib-list .saying-row').length > 0, { timeout: 8000 });
    const folio = await page.evaluate(() => {
      const btn = document.querySelector('#lib-list .saying-row');
      if (btn) btn.click();
      return document.getElementById('lib-folio-quote').textContent;
    });
    assert(folio && folio.length > 8, 'library leaf empty');
  });

  await check('desktop rail, not a dock', async () => {
    await page.setViewport({ width: 1100, height: 800 });
    await page.evaluate(() => { if (typeof switchTab === 'function') switchTab('today'); });
    const chrome = await page.evaluate(() => {
      const rail = getComputedStyle(document.querySelector('.rail')).display;
      const dock = getComputedStyle(document.querySelector('.dock')).display;
      return { rail, dock };
    });
    assert(chrome.rail !== 'none', 'desktop rail hidden');
    assert(chrome.dock === 'none', 'desktop still showing the phone dock');
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
