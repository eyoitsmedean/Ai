const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) } }); });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.click('#randomBtn', { timeout: 500 }).catch(() => {});
  await p.click('#playBtn'); await p.waitForTimeout(350);
  for (let r = 0; r < 10; r++) { await p.click('#lockBtn'); await p.waitForTimeout(420); await p.click('#nextBtn'); await p.waitForTimeout(420); }
  await p.waitForTimeout(300);
  await p.click('#copyBtn'); await p.waitForTimeout(200);
  const res = await p.evaluate(() => ({ status: document.getElementById('copyStatus').textContent, preHidden: document.getElementById('copyText').hidden, sel: String(getSelection()), score: document.getElementById('fsNum').textContent, bulbAnim: getComputedStyle(document.querySelector('.bulbs i')).animationName }));
  console.log(JSON.stringify(res), 'errors:', errs.length ? errs : 'none');
  await b.close();
})();
