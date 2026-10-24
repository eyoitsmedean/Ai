const { chromium } = require('/usr/local/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 400, height: 900 }, colorScheme: scheme });
    p.on('pageerror', e => console.log('pageerror:', e.message));
    await p.goto('file://' + process.argv[2]);
    await p.evaluate(() => window.ready);
    await p.evaluate(() => document.querySelector('details').open = true);
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    console.log(scheme, 'scrollWidth/clientWidth', sw);
    await p.screenshot({ path: process.argv[3] + '-' + scheme + '.png', fullPage: false });
  }
  await b.close();
})();
