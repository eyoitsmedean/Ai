#!/usr/bin/env node
/**
 * Static-hosting QA — what a GitHub Pages reader gets, with no API host at all.
 * Serves public/ from a plain file server (every /api/* request 404s like Pages),
 * then walks the Advisor in a real browser.
 * Usage: node scripts/qa-static.js
 * Requires system Chrome (CHROME_PATH or /usr/local/bin/google-chrome).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PUBLIC = path.join(__dirname, '..', 'public');
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      let file = path.join(PUBLIC, decodeURIComponent(url.pathname));
      if (url.pathname === '/' || url.pathname === '/index.html') file = path.join(PUBLIC, 'index.html');
      if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('<h1>404</h1>');
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function main() {
  const { server, base } = await serve();
  const fails = [];
  const check = async (name, fn) => {
    try {
      await fn();
      console.log('✓', name);
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
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await check('no API host answers', async () => {
    const res = await fetch(base + '/api/health');
    assert(res.status === 404, 'expected 404 from static host, got ' + res.status);
  });

  await check('Today opens from curated.json', async () => {
    await page.goto(base + '/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('rla-onboarded', '1'); });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluate(() => { const ob = document.getElementById('onboarding'); if (ob) ob.classList.add('hidden'); });
    await page.waitForFunction(() => document.getElementById('aff-content').style.display === 'block', { timeout: 8000 });
    const verse = await page.$eval('#aff-verse', (el) => el.textContent);
    assert(/(Matthew|Mark|Luke|John) \d+:\d+/.test(verse), 'no affirmation verse: ' + verse);
  });

  await check('Seek opens a room from curated.json', async () => {
    await page.evaluate(() => { switchTab('seek'); loadEnc('Shame & Guilt'); });
    await page.waitForFunction(() => document.getElementById('enc-result').classList.contains('on'), { timeout: 8000 });
    const cites = await page.$$eval('#enc-passages .passage-verse', (els) => els.map((e) => e.textContent));
    assert(cites.some((c) => /Luke 15:4/.test(c)), 'shame room missing Luke 15:4: ' + cites.join(', '));
  });

  await check('Advisor writes the letter in the browser', async () => {
    await page.evaluate(() => switchTab('advisor'));
    await page.type('#chat-input', 'I feel so much shame');
    await page.click('#send-btn');
    await page.waitForFunction(() => document.querySelectorAll('.msg-ai .scripture-block').length >= 2, { timeout: 10000 });
    const letter = await page.evaluate(() => {
      const wrap = [...document.querySelectorAll('.msg-ai')].pop();
      return {
        cites: [...wrap.querySelectorAll('.scripture-verse')].map((e) => e.textContent.trim()),
        quotes: [...wrap.querySelectorAll('.scripture-quote')].map((e) => e.textContent.trim()),
        colophon: !!wrap.querySelector('.letter-colophon'),
        text: wrap.innerText,
      };
    });
    assert(letter.cites.some((c) => /Luke 15:4/.test(c)), 'shame should meet the lost sheep, got ' + letter.cites.join(', '));
    assert(letter.quotes.some((q) => /go after that which is lost/.test(q)), 'quote text missing');
    assert(!/\{\{/.test(letter.text), 'placeholder leaked');
    assert(letter.colophon, 'letter should say it was set without a model');
  });

  await check('second letter does not repeat the first', async () => {
    await page.type('#chat-input', 'I still feel ashamed');
    await page.click('#send-btn');
    await page.waitForFunction(() => document.querySelectorAll('.msg-ai').length >= 2 &&
      [...document.querySelectorAll('.msg-ai')].pop().querySelector('.msg-save-btn'), { timeout: 10000 });
    const cites = await page.evaluate(() => [...document.querySelectorAll('.msg-ai')].map((w) =>
      [...w.querySelectorAll('.scripture-verse')].map((e) => e.textContent.trim())));
    const first = new Set(cites[0]);
    assert(cites[1].length >= 1 && cites[1].every((c) => !first.has(c)), 'second letter repeated ' + cites[1].join(', '));
    const opening = await page.evaluate(() => [...document.querySelectorAll('.msg-ai')].pop().querySelector('.ai-p').textContent);
    assert(/You have stayed with this/.test(opening), 'second turn should continue, got: ' + opening);
  });

  await check('crisis language puts 988 first', async () => {
    await page.evaluate(() => { window.showCrisisModal = () => Promise.resolve('continue'); });
    await page.type('#chat-input', 'I want to die');
    await page.click('#send-btn');
    await page.waitForFunction(() => document.querySelectorAll('.msg-ai').length >= 3 &&
      [...document.querySelectorAll('.msg-ai')].pop().querySelector('.msg-save-btn'), { timeout: 10000 });
    const text = await page.evaluate(() => [...document.querySelectorAll('.msg-ai')].pop().innerText);
    const notice = text.indexOf('988');
    const firstPassage = text.search(/\b(Matthew|Mark|Luke|John) \d+:\d+/i);
    assert(notice !== -1 && firstPassage !== -1 && notice < firstPassage, '988 must precede the passages');
  });

  await check('no page errors', async () => {
    assert(pageErrors.length === 0, pageErrors.join(' | '));
  });

  await browser.close();
  server.close();
  if (fails.length) {
    console.error('\n' + fails.length + ' failed');
    process.exit(1);
  }
  console.log('\nStatic QA passed — the page stands without an API host');
}

main().catch((e) => { console.error(e); process.exit(1); });
