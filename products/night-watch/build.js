#!/usr/bin/env node
/**
 * Build "The Night Watch", a 5 x 8 in gift book for new parents.
 *
 *   node products/night-watch/build.js           interior, cover, listing images -> dist/
 *   node products/night-watch/build.js --check   verify every quotation, build nothing
 *
 * Uses the OFL fonts in products/forty-days/fonts and Chromium (CHROME_PATH,
 * or the Playwright copy in this environment). Fails if any quotation is not
 * exact red-letter KJV, or if any page overflows.
 */
const fs = require('fs');
const path = require('path');
const C = require('./content');
const { lookup, cleanKjv, parseRef } = require('../../lib/scripture');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const DIST = path.join(HERE, 'dist');
const FONTS = path.join(ROOT, 'products', 'forty-days', 'fonts');
const squash = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// --- 1. Every saying is exact KJV, and his -------------------------------------
const kjv = require(path.join(ROOT, 'data', 'gospels-kjv.json')).books;
for (const n of C.nights) {
  const p = parseRef(n.cite);
  if (!p) throw new Error(`Unreadable citation: ${n.cite}`);
  const verses = [];
  for (let v = p.start; v <= p.end; v++) verses.push(cleanKjv(kjv[p.book][p.chapter][v] || ''));
  const full = squash(verses.join(' '));
  for (const part of n.text.split('…')) {
    if (squash(part) && !full.includes(squash(part))) throw new Error(`Not exact KJV at ${n.cite}: "${part.trim()}"`);
  }
  if (!lookup(n.cite)) throw new Error(`Not red letter: ${n.cite}`);
}
console.log(`verified ${C.nights.length} sayings against the KJV and the red-letter corpus`);
if (process.argv.includes('--check')) process.exit(0);

// --- 2. Pages --------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const smart = (s) => esc(s).replace(/(^|[\s(“])'/g, '$1‘').replace(/'/g, '’').replace(/(^|[\s(])"/g, '$1“').replace(/"/g, '”');
const citeOf = (c) => c.replace(/-/g, '–');
const MOON = '<svg class="moon" viewBox="0 0 40 40" aria-hidden="true"><path d="M26 6a15 15 0 1 0 8 26A13 13 0 0 1 26 6z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';

const pages = [];
const page = (cls, body, folio = true) => pages.push({ cls, body, folio });

page('half', `<div class="half-title">${esc(C.title)}</div>`, false);
page('blank', '', false);
page('title', `${MOON}<h1>${esc(C.title)}</h1><p class="sub">Words of Jesus for New Parents,<br>in the Small Hours</p><p class="kjv">Thirty nights of his words<br>King James Version</p><p class="by">${esc(C.compiler)}</p>`, false);
page('copyright', `<div class="copy">
  <p>${esc(C.title)}: ${esc(C.subtitle)}</p>
  <p>Scripture is from the King James Version, public domain in the United States. Only the words Jesus spoke are quoted, each checked word for word against the King James text and printed in red.</p>
  <p>Reflections and prayers © ${C.year} ${esc(C.compiler)}. All rights reserved.</p>
  <p>This book is for encouragement. It is not medical or mental-health care. If you are struggling, please see “${esc(C.help.title)}” at the back of the book.</p>
  <p>Set in IM Fell English and Literata.</p>
</div>`, false);
page('intro', `<h2>For the small hours</h2>${C.intro.map((p) => `<p>${smart(p)}</p>`).join('')}`);
C.nights.forEach((n, i) => {
  page('night-left', `<p class="night-no">${MOON}Night ${i + 1}</p>
    <h2 class="night-title">${smart(n.title)}</h2>
    <blockquote class="red">${smart(n.text)}</blockquote>
    <p class="cite">${esc(citeOf(n.cite))} · KJV</p>`);
  page('night-right', `<div class="reflection">${smart(n.reflection)}</div>
    <div class="tonight"><p class="label">Tonight</p><p class="prayer">${smart(n.prayer)}</p></div>
    <div class="notes"><p class="label">What I noticed tonight</p>${'<div class="line"></div>'.repeat(5)}</div>`);
});
page('help', `<h2>${esc(C.help.title)}</h2>${C.help.body.map((p) => `<p>${smart(p)}</p>`).join('')}
  <dl>${C.help.lines.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  <p class="foot">${smart(C.help.foot)}</p>`);
