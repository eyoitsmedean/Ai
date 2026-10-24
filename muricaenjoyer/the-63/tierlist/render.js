// Usage: node render.js <page.html> <out.png> <W> <H>
// Loads the page at an exact viewport, fits the title line and the chip font size to the
// available space (largest size with no overflow), checks for clipping, then screenshots.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [src, out, W, H] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(async () => {
    const root = document.documentElement;
    // 1) Fit [data-fitw] title lines to the page content width (largest size up to 140px).
    const fitted = [];
    for (const el of document.querySelectorAll('[data-fitw]')) {
      const avail = document.querySelector('.page').clientWidth -
        parseFloat(getComputedStyle(document.querySelector('.page')).paddingLeft) * 2;
      el.style.width = 'max-content'; el.style.alignSelf = 'flex-start';
      let lo = 30, hi = 140;
      for (let i = 0; i < 22; i++) {
        const m = (lo + hi) / 2; el.style.fontSize = m + 'px';
        if (el.getBoundingClientRect().width <= avail) lo = m; else hi = m;
      }
      el.style.fontSize = Math.floor(lo) + 'px'; el.style.width = ''; el.style.alignSelf = '';
      fitted.push(Math.floor(lo));
    }
    // 2) Fit chip font size so every row fits on the board with no horizontal overflow.
    const board = document.getElementById('board');
    const chipsEls = [...document.querySelectorAll('.chips')];
    const fits = () => board.scrollHeight <= board.clientHeight + 0.5 &&
      chipsEls.every(c => c.scrollWidth <= c.clientWidth + 0.5);
    let lo = 10, hi = 90;
    for (let i = 0; i < 24; i++) {
      const m = (lo + hi) / 2; root.style.setProperty('--fs', m + 'px');
      if (fits()) lo = m; else hi = m;
    }
    const fs = Math.floor(lo * 2) / 2; root.style.setProperty('--fs', fs + 'px');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    // 3) Clipping checks.
    const vw = innerWidth, vh = innerHeight, problems = [];
    for (const el of document.querySelectorAll('.page *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.left < -0.5 || r.top < -0.5 || r.right > vw + 0.5 || r.bottom > vh + 0.5)
        problems.push(`${el.className || el.tagName} out of viewport ${JSON.stringify(r)}`);
    }
    const br = board.getBoundingClientRect();
    const chips = [...document.querySelectorAll('.chip')];
    for (const c of chips) {
      const r = c.getBoundingClientRect(), pr = c.parentElement.getBoundingClientRect();
      if (r.right > pr.right + 0.5 || r.bottom > br.bottom + 0.5 || r.top < br.top - 0.5)
        problems.push('chip clipped: ' + c.textContent);
      if (c.scrollWidth > c.clientWidth + 0.5) problems.push('chip text overflow: ' + c.textContent);
    }
    const rows = [...document.querySelectorAll('.row')].map(r => {
      const lines = new Set([...r.querySelectorAll('.chip')].map(c => Math.round(c.getBoundingClientRect().top)));
      return { tier: r.querySelector('.L').textContent, height: Math.round(r.getBoundingClientRect().height), lines: lines.size };
    });
    const fam = getComputedStyle(document.querySelector('.chip')).fontFamily;
    return { fs, sfs: +(fs * parseFloat(getComputedStyle(root).getPropertyValue('--sboost'))).toFixed(1),
      titleFit: fitted, chipCount: chips.length, rows, problems,
      fontsLoaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight), fam };
  });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})();
