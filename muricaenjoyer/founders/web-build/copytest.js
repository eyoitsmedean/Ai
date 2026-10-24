const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 400, height: 800 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'null' }).catch(()=>{});
  const page = await ctx.newPage();
  await page.goto('file://' + path.resolve(process.argv[2]));
  await page.click('#q29 .bubble');
  await page.click('#q29 .copy');
  await page.waitForTimeout(300);
  console.log('label:', await page.textContent('#q29 .copy__label'), '| status:', await page.textContent('#q29 .copy__status'), '| fallback visible:', await page.isVisible('#q29 .copy__fallback'));
  // force the fallback path
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('no')) } }); document.execCommand = () => false; });
  await page.click('#q35 .bubble');
  await page.click('#q35 .copy');
  await page.waitForTimeout(300);
  console.log('fallback status:', await page.textContent('#q35 .copy__status'), '| textarea:', await page.inputValue('#q35 .copy__fallback'));
  await page.goto('file://' + path.resolve(process.argv[2]) + '#q34');
  await page.waitForTimeout(200);
  console.log('hash open:', await page.getAttribute('#q34 .bubble', 'aria-expanded'));
  await browser.close();
})();
