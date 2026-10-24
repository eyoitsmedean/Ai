// usage: node render.js <playwright> <html> <outdir> <fps> [t1,t2,...]
const { chromium } = require(process.argv[2]);
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out, fps] = [process.argv[3], process.argv[4], +process.argv[5]];
  const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => console.log('page:', m.text()));
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://' + html);
  await p.evaluate(() => window.ready);
  const total = await p.evaluate(() => window.TOTAL);
  const times = only || Array.from({ length: Math.round(total * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    const url = await p.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, times[i]);
    const name = only ? `still-${String(times[i]).replace('.', '_')}.png` : `f${String(i).padStart(5, '0')}.png`;
    fs.writeFileSync(path.join(out, name), Buffer.from(url.split(',')[1], 'base64'));
  }
  if (!only) fs.writeFileSync(path.join(out, 'beats.json'), JSON.stringify(await p.evaluate(() => window.beats())));
  await b.close();
  console.log('frames', times.length);
})();
