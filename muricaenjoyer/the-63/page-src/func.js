const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const proxy = process.env.HTTPS_PROXY;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type()==='error') errs.push(m.text()) });
  await page.goto('file://' + path.join(__dirname, 'wrapped.html'), { waitUntil: 'networkidle' });
  const q = async () => page.evaluate(() => ({ count: document.querySelector('#count').textContent, cards: [...document.querySelectorAll('#list .park')].map(e => e.querySelector('.rk').textContent + ' ' + e.querySelector('.p-name').textContent.replace(/ National.*/,'') + ' [' + e.querySelector('.f-visits dd').textContent + ']').slice(0, 6), divs: document.querySelectorAll('#list .tdiv').length }));
  console.log('init', JSON.stringify(await q()));
  await page.click('#f-tier button[data-v="A"]'); console.log('tier A', JSON.stringify(await q()));
  await page.selectOption('#f-where', 'r:Alaska'); console.log('A+Alaska', JSON.stringify(await q()));
  await page.check('#f-kids'); console.log('A+Alaska+kids', JSON.stringify(await q()));
  await page.click('#f-tier button[data-v="S"]'); console.log('S+Alaska+kids (empty)', JSON.stringify(await q()), await page.isVisible('.empty'));
  await page.click('.empty [data-clear]'); console.log('cleared', JSON.stringify(await q()));
  await page.selectOption('#f-sort', 'visits'); console.log('visits', JSON.stringify(await q()));
  await page.selectOption('#f-sort', 'size'); console.log('size', JSON.stringify(await q()));
  await page.selectOption('#f-sort', 'oldest'); console.log('oldest', JSON.stringify(await q()));
  await page.selectOption('#f-sort', 'rank');
  await page.selectOption('#f-where', 's:California'); console.log('CA', JSON.stringify(await q()));
  // jump to a park hidden by filter
  await page.click('a.chip[data-jump="p-acadia"]');
  await page.waitForTimeout(300);
  console.log('after jump', JSON.stringify(await q()), await page.evaluate(() => { const r = document.getElementById('p-acadia').getBoundingClientRect(); return [Math.round(r.top), document.activeElement.id, document.getElementById('p-acadia').className]; }));
  // copy
  await page.click('#copy-top'); await page.waitForTimeout(300);
  console.log('copy status:', await page.textContent('#copy-status'), 'fallback visible:', await page.isVisible('#copy-fallback'));
  // reweight: max access only
  await page.evaluate(() => { for (const id of ['w-scenery','w-unique','w-crowd']) { const el = document.getElementById(id); el.value = 0; el.dispatchEvent(new Event('input', {bubbles:true})); } });
  console.log('access only:', await page.evaluate(() => [...document.querySelectorAll('#rw-top li')].slice(0,4).map(l => l.textContent).join(' | ')), await page.textContent('#rw-note'));
  await page.evaluate(() => { const el = document.getElementById('w-access'); el.value = 0; el.dispatchEvent(new Event('input', {bubbles:true})); });
  console.log('all zero:', await page.textContent('#rw-note'), await page.textContent('#w-access-o'));
  await page.click('#rw-reset'); console.log('reset:', await page.textContent('#rw-note'));
  console.log('notes:', (await page.textContent('#notes')).slice(380, 760));
  console.log('worked:', await page.textContent('#worked'));
  console.log('errors', errs);
  await browser.close();
})();
