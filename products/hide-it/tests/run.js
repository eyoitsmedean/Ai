#!/usr/bin/env node
// Plays through Hide It in Your Heart in Chromium at desktop and phone widths.
// Asserts progress is saved, scoring is right and the console stays clean,
// and saves screenshots to tests/screenshots/.
//
//   node tests/run.js        (run node build.js first)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { ui, collections } = require('../src/content.js');

const HERE = __dirname;
const FILE = path.join(HERE, '..', 'dist', 'hide-it.html');
const SHOTS = path.join(HERE, 'screenshots');
const URL = 'file://' + FILE;
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const KEY = 'redletter.hideit.v1';
const ALL = collections.flatMap((c) => c.sayings);
const byId = Object.fromEntries(ALL.map((s) => [s.id, s]));
const norm = (w) => w.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '');
const shown = (t) => t.replace(/[:;,]$/, '');

let passed = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { passed++; return; }
  failures.push(msg);
  console.error('  FAIL ' + msg);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage(browser, viewport, opts = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url().slice(0, 80)));
  page.on('request', (r) => { if (!/^(file|data):/.test(r.url())) errors.push('external request: ' + r.url()); });
  await page.setViewport(viewport);
  if (opts.dark) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  if (opts.noStorage) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: storage disabled'); } });
    });
  }
  if (opts.preload !== undefined) {
    await page.evaluateOnNewDocument((v) => { try { localStorage.setItem('redletter.hideit.v1', v); } catch (e) {} }, opts.preload);
  }
  // Pin the clock to noon today so day arithmetic never crosses midnight.
  await page.evaluateOnNewDocument(() => { const d = new Date(); d.setHours(12, 0, 0, 0); window.__hideItBase = d.getTime(); window.__hideItNow = d.getTime(); });
  await page.goto(URL + '#/today', { waitUntil: 'load' });
  await page.evaluate(async () => {
    await Promise.all(['400 20px "IM Fell English"', 'italic 400 20px "IM Fell English"', '400 20px Literata', '600 20px Literata', 'italic 400 20px Literata'].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  });
  return { ctx, page, errors };
}

async function shot(page, name, full = false) {
  await sleep(450); // let the view-enter animation settle
  const p = path.join(SHOTS, name + '.png');
  await page.screenshot({ path: p, fullPage: full });
  return p;
}
async function state(page) { return page.evaluate(() => window.HideIt.state()); }
async function stored(page, key = KEY) { return page.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return 'unavailable'; } }, key); }
async function setDay(page, offset) {
  await page.evaluate((o) => { window.__hideItNow = window.__hideItBase + o * 86400000; window.HideIt.rerender(); }, offset);
}
async function go(page, hash) { await page.evaluate((h) => { location.hash = h; }, hash); await sleep(60); }
async function click(page, sel) { await page.waitForSelector(sel, { visible: true, timeout: 4000 }); await page.click(sel); await sleep(40); }
async function text(page, sel) { return page.$eval(sel, (e) => e.textContent.trim()); }
async function overflow(page) { return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); }
async function feedbackText(page) { await sleep(80); return text(page, '#fb'); }

async function typeInto(page, sel, value) {
  await page.$eval(sel, (e) => { e.value = ''; });
  await page.type(sel, value, { delay: 0 });
}

// Things that are true on every screen.
async function screenChecks(page, label) {
  const o = await overflow(page);
  ok(o <= 0, `${label}: no horizontal scroll (overflow ${o}px)`);
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('button, a[href], textarea, [role="switch"]')]
    .filter((e) => e.offsetParent !== null)
    .filter((e) => !((e.getAttribute('aria-label') || '').trim() || (e.textContent || '').trim() || e.getAttribute('aria-labelledby') || (e.id && document.querySelector(`label[for="${e.id}"]`))))
    .map((e) => e.outerHTML.slice(0, 80)));
  ok(unnamed.length === 0, `${label}: every control has an accessible name ${unnamed.join(' | ')}`);
  const small = await page.evaluate(() => [...document.querySelectorAll('main *')]
    .filter((e) => e.offsetParent !== null && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.sr-only'))
    .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 11.5)
    .map((e) => e.tagName + '.' + e.className + ':' + getComputedStyle(e).fontSize));
  ok(small.length === 0, `${label}: no text smaller than 11.5px ${small.slice(0, 3).join(' ')}`);
  // Text inside the main column must not poke out of its box.
  const spill = await page.evaluate(() => [...document.querySelectorAll('main .card, main .stat, .saying-text, .chips, .built, .rate')]
    .filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1).map((e) => e.className));
  ok(spill.length === 0, `${label}: nothing spills out of its box ${spill.join(',')}`);
}

