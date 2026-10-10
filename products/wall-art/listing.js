#!/usr/bin/env node
'use strict';
/**
 * Words in Frame: listing kit tools.
 *
 *   node products/wall-art/listing.js           check LISTING.md, then render the 4 listing images
 *   node products/wall-art/listing.js --check   check LISTING.md only (title, tags, quotations)
 *   node products/wall-art/listing.js --zip     build the upload zips into upload/ (Etsy: 5 files, 20 MB each)
 *
 * The images are built from the finished masters in dist/ (downscaled by Chromium),
 * and each page is checked for text overflow, elements outside the canvas and
 * overlapping text blocks before it is saved.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const HERE = __dirname;
const DIST = path.join(HERE, 'dist');
const OUT = path.join(HERE, 'listing');
const FONTS = path.join(HERE, '..', 'forty-days', 'fonts');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SCRATCH = process.env.WALLART_TMP || path.join(os.tmpdir(), 'wall-art-listing');
const args = process.argv.slice(2);

const { collection, ratios, designs } = require('./designs');
const { checkQuote } = require('./verify');
const nn = (n) => String(n).padStart(2, '0');
const master = (d, key) => path.join(DIST, d.slug, `design-${nn(d.n)}-${d.slug}-${key}.jpg`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- 1. LISTING.md checks ----------------------------------------------------------
function checkListing() {
  const md = fs.readFileSync(path.join(HERE, 'LISTING.md'), 'utf8');
  const errors = [];
  const block = (heading) => {
    const i = md.indexOf(heading);
    if (i < 0) { errors.push(`missing section "${heading}"`); return ''; }
    const m = /```\n([\s\S]*?)```/.exec(md.slice(i));
    return m ? m[1] : '';
  };
  const titles = [];
  const titleSection = md.slice(md.indexOf('## Etsy title'), md.indexOf('## Etsy tags'));
  for (const m of titleSection.matchAll(/```\n([\s\S]*?)```/g)) titles.push(m[1].trim());
  if (!titles.length) errors.push('no Etsy title found');
  for (const t of titles) if (t.length > 140) errors.push(`title is ${t.length} characters (max 140): ${t}`);

  const tags = block('## Etsy tags').split('\n').map((t) => t.trim()).filter(Boolean);
  if (tags.length !== 13) errors.push(`expected 13 tags, found ${tags.length}`);
  for (const t of tags) if (t.length > 20) errors.push(`tag "${t}" is ${t.length} characters (max 20)`);
  if (new Set(tags).size !== tags.length) errors.push('duplicate tags');

  // Every quotation followed by a reference must be his exact words.
  const corpus = JSON.parse(fs.readFileSync(path.join(HERE, '..', '..', 'data', 'spoken-gospels.json'), 'utf8'));
  const quoteRe = /["“]([^"”]+)["”]\s*\(((?:Matthew|Mark|Luke|John) \d+:\d+)\)/g;
  let quotes = 0;
  for (const m of md.matchAll(quoteRe)) {
    quotes++;
    const err = checkQuote(m[1], m[2], corpus);
    if (err) errors.push(err);
  }
  // Any quoted run in the description that looks like scripture but has no reference is an error.
  const desc = block('## Description');
  for (const m of desc.replace(quoteRe, '').matchAll(/["“]([^"”\n]{12,})["”]/g)) errors.push(`quotation without a reference: "${m[1]}"`);
  if (quotes < designs.length) errors.push(`expected ${designs.length} referenced quotations, found ${quotes}`);

  if (errors.length) { console.error('LISTING.md check FAILED:\n  ' + errors.join('\n  ')); process.exit(1); }
  console.log(`LISTING.md: ${titles.length} titles (longest ${Math.max(...titles.map((t) => t.length))}/140), ` +
    `${tags.length} tags (longest ${Math.max(...tags.map((t) => t.length))}/20), ${quotes} quotations verified against the red-letter corpus`);
}

// ---- 2. Zips -----------------------------------------------------------------------
function buildZips() {
  const up = path.join(HERE, 'upload');
  fs.rmSync(up, { recursive: true, force: true });
  fs.mkdirSync(up, { recursive: true });
  fs.writeFileSync(path.join(up, '.gitignore'), '*\n');
  const pdfs = ['size-guide.pdf', 'all-designs-preview.pdf'].map((f) => path.join(DIST, f));
  const zip = (name, files) => {
    const out = path.join(up, name);
    execFileSync('zip', ['-j', '-q', '-0', out, ...files]); // JPEGs do not compress further
    const mb = fs.statSync(out).size / 1e6;
    if (mb >= 20) throw new Error(`${name} is ${mb.toFixed(1)} MB, over Etsy's 20 MB limit`);
    console.log(`  ${name.padEnd(42)} ${files.length} files  ${mb.toFixed(1)} MB`);
  };
  for (const r of ratios) zip(`words-in-frame-${r.key}.zip`, [...designs.map((d) => master(d, r.key)), ...pdfs]);
  for (const d of designs) zip(`single-${nn(d.n)}-${d.slug}.zip`, [...ratios.map((r) => master(d, r.key)), pdfs[0]]);
  console.log(`wrote ${ratios.length + designs.length} zips to ${path.relative(process.cwd(), up)}/`);
}

// ---- 3. Listing images -------------------------------------------------------------
function fontCss() {
  const f = (name, file, style, weight) => `@font-face{font-family:"${name}";src:url("file://${path.join(FONTS, file)}");font-style:${style};font-weight:${weight};}`;
  return f('Fell', 'IMFeENrm28P.ttf', 'normal', '400') + f('Fell', 'IMFeENit28P.ttf', 'italic', '400') +
    f('Literata', 'Literata[opsz,wght].ttf', 'normal', '200 900') + f('Literata', 'Literata-Italic[opsz,wght].ttf', 'italic', '200 900');
}
const FACES = ['400 40px Fell', 'italic 400 40px Fell', '400 40px Literata', '500 40px Literata', '600 40px Literata', 'italic 400 40px Literata'];

const BASE = `*{box-sizing:border-box;margin:0;padding:0}
html,body{width:2000px;height:2000px;overflow:hidden;background:#f6f3ee}
body{font-family:Literata,Georgia,serif;color:#23201d;font-variant-numeric:lining-nums;position:relative}
.eyebrow{font:500 26px Literata;letter-spacing:0.24em;text-transform:uppercase;color:#a3142c}
h1,h2{font-family:Fell;font-weight:400}`;

// Checks run inside the page: fonts loaded, images decoded, no text overflowing its
// box, nothing outside the 2000 px canvas, and no two [data-box] elements overlapping.
const PAGE_CHECK = `async (faces) => {
  await Promise.all(faces.map((f) => document.fonts.load(f, 'Aa 0123')));
  await document.fonts.ready;
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  const bad = [];
  faces.forEach((f) => { if (!document.fonts.check(f)) bad.push('font not loaded: ' + f); });
  document.querySelectorAll('img').forEach((im) => { if (!im.naturalWidth) bad.push('image missing ' + im.src); });
  const all = [...document.body.querySelectorAll('*')];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const clip = el.parentElement && el.parentElement.closest('[data-clip]');
    if (clip) continue; // deliberately cropped content (the detail crop)
    if (r.left < -0.5 || r.top < -0.5 || r.right > 2000.5 || r.bottom > 2000.5) bad.push('outside canvas: ' + (el.className || el.tagName) + ' ' + JSON.stringify([r.left, r.top, r.right, r.bottom].map(Math.round)));
    if (el.matches('[data-text]') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) bad.push('text overflows: ' + el.textContent.slice(0, 40) + ' ' + [el.scrollWidth, el.clientWidth, el.scrollHeight, el.clientHeight]);
  }
  const boxes = [...document.querySelectorAll('[data-box]')].map((el) => ({ el, r: el.getBoundingClientRect() }));
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i].r, b = boxes[j].r;
    if (boxes[i].el.contains(boxes[j].el) || boxes[j].el.contains(boxes[i].el)) continue;
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)
      bad.push('overlap: ' + (boxes[i].el.dataset.box) + ' / ' + (boxes[j].el.dataset.box));
  }
  return bad;
}`;

function jpegSize(buf) {
  for (let i = 2; i < buf.length;) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  throw new Error('no JPEG frame header');
}

// Downscale a master with Chromium into a cached JPEG at the given width.
async function thumb(browser, file, width) {
  const dir = path.join(SCRATCH, 'thumbs');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${path.basename(file, '.jpg')}-${width}.jpg`);
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(file).mtimeMs) return out;
  const p = await browser.newPage();
  try {
    const [w, h] = jpegSize(fs.readFileSync(file));
    const height = Math.round((width * h) / w);
    await p.setViewport({ width, height, deviceScaleFactor: 1 });
    const html = path.join(dir, 'thumb.html');
    fs.writeFileSync(html, `<html><body style="margin:0"><img src="file://${file}" style="display:block;width:${width}px;height:${height}px"></body></html>`);
    await p.goto(`file://${html}`, { waitUntil: 'load' });
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.screenshot({ path: out, type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width, height } });
  } finally { await p.close(); }
  return out;
}

async function render(browser, name, html) {
  const htmlPath = path.join(SCRATCH, `${name}.html`);
  fs.writeFileSync(htmlPath, html);
  const p = await browser.newPage();
  try {
    await p.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 });
    await p.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    const bad = await p.evaluate(`(${PAGE_CHECK})(${JSON.stringify(FACES)})`);
    if (bad.length) throw new Error(`${name}: ${bad.join('; ')}`);
    const out = path.join(OUT, `${name}.png`);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 2000, height: 2000 } });
    const buf = fs.readFileSync(out);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    if (w !== 2000 || h !== 2000) throw new Error(`${name}.png is ${w}x${h}`);
    console.log(`  listing/${name}.png  2000x2000`);
  } finally { await p.close(); }
}

const byN = (n) => designs.find((d) => d.n === n);

// A drawn frame: thin dark moulding, white mat, the print inside.
function frame(src, printW, printH, { mat = 0.16, x, y, label }) {
  const m = Math.round(printW * mat);
  const fw = Math.round(printW * 0.045);
  return `<div class="frame" data-box="${label}" style="left:${x}px;top:${y}px;padding:${fw}px">
    <div class="mat" style="padding:${m}px"><img src="file://${src}" style="width:${printW}px;height:${printH}px"></div></div>`;
}

function galleryHtml(t) {
  // Three shapes: 2:3 left, 4:5 centre (largest), 3:4 right, hung on a shared centre line.
  const L = { w: 340, h: 510 }, C = { w: 500, h: 625 }, R = { w: 380, h: 507 };
  const outer = (p, mat) => ({ w: p.w + 2 * Math.round(p.w * mat) + 2 * Math.round(p.w * 0.045), h: p.h + 2 * Math.round(p.w * mat) + 2 * Math.round(p.w * 0.045) });
  const oL = outer(L, 0.14), oC = outer(C, 0.14), oR = outer(R, 0.14);
  const gap = 70, total = oL.w + oC.w + oR.w + 2 * gap, x0 = (2000 - total) / 2, cy = 790;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE}
body{background:radial-gradient(ellipse at 50% 35%,#efe9e0 0%,#e6dfd4 60%,#ddd5c9 100%)}
.frame{position:absolute;background:linear-gradient(135deg,#3b332c,#241f1b 60%,#3a312a);box-shadow:0 2px 3px rgba(0,0,0,.25),0 26px 50px -10px rgba(40,30,20,.38),0 60px 90px -30px rgba(40,30,20,.25)}
.mat{background:#fbf9f5;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06),inset 2px 3px 6px rgba(0,0,0,.12)}
.mat img{display:block}
.floor{position:absolute;left:0;right:0;top:1500px;height:500px;background:linear-gradient(#cfc5b6,#c6bbab)}
.ledge{position:absolute;left:0;right:0;top:1492px;height:14px;background:#b8ac9a;box-shadow:0 6px 14px rgba(60,45,30,.25)}
.band{position:absolute;left:0;right:0;bottom:0;height:400px;background:#f6f3ee;border-top:2px solid #a3142c;padding:70px 120px 0;display:flex;justify-content:space-between;align-items:flex-start}
.band h1{font-size:118px;line-height:1;margin-top:18px}
.band .sub{font:italic 400 40px/1.45 Literata;color:#5f5a54;margin-top:18px}
.band .meta{text-align:right;font:400 34px/1.6 Literata;color:#3a3632;margin-top:28px}
.band .meta b{font-weight:600;color:#a3142c}
</style></head><body>
<div class="floor"></div><div class="ledge"></div>
${frame(t.left, L.w, L.h, { mat: 0.14, x: x0, y: cy - oL.h / 2, label: 'frame-left' })}
${frame(t.centre, C.w, C.h, { mat: 0.14, x: x0 + oL.w + gap, y: cy - oC.h / 2, label: 'frame-centre' })}
${frame(t.right, R.w, R.h, { mat: 0.14, x: x0 + oL.w + oC.w + 2 * gap, y: cy - oR.h / 2, label: 'frame-right' })}
<div class="band" data-box="band">
  <div data-box="band-title"><div class="eyebrow">${esc(collection.brand)}</div><h1>${esc(collection.name)}</h1><div class="sub" data-text>${esc(collection.subtitle)}</div></div>
  <div class="meta" data-box="band-meta"><b>12</b> printable prints<br><b>5</b> frame shapes each<br>KJV &middot; 300 dpi</div>
</div>
</body></html>`;
}

function gridHtml(t) {
  const cells = designs.map((d) => `<figure data-box="cell-${d.n}"><img src="file://${t[d.n]}">
    <figcaption data-text><span class="n">${nn(d.n)}</span>${esc(d.title)}<span class="ref">${esc(d.ref)}</span></figcaption></figure>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE}
header{position:absolute;left:110px;right:110px;top:90px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #cfc9c1;padding-bottom:30px}
header h1{font-size:96px;line-height:1;margin-top:10px}
header .meta{text-align:right;font:400 32px/1.5 Literata;color:#5f5a54}
.grid{position:absolute;left:175px;width:1650px;top:330px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:100px;row-gap:26px}
figure img{display:block;width:100%;aspect-ratio:4/5;box-shadow:0 0 0 1px rgba(35,32,29,.16),0 6px 16px rgba(35,32,29,.14)}
figcaption{font:400 28px/1.4 Literata;margin-top:12px;white-space:nowrap;overflow:hidden}
figcaption .n{font-weight:600;color:#a3142c;margin-right:12px}
figcaption .ref{display:block;font-size:20px;line-height:1.5;letter-spacing:0.14em;text-transform:uppercase;color:#6f6a64}
</style></head><body>
<header data-box="header"><div><div class="eyebrow">${esc(collection.brand)} &middot; ${esc(collection.name)}</div><h1>All twelve designs</h1></div>
<div class="meta">Words of Jesus, King James Version<br>Every word checked against the text</div></header>
<div class="grid">${cells}</div>
</body></html>`;
}

function includedHtml(t, guide) {
  // One design in all five shapes, drawn at a common height.
  const H = 450;
  const shapes = ratios.map((r) => {
    const w = Math.round((H * r.master.w) / r.master.h);
    return `<div class="shape" data-box="shape-${r.key}"><img src="file://${t.shapes[r.key]}" style="width:${w}px;height:${H}px">
      <div class="lab" data-text>${esc(r.label)}</div><div class="prints" data-text>${r.prints.map(esc).join('<br>')}</div></div>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE}
.top{position:absolute;left:110px;right:110px;top:90px}
.top h1{font-size:96px;line-height:1;margin-top:10px}
.top p{font:400 34px/1.45 Literata;color:#3a3632;margin-top:22px;max-width:1500px}
.shapes{position:absolute;left:110px;right:110px;top:400px;display:flex;justify-content:space-between;align-items:flex-start}
.shape img{display:block;box-shadow:0 0 0 1px rgba(35,32,29,.16),0 8px 20px rgba(35,32,29,.16)}
.shape .lab{font:500 34px Literata;color:#a3142c;margin-top:22px}
.shape .prints{font:400 24px/1.45 Literata;color:#5f5a54;margin-top:6px;height:180px}
.lower{position:absolute;left:110px;right:110px;top:1150px;bottom:100px;border-top:2px solid #cfc9c1;padding-top:60px;display:grid;grid-template-columns:1fr 560px;gap:90px}
ul{list-style:none}
li{font:400 36px/1.35 Literata;padding:0 0 30px 40px;position:relative}
li::before{content:"";position:absolute;left:4px;top:0.5em;width:12px;height:12px;background:#a3142c;transform:rotate(45deg)}
li b{font-weight:600}
li span{display:block;font-size:27px;color:#6f6a64;margin-top:4px}
.guide{position:relative}
.guide img{display:block;width:480px;box-shadow:0 0 0 1px rgba(35,32,29,.16),0 10px 28px rgba(35,32,29,.18);margin-left:auto}
</style></head><body>
<div class="top" data-box="top"><div class="eyebrow">What you get</div><h1>Every design in five shapes</h1>
<p data-text>Each shape is drawn on its own, so nothing is cropped or stretched. Shown here: ${esc(byN(t.n).title)}, ${esc(byN(t.n).ref)}.</p></div>
<div class="shapes">${shapes}</div>
<div class="lower">
  <ul data-box="list">
    <li><b>60 JPG files</b><span>12 designs x 5 shapes, 300 dpi, up to 24 x 36 in</span></li>
    <li><b>Size guide (PDF)</b><span>Which file to print for your frame</span></li>
    <li><b>Preview sheet (PDF)</b><span>All twelve designs on one page</span></li>
    <li><b>Instant download</b><span>Print at home or at a print shop</span></li>
  </ul>
  <div class="guide" data-box="guide"><img src="file://${guide}"></div>
</div>
</body></html>`;
}

function detailHtml(d, file, win) {
  // A window onto the full-resolution master, shown at 1.25x the canvas width, so the
  // real type and its edges show. win = [top, bottom] as fractions of the master height,
  // chosen so the crop falls in open space and cuts through no line or ornament.
  const W = 2000, k = 1.25, PH = 1300;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss()}${BASE}
.crop{position:absolute;left:0;top:0;width:${W}px;height:${PH}px;overflow:hidden}
.crop img{position:absolute;display:block}
.below{position:absolute;left:110px;right:110px;top:${PH + 90}px;bottom:90px;display:grid;grid-template-columns:620px 1fr 1fr 1fr;column-gap:60px;align-items:start}
.below h1{font-size:76px;line-height:1.08;margin-top:14px}
.feat{border-top:3px solid #a3142c;padding-top:26px}
.feat h2{font-size:42px;line-height:1.1}
.num{font-family:Literata;font-size:0.88em;font-weight:400}
.feat p{font:400 28px/1.5 Literata;color:#4a4540;margin-top:14px}
.cap{position:absolute;left:110px;bottom:70px;font:italic 400 26px/1.4 Literata;color:#6f6a64}
</style></head><body>
<div class="crop" data-box="crop" data-clip><img id="m" src="file://${file}"></div>
<div class="below">
  <div data-box="head"><div class="eyebrow">Made for print</div><h1>Set by hand, sharp at any size</h1></div>
  <div class="feat" data-box="f1"><h2>His words, exactly</h2><p data-text>Each saying is the red-letter text of the King James Version, checked word for word.</p></div>
  <div class="feat" data-box="f2"><h2><span class="num">300</span> dpi</h2><p data-text>Large enough for a 24 x 36 in poster, with a clear margin around the words.</p></div>
  <div class="feat" data-box="f3"><h2>Every shape</h2><p data-text>Each design is laid out again for each frame shape, so nothing is cropped.</p></div>
</div>
<div class="cap" data-box="cap" data-text>Above: part of ${esc(d.title)} (${esc(d.ref)}), cropped from the 4:5 file at print resolution.</div>
<script>
const im = document.getElementById('m');
const place = () => {
  const w = ${W} * ${k}, h = w * im.naturalHeight / im.naturalWidth;
  im.style.width = w + 'px';
  im.style.left = -(w - ${W}) / 2 + 'px';
  const top = ${win[0]} * h, bottom = ${win[1]} * h;
  im.style.top = -(top + bottom - ${PH}) / 2 + 'px';
};
if (im.complete && im.naturalWidth) place(); else im.addEventListener('load', place);
</script>
</body></html>`;
}

async function renderImages() {
  const puppeteer = require('puppeteer-core');
  fs.mkdirSync(SCRATCH, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  // The size guide proof comes from build.js (the same HTML as the PDF).
  const guide = path.join(SCRATCH, 'size-guide-p1.png');
  if (!fs.existsSync(guide) || fs.statSync(guide).mtimeMs < fs.statSync(path.join(DIST, 'size-guide.pdf')).mtimeMs - 60000) {
    execFileSync(process.execPath, [path.join(HERE, 'build.js'), '--pdf-only'], { env: { ...process.env, WALLART_PROOF: '1', WALLART_TMP: SCRATCH }, stdio: 'inherit' });
  }
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const t = {};
    for (const d of designs) t[d.n] = await thumb(browser, master(d, '4x5'), 800);
    await render(browser, '1-gallery', galleryHtml({
      left: await thumb(browser, master(byN(7), '2x3'), 900),
      centre: await thumb(browser, master(byN(5), '4x5'), 1100),
      right: await thumb(browser, master(byN(12), '3x4'), 900),
    }));
    await render(browser, '2-all-twelve', gridHtml(t));
    const shapes = {};
    for (const r of ratios) shapes[r.key] = await thumb(browser, master(byN(1), r.key), 900);
    await render(browser, '3-whats-included', includedHtml({ n: 1, shapes }, guide));
    await render(browser, '4-detail', detailHtml(byN(5), master(byN(5), '4x5'), [0.14, 0.59]));
  } finally { await browser.close(); }
}

(async () => {
  checkListing();
  if (args.includes('--check')) return;
  if (args.includes('--zip')) return buildZips();
  await renderImages();
})().catch((e) => { console.error('LISTING FAILED: ' + e.message); process.exit(1); });
