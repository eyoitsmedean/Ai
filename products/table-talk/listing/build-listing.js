#!/usr/bin/env node
'use strict';
/**
 * Listing images for Table Talk: four 2000 x 2000 px PNGs built from the real card
 * images in ../dist/pod/. Run `node products/table-talk/build.js` first, then
 *   node products/table-talk/listing/build-listing.js
 * The script checks that no text box overflows or overlaps another and that nothing
 * runs off the canvas, then runs check-listing.js.
 */
const fs = require('fs');
const path = require('path');
const { suits } = require('../content');

const HERE = __dirname;
const POD = path.join(HERE, '..', 'dist', 'pod');
const FONTS = require('path').join(__dirname, '../../..', 'products/forty-days/fonts');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const C = { paper: '#f6f3ee', paper2: '#e9e3da', ink: '#23201d', soft: '#6b625a', red: '#a3142c' };
const SUIT_COLOR = { love: '#a3142c', courage: '#9b5d17', peace: '#3b5f5a', grace: '#5d3a68' };

const pod = fs.readdirSync(POD).filter((f) => f.endsWith('.png'));
const img = (id) => {
  const f = id === 'back' ? 'back.png' : pod.find((p) => p.replace(/^\d+-/, '') === `${id}.png`);
  if (!f) throw new Error(`no POD image for ${id}`);
  return 'file://' + path.join(POD, f);
};

// A card shown at trim size: the 825x1125 image has 37.5 px of bleed on each side
// (750x1050 trim), so the image is scaled and offset to hide it.
function card(id, w, style = '') {
  const s = w / 750;
  return `<div class="card" style="width:${w}px;height:${w * 1.4}px;${style}"><img src="${img(id)}" style="width:${825 * s}px;height:${1125 * s}px;left:${-37.5 * s}px;top:${-37.5 * s}px"></div>`;
}

const CSS = `
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENrm28P.ttf"); font-style: normal; }
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENit28P.ttf"); font-style: italic; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata[opsz,wght].ttf"); font-style: normal; font-weight: 200 900; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata-Italic[opsz,wght].ttf"); font-style: italic; font-weight: 200 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 2000px; height: 2000px; overflow: hidden; background: ${C.paper2}; }
body { font-family: "Literata", serif; color: ${C.ink}; font-optical-sizing: auto; position: relative; }
.canvas { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 35%, ${C.paper} 0, ${C.paper2} 75%); }
.card { position: absolute; overflow: hidden; border-radius: 24px; background: ${C.paper};
  box-shadow: 0 2px 4px rgba(35,32,29,.10), 0 18px 40px rgba(35,32,29,.18); }
.card img { position: absolute; display: block; }
.t { position: absolute; }
.kicker { font-size: 34px; font-weight: 500; letter-spacing: .32em; text-transform: uppercase; color: ${C.red}; text-align: center; padding-left: .32em; }
.title { font-family: "Fell"; font-size: 200px; line-height: 1; color: ${C.ink}; text-align: center; }
.h2 { font-family: "Fell"; font-size: 112px; line-height: 1.04; color: ${C.ink}; text-align: center; }
.sub { font-family: "Fell"; font-style: italic; font-size: 66px; line-height: 1.15; color: ${C.red}; text-align: center; }
.small { font-size: 34px; letter-spacing: .14em; text-transform: uppercase; color: ${C.soft}; text-align: center; font-weight: 450; }
.num { font-family: "Literata"; font-style: normal; font-size: .86em; font-variant-numeric: lining-nums; }
.rule { position: absolute; height: 0; border-top: 2px solid ${C.red}; opacity: .45; }
`;

const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Table Talk listing</title>
<style>${CSS}</style></head><body><div class="canvas"></div>${body}</body></html>`;

// ---------------------------------------------------------------------------
// 1. Hero: title over a fan of real cards with the back in the middle.
// ---------------------------------------------------------------------------
function hero() {
  const w = 520;
  const fan = [
    ['back', 10, 800, 830],
    ['courage-01', -7, 180, 940],
    ['peace-10', 7, 1300, 940],
    ['love-07', 0, 740, 870],
  ];
  const cards = fan.map(([id, r, x, y]) => card(id, w, `left:${x}px;top:${y}px;transform:rotate(${r}deg)`)).join('');
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:150px">Red Letter</div>
<div class="t title" data-box style="left:0;right:0;top:230px">Table Talk</div>
<div class="t sub" data-box style="left:200px;right:200px;top:470px"><span class="num">52</span> conversation cards from the words of Jesus</div>
<div class="t small" data-box style="left:0;right:0;top:680px">Printable deck · King James Version</div>
${cards}
<div class="t small" data-box style="left:0;right:0;top:1810px">For family dinners, small groups and couples</div>
`);
}