page('index', `<h2>His words, night by night</h2><ol>${C.nights.map((n, i) => `<li><span class="n">${i + 1}</span><span class="t">${smart(n.title)}</span><span class="c">${esc(citeOf(n.cite))}</span></li>`).join('')}</ol>`);
for (let k = 0; k < 4; k++) page('remember', `<h2>${k ? '&nbsp;' : 'Nights to remember'}</h2><p class="hint">${k ? '' : 'The first smile, the first full night, the night you cried too. Write them down; you will not believe how fast they go.'}</p>${'<div class="line"></div>'.repeat(k ? 17 : 14)}`);
page('colophon-page', `<div class="colophon">${MOON}<p>“${smart(C.nights[29].text)}”</p><p class="cite">${esc(citeOf(C.nights[29].cite))} · KJV</p></div>`, false);

const fontCss = `
@font-face { font-family: Fell; src: url('file://${FONTS}/IMFeENrm28P.ttf'); }
@font-face { font-family: Fell; font-style: italic; src: url('file://${FONTS}/IMFeENit28P.ttf'); }
@font-face { font-family: Lit; src: url('file://${FONTS}/Literata[opsz,wght].ttf'); font-weight: 200 900; }
@font-face { font-family: Lit; font-style: italic; src: url('file://${FONTS}/Literata-Italic[opsz,wght].ttf'); font-weight: 200 900; }`;

const INK = '#211C17', RED = '#9E1B22', SOFT = '#7A6E62', RULE = '#CFC5B6';
const interiorHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
@page { size: 5in 8in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Lit; color: ${INK}; font-size: 10.4pt; line-height: 1.5; font-variant-numeric: lining-nums; }
.page { width: 5in; height: 8in; position: relative; overflow: hidden; padding: 0.62in 0.5in 0.7in 0.75in; }
.page.even { padding-left: 0.5in; padding-right: 0.75in; }
.page + .page { break-before: page; }
.inner { height: 100%; position: relative; }
.folio { position: absolute; bottom: 0.38in; font-size: 8pt; color: ${SOFT}; letter-spacing: .08em; }
.odd .folio { right: 0.5in; } .even .folio { left: 0.5in; }
.moon { width: 14px; height: 14px; color: ${RED}; vertical-align: -2px; margin-right: 6px; }
h1, h2 { font-family: Fell; font-weight: 400; }
h2 { font-size: 19pt; line-height: 1.15; margin-bottom: 14px; }
.half-title { font-family: Fell; font-size: 20pt; text-align: center; margin-top: 2.2in; }
.title .inner { text-align: center; padding-top: 1.5in; }
.title .moon { width: 34px; height: 34px; margin: 0 0 18px; }
.title h1 { font-size: 34pt; line-height: 1.05; margin-bottom: 14px; }
.title .sub { font-family: Fell; font-style: italic; font-size: 13pt; line-height: 1.35; margin: 0 .2in 26px; }
.title .kjv { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: ${SOFT}; }
.title .by { position: absolute; bottom: .4in; left: 0; right: 0; font-size: 8.5pt; letter-spacing: .2em; text-transform: uppercase; color: ${RED}; }
.copy { position: absolute; bottom: 0; font-size: 7.6pt; line-height: 1.5; color: ${SOFT}; }
.copy p + p { margin-top: 7px; }
.intro p + p, .help p + p { margin-top: 9px; }
.intro .inner { padding-top: .35in; }
.night-left .inner { display: flex; flex-direction: column; justify-content: center; text-align: center; }
.night-no { font-size: 7.6pt; letter-spacing: .22em; text-transform: uppercase; color: ${SOFT}; margin-bottom: 10px; }
.night-title { font-style: italic; font-size: 17pt; margin-bottom: 26px; }
blockquote.red { font-family: Fell; color: ${RED}; font-size: 15pt; line-height: 1.42; margin: 0 .05in; }
.night-left .cite { margin-top: 18px; font-size: 7.8pt; letter-spacing: .16em; text-transform: uppercase; color: ${SOFT}; }
.night-right .inner { display: flex; flex-direction: column; }
.reflection { padding-top: .2in; hyphens: auto; text-align: left; }
.tonight { margin-top: 18px; padding-top: 12px; border-top: 1px solid ${RULE}; }
.label { font-size: 7.4pt; letter-spacing: .2em; text-transform: uppercase; color: ${SOFT}; margin-bottom: 5px; }
.prayer { font-style: italic; }
.notes { margin-top: auto; }
.line { border-bottom: 1px solid ${RULE}; height: 0.3in; }
.help h2 { font-size: 17pt; }
.help dl { margin-top: 12px; font-size: 9.3pt; line-height: 1.42; }
.help dt { font-weight: 600; margin-top: 9px; }
.help dd { margin: 1px 0 0; }
.help .foot { margin-top: 12px; font-style: italic; font-size: 9.3pt; }
.index ol { list-style: none; font-size: 8.4pt; line-height: 1.25; }
.index li { display: flex; gap: 8px; padding: 1.6px 0; border-bottom: 1px dotted ${RULE}; }
.index .n { width: 16px; color: ${RED}; font-variant-numeric: tabular-nums; }
.index .t { flex: 1; font-style: italic; }
.index .c { color: ${SOFT}; font-size: 8pt; }
.remember .hint { font-style: italic; font-size: 9.3pt; color: ${SOFT}; margin-bottom: 4px; }
.colophon { text-align: center; margin-top: 2.3in; font-family: Fell; color: ${RED}; font-size: 13pt; line-height: 1.4; }
.colophon .moon { width: 22px; height: 22px; margin: 0 0 14px; }
.colophon .cite { margin-top: 12px; font-family: Lit; font-size: 7.8pt; letter-spacing: .16em; color: ${SOFT}; }
</style></head><body>
${pages.map((p, i) => {
    const n = i + 1;
    return `<section class="page ${n % 2 ? 'odd' : 'even'} ${p.cls}"><div class="inner">${p.body}</div>${p.folio ? `<span class="folio">${n}</span>` : ''}</section>`;
  }).join('\n')}
