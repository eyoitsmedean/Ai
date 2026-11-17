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

    const theme = await page.evaluate(() => {
      const hour = new Date().getHours();
      const expect = window.RedLetterLamp
        ? (RedLetterLamp.lampShouldBeDark(localStorage.getItem('rla-dark'), hour) ? 'dark' : 'light')
        : 'light';
      return { got: document.documentElement.getAttribute('data-theme'), expect };
    });
    assert(theme.got === theme.expect, 'default theme is ' + theme.got + ', expected ' + theme.expect);
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
    const amenCite = await page.$eval('#amen-cite', (el) => el.textContent);
    assert(/KJV$/.test(amenCite), 'Amen cite has no translation: ' + amenCite);
  });

  await check('night watch lights the Lamp; day leaves parchment', async () => {
    const painted = await page.evaluate(() => {
      localStorage.removeItem('rla-dark');
      const night = RedLetterLamp.applyLamp(document, null, 3);
      const nightTheme = document.documentElement.getAttribute('data-theme');
      const nightColor = document.querySelector('meta[name="theme-color"]').getAttribute('content');
      const day = RedLetterLamp.applyLamp(document, null, 14);
      const dayTheme = document.documentElement.getAttribute('data-theme');
      RedLetterLamp.applyLamp(document, localStorage.getItem('rla-dark'), new Date().getHours());
      return { night, nightTheme, nightColor, day, dayTheme };
    });
    assert(painted.night === true && painted.nightTheme === 'dark', '3am should light the Lamp');
    assert(painted.nightColor === '#14110D', '3am theme-color should be the void');
    assert(painted.day === false && painted.dayTheme === 'light', 'afternoon should stay parchment');
  });

  await check('the screen stays lit while you sit, and goes dark when you leave', async () => {
    const result = await page.evaluate(async () => {
      window.__rlaKeeper = RedLetterWake.createScreenKeeper({
        async request() {
          return { addEventListener() {}, async release() {} };
        },
      });
      if (typeof closeSit === 'function') closeSit();
      sitWith('aff');
      await new Promise((r) => setTimeout(r, 40));
      const held = {
        awake: document.documentElement.dataset.awake,
        hidden: document.getElementById('sit-awake').hidden,
        text: document.getElementById('sit-awake').textContent,
      };
      closeSit();
      await new Promise((r) => setTimeout(r, 40));
      return {
        held,
        after: document.documentElement.dataset.awake,
        lineHidden: document.getElementById('sit-awake').hidden,
      };
    });
    assert(result.held.awake === '1', 'sit did not hold the screen');
    assert(result.held.hidden === false, 'the lit-screen line stayed hidden');
    assert(/screen stays lit/.test(result.held.text), result.held.text);
    assert(result.after === '0', 'leaving the sitting left the screen held');
    assert(result.lineHidden === true, 'the line stayed after close');
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
    const flyleaf = await page.evaluate(() => {
      if (typeof paintEpigraph === 'function') paintEpigraph();
      const el = document.getElementById('epigraph-cite');
      return { hidden: document.getElementById('epigraph').hidden, cite: el ? el.textContent : '' };
    });
    assert(!flyleaf.hidden, 'flyleaf should show the earlier sitting');
    assert(/^(Matthew|Mark|Luke|John) \d+:\d+(?:[–-]\d+)?  ·  KJV$/.test(flyleaf.cite), 'flyleaf cite is not reference · KJV: ' + flyleaf.cite);
  });

  await check('the evening you kept is waiting in the morning', async () => {
    await page.evaluate(() => {
      const card = document.getElementById('vespers-card');
      card.hidden = false;
      if (typeof paintVespers === 'function') paintVespers();
      document.getElementById('vespers-reply').value = 'the 2am feeding';
      if (typeof keepVespers === 'function') keepVespers();
    });
    const evening = await page.evaluate(() => ({
      quote: document.getElementById('vespers-quote').textContent,
      cite: document.getElementById('vespers-cite').textContent,
    }));
    assert(evening.quote && evening.quote.length > 8, 'vespers opened without a sentence');
    assert(!/16:33|tribulation|overcome the world/i.test(evening.quote + evening.cite), 'evening closed on tribulation');
    await page.evaluate(() => {
      const sit = JSON.parse(localStorage.getItem('rla-last-sit') || 'null');
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const ymd = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
      sit.date = ymd;
      sit.office = 'Vespers';
      localStorage.setItem('rla-last-sit', JSON.stringify(sit));
      const t = new Date();
      const today = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
      localStorage.removeItem('rla-flyleaf-' + today);
      if (typeof paintEpigraph === 'function') paintEpigraph();
      if (typeof paintCatchword === 'function') paintCatchword();
    });
    const morning = await page.evaluate(() => ({
      hidden: document.getElementById('epigraph').hidden,
      kicker: document.getElementById('epigraph-kicker').textContent,
      note: document.getElementById('epigraph-note').textContent,
      catchword: document.getElementById('mast-catch').textContent,
    }));
    assert(!morning.hidden, 'last night’s leaf was not on Today');
    assert(/Last night you laid down/.test(morning.kicker), 'kicker was ' + morning.kicker);
    assert(/2am feeding/.test(morning.note), 'the sentence they laid down is missing');
    assert(/feeding/i.test(morning.catchword), 'catchword did not last the night');
    await page.evaluate(() => { if (typeof closeAmen === 'function') closeAmen(); });
  });

  await check('Hear this hour speaks only His words', async () => {
    await page.evaluate(() => switchTab('today'));
    await page.waitForFunction(() => {
      const aff = document.getElementById('aff-content');
      return aff && aff.style.display !== 'none' && typeof officeScript === 'function' && window.RLA_OFFICE;
    }, { timeout: 8000 });
    const heard = await page.evaluate(() => {
      const script = officeScript();
      const evening = isEveningOffice();
      const affText = document.getElementById('aff-text').textContent;
      const reflection = document.getElementById('word-reflection').textContent;
      const expected = RLA_OFFICE.spokenOnly(
        evening
          ? document.getElementById('vespers-quote').textContent
          : document.getElementById('aff-quote').textContent
      );
      return {
        script,
        expected,
        leakedText: script.indexOf(affText) !== -1,
        leakedReflection: reflection && script.indexOf(reflection) !== -1,
        hearOffice: (document.getElementById('hear-office') || {}).textContent,
        affHear: !!document.getElementById('aff-hear-btn'),
        wordHear: !!document.getElementById('word-hear-btn'),
        marked: (document.querySelector('#today-page .this-hour') || {}).id || '',
        hourShown: !document.getElementById('hour-line').hidden,
        hourQuote: document.getElementById('hour-quote').textContent,
      };
    });
    assert(heard.affHear && heard.wordHear, 'Hear on the saying cards is missing');
    assert(/Hear this saying/i.test(heard.hearOffice), 'office Hear label is ' + heard.hearOffice);
    assert(heard.script === heard.expected && heard.script.length > 8, 'Hear must be this hour’s saying, got: ' + heard.script);
    assert(!heard.leakedText, 'Hear leaked the pastoral affirmation');
    assert(!heard.leakedReflection, 'Hear leaked the reflection');
    const evening = await page.evaluate(() => isEveningOffice());
    assert(heard.marked === (evening ? 'vespers-card' : 'aff-card'), 'this hour should mark the spoken card, got ' + heard.marked);
    if (evening) {
      assert(heard.hourShown && heard.hourQuote === heard.script, 'evening should show the spoken line beside Hear');
    } else {
      assert(!heard.hourShown, 'morning already leads with the spoken line');
    }
  });

  await check('night does not keep score', async () => {
    await page.evaluate(() => { document.documentElement.dataset.watch = 'night'; });
    const night = await page.evaluate(() => ({
      num: getComputedStyle(document.getElementById('streak-num')).display,
      label: getComputedStyle(document.getElementById('today-streak-label')).display,
      rail: getComputedStyle(document.getElementById('rail-streak')).display,
    }));
    assert(night.num === 'none' && night.label === 'none' && night.rail === 'none', JSON.stringify(night));
    await page.evaluate(() => { document.documentElement.dataset.watch = 'day'; });
    const day = await page.evaluate(() => getComputedStyle(document.getElementById('streak-num')).display);
    assert(day !== 'none', 'the morning score stayed hidden');
    await page.evaluate(() => { if (typeof setWatch === 'function') setWatch(); });
  });

  await check('a crisis line on every screen', async () => {
    for (const tab of ['today', 'seek', 'advisor', 'journal']) {
      const shown = await page.evaluate((t) => {
        switchTab(t);
        const pg = document.getElementById(t + '-page');
        const a = pg && pg.querySelector('a[href="tel:988"]');
        if (!a) return false;
        a.scrollIntoView({ block: 'center' });
        const r = a.getBoundingClientRect();
        return pg.classList.contains('active') && r.width > 0 && r.height > 0;
      }, tab);
      assert(shown, tab + ' has no visible 988 line');
    }
    const gate = await page.$eval('#chat-gate', (el) => el.textContent);
    assert(!/plus|coming soon|unlimited/i.test(gate), 'the gate is selling something');
    await page.evaluate(() => switchTab('today'));
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
