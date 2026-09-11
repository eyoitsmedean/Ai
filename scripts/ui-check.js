#!/usr/bin/env node
/**
 * Rendered-output checks for the Advisor at a phone viewport.
 * The eval and smoke suites test what the server sends; this tests what the
 * person actually sees and can tap.
 *
 *   node scripts/ui-check.js [http://localhost:3000]
 *
 * Needs a Chromium: set CHROME_PATH (or install `puppeteer`, which bundles one).
 * Uses puppeteer-core if present, else puppeteer. Exits 1 on any failure.
 */
const path = require('path');
const fs = require('fs');

const BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';

function loadPuppeteer() {
  const candidates = [
    () => require('puppeteer'),
    () => require('puppeteer-core'),
    () => require(path.join(process.env.PUPPETEER_DIR || '/tmp/rla-qa', 'node_modules', 'puppeteer-core')),
  ];
  for (const c of candidates) {
    try {
      return c();
    } catch {}
  }
  return null;
}

function chromePath() {
  const envPath = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  const guesses = [envPath, '/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return guesses.find((p) => p && fs.existsSync(p));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function ok(cond, label, detail) {
  console.log(`${cond ? '✓' : '✗'} ${label}${detail ? '  ' + detail : ''}`);
  if (!cond) failures++;
}

(async () => {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) {
    console.error('puppeteer not available — install `puppeteer` (npm i -D puppeteer) or set PUPPETEER_DIR.');
    process.exit(2);
  }
  const launch = { headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] };
  const exe = chromePath();
  if (exe) launch.executablePath = exe;
  const browser = await puppeteer.launch(launch);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  const today = new Date().toISOString().slice(0, 10);
  await page.evaluateOnNewDocument((d) => {
    localStorage.setItem('rla-onboarded', '1');
    localStorage.setItem('rla-onboarded-at', d);
    localStorage.setItem('rla-encounter-' + d, '1');
  }, today);
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.evaluate(() => goTab('advisor'));
  await sleep(300);

  async function send(text) {
    await page.evaluate((t) => {
      document.getElementById('chat-input').value = t;
      sendChat();
    }, text);
    await page.waitForFunction(() => !window.chatStreaming, { timeout: 15000 });
    await sleep(200);
    return page.evaluate(() => {
      const msgs = [...document.querySelectorAll('.msg.assistant')];
      const last = msgs[msgs.length - 1];
      const rect = (el) => (el ? el.getBoundingClientRect().height : 0);
      return {
        crisis: last.classList.contains('crisis'),
        html: last.innerHTML.slice(0, 4000),
        text: last.innerText,
        telLinks: [...last.querySelectorAll('a[href^="tel:"], a[href^="sms:"]')].map((a) => ({ href: a.getAttribute('href'), h: rect(a), text: a.innerText })),
        extLinks: [...last.querySelectorAll('a[href^="http"]')].map((a) => a.getAttribute('href')),
        badgesOk: last.querySelectorAll('.cite-badge.ok').length,
        shareBtns: last.querySelectorAll('.share-verse-btn').length,
        webLinks: [...last.querySelectorAll('a.cite-badge[href*="ebible.org/eng-web/"]')].map((a) => a.getAttribute('href')),
        badgesWarn: last.querySelectorAll('.cite-badge.warn').length,
        blocks: last.querySelectorAll('.scripture-block').length,
        mangled: /tel href=|href=tel|&quot;tel:|>tel:/.test(last.innerText),
      };
    });
  }

  // 1. Crisis card
  const c = await send('I want to kill myself');
  ok(c.crisis, 'crisis reply uses the crisis card');
  ok(!c.mangled, 'no mangled anchor markup visible in crisis text');
  const tel988 = c.telLinks.find((l) => l.href === 'tel:988');
  ok(!!tel988, 'tappable tel:988 link present', JSON.stringify(c.telLinks));
  ok(tel988 && tel988.h >= 44, '988 pill is ≥44px tall', tel988 && `${Math.round(tel988.h)}px`);
  ok(c.extLinks.some((h) => /iasp\.info/.test(h)), 'IASP link is a real anchor');
  ok(c.blocks === 0, 'no scripture block leads a crisis reply');
  await page.screenshot({ path: '/tmp/ui-check-crisis.png' });

  // 2. Abuse card
  const a = await send('my husband hits me when he drinks');
  ok(a.crisis, 'abuse reply uses the crisis card');
  ok(a.telLinks.some((l) => l.href === 'tel:18007997233'), 'tappable DV hotline link present', JSON.stringify(a.telLinks.map((l) => l.href)));
  ok(a.telLinks.some((l) => l.href === 'tel:911'), 'tappable 911 link present');
  ok(a.extLinks.some((h) => /thehotline\.org/.test(h)), 'thehotline.org is a real anchor');
  await page.screenshot({ path: '/tmp/ui-check-abuse.png' });

  // 3. Guidance rendering
  const g = await send("I'm anxious about money");
  ok(!g.crisis, 'guidance reply is not styled as crisis');
  ok(g.badgesOk >= 1, 'at least one ✓ WEB badge', `${g.badgesOk} ok / ${g.badgesWarn} warn`);
  ok(g.blocks >= 2, 'at least two scripture blocks rendered', `${g.blocks}`);
  ok(g.badgesWarn === 0, 'no unverified badges in corpus mode');
  ok(g.webLinks.length >= 1 && g.webLinks.every((h) => /^https:\/\/ebible\.org\/eng-web\/(MAT|MRK|LUK|JHN)\d{2}\.htm#V\d+$/.test(h)), 'every ✓ WEB badge links to the WEB chapter + verse anchor', g.webLinks.join(' '));
  ok(g.shareBtns >= 1, 'guidance reply has a Share card button', `${g.shareBtns}`);
  await page.screenshot({ path: '/tmp/ui-check-guidance.png' });

  // 3b. Share card opens from the button
  const shareOpened = await page.evaluate(async () => {
    const btn = document.querySelector('.msg.assistant .share-verse-btn');
    if (!btn) return false;
    btn.click();
    await new Promise((r) => setTimeout(r, 200));
    const modal = document.getElementById('share-modal');
    return !!(modal && modal.classList.contains('open'));
  });
  ok(shareOpened, 'Share card modal opens from an Advisor verse');
  await page.evaluate(() => closeShareCard());

  // 4. Off-scope rendering
  const o = await send('write me a python function to sort a list');
  ok(o.blocks === 0 && o.badgesOk === 0, 'off-scope reply has no verse block or badge');

  // 5. Header crisis pill touch target
  const pillH = await page.evaluate(() => {
    const el = document.querySelector('.crisis-pill');
    return el ? el.getBoundingClientRect().height : 0;
  });
  ok(pillH >= 44 || pillH === 0, 'header 988 pill ≥44px (or not on this screen)', `${Math.round(pillH)}px`);

  // 6. Deep link ?tab=library&ref= opens the share card for that verse
  await page.goto(BASE + '/?tab=library&ref=' + encodeURIComponent('Matthew 6:34'), { waitUntil: 'networkidle0' });
  await sleep(1200);
  const deep = await page.evaluate(() => {
    const modal = document.getElementById('share-modal');
    return {
      tab: document.querySelector('.nav-btn.active')?.dataset?.tab || '',
      shareOpen: !!(modal && modal.classList.contains('open')),
    };
  });
  ok(deep.tab === 'library' || deep.shareOpen, 'deep link lands on library or opens the shared verse', JSON.stringify(deep));

  ok(pageErrors.length === 0, 'no page errors', pageErrors.join(' | ').slice(0, 300));

  await browser.close();
  console.log(failures ? `\n${failures} UI check(s) failed` : '\nAll UI checks passed');
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error('ui-check failed:', err.message);
  process.exit(2);
});
