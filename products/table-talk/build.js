#!/usr/bin/env node
'use strict';
/**
 * Build "Table Talk: 52 conversation cards from the words of Jesus".
 *
 *   node products/table-talk/build.js           build everything into dist/
 *   node products/table-talk/build.js --check   run the content verifier only
 *   node products/table-talk/build.js --shots   also write review screenshots to the scratchpad
 *
 * Outputs (products/table-talk/dist/):
 *   table-talk-print-and-cut-letter.pdf  US Letter, 9 poker cards per sheet, crop marks,
 *                                        fronts sheet followed by its mirrored backs sheet (duplex)
 *   table-talk-print-and-cut-a4.pdf      the same on A4
 *   pod/NN-<id>.png + pod/back.png       825 x 1125 px (2.75 x 3.75 in at 300 dpi, 1/8 in bleed)
 *
 * The build stops if any quotation differs from the red-letter corpus, or if any
 * card's text overflows its safe area after fitting.
 */
const fs = require('fs');
const path = require('path');
const { meta, suits, instructions, cards } = require('./content');
const { checkQuote, run: runVerify } = require('./verify');

const HERE = __dirname;
const DIST = path.join(HERE, 'dist');
const POD = path.join(DIST, 'pod');
const FONTS = require('path').join(__dirname, '../..', 'products/forty-days/fonts');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHOTS = '/tmp/claude-0/-home-user-Ai/217f3e1e-c33c-568d-97eb-c4bfd0bae197/scratchpad/swarm/table-talk';

