// usage: node render-range.js <playwright> <html> <outdir> <fps> <worker> <nworkers>
const { chromium } = require(process.argv[2]);
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out, fps, w, nw] = [process.argv[3], process.argv[4], +process.argv[5], +process.argv[6], +process.argv[7]];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://' + html);
  await p.evaluate(() => window.ready);
  const total = await p.evaluate(() => window.TOTAL);
  const n = Math.round(total * fps); let c = 0;
  for (let i = w; i < n; i += nw) {
    const url = await p.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, i / fps);
    fs.writeFileSync(path.join(out, `f${String(i).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64')); c++;
  }
  if (w === 0) fs.writeFileSync(path.join(out, 'beats.json'), JSON.stringify(await p.evaluate(() => window.beats())));
  await b.close();
  console.log('worker', w, 'frames', c, 'of', n);
})();
