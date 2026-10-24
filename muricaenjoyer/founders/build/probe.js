const { chromium } = require('/usr/local/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  p.on('console', m => console.log('page:', m.text()));
  await p.goto('file://' + process.argv[2]);
  await p.evaluate(() => window.ready);
  console.log(await p.evaluate(() => JSON.stringify({ total: window.TOTAL, beats: window.beats(), items: ITEMS.map(i => [i.k, i.who || '', +(i.typStart ?? 0).toFixed(2), +i.tIn.toFixed(2), i.h]) })));
  await b.close();
})();
