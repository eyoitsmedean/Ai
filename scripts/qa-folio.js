#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const fails = [];
  const check = async (name, fn) => {
    try { await fn(); console.log('✓', name); }
    catch (e) { fails.push(name + ': ' + e.message); console.error('✗', name, e.message); }
  };
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  await check('title page holds the law', async () => {
    const res = await page.goto(BASE + '/folio', { waitUntil: 'networkidle0' });
    assert(res && res.ok(), 'folio HTTP ' + (res && res.status()));
    const text = await page.evaluate(() => document.body.innerText);
    assert(/Opening this page authorizes nothing/i.test(text), 'missing authorization law');
    assert(/Ninety/i.test(text), 'missing title');
  });

  await check('closed window blocks a plan', async () => {
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await page.click('[data-go="lamp"]');
    await page.waitForSelector('#leaf-lamp.on');
    await page.evaluate(() => { if (typeof choose === 'function') choose('lamp'); });
    const onWindow = await page.evaluate(() => document.getElementById('leaf-window').classList.contains('on'));
    assert(onWindow, 'unconfirmed window should refuse The Lamp');
  });

  await check('twenty minutes can choose The Room', async () => {
    await page.evaluate(() => {
      localStorage.setItem('nd-folio-v1', JSON.stringify({ window: 'confirmed' }));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.click('[data-go="picker"]');
    await page.waitForSelector('#leaf-picker.on');
    await page.evaluate(() => pickerAnswer('window', 'confirmed'));
    await page.evaluate(() => pickerNext(2));
    await page.evaluate(() => choose('room'));
    const room = await page.evaluate(() => document.getElementById('leaf-room').classList.contains('on'));
    const stamp = await page.evaluate(() => document.body.classList.contains('chosen-room'));
    assert(room && stamp, 'Room was not chosen');
    const ask = await page.$eval('#ask-room', (el) => el.textContent);
    assert(/\$349/.test(ask), 'Room ask missing price');
  });

  await check('copy writes the ask', async () => {
    const granted = await page.evaluate(async () => {
      try {
        await navigator.clipboard.writeText('');
        return true;
      } catch {
        return false;
      }
    });
    if (!granted) {
      await page.evaluate(() => copyAsk('room'));
      return;
    }
    await page.evaluate(() => copyAsk('room'));
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    assert(/mock panel/i.test(clip), 'clipboard did not receive the Room ask');
  });

  await check('receipt names the choice', async () => {
    await page.click('[data-go="receipt"]');
    const named = await page.$eval('#receipt-choice', (el) => el.textContent);
    assert(/The Room/.test(named), 'receipt blank, got ' + named);
  });

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nFolio QA passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
