// node render.js <template.html> <outdir> <prefix> <count>
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [tpl, out, prefix, n] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let i = 1; i <= +n; i++) {
    await pg.goto('file://' + path.resolve(tpl) + '?i=' + i);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(150);
    const ov = await pg.evaluate(() => {
      const c = document.getElementById('card');
      const bad = [];
      if (c.scrollHeight > c.clientHeight + 1) bad.push('card overflow ' + c.scrollHeight);
      document.querySelectorAll('#card *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > 1080.5 || r.bottom > 1350.5 || r.left < -0.5)) bad.push(e.className + ' ' + Math.round(r.right) + ',' + Math.round(r.bottom)); if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow==='hidden') bad.push('hidden-x ' + e.className); });
      return bad;
    });
    const f = path.join(out, prefix + i + '.png');
    await pg.screenshot({ path: f });
    console.log(f, ov.length ? 'ISSUES: ' + ov.join('; ') : 'ok');
  }
  await b.close();
})();