// ---------------------------------------------------------------------------
// 2. The four suits, one real card from each.
// ---------------------------------------------------------------------------
function suitsImage() {
  const pick = { love: 'love-01', courage: 'courage-03', peace: 'peace-02', grace: 'grace-03' };
  const w = 430, gap = 40, x0 = (2000 - (4 * w + 3 * gap)) / 2, top = 560;
  let out = '';
  suits.forEach((s, i) => {
    const x = x0 + i * (w + gap);
    out += card(pick[s.key], w, `left:${x}px;top:${top}px`);
    out += `<div class="t" data-box style="left:${x}px;width:${w}px;top:${top + w * 1.4 + 56}px;text-align:center">
      <div style="font-size:40px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:${SUIT_COLOR[s.key]};padding-left:.24em">${s.name}</div>
      <div style="margin-top:20px;font-size:34px;line-height:1.38;color:${C.ink};padding:0 10px">${s.blurb}</div></div>`;
  });
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:220px">Four suits · thirteen cards each</div>
<div class="t h2" data-box style="left:120px;right:120px;top:295px">A saying, then a question</div>
${out}
<div class="t" data-box style="left:200px;right:200px;top:1530px;font-size:42px;line-height:1.45;text-align:center;color:${C.ink}">
  Every card pairs words Jesus spoke in the Gospels with one open question that anyone at the table can answer, age 8 to 88.</div>
`);
}

// ---------------------------------------------------------------------------
// 3. What you get: a print-and-cut sheet (same layout as page 1 of the Letter PDF)
//    and the print-on-demand files.
// ---------------------------------------------------------------------------
function included() {
  const u = 128; // px per inch on the sheet
  const pw = 8.5 * u, ph = 11 * u, px = 110, py = 420;
  const cw = 2.5 * u, ch = 3.5 * u, ox = (8.5 - 7.5) / 2 * u, oy = (11 - 10.5) / 2 * u;
  const ids = ['howto-1', 'howto-2', 'love-01', 'love-02', 'love-03', 'love-04', 'love-05', 'love-06', 'love-07'];
  let sheet = `<div style="position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;background:#fff;box-shadow:0 2px 4px rgba(35,32,29,.10),0 18px 40px rgba(35,32,29,.16)">`;
  ids.forEach((id, i) => {
    const s = cw / 750;
    sheet += `<div style="position:absolute;overflow:hidden;left:${ox + (i % 3) * cw}px;top:${oy + Math.floor(i / 3) * ch}px;width:${cw}px;height:${ch}px"><img src="${img(id)}" style="position:absolute;width:${825 * s}px;left:${-37.5 * s}px;top:${-37.5 * s}px"></div>`;
  });
  // crop marks outside the card block
  for (let k = 0; k <= 3; k++) {
    const x = ox + k * cw;
    sheet += `<i style="position:absolute;left:${x}px;top:${oy - 26}px;width:1px;height:20px;background:#000"></i><i style="position:absolute;left:${x}px;top:${oy + 10.5 * u + 6}px;width:1px;height:20px;background:#000"></i>`;
  }
  for (let k = 0; k <= 3; k++) {
    const y = oy + k * ch;
    sheet += `<i style="position:absolute;top:${y}px;left:${ox - 26}px;height:1px;width:20px;background:#000"></i><i style="position:absolute;top:${y}px;left:${ox + 7.5 * u + 6}px;height:1px;width:20px;background:#000"></i>`;
  }
  sheet += '</div>';
  const items = [
    ['<span class="num">54</span> cards', '52 conversation cards and 2 how-to cards, in poker size (2.5 × 3.5 in).'],
    ['Print at home', 'Print-and-cut PDFs in US Letter and A4: 9 cards per sheet with crop marks and matching backs for duplex.'],
    ['Order a real deck', '55 card images at 300 dpi with bleed, ready for a print-on-demand card shop.'],
  ];
  const list = items.map(([h, d]) => `<div style="margin-bottom:56px"><div style="font-family:Fell;font-size:62px;line-height:1.05;color:${C.red}">${h}</div><div style="margin-top:14px;font-size:36px;line-height:1.42">${d}</div></div>`).join('');
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:140px">Instant download</div>
<div class="t h2" data-box style="left:120px;right:120px;top:215px">What you get</div>
${sheet}
<div class="t" data-box style="left:1300px;width:600px;top:470px">${list}</div>
${card('back', 330, `left:1430px;top:1440px;transform:rotate(-4deg)`)}
`);
}