</body></html>`;

// --- 3. Cover ----------------------------------------------------------------------
const PAGES = pages.length;
const SPINE = +(PAGES * 0.002252).toFixed(4); // KDP white paper, inches per page
const BLEED = 0.125, TRIM_W = 5, TRIM_H = 8;
const COVER_W = +(BLEED * 2 + TRIM_W * 2 + SPINE).toFixed(4);
const COVER_H = TRIM_H + BLEED * 2;
const NIGHT = '#141A26', CREAM = '#F3EBDD';
const coverHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
@page { size: ${COVER_W}in ${COVER_H}in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: ${COVER_W}in; height: ${COVER_H}in; background: ${NIGHT}; color: ${CREAM}; font-family: Lit; position: relative; overflow: hidden; }
.panel { position: absolute; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; padding: 0.55in 0.5in; }
.back { left: ${BLEED}in; } .front { left: ${BLEED + TRIM_W + SPINE}in; text-align: center; }
.stars { position: absolute; inset: 0; }
.front .moon { width: 1.25in; height: 1.25in; color: #E9C77B; margin: .55in auto .4in; display: block; }
.front h1 { font-family: Fell; font-weight: 400; font-size: 44pt; line-height: 1; }
.front .sub { font-family: Fell; font-style: italic; font-size: 14.5pt; line-height: 1.35; margin: 16px .25in 0; color: #D9CDB8; }
.front .red { position: absolute; left: .5in; right: .5in; bottom: 1.25in; font-family: Fell; font-size: 15pt; color: #E0716B; }
.front .red small { display: block; margin-top: 6px; font-family: Lit; font-size: 7.5pt; letter-spacing: .18em; color: #A99A84; }
.front .by { position: absolute; left: 0; right: 0; bottom: .6in; font-size: 8.5pt; letter-spacing: .24em; text-transform: uppercase; color: #A99A84; }
.back { font-size: 10pt; line-height: 1.5; color: #E4DACA; }
.back .lead { font-family: Fell; font-size: 16pt; line-height: 1.3; color: ${CREAM}; margin-bottom: 14px; }
.back p + p { margin-top: 9px; }
.back ul { margin: 10px 0 0 1.1em; }
.back .quote { font-family: Fell; color: #E0716B; font-size: 12.5pt; margin-top: 14px; }
.back .quote small { display: block; font-family: Lit; font-size: 7.2pt; letter-spacing: .16em; color: #A99A84; margin-top: 3px; }
.barcode { position: absolute; right: .5in; bottom: .5in; width: 2in; height: 1.2in; } /* kept clear for the KDP barcode */
</style></head><body>
<svg class="stars" viewBox="0 0 ${COVER_W * 100} ${COVER_H * 100}" preserveAspectRatio="none">${Array.from({ length: 70 }, (_, k) => {
    const x = ((k * 137.5) % (COVER_W * 100)).toFixed(1), y = ((k * 61.3 + (k % 7) * 29) % (COVER_H * 55)).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${k % 5 ? 0.55 : 0.95}" fill="#F3EBDD" opacity="${k % 3 ? 0.35 : 0.6}"/>`;
  }).join('')}</svg>
