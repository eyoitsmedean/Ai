const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = 'file://' + path.resolve(process.argv[2]);
  const out = process.argv[3];
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const shots = [
    { name: 'desk-light', w: 1280, h: 900, scheme: 'light' },
    { name: 'phone-dark', w: 400, h: 860, scheme: 'dark' },
  ];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, colorScheme: s.scheme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push(String(e)));
    page.on('requestfailed', r => errs.push('FAILED ' + r.url() + ' ' + r.failure().errorText));
    await page.goto(file, { waitUntil: 'networkidle' }).catch(e => errs.push(String(e)));
    await page.waitForTimeout(400);
    const fonts = await page.evaluate(() => Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style));
    const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    console.log(s.name, 'fonts:', [...new Set(fonts)].join(', ') || 'none', 'overflow:', JSON.stringify(overflow), errs.length ? 'ERRS: ' + errs.join(' | ') : '');
    await page.screenshot({ path: `${out}/${s.name}-top.png` });
    await page.screenshot({ path: `${out}/${s.name}-full.png`, fullPage: true });
    // open receipts: click 1st bubble and a system line
    await page.click('#q1 .bubble');
    await page.click('#q8 .bubble');
    await page.click('#s1 .sys__btn');
    await page.waitForTimeout(300);
    await page.locator('#q1').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    await page.screenshot({ path: `${out}/${s.name}-receipt.png` });
    // show all
    await page.click('#show-all');
    await page.waitForTimeout(300);
    const ov2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, open: document.querySelectorAll('.receipt:not([hidden])').length, all: document.querySelectorAll('.receipt').length, sw2: document.getElementById('show-all').getAttribute('aria-checked') }));
    console.log(s.name, 'after show-all', JSON.stringify(ov2));
    await page.locator('#q30').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${out}/${s.name}-all.png` });
    // ending
    await page.click('#show-all');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${s.name}-end.png` });
    await ctx.close();
  }
  await browser.close();
})();
