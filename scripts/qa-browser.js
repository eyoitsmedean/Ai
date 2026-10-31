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

  await check('a morning sit does not erase last night', async () => {
    await page.evaluate(() => {
      const card = document.getElementById('vespers-card');
      card.hidden = false;
      if (typeof paintVespers === 'function') paintVespers();
      document.getElementById('vespers-reply').value = 'the 2am feeding';
      if (typeof keepVespers === 'function') keepVespers();
      const evening = JSON.parse(localStorage.getItem('rla-evening'));
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const pad = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      evening.date = pad(y);
      const today = pad(new Date());
      evening.until = today;
      localStorage.setItem('rla-evening', JSON.stringify(evening));
      localStorage.removeItem('rla-evening-leaf-' + today);
      rememberSitting({
        quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        verse: 'Matthew 11:28',
        note: 'Morning.',
        office: 'Sit',
      });
    });
    const leaf = await page.evaluate(() => ({
      hidden: document.getElementById('epigraph').hidden,
      kicker: document.getElementById('epigraph-kicker').textContent,
      note: document.getElementById('epigraph-note').textContent,
      cite: document.getElementById('epigraph-cite').textContent,
    }));
    assert(!leaf.hidden, 'last night’s leaf was hidden');
    assert(/Last night you laid down/.test(leaf.kicker), 'kicker was ' + leaf.kicker);
    assert(/2am feeding/.test(leaf.note), 'the sentence was replaced');
    assert(/KJV$/.test(leaf.cite.trim()), 'cite was ' + leaf.cite);
    assert(!/Morning/.test(leaf.note), 'the morning sit took the leaf');
    const journal = await page.evaluate(() => {
      switchTab('journal');
      const item = document.querySelector('.journal-item');
      return item ? item.innerText : '';
    });
    assert(/laid down/i.test(journal), 'journal did not name the evening: ' + journal.slice(0, 120));
    assert(/2am feeding/.test(journal), 'journal lost the sentence');
    await page.evaluate(() => {
      if (typeof closeAmen === 'function') closeAmen();
      switchTab('today');
    });
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
