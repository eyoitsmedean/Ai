#!/usr/bin/env node
/**
 * Strict first-session browser QA for the Quiet Page.
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
  const notes = [];
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
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await check('welcome landing', async () => {
    const res = await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'welcome HTTP ' + (res && res.status()));
    const copy = await page.evaluate(() => document.body.innerText);
    assert(/Red Letter/i.test(copy), 'missing brand');
    assert(/988/.test(copy), 'missing 988');
    assert(!/Plus launches|unlock Plus|Red Letter Plus/i.test(copy), 'Plus paywall copy');
    const href = await page.$eval('a.btn-primary', (a) => a.getAttribute('href'));
    assert(href === '/' || href.endsWith('/'), 'CTA should open the Advisor at /');
  });

  await check('first session: paper + onboarding + lectio', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(theme === 'light', 'default theme is ' + theme);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert(bg === 'rgb(246, 243, 236)', 'body is not paper, got ' + bg);

    const onboarding = await page.$eval('#onboarding', (el) => ({
      hidden: el.classList.contains('hidden'),
      text: el.innerText,
    }));
    assert(!onboarding.hidden, 'onboarding should show');
    assert(/Matthew\s+11:28/i.test(onboarding.text), 'missing Matthew 11:28');
    assert(/Ask Him/i.test(onboarding.text) === false, 'onboarding must not say Ask Him');

    const appHidden = await page.$eval('#app', (el) => el.hidden);
    assert(appHidden, 'app should stay hidden under first onboarding');

    await page.click('.intent-chip[data-intent="peace"]');
    await page.click('.ob-btn');
    await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 4000 });
    await page.waitForFunction(() => document.getElementById('lectio-overlay').classList.contains('on'), { timeout: 8000 });

    const lectioQuote = await page.$eval('#lectio-quote', (el) => el.textContent);
    assert(lectioQuote && lectioQuote.length > 8, 'lectio opened without a sentence');
  });

  await check('lectio close leaves resume; finish writes Amen + flyleaf + beads', async () => {
    await page.click('#lectio-overlay .sit-close');
    await page.waitForFunction(() => !document.getElementById('lectio-overlay').classList.contains('on'));
    const resume = await page.$eval('#resume-slip', (el) => !el.hidden);
    assert(resume, 'resume slip missing after mid-lectio close');

    await page.click('#resume-slip button');
    await page.waitForFunction(() => document.getElementById('lectio-overlay').classList.contains('on'));
    await page.evaluate(() => {
      if (typeof lectioGo === 'function') lectioGo(3);
    });
    await page.waitForSelector('#lectio-note', { visible: true });
    await page.type('#lectio-note', 'Come.');
    await page.click('#lectio-room-3 .lectio-next');
    await page.waitForFunction(() => document.getElementById('amen').classList.contains('on'), { timeout: 3000 });
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on'), { timeout: 5000 });

    const today = await page.evaluate(() => ({
      flyleaf: !document.getElementById('flyleaf').hidden,
      flyleafLine: document.getElementById('flyleaf-line').textContent,
      beads: document.getElementById('path-beads').hidden,
      beadCount: document.querySelectorAll('.path-bead').length,
      rail: document.getElementById('path-rail').textContent,
      wordBeforeAff: document.getElementById('word-card').compareDocumentPosition(document.getElementById('aff-card')) & Node.DOCUMENT_POSITION_FOLLOWING,
      quietHour: document.getElementById('quiet-hour-select').value,
      askHim: document.body.innerText.includes('Ask Him'),
    }));
    assert(today.flyleaf, 'flyleaf hidden after Keep this');
    assert(/Come/i.test(today.flyleafLine), 'flyleaf should carry the kept line');
    assert(!today.beads && today.beadCount === 7, 'expected 7 path beads, got ' + today.beadCount);
    assert(/Day 1/i.test(today.rail), 'path rail missing Day 1: ' + today.rail);
    assert(today.wordBeforeAff, 'Word of the Day must sit above the letterpress card');
    assert(today.quietHour === '', 'quiet hour must stay Off');
    assert(!today.askHim, 'Ask Him leaked into the app');
  });

  await check('Hear this fills the rule', async () => {
    await page.click('#hear-word-btn');
    await page.waitForFunction(() => {
      const rule = document.getElementById('hear-rule');
      return rule && !rule.hidden;
    }, { timeout: 2000 });
  });

  await check('Advisor shame → John 8:11, Sit with this, no paywall', async () => {
    await page.click('#nav-advisor');
    await page.waitForSelector('#chat-input', { visible: true });
    const heading = await page.$eval('#advisor-page h1', (el) => el.innerText);
    assert(/His words/i.test(heading), 'advisor heading should name His words, got ' + heading);
    assert(!/Ask Him/i.test(heading), 'advisor still says Ask Him');
    await page.type('#chat-input', 'I feel so much shame');
    await page.click('#send-btn');
    await page.waitForFunction(() => {
      const msgs = document.getElementById('chat-messages').innerText;
      return /John 8:11/i.test(msgs);
    }, { timeout: 8000 });
    const chat = await page.$eval('#chat-messages', (el) => el.innerText);
    assert(!/daily_limit|unlock Plus|five free/i.test(chat), 'chat paywalled');
    const sit = await page.$('.sit-with-btn');
    assert(sit, 'Sit with this missing');
    await sit.click();
    await page.waitForFunction(() => document.getElementById('lectio-overlay').classList.contains('on'), { timeout: 4000 });
    await page.click('#lectio-overlay .sit-close');
  });

  await check('crisis phrase opens 988 modal', async () => {
    await page.click('#nav-advisor');
    await page.waitForSelector('#chat-input', { visible: true });
    await page.click('#chat-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#chat-input', 'I want to kill myself');
    await page.click('#send-btn');
    await page.waitForFunction(() => document.getElementById('crisis-modal').classList.contains('on'), { timeout: 4000 });
    const crisis = await page.$eval('#crisis-modal', (el) => el.innerText);
    assert(/988/.test(crisis), 'crisis missing 988');
    assert(/IASP/i.test(crisis), 'crisis missing IASP');
    await page.click('#crisis-close');
    await page.waitForFunction(() => !document.getElementById('crisis-modal').classList.contains('on'));
  });

  await check('Seek Peace cites a Gospel', async () => {
    await page.click('#nav-seek');
    await page.waitForSelector('.theme-card[data-theme="Peace"]', { visible: true });
    await page.click('.theme-card[data-theme="Peace"]');
    await page.waitForSelector('#enc-result.on', { timeout: 5000 });
    const enc = await page.$eval('#enc-passages', (el) => el.innerText);
    assert(/(matthew|mark|luke|john)/i.test(enc), 'seek Peace returned no Gospel citation');
  });

  await check('Journal keep + folio + Markdown export', async () => {
    await page.click('#nav-journal');
    await page.waitForSelector('#compose-line', { visible: true });
    await page.click('#compose-line');
    await page.type('#compose-line', 'A quiet line to keep.');
    await page.click('#compose-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById('journal-list').innerText.includes('A quiet line to keep.'));
    const exportVisible = await page.$eval('#export-md-btn', (el) => !el.hidden);
    assert(exportVisible, 'Markdown export should appear once a line is kept');
    await page.click('#journal-tools button[onclick="openFolio()"]');
    await page.waitForFunction(() => document.getElementById('folio-overlay').classList.contains('on'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('folio-overlay').classList.contains('on'));
  });

  await check('Settings: quiet hour Off, night paper opt-in', async () => {
    await page.click('button[aria-label="Settings"]');
    await page.waitForSelector('#settings-sheet.on');
    const qh = await page.$eval('#quiet-hour-select', (el) => el.value);
    assert(qh === '', 'Settings opened with a quiet hour already set');
    const dark = await page.$eval('#dark-toggle', (el) => el.checked);
    assert(!dark, 'Night paper must be off by default');
    await page.evaluate(() => document.getElementById('dark-toggle').click());
    const night = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(night === 'dark', 'Night paper toggle did not apply');
    await page.evaluate(() => document.getElementById('dark-toggle').click());
    const paper = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(paper === 'light', 'Night paper did not turn back off');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('settings-sheet').classList.contains('on'));
  });

  await check('desktop layout still paper', async () => {
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.click('#nav-today');
    const desk = await page.evaluate(() => {
      const app = getComputedStyle(document.getElementById('app')).backgroundColor;
      const theme = document.documentElement.getAttribute('data-theme');
      return { app, theme };
    });
    assert(desk.theme === 'light', 'desktop flipped off paper theme');
    assert(desk.app === 'rgb(246, 243, 236)' || desk.app === 'rgb(239, 232, 220)' || desk.app === 'rgb(244, 238, 228)', 'desktop app is not paper, got ' + desk.app);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
    assert(!overflow, 'horizontal overflow on desktop');
  });

  await check('no console exceptions', async () => {
    const real = consoleErrors.filter((e) => !/favicon|AbortError|Download/i.test(e));
    if (real.length) notes.push('console: ' + real.slice(0, 5).join(' | '));
    assert(real.length === 0, real.slice(0, 3).join(' | '));
  });

  await browser.close();

  if (notes.length) notes.forEach((n) => console.log('·', n));
  if (fails.length) {
    console.error('\n' + fails.length + ' browser QA failed');
    process.exit(1);
  }
  console.log('\nBrowser QA passed against', BASE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
