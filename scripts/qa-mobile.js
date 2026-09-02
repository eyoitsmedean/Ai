#!/usr/bin/env node
/**
 * Hostile iPhone + Android viewport QA.
 * Usage: node scripts/qa-mobile.js [baseUrl]
 */
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

const DEVICES = [
  { name: 'iPhone 15', width: 393, height: 852, dpr: 3, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
  { name: 'iPhone SE', width: 375, height: 667, dpr: 2, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1' },
  { name: 'Pixel 8', width: 412, height: 915, dpr: 2.625, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
  { name: 'Galaxy S21', width: 360, height: 800, dpr: 3, ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function freshGuest(page) {
  await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#ob-ack', { timeout: 8000 });
  await page.click('#ob-ack');
  await page.click('#ob-open');
  await page.waitForSelector('#ob-need.on', { timeout: 4000 });
  await page.click('.tp-skip');
  await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 5000 });
  await page.waitForFunction(() => document.getElementById('sit-sheet').classList.contains('on'), { timeout: 8000 }).catch(() => {});
}

async function finishSit(page) {
  await page.evaluate(() => {
    if (typeof goSitReflect === 'function') goSitReflect();
    if (typeof startSitRest === 'function') startSitRest();
    if (typeof finishSitRest === 'function') finishSitRest();
    const reply = document.getElementById('sit-reply');
    if (reply) reply.value = 'Peace.';
    if (typeof keepSitReply === 'function') keepSitReply();
  });
  await page.waitForFunction(() => !document.getElementById('sit-sheet').classList.contains('on'), { timeout: 6000 }).catch(() => {});
}

async function main() {
  const fails = [];
  const ok = (name) => console.log('✓', name);
  const check = async (name, fn) => {
    try { await fn(); ok(name); }
    catch (e) { fails.push(name + ': ' + e.message); console.error('✗', name, e.message); }
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (const device of DEVICES) {
    const page = await browser.newPage();
    await page.setViewport({ width: device.width, height: device.height, deviceScaleFactor: device.dpr, isMobile: true, hasTouch: true });
    await page.setUserAgent(device.ua);
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));

    await check(device.name + ' — first session', async () => {
      await freshGuest(page);
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      assert(theme === 'light', 'default theme ' + theme);
      await finishSit(page);
      const today = await page.evaluate(() => ({
        seven: document.querySelectorAll('.seven-day').length,
        dock: getComputedStyle(document.getElementById('nav')).display !== 'none',
        askHim: document.body.innerText.includes('Ask Him'),
        gate: !!document.getElementById('chat-gate'),
      }));
      assert(today.seven === 7, 'seven days missing');
      assert(today.dock, 'dock hidden on phone');
      assert(!today.askHim, 'must not say Ask Him');
      assert(!today.gate, 'paywall gate returned');
    });

    await check(device.name + ' — Advisor sit + bless', async () => {
      await page.click('#nav-advisor');
      await page.waitForSelector('#chat-input', { timeout: 4000 });
      await page.type('#chat-input', 'I feel shame');
      await page.click('#send-btn');
      await page.waitForFunction(() => {
        return /John|Matthew|Mark|Luke/i.test(document.getElementById('chat-messages')?.innerText || '');
      }, { timeout: 20000 });
      const sitBtn = await page.$('#sit-from-letter');
      assert(sitBtn, 'Sit with this missing after a letter');
      await sitBtn.click();
      await page.waitForSelector('#sit-sheet.on', { timeout: 4000 });
      await page.evaluate(() => { if (typeof closeSit === 'function') closeSit(); });

      await page.click('#nav-today');
      await page.evaluate(() => { if (typeof blessingFromToday === 'function') blessingFromToday(); });
      await page.waitForSelector('#blessing-sheet.on', { timeout: 6000 });
      const url = await page.evaluate(() => typeof blessingUrl === 'function' ? blessingUrl() : '');
      assert(/\/b\//.test(url), 'blessing URL missing');
      await page.evaluate(() => { if (typeof closeBlessing === 'function') closeBlessing(); });
    });

    await check(device.name + ' — no page errors', async () => {
      assert(errors.length === 0, errors.join(' | '));
    });

    await page.close();
  }

  const desk = await browser.newPage();
  await desk.setViewport({ width: 1280, height: 800 });
  await check('desktop rail still lives', async () => {
    await desk.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const rail = await desk.evaluate(() => {
      const el = document.querySelector('.rail');
      return el && getComputedStyle(el).display !== 'none';
    });
    assert(rail, 'desktop rail hidden');
  });
  await desk.close();

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nMobile QA passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