// ---------------------------------------------------------------------------
// 1. Content gate: the full verifier, then every string exactly as printed.
// ---------------------------------------------------------------------------
const { errors } = runVerify();
if (errors.length) {
  console.error('Table Talk build stopped: content verification failed');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

// Typographic polish for display only: curly apostrophes, capitalised first letter.
const curly = (s) => String(s).replace(/(\w)'(\w)/g, '$1’$2').replace(/'/g, '’');
const displaySaying = (s) => {
  const t = curly(s);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
// Ranges show an en dash on the card; lookup() keeps the hyphen.
const displayCite = (s) => String(s).replace(/(\d)-(\d)/g, '$1–$2');
for (const c of cards) {
  const shown = displaySaying(c.saying);
  const err = checkQuote(c.citation, shown);
  if (err) {
    console.error(`Table Talk build stopped: printed text for ${c.id} (${c.citation}) fails: ${err}`);
    process.exit(1);
  }
}
console.log(`verified ${cards.length} quotations against the red-letter corpus (as printed)`);
if (process.argv.includes('--check')) process.exit(0);

// ---------------------------------------------------------------------------
// 2. Design
// ---------------------------------------------------------------------------
const C = { paper: '#f6f3ee', paper2: '#e9e3da', ink: '#23201d', soft: '#6b625a', red: '#a3142c' };
const SUIT_COLOR = { love: '#a3142c', courage: '#9b5d17', peace: '#3b5f5a', grace: '#5d3a68' };

// Suit glyphs, 24x24, drawn with currentColor.
const GLYPH = {
  love: '<path fill="currentColor" d="M12 20.6c-.3 0-.6-.1-.8-.3C7.3 17.2 3 13.6 3 9.2 3 6.4 5.1 4.3 7.7 4.3c1.8 0 3.3.9 4.3 2.4 1-1.5 2.5-2.4 4.3-2.4 2.6 0 4.7 2.1 4.7 4.9 0 4.4-4.3 8-8.2 11.1-.2.2-.5.3-.8.3z"/>',
  courage: '<path fill="currentColor" d="M12.4 2.6c.4 2.9 2.3 4.6 3.9 6.6 1.5 1.9 2.6 3.8 2.6 6.1 0 3.8-3 6.4-6.9 6.4S5.1 19.1 5.1 15.3c0-2.4 1-4.1 2.4-5.6.3 1.6 1 2.7 2.1 3.3-.2-3.8 1.3-7.3 2.8-10.4z"/><path fill="#f6f3ee" opacity=".9" d="M12 13.2c.3 1.3 1.3 2 1.9 2.9.5.7.8 1.4.8 2.2 0 1.5-1.2 2.5-2.7 2.5s-2.7-1-2.7-2.5c0-1.6 1.6-2.8 2.7-5.1z"/>',
  peace: '<path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M4.6 21.6C8 16.4 11.4 10.4 18.4 3.4"/>'
    + ['M0 0c2.4-2.6 6.4-2.6 8.6 0-2.2 2.6-6.2 2.6-8.6 0z'].map((d) => [
      [7.4, 17.0, -118], [8.4, 16.4, -12], [10.4, 12.9, -122], [11.4, 12.3, -18], [13.6, 9.1, -126], [14.6, 8.5, -24], [17.4, 4.6, -48],
    ].map(([x, y, r]) => `<path fill="currentColor" transform="translate(${x} ${y}) rotate(${r}) scale(.84)" d="${d}"/>`).join('')).join(''),
  grace: '<path fill="currentColor" d="M5.2 5.4h13.6v3.4c0 4-3 7.1-6.8 7.1S5.2 12.8 5.2 8.8V5.4z"/><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M12 15.8v4.2M8.2 20.6h7.6"/><path fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" d="M9.5 2.2c-.6.8.6 1.4 0 2.2M12 1.6c-.6.8.6 1.6 0 2.6M14.5 2.2c-.6.8.6 1.4 0 2.2"/>',
};
const glyph = (key, cls = 'glyph') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${GLYPH[key]}</svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Typographic ties: keep " …" with the word before it, and a one-letter word (I, a) with the word after.
const tidy = (s) => esc(s).replace(/ … /g, ' … ').replace(/(^|[\s ])(I|a) (?=\S)/g, '$1$2 ');

const CSS = `
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENrm28P.ttf"); font-style: normal; }
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENit28P.ttf"); font-style: italic; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata[opsz,wght].ttf"); font-style: normal; font-weight: 200 900; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata-Italic[opsz,wght].ttf"); font-style: italic; font-weight: 200 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Literata", serif; color: ${C.ink}; font-optical-sizing: auto; font-kerning: normal; }

/* A card is the full bleed rectangle: 2.75 x 3.75 in. The trim is inset 0.125 in. */
.card { position: relative; width: 2.75in; height: 3.75in; overflow: hidden; background: ${C.paper}; }
.card .trim { position: absolute; left: .125in; top: .125in; width: 2.5in; height: 3.5in; }

/* ---- Fronts ---- */
.front .safe { position: absolute; inset: .2in .21in .19in; display: flex; flex-direction: column; }
.front .head { display: flex; justify-content: space-between; align-items: flex-start; height: .42in; flex: none; }
.idx { display: flex; flex-direction: column; align-items: center; width: .26in; color: var(--suit); }
.idx .rank { font-family: "Literata"; font-weight: 500; font-size: 10.5pt; line-height: 1; font-variant-numeric: lining-nums; letter-spacing: -.01em; }
.idx .rank.u { text-decoration: underline; text-decoration-thickness: .6pt; text-underline-offset: 1.6pt; }
.idx .glyph { flex: none; width: .15in; height: .15in; margin-top: .035in; }
.suitname { font-family: "Literata"; font-weight: 500; font-size: 6.2pt; letter-spacing: .2em; text-transform: uppercase; color: var(--suit); padding-top: .02in; }
.front .main { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 .04in; }
.saying { font-family: "Fell"; color: ${C.red}; line-height: 1.16; text-align: center; text-wrap: balance; hyphens: none; }
.cite { margin-top: .085in; text-align: center; font-family: "Literata"; font-size: 6.6pt; font-weight: 450; letter-spacing: .13em; text-transform: uppercase; color: ${C.soft}; font-variant-numeric: lining-nums; }
.orn { flex: none; display: flex; align-items: center; justify-content: center; gap: .07in; margin: .1in 0 .085in; color: var(--suit); }
.orn i { display: block; width: .42in; height: 0; border-top: .5pt solid currentColor; opacity: .55; }
.orn .glyph { width: .1in; height: .1in; }
.q { flex: none; font-family: "Literata"; font-size: 8.4pt; line-height: 1.34; text-align: center; text-wrap: pretty; color: ${C.ink}; padding: 0 .03in; font-weight: 420; }
.foot { flex: none; display: flex; justify-content: flex-end; margin-top: .05in; height: .34in; align-items: flex-end; }
.foot .idx { transform: rotate(180deg); }

/* ---- Instruction cards ---- */
.howto { background: ${C.paper}; }
.howto .safe { position: absolute; inset: .22in .22in .2in; display: flex; flex-direction: column; }
.howto .kicker { font-family: "Literata"; font-size: 6pt; letter-spacing: .22em; text-transform: uppercase; color: ${C.soft}; text-align: center; }
.howto h2 { font-family: "Fell"; font-weight: normal; color: ${C.red}; font-size: 17pt; line-height: 1.05; text-align: center; margin: .06in 0 .02in; }
.howto .orn { margin: .06in 0 .1in; color: ${C.red}; }
.howto ol { list-style: none; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: center; gap: .085in; }
.howto li { display: grid; grid-template-columns: .17in 1fr; font-size: 7.7pt; line-height: 1.36; text-wrap: pretty; }
.howto li b { font-weight: 500; color: ${C.red}; font-variant-numeric: lining-nums; font-size: 7.4pt; padding-top: .3pt; }
.howto .suits { flex: none; display: flex; justify-content: center; gap: .16in; margin-top: .1in; }
.howto .suits span { display: flex; flex-direction: column; align-items: center; gap: .03in; font-size: 5.4pt; letter-spacing: .16em; text-transform: uppercase; color: var(--suit); }
.howto .suits .glyph { width: .13in; height: .13in; }
.howto .brand { flex: none; margin-top: .09in; text-align: center; font-size: 5.4pt; letter-spacing: .22em; text-transform: uppercase; color: ${C.soft}; }

/* ---- Back ---- */
.back { background: ${C.red}; color: ${C.paper}; }
.back .field { position: absolute; inset: 0; background:
  radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.06) 0, rgba(255,255,255,0) 62%), ${C.red}; }
.back svg.medal { position: absolute; left: 50%; top: 50%; width: 2.06in; height: 2.96in; transform: translate(-50%, -50%); }
.back .center { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); text-align: center; }
.back .brand { font-family: "Literata"; font-size: 5.6pt; font-weight: 500; letter-spacing: .32em; text-transform: uppercase; opacity: .85; padding-left: .32em; }
.back h1 { font-family: "Fell"; font-weight: normal; font-size: 25pt; line-height: 1; margin: .1in 0 .07in; letter-spacing: .005em; }
.back .sub { font-family: "Fell"; font-style: italic; font-size: 9.6pt; opacity: .92; }
.back .suits { display: flex; justify-content: center; gap: .12in; margin-top: .16in; }
.back .suits .glyph { width: .13in; height: .13in; color: ${C.paper}; opacity: .9; }
.back .suits .glyph [fill="#f6f3ee"] { fill: ${C.red}; }
`;

function frontHTML(c) {
  const s = suits.find((x) => x.key === c.suit);
  // 6 and 9 are underlined so the upside-down corner cannot be misread.
  const idx = `<div class="idx"><span class="rank${c.rank === 6 || c.rank === 9 ? ' u' : ''}">${c.rank}</span>${glyph(c.suit)}</div>`;
  return `<div class="card front" data-id="${c.id}" style="--suit:${SUIT_COLOR[c.suit]}"><div class="trim"><div class="safe">
  <div class="head">${idx}<div class="suitname">${esc(s.name)}</div></div>
  <div class="main"><p class="saying">${tidy(displaySaying(c.saying))}</p><p class="cite">${esc(displayCite(c.citation))}</p></div>
  <div class="orn"><i></i>${glyph(c.suit)}<i></i></div>
  <p class="q">${esc(curly(c.question))}</p>
  <div class="foot">${idx}</div>
</div></div></div>`;
}

function howtoHTML(ins, i) {
  const items = ins.body.map((t, n) => `<li><b>${n + 1}</b><span>${esc(curly(t))}</span></li>`).join('');
  const extra = i === 0
    ? `<div class="suits">${suits.map((s) => `<span style="--suit:${SUIT_COLOR[s.key]}">${glyph(s.key)}${esc(s.name)}</span>`).join('')}</div>`
    : `<div class="brand">${esc(meta.brand)} &middot; ${esc(meta.translation)}</div>`;
  return `<div class="card howto" data-id="howto-${i + 1}"><div class="trim"><div class="safe">
  <div class="kicker">${esc(meta.title)}</div>
  <h2>${esc(ins.title)}</h2>
  <div class="orn"><i></i>${glyph(suits[i === 0 ? 0 : 2].key)}<i></i></div>
  <ol>${items}</ol>${extra}
</div></div></div>`;
}

function backHTML() {
  // Concentric ovals centred on the card: they never run parallel to the cut, so
  // small trimming drift does not show.
  const ovals = `<svg class="medal" viewBox="0 0 206 296" aria-hidden="true">
    <ellipse cx="103" cy="148" rx="101" ry="146" fill="none" stroke="${C.paper}" stroke-width="1" opacity=".55"/>
    <ellipse cx="103" cy="148" rx="96" ry="141" fill="none" stroke="${C.paper}" stroke-width=".5" opacity=".45"/>
    <ellipse cx="103" cy="148" rx="74" ry="108" fill="none" stroke="${C.paper}" stroke-width=".5" opacity=".28"/>
    ${[0, 90, 180, 270].map((a) => {
    const r = a * Math.PI / 180; const x = 103 + Math.sin(r) * 98.5; const y = 148 - Math.cos(r) * 143.5;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${C.red}" stroke="${C.paper}" stroke-width=".8" opacity=".9"/>`;
  }).join('')}
  </svg>`;
  return `<div class="card back" data-id="back"><div class="field"></div>${ovals}
  <div class="center">
    <div class="brand">${esc(meta.brand)}</div>
    <h1>${esc(meta.backLine)}</h1>
    <div class="sub">${esc(meta.backSub)}</div>
    <div class="suits">${suits.map((s) => glyph(s.key)).join('')}</div>
  </div></div>`;
}

// Stamp a PNG as 300 dpi (pHYs chunk after IHDR) so print services read the size correctly.
function withDpi(png, dpi = 300) {
  const zlib = require('zlib');
  const ppm = Math.round(dpi / 0.0254);
  const data = Buffer.alloc(9); data.writeUInt32BE(ppm, 0); data.writeUInt32BE(ppm, 4); data[8] = 1;
  const type = Buffer.from('pHYs');
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(9, 0); type.copy(chunk, 4); data.copy(chunk, 8);
  chunk.writeUInt32BE(zlib.crc32(Buffer.concat([type, data])) >>> 0, 17);
  const ihdrEnd = 8 + 25; // signature + IHDR (4 len + 4 type + 13 data + 4 crc)
  return Buffer.concat([png.subarray(0, ihdrEnd), chunk, png.subarray(ihdrEnd)]);
}

// Runs in the page: load every face, then fit each saying to its space.
const FIT = `
async function fitAll() {
  for (const f of ['16px Fell', 'italic 16px Fell', '400 16px Literata', '500 16px Literata', 'italic 400 16px Literata'])
    await document.fonts.load(f, 'Aa1');
  await document.fonts.ready;
  const PT = 96 / 72;
  const out = [];
  for (const card of document.querySelectorAll('.card.front')) {
    const main = card.querySelector('.main');
    const say = card.querySelector('.saying');
    const words = say.textContent.split(/\\s+/).length;
    // Short sayings get big type, long ones smaller; then shrink until it fits.
    let size = Math.min(21, Math.max(12.5, 23 - words * 0.36));
    const fits = () => main.scrollHeight <= main.clientHeight + 0.5;
    say.style.fontSize = size + 'pt';
    while (!fits() && size > 9) { size -= 0.25; say.style.fontSize = size + 'pt'; }
    const lines = Math.round(say.getBoundingClientRect().height / (size * PT * 1.16));
    out.push({ id: card.dataset.id, size, lines, fits: fits() });
  }
  // Every text box must stay inside its safe area.
  const overflow = [];
  for (const card of document.querySelectorAll('.card')) {
    const safe = card.querySelector('.safe');
    if (!safe) continue;
    const sr = safe.getBoundingClientRect();
    for (const el of safe.querySelectorAll('p, li, h2, .kicker, .brand, .suits, .idx, .suitname')) {
      const r = el.getBoundingClientRect();
      if (r.left < sr.left - .5 || r.right > sr.right + .5 || r.top < sr.top - .5 || r.bottom > sr.bottom + .5)
        overflow.push(card.dataset.id + ' ' + el.className + el.tagName);
    }
    for (const box of safe.querySelectorAll('.main, ol'))
      if (box.scrollHeight > box.clientHeight + 0.5) overflow.push(card.dataset.id + ' content taller than its box');
  }
  return { cards: out, overflow };
}`;

const page = (body, extraCss = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(meta.title)}</title><style>${CSS}${extraCss}</style></head><body>${body}<script>${FIT}</script></body></html>`;