// ---------------------------------------------------------------------------
// 4. How to play: the real how-to card beside a sample card, and three ways to use it.
// ---------------------------------------------------------------------------
function howTo() {
  const w = 560;
  const uses = [
    ['Family dinner', 'One card a night, or a few on a slow evening.'],
    ['Small groups', 'Draw three to open a meeting, or pick one suit.'],
    ['Couples', 'Take a card on a walk or over coffee.'],
  ];
  const colW = 520, colGap = 60, cx0 = (2000 - (3 * colW + 2 * colGap)) / 2;
  const cols = uses.map(([h, d], i) => `<div class="t" data-box style="left:${cx0 + i * (colW + colGap)}px;width:${colW}px;top:1560px;text-align:center">
    <div style="font-family:Fell;font-size:60px;line-height:1.05;color:${C.red}">${h}</div>
    <div style="margin-top:16px;font-size:36px;line-height:1.42">${d}</div></div>`).join('');
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:140px">Easy to play</div>
<div class="t h2" data-box style="left:120px;right:120px;top:215px">Draw, read, talk</div>
${card('howto-1', w, `left:${1000 - w - 50}px;top:520px;transform:rotate(-4deg)`)}
${card('peace-07', w, `left:1050px;top:520px;transform:rotate(4deg)`)}
${cols}
<div class="rule" style="left:700px;width:600px;top:1500px"></div>
<div class="t small" data-box style="left:0;right:0;top:1850px">Pass is always a fine answer</div>
`);
}

async function main() {
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tt-listing-'));
  const problems = [];
  try {
    const jobs = [['1-cover.png', hero()], ['2-four-suits.png', suitsImage()], ['3-whats-included.png', included()], ['4-how-to-play.png', howTo()]];
    for (const [name, html] of jobs) {
      const file = path.join(tmp, name + '.html');
      fs.writeFileSync(file, html);
      const p = await browser.newPage();
      await p.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 });
      await p.goto('file://' + file, { waitUntil: 'load' });
      await p.evaluate(async () => {
        await Promise.all(['400 40px Fell', 'italic 400 40px Fell', '400 40px Literata', '450 40px Literata', '500 40px Literata']
          .map((f) => document.fonts.load(f)));
        await document.fonts.ready;
        await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
      });
      const bad = await p.evaluate(() => {
        const out = [];
        for (const i of document.images) if (!i.naturalWidth) out.push(`image failed: ${i.src}`);
        const boxes = [...document.querySelectorAll('[data-box]')];
        const rects = boxes.map((b) => {
          // measure the actual text, not the positioned box
          const r = document.createRange(); r.selectNodeContents(b);
          return { b, r: r.getBoundingClientRect() };
        });
        for (const { b, r } of rects) {
          if (r.left < 60 || r.top < 60 || r.right > 1940 || r.bottom > 1940) out.push(`off canvas margin: "${b.textContent.trim().slice(0, 40)}"`);
          if (b.scrollWidth > b.clientWidth + 1) out.push(`overflow: "${b.textContent.trim().slice(0, 40)}"`);
        }
        const cards = [...document.querySelectorAll('.card')].filter((c) => getComputedStyle(c).opacity !== '0').map((c) => c.getBoundingClientRect());
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].r, c = rects[j].r;
            if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) out.push(`text overlap: "${rects[i].b.textContent.trim().slice(0, 30)}" / "${rects[j].b.textContent.trim().slice(0, 30)}"`);
          }
          for (const c of [...cards, ...[...document.querySelectorAll('div[style*="background:#fff"]')].map((d) => d.getBoundingClientRect())]) {
            const a = rects[i].r;
            if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) out.push(`text over card: "${rects[i].b.textContent.trim().slice(0, 30)}"`);
          }
        }
        for (const c of cards) if (c.left < 0 || c.top < 0 || c.right > 2000 || c.bottom > 2000) out.push('card cut off by canvas edge');
        return out;
      });
      problems.push(...bad.map((m) => `${name}: ${m}`));
      await p.screenshot({ path: path.join(HERE, name), clip: { x: 0, y: 0, width: 2000, height: 2000 } });
      console.log(`wrote listing/${name}`);
      await p.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  if (problems.length) {
    console.error('Layout problems:\n  ' + problems.join('\n  '));
    process.exit(1);
  }
  console.log('layout check: no overflow, no overlaps, nothing off the canvas');
  require('./check-listing');
}

main().catch((e) => { console.error('listing build failed:', e.message); process.exit(1); });
