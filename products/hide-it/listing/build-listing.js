#!/usr/bin/env node
'use strict';
/**
 * Listing images for Hide It in Your Heart: four 2000 x 2000 px PNGs made from
 * real screenshots of dist/hide-it.html, plus a one-page "Start here" PDF for buyers.
 *
 *   node products/hide-it/build.js
 *   node products/hide-it/listing/build-listing.js
 *
 * Step 1 drives the built game in Chromium (phone 390x844 @3x, desktop 1280x860 @2x)
 * and saves screenshots to listing/shots/. Progress screens use a sample save
 * (about two weeks of play) loaded into localStorage before the page opens.
 * Step 2 lays the screenshots out on 2000 x 2000 canvases. It checks that no text
 * box overflows, overlaps another box or leaves the canvas, then runs check-listing.js.
 *
 * Set HIDEIT_URL to the address of the hosted game to print it on the Start here PDF.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const { collections, ui } = require('../src/content.js');
const { quoteMatches } = require('../verify.js');
const { lookup } = require(require('path').join(__dirname, '../../..', 'lib/scripture'));

const HERE = __dirname;
const GAME = path.join(HERE, '..', 'dist', 'hide-it.html');
const SHOTS = path.join(HERE, 'shots');
const FONTS = require('path').join(__dirname, '../../..', 'products/forty-days/fonts');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL_HOSTED = process.env.HIDEIT_URL || '';
const C = { paper: '#f6f3ee', paper2: '#e9e3da', ink: '#23201d', soft: '#6b625a', red: '#a3142c' };
const ALL = collections.flatMap((c) => c.sayings);
const byId = Object.fromEntries(ALL.map((s) => [s.id, s]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(GAME)) { console.error('Run node products/hide-it/build.js first.'); process.exit(1); }
fs.mkdirSync(SHOTS, { recursive: true });

// Any words of Jesus typed into this script's own copy go through here.
function checked(cite, text) {
  const v = lookup(cite);
  if (!v || !quoteMatches(text, v.text)) throw new Error(`quotation differs from the corpus: ${cite} "${text}"`);
  return text;
}

// ---------------------------------------------------------------------------
// Step 1: screenshots of the real game.
// ---------------------------------------------------------------------------
// A sample save: 15 sayings started over about two weeks, three due today.
function sampleSave() {
  const pad = (n) => String(n).padStart(2, '0');
  const key = (o) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const all4 = { read: true, fade: true, letters: true, build: true };
  const rows = [
    ['peace-be-still', 5, 21], ['only-believe', 4, 9], ['go-in-peace', 4, 11], ['it-is-i', 3, 0],
    ['yoke-easy', 3, 4], ['fishers-of-men', 3, 6], ['forgive-them', 2, 2], ['not-comfortless', 2, 1],
    ['merciful', 2, 0], ['meek', 1, 1], ['our-father', 3, 0], ['thy-kingdom', 2, 2],
    ['daily-bread', 2, 3], ['love-neighbour', 1, 1], ['treasure', 1, 1],
  ];
  const sayings = {};
  for (const [id, box, dueIn] of rows) sayings[id] = { box, due: key(dueIn), modes: all4, reviews: box + 1, lapses: 0, last: key(-1) };
  const days = [];
  for (let o = -13; o <= -1; o++) if (o !== -5) days.push(key(o));
  return JSON.stringify({ v: 1, sayings, streak: { count: 13, last: key(-1), grace: [key(-5)], days }, settings: { theme: 'auto', motion: true, newPerDay: 3 }, learnedOn: {} });
}

async function capture() {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const errors = [];
  async function open(viewport, { save, dark } = {}) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewport(viewport);
    if (dark) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.evaluateOnNewDocument((v) => {
      const d = new Date(); d.setHours(12, 0, 0, 0); window.__hideItBase = d.getTime(); window.__hideItNow = d.getTime();
      try { if (v) localStorage.setItem('redletter.hideit.v1', v); } catch (e) {}
    }, save || '');
    await page.goto('file://' + GAME + '#/today', { waitUntil: 'load' });
    await page.evaluate(async () => {
      await Promise.all(['400 20px "IM Fell English"', 'italic 400 20px "IM Fell English"', '400 20px Literata', '600 20px Literata', 'italic 400 20px Literata'].map((f) => document.fonts.load(f)));
      await document.fonts.ready;
    });
    return { ctx, page };
  }
  const go = async (page, h) => { await page.evaluate((x) => { location.hash = x; }, h); await sleep(120); };
  const click = async (page, sel) => { await page.waitForSelector(sel, { visible: true, timeout: 4000 }); await page.click(sel); await sleep(60); };
  const snap = async (page, name) => { await sleep(500); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
  const phone = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  const ID = 'come-unto-me';
  const toks = byId[ID].text.replace(/[:;,]$/, '').split(' ');
  const n = (w) => w.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '');

  // Four practice modes on one saying, fresh save.
  {
    const { ctx, page } = await open(phone, { save: sampleSave() });
    await go(page, `#/practice/${ID}/read`);
    await snap(page, 'phone-read');
    await go(page, `#/practice/${ID}/fade`);
    await click(page, '[data-test="fade-next"]');
    await click(page, '[data-test="fade-next"]');
    await click(page, '.blank');
    await snap(page, 'phone-fade');
    await go(page, `#/practice/${ID}/letters`);
    await page.type('#typed', toks.slice(0, 7).join(' '), { delay: 0 });
    await snap(page, 'phone-letters');
    await go(page, `#/practice/${ID}/build`);
    for (let i = 0; i < 8; i++) {
      const idx = await page.$$eval('.chip', (cs, w) => cs.findIndex((c) => c.textContent.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '') === w), n(toks[i]));
      if (idx < 0) throw new Error('chip not found: ' + toks[i]);
      await (await page.$$('.chip'))[idx].click();
      await sleep(30);
    }
    await snap(page, 'phone-build');
    await ctx.close();
  }
  // Review, today and progress with the sample save.
  {
    const { ctx, page } = await open(phone, { save: sampleSave() });
    await go(page, '#/today');
    await snap(page, 'phone-today');
    await click(page, '[data-test="start-review"]');
    await snap(page, 'phone-review-cue');
    await go(page, '#/progress');
    await snap(page, 'phone-progress');
    await ctx.close();
  }
  // Dark mode, typed check with a near miss.
  {
    const { ctx, page } = await open(phone, { dark: true, save: sampleSave() });
    await go(page, '#/practice/our-father/letters');
    await page.type('#typed', 'Our Father which art in heaven Hallowed be thy name', { delay: 0 });
    await snap(page, 'phone-dark-check');
    await ctx.close();
  }
  // Desktop: the sayings list.
  {
    const { ctx, page } = await open({ width: 1280, height: 860, deviceScaleFactor: 2 }, { save: sampleSave() });
    await go(page, '#/sayings');
    await snap(page, 'desktop-sayings');
    await ctx.close();
  }
  await browser.close();
  if (errors.length) throw new Error('console errors while capturing: ' + errors.join(' | '));
}

// ---------------------------------------------------------------------------
// Step 2: compose the listing images.
// ---------------------------------------------------------------------------
const shot = (name) => 'file://' + path.join(SHOTS, name + '.png');

// A phone: rounded dark bezel around a 390x844 screenshot, drawn at width w.
function phoneFrame(name, w, style = '') {
  const b = Math.round(w * 0.035);
  const sw = w - 2 * b;
  const sh = Math.round(sw * 844 / 390);
  return `<div class="phone" style="width:${w}px;height:${sh + 2 * b}px;padding:${b}px;border-radius:${Math.round(w * 0.13)}px;${style}"><img src="${shot(name)}" style="width:${sw}px;height:${sh}px;border-radius:${Math.round(w * 0.1)}px"></div>`;
}
const phoneH = (w) => { const b = Math.round(w * 0.035); return Math.round((w - 2 * b) * 844 / 390) + 2 * b; };

const CSS = `
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENrm28P.ttf"); font-style: normal; }
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENit28P.ttf"); font-style: italic; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata[opsz,wght].ttf"); font-style: normal; font-weight: 200 900; }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata-Italic[opsz,wght].ttf"); font-style: italic; font-weight: 200 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 2000px; height: 2000px; overflow: hidden; background: ${C.paper2}; }
body { font-family: "Literata", serif; color: ${C.ink}; font-optical-sizing: auto; position: relative; }
.canvas { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, ${C.paper} 0, ${C.paper2} 78%); }
.phone { position: absolute; background: #1e1b19; box-shadow: 0 3px 6px rgba(35,32,29,.14), 0 30px 60px rgba(35,32,29,.22); }
.phone img { display: block; }
.browser { position: absolute; border-radius: 22px; overflow: hidden; background: #fbfaf7; box-shadow: 0 3px 6px rgba(35,32,29,.12), 0 30px 60px rgba(35,32,29,.2); }
.browser .bar { height: 54px; background: #ddd5ca; display: flex; align-items: center; gap: 14px; padding-left: 26px; }
.browser .bar i { width: 16px; height: 16px; border-radius: 50%; background: #b9ae9f; display: block; }
.browser img { display: block; }
.t { position: absolute; }
.kicker { font-size: 34px; font-weight: 500; letter-spacing: .32em; text-transform: uppercase; color: ${C.red}; text-align: center; padding-left: .32em; }
.title { font-family: "Fell"; font-size: 168px; line-height: 1; color: ${C.ink}; text-align: center; }
.h2 { font-family: "Fell"; font-size: 108px; line-height: 1.04; color: ${C.ink}; text-align: center; }
.sub { font-family: "Fell"; font-style: italic; font-size: 64px; line-height: 1.15; color: ${C.red}; text-align: center; }
.small { font-size: 34px; letter-spacing: .14em; text-transform: uppercase; color: ${C.soft}; text-align: center; font-weight: 450; }
.label { font-size: 40px; text-align: center; color: ${C.ink}; font-weight: 500; }
.label b { font-family: "Literata"; color: ${C.red}; font-weight: 600; margin-right: 10px; font-variant-numeric: lining-nums; }
.note { font-size: 30px; line-height: 1.35; text-align: center; color: ${C.soft}; }
.body { font-size: 40px; line-height: 1.4; color: ${C.ink}; }
.body p + p { margin-top: 26px; }
.list { font-size: 40px; line-height: 1.3; color: ${C.ink}; list-style: none; }
.list li { display: flex; justify-content: space-between; gap: 24px; padding: 17px 0; border-bottom: 2px solid rgba(35,32,29,.12); }
.list li span:last-child { color: ${C.red}; font-variant-numeric: lining-nums tabular-nums; }
.steps { font-size: 38px; line-height: 1.3; list-style: none; }
.steps li { display: block; padding: 14px 0; border-bottom: 2px solid rgba(35,32,29,.12); }
.steps li span { display: block; }
.steps li span:first-child { color: ${C.ink}; }
.steps li span:last-child { color: ${C.red}; font-size: 32px; font-style: italic; }
.num { font-family: "Literata"; font-style: normal; font-size: .86em; font-variant-numeric: lining-nums; }
.rule { position: absolute; height: 0; border-top: 2px solid ${C.red}; opacity: .45; }
`;

const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hide It listing</title>
<style>${CSS}</style></head><body><div class="canvas"></div>${body}</body></html>`;

const total = ALL.length;

// 1. Cover: title over three phones.
function cover() {
  const wc = 500, ws = 430;
  const top = 840;
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:130px">Red Letter</div>
<div class="t title" data-box style="left:0;right:0;top:205px">Hide It in Your Heart</div>
<div class="t sub" data-box style="left:220px;right:220px;top:420px">A memory game for the words of Jesus</div>
<div class="t small" data-box style="left:0;right:0;top:530px"><span class="num">${total}</span> sayings · King James Version · Plays in your browser</div>
<div class="rule" style="left:900px;right:900px;top:630px"></div>
<div class="t note" data-box style="left:360px;right:360px;top:670px;font-size:36px">Read it, watch it fade, type it from first letters, build it from shuffled words. Then it comes back right before you would forget.</div>
${phoneFrame('phone-letters', ws, `left:300px;top:${top + 90}px;transform:rotate(-5deg)`)}
${phoneFrame('phone-build', ws, `left:1270px;top:${top + 90}px;transform:rotate(5deg)`)}
${phoneFrame('phone-fade', wc, `left:${1000 - wc / 2}px;top:${top}px`)}
`);
}

// 2. Four ways to practice.
function modes() {
  const w = 440, gap = 40, x0 = (2000 - (4 * w + 3 * gap)) / 2, top = 610;
  const items = [['phone-read', 'Read'], ['phone-fade', 'Fade'], ['phone-letters', 'First Letters'], ['phone-build', 'Build']];
  const notes = ['Read it aloud, then hide it and bring it back.', 'Each round hides more words. Tap a blank to peek.', 'Type it from memory with only first letters showing.', 'Tap the shuffled words in order.'];
  const h = phoneH(w);
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:230px">Every saying, four ways</div>
<div class="t h2" data-box style="left:0;right:0;top:300px">Learn it a little at a time</div>
<div class="t note" data-box style="left:300px;right:300px;top:440px;font-size:36px">Each mode asks a little more of your memory than the last.</div>
${items.map(([s, l], i) => `${phoneFrame(s, w, `left:${x0 + i * (w + gap)}px;top:${top}px`)}
<div class="t label" data-box style="left:${x0 + i * (w + gap)}px;width:${w}px;top:${top + h + 44}px"><b>${i + 1}</b>${l}</div>
<div class="t note" data-box style="left:${x0 + i * (w + gap) + 10}px;width:${w - 20}px;top:${top + h + 110}px">${notes[i]}</div>`).join('')}
`);
}

// 3. Review that comes back before you forget.
function review() {
  const w = 520, top = 470;
  const steps = [['Learned today', 'back tomorrow'], ['Familiar', 'in 3 days'], ['Growing', 'in about a week'], ['Steady', 'in about two weeks'], ['Hidden in your heart', 'about a month']];
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:120px">A few minutes a day</div>
<div class="t h2" data-box style="left:0;right:0;top:190px">It comes back right before you forget</div>
${phoneFrame('phone-review-cue', w, `left:150px;top:${top}px`)}
${phoneFrame('phone-progress', w, `left:${150 + w + 60}px;top:${top + 120}px`)}
<div class="t body" data-box style="left:1420px;width:470px;top:${top + 10}px">
  <p>A review card shows only the moment. You say the words, then reveal them and mark how it went.</p>
</div>
<ul class="t steps" data-box style="left:1420px;width:470px;top:${top + 360}px">
  ${steps.map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('')}
</ul>
<div class="t note" data-box style="left:1420px;width:470px;top:1500px;text-align:left">Two grace days a week, so a missed day does not cost you your streak.</div>
`);
}

// 4. What's inside.
function inside() {
  const bw = 1180, bh = Math.round(bw * 860 / 1280);
  const left = 90, top = 470;
  return page(`
<div class="t kicker" data-box style="left:0;right:0;top:120px">What's inside</div>
<div class="t h2" data-box style="left:0;right:0;top:190px"><span class="num">${total}</span> sayings in <span class="num">${collections.length}</span> collections</div>
<div class="browser" style="left:${left}px;top:${top}px;width:${bw}px"><div class="bar"><i></i><i></i><i></i></div><img src="${shot('desktop-sayings')}" style="width:${bw}px;height:${bh}px"></div>
<ul class="t list" data-box style="left:1350px;width:560px;top:${top}px">
  ${collections.map((c) => `<li><span>${c.name}</span><span>${c.sayings.length}</span></li>`).join('')}
</ul>
${phoneFrame('phone-dark-check', 340, `left:1460px;top:1190px`)}
<div class="t note" data-box style="left:${left}px;width:${bw}px;top:${top + bh + 100}px;text-align:left;font-size:34px">One file that runs in any modern browser. No account, no ads, and nothing is sent anywhere: progress stays on your device. Light and dark themes. Every saying checked word for word against the red-letter King James text.</div>
`);
}

async function compose() {
  const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const pg = await browser.newPage();
  await pg.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 });
  const out = [['1-cover', cover()], ['2-four-modes', modes()], ['3-review', review()], ['4-whats-inside', inside()]];
  const problems = [];
  const tmp = path.join(SHOTS, '_compose.html');
  for (const [name, html] of out) {
    fs.writeFileSync(tmp, html);
    await pg.goto('file://' + tmp, { waitUntil: 'load' });
    await pg.evaluate(async () => {
      await Promise.all(['400 40px Fell', 'italic 400 40px Fell', '400 40px Literata', '500 40px Literata', '600 40px Literata'].map((f) => document.fonts.load(f)));
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode()));
    });
    const p = await pg.evaluate(() => {
      const out = [];
      const boxes = [...document.querySelectorAll('[data-box]')];
      const rects = boxes.map((b) => b.getBoundingClientRect());
      boxes.forEach((b, i) => {
        if (b.scrollWidth > b.clientWidth + 1) out.push(`text overflows its box: ${b.textContent.trim().slice(0, 40)}`);
        const rg = document.createRange(); rg.selectNodeContents(b);
        const r = rg.getBoundingClientRect();
        if (r.left < 40 || r.top < 40 || r.right > 1960 || r.bottom > 1960) out.push(`text too near the edge: ${b.textContent.trim().slice(0, 40)}`);
      });
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], c = rects[j];
        if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) out.push(`text boxes overlap: "${boxes[i].textContent.trim().slice(0, 30)}" / "${boxes[j].textContent.trim().slice(0, 30)}"`);
      }
      // Text must not sit on a screenshot either.
      const pics = [...document.querySelectorAll('.phone, .browser')].map((e) => e.getBoundingClientRect());
      boxes.forEach((b, i) => pics.forEach((q) => { const a = rects[i]; if (a.left < q.right && q.left < a.right && a.top < q.bottom && q.top < a.bottom) out.push(`text sits on a screenshot: ${b.textContent.trim().slice(0, 30)}`); }));
      document.querySelectorAll('.phone, .browser').forEach((e) => { const r = e.getBoundingClientRect(); if (r.left < 0 || r.top < 0 || r.right > 2000 || r.bottom > 2000) out.push('a screenshot runs off the canvas'); });
      return out;
    });
    problems.push(...p.map((x) => `${name}: ${x}`));
    await pg.screenshot({ path: path.join(HERE, name + '.png'), clip: { x: 0, y: 0, width: 2000, height: 2000 } });
    console.log(`wrote listing/${name}.png`);
  }
  fs.unlinkSync(tmp);

  // Start here PDF for buyers (US Letter, one page).
  const start = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Start here</title><style>
@font-face { font-family: "Fell"; src: url("file://${FONTS}/IMFeENrm28P.ttf"); }
@font-face { font-family: "Literata"; src: url("file://${FONTS}/Literata[opsz,wght].ttf"); font-weight: 200 900; }
@page { size: 8.5in 11in; margin: 0.7in 0.95in; }
body { font-family: "Literata", serif; color: ${C.ink}; font-size: 11pt; line-height: 1.45; margin: 0; }
.k { font-size: 9pt; letter-spacing: .3em; text-transform: uppercase; color: ${C.red}; font-weight: 600; }
h1 { font-family: "Fell"; font-weight: 400; font-size: 34pt; margin: 4pt 0 2pt; }
.sub { color: ${C.soft}; margin: 0 0 18pt; }
h2 { font-family: "Fell"; font-weight: 400; font-size: 17pt; margin: 14pt 0 3pt; color: ${C.red}; }
ol, ul { padding-left: 18pt; margin: 0; } li { margin: 3pt 0; }
.foot { margin-top: 20pt; padding-top: 10pt; border-top: 1px solid #d8d0c4; font-size: 9.5pt; color: ${C.soft}; }
code { font-family: "Literata"; font-weight: 600; }
</style></head><body>
<div class="k">Red Letter</div>
<h1>Hide It in Your Heart</h1>
<p class="sub">${ui.tagline}. Thank you for downloading it.</p>
<h2>Open the game on a computer</h2>
<ol>
<li>Save <code>hide-it.html</code> somewhere you will keep it, such as your Documents folder.</li>
<li>Double-click it. It opens in your web browser (Chrome, Edge, Firefox or Safari). No internet connection is needed.</li>
<li>Bookmark the page, and open it the same way each time with the same browser, so your progress is there.</li>
</ol>
${URL_HOSTED ? `<h2>Play on your phone</h2><p>Open <code>${URL_HOSTED}</code> in your phone's browser and choose Add to Home Screen. Progress on your phone is kept separately from your computer.</p>` : ''}
<h2>How to play</h2>
<ul>
<li>Start with a short saying. Practice it four ways: Read, Fade, First Letters and Build.</li>
<li>Once all four are done, it joins your review. It comes back tomorrow, then in a few days, then a week, then longer.</li>
<li>Capitals and punctuation never matter. Old words such as thee, thou, hath and shalt are spelled as written.</li>
<li>A few minutes a day is plenty. Two grace days a week keep your streak if you miss a day.</li>
</ul>
<h2>Your progress</h2>
<p>Progress is saved in your browser on this device and is never sent anywhere. Clearing your browser's site data erases it, and a different browser or device keeps its own separate progress.</p>
<div class="foot">Scripture from the King James Version (1769), public domain in the United States. Set in IM Fell English and Literata (SIL Open Font License). For personal and household use; please do not share or resell the file. This is a memory aid for personal devotion and is not a substitute for a church community, pastoral care or professional counseling.</div>
</body></html>`;
  const sp = path.join(SHOTS, '_start.html');
  fs.writeFileSync(sp, start);
  await pg.goto('file://' + sp, { waitUntil: 'load' });
  await pg.evaluate(async () => { await Promise.all(['400 20px Fell', '400 20px Literata', '600 20px Literata'].map((f) => document.fonts.load(f))); await document.fonts.ready; });
  const pdf = await pg.pdf({ path: path.join(HERE, 'hide-it-start-here.pdf'), preferCSSPageSize: true, printBackground: true });
  const pages = (Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (pages !== 1) problems.push(`start-here PDF has ${pages} pages (want 1)`);
  fs.unlinkSync(sp);
  console.log('wrote listing/hide-it-start-here.pdf' + (URL_HOSTED ? ` (phone link ${URL_HOSTED})` : ' (no phone link: HIDEIT_URL not set)'));
  await browser.close();
  if (problems.length) { console.error('LAYOUT PROBLEMS\n  ' + problems.join('\n  ')); process.exit(1); }
}

(async () => {
  checked('Matthew 11:28', byId['come-unto-me'].text);
  await capture();
  console.log('captured screenshots in listing/shots/');
  await compose();
  execFileSync(process.execPath, [path.join(HERE, 'check-listing.js')], { stdio: 'inherit' });
})().catch((e) => { console.error(e); process.exit(1); });
