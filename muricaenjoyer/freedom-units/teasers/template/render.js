// Renders q1..q5 question + answer cards at exactly 1080x1350.  Usage: node render.js
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
const OUT = path.join(__dirname, '..');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let q = 1; q <= 5; q++) {
    for (const mode of ['question', 'answer']) {
      await p.goto('file://' + path.join(__dirname, 'card.html') + '?q=' + q + '&mode=' + mode);
      await p.evaluate(() => window.fitDone);
      const info = await p.evaluate(() => {
        const sign = document.getElementById('sign').getBoundingClientRect();
        const bad = [];
        document.querySelectorAll('#content *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width) return;
          if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') bad.push('scrollW:' + el.className);
          if (r.right > sign.right + 1 || r.left < sign.left - 1 || r.bottom > sign.bottom + 1) bad.push('outside:' + (el.className || el.tagName));
        });
        const box = document.getElementById('fitbox');
        if (box.scrollHeight > box.clientHeight + 1) bad.push('fitbox overflow ' + box.scrollHeight + '>' + box.clientHeight);
        const big = document.getElementById('big');
        if (big && big.scrollWidth > big.clientWidth) bad.push('big too wide');
        const foot = document.querySelector('.foot'); if (foot.scrollWidth > foot.clientWidth) bad.push('foot too wide');
        return { fit: window.fitSize, fonts: ['800 40px "Big Shoulders Display"', '600 20px "Libre Franklin"', '500 20px "IBM Plex Mono"'].map((f) => document.fonts.check(f)), bad };
      });
      const file = path.join(OUT, 'q' + q + '-' + mode + '.png');
      await p.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
      console.log(path.basename(file), JSON.stringify(info));
    }
  }
  await b.close();
})();