async function playSaying(page, id, tag, shots) {
  const s = byId[id];
  const toks = shown(s.text).split(' ');
  await go(page, `#/practice/${id}/read`);

  // 1. Read: hide, then reveal phrase by phrase.
  if (shots) await shot(page, `${tag}-1-read`);
  await screenChecks(page, `${tag} read`);
  await click(page, '[data-test="hide"]');
  let guard = 0;
  while (await page.$('[data-test="reveal"]') && guard++ < 40) await click(page, '[data-test="reveal"]');
  let st = await state(page);
  ok(st.sayings[id] && st.sayings[id].modes.read === true, `${tag}: read mode saved`);
  ok((await text(page, '[data-test="complete"] .msg')).startsWith(ui.feedback.modeComplete('Read')), `${tag}: read completion message`);

  // 2. Fade: rounds until every word is hidden.
  await click(page, '[data-test="next-mode"]');
  ok(await page.evaluate(() => location.hash.endsWith('/fade')), `${tag}: next mode goes to fade`);
  const r1 = await text(page, '[data-test="round"]');
  const roundsTotal = +/of (\d+)/.exec(r1)[1];
  ok(r1.startsWith(ui.practice.progress(1, roundsTotal)), `${tag}: fade starts at round 1 (${r1})`);
  await click(page, '[data-test="fade-next"]');
  const blanks2 = await page.$$eval('.blank', (b) => b.length);
  const expect2 = Math.round(toks.length * 2 / roundsTotal);
  ok(blanks2 === expect2, `${tag}: round 2 hides ${expect2} words (saw ${blanks2})`);
  if (blanks2) {
    await click(page, '.blank');
    const peeked = await page.$eval('.blank.peek', (b) => b.textContent);
    ok(toks.map(norm).includes(norm(peeked)), `${tag}: tapping a blank peeks at a real word (${peeked})`);
    ok((await text(page, '[data-test="round"]')).includes(ui.practice.peeks(1)), `${tag}: peek is counted`);
  }
  if (shots) await shot(page, `${tag}-2-fade`);
  await screenChecks(page, `${tag} fade`);
  guard = 0;
  while (await page.$('[data-test="fade-next"]') && guard++ < 10) await click(page, '[data-test="fade-next"]');
  const blanksEnd = await page.$$eval('.blank', (b) => b.length);
  ok(blanksEnd === toks.length, `${tag}: last round hides every word`);
  st = await state(page);
  ok(st.sayings[id].modes.fade === true, `${tag}: fade mode saved`);

  // 3. First letters: a partial answer, then a sloppy but right one.
  await click(page, '[data-test="next-mode"]');
  const letters = await page.$eval('.saying-text .sr-only', (e) => e.textContent);
  ok(letters === toks.map((t) => t.charAt(0)).join(' '), `${tag}: first letters shown (${letters})`);
  const drop = toks.slice(0, -1).join(' ');
  await typeInto(page, '#typed', drop);
  await click(page, '[data-test="check"]');
  const res1 = await page.$eval('[data-test="result"]', (e) => ({ missed: +e.dataset.missed, verdict: e.dataset.verdict, text: e.querySelector('.verdict').textContent, marked: [...e.querySelectorAll('.w-missed')].map((x) => x.textContent) }));
  ok(res1.missed === 1, `${tag}: one dropped word scores 1 missed (got ${res1.missed})`);
  ok(res1.text === ui.feedback.close(1), `${tag}: close feedback text`);
  ok(res1.marked.length === 1 && res1.marked[0] === toks[toks.length - 1], `${tag}: diff marks the missed word (${res1.marked})`);
  ok((await feedbackText(page)) === ui.feedback.close(1), `${tag}: aria-live feedback announces the result`);
  st = await state(page);
  ok(!st.sayings[id].modes.letters, `${tag}: an imperfect answer does not complete the mode`);
  if (shots) await shot(page, `${tag}-3-letters-diff`);
  await screenChecks(page, `${tag} letters`);
  const sloppy = toks.map((t, i) => (i % 2 ? t.toUpperCase() : t.toLowerCase()).replace(/[,.;:]/g, '')).join('  ') + '!!';
  await typeInto(page, '#typed', sloppy);
  await page.keyboard.press('Enter');
  await sleep(60);
  const res2 = await page.$eval('[data-test="result"]', (e) => e.dataset.verdict);
  ok(res2 === 'perfect', `${tag}: case and punctuation are ignored (${res2})`);
  st = await state(page);
  ok(st.sayings[id].modes.letters === true, `${tag}: letters mode saved`);

  // 4. Build: one wrong tap, then the words in order.
  await click(page, '[data-test="next-mode"]');
  const want = toks;
  const wrong = await page.$$eval('.chip', (cs, first) => {
    const n = (w) => w.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '');
    const i = cs.findIndex((c) => n(c.textContent) !== n(first));
    return i;
  }, want[0]);
  if (wrong >= 0) {
    await (await page.$$('.chip'))[wrong].click();
    await sleep(40);
    ok((await text(page, '[data-test="mistakes"]')) === ui.practice.mistakes(1), `${tag}: wrong tap is counted`);
    ok((await feedbackText(page)) === ui.feedback.wrongChip, `${tag}: wrong tap feedback`);
    ok((await page.$eval('[data-test="built"]', (e) => e.textContent.trim())) === '', `${tag}: wrong tap places nothing`);
  }
  for (let i = 0; i < want.length; i++) {
    if (shots && i === Math.floor(want.length / 2)) await shot(page, `${tag}-4-build-mid`);
    const idx = await page.$$eval('.chip', (cs, w) => {
      const n = (x) => x.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]/g, '');
      return cs.findIndex((c) => n(c.textContent) === n(w));
    }, want[i]);
    ok(idx >= 0, `${tag}: chip for "${want[i]}" is available`);
    if (idx < 0) break;
    await (await page.$$('.chip'))[idx].click();
  }
  await sleep(80);
  const built = await page.$eval('[data-test="built"]', (e) => e.childNodes[0] ? [...e.childNodes].filter((n) => !(n.classList && n.classList.contains('trail'))).map((n) => n.textContent).join('').trim() : '');
  ok(built === shown(byId[id].text), `${tag}: built text equals the saying`);
  ok((await text(page, '[data-test="mistakes"]')) === ui.practice.mistakes(wrong >= 0 ? 1 : 0), `${tag}: final wrong-tap count`);
  st = await state(page);
  const r = st.sayings[id];
  ok(r.modes.build === true && r.box === 1, `${tag}: all four modes done puts the saying in box 1`);
  const tomorrow = await page.evaluate(() => { const d = new Date(window.__hideItNow + 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  ok(r.due === tomorrow, `${tag}: first review is due tomorrow (${r.due})`);
  ok((await text(page, '[data-test="complete"] .msg')).includes(ui.feedback.sayingLearned), `${tag}: learned message shown`);
  if (shots) await shot(page, `${tag}-5-build-done`);
  await screenChecks(page, `${tag} build`);
  const saved = await stored(page);
  ok(saved && saved.sayings[id] && saved.sayings[id].box === 1, `${tag}: progress is in localStorage`);
}

async function runViewport(browser, name, viewport) {
  console.log(`\n== ${name} (${viewport.width}x${viewport.height} @${viewport.deviceScaleFactor}x)`);
  const { ctx, page, errors } = await openPage(browser, viewport);
  const tag = name;

  ok((await page.$eval('.brand-title', (e) => e.textContent)) === ui.appName, `${tag}: title renders`);
  ok(await page.evaluate(() => document.fonts.check('20px "IM Fell English"') && document.fonts.check('20px Literata')), `${tag}: fonts loaded`);
  await shot(page, `${tag}-0-today-welcome`);
  await screenChecks(page, `${tag} today`);

  // Start with the first saying from the welcome card.
  await click(page, '[data-test="start"]');
  ok(await page.evaluate(() => location.hash === '#/practice/peace-be-still/read'), `${tag}: welcome starts with the shortest saying`);
  await playSaying(page, 'peace-be-still', tag, true);
  // A long saying with a run-on colon and several "the"s.
  await playSaying(page, 'vine-branches', `${tag}-long`, true);

  // Sayings list.
  await go(page, '#/sayings');
  await shot(page, `${tag}-6-sayings`);
  await screenChecks(page, `${tag} sayings`);
  const pipsOn = await page.$eval('a[data-id="peace-be-still"] .pips', (e) => e.querySelectorAll('i.on').length);
  ok(pipsOn === 1, `${tag}: sayings list shows mastery pips`);

  // Reload: progress survives.
  await page.reload({ waitUntil: 'load' });
  let st = await state(page);
  ok(st.sayings['peace-be-still'].box === 1 && st.streak.count === 1, `${tag}: progress survives a reload`);

  // Day 1: two reviews due.
  await setDay(page, 1);
  await go(page, '#/today');
  ok((await text(page, '[data-test="due-num"]')) === '2', `${tag}: two reviews due tomorrow`);
  ok((await text(page, '[data-test="due-text"]')) === ui.today.dueCount(2), `${tag}: due count text`);
  ok((await text(page, '[data-test="streak-num"]')).startsWith('1'), `${tag}: streak holds overnight`);
  await shot(page, `${tag}-7-today-due`);
  await screenChecks(page, `${tag} today due`);
  await click(page, '[data-test="start-review"]');
  ok((await text(page, '[data-test="review-counter"]')) === ui.review.counter(1, 2), `${tag}: review counter`);
  await shot(page, `${tag}-8-review-cue`);
  // First review: type it.
  await click(page, '[data-test="rv-type"]');
  await typeInto(page, '#rv-typed', 'peace be still');
  await click(page, '[data-test="rv-check"]');
  ok((await page.$eval('[data-test="result"]', (e) => e.dataset.verdict)) === 'perfect', `${tag}: review typing scored perfect`);
  ok(await page.$eval('[data-test="rate-good"]', (e) => e.classList.contains('primary')), `${tag}: a perfect answer suggests "I knew it"`);
  await shot(page, `${tag}-9-review-rate`);
  await screenChecks(page, `${tag} review`);
  await click(page, '[data-test="rate-good"]');
  st = await state(page);
  ok(st.sayings['peace-be-still'].box === 2, `${tag}: "I knew it" moves to box 2`);
  const day4 = await page.evaluate(() => { const d = new Date(window.__hideItNow + 3 * 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  ok(st.sayings['peace-be-still'].due === day4, `${tag}: box 2 comes back in 3 days`);
  ok(st.streak.count === 2, `${tag}: practicing the next day makes a 2-day streak`);
  // Second review: reveal and say "not yet".
  await click(page, '[data-test="rv-show"]');
  await click(page, '[data-test="rate-again"]');
  st = await state(page);
  ok(st.sayings['vine-branches'].box === 1 && st.sayings['vine-branches'].lapses === 1, `${tag}: "Not yet" keeps it in box 1`);
  await page.waitForSelector('[data-test="review-done"]');
  ok(true, `${tag}: review session ends`);

  // Skip day 2, come back day 3: a grace day covers it.
  await setDay(page, 3);
  await go(page, '#/today');
  ok((await text(page, '[data-test="streak-num"]')).startsWith('2'), `${tag}: streak waits through one missed day`);
  await go(page, '#/practice/only-believe/read');
  await click(page, '[data-test="hide"]');
  while (await page.$('[data-test="reveal"]')) await click(page, '[data-test="reveal"]');
  st = await state(page);
  ok(st.streak.count === 3 && st.streak.grace.length === 1, `${tag}: grace day used, streak 3 (count ${st.streak.count}, grace ${st.streak.grace.length})`);
  ok((await text(page, '#toast')) === ui.streak.graceUsed, `${tag}: grace day message`);
  // Miss five days: streak restarts gently.
  await setDay(page, 9);
  await go(page, '#/practice/only-believe/fade');
  while (await page.$('[data-test="fade-next"]')) await click(page, '[data-test="fade-next"]');
  st = await state(page);
  ok(st.streak.count === 1, `${tag}: a long gap starts the streak again`);
  ok((await text(page, '#toast')) === ui.streak.restarted, `${tag}: restart message is kind`);

  // Progress and settings.
  await go(page, '#/progress');
  ok((await text(page, '[data-test="started"]')) === '3', `${tag}: progress counts 3 started sayings`);
  await shot(page, `${tag}-10-progress`, true);
  await screenChecks(page, `${tag} progress`);
  await click(page, '[data-theme-set="dark"]');
  ok(await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'), `${tag}: dark theme setting applies`);
  ok((await stored(page)).settings.theme === 'dark', `${tag}: theme setting saved`);
  await go(page, '#/practice/vine-branches/letters');
  await typeInto(page, '#typed', 'I am the vine ye are the branches He that abideth in me and I in him the same bringeth forth much frut for without me ye can do nothing');
  await click(page, '[data-test="check"]');
  await shot(page, `${tag}-11-dark-letters`);
  await screenChecks(page, `${tag} dark letters`);
  await go(page, '#/progress');
  await click(page, '[data-theme-set="auto"]');
  await click(page, '[data-act="motion"]');
  ok(await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')), `${tag}: reduce motion setting applies`);
  await click(page, '[data-test="reset"]');
  await click(page, '[data-test="reset-yes"]');
  st = await state(page);
  ok(Object.keys(st.sayings).length === 0 && st.streak.count === 0 && st.settings.motion === true, `${tag}: reset clears progress and keeps settings`);
  await go(page, '#/about');
  await shot(page, `${tag}-12-about`);
  await screenChecks(page, `${tag} about`);
  ok((await page.$eval('main', (e) => e.textContent)).includes('not a substitute'), `${tag}: about includes the counseling line`);

  ok(errors.length === 0, `${tag}: no console errors or external requests ${errors.join(' | ')}`);
  await ctx.close();
}

async function runKeyboard(browser) {
  console.log('\n== keyboard only (1280x860)');
  const { ctx, page, errors } = await openPage(browser, { width: 1280, height: 860, deviceScaleFactor: 1 });
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.classList.contains('skip')), 'keyboard: first Tab reaches the skip link');
  await go(page, '#/practice/peace-be-still/read');
  await page.focus('[data-test="hide"]');
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
  ok(ring && ring !== 'none', 'keyboard: focused button shows a focus ring');
  await page.keyboard.press('Enter');
  await sleep(40);
  ok(await page.evaluate(() => document.activeElement && document.activeElement.dataset.test === 'reveal'), 'keyboard: focus moves to Reveal');
  await page.keyboard.press(' ');
  await sleep(40);
  await page.keyboard.press('Enter');
  await sleep(60);
  const st = await state(page);
  ok(st.sayings['peace-be-still'].modes.read === true, 'keyboard: read mode completed with keys alone');
  await go(page, '#/practice/peace-be-still/build');
  for (const w of ['Peace,', 'be', 'still.']) {
    const ok2 = await page.$$eval('.chip', (cs, w) => { const c = cs.find((x) => x.textContent === w); if (!c) return false; c.focus(); return true; }, w);
    if (ok2) { await page.keyboard.press('Enter'); await sleep(30); }
  }
  ok((await page.$eval('[data-test="built"]', (e) => e.textContent.trim())) === 'Peace, be still.', 'keyboard: build mode works from the keyboard');
  ok(errors.length === 0, `keyboard: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

async function runNoStorage(browser) {
  console.log('\n== storage unavailable (375x812)');
  const { ctx, page, errors } = await openPage(browser, { width: 375, height: 812, deviceScaleFactor: 2 }, { noStorage: true });
  ok(await page.evaluate(() => window.HideIt.storageOK() === false), 'no storage: app notices storage is off');
  await go(page, '#/practice/peace-be-still/read');
  await click(page, '[data-test="hide"]');
  while (await page.$('[data-test="reveal"]')) await click(page, '[data-test="reveal"]');
  const st = await state(page);
  ok(st.sayings['peace-be-still'].modes.read === true, 'no storage: progress still works for the session');
  await go(page, '#/progress');
  ok((await text(page, '[data-test="storage-off"]')) === ui.progress.storageOff, 'no storage: progress page explains it');
  await shot(page, 'mobile-13-no-storage');
  ok(errors.length === 0, `no storage: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

async function runDark360(browser) {
  console.log('\n== dark mode, 360px');
  const { ctx, page, errors } = await openPage(browser, { width: 360, height: 760, deviceScaleFactor: 2 }, { dark: true });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok(bg === 'rgb(23, 21, 19)', `dark: prefers-color-scheme gives the dark paper (${bg})`);
  await shot(page, 'dark360-0-today');
  await screenChecks(page, 'dark360 today');
  // The longest saying in each mode at the narrowest width.
  const longest = ALL.reduce((a, b) => (b.text.split(' ').length > a.text.split(' ').length ? b : a));
  for (const mode of ['read', 'fade', 'letters', 'build']) {
    await go(page, `#/practice/${longest.id}/${mode}`);
    if (mode === 'fade') { await click(page, '[data-test="fade-next"]'); await click(page, '[data-test="fade-next"]'); }
    await shot(page, `dark360-${mode}`, true);
    await screenChecks(page, `dark360 ${mode} (${longest.ref})`);
  }
  await go(page, '#/sayings');
  await screenChecks(page, 'dark360 sayings');
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);
  const dur = await page.evaluate(() => getComputedStyle(document.querySelector('main')).animationDuration);
  ok(parseFloat(dur) < 0.01, `reduced motion: animations are switched off (${dur})`);
  ok(errors.length === 0, `dark360: no console errors ${errors.join(' | ')}`);
  await ctx.close();
}

async function runScoring(browser) {
  console.log('\n== scoring rules');
  const { ctx, page } = await openPage(browser, { width: 800, height: 600, deviceScaleFactor: 1 });
  const t = byId['not-comfortless'].text; // I will not leave you comfortless: I will come to you.
  const c = (typed) => page.evaluate((a, b) => { const r = window.HideIt.checkTyped(a, b); return { missed: r.missed, near: r.near, extra: r.extra, verdict: r.verdict, got: r.got, total: r.total }; }, t, typed);
  let r = await c('I will not leave you comfortless: I will come to you.');
  ok(r.missed === 0 && r.verdict === 'perfect' && r.total === 11, 'scoring: exact text is perfect');
  r = await c('i will not leave you comfortless i will come to thee');
  ok(r.missed === 1 && r.extra.join() === 'thee' && r.verdict === 'close', `scoring: thee for you counts as one miss plus one extra (${JSON.stringify(r)})`);
  r = await c('I will not leave you comfortles I will come to you');
  ok(r.missed === 0 && r.near === 1, 'scoring: a one-letter slip in a long word is forgiven and flagged');
  r = await c('I will not leave you');
  ok(r.missed === 6 && r.verdict === 'keepGoing', 'scoring: half the saying is a gentle "keep going"');
  r = await c('you to come will I comfortless you leave not will I');
  ok(r.missed > 0, 'scoring: word order matters');
  const t2 = byId['little-flock'].text;
  r = await page.evaluate((a) => window.HideIt.checkTyped(a, "fear not little flock for it is your fathers good pleasure to give you the kingdom").verdict, t2);
  ok(r === 'perfect', "scoring: apostrophes are optional (Father's)");
  r = await page.evaluate(() => window.HideIt.checkTyped('Ye are the light', 'You are the light').missed);
  ok(r === 1, 'scoring: ye must be typed as written');
  const t3 = byId['love-neighbour'].text;
  r = await page.evaluate((a) => window.HideIt.checkTyped(a, 'Thou shall love thy neighbor as thyself'), t3);
  ok(r.missed === 1 && r.verdict !== 'perfect' && r.near === 1, `scoring: shall for shalt is missed, neighbor for neighbour forgiven (${JSON.stringify({ m: r.missed, n: r.near })})`);
  r = await page.evaluate((a) => window.HideIt.checkTyped(a, 'I am the good shepherd: the good shepherd gives his life for the sheep.').missed, byId['good-shepherd'].text);
  ok(r === 1, 'scoring: gives for giveth is missed');
  r = await page.evaluate((a) => window.HideIt.checkTyped(a, 'I am the good shepherd: the good shepherd giveth his lyfe for the sheep.'), byId['good-shepherd'].text);
  ok(r.near === 0 && r.missed === 1, 'scoring: short words still need exact spelling');
  // Every cue points to one saying.
  const cues = Object.values(byId).map((s) => s.cue.toLowerCase());
  ok(new Set(cues).size === cues.length, 'content: every review cue is different');
  // The Lord's Prayer is listed in prayer order.
  const prayer = collections.find((c) => c.id === 'prayer').sayings.filter((s) => s.prayerLine).map((s) => s.ref);
  ok(prayer.join() === 'Matthew 6:9,Matthew 6:10,Matthew 6:11,Matthew 6:12,Matthew 6:13', `content: Lord's Prayer in order (${prayer.join('; ')})`);
  await go(page, '#/sayings');
  const shown = await page.evaluate(() => document.querySelector('#main').innerText);
  const pos = ['Our Father which art', 'Thy kingdom come', 'Give us this day', 'And forgive us our debts', 'And lead us not'].map((x) => shown.indexOf(x));
  ok(pos.every((p, i) => p >= 0 && (i === 0 || p > pos[i - 1])), `content: Sayings page shows the prayer in order (${pos.join(',')})`);
  await ctx.close();
}

async function runBadStorage(browser) {
  console.log('\n== saved data of the wrong shape or broken JSON (375x812)');
  const cases = [
    ['nulls', JSON.stringify({ sayings: null, streak: { grace: null, days: null }, settings: null, learnedOn: null })],
    ['wrong types', JSON.stringify({ sayings: { 'peace-be-still': 'x', 'it-is-i': { box: 'nine', modes: [] } }, streak: { count: 'a', grace: 'b', days: {} }, settings: { newPerDay: 'lots', theme: 7 }, learnedOn: [] })],
    ['array', '[1,2,3]'],
    ['broken JSON', '{bad'],
  ];
  for (const [name, raw] of cases) {
    const { ctx, page, errors } = await openPage(browser, { width: 375, height: 812, deviceScaleFactor: 1 }, { preload: raw });
    for (const h of ['#/today', '#/sayings', '#/progress', '#/practice/it-is-i/letters']) {
      await go(page, h);
      const len = await page.$eval('#main', (e) => e.innerText.trim().length);
      ok(len > 20, `bad storage (${name}): ${h} renders`);
    }
    ok(await page.evaluate(() => window.HideIt.storageOK() === true), `bad storage (${name}): storage still counted as working`);
    ok(!(await page.$('[data-test="storage-off"]')), `bad storage (${name}): no false "cannot save" notice`);
    await go(page, '#/practice/peace-be-still/read');
    await click(page, '[data-test="hide"]');
    while (await page.$('[data-test="reveal"]')) await click(page, '[data-test="reveal"]');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('redletter.hideit.v1')));
    ok(saved && saved.sayings['peace-be-still'].modes.read === true, `bad storage (${name}): new progress saves over it`);
    ok(errors.length === 0, `bad storage (${name}): no console errors ${errors.join(' | ')}`);
    await ctx.close();
  }
}

async function runLayoutChecks(browser) {
  console.log('\n== toast width and dark tab contrast');
  for (const w of [360, 375, 1280]) {
    const { ctx, page, errors } = await openPage(browser, { width: w, height: 800, deviceScaleFactor: 1 });
    await page.evaluate((m) => window.HideIt.toast(m), ui.streak.restarted);
    await sleep(350);
    const b = await page.$eval('#toast', (e) => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, l: r.left, r: r.right }; });
    const expectW = Math.min(w * 0.92, 460);
    ok(Math.abs(b.w - expectW) < 2 && b.h < 110 && Math.abs(b.l - (w - b.r)) < 2, `toast at ${w}px: ${Math.round(b.w)}x${Math.round(b.h)}, centred, uses its full width`);
    await page.evaluate(() => window.HideIt.toast('Saved.'));
    await sleep(350);
    const s = await page.$eval('#toast', (e) => { const r = e.getBoundingClientRect(); return { w: r.width, l: r.left, r: r.right }; });
    ok(s.w < 150 && Math.abs(s.l - (w - s.r)) < 2, `toast at ${w}px: a short message stays small and centred (${Math.round(s.w)}px)`);
    ok(errors.length === 0, `toast at ${w}px: no console errors`);
    await ctx.close();
  }
  const lum = (c) => { const v = c.match(/\d+(\.\d+)?/g).slice(0, 3).map((x) => { x = +x / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const { ctx, page } = await openPage(browser, { width: 360, height: 760, deviceScaleFactor: 1 }, { dark: true });
  await go(page, '#/practice/it-is-i/build');
  const cols = await page.evaluate(() => ({ on: getComputedStyle(document.querySelector('.mode-tab[aria-current="step"]')).backgroundColor, strip: getComputedStyle(document.querySelector('.modes')).backgroundColor, edge: getComputedStyle(document.querySelector('.mode-tab[aria-current="step"]')).boxShadow }));
  const a = lum(cols.on), b2 = lum(cols.strip);
  const ratio = (Math.max(a, b2) + 0.05) / (Math.min(a, b2) + 0.05);
  ok(ratio >= 1.15 && /inset/.test(cols.edge), `dark: current mode tab stands out from the strip (${ratio.toFixed(2)}:1 plus an edge)`);
  const resize = await page.evaluate(async () => { location.hash = '#/practice/it-is-i/letters'; await new Promise((r) => setTimeout(r, 200)); const t = document.querySelector('textarea'); return t && getComputedStyle(t).resize; });
  ok(resize === 'none', 'typing box has no resize handle');
  await ctx.close();
}

(async () => {
  if (!fs.existsSync(FILE)) { console.error('dist/hide-it.html not found; run node build.js'); process.exit(1); }
  fs.mkdirSync(SHOTS, { recursive: true });
  for (const f of fs.readdirSync(SHOTS)) if (f.endsWith('.png')) fs.unlinkSync(path.join(SHOTS, f));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    await runViewport(browser, 'desktop', { width: 1280, height: 860, deviceScaleFactor: 1 });
    await runViewport(browser, 'mobile', { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await runKeyboard(browser);
    await runNoStorage(browser);
    await runDark360(browser);
    await runScoring(browser);
    await runBadStorage(browser);
    await runLayoutChecks(browser);
  } finally {
    await browser.close();
  }
  const shots = fs.readdirSync(SHOTS).filter((f) => f.endsWith('.png'));
  console.log(`\n${passed} checks passed, ${failures.length} failed; ${shots.length} screenshots in tests/screenshots/`);
  if (failures.length) { failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
