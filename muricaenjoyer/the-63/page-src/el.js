const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, colorScheme: 'dark', reducedMotion: 'reduce', ignoreHTTPSErrors: true, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(__dirname, 'wrapped.html'), { waitUntil: 'networkidle' });
  await page.locator('#p-yellowstone').screenshot({ path: path.join(__dirname, 'shots', 'el-yellowstone-dark.png') });
  await browser.close();
})();
