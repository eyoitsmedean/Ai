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

  await check('Seven Days is the first path, and a sitting keeps a leaf', async () => {
    const seven = await page.evaluate(() => ({
      name: document.getElementById('path-name').textContent,
      place: document.getElementById('path-place').textContent,
      next: document.getElementById('path-next').textContent,
      invite: document.getElementById('path-invite').hidden,
      kind: localStorage.getItem('rla-path-kind'),
    }));
    assert(seven.name === 'Seven Days', 'path name is ' + seven.name);
    assert(/Day 1 of 7/.test(seven.place), 'place is ' + seven.place);
    assert(/Begin with Come/.test(seven.next), 'next is ' + seven.next);
    assert(seven.invite, 'no invitation before the week is kept');
    await page.click('.seven-day.today');
    await page.waitForFunction(() => document.getElementById('sit-sheet').classList.contains('on'), { timeout: 4000 });
    const kicker = await page.$eval('#sit-kicker', (el) => el.textContent);
    assert(/Seven Days · Come/.test(kicker), 'kicker is ' + kicker);
    await page.evaluate(() => {
      goSitReflect(); startSitRest(); finishSitRest();
      document.getElementById('sit-reply').value = 'Here.';
      keepSitReply();
    });
    await page.waitForFunction(() => document.getElementById('amen').classList.contains('on'), { timeout: 4000 });
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on'), { timeout: 6000 });
    const after = await page.evaluate(() => ({
      done: document.querySelectorAll('.seven-day.done').length,
      place: document.getElementById('path-place').textContent,
      kind: localStorage.getItem('rla-path-kind'),
    }));
    assert(after.done === 1, 'expected one kept leaf, got ' + after.done);
    assert(/Day 2 of 7/.test(after.place), 'place is ' + after.place);
    assert(after.kind === 'seven', 'sitting should settle the path');
  });

  await check('Forty is bound in five quires of eight and remembers its place', async () => {
    await page.evaluate(() => beginForty());
    await page.waitForFunction(() => document.getElementById('week-ribbon').classList.contains('forty'), { timeout: 4000 });
    const forty = await page.evaluate(() => ({
      name: document.getElementById('path-name').textContent,
      place: document.getElementById('path-place').textContent,
      quires: [...document.querySelectorAll('.gathering-name')].map((q) => q.textContent),
      beads: document.querySelectorAll('.bead').length,
      open: document.querySelectorAll('.bead:not(:disabled)').length,
      next: document.getElementById('path-next').textContent,
      settingOn: document.getElementById('path-btn-forty').classList.contains('active'),
    }));
    assert(forty.name === 'Forty', 'path name is ' + forty.name);
    assert(/Day 1 of 40 · Come/.test(forty.place), 'place is ' + forty.place);
    assert(forty.quires.join(' ') === 'Come Light Mercy Abide Go', 'quires: ' + forty.quires.join(' '));
    assert(forty.beads === 40, 'expected 40 beads, got ' + forty.beads);
    assert(forty.open === 1, 'only the next leaf should open, got ' + forty.open);
    assert(/Begin with Come — Matthew 11:28–30/.test(forty.next), 'next is ' + forty.next);
    assert(forty.settingOn, 'settings should show Forty active');

    await page.click('.bead.today');
    await page.waitForFunction(() => document.getElementById('sit-sheet').classList.contains('on'), { timeout: 4000 });
    const kicker = await page.$eval('#sit-kicker', (el) => el.textContent);
    assert(/Forty · Day 1 · Come · Come/.test(kicker), 'kicker is ' + kicker);
    await page.evaluate(() => {
      goSitReflect(); startSitRest(); finishSitRest();
      document.getElementById('sit-reply').value = 'Laden.';
      keepSitReply();
    });
    await page.waitForFunction(() => !document.getElementById('amen').classList.contains('on') && document.querySelectorAll('.bead.done').length === 1, { timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle0' });
    const back = await page.evaluate(() => ({
      forty: document.getElementById('week-ribbon').classList.contains('forty'),
      done: document.querySelectorAll('.bead.done').length,
      place: document.getElementById('path-place').textContent,
      sevenKept: JSON.parse(localStorage.getItem('rla-seven')).done.length,
      next: document.getElementById('path-next').textContent,
    }));
    assert(back.forty, 'Forty should survive a reload');
    assert(back.done === 1, 'kept leaf lost on reload');
    assert(/Day 2 of 40 · Come/.test(back.place), 'place is ' + back.place);
    assert(back.sevenKept === 1, 'Seven progress must not be touched by Forty');
    assert(/Next, Sparrows/.test(back.next), 'next is ' + back.next);
  });

  await check('Seven and Forty keep separate places', async () => {
    await page.evaluate(() => setPathKind('seven'));
    const seven = await page.evaluate(() => ({
      cls: document.getElementById('week-ribbon').className,
      done: document.querySelectorAll('.seven-day.done').length,
      place: document.getElementById('path-place').textContent,
    }));
    assert(seven.cls === 'seven', 'ribbon class is ' + seven.cls);
    assert(seven.done === 1, 'Seven lost its kept leaf');
    assert(/Day 2 of 7/.test(seven.place), 'place is ' + seven.place);
  });

  await check('Lent hands a new reader the forty leaves, and only invites a reader mid-Seven', async () => {
    await page.evaluate(() => {
      ['rla-path-kind', 'rla-seven', 'rla-forty'].forEach((k) => localStorage.removeItem(k));
      currentSeason = { id: 'lent', name: 'Lent', runningHead: 'Lent', note: '' };
      paintPath();
    });
    const fresh = await page.evaluate(() => ({
      forty: document.getElementById('week-ribbon').classList.contains('forty'),
      name: document.getElementById('path-name').textContent,
    }));
    assert(fresh.forty && fresh.name === 'Forty', 'new reader in Lent should see Forty, saw ' + fresh.name);
    await page.evaluate(() => {
      localStorage.setItem('rla-seven', JSON.stringify({ started: '2027-02-01', done: [0, 1] }));
      paintPath();
    });
    const mid = await page.evaluate(() => ({
      seven: document.getElementById('week-ribbon').classList.contains('seven'),
      invite: document.getElementById('path-invite').textContent,
    }));
    assert(mid.seven, 'a reader mid-Seven must not be moved');
    assert(/It is Lent/.test(mid.invite), 'expected a Lent invitation, got: ' + mid.invite);
  });

  await check('the ledger counts on the device and sends nothing until asked', async () => {
    const posted = [];
    const onRequest = (req) => { if (/\/api\/signal$/.test(req.url())) posted.push(req.postData()); };
    page.on('request', onRequest);
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
    await page.evaluate(() => { localStorage.setItem('rla-onboarded', '1'); });
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    // A sitting kept today, a blessing, a letter, and an open from three days ago that was never sent.
    await page.evaluate(() => {
      signal('lectio');
      signal('blessing');
      signal('advisor');
      const book = ledger();
      const old = new Date(Date.now() - 3 * 86400000);
      const day = old.getFullYear() + '-' + String(old.getMonth() + 1).padStart(2, '0') + '-' + String(old.getDate()).padStart(2, '0');
      book.days[day] = { open: 1, lectio: 1 };
      book.firstOpen = day;
      saveLedger(book);
      openSettings();
    });
    await page.waitForSelector('#share-counts-row:not([hidden])', { timeout: 4000 });
    const before = await page.evaluate(() => ({
      ledger: document.getElementById('ledger').innerText,
      sub: document.getElementById('ledger-sub').textContent,
      toggle: document.getElementById('share-counts-toggle').checked,
      unsent: unsentLedgerRows().length,
    }));
    assert(/Sat on the first day\s+yes/.test(before.ledger), 'first-day sitting not shown: ' + before.ledger);
    assert(/Sittings kept\s+2/.test(before.ledger), 'sittings miscounted: ' + before.ledger);
    assert(/Blessings sent\s+1/.test(before.ledger) && /Letters to the Advisor\s+1/.test(before.ledger), 'counts wrong: ' + before.ledger);
    assert(/Nothing is sent/.test(before.sub) && !before.toggle, 'sharing must be off by default');
    assert(before.unsent === 1, 'one completed day should be waiting, saw ' + before.unsent);
    assert(posted.length === 0, 'nothing may be posted before the toggle is on');

    // The checkbox sits under a drawn toggle track inside a scrolling sheet; a DOM click fires the same change event.
    await page.$eval('#share-counts-toggle', (el) => el.click());
    await page.waitForResponse((r) => /\/api\/signal$/.test(r.url()), { timeout: 4000 });
    const after = await page.evaluate(() => ({ unsent: unsentLedgerRows().length, sub: document.getElementById('ledger-sub').textContent }));
    assert(posted.length === 1, 'expected one post, saw ' + posted.length);
    const body = JSON.parse(posted[0]);
    assert(body.rows.length === 1 && body.rows[0].newOpen === 1 && body.rows[0].day1Lectio === 1, 'row shape: ' + posted[0]);
    assert(!Object.keys(body).some((k) => /id|email|name/i.test(k)) && !Object.keys(body.rows[0]).some((k) => /id/i.test(k)), 'no identifier may travel: ' + posted[0]);
    assert(after.unsent === 0, 'sent day should be marked sent');
    assert(/shared once a day/.test(after.sub), 'ledger copy should say sharing is on');

    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const persisted = await page.evaluate(() => ledgerSummary().sittings);
    assert(persisted === 2, 'ledger must survive a reload, saw ' + persisted);
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
    const wiped = await page.evaluate(() => localStorage.getItem('rla-ledger'));
    assert(wiped === null, 'a new reader must not inherit the ledger');
    page.off('request', onRequest);
  });

  await check('Room settings says how the red letters are decided', async () => {
    const copy = await page.evaluate(() => document.getElementById('settings-sheet').innerText);
    assert(/red-letter tradition/.test(copy) && /John 3:16–21/.test(copy), 'disclosure missing');
    assert(/not a person/.test(copy) && /988/.test(copy), 'safety copy missing');
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
