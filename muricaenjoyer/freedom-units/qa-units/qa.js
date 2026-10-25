// Independent QA for Freedom Units. Usage: node qa.js [high|low|all]
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const QA = __dirname;
const SRC = path.resolve(QA, '../freedom-units.html');
const FONTS = path.resolve(QA, '../test');
const OUT = path.join(QA, 'out');
fs.mkdirSync(OUT, { recursive: true });

const src = fs.readFileSync(SRC, 'utf8');
// Minimal publish-like skeleton (doctype + charset + viewport), page content in body.
const harness = path.join(QA, 'page.html');
fs.writeFileSync(harness, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>' + src + '</body></html>');
const POOL = JSON.parse(src.match(/const POOL = (\[.*\]);\n/)[1]);
const fontCss = fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8');

// ---- independent re-implementation of the rules as stated on the page ----
const sig3 = (v) => +v.toPrecision(3);
function expectScore(g, a) {
  // "Within 5% scores 1,000. Ten times off scores zero." curve: (1-t)^1.6 between.
  const e = Math.abs(Math.log10(g) - Math.log10(a));
  const e0 = Math.log10(1.05);
  if (e <= e0 + 1e-12) return 1000;
  if (e >= 1) return 0;
  return Math.round(1000 * Math.pow(1 - (e - e0) / (1 - e0), 1.6));
}
const num = (t) => +String(t).replace(/,/g, '');

async function setup(browser, opts, initScript) {
  const ctx = await browser.newContext(opts);
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: fontCss }));
  await ctx.route('https://fonts.gstatic.com/**', (r) => {
    const f = path.join(FONTS, 'fonts', r.request().url().replace('https://fonts.gstatic.com/', '').replace(/\//g, '_'));
    if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
    return r.fulfill({ status: 404, body: '' });
  });
  if (initScript) await ctx.addInitScript(initScript);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  return { ctx, page, errors };
}

async function overflow(page, label, issues) {
  const o = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll('body *').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width && e.offsetParent !== null && (r.right > W + 0.5 || r.left < -0.5)) out.push(e.tagName + '.' + e.className + '#' + e.id + ' L' + Math.round(r.left) + ' R' + Math.round(r.right));
    });
    return { sw: document.documentElement.scrollWidth, cw: W, out: out.slice(0, 8) };
  });
  if (o.sw > o.cw) issues.push(`OVERFLOW ${label}: ${o.sw}>${o.cw} ${o.out.join(' ; ')}`);
  return o;
}

const readout = (page) => page.$eval('#readout', (e) => e.textContent);
const sliderVal = (page) => page.$eval('#slider', (e) => +e.value);

