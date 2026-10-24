const { chromium } = require('/usr/local/lib/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const dir = __dirname;
const page_src = fs.readFileSync(path.join(dir, '..', 'the-63.html'), 'utf8');
const wrapped = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>${page_src}</head><body></body></html>`;
// mimic publish: content goes in body
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page_src}</body></html>`;
fs.writeFileSync(path.join(dir, 'wrapped.html'), html);
(async () => {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  const configs = (process.argv[2] || 'desk-light,mob-dark').split(',');
  for (const cfg of configs) {
    const [kind, scheme] = cfg.split('-');
    const vw = kind === 'desk' ? 1280 : kind === 'tab' ? 820 : 400;
    const ctx = await browser.newContext({ viewport: { width: vw, height: kind==='desk'?900:860 }, colorScheme: scheme, reducedMotion: 'reduce', ignoreHTTPSErrors: true, deviceScaleFactor: kind==='desk'?1:2 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+': '+m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('requestfailed', r => errs.push('reqfail: ' + r.url().slice(0,100) + ' ' + (r.failure()||{}).errorText));
    await page.goto('file://' + path.join(dir, 'wrapped.html'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [];
      const W = de.clientWidth;
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > W + 1 || r.left < -1)) {
          // ignore children of scroll containers
          let p = el.parentElement, inScroll = false;
          while (p && p !== document.body) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(cs.overflowX)) { inScroll = true; break; } p = p.parentElement; }
          if (!inScroll) over.push(el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '-' + Math.round(r.right));
        }
      });
      const fonts = [...document.fonts].filter(f=>f.status==='loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style).slice(0,20);
      return { sw: de.scrollWidth, cw: de.clientWidth, h: de.scrollHeight, over: over.slice(0, 15), fonts, grain: getComputedStyle(de).getPropertyValue('--grain').slice(0,40) };
    });
    console.log(cfg, JSON.stringify(info));
    console.log('errors:', errs);
    await page.screenshot({ path: path.join(dir, 'shots', cfg + '.png'), fullPage: process.argv[3]==='full' });
    if (process.argv[4]) {
      // scroll to sections and screenshot
      for (const sel of process.argv[4].split('|')) {
        await page.evaluate(s => { const el = document.querySelector(s); el && el.scrollIntoView({block:'start'}); }, sel);
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(dir, 'shots', cfg + '_' + sel.replace(/[^a-z0-9]/gi,'') + '.png') });
      }
    }
    await ctx.close();
  }
  await browser.close();
})();
