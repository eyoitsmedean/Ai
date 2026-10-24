const { chromium } = require('/usr/local/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const T = __dirname;
const SRC = path.join(T, '..', 'freedom-units.html');
const SHOTS = path.join(T, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const skeleton = (body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
const harness = path.join(T, 'index.html');
const HOOK = "window.__fuAnswer = () => G && G.phase === 'guess' ? ({ answer: curQ().answer, lo: curW().lo, hi: curW().hi }) : null;\nconst hot = window.claude && window.claude.hot;";
const srcHtml = fs.readFileSync(SRC, 'utf8');
if (!srcHtml.includes('const hot = window.claude && window.claude.hot;')) throw new Error('hook anchor missing');
fs.writeFileSync(harness, skeleton(srcHtml.replace('const hot = window.claude && window.claude.hot;', HOOK)));
const fontCss = fs.readFileSync(path.join(T, 'fonts.css'), 'utf8');

const which = process.argv[2] || 'all';

async function setup(browser, opts) {
  const ctx = await browser.newContext(opts);
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: fontCss }));
  await ctx.route('https://fonts.gstatic.com/**', (r) => {
    const f = path.join(T, 'fonts', r.request().url().replace('https://fonts.gstatic.com/', '').replace(/\//g, '_'));
    if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
    return r.fulfill({ status: 404, body: '' });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));
  return { ctx, page, errors };
}

async function overflow(page, label, report) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (o.sw > o.cw) {
    const offenders = await page.evaluate(() => { const W = document.documentElement.clientWidth; const out = []; document.querySelectorAll('body *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && (r.right > W + 0.5 || r.left < -0.5)) out.push(e.tagName + '.' + e.className + '#' + e.id + ' L' + Math.round(r.left) + ' R' + Math.round(r.right)); }); return out.slice(0, 12); });
    report.push(`OVERFLOW at ${label}: scrollWidth ${o.sw} > ${o.cw} :: ` + offenders.join(' ; '));
  }
  return o;
}

async function playThrough(browser, w, h, scheme, tag) {
  const report = [];
  const { ctx, page, errors } = await setup(browser, { viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: w < 500 ? 2 : 1 });
  try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) { report.push('grantPermissions failed: ' + e.message); }
  await page.goto('file://' + harness);
  await page.waitForTimeout(700);
  await page.evaluate(() => document.fonts.ready);
  const fontsOk = await page.evaluate(() => ['900 20px "Big Shoulders Display"', '400 16px "Libre Franklin"', '400 14px "IBM Plex Mono"'].map((f) => document.fonts.check(f)));
  report.push('fonts loaded: ' + fontsOk.join(','));
  await overflow(page, 'start', report);
  await page.screenshot({ path: `${SHOTS}/${tag}-1-start.png`, fullPage: true });

  // Sources drawer
  await page.click('#srcBtn');
  await page.waitForTimeout(350);
  const dlgOpen = await page.evaluate(() => document.getElementById('srcDlg').open);
  report.push('sources open: ' + dlgOpen + ', items: ' + (await page.locator('#srcList > li').count()));
  if (tag.startsWith('w400-light')) await page.screenshot({ path: `${SHOTS}/${tag}-sources.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  report.push('sources closed: ' + !(await page.evaluate(() => document.getElementById('srcDlg').open)));

  await page.click('#playBtn');
  await page.waitForTimeout(300);
  const order = await page.evaluate(() => {
    const t = document.querySelector('#roundNo').textContent; return t;
  });
  report.push('round header: ' + order);

  for (let r = 0; r < 10; r++) {
    // Different input methods per round
    const info = await page.evaluate(() => ({
      readout: document.getElementById('readout').textContent,
      unit: document.getElementById('unit').textContent,
      prompt: document.getElementById('prompt').textContent.slice(0, 50),
      focused: document.activeElement && document.activeElement.id,
      labels: [...document.querySelectorAll('#ruler .lb')].map((e) => e.textContent).join(' ')
    }));
    if (r === 0) {
      // keyboard: arrow keys (slider has focus)
      for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Shift+ArrowLeft');
    } else if (r === 1) {
      // + / - buttons
      for (let i = 0; i < 8; i++) await page.click('#plus');
      await page.click('#minus');
    } else if (r === 2) {
      // drag the slider with the mouse
      const box = await page.locator('#slider').boundingBox();
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 8 });
      await page.mouse.up();
    } else {
      // aim near the true answer with some noise to get varied scores
      const noise = [1.02, 1.3, 0.6, 2.5, 1.08, 0.92, 4][r - 3];
      await page.evaluate((n) => {
        const s = document.getElementById('slider');
        const lo = +s.dataset.lo, hi = +s.dataset.hi;
        // derive answer from the ruler's truth window by reading the internal map isn't possible; use exposed test hook
        const a = window.__fuAnswer && window.__fuAnswer();
        if (!a) return;
        const pos = Math.round(1000 * Math.log((a.answer * n) / a.lo) / Math.log(a.hi / a.lo));
        s.value = String(Math.max(0, Math.min(1000, pos)));
        s.dispatchEvent(new Event('input', { bubbles: true }));
      }, noise);
    }
    const before = await page.evaluate(() => document.getElementById('readout').textContent);
    if (r === 0 && tag.endsWith('light')) await page.screenshot({ path: `${SHOTS}/${tag}-2-guess.png`, fullPage: true });
    // lock in: Enter for even rounds (keyboard), click for odd
    if (r % 2 === 0) {
      await page.focus('#slider').catch(() => {});
      await page.keyboard.press('Enter');
    } else await page.click('#lockBtn');
    await page.waitForTimeout(r === 0 ? 1400 : 450);
    const rev = await page.evaluate(() => ({
      verdict: document.getElementById('verdict').textContent,
      pts: document.getElementById('roundPts').textContent,
      you: document.getElementById('valYou').textContent,
      act: document.getElementById('valTruth').textContent,
      focus: document.activeElement && document.activeElement.id,
      truthPill: !!document.querySelector('#ruler .truth-mk')
    }));
    report.push(`R${r + 1} [${info.unit}] start=${info.readout} guess=${before} ruler="${info.labels}" -> ${rev.verdict} +${rev.pts} (you ${rev.you} vs ${rev.act}) focus=${rev.focus} pill=${rev.truthPill}`);
    await overflow(page, 'reveal r' + (r + 1), report);
    if (r === 0) await page.screenshot({ path: `${SHOTS}/${tag}-3-reveal.png`, fullPage: true });
    // advance: Enter on focused Next for even, click for odd
    await page.waitForTimeout(420);
    if (r % 2 === 0) await page.keyboard.press('Enter');
    else await page.click('#nextBtn');
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2200);
  const fin = await page.evaluate(() => ({
    score: document.getElementById('fsNum').textContent,
    rank: document.getElementById('rankTitle').textContent,
    grid: [...document.querySelectorAll('#grid li')].map((l) => l.className + ':' + l.textContent).join(' '),
    img: (document.getElementById('cardImg').src || '').length,
    visible: !document.getElementById('scr-final').hidden
  }));
  report.push('FINAL ' + JSON.stringify(fin));
  await overflow(page, 'final', report);
  await page.screenshot({ path: `${SHOTS}/${tag}-4-final.png`, fullPage: true });
  await page.screenshot({ path: `${SHOTS}/${tag}-4-final-fold.png` });

  // save card image
  const dataUrl = await page.evaluate(() => document.getElementById('cardImg').src);
  if (dataUrl.startsWith('data:image/png')) fs.writeFileSync(`${SHOTS}/${tag}-card.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));

  // copy
  await page.click('#copyBtn');
  await page.waitForTimeout(300);
  const status = await page.textContent('#copyStatus');
  let clip = '';
  try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch (e) { clip = 'readText failed: ' + e.message; }
  const pre = await page.evaluate(() => ({ hidden: document.getElementById('copyText').hidden, text: document.getElementById('copyText').textContent, sel: String(window.getSelection()) }));
  report.push('COPY status="' + status + '" clip=' + JSON.stringify(clip) + ' pre=' + JSON.stringify(pre));

  // reload: start screen should show played note
  await page.reload();
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({ play: document.getElementById('playBtn').textContent, note: document.getElementById('playedNote').textContent, resHidden: document.getElementById('resultBtn').hidden }));
  report.push('AFTER RELOAD ' + JSON.stringify(st));
  if (!st.resHidden) {
    await page.click('#resultBtn');
    await page.waitForTimeout(400);
    report.push('result view score: ' + (await page.textContent('#fsNum')));
  }
  report.push('console/page errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  await ctx.close();
  return report;
}

(async () => {
  // expose a test-only hook by injecting a tiny script that reads internal state via the DOM is not possible,
  // so add one through addInitScript that the page doesn't know about: patch Math.log10 is overkill. Instead the
  // test reads the window bounds from the ruler and the answer from POOL via the prompt text.
  const browser = await chromium.launch();
  const runs = [
    [400, 860, 'light', 'w400-light'],
    [1280, 900, 'light', 'w1280-light'],
    [400, 860, 'dark', 'w400-dark'],
    [1280, 900, 'dark', 'w1280-dark']
  ].filter((r) => which === 'all' || r[3].includes(which));
  for (const [w, h, s, tag] of runs) {
    const rep = await playThrough(browser, w, h, s, tag);
    console.log('==== ' + tag + '\n' + rep.join('\n'));
  }
  await browser.close();
})();
