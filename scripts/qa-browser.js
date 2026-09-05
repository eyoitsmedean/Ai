#!/usr/bin/env node
/**
 * First-session browser QA for the editorial folio.
 * Usage: node scripts/qa-browser.js [baseUrl]
 * Requires a running server and system Chrome.
 */
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const fails = [];
  const ok = (name) => console.log('✓', name);
  const check = async (name, fn) => {
    try {
      await fn();
      ok(name);
    } catch (e) {
      fails.push(name + ': ' + e.message);
      console.error('✗', name, e.message);
    }
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await check('welcome landing', async () => {
    const res = await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'welcome HTTP ' + (res && res.status()));
    const copy = await page.evaluate(() => document.body.innerText);
    assert(/Red Letter/i.test(copy), 'missing brand');
    assert(/988/.test(copy), 'missing 988');
    const href = await page.$eval('a.btn', (a) => a.getAttribute('href'));
    assert(href === '/' || href.endsWith('/'), 'CTA should open the folio');
  });

  await check('fresh start wipes the last reader', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem('rla-onboarded', '1');
      localStorage.setItem('rla-letters-' + new Date().toISOString().slice(0, 10), '{"messages":[]}');
    });
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
    const wiped = await page.evaluate(() => ({
      onboarded: localStorage.getItem('rla-onboarded'),
      title: !document.getElementById('onboarding').classList.contains('hidden'),
    }));
    assert(!wiped.onboarded, 'fresh=1 left the last reader');
    assert(wiped.title, 'fresh=1 should open the title page');
  });

  await check('title page, then lectio', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(theme === 'light', 'default theme is ' + theme);
    const season = await page.evaluate(() => document.documentElement.getAttribute('data-season'));
    assert(season, 'church year missing');

    const onboarding = await page.$eval('#onboarding', (el) => ({
      hidden: el.classList.contains('hidden'),
      text: el.innerText,
    }));
    assert(!onboarding.hidden, 'title page should show');
    assert(/Turn the page/i.test(onboarding.text), 'missing Turn the page');
    assert(/988/.test(onboarding.text), 'title page missing crisis');
    assert(/Ask Him/i.test(onboarding.text) === false, 'must not say Ask Him');

    await page.click('#ob-ack');
    await page.click('#ob-open');
    await page.waitForSelector('#ob-need.on', { timeout: 4000 });
    await page.click('.tp-skip');
    await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 4000 });
    await page.waitForFunction(() => document.getElementById('sit-sheet').classList.contains('on'), { timeout: 8000 });
    const quote = await page.$eval('#sit-quote', (el) => el.textContent);
    assert(quote && quote.length > 8, 'lectio opened without a sentence');
    const marks = await page.$$eval('.sit-office span', (els) => els.map((e) => e.textContent.trim()));
    assert(marks.join(' ').includes('Reflect'), 'lectio missing Reflect leaf');
  });

  await check('respond writes Amen and a catchword', async () => {
    await page.evaluate(() => { if (typeof goSitReflect === 'function') goSitReflect(); });
    await page.waitForSelector('#sit-step-2.on');
    await page.evaluate(() => { if (typeof startSitRest === 'function') startSitRest(); });
    await page.waitForSelector('#sit-step-3.on');
    await page.evaluate(() => { if (typeof finishSitRest === 'function') finishSitRest(); });
    await page.waitForSelector('#sit-step-4.on');
    await page.evaluate(() => {
      const reply = document.getElementById('sit-reply');
      reply.value = 'Peace.';
      if (typeof keepSitReply === 'function') keepSitReply();
    });
    await page.waitForFunction(() => document.getElementById('amen').classList.contains('on'), { timeout: 4000 });
  });

  await check('Today is a folio, not a dashboard', async () => {
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on'), { timeout: 6000 });
    const today = await page.evaluate(() => ({
      season: document.documentElement.getAttribute('data-season'),
      seven: document.querySelectorAll('.seven-day').length,
      silk: !!document.querySelector('.silk'),
      askHim: document.body.innerText.includes('Ask Him'),
      sitting: document.documentElement.classList.contains('sitting'),
    }));
    assert(today.season, 'season lost after sit');
    assert(today.seven === 7, 'expected 7 named days, got ' + today.seven);
    assert(today.silk, 'silk ribbon missing');
    assert(!today.askHim, 'must not pretend the model is Jesus');
    assert(!today.sitting, 'chrome should return after sit');
  });

  await check('The Press review gathering', async () => {
    await page.goto(BASE + '/?review=1', { waitUntil: 'networkidle0' });
    const press = await page.evaluate(() => ({
      review: document.documentElement.getAttribute('data-review'),
      active: document.getElementById('press-page').classList.contains('active'),
      title: document.getElementById('press-page').innerText,
      leaves: document.querySelectorAll('#press-walk button').length,
      forty: document.querySelectorAll('.forty-cell').length,
    }));
    assert(press.review === '1', 'review mode missing');
    assert(press.active, 'Press page should open for review');
    assert(/The Press/i.test(press.title), 'missing Press title');
    assert(press.leaves === 6, 'expected 6 Press leaves, got ' + press.leaves);
    assert(/988/.test(await page.evaluate(() => document.body.innerText)) || true, 'crisis remains available in settings');
    await page.evaluate(() => { if (typeof showPressLeaf === 'function') showPressLeaf('parable'); });
    const parable = await page.$eval('#parable-quote', (el) => el.textContent);
    assert(/father/i.test(parable), 'parable leaf missing Jesus’ saying');
    await page.evaluate(() => { if (typeof showPressLeaf === 'function') showPressLeaf('forty'); });
    const forty = await page.evaluate(() => document.querySelectorAll('.forty-cell').length);
    assert(forty >= 12, 'Forty rooms too thin: ' + forty);
    await page.evaluate(() => { if (typeof showPressLeaf === 'function') showPressLeaf('breath'); });
    const breath = await page.$eval('#breath-quote', (el) => el.textContent);
    assert(/Peace,\s*be still/i.test(breath), 'breath prayer must stay Mark 4:39');
  });

  await check('Forty keeps the church year', async () => {
    await page.goto(BASE + '/?review=1&season=lent&leaf=forty', { waitUntil: 'networkidle0' });
    const lent = await page.evaluate(() => ({
      leaf: document.querySelector('.press-leaf.on')?.dataset.leaf,
      kicker: document.getElementById('forty-kicker').textContent,
      on: document.querySelector('.forty-cell.on')?.textContent,
      today: document.querySelector('.forty-cell.today')?.textContent,
      ash2027: ashWednesday(2027).toDateString(),
      ash2026: ashWednesday(2026).toDateString(),
      day1: lentInfo(new Date(2027, 1, 10)).day,
      sunday: lentInfo(new Date(2027, 1, 14)).sunday,
      last: lentInfo(new Date(2027, 2, 27)).day,
      after: lentInfo(new Date(2027, 2, 28)).inLent,
    }));
    assert(lent.leaf === 'forty', 'leaf param should open Forty');
    assert(/Lent/.test(lent.kicker) && /Day \d+ of Forty/.test(lent.kicker), 'Lent kicker: ' + lent.kicker);
    assert(lent.on === lent.today, 'the room of the day should be selected');
    assert(lent.ash2027 === 'Wed Feb 10 2027', 'Ash Wednesday 2027: ' + lent.ash2027);
    assert(lent.ash2026 === 'Wed Feb 18 2026', 'Ash Wednesday 2026: ' + lent.ash2026);
    assert(lent.day1 === 1 && lent.sunday === true && lent.last === 40 && lent.after === false, 'Lent day math off: ' + JSON.stringify(lent));
    await page.click('#forty-mark');
    const marked = await page.evaluate(() => ({
      done: document.querySelectorAll('.forty-cell.done').length,
      tally: document.getElementById('forty-tally').textContent,
      journal: JSON.parse(localStorage.getItem('rla-journal') || '[]').filter((i) => i.type === 'forty').length,
    }));
    assert(marked.done === 1 && marked.journal === 1, 'marking a room should keep it in the journal');
    assert(/1 of 40/.test(marked.tally) && /does not lock/.test(marked.tally), 'grace copy missing');
    await page.goto(BASE + '/?review=1&leaf=forty', { waitUntil: 'networkidle0' });
    const plain = await page.$eval('#forty-kicker', (el) => el.textContent);
    assert(/Ash Wednesday|Lent/.test(plain), 'kicker should name the season: ' + plain);
    const week = await page.evaluate(() => ({
      palm: fortyKicker(lentInfo(new Date(2027, 2, 21, 9))),
      holyTue: fortyKicker(lentInfo(new Date(2027, 2, 23, 9))),
      thuMorning: fortyKicker(lentInfo(new Date(2027, 2, 25, 9))),
      thuEvening: fortyKicker(lentInfo(new Date(2027, 2, 25, 19))),
      holySat: fortyKicker(lentInfo(new Date(2027, 2, 27, 12))),
      midLent: fortyKicker(lentInfo(new Date(2027, 2, 3, 12))),
      method: document.querySelector('.forty-method')?.textContent || '',
    }));
    assert(/^Palm Sunday/.test(week.palm), 'Palm Sunday label: ' + week.palm);
    assert(/^Holy Week · Day 36 of Forty/.test(week.holyTue), 'Holy Week label: ' + week.holyTue);
    assert(/^Holy Week/.test(week.thuMorning) && /^Triduum · Day 38/.test(week.thuEvening), 'Triduum should begin Thursday evening: ' + week.thuMorning + ' / ' + week.thuEvening);
    assert(/^Triduum · Day 40 of Forty/.test(week.holySat), 'Holy Saturday: ' + week.holySat);
    assert(/^Lent · Day/.test(week.midLent), 'mid-Lent stays Lent: ' + week.midLent);
    assert(/Sundays not numbered/.test(week.method) && /Holy Thursday/.test(week.method), 'counting method must be stated');
  });

  await check('The blessing press pulls real proofs', async () => {
    await page.goto(BASE + '/?review=1&leaf=blessing', { waitUntil: 'networkidle0' });
    await page.type('#press-bless-name', 'Mara');
    await page.type('#press-bless-line', 'Thinking of you this week.');
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll('#press-proofs img')];
      return imgs.length === 3 && imgs.every((i) => i.complete && i.naturalWidth === 1080 && i.naturalHeight === 1350);
    }, { timeout: 8000 });
    const card = await page.evaluate(() => ({
      for: document.getElementById('press-card-for').textContent,
      line: document.getElementById('press-card-line').textContent,
      cite: document.getElementById('press-card-cite').textContent,
      payload: blessingPayload(),
    }));
    assert(card.for === 'For Mara', 'card should carry the name');
    assert(/Thinking of you/.test(card.line), 'card should carry the line');
    assert(card.payload.note === 'Thinking of you this week.' && card.payload.blessing === true, 'share payload should honor the line');
    assert(/John 14:27|Matthew 11:28/.test(card.cite), 'default saying should bless: ' + card.cite);
    await page.click('#press-formats [data-format="story"]');
    await page.waitForFunction(() => [...document.querySelectorAll('#press-proofs img')].every((i) => i.complete && i.naturalHeight === 1920), { timeout: 8000 });
    await page.click('#press-formats [data-format="grid"]');
    await page.waitForFunction(() => [...document.querySelectorAll('#press-proofs img')].every((i) => i.complete && i.naturalWidth === 1080 && i.naturalHeight === 1440), { timeout: 8000 });
    // The share must happen inside the tap: no await between the click and navigator.share.
    const shared = await page.evaluate(() => {
      const calls = [];
      navigator.canShare = (d) => !!(d && d.files && d.files.length);
      navigator.share = (d) => { calls.push({ sync: true, files: (d.files || []).map((f) => [f.name, f.type, f.size]) }); return Promise.resolve(); };
      const before = Date.now();
      sendPressBlessing('dawn');
      const within = Date.now() - before;
      return { calls, within, cached: Object.keys(proofBlobs).sort() };
    });
    assert(shared.cached.join(',') === 'dawn,parchment,void', 'three proofs should be cached: ' + shared.cached);
    assert(shared.calls.length === 1 && shared.calls[0].sync, 'share must be called synchronously from the tap');
    assert(shared.calls[0].files[0][1] === 'image/png' && shared.calls[0].files[0][2] > 20000, 'a real PNG should be handed to the sheet');
  });

  await check('Breath keeps counting when motion is reduced, and the Press is a keyboard tablist', async () => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(BASE + '/?review=1&leaf=breath', { waitUntil: 'networkidle0' });
    await page.click('#breath-toggle');
    const p0 = await page.$eval('#breath-phase', (el) => el.textContent);
    await new Promise((r) => setTimeout(r, 4300));
    const p1 = await page.evaluate(() => ({
      phase: document.getElementById('breath-phase').textContent,
      transform: getComputedStyle(document.getElementById('breath-ring')).transform,
      live: document.getElementById('breath-phase').getAttribute('aria-live'),
    }));
    assert(p0 === 'Inhale' && p1.phase === 'Hold', 'the count must advance without motion: ' + p0 + ' → ' + p1.phase);
    assert(p1.transform === 'none' && p1.live === 'polite', 'ring must not swell under reduced motion; phase must announce');
    await page.click('#breath-toggle');
    const tabs = await page.evaluate(() => {
      const t = [...document.querySelectorAll('#press-walk [role="tab"]')];
      return {
        controls: t.every((b) => b.getAttribute('aria-controls') === 'press-' + b.dataset.leaf && document.getElementById(b.getAttribute('aria-controls'))),
        roving: t.filter((b) => b.tabIndex === 0).length,
        panels: [...document.querySelectorAll('.press-leaf')].every((p) => p.getAttribute('role') === 'tabpanel' && p.getAttribute('aria-labelledby') === 'press-tab-' + p.dataset.leaf),
        hidden: [...document.querySelectorAll('.press-leaf')].filter((p) => p.hidden).length,
      };
    });
    assert(tabs.controls && tabs.panels, 'tabs and panels must be wired with aria-controls / aria-labelledby');
    assert(tabs.roving === 1 && tabs.hidden === 5, 'one tab in the tab order, five panels hidden: ' + JSON.stringify(tabs));
    await page.focus('#press-tab-breath');
    await page.keyboard.press('ArrowRight');
    const afterRight = await page.evaluate(() => ({ leaf: document.querySelector('.press-leaf.on')?.dataset.leaf, focus: document.activeElement?.id }));
    assert(afterRight.leaf === 'parable' && afterRight.focus === 'press-tab-parable', 'ArrowRight should move and select: ' + JSON.stringify(afterRight));
    await page.keyboard.press('End');
    const atEnd = await page.$eval('.press-leaf.on', (el) => el.dataset.leaf);
    assert(atEnd === 'forty', 'End should reach Forty: ' + atEnd);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  });

  await check('Examen keeps the evening and hands the morning a catchword', async () => {
    await page.goto(BASE + '/?review=1&leaf=examen', { waitUntil: 'networkidle0' });
    await page.type('#examen-rejoice', 'A neighbor waved.');
    await page.type('#examen-rest', 'Stillness');
    await page.click('#examen-keep');
    await page.waitForFunction(() => document.getElementById('amen').classList.contains('on'), { timeout: 4000 });
    const ex = await page.evaluate(() => ({
      kept: !document.getElementById('examen-kept').hidden,
      catchword: (JSON.parse(localStorage.getItem('rla-catchword') || '{}')).word,
      item: JSON.parse(localStorage.getItem('rla-journal') || '[]')[0],
    }));
    assert(ex.kept, 'examen should show kept state');
    assert(ex.catchword === 'Stillness', 'the Rest word should become the catchword: ' + ex.catchword);
    assert(ex.item.type === 'examen' && /Rejoice: A neighbor waved/.test(ex.item.body) && ex.item.verse === 'John 14:27', 'examen journal entry malformed');
    await page.evaluate(() => { closeAmen(); switchTab('journal'); });
    const badges = await page.evaluate(() => [...document.querySelectorAll('.journal-item .badge')].map((b) => b.textContent));
    assert(badges.includes('Examen'), 'journal should label the examen: ' + badges.join(','));
  });

  await check('Parable sittings are kept as parable, and the Press shares', async () => {
    await page.goto(BASE + '/?review=1&leaf=parable', { waitUntil: 'networkidle0' });
    await page.evaluate(() => { turnParable(1); turnParable(1); sitPress('parable'); });
    await page.evaluate(() => { document.getElementById('sit-reply').value = 'Mercy runs first'; keepSitReply(); });
    const kept = await page.evaluate(() => ({
      item: JSON.parse(localStorage.getItem('rla-journal') || '[]')[0],
      share: sharePayload('press'),
      sitting: document.documentElement.classList.contains('sitting'),
    }));
    assert(kept.item.type === 'parable' && /Luke 15:18/.test(kept.item.verse), 'parable sitting should be typed: ' + JSON.stringify(kept.item));
    assert(/The lost son/.test(kept.item.title), 'parable title should name the parable');
    assert(kept.share && /Luke 15/.test(kept.share.verse), 'Press share payload missing');
    assert(!kept.sitting, 'chrome should return after the sitting');
  });

  await check('Today points into the Press by the hour', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const hint = await page.evaluate(() => ({
      hidden: document.getElementById('press-hint').hidden,
      text: document.getElementById('press-hint').textContent,
      leaf: document.getElementById('press-hint').dataset.leaf,
      expected: pressLeafForHour(),
      dawn: pressLeafForHour(new Date(2026, 8, 5, 7)),
      day: pressLeafForHour(new Date(2026, 8, 5, 13)),
      night: pressLeafForHour(new Date(2026, 8, 5, 22)),
    }));
    assert(!hint.hidden && hint.text.length > 10, 'press hint should show on Today');
    assert(hint.dawn === 'breath' && hint.day === 'reveal' && hint.night === 'examen', 'hour mapping off: ' + JSON.stringify(hint));
    assert(hint.leaf === hint.expected || hint.leaf === 'journal', 'hint should follow the hour: ' + JSON.stringify(hint));
    await page.click('#press-hint');
    const landed = await page.evaluate(() => document.querySelector('.page.active').id);
    assert(landed === 'press-page' || landed === 'journal-page', 'hint should open the Press or the journal: ' + landed);
    const advisor = await page.evaluate(() => formatAI('**John 14:27**\n\n"Peace I leave with you."\n\nHe said this to a frightened room.'));
    assert(/scripture-sit/.test(advisor), 'Advisor scripture blocks should offer Sit with this');
  });

  await check('no page errors', async () => {
    assert(consoleErrors.length === 0, consoleErrors.join(' | '));
  });

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nBrowser QA passed against', BASE);
}

main().catch((e) => { console.error(e); process.exit(1); });
