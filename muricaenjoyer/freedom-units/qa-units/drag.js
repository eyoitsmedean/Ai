const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const w of [400, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 860 } });
    await p.goto('file://' + path.join(__dirname, 'page.html'));
    await p.click('#playBtn'); await p.waitForTimeout(400);
    const box = await p.locator('#slider').boundingBox();
    const sc = await p.evaluate(() => scrollY);
    console.log(w, 'box', JSON.stringify(box), 'scrollY', sc, 'val', await p.$eval('#slider', e => e.value));
    const travel = box.width - 30;
    for (const frac of [0.5, 0.2, 0.8]) {
      await p.mouse.move(box.x + 15 + travel * 0.5, box.y + box.height / 2);
      await p.mouse.down();
      const v0 = await p.$eval('#slider', e => e.value);
      await p.mouse.move(box.x + 15 + travel * frac, box.y + box.height / 2, { steps: 10 });
      await p.mouse.up();
      const el = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.id || e.className); }, [box.x + 15 + travel * 0.5, box.y + box.height / 2]);
      console.log(' frac', frac, 'after down', v0, 'after drag', await p.$eval('#slider', e => e.value), 'readout', await p.textContent('#readout'), 'hit', el);
    }
    await p.close();
  }
  await b.close();
})();
