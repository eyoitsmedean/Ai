#!/usr/bin/env node
/** Phone-viewport QA for the Ninety Days playbook. */
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://127.0.0.1:3010';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function main() {
  const fails = [];
  const check = async (name, fn) => {
    try { await fn(); console.log('ok', name); }
    catch (e) { fails.push(name + ': ' + e.message); console.error('FAIL', name, e.message); }
  };
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  const shotDir = process.env.SHOT_DIR || '/opt/cursor/artifacts/screenshots';
  const fs = require('fs');
  fs.mkdirSync(shotDir, { recursive: true });
  const shot = async (name) => {
    await page.screenshot({ path: shotDir + '/' + name + '.png', fullPage: false });
  };

  const openDrawer = async () => {
    const resting = await page.$eval('body', el => el.classList.contains('resting'));
    if (resting) await page.click('#tonight-min button[data-m="15"]');
  };

  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.removeItem('ninety.v1'));
  await page.reload({ waitUntil: 'networkidle0' });
  await shot('playbook-rest-first-screen');
  await page.$eval('#tonight-box', el => el.scrollIntoView({block:'start'}));
  await shot('playbook-tonight-first');

  await check('Rest is the first screen', async () => {
    const resting = await page.$eval('body', el => el.classList.contains('resting'));
    assert(resting, 'body.resting missing on default load');
    const hidden = await page.evaluate(() => {
      const vis = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return getComputedStyle(el).display !== 'none';
      };
      return {
        now: vis('#now'),
        board: vis('#board'),
        main: vis('main'),
        nav: vis('.nav'),
        tonight: vis('#tonight-box'),
        quiet: document.querySelector('#quiet') && getComputedStyle(document.querySelector('#quiet')).display !== 'none'
      };
    });
    assert(hidden.tonight, 'tonight hidden during Rest');
    assert(hidden.quiet, 'quiet footer hidden during Rest');
    assert(!hidden.now, '#now visible during Rest');
    assert(!hidden.board, '#board visible during Rest');
    assert(!hidden.main, 'main visible during Rest');
    assert(!hidden.nav, 'nav visible during Rest');
    const quiet = await page.$eval('#quiet', el => el.innerText);
    assert(/\$0/.test(quiet) && /Sunday 20 Sep/.test(quiet), quiet);
  });

  await check('15 minutes opens the drawer', async () => {
    await page.click('#tonight-min button[data-m="15"]');
    const resting = await page.$eval('body', el => el.classList.contains('resting'));
    assert(!resting, 'still resting after 15');
    const nowVis = await page.$eval('#now', el => getComputedStyle(el).display !== 'none');
    assert(nowVis, '#now still hidden after 15');
    await shot('playbook-hold-first-screen');
  });

  await check('45 and 90 HOLD copy stay distinct', async () => {
    await page.click('#tonight-min button[data-m="45"]');
    const t45 = await page.$eval('#tonight-move', el => el.innerText);
    assert(/45 minutes/i.test(t45), '45 label missing: ' + t45);
    assert(/M4|five gates|Do not apply/i.test(t45), '45 copy missing: ' + t45);
    assert(!/90 minutes/i.test(t45), '45 showed 90: ' + t45);
    assert(!/DEX room-inspect/i.test(t45), '45 showed 90 DEX copy: ' + t45);
    await page.click('#tonight-min button[data-m="90"]');
    const t90 = await page.$eval('#tonight-move', el => el.innerText);
    assert(/90 minutes/i.test(t90), '90 label missing: ' + t90);
    assert(/DEX room-inspect/i.test(t90), '90 copy missing: ' + t90);
    assert(!/45 minutes/i.test(t90), '90 showed 45: ' + t90);
    await page.click('#tonight-min button[data-m="15"]');
  });

  await check('HOLD card on first screen', async () => {
    const t = await page.$eval('#now', el => el.innerText);
    assert(/Money waits/i.test(t), 'missing HOLD headline: ' + t.slice(0, 200));
    assert(/\$0/.test(t), 'HOLD card should show $0');
    assert(!/send five/i.test(t), 'must not tell him to send videos');
    assert(/Sunday 20 Sep/i.test(t), 'weekday repair missing: ' + t);
    assert(!/Sunday 14 Sep/i.test(t), 'old false Sunday 14 still on first screen');
  });

  await check('honest cash fact is $0', async () => {
    const v = await page.$eval('#f-base', el => el.textContent.trim());
    assert(v === '$0', 'f-base is ' + v);
  });

  await check('default lane is none', async () => {
    const rec = await page.$eval('#receipt', el => el.innerText);
    assert(/No lane is written/i.test(rec), rec);
  });

  await check('tonight lives on the first screen', async () => {
    const box = await page.$('#tonight-box #tonight-move');
    assert(box, 'tonight-move missing from the first screen');
    const t = await page.$eval('#tonight-move', el => el.innerText);
    assert(/Nothing is the move|window is not confirmed|Go to bed|Write one sentence/i.test(t), t);
    const y = await page.$eval('#tonight-move', el => el.getBoundingClientRect().top);
    assert(y < 700, 'tonight still buried: top=' + y);
    const rest = await page.$('#tonight-min button[data-m="0"]');
    assert(rest, 'Rest button missing');
  });

  await check('write Lamp under HOLD stays $0', async () => {
    await page.click('#choice button[data-lane="lamp"]');
    const rec = await page.$eval('#receipt', el => el.innerText);
    assert(/The Lamp/i.test(rec), rec);
    const cash = await page.$eval('#honest', el => el.innerText);
    assert(/\$0/.test(cash), cash);
    assert(/window is not open/i.test(cash), cash);
    assert(!/1,920/.test(cash), 'must not model six weeks');
    const gates = await page.$eval('#gates', el => ({ hidden: el.hidden, text: el.innerText }));
    assert(!gates.hidden, 'Lamp gates should show');
    assert(/L&D years/i.test(gates.text), gates.text);
    assert(!/Start application|Apply now/i.test(gates.text), 'apply leaked onto gates');
  });

  await check('Lamp caption after local Confirmed', async () => {
    await page.click('#household button[data-w="confirmed"]');
    const cash = await page.$eval('#honest', el => el.innerText);
    assert(/\$0 until a billed hour/i.test(cash), cash);
    assert(!/80/.test(cash) || /Do not multiply/.test(cash), cash);
    await shot('playbook-lamp-window-open');
    await page.click('#household button[data-w="not"]');
  });

  await check('write Storefront still $0 while HOLD', async () => {
    await page.click('#choice button[data-lane="storefront"]');
    const rec = await page.$eval('#receipt', el => el.innerText);
    assert(/Storefront/i.test(rec) && /\$595/.test(rec), rec);
    const v = await page.$eval('#f-base', el => el.textContent.trim());
    assert(v === '$0', 'storefront under HOLD must stay $0, got ' + v);
  });

  await check('old One-Fix tick does not force video catch-up', async () => {
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('ninety.v1') || '{}');
      s.household = 'confirmed';
      s.choice = 'lamp';
      s.stack = { fix: { a: true, c: true } };
      localStorage.setItem('ninety.v1', JSON.stringify(s));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await openDrawer();
    const t = await page.$eval('#now', el => el.innerText);
    assert(!/sixty-second videos/i.test(t), 'catch-up leaked under Lamp: ' + t.slice(0, 240));
    assert(!/Five sixty/i.test(t), t.slice(0, 240));
    await page.click('#household button[data-w="not"]');
  });

  await check('Rest hides the drawer again', async () => {
    await page.click('#tonight-min button[data-m="0"]');
    const resting = await page.$eval('body', el => el.classList.contains('resting'));
    assert(resting, 'Rest did not restore body.resting');
    const nowVis = await page.$eval('#now', el => getComputedStyle(el).display !== 'none');
    assert(!nowVis, '#now still visible after Rest');
  });

  await check('Advent week 1 has no buy button', async () => {
    const res = await page.goto(BASE + '/advent.html', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'advent HTTP ' + (res && res.status()));
    const t = await page.evaluate(() => document.body.innerText);
    assert(/Come/i.test(t) && /Matthew 11:28/.test(t), 'missing Day 1');
    assert(/not for sale/i.test(t), 'missing not-for-sale');
    assert(!/Stripe|Buy|\$12/.test(t), 'commerce leaked onto Advent');
    await shot('advent-week-1');
  });

  await check('offer sheets lock $595', async () => {
    const res = await page.goto(BASE + '/offers.html', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'offers HTTP');
    const t = await page.evaluate(() => document.body.innerText);
    assert(/\$595/.test(t) && /\$349/.test(t) && /\$1,500/.test(t), 'missing Notion locks');
    assert(/HOLD/.test(t), 'missing HOLD');
  });

  await check('hold receipt', async () => {
    const res = await page.goto(BASE + '/hold.html', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'hold HTTP');
    const t = await page.evaluate(() => document.body.innerText);
    assert(/\$0/.test(t) && /Not confirmed/.test(t), t.slice(0, 200));
  });

  await check('no page errors on playbook', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    assert(errors.length === 0, errors.join(' | '));
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await shot('playbook-desktop-hold');
  });

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nall passed');
}

main().catch((e) => { console.error(e); process.exit(1); });
