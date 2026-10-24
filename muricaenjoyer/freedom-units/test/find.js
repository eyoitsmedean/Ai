const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 860 } });
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.click('#playBtn'); await p.waitForTimeout(350);
  for (let r = 0; r < 10; r++) { await p.click('#lockBtn'); await p.waitForTimeout(450); await p.click('#nextBtn'); await p.waitForTimeout(350); }
  await p.waitForTimeout(1600);
  const res = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('#scr-final *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.right > 400.5 || r.left < -0.5) out.push(e.tagName + '.' + e.className + '#' + e.id + ' L' + Math.round(r.left) + ' R' + Math.round(r.right)); });
    return out.slice(0, 20);
  });
  console.log(res.join('\n'));
  await b.close();
})();