// Faces in deck order: the two instruction cards, then the suits.
const faces = [
  ...instructions.map((ins, i) => ({ id: `howto-${i + 1}`, html: howtoHTML(ins, i) })),
  ...cards.map((c) => ({ id: c.id, html: frontHTML(c) })),
];

// ---------------------------------------------------------------------------
// 3. Print-and-cut sheets
// ---------------------------------------------------------------------------
function sheetsHTML(paper) {
  const W = paper.w; const H = paper.h; // inches
  const cw = 2.5; const ch = 3.5; const cols = 3; const rows = 3;
  const ox = (W - cols * cw) / 2; const oy = (H - rows * ch) / 2;
  const gap = 0.06; // crop marks stop short of the card
  const mlen = Math.min(0.25, oy - gap, ox - gap);
  const marks = () => {
    let m = '';
    for (let i = 0; i <= cols; i++) {
      const x = ox + i * cw;
      m += `<i class="mk v" style="left:${x}in;top:${oy - gap - mlen}in;height:${mlen}in"></i>`;
      m += `<i class="mk v" style="left:${x}in;top:${oy + rows * ch + gap}in;height:${mlen}in"></i>`;
    }
    for (let j = 0; j <= rows; j++) {
      const y = oy + j * ch;
      m += `<i class="mk h" style="top:${y}in;left:${ox - gap - mlen}in;width:${mlen}in"></i>`;
      m += `<i class="mk h" style="top:${y}in;left:${ox + cols * cw + gap}in;width:${mlen}in"></i>`;
    }
    return m;
  };
  const slot = (col, row, html) => `<div class="slot" style="left:${ox + col * cw}in;top:${oy + row * ch}in">${html}</div>`;
  const back = backHTML();
  // A solid fill under the filled slots hides hairline seams between neighbouring cards.
  // On backs sheets, edges with no neighbouring card get a wider overfill (to just short of the
  // crop marks) so a slightly misregistered duplex print does not leave a white sliver.
  const under = (color, n, mirror, outer = 0.02) => {
    const filled = new Set();
    for (let k = 0; k < n; k++) filled.add(`${mirror ? cols - 1 - (k % cols) : k % cols},${Math.floor(k / cols)}`);
    const ext = (c, r) => (filled.has(`${c},${r}`) ? 0.02 : outer);
    let u = '';
    for (let k = 0; k < n; k++) {
      const col = mirror ? cols - 1 - (k % cols) : k % cols; const row = Math.floor(k / cols);
      const l = ext(col - 1, row); const r = ext(col + 1, row); const t = ext(col, row - 1); const b = ext(col, row + 1);
      u += `<div class="under" style="left:${ox + col * cw - l}in;top:${oy + row * ch - t}in;width:${cw + l + r}in;height:${ch + t + b}in;background:${color}"></div>`;
    }
    return u;
  };
  let body = '';
  const nSheets = Math.ceil(faces.length / 9);
  for (let s = 0; s < nSheets; s++) {
    const group = faces.slice(s * 9, s * 9 + 9);
    let f = ''; let b = '';
    group.forEach((face, k) => {
      const col = k % cols; const row = Math.floor(k / cols);
      f += slot(col, row, face.html);
      // Mirror columns so each back lands behind its front when flipped on the long edge.
      b += slot(cols - 1 - col, row, back);
    });
    const label = (side) => `<div class="lab">${esc(meta.title)} &middot; ${s + 1}/${nSheets} &middot; ${side}</div>`;
    body += `<section class="sheet">${under(C.paper, group.length)}${f}${marks()}${label('fronts')}</section>`;
    body += `<section class="sheet">${under(C.red, group.length, true, gap - 0.005)}${b}${marks()}${label('backs, long-edge flip')}</section>`;
  }
  const css = `
@page { size: ${paper.css || `${W}in ${H}in`}; margin: 0; }
.sheet { position: relative; width: ${W}in; height: ${H}in; overflow: hidden; page-break-after: always; break-after: page; background: #fff; }
.sheet:last-child { page-break-after: auto; break-after: auto; }
.slot { position: absolute; width: ${cw}in; height: ${ch}in; overflow: hidden; }
.slot > .card { position: absolute; left: -.125in; top: -.125in; }
.under { position: absolute; }
.mk { position: absolute; display: block; background: #000; }
.mk.v { width: .25pt; margin-left: -.125pt; }
.mk.h { height: .25pt; margin-top: -.125pt; }
.lab { position: absolute; left: 0; right: 0; bottom: ${Math.max(0.06, oy / 2 - 0.05)}in; text-align: center; font-family: "Literata"; font-size: 5.5pt; letter-spacing: .12em; color: #8a8178; }
`;
  return { html: page(body, css), sheets: nSheets * 2 };
}

