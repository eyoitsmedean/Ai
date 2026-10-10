#!/usr/bin/env node
'use strict';
/**
 * Build Words in Frame: 12 typographic prints x 5 ratios, a contact sheet and a size guide.
 *
 *   node products/wall-art/build.js                 everything -> products/wall-art/dist/
 *   node products/wall-art/build.js --check         verify quotations only
 *   node products/wall-art/build.js --preview[=0.2] small proofs of every design/ratio to the scratch dir
 *   node products/wall-art/build.js --only=1,5      limit to some designs (any mode)
 *   node products/wall-art/build.js --pdf-only      rebuild the two PDFs only (WALLART_PROOF=1 also writes PNG proofs)
 *
 * Every master is rendered by Chromium with the viewport equal to the output
 * size in pixels (300 dpi), checked for safe margins, collisions and text,
 * written as JPEG with 300 dpi set in its JFIF header, and its pixel size read
 * back from the file.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const HERE = __dirname;
const DIST = path.join(HERE, 'dist');
const FONTS = path.join(HERE, '..', 'forty-days', 'fonts');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SCRATCH = process.env.WALLART_TMP || path.join(os.tmpdir(), 'wall-art-build');

const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a === `--${k}` || a.startsWith(`--${k}=`));
const flagVal = (k) => { const f = flag(k); return f && f.includes('=') ? f.split('=')[1] : null; };

// ---- 1. Quotations: the build stops if any differs from the red-letter corpus.
const verify = require('./verify');
verify.run({ quiet: !flag('check') });
const { collection, ratios, designs, sizeGuide, DPI, SAFE_MARGIN_IN } = require('./designs');
// Second, independent pass: every quote, and the lines as printed, against the corpus.
{
  const corpus = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', 'data', 'spoken-gospels.json'), 'utf8'));
  for (const d of designs) {
    const err = verify.checkQuote(d.quote, d.ref, corpus) || verify.checkQuote(d.lines.join(' '), d.ref, corpus);
    if (err) throw new Error(`design ${d.n}: ${err}`);
  }
  console.log(`verified ${designs.length} quotations against data/spoken-gospels.json`);
}
if (flag('check')) process.exit(0);

const { page } = require('./templates');
const only = flagVal('only') ? flagVal('only').split(',').map(Number) : null;
const chosen = designs.filter((d) => !only || only.includes(d.n));
const nn = (n) => String(n).padStart(2, '0');
const fileName = (d, r) => `design-${nn(d.n)}-${d.slug}-${r.key}.jpg`;

// ---- JPEG helpers --------------------------------------------------------------
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error('bad JPEG marker');
    const m = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error('no SOF in JPEG');
}
function jpegDpi(buf) {
  if (buf.readUInt16BE(2) === 0xffe0 && buf.toString('ascii', 6, 10) === 'JFIF') {
    return { units: buf[13], x: buf.readUInt16BE(14), y: buf.readUInt16BE(16) };
  }
  return null;
}
// Set (or insert) a JFIF APP0 segment saying 300 dpi, so print software opens the file at its true inch size.
function setJpegDpi(buf, dpi) {
  if (jpegDpi(buf)) {
    const out = Buffer.from(buf);
    out[13] = 1; out.writeUInt16BE(dpi, 14); out.writeUInt16BE(dpi, 16);
    return out;
  }
  const app0 = Buffer.alloc(18);
  app0.writeUInt16BE(0xffe0, 0); app0.writeUInt16BE(16, 2); app0.write('JFIF\0', 4, 'ascii');
  app0[9] = 1; app0[10] = 1; app0[11] = 1; app0.writeUInt16BE(dpi, 12); app0.writeUInt16BE(dpi, 14);
  return Buffer.concat([buf.subarray(0, 2), app0, buf.subarray(2)]);
}

// ---- Rendering -------------------------------------------------------------------
async function renderSheet(browser, d, r, { scale = 1, out, type = 'jpeg' }) {
  const w = Math.round(r.px[0] * scale), h = Math.round(r.px[1] * scale);
  const pxPerIn = (DPI * scale * r.px[0]) / Math.round(r.master.w * DPI);
  const html = page(d, { w, h, pxPerIn, safeIn: SAFE_MARGIN_IN });
  fs.mkdirSync(SCRATCH, { recursive: true });
  const htmlPath = path.join(SCRATCH, `sheet-${d.n}-${r.key}-${scale}.html`);
  fs.writeFileSync(htmlPath, html);
  const p = await browser.newPage();
  try {
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    const res = await p.evaluate(() => window.__layout());
    // Rendered text must be the verified quotation, word for word.
    if (verify.norm(res.text) !== verify.norm(d.quote) || res.text !== d.lines.join(' ')) {
      res.problems.push(`rendered text "${res.text}" differs from the quotation`);
    }
    if (res.citePt * Math.min(1, 8 / r.master.w) < 6.5 && scale === 1) {
      // Citation at the smallest common print of this ratio (about 8 in wide) should stay above ~6.5 pt.
      res.problems.push(`citation too small (${res.citePt.toFixed(1)} pt at master)`);
    }
    if (res.problems.length) throw new Error(`design ${nn(d.n)} ${r.key}: ${res.problems.join('; ')}`);
    await p.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 200)))));
    let buf = Buffer.from(await p.screenshot({ type, quality: type === 'jpeg' ? 92 : undefined, clip: { x: 0, y: 0, width: w, height: h }, captureBeyondViewport: false }));
    if (type === 'jpeg') {
      if (scale === 1) buf = setJpegDpi(buf, DPI);
      const got = jpegSize(buf);
      if (got.w !== w || got.h !== h) throw new Error(`${path.basename(out)}: got ${got.w}x${got.h}, expected ${w}x${h}`);
    }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
    return { ...res, w, h, bytes: buf.length };
  } finally {
    await p.close();
    fs.rmSync(htmlPath, { force: true });
  }
}


// Large sheets can be captured before every tile has painted (seen once: a 11x14 master
// with half its text missing). Each master is decoded in Chromium, shrunk, and compared
// with a small fresh render of the same design; a mismatch means re-render.
// Comparisons run one at a time in their own Chromium, restarted every few files,
// so decoding the 77-megapixel 2:3 masters never starves the renderer.
let cmpBrowser = null, cmpUses = 0, cmpQueue = Promise.resolve();
async function getCmpBrowser() {
  if (cmpBrowser && (cmpUses >= 8 || !cmpBrowser.connected)) { await cmpBrowser.close().catch(() => {}); cmpBrowser = null; }
  if (!cmpBrowser) {
    cmpBrowser = await require('puppeteer-core').launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-dev-shm-usage'], protocolTimeout: 300000 });
    cmpUses = 0;
  }
  cmpUses++;
  return cmpBrowser;
}
function compareWithReference(_browser, d, r, file) {
  const job = cmpQueue.then(async () => compareOnce(await getCmpBrowser(), d, r, file));
  cmpQueue = job.catch(() => {});
  return job;
}
async function closeCmpBrowser() { if (cmpBrowser) await cmpBrowser.close().catch(() => {}); }
async function compareOnce(browser, d, r, file) {
  const refW = 480;
  const ref = path.join(SCRATCH, 'ref', `ref-${d.n}-${r.key}.png`);
  const refRes = await renderSheet(browser, d, r, { scale: refW / r.px[0], out: ref, type: 'png' });
  const p = await browser.newPage();
  try {
    const cmp = path.join(SCRATCH, 'ref', `cmp-${d.n}-${r.key}.html`);
    fs.writeFileSync(cmp, `<body><img id="a" src="file://${file}"><img id="b" src="file://${ref}"></body>`);
    await p.goto(`file://${cmp}`, { waitUntil: 'load' });
    const diff = await p.evaluate(async (hairlines) => {
      const a = document.getElementById('a'), b = document.getElementById('b');
      // img.decode() refuses the 7200 x 10800 master; createImageBitmap can downscale it while decoding.
      const W = b.naturalWidth, H = b.naturalHeight;
      const px = async (img) => { const bm = await createImageBitmap(img, { resizeWidth: W, resizeHeight: H, resizeQuality: 'high' }); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(bm, 0, 0); bm.close(); return x.getImageData(0, 0, W, H).data; };
      const A = await px(a), B = await px(b);
      // Compare mean colour of 24x24 blocks (5% of the width), so hinting and sub-pixel
      // differences between the two sizes average out while missing text does not.
      const B8 = 24;
      let worst = 0, sum = 0, n = 0;
      // Skip blocks crossed by a straight hairline border (2 px slack at reference size).
      const onHairline = (bx, by) => hairlines.some(([l, t, r, b]) => bx < r * W + 2 && bx + B8 > l * W - 2 && by < b * H + 2 && by + B8 > t * H - 2);
      for (let by = 0; by + B8 <= H; by += B8) for (let bx = 0; bx + B8 <= W; bx += B8) {
        if (onHairline(bx, by)) continue;
        const sa = [0, 0, 0], sb = [0, 0, 0];
        for (let y = by; y < by + B8; y++) for (let x = bx; x < bx + B8; x++) { const i = (y * W + x) * 4; for (let k = 0; k < 3; k++) { sa[k] += A[i + k]; sb[k] += B[i + k]; } }
        const da = (Math.abs(sa[0] - sb[0]) + Math.abs(sa[1] - sb[1]) + Math.abs(sa[2] - sb[2])) / (3 * B8 * B8); worst = Math.max(worst, da); sum += da; n++;
      }
      return { mean: sum / n, worst };
    }, refRes.hairlines || []);
    fs.rmSync(cmp, { force: true });
    return diff;
  } finally { await p.close(); }
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}

// ---- PDFs ------------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fontCss() {
  const f = (name, file, style, weight) => `@font-face{font-family:"${name}";src:url("file://${path.join(FONTS, file)}");font-style:${style};font-weight:${weight};}`;
  return f('Fell', 'IMFeENrm28P.ttf', 'normal', '400') + f('Fell', 'IMFeENit28P.ttf', 'italic', '400') +
    f('Literata', 'Literata[opsz,wght].ttf', 'normal', '200 900') + f('Literata', 'Literata-Italic[opsz,wght].ttf', 'italic', '200 900');
}
const FONT_WAIT = `async () => { await Promise.all(['400 20px Fell','italic 400 20px Fell','400 20px Literata','500 20px Literata','600 20px Literata','italic 400 20px Literata'].map(f => document.fonts.load(f, 'Aa 0123'))); await document.fonts.ready;
  const bad = []; document.querySelectorAll('.page').forEach((pg, i) => { if (pg.scrollHeight > pg.clientHeight + 1 || pg.scrollWidth > pg.clientWidth + 1) bad.push('page ' + (i + 1) + ' overflows'); });
  document.querySelectorAll('img').forEach((im) => { if (!im.complete || !im.naturalWidth) bad.push('image missing ' + im.src); });
  return bad; }`;

async function pdf(browser, html, out) {
  const htmlPath = path.join(SCRATCH, path.basename(out) + '.html');
  fs.writeFileSync(htmlPath, html);
  const p = await browser.newPage();
  try {
    await p.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    const bad = await p.evaluate(`(${FONT_WAIT})()`);
    if (process.env.WALLART_PROOF) {
      // Proof PNGs of each PDF page for review.
      const n = await p.evaluate(() => document.querySelectorAll('.page').length);
      for (let i = 0; i < n; i++) {
        const box = await p.evaluate((i) => { const r = document.querySelectorAll('.page')[i].getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height }; }, i);
        await p.setViewport({ width: Math.ceil(box.width), height: 800, deviceScaleFactor: 1.5 });
        await p.screenshot({ path: path.join(SCRATCH, `${path.basename(out, '.pdf')}-p${i + 1}.png`), clip: box, captureBeyondViewport: true });
      }
    }
    if (bad.length) throw new Error(`${path.basename(out)}: ${bad.join('; ')}`);
    await p.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  } finally { await p.close(); fs.rmSync(htmlPath, { force: true }); }
}

const BASE_CSS = `*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#f6f3ee}
body{font-family:Literata,Georgia,serif;color:#23201d;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-variant-numeric:lining-nums}
.page{position:relative;overflow:hidden;page-break-after:always;background:#f6f3ee}
.page:last-child{page-break-after:auto}
.eyebrow{font:500 7.5pt Literata;letter-spacing:0.22em;text-transform:uppercase;color:#a3142c}
h1,h2{font-family:Fell;font-weight:400}
.rule{border-top:0.6pt solid #a3142c;width:0.5in}`;

function contactSheetHtml(thumbs) {
  const cells = designs.map((d) => `<figure>
      <img src="file://${thumbs[d.n]}">
      <figcaption><span class="n">${nn(d.n)}</span> ${esc(d.title)}<br><span class="ref">${esc(d.ref)}</span></figcaption>
    </figure>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE_CSS}
@page{size:17in 11in;margin:0}
.page{width:17in;height:11in;padding:0.6in 0.7in 0.5in}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:0.6pt solid #cfc9c1;padding-bottom:0.14in}
header h1{font-size:30pt;line-height:1}
header .sub{font:italic 400 11pt Literata;color:#6f6a64;margin-top:4pt}
header .meta{text-align:right;font:400 8.5pt/1.5 Literata;color:#6f6a64}
.grid{display:grid;grid-template-columns:repeat(6,1fr);column-gap:0.32in;row-gap:0.42in;margin-top:0.5in}
figure img{display:block;width:100%;aspect-ratio:4/5;box-shadow:0 0 0 0.5pt rgba(35,32,29,0.18),0 2pt 6pt rgba(35,32,29,0.12)}
figcaption{font:400 9pt/1.35 Literata;margin-top:7pt}
figcaption .n{font-weight:600;color:#a3142c;margin-right:3pt}
figcaption .ref{font-size:7.5pt;letter-spacing:0.14em;text-transform:uppercase;color:#6f6a64}
footer{position:absolute;left:0.7in;right:0.7in;bottom:0.4in;display:flex;justify-content:space-between;font:400 7.5pt Literata;color:#6f6a64;letter-spacing:0.04em}
</style></head><body><section class="page">
<header><div><div class="eyebrow">${esc(collection.brand)}</div><h1>${esc(collection.name)}</h1><div class="sub">${esc(collection.subtitle)}</div></div>
<div class="meta">12 designs, 5 frame shapes each<br>4:5 &middot; 3:4 &middot; 2:3 &middot; 11 x 14 &middot; ISO A<br>300 dpi JPG, ${esc(collection.edition)}</div></header>
<div class="grid">${cells}</div>
<footer><span>Shown in the 4:5 shape. Every design is drawn again for each shape, so nothing is cropped.</span><span>${esc(collection.licence)}</span></footer>
</section></body></html>`;
}

function sizeGuideHtml() {
  // Proportional outlines of the five shapes, scaled to their master sizes.
  const maxH = 36;
  const shapes = ratios.map((r) => {
    const s = 2.3 / maxH; // inches on the page per inch of print
    const w = r.master.w * s, h = r.master.h * s;
    return `<div class="shape"><div class="box" style="width:${w.toFixed(3)}in;height:${h.toFixed(3)}in"><span>${esc(r.label)}</span></div>
      <div class="cap">${r.key === 'iso' ? 'A3' : `${r.master.w} x ${r.master.h} in`}</div></div>`;
  }).join('');
  const rows = ratios.map((r) => `<tr>
      <td class="shape-name">${esc(r.label)}</td>
      <td>${r.prints.map(esc).join('<br>')}</td>
      <td class="file">design-XX-name-<b>${esc(r.key)}</b>.jpg</td>
      <td class="px">${r.px[0]} x ${r.px[1]} px<br><span>${r.key === 'iso' ? 'A3' : `${r.master.w} x ${r.master.h} in`} at 300 dpi</span></td>
    </tr>`).join('');
  const frames = [
    ['4 x 6 in', '2x3', 'Not recommended: the citation prints very small. Smallest suggested 2:3 size is 8 x 12 in.'], ['5 x 7 in', 'iso', 'The ISO file is about 1/16 in taller than 7 in; the frame lip or mat hides it.'],
    ['8 x 10 in', '4x5'], ['8 x 12 in', '2x3'], ['11 x 14 in', '11x14'], ['12 x 16 in', '3x4'], ['12 x 18 in', '2x3'],
    ['16 x 20 in', '4x5'], ['18 x 24 in', '3x4'], ['20 x 30 in', '2x3'], ['24 x 36 in', '2x3'],
    ['A5, A4, A3', 'iso'], ['A2, A1', 'iso', 'Same shape as A3. Good up to A2; for larger, view from a little distance.'],
  ];
  const frameRows = frames.map(([f, k, note]) => `<tr><td>${f}</td><td class="file">-${k}.jpg</td><td class="note">${note ? esc(note) : ''}</td></tr>`).join('');
  const list = designs.map((d) => `<li><span class="n">${nn(d.n)}</span><span class="t">${esc(d.title)}</span><span class="ref">${esc(d.ref)}</span></li>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE_CSS}
@page{size:8.5in 11in;margin:0}
.page{width:8.5in;height:11in;padding:0.75in 0.8in 0.7in}
h1{font-size:30pt;line-height:1.05;margin:6pt 0 12pt}
h2{font-size:15pt;margin:0 0 7pt}
p{font:400 10pt/1.55 Literata}
.intro{max-width:5.6in;color:#3a3632}
.shapes{display:flex;align-items:flex-end;gap:0.32in;margin:0.3in 0 0.08in}
.shape .box{border:0.8pt solid #23201d;background:#ece6dd;display:flex;align-items:center;justify-content:center;position:relative}
.shape .box::after{content:"";position:absolute;inset:0.05in;border:0.4pt dashed rgba(163,20,44,0.6)}
.shape .box span{font:500 11pt Literata;letter-spacing:0.04em;color:#a3142c}
.shape .cap{font:400 7.5pt Literata;color:#6f6a64;text-align:center;margin-top:4pt}
.legend{font:italic 400 8pt Literata;color:#6f6a64;margin-bottom:0.22in}
table{width:100%;border-collapse:collapse;font:400 9pt/1.4 Literata}
th{font:500 7pt Literata;letter-spacing:0.18em;text-transform:uppercase;color:#a3142c;text-align:left;padding:0 8pt 5pt 0;border-bottom:0.6pt solid #a3142c}
td{padding:5pt 8pt 5pt 0;border-bottom:0.4pt solid #d9d2c8;vertical-align:top}
td.shape-name{font:500 11pt Literata;width:0.8in;color:#a3142c}
td.file{font-size:8.5pt;color:#3a3632}
td.file b{color:#a3142c;font-weight:600}
td.px{font-size:8.5pt;white-space:nowrap}
td.px span{color:#6f6a64;font-size:7.5pt}
td.note{font-size:8pt;color:#6f6a64}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0.4in}
ul.tips{list-style:none}
ul.tips li{font:400 9.3pt/1.45 Literata;padding:0 0 5pt 12pt;position:relative}
ul.tips li::before{content:"";position:absolute;left:0;top:0.62em;width:4pt;height:4pt;background:#a3142c;transform:rotate(45deg)}
ol.designs{list-style:none;font:400 9pt Literata}
ol.designs li{display:grid;grid-template-columns:0.3in 1fr auto;padding:3.6pt 0;border-bottom:0.4pt solid #e1dbd2}
ol.designs .n{color:#a3142c;font-weight:600}
ol.designs .ref{font-size:7.5pt;letter-spacing:0.12em;text-transform:uppercase;color:#6f6a64;padding-top:1pt}
ol.designs .slug{font-size:8pt;color:#6f6a64}
.foot{position:absolute;left:0.8in;right:0.8in;bottom:0.45in;display:flex;justify-content:space-between;font:400 7.5pt Literata;color:#8a847d}
.closing{font:italic 400 14pt Fell;color:#a3142c;margin-top:0.22in}
table.frames td{padding:2.8pt 8pt 2.8pt 0}
table.frames th{white-space:nowrap}
</style></head><body>
<section class="page">
  <div class="eyebrow">${esc(collection.brand)} &middot; ${esc(collection.name)}</div>
  <h1>${esc(sizeGuide.title)}</h1>
  <p class="intro">${esc(sizeGuide.intro)}</p>
  <div class="shapes">${shapes}</div>
  <div class="legend">The five shapes drawn to scale. The dashed line is the 0.4 in margin that stays clear of text.</div>
  <table><thead><tr><th>Shape</th><th>Prints at</th><th>File ending</th><th>Pixels</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="foot"><span>${esc(sizeGuide.fileNaming)}</span><span>1 / 2</span></div>
</section>
<section class="page">
  <div class="eyebrow">Find your frame</div>
  <h2 style="margin-top:8pt">Frame size to file</h2>
  <table class="frames" style="margin-bottom:0.2in"><thead><tr><th>Your frame or mat opening</th><th>Print this file</th><th>Note</th></tr></thead><tbody>${frameRows}</tbody></table>
  <div class="cols">
    <div><h2>Printing tips</h2><ul class="tips">${sizeGuide.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    <div><h2>The twelve designs</h2><ol class="designs">${list}</ol></div>
  </div>
  <div class="closing">${esc(sizeGuide.closing)}</div>
  <div class="foot"><span>${esc(collection.licence)}</span><span>2 / 2</span></div>
</section></body></html>`;
}

if (flag('selftest-compare')) {
  // Detector self-test: compare a master with its own reference and with another design's.
  (async () => {
    const puppeteer = require('puppeteer-core');
    const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
    const r = ratios.find((x) => x.key === (flagVal('selftest-compare') || '11x14'));
    const [a, b] = [designs[9], designs[0]];
    const fa = path.join(SCRATCH, 'self-a.jpg');
    await renderSheet(browser, a, r, { out: fa });
    console.log('same design', await compareWithReference(browser, a, r, fa));
    console.log('other design', await compareWithReference(browser, b, r, fa));
    await browser.close();
    await closeCmpBrowser();
  })();
} else
// ---- Main ------------------------------------------------------------------------
(async () => {
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
    protocolTimeout: 600000,
  });
  const t0 = Date.now();
  try {
    if (flag('preview')) {
      const scale = Number(flagVal('preview') || 0.12);
      const outDir = path.join(SCRATCH, 'preview');
      const jobs = chosen.flatMap((d) => ratios.map((r) => ({ d, r })));
      const res = await pool(jobs, 4, ({ d, r }) => renderSheet(browser, d, r, { scale, out: path.join(outDir, fileName(d, r)) }).catch((e) => ({ err: e.message })));
      jobs.forEach(({ d, r }, i) => res[i].err ? console.log('  PROBLEM ' + res[i].err) : console.log(`  ${fileName(d, r)}  ${res[i].w}x${res[i].h}  fit ${res[i].fits.map((f) => `${f.byWidth ? 'W' : 'H'} ${(f.w * 100).toFixed(0)}%x${(f.h * 100).toFixed(0)}%`).join(', ')}`));
      console.log(`previews in ${outDir}`);
      return;
    }

    fs.mkdirSync(DIST, { recursive: true });
    // Masters. The 2:3 sheet is 7200 x 10800 px, so render two at a time.
    const jobs = chosen.flatMap((d) => ratios.map((r) => ({ d, r })));
    const manifest = [];
    if (!flag('pdf-only')) await pool(jobs, 2, async ({ d, r }) => {
      const out = path.join(DIST, d.slug, fileName(d, r));
      let res, diff;
      for (let attempt = 1; ; attempt++) {
        res = await renderSheet(browser, d, r, { out });
        diff = process.env.WALLART_NOCOMPARE ? { mean: 0, worst: 0 } : await compareWithReference(browser, d, r, out);
        if (diff.worst < 25 && diff.mean < 2) break;
        console.log(`  re-render ${fileName(d, r)} (differs from reference: mean ${diff.mean.toFixed(2)}, worst block ${diff.worst.toFixed(0)})`);
        if (attempt >= 4) throw new Error(`${fileName(d, r)} keeps differing from its reference render`);
      }
      res.diff = diff;
      manifest.push({ file: path.relative(DIST, out), w: res.w, h: res.h, bytes: res.bytes, citePt: +res.citePt.toFixed(1), minLinePt: +res.minLinePt.toFixed(1) });
      console.log(`  ${path.relative(HERE, out)}  ${res.w}x${res.h}  ${(res.bytes / 1e6).toFixed(1)} MB  cite ${res.citePt.toFixed(1)}pt  smallest line ${res.minLinePt.toFixed(0)}pt  ref diff ${res.diff.mean.toFixed(2)}/${res.diff.worst.toFixed(0)}`);
    });

    // Contact sheet thumbnails: the 4:5 design re-rendered small (same layout code, scaled).
    const thumbs = {};
    const r45 = ratios.find((r) => r.key === '4x5');
    await pool(designs, 4, async (d) => {
      const out = path.join(SCRATCH, 'thumbs', `thumb-${nn(d.n)}.jpg`);
      await renderSheet(browser, d, r45, { scale: 0.16, out });
      thumbs[d.n] = out;
    });
    await pdf(browser, contactSheetHtml(thumbs), path.join(DIST, 'all-designs-preview.pdf'));
    await pdf(browser, sizeGuideHtml(), path.join(DIST, 'size-guide.pdf'));
    console.log('  dist/all-designs-preview.pdf\n  dist/size-guide.pdf');

    // Read every expected file back and check it.
    const problems = [];
    for (const d of chosen) for (const r of ratios) {
      const f = path.join(DIST, d.slug, fileName(d, r));
      if (!fs.existsSync(f)) { problems.push(`missing ${f}`); continue; }
      const buf = fs.readFileSync(f);
      const { w, h } = jpegSize(buf);
      const dpi = jpegDpi(buf);
      if (w !== r.px[0] || h !== r.px[1]) problems.push(`${fileName(d, r)} is ${w}x${h}, expected ${r.px.join('x')}`);
      if (!dpi || dpi.units !== 1 || dpi.x !== DPI) problems.push(`${fileName(d, r)} lacks 300 dpi header`);
    }
    for (const [f, pages] of [['all-designs-preview.pdf', 1], ['size-guide.pdf', 2]]) {
      const txt = fs.readFileSync(path.join(DIST, f), 'latin1');
      const n = (txt.match(/\/Type\s*\/Page(?!s)/g) || []).length;
      if (n !== pages) problems.push(`${f} has ${n} pages, expected ${pages}`);
    }
    if (!only) fs.writeFileSync(path.join(SCRATCH, 'manifest.json'), JSON.stringify(manifest, null, 2));
    if (problems.length) throw new Error(problems.join('\n'));
    console.log(`checked ${chosen.length * ratios.length} masters (pixel size, 300 dpi) and 2 PDFs in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  } finally {
    await browser.close();
    await closeCmpBrowser();
  }
})().catch((e) => { console.error(`BUILD FAILED: ${e.message}`); process.exit(1); });
