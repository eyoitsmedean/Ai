const { chromium } = require('/usr/local/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const src = fs.readFileSync(path.resolve(__dirname, '../swarm/units/freedom-units.html'), 'utf8');
const POOL = JSON.parse(src.match(/const POOL = (\[.*\]);\n/)[1]);
const shift = (ctx, d) => ctx.addInitScript((off) => {
  const RD = Date; const delta = off * 864e5;
  class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + delta); } static now() { return RD.now() + delta; } }
  window.Date = FD;
}, d);
(async () => {
  const b = await chromium.launch();
  const found = [];
  const lows = {};
  for (let d = 0; d < 40; d++) {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
    await shift(ctx, d);
    const p = await ctx.newPage();
    await p.goto('file://' + path.join(__dirname, 'page.html'));
    const label = await p.textContent('#dailyLabel');
    await p.click('#playBtn'); await p.waitForTimeout(150);
    const g = await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('fu:prog:')) return JSON.parse(localStorage.getItem(k)); });
    g.order.forEach((qi, r) => { if (g.windows[r].lo < 0.1) { lows[qi] = (lows[qi] || []).concat(g.windows[r].lo); if ((qi === 24 || qi === 10 || found.length < 1) && !found.some((x) => x.qi === qi)) found.push({ d, label, r, qi, w: g.windows[r] }); } });
    await ctx.close();
  }
  console.log('windows with lo<0.1:', JSON.stringify(lows));
  console.log(JSON.stringify(found));
  // play to that round on that date and inspect readouts near lo
  for (const f of found) {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
    await shift(ctx, f.d);
    const p = await ctx.newPage();
    await p.goto('file://' + path.join(__dirname, 'page.html'));
    await p.click('#playBtn'); await p.waitForTimeout(450);
    for (let r = 0; r < f.r; r++) { await p.click('#lockBtn'); await p.waitForTimeout(450); await p.click('#nextBtn'); await p.waitForTimeout(450); }
    await p.focus('#slider'); await p.keyboard.press('Home');
    const seen = [];
    for (let i = 0; i < 12; i++) { seen.push(await p.textContent('#readout')); await p.keyboard.press('Shift+ArrowRight'); }
    const ticks = await p.$$eval('#ruler .lb', (l) => l.map((e) => e.textContent).join(' '));
    // lock at a low value to see You value
    await p.keyboard.press('Home'); for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    const ro = await p.textContent('#readout');
    await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
    const you = await p.textContent('#valYou');
    console.log(f.label, 'q' + f.qi, POOL[f.qi].unit, JSON.stringify(f.w), '\n readouts (Home, +10 steps each):', seen.join(' | '), '\n ruler:', ticks, '\n readout at pos 3:', ro, 'You shown:', you);
    await p.screenshot({ path: path.join(__dirname, 'out', 'smallwin-' + f.d + '.png'), fullPage: true });
    await ctx.close();
  }
  await b.close();
})();