// ---------------------------------------------------------------------------
// 4. Render
// ---------------------------------------------------------------------------
async function main() {
  const puppeteer = require('puppeteer-core');
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(POD, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const tmp = path.join(require('os').tmpdir(), `table-talk-${process.pid}`);
  fs.mkdirSync(tmp, { recursive: true });
  try {
    // --- POD PNGs: every face on one tall page, each at an integer pixel position.
    const all = [...faces, { id: 'back', html: backHTML() }];
    const podBody = all.map((f, i) => `<div style="position:absolute;left:0;top:${i * 380}px">${f.html}</div>`).join('');
    const podFile = path.join(tmp, 'pod.html');
    fs.writeFileSync(podFile, page(podBody));
    const p = await browser.newPage();
    await p.setViewport({ width: 300, height: 400, deviceScaleFactor: 300 / 96 });
    await p.goto('file://' + podFile, { waitUntil: 'load' });
    const report = await p.evaluate('fitAll()');
    if (report.overflow.length) throw new Error('Text overflow:\n  ' + report.overflow.join('\n  '));
    const small = report.cards.filter((c) => c.size < 11);
    if (small.length) throw new Error('Saying type too small: ' + small.map((c) => `${c.id} ${c.size}pt`).join(', '));
    const sizes = report.cards.map((c) => c.size);
    console.log(`fitted ${report.cards.length} sayings: ${Math.min(...sizes).toFixed(1)}pt to ${Math.max(...sizes).toFixed(1)}pt, no overflow`);
    for (let i = 0; i < all.length; i++) {
      const name = all[i].id === 'back' ? 'back.png' : `${String(i + 1).padStart(2, '0')}-${all[i].id}.png`;
      const png = await p.screenshot({ clip: { x: 0, y: i * 380, width: 264, height: 360 }, omitBackground: false });
      fs.writeFileSync(path.join(POD, name), withDpi(Buffer.from(png)));
    }
    console.log(`wrote ${all.length} POD images to dist/pod/`);

    // --- Print-and-cut PDFs
    for (const paper of [{ name: 'letter', w: 8.5, h: 11 }, { name: 'a4', w: 210 / 25.4, h: 297 / 25.4, css: '210mm 297mm' }]) {
      const { html, sheets } = sheetsHTML(paper);
      const file = path.join(tmp, `sheets-${paper.name}.html`);
      fs.writeFileSync(file, html);
      const sp = await browser.newPage();
      await sp.goto('file://' + file, { waitUntil: 'load' });
      const r = await sp.evaluate('fitAll()');
      if (r.overflow.length) throw new Error(`Text overflow on ${paper.name} sheets:\n  ` + r.overflow.join('\n  '));
      const out = path.join(DIST, `table-talk-print-and-cut-${paper.name}.pdf`);
      await sp.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
      console.log(`wrote dist/${path.basename(out)} (${sheets} pages)`);
      if (process.argv.includes('--shots')) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await sp.setViewport({ width: Math.round(paper.w * 96), height: Math.round(paper.h * 96), deviceScaleFactor: 1.5 });
        await sp.screenshot({ path: path.join(SHOTS, `sheet-${paper.name}-1.png`), clip: { x: 0, y: 0, width: paper.w * 96, height: paper.h * 96 } });
        await sp.screenshot({ path: path.join(SHOTS, `sheet-${paper.name}-2.png`), clip: { x: 0, y: paper.h * 96, width: paper.w * 96, height: paper.h * 96 } });
      }
      await sp.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error('Table Talk build failed:', e.message); process.exit(1); });
