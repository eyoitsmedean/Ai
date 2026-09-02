#!/usr/bin/env node
/**
 * Twenty guests through the room. KEEP or STOP.
 * Usage: node scripts/demo-humans.js [baseUrl]
 */
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

const GUESTS = [
  { id: 1, name: 'Maya', ask: 'I cannot sleep. I am so anxious.', need: 'Anxiety & Worry' },
  { id: 2, name: 'James', ask: 'How do I forgive someone who hurt me?', need: '' },
  { id: 3, name: 'Keisha', ask: 'I feel so much shame', need: '' },
  { id: 4, name: 'Robert', ask: 'What did Jesus say about worry?', need: '' },
  { id: 5, name: 'Sofia', ask: 'I want to sit with a word', need: 'Peace' },
  { id: 6, name: 'Ahmed', ask: 'I am not a Christian. Can I still read this?', need: '' },
  { id: 7, name: 'Priya', ask: 'I left church and I am still looking for Jesus', need: '' },
  { id: 8, name: 'Tom', ask: 'A word for my congregation this week', need: '' },
  { id: 9, name: 'Elena', ask: 'I want to bless my mother', bless: true },
  { id: 10, name: 'Marcus', ask: 'I want to die', crisis: true },
  { id: 11, name: 'Linda', ask: 'I need a word I can print', need: '' },
  { id: 12, name: 'Chris', ask: 'I cannot sit still for a minute', skip: true },
  { id: 13, name: 'Naomi', ask: 'Show me His words about light', need: '' },
  { id: 14, name: 'David', ask: 'My dad died and I do not know how to pray', need: 'Grief & Loss' },
  { id: 15, name: 'Hannah', ask: 'I am sixteen and I feel lost', need: '' },
  { id: 16, name: 'Victor', ask: 'I want to send a blessing', bless: true },
  { id: 17, name: 'Jade', ask: 'I sat yesterday. What now?', returning: true },
  { id: 18, name: 'Owen', ask: 'Can you read this to me?', need: '' },
  { id: 19, name: 'Grace', ask: 'I want the lamp on', night: true },
  { id: 20, name: 'Host', ask: 'New reader on a shared iPad', fresh: true },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  let keep = 0;
  const stops = [];

  for (const guest of GUESTS) {
    try {
      await page.goto(BASE + '/?fresh=1', { waitUntil: 'networkidle0' });
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.reload({ waitUntil: 'networkidle0' });
      await page.click('#ob-ack');
      await page.click('#ob-open');
      await page.waitForSelector('#ob-need.on');
      if (guest.need) {
        await page.evaluate((need) => { if (typeof chooseNeed === 'function') chooseNeed(need); }, guest.need);
      } else {
        await page.click('.tp-skip');
      }
      await page.waitForFunction(() => document.getElementById('onboarding').classList.contains('hidden'), { timeout: 6000 });

      if (guest.returning) {
        await page.evaluate(() => {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          const pad = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          localStorage.setItem('rla-last-sit', JSON.stringify({
            date: pad(y),
            quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
            verse: 'Matthew 11:28',
            note: 'Come',
          }));
          if (typeof paintReturnRibbon === 'function') paintReturnRibbon();
        });
        const ribbon = await page.$eval('#return-ribbon', (el) => !el.hidden);
        assert(ribbon, 'day-two ribbon hidden');
      }

      if (guest.crisis) {
        await page.evaluate((ask) => {
          if (typeof closeAmen === 'function') closeAmen();
          if (typeof switchTab === 'function') switchTab('advisor');
          if (typeof sendMsg === 'function') sendMsg(ask);
        }, guest.ask);
        await page.waitForSelector('#crisis-modal.on', { timeout: 6000 });
        const copy = await page.$eval('#crisis-modal', (el) => el.innerText);
        assert(/988/.test(copy), 'crisis missing 988');
        await page.click('#crisis-close');
      } else if (guest.bless) {
        await page.evaluate(() => { if (typeof blessingFromToday === 'function') blessingFromToday(); });
        await page.waitForSelector('#blessing-sheet.on', { timeout: 8000 });
        const url = await page.evaluate(() => blessingUrl());
        assert(/\/b\//.test(url), 'blessing has no page');
        await page.evaluate(() => closeBlessing());
      } else if (guest.night) {
        await page.evaluate(() => { if (typeof toggleDark === 'function') toggleDark(true); });
        const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        assert(theme === 'dark', 'lamp did not light');
        await page.evaluate(() => toggleDark(false));
      } else {
        await page.evaluate((ask) => {
          if (typeof closeAmen === 'function') closeAmen();
          if (typeof switchTab === 'function') switchTab('advisor');
          if (typeof sendMsg === 'function') sendMsg(ask);
        }, guest.ask);
        await page.waitForFunction(() => /Matthew|Mark|Luke|John/i.test(document.getElementById('chat-messages')?.innerText || ''), { timeout: 20000 });
        const paywall = await page.evaluate(() => !!document.getElementById('chat-gate'));
        assert(!paywall, 'paywall appeared');
      }

      keep += 1;
      console.log('KEEP', guest.id, guest.name);
    } catch (err) {
      stops.push(guest.name + ': ' + err.message);
      console.error('STOP', guest.id, guest.name, err.message);
    }
  }

  await browser.close();
  console.log('\n' + keep + ' KEEP, ' + stops.length + ' STOP');
  if (stops.length) {
    stops.forEach((s) => console.error(' -', s));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
