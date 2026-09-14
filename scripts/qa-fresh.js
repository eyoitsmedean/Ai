#!/usr/bin/env node
/**
 * Ground-truth check for /?fresh=1 and the watched-device wipe.
 * Usage: node scripts/qa-fresh.js [baseUrl]
 * Requires a running server and system Chrome.
 * Bearing: C4, C6
 */
'use strict';

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
      fails.push(`${name}: ${e.message}`);
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

  await check('fresh=1 wipes session and keeps journal', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem('rla-onboarded', '1');
      localStorage.setItem('rla-chat', JSON.stringify([{ role: 'user', content: 'guest leftover' }]));
      localStorage.setItem('rla-chat-count-2099-01-01', '3');
      localStorage.setItem('rla-journal', JSON.stringify([{ key: 'keep-me', quote: 'x', verse: 'John 14:27' }]));
    });
    await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
    const state = await page.evaluate(() => ({
      onboarded: localStorage.getItem('rla-onboarded'),
      chat: localStorage.getItem('rla-chat'),
      count: localStorage.getItem('rla-chat-count-2099-01-01'),
      journal: localStorage.getItem('rla-journal'),
      url: location.search,
      onboardVisible: !document.getElementById('onboarding').classList.contains('hidden'),
    }));
    assert(!state.onboarded, 'fresh=1 left rla-onboarded');
    assert(!state.chat, 'fresh=1 left rla-chat');
    assert(!state.count, 'fresh=1 left a daily chat count');
    assert(state.journal && state.journal.includes('keep-me'), 'fresh=1 wiped the journal');
    assert(!state.url.includes('fresh=1'), 'fresh query was not consumed');
    assert(state.onboardVisible, 'fresh=1 should open onboarding');
    const quote = await page.$eval('.ob-quote', (el) => el.textContent);
    assert(/Come unto me, all ye that labour/.test(quote), 'onboarding is not the KJV of Matthew 11:28');
  });

  await check('welcome uses self-hosted type, not Google Fonts CDN', async () => {
    const res = await page.goto(BASE + '/welcome', { waitUntil: 'domcontentloaded' });
    assert(res && res.ok(), 'welcome HTTP ' + (res && res.status()));
    const html = await page.content();
    assert(!/fonts\.googleapis\.com/.test(html), 'welcome still loads Google Fonts');
    assert(/fonts\/fonts\.css/.test(html), 'welcome missing local fonts.css');
    const copy = await page.evaluate(() => document.body.innerText);
    assert(/Red Letter/i.test(copy), 'missing brand');
    assert(/988/.test(copy), 'missing 988');
  });

  await check('Begin again is visible on a phone without scrolling Settings', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.setItem('rla-onboarded', '1');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluate(() => window.openSettings());
    await page.waitForFunction(() => {
      const sheet = document.getElementById('settings-sheet');
      return sheet && sheet.classList.contains('on');
    });
    await page.waitForFunction(() => {
      const sheet = document.getElementById('settings-sheet');
      if (!sheet || !sheet.classList.contains('on')) return false;
      const label = [...sheet.querySelectorAll('.setting-label')].find((el) => el.textContent === 'Begin again');
      if (!label) return false;
      const r = label.closest('.setting-row').getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    });
    const visible = await page.evaluate(() => {
      const sheet = document.getElementById('settings-sheet');
      const label = [...sheet.querySelectorAll('.setting-label')].find((el) => el.textContent === 'Begin again');
      if (!label) return { found: false };
      const row = label.closest('.setting-row');
      const r = row.getBoundingClientRect();
      return {
        found: true,
        inView: r.top >= 0 && r.bottom <= window.innerHeight,
        top: r.top,
        bottom: r.bottom,
        url: window.ESCAPE_URL,
      };
    });
    assert(visible.found, 'Begin again row missing');
    assert(visible.inView, 'Begin again still below the fold');
    assert(visible.url === 'https://www.live-local-weather.com/', 'ESCAPE_URL is ' + visible.url);
  });

  await check('Today names the translation on the morning cites', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.setItem('rla-onboarded', '1'));
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => {
      const aff = document.getElementById('aff-verse');
      const word = document.getElementById('word-verse');
      return aff && word && /·\s*(KJV|WEB)/.test(aff.textContent) && /·\s*(KJV|WEB)/.test(word.textContent);
    });
    const cites = await page.evaluate(() => ({
      aff: document.getElementById('aff-verse').textContent,
      word: document.getElementById('word-verse').textContent,
    }));
    assert(/·\s*KJV/.test(cites.aff), 'aff-verse unlabeled or not KJV online: ' + cites.aff);
    assert(/·\s*KJV/.test(cites.word), 'word-verse unlabeled or not KJV online: ' + cites.word);
  });

  await check('crisis modal offers Leave quickly', async () => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    const label = await page.evaluate(async () => {
      if (!window.RedLetterCrisis) return null;
      const pending = window.RedLetterCrisis.showCrisisModal('danger');
      await new Promise((r) => requestAnimationFrame(r));
      const btn = document.getElementById('crisis-leave');
      const text = btn ? btn.textContent : null;
      document.getElementById('crisis-close')?.click();
      await pending;
      return text;
    });
    assert(label === 'Leave quickly', 'Leave quickly missing, got ' + label);
  });

  await browser.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nqa-fresh ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