async function playGame(browser, { w, h, aim, scheme = 'light', tag }) {
  const log = [], issues = [];
  const { ctx, page, errors } = await setup(browser, { viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('file://' + harness);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await overflow(page, tag + ' start', issues);
  const vis = await page.evaluate(() => ['scr-start','scr-round','scr-final','reveal','resultBtn','copyText'].map((id) => id + ':' + getComputedStyle(document.getElementById(id)).display).join(' '));
  log.push('display at start: ' + vis);
  if (/scr-round:(?!none)|scr-final:(?!none)/.test(vis)) issues.push('hidden screens visible at start: ' + vis);
  await page.screenshot({ path: `${OUT}/${tag}-start.png`, fullPage: true });
  log.push('start label: ' + (await page.textContent('#dailyLabel')) + ' | play btn: ' + (await page.textContent('#playBtn')));

  // Sources drawer
  await page.click('#srcBtn');
  await page.waitForTimeout(300);
  const dl = await page.evaluate(() => ({ open: document.getElementById('srcDlg').open, items: document.querySelectorAll('#srcList > li').length, links: document.querySelectorAll('#srcList a').length, focus: document.activeElement.id }));
  log.push('sources: ' + JSON.stringify(dl));
  if (!dl.open || dl.items !== POOL.length) issues.push('sources drawer bad: ' + JSON.stringify(dl));
  await page.screenshot({ path: `${OUT}/${tag}-sources.png` });
  await overflow(page, tag + ' sources', issues);
  // close with Close button
  await page.click('#srcClose');
  await page.waitForTimeout(150);
  if (await page.$eval('#srcDlg', (d) => d.open)) issues.push('Close button did not close drawer');
  // reopen, close with Escape
  await page.click('#srcBtn'); await page.waitForTimeout(250);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  if (await page.$eval('#srcDlg', (d) => d.open)) issues.push('Escape did not close drawer');

  await page.click('#playBtn');
  await page.waitForTimeout(350);
  const focus0 = await page.evaluate(() => document.activeElement.id);
  if (focus0 !== 'slider') issues.push('slider not focused at round start: ' + focus0);
  const stored = await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('fu:prog:')) return JSON.parse(localStorage.getItem(k)); return null; });
  const order = stored && stored.order;
  log.push('order: ' + JSON.stringify(order));

  let running = 0;
  const factorsHigh = [1.03, 1.2, 1.5, 2, 3, 5, 9, 12, 1.08, 1.7];
  const factorsLow = [0.97, 0.85, 0.6, 0.5, 0.33, 0.2, 0.11, 0.08, 0.93, 0.7];
  for (let r = 0; r < 10; r++) {
    const prompt = await page.textContent('#prompt');
    const qi = POOL.findIndex((q) => q.prompt === prompt);
    if (qi < 0) { issues.push('R' + (r + 1) + ' prompt not in POOL'); }
    if (order && order[r] !== qi) issues.push(`R${r + 1} prompt idx ${qi} != stored order ${order[r]}`);
    const Q = POOL[qi];
    const a = Q.answer;
    const unit = await page.textContent('#unit');
    if (r === 0 || r === 4) { const f0 = await page.evaluate(() => { const r1 = document.getElementById('slider').getBoundingClientRect(), r2 = document.getElementById('lockBtn').getBoundingClientRect(); return { sliderBottom: Math.round(r1.bottom), lockBottom: Math.round(r2.bottom), vh: innerHeight, sy: Math.round(scrollY) }; }); log.push('  fold R' + (r + 1) + ': ' + JSON.stringify(f0)); }
    if (unit !== Q.unit) issues.push(`R${r + 1} unit mismatch ${unit} vs ${Q.unit}`);
    // keyboard: Home / End to read the window
    await page.focus('#slider');
    await page.keyboard.press('Home');
    const loTxt = await readout(page); const pHome = await sliderVal(page);
    await page.keyboard.press('End');
    const hiTxt = await readout(page); const pEnd = await sliderVal(page);
    const lo = num(loTxt), hi = num(hiTxt);
    if (pHome !== 0 || pEnd !== 1000) issues.push(`R${r + 1} Home/End gave ${pHome}/${pEnd}`);
    if (!(a >= lo && a <= hi)) issues.push(`R${r + 1} answer ${a} outside window ${lo}..${hi}`);
    const f = (aim === 'high' ? factorsHigh : factorsLow)[r];
    const tgt = Math.min(hi, Math.max(lo, a * f));
    const pos = Math.max(0, Math.min(1000, Math.round((1000 * Math.log(tgt / lo)) / Math.log(hi / lo))));
    const method = ['keys', 'keys', 'buttons', 'drag', 'keys', 'setvalue', 'keys', 'buttons', 'keys', 'setvalue'][r];
    if (method === 'keys') {
      await page.keyboard.press('Home');
      for (let i = 0; i < Math.floor(pos / 10); i++) await page.keyboard.press('Shift+ArrowRight');
      for (let i = 0; i < pos % 10; i++) await page.keyboard.press('ArrowRight');
      // exercise native arrow up/down + left too
      await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowLeft');
    } else if (method === 'buttons') {
      // start at 500, use +/- buttons (Shift+click = 10 via keyboard path not available on mouse), mix keyboard Enter on +
      await page.evaluate(() => { const s = document.getElementById('slider'); s.value = '500'; s.dispatchEvent(new Event('input', { bubbles: true })); });
      let d = pos - 500;
      const big = Math.trunc(d / 10);
      await page.focus('#slider');
      for (let i = 0; i < Math.abs(big); i++) await page.keyboard.press(big > 0 ? 'Shift+ArrowRight' : 'Shift+ArrowLeft');
      const small = d - big * 10;
      for (let i = 0; i < Math.abs(small); i++) await page.click(small > 0 ? '#plus' : '#minus');
    } else if (method === 'drag') {
      await page.waitForTimeout(500);
      await page.locator('#slider').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const box = await page.locator('#slider').boundingBox();
      const vis = await page.evaluate(() => { const r = document.getElementById('slider').getBoundingClientRect(); return { top: Math.round(r.top), vh: innerHeight, sy: scrollY }; });
      log.push(`  slider rect at drag: ${JSON.stringify(vis)}`);
      // thumb travel is width - thumb(30px)
      const travel = box.width - 30;
      await page.mouse.move(box.x + 15 + travel * 0.5, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 15 + travel * (pos / 1000), box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
      log.push('  after drag val ' + (await sliderVal(page)) + ' (aim ' + pos + ')');
      // fine-tune to exact pos with keyboard
      let cur = await sliderVal(page);
      await page.focus('#slider');
      let guard = 0;
      while (cur !== pos && guard++ < 60) { await page.keyboard.press(cur < pos ? 'ArrowRight' : 'ArrowLeft'); cur = await sliderVal(page); }
    } else {
      await page.evaluate((p) => { const s = document.getElementById('slider'); s.value = String(p); s.dispatchEvent(new Event('input', { bubbles: true })); }, pos);
    }
    const finalPos = await sliderVal(page);
    if (finalPos !== pos) issues.push(`R${r + 1} (${method}) slider at ${finalPos}, wanted ${pos}`);
    const gExp = sig3(lo * Math.pow(hi / lo, finalPos / 1000));
    const ro = await readout(page);
    if (Math.abs(num(ro) - gExp) / gExp > 0.006) issues.push(`R${r + 1} readout ${ro} vs expected ${gExp}`);
    const aria = await page.$eval('#slider', (e) => e.getAttribute('aria-valuetext'));
    if (r === 0) await page.screenshot({ path: `${OUT}/${tag}-r1-guess.png`, fullPage: true });
    // lock in
    if (r % 2 === 0) { await page.focus('#slider'); await page.keyboard.press('Enter'); }
    else await page.click('#lockBtn');
    await page.waitForTimeout(1100);
    const rev = await page.evaluate(() => ({
      verdict: document.getElementById('verdict').textContent,
      pts: document.getElementById('roundPts').textContent,
      you: document.getElementById('valYou').textContent,
      act: document.getElementById('valTruth').textContent,
      run: document.getElementById('runTotal').textContent,
      math: document.getElementById('math').textContent,
      focus: document.activeElement.id,
      revealHidden: document.getElementById('reveal').hidden,
      pill: (document.querySelector('#ruler .truth-mk b') || {}).textContent
    }));
    const sExp = expectScore(gExp, a);
    running += sExp;
    const ok = num(rev.pts) === sExp && num(rev.run) === running && Math.abs(num(rev.you) - gExp) / gExp < 0.006;
    if (!ok) issues.push(`R${r + 1} MATH MISMATCH: shown you=${rev.you} pts=${rev.pts} run=${rev.run}; expected g=${gExp} pts=${sExp} run=${running}`);
    if (num(rev.act) !== a) issues.push(`R${r + 1} actual shown ${rev.act} vs ${a}`);
    if (rev.focus !== 'nextBtn') issues.push(`R${r + 1} focus after lock = ${rev.focus}`);
    // verdict direction
    if (aim === 'high' && gExp > a * 1.05 && !/high/.test(rev.verdict)) issues.push(`R${r + 1} verdict "${rev.verdict}" for high guess`);
    if (aim === 'low' && gExp < a / 1.05 && !/low/.test(rev.verdict)) issues.push(`R${r + 1} verdict "${rev.verdict}" for low guess`);
    log.push(`R${r + 1} q${qi} [${Q.unit}] win ${loTxt}..${hiTxt} a=${a} f=${f} ${method} pos=${finalPos} readout=${ro} aria="${aria}" -> you ${rev.you} | ${rev.verdict} | +${rev.pts} (exp ${sExp}) run ${rev.run} | pill "${rev.pill}"`);
    await overflow(page, `${tag} reveal R${r + 1}`, issues);
    if (r === 0 || r === 9) await page.screenshot({ path: `${OUT}/${tag}-r${r + 1}-reveal.png`, fullPage: true });
    if (r === 2) {
      // mid-game reload: progress + same question should persist
      await page.reload(); await page.waitForTimeout(400);
      const btn = await page.textContent('#playBtn');
      log.push('mid-game reload play button: ' + btn);
      await page.click('#playBtn'); await page.waitForTimeout(350);
      const p2 = await page.textContent('#prompt');
      const revShown = !(await page.$eval('#reveal', (e) => e.hidden));
      if (p2 !== prompt || !revShown) issues.push('resume after reload lost state: ' + btn + ' sameQ=' + (p2 === prompt) + ' reveal=' + revShown);
      await page.waitForTimeout(450);
    }
    // advance: Enter on focused Next (even) / click (odd)
    if (r % 2 === 0) { await page.focus('#nextBtn'); await page.keyboard.press('Enter'); }
    else await page.click('#nextBtn');
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(1800);
  const fin = await page.evaluate(() => ({
    score: document.getElementById('fsNum').textContent,
    rank: document.getElementById('rankTitle').textContent,
    grid: [...document.querySelectorAll('#grid li')].map((l) => +l.textContent),
    imgLen: (document.getElementById('cardImg').src || '').length,
    visible: !document.getElementById('scr-final').hidden,
    focus: document.activeElement.id
  }));
  const rankExp = running >= 8500 ? 'Bald Eagle' : running >= 7000 ? 'Founding Father' : running >= 5000 ? 'Patriot' : running >= 2500 ? 'Road Tripper' : 'Tourist';
  log.push('FINAL ' + JSON.stringify(fin) + ' expected total ' + running + ' rank ' + rankExp);
  if (num(fin.score) !== running) issues.push('final total ' + fin.score + ' != ' + running);
  if (running < 0 || running > 10000) issues.push('total out of range');
  if (fin.rank !== rankExp) issues.push('rank ' + fin.rank + ' != ' + rankExp);
  await overflow(page, tag + ' final', issues);
  await page.screenshot({ path: `${OUT}/${tag}-final.png`, fullPage: true });
  const dataUrl = await page.$eval('#cardImg', (e) => e.src);
  if (dataUrl.startsWith('data:image/png')) fs.writeFileSync(`${OUT}/${tag}-card.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  else issues.push('card image missing');

  // Copy (clipboard granted)
  await page.click('#copyBtn'); await page.waitForTimeout(300);
  const st = await page.textContent('#copyStatus');
  let clip = ''; try { clip = await page.evaluate(() => navigator.clipboard.readText()); } catch (e) { clip = 'ERR ' + e.message; }
  log.push('copy status: ' + st + ' | clipboard: ' + JSON.stringify(clip));
  const lines = clip.split('\n');
  const tiers = fin.grid.map((s) => (s >= 800 ? '■' : s >= 400 ? '▣' : '□')).join('');
  if (!/^Freedom Units #\d+: [\d,]+\/10,000$/.test(lines[0]) || num(lines[0].split(': ')[1].split('/')[0]) !== running || lines[1] !== rankExp || lines[2] + lines[3] !== tiers) issues.push('share text wrong: ' + JSON.stringify(clip));

  // Reload: start should show result
  await page.reload(); await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ play: document.getElementById('playBtn').textContent, note: document.getElementById('playedNote').textContent, res: !document.getElementById('resultBtn').hidden }));
  log.push('after reload: ' + JSON.stringify(after));
  if (!after.res) issues.push('result button missing after reload');
  await page.click('#resultBtn'); await page.waitForTimeout(400);
  const again = await page.textContent('#fsNum');
  if (num(again) !== running) issues.push('stored result shows ' + again);
  await overflow(page, tag + ' final-restored', issues);
  log.push('console/page errors: ' + (errors.length ? errors.join(' | ') : 'none'));
  if (errors.length) issues.push('console errors: ' + errors.join(' | '));
  await ctx.close();
  return { log, issues, order };
}

async function seedCheck(browser) {
  const res = [];
  const orders = [];
  for (let i = 0; i < 2; i++) {
    const { ctx, page } = await setup(browser, { viewport: { width: 800, height: 900 } });
    await page.goto('file://' + harness);
    await page.click('#playBtn'); await page.waitForTimeout(250);
    const g = await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('fu:prog:')) return localStorage.getItem(k); });
    const p1 = await page.textContent('#prompt');
    // wipe storage, reload, play again in same context
    await page.evaluate(() => localStorage.clear());
    await page.reload(); await page.waitForTimeout(250);
    await page.click('#playBtn'); await page.waitForTimeout(250);
    const g2 = await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('fu:prog:')) return localStorage.getItem(k); });
    const o1 = JSON.parse(g), o2 = JSON.parse(g2);
    orders.push(JSON.stringify([o1.order, o1.windows]));
    res.push(`ctx${i}: same after clear+reload: ${JSON.stringify([o1.order, o1.windows]) === JSON.stringify([o2.order, o2.windows])}, R1="${p1.slice(0, 50)}"`);
    // practice game differs
    await ctx.close();
  }
  res.push('same across fresh contexts: ' + (orders[0] === orders[1]));
  res.push('windows: ' + orders[0]);
  return res;
}

async function fallbackCheck(browser, w, execOk) {
  const { ctx, page, errors } = await setup(browser, { viewport: { width: w, height: 860 } }, execOk ? () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } });
  } : () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } });
    document.execCommand = () => false;
  });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('file://' + harness);
  await page.click('#playBtn'); await page.waitForTimeout(350);
  for (let r = 0; r < 10; r++) { await page.click('#lockBtn'); await page.waitForTimeout(420); await page.click('#nextBtn'); await page.waitForTimeout(420); }
  await page.waitForTimeout(1600);
  await page.click('#copyBtn'); await page.waitForTimeout(250);
  let realClip = '';
  try { realClip = await page.evaluate(() => Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard').get.call(navigator).readText()); } catch (e) { realClip = 'ERR ' + e.message; }
  const res = await page.evaluate(() => ({ status: document.getElementById('copyStatus').textContent, preHidden: document.getElementById('copyText').hidden, sel: String(getSelection()), pre: document.getElementById('copyText').textContent }));
  await page.screenshot({ path: `${OUT}/fallback-${w}-${execOk ? 'exec' : 'select'}.png`, fullPage: false });
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await ctx.close();
  return { execOk, realClip, res, overflow: o, errors };
}

async function extraChecks(browser) {
  const out = [];
  // drawer: click in padding keeps it open; click on backdrop closes it
  {
    const { ctx, page } = await setup(browser, { viewport: { width: 1280, height: 900 } });
    await page.goto('file://' + harness);
    await page.click('#srcBtn'); await page.waitForTimeout(350);
    const r = await page.$eval('#srcDlg', (d) => { const b = d.getBoundingClientRect(); return { l: b.left, t: b.top, b: b.bottom }; });
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y).id, [r.l + 8, r.b - 8]);
    await page.mouse.click(r.l + 8, r.b - 8); await page.waitForTimeout(150);
    const afterPad = await page.$eval('#srcDlg', (d) => d.open);
    await page.mouse.click(200, 400); await page.waitForTimeout(150);
    const afterBackdrop = await page.$eval('#srcDlg', (d) => d.open);
    out.push(`drawer: padding hit=${hit} open after padding click=${afterPad}; open after backdrop click=${afterBackdrop}`);
    // keyboard: Enter on Sources, Tab inside, Escape
    await page.focus('#srcBtn'); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
    const kbOpen = await page.$eval('#srcDlg', (d) => d.open);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    out.push(`drawer keyboard open=${kbOpen} closed=${!(await page.$eval('#srcDlg', (d) => d.open))} focus back=${await page.evaluate(() => document.activeElement.id)}`);
    await ctx.close();
  }
  // 320px overflow on all screens
  {
    const issues = [];
    const { ctx, page, errors } = await setup(browser, { viewport: { width: 320, height: 640 } });
    await page.goto('file://' + harness); await page.waitForTimeout(300);
    await overflow(page, '320 start', issues);
    await page.click('#playBtn'); await page.waitForTimeout(450);
    await overflow(page, '320 round', issues);
    for (let r = 0; r < 10; r++) { await page.click('#lockBtn'); await page.waitForTimeout(450); await overflow(page, '320 reveal' + r, issues); await page.click('#nextBtn'); await page.waitForTimeout(450); }
    await page.waitForTimeout(1600);
    await overflow(page, '320 final', issues);
    await page.screenshot({ path: `${OUT}/w320-final.png`, fullPage: true });
    out.push('320px: ' + (issues.length ? issues.join(' | ') : 'no overflow') + ' errors=' + (errors.join('|') || 'none'));
    await ctx.close();
  }
  // tiny-window readout precision (Daily #7 round 2 = Saturn V, window 0.01..5)
  {
    const { ctx, page, errors } = await setup(browser, { viewport: { width: 400, height: 860 } }, () => {
      const RD = Date; const delta = 6 * 864e5;
      class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + delta); } static now() { return RD.now() + delta; } }
      window.Date = FD;
    });
    await page.goto('file://' + harness);
    const label = await page.textContent('#dailyLabel');
    await page.click('#playBtn'); await page.waitForTimeout(450);
    await page.click('#lockBtn'); await page.waitForTimeout(450); await page.click('#nextBtn'); await page.waitForTimeout(450);
    const unit = await page.textContent('#unit');
    await page.focus('#slider'); await page.keyboard.press('Home');
    const seen = [];
    for (let i = 0; i < 6; i++) { seen.push(await page.textContent('#readout')); await page.keyboard.press('ArrowRight'); }
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    const you = await page.textContent('#valYou'), pts = await page.textContent('#roundPts');
    const ticks = await page.$$eval('#ruler .lb', (l) => l.map((e) => e.style.visibility === 'hidden' ? '(' + e.textContent + ')' : e.textContent).join(' '));
    await page.screenshot({ path: `${OUT}/smallwin-reveal.png`, fullPage: true });
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    out.push(`tiny window: ${label} [${unit}] readouts pos0..5: ${seen.join(' | ')} -> locked at pos 6, You shown ${you}, +${pts}; ruler ${ticks}; overflow ${ov}; errors ${errors.join('|') || 'none'}`);
    await ctx.close();
  }
  return out;
}

(async () => {
  const which = process.argv[2] || 'all';
  const browser = await chromium.launch();
  const runs = [
    { w: 400, h: 860, aim: 'high', tag: 'w400-high' },
    { w: 1280, h: 900, aim: 'low', tag: 'w1280-low' },
    { w: 1280, h: 900, aim: 'high', tag: 'w1280-high', scheme: 'dark' },
    { w: 400, h: 860, aim: 'low', tag: 'w400-low', scheme: 'dark' }
  ].filter((r) => which === 'all' || r.tag.includes(which));
  for (const r of runs) {
    const { log, issues } = await playGame(browser, r);
    console.log('==== ' + r.tag + '\n' + log.join('\n') + '\nISSUES: ' + (issues.length ? '\n  ' + issues.join('\n  ') : 'none'));
  }
  if (which === 'all' || which === 'seed') console.log('==== seed\n' + (await seedCheck(browser)).join('\n'));
  if (which === 'all' || which === 'fallback') for (const w of [400, 1280]) for (const ex of [true, false]) console.log('==== copy fallback ' + w + '\n' + JSON.stringify(await fallbackCheck(browser, w, ex)));
  if (which === 'all' || which === 'extra') console.log('==== extra\n' + (await extraChecks(browser)).join('\n'));
  await browser.close();
})();