<div class="panel back">
  <p class="lead">For the feeds at two, the rocking at four, and the long walk down the hall while the house sleeps.</p>
  <p>Thirty nights of the words Jesus spoke, printed in red from the King James Version, each with a short reflection written for a tired parent holding a baby in the half-dark, and a prayer short enough to say with your eyes closed.</p>
  <ul><li>One night per page-turn; read it one-handed</li><li>No order to keep, no night to fall behind on</li><li>Room each night to write what you noticed</li><li>Help lines for when the nights get too dark</li></ul>
  <p class="quote">“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”<small>MATTHEW 11:28 · KJV</small></p>
  <div class="barcode"></div>
</div>
<div class="panel front">
  ${MOON.replace('class="moon"', 'class="moon"').replace('stroke-width="1.2"', 'stroke-width="0.9"')}
  <h1>${esc(C.title)}</h1>
  <p class="sub">Words of Jesus for New Parents,<br>in the Small Hours</p>
  <p class="red">“Peace, be still.”<small>MARK 4:39 · KJV</small></p>
  <p class="by">${esc(C.compiler)}</p>
</div>
</body></html>`;

// Chrome rounds the PDF page to whole points (750 pt for a 749.67 pt cover).
// KDP checks the cover against its own width, so write the exact MediaBox and
// move every cross-reference offset after the edit by the bytes it added.
function exactMediaBox(file, wPt, hPt) {
  let pdf = fs.readFileSync(file).toString('latin1');
  const m = /\/MediaBox \[0 0 [\d.]+ [\d.]+\]/.exec(pdf);
  if (!m || pdf.indexOf('/MediaBox', m.index + 1) !== -1) throw new Error('expected exactly one MediaBox in the cover');
  const box = `/MediaBox [0 0 ${wPt.toFixed(4)} ${hPt.toFixed(4)}]`;
  const at = m.index, delta = box.length - m[0].length;
  pdf = pdf.slice(0, at) + box + pdf.slice(at + m[0].length);
  const xref = pdf.lastIndexOf('\nxref\n');
  if (xref === -1) throw new Error('cover PDF has no classic xref table');
  const table = pdf.slice(xref, pdf.indexOf('trailer', xref)).replace(/^(\d{10}) (\d{5}) n/gm, (s, off, gen) => {
    const n = +off;
    return `${String(n > at ? n + delta : n).padStart(10, '0')} ${gen} n`;
  });
  pdf = pdf.slice(0, xref) + table + pdf.slice(pdf.indexOf('trailer', xref));
  pdf = pdf.replace(/startxref\s+(\d+)\s+%%EOF\s*$/, (s, off) => `startxref\n${+off + delta}\n%%EOF\n`);
  fs.writeFileSync(file, Buffer.from(pdf, 'latin1'));
}

// --- 4. Render -----------------------------------------------------------------------
(async () => {
  fs.mkdirSync(DIST, { recursive: true });
  const puppeteer = require('puppeteer-core');
  const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const tab = await browser.newPage();
  const load = async (html, name) => {
    const file = path.join(DIST, name);
    fs.writeFileSync(file, html);
    await tab.goto('file://' + file, { waitUntil: 'load' });
    await tab.evaluate(async () => {
      await Promise.all(['Fell', 'Lit'].flatMap((f) => [`12px ${f}`, `italic 12px ${f}`].map((s) => document.fonts.load(s))));
      await document.fonts.ready;
    });
    const bad = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family));
    if (bad.length) throw new Error(`fonts failed to load: ${bad.join(', ')}`);
  };

  await load(interiorHtml, 'interior.html');
  const overflow = await tab.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
    const inner = p.querySelector('.inner');
    const kids = [...inner.children];
    const bottom = Math.max(0, ...kids.map((k) => k.getBoundingClientRect().bottom));
    const limit = inner.getBoundingClientRect().bottom + 0.5;
    return inner.scrollHeight > inner.clientHeight + 1 || bottom > limit ? i + 1 : null;
  }).filter(Boolean));
  if (overflow.length) throw new Error(`pages overflow: ${overflow.join(', ')}`);
  const drift = await tab.evaluate(() => { const ps = [...document.querySelectorAll('.page')]; return Math.round(document.documentElement.scrollHeight - ps.length * ps[0].getBoundingClientRect().height); });
  if (Math.abs(drift) > 2) throw new Error(`document is ${drift}px longer than its pages; a page has picked up a margin`);
  await tab.pdf({ path: path.join(DIST, 'the-night-watch-interior-5x8.pdf'), printBackground: true, preferCSSPageSize: true });
  // A spread for the listing: night 16, "Peace, be still".
  await tab.setViewport({ width: 960, height: 768, deviceScaleFactor: 2 });
  const spread = 5 + 15 * 2 + 1; // left page of night 16
  await tab.evaluate((n) => {
    const ps = [...document.querySelectorAll('.page')];
    document.body.style.cssText = 'display:flex;gap:2px;background:#d9d2c6;padding:0;width:960px';
    ps.forEach((p, i) => { p.style.display = i + 1 === n || i + 1 === n + 1 ? 'block' : 'none'; p.style.background = '#FBF7EF'; });
  }, spread);
  await tab.screenshot({ path: path.join(DIST, 'listing-spread.png'), clip: { x: 0, y: 0, width: 962, height: 768 } });

  await load(coverHtml, 'cover.html');
  await tab.pdf({ path: path.join(DIST, 'the-night-watch-cover.pdf'), printBackground: true, preferCSSPageSize: true });
  exactMediaBox(path.join(DIST, 'the-night-watch-cover.pdf'), COVER_W * 72, COVER_H * 72);
  await tab.setViewport({ width: Math.round(COVER_W * 96), height: Math.round(COVER_H * 96), deviceScaleFactor: 2 });
  await tab.screenshot({ path: path.join(DIST, 'listing-cover-front.png'), clip: { x: Math.round((BLEED + TRIM_W + SPINE) * 96), y: Math.round(BLEED * 96), width: TRIM_W * 96, height: TRIM_H * 96 } });
  await browser.close();
  for (const f of ['interior.html', 'cover.html']) fs.unlinkSync(path.join(DIST, f));

  const info = { pages: PAGES, trim: '5 x 8 in', spineIn: SPINE, coverIn: [COVER_W, COVER_H], sayings: C.nights.length };
  fs.writeFileSync(path.join(DIST, 'build.json'), JSON.stringify(info, null, 2) + '\n');
  console.log(`interior: ${PAGES} pages; cover ${COVER_W} x ${COVER_H} in, spine ${SPINE} in`);
})().catch((e) => { console.error(e.message); process.exit(1); });
