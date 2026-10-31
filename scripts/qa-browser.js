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
    }));
    assert(today.season, 'season lost after sit');
    assert(today.seven === 7, 'expected 7 named days, got ' + today.seven);
    assert(today.silk, 'silk ribbon missing');
    assert(!today.askHim, 'must not pretend the model is Jesus');
    assert(!today.sitting, 'chrome should return after sit');
  });

  await check('a crisis line on every screen', async () => {
    for (const tab of ['today', 'seek', 'advisor', 'journal']) {
      const shown = await page.evaluate((t) => {
        switchTab(t);
        const pg = document.getElementById(t + '-page');
        const a = pg && pg.querySelector('a[href="tel:988"]');
        if (!a) return false;
        a.scrollIntoView({ block: 'center' });
        const r = a.getBoundingClientRect();
        return pg.classList.contains('active') && r.width > 0 && r.height > 0;
      }, tab);
      assert(shown, tab + ' has no visible 988 line');
    }
    const gate = await page.$eval('#chat-gate', (el) => el.textContent);
    assert(!/plus|coming soon|unlimited/i.test(gate), 'the gate is selling something');
    await page.evaluate(() => switchTab('today'));
  });

  await check('night card is already a saying, with 988', async () => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const res = await page.goto(BASE + '/?card=1', { waitUntil: 'networkidle0' });
    assert(res && res.ok(), '/?card=1 HTTP ' + (res && res.status()));
    await page.waitForFunction(() => {
      const q = document.getElementById('print-quote');
      return q && q.textContent && q.textContent.length > 12;
    }, { timeout: 15000 });
    const card = await page.evaluate(() => ({
      open: document.body.classList.contains('card-open'),
      quote: document.getElementById('print-quote').textContent,
      cite: document.getElementById('print-cite').textContent,
      help: document.getElementById('print-help').innerText,
      titleHidden: document.getElementById('onboarding').classList.contains('hidden'),
      askHim: document.body.innerText.includes('Ask Him'),
    }));
    assert(card.open, 'night card did not open');
    assert(card.titleHidden, 'title page must not block the card');
    assert(/KJV/.test(card.cite), 'card must name KJV');
    assert(/988/.test(card.help), 'card must name 988');
    assert(!card.askHim, 'card must not say Ask Him');
    assert(
      /Peace I leave|Come unto me|Take therefore no thought|overcome the world|little flock|little children|comfortless/i.test(card.quote),
      'card quote is not a night saying: ' + card.quote
    );

    await page.goto(BASE + '/?card=Matthew%2011:28', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => /Come unto me/i.test(document.getElementById('print-quote').textContent), { timeout: 15000 });
    const named = await page.evaluate(() => document.getElementById('print-cite').textContent);
    assert(/Matthew 11:28/.test(named), 'named card cite: ' + named);

    await page.goto(BASE + '/?card=Luke%202:14', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.classList.contains('card-open'), { timeout: 8000 });
    const refused = await page.evaluate(() => document.getElementById('print-quote').textContent);
    assert(!/Glory to God in the highest/i.test(refused), 'angel line opened on the card');

    await page.goto(BASE + '/?card=week', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.classList.contains('quire-open') && document.querySelectorAll('.quire-leaf').length === 7, { timeout: 15000 });
    const week = await page.evaluate(() => ({
      days: [...document.querySelectorAll('.quire-leaf .day')].map((el) => el.textContent),
      cites: [...document.querySelectorAll('.quire-leaf .cite')].map((el) => el.textContent).join(' '),
      help: document.querySelector('#print-quire .print-help').innerText,
    }));
    assert(/Sunday/.test(week.days[0]) && /Saturday/.test(week.days[6]), 'week days missing');
    assert(/Matthew 19:14/.test(week.cites), 'children saying missing from the week');
    assert(/988/.test(week.help), 'week must name 988');
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
