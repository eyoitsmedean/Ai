#!/usr/bin/env node
/**
 * Build the printable journal "Forty Days in His Words".
 *
 *   node products/forty-days/build.js            all editions -> products/forty-days/dist/
 *   node products/forty-days/build.js --check    verify every quotation, build nothing
 *
 * Needs the OFL fonts in products/forty-days/fonts/ (see fonts/README) and
 * Chromium for PDF output (CHROME_PATH, or the Playwright copy in this env).
 */
const fs = require('fs');
const path = require('path');
const C = require('./content');
const { lookup, cleanKjv, parseRef } = require('../../lib/scripture');

const HERE = __dirname;
const DIST = path.join(HERE, 'dist');
const squash = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// --- 1. Every quotation must be exact KJV -------------------------------------
function verify(cite, text) {
  const parsed = parseRef(cite);
  const kjv = require('../../data/gospels-kjv.json').books;
  if (!parsed) throw new Error(`Unreadable citation: ${cite}`);
  const verses = [];
  for (let v = parsed.start; v <= parsed.end; v++) verses.push(cleanKjv(kjv[parsed.book][parsed.chapter][v] || ''));
  const full = squash(verses.join(' '));
  for (const part of text.split('…')) {
    if (squash(part) && !full.includes(squash(part))) throw new Error(`Not exact KJV at ${cite}: "${part.trim()}"`);
  }
  if (!lookup(cite)) throw new Error(`Not in the red-letter corpus: ${cite}`);
}
const all = [...C.days, ...C.sevenWords, ...C.easter.sayings];
for (const s of all) verify(s.cite, s.text);
console.log(`verified ${all.length} quotations against the KJV`);
if (process.argv.includes('--check')) process.exit(0);

// --- 2. Calendar ---------------------------------------------------------------
const DAY_MS = 86400000;
const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
function schedule() {
  // Lent counts forty days from Ash Wednesday, skipping Sundays.
  const out = [];
  let d = new Date(`${C.ashWednesday}T00:00:00Z`);
  let n = 0;
  while (n < 40) {
    if (d.getUTCDay() === 0) out.push({ sunday: true, date: new Date(d) });
    else { out.push({ day: C.days[n], n: n + 1, date: new Date(d) }); n += 1; }
    d = new Date(d.getTime() + DAY_MS);
  }
  if (fmt(d) !== fmt(new Date(`${C.easterDate}T00:00:00Z`))) throw new Error('Calendar does not end the day before Easter');
  return out;
}

// --- 3. Pages --------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shown = (s) => s.display || s.text;
const lines = (n) => `<div class="lines">${'<i></i>'.repeat(n)}</div>`;

function css(size) {
  const font = (name, file, style = 'normal', weight = '400') => `@font-face{font-family:"${name}";src:url("file://${path.join(HERE, 'fonts', file)}");font-style:${style};font-weight:${weight};}`;
  return `
${font('Fell', 'IMFeENrm28P.ttf')}${font('Fell', 'IMFeENit28P.ttf', 'italic')}
${font('Literata', 'Literata[opsz,wght].ttf', 'normal', '200 900')}${font('Literata', 'Literata-Italic[opsz,wght].ttf', 'italic', '200 900')}
@page { size: ${size}; margin: 0; }
:root { --red: #a3142c; --ink: #23201d; --muted: #6f6a64; --rule: #cfc9c1; --wash: #f6f3ee; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Literata, Georgia, serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 100%; height: ${size === 'A4' ? '297mm' : '11in'}; padding: 0.7in 0.75in 0.6in; page-break-after: always; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.page:last-child { page-break-after: auto; }
.folio { position: absolute; bottom: 0.35in; left: 0; right: 0; text-align: center; font: 400 8pt Literata, serif; color: var(--muted); letter-spacing: 0.12em; }
.eyebrow { font: 500 7.5pt Literata, serif; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
h1, h2, h3 { font-family: Fell, Georgia, serif; font-weight: 400; margin: 0; }
.saying { font: 400 19pt/1.32 Fell, Georgia, serif; color: var(--red); margin: 0; }
.saying.long { font-size: 15pt; }
.saying.short { font-size: 30pt; }
.cite { font: 500 8.5pt Literata, serif; letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); }
.reflect { font: 400 10.5pt/1.6 Literata, serif; margin: 0; }
.question { font: italic 400 10.5pt/1.5 Literata, serif; margin: 0; padding-left: 12pt; border-left: 2px solid var(--red); }
/* Ruled lines fill whatever space the page has left. */
.lines { flex: 1; min-height: 1in; background: repeating-linear-gradient(to bottom, transparent 0, transparent calc(0.36in - 0.6pt), var(--rule) calc(0.36in - 0.6pt), var(--rule) 0.36in); }
.lines i { display: none; }
.checks { display: flex; gap: 18pt; font: 400 8pt Literata, serif; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
.checks span::before { content: ""; display: inline-block; width: 8pt; height: 8pt; border: 0.7pt solid var(--muted); margin-right: 5pt; vertical-align: -1pt; }
.rule { height: 0; border-top: 0.6pt solid var(--rule); }

/* Cover */
.cover { justify-content: space-between; padding: 1in 0.9in 0.8in; background: var(--wash); }
.cover .mark { width: 1.1in; height: 4pt; background: var(--red); }
.cover h1 { font-size: 54pt; line-height: 0.98; letter-spacing: -0.01em; }
.cover h1 em { color: var(--red); }
.cover .sub { font: 400 13pt/1.5 Literata, serif; color: var(--muted); max-width: 4.6in; margin-top: 14pt; }
.cover .verse { font: italic 400 15pt/1.4 Fell, serif; color: var(--red); max-width: 4.8in; }
.cover .foot { display: flex; justify-content: space-between; align-items: flex-end; font: 500 8pt Literata, serif; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }

/* Day */
.day-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 0.6pt solid var(--rule); padding-bottom: 8pt; }
.day-num { font: 300 28pt/1 Literata, serif; color: var(--red); font-variant-numeric: lining-nums; }
.day-num small { font: 500 8pt Literata, serif; letter-spacing: 0.18em; color: var(--muted); text-transform: uppercase; margin-right: 6pt; vertical-align: 6pt; }
.day-meta { text-align: right; }
.day-title { font-size: 22pt; margin: 18pt 0 12pt; }
.stack { display: flex; flex-direction: column; gap: 12pt; }

/* Week opener, Sunday, seven words */
.opener { justify-content: center; gap: 16pt; }
.opener h2 { font-size: 46pt; }
.opener .note { font: 400 12pt/1.6 Literata, serif; max-width: 4.8in; color: var(--muted); }
.big-num { font: 200 120pt/0.9 Literata, serif; color: var(--red); font-variant-numeric: lining-nums; }
.seven { display: flex; flex-direction: column; gap: 11pt; margin-top: 14pt; }
.seven div { display: grid; grid-template-columns: 0.35in 1fr; gap: 8pt; align-items: baseline; }
.seven b { font: 300 17pt Literata, serif; color: var(--red); font-variant-numeric: lining-nums; }
.seven p { margin: 0; font: 400 14pt/1.35 Fell, serif; }
.seven p em { display: block; font: italic 9.5pt/1.4 Literata, serif; color: var(--muted); }
.seven .c { display: block; font: 500 7.5pt Literata, serif; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-top: 2pt; }

/* Tracker */
.grid40 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8pt; margin-top: 16pt; }
.grid40 div { border: 0.6pt solid var(--rule); padding: 6pt 7pt; height: 0.72in; display: flex; flex-direction: column; justify-content: space-between; }
.grid40 b { font: 400 14pt Literata, serif; color: var(--red); font-variant-numeric: lining-nums; }
.grid40 span { font: 400 6.6pt/1.25 Literata, serif; color: var(--muted); }
.how { display: grid; gap: 14pt; margin-top: 10pt; }
.how div { display: grid; grid-template-columns: 1.05in 1fr; gap: 12pt; }
.how h3 { font-size: 20pt; color: var(--red); }
.how p { margin: 0; font: 400 10.5pt/1.6 Literata, serif; }
.small { font: 400 8.5pt/1.6 Literata, serif; color: var(--muted); }
`;
}

function dayPage(entry, dated, folio) {
  const d = entry.day;
  const len = shown(d).length;
  const cls = len > 280 ? 'saying long' : len < 50 ? 'saying short' : 'saying';
  const linesN = len > 280 ? 8 : len > 180 ? 10 : 12;
  return `<section class="page">
  <div class="day-head">
    <div class="day-num"><small>Day</small>${entry.n}</div>
    <div class="day-meta"><div class="eyebrow">${esc(C.weeks[d.week].name)}</div>${dated ? `<div class="small">${esc(fmt(entry.date))}${entry.n === 1 ? ' · Ash Wednesday' : entry.n === 39 ? ' · Good Friday' : entry.n === 40 ? ' · Holy Saturday' : entry.n === 38 ? ' · Maundy Thursday' : ''}</div>` : ''}</div>
  </div>
  <h2 class="day-title">${esc(d.title)}</h2>
  <div class="stack">
    <p class="${cls}">${esc(shown(d))}</p>
    <div class="cite">${esc(d.cite)}</div>
    <p class="reflect">${esc(d.reflection)}</p>
    <p class="question">${esc(d.question)}</p>
  </div>
  <div style="height:14pt"></div>
  ${lines(linesN)}
  <div style="height:10pt"></div>
  <div class="checks"><span>Read</span><span>Reflect</span><span>Respond</span></div>
  <div class="folio">${folio}</div>
</section>`;
}

function build(edition) {
  const { dated, size, sample } = edition;
  const pages = [];
  let folio = 0;
  const f = () => { folio += 1; return folio; };
  const year = dated ? `Lent ${C.year}` : 'For any forty days';

  pages.push(`<section class="page cover">
  <div class="mark"></div>
  <div><div class="eyebrow" style="margin-bottom:18pt">${esc(year)}</div><h1>Forty Days<br>in <em>His Words</em></h1><p class="sub">${esc(C.subtitle)}. One saying of Jesus for each day, in the King James Version, with a short reflection and room to write.</p></div>
  <p class="verse">“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”<br><span class="cite" style="font-style:normal">Matthew 11:28</span></p>
  <div class="foot"><span>Red Letter</span><span>${dated ? 'Ash Wednesday 10 Feb · Easter 28 Mar' : '40 days · 6 Sundays · Easter'}</span></div>
</section>`);

  pages.push(`<section class="page" style="justify-content:space-between">
  <div class="stack" style="gap:18pt">
    <div class="eyebrow">How to use this journal</div>
    <h2 style="font-size:34pt">One saying a day</h2>
    <p class="reflect">Lent is the forty days before Easter, not counting Sundays. ${dated ? `In ${C.year} it begins on Ash Wednesday, 10 February, and ends on Holy Saturday, 27 March.` : 'You can begin on any day; the Sundays between are rest days for looking back.'} Each day has one saying of Jesus from the Gospels, set in red, the way old Bibles printed his words. Give it ten quiet minutes.</p>
    <div class="how">
      <div><h3>Read</h3><p>Read the saying slowly, twice. Out loud if you can. Notice the word or phrase that catches.</p></div>
      <div><h3>Reflect</h3><p>Read the short reflection beneath it. It is there to open the saying, not to explain it away.</p></div>
      <div><h3>Respond</h3><p>Answer the question on the lines below, or write whatever comes. A sentence is enough. Tick the boxes at the foot of the page if that helps you keep going.</p></div>
    </div>
    <p class="reflect">Missed a day? Do not go back and catch up. Read today’s and keep walking. These pages are an invitation, not a test.</p>
  </div>
  <p class="small">The sayings are from the King James Version (1769), public domain, and are printed exactly as written. Where two of his lines from the same passage are joined, “…” marks the words in between.</p>
  <div class="folio">${f()}</div>
</section>`);

  const sched = schedule();
  pages.push(`<section class="page">
  <div class="eyebrow">Your forty days</div>
  <h2 style="font-size:34pt;margin-top:8pt">The way through</h2>
  <p class="reflect" style="margin-top:8pt;color:var(--muted)">Mark each day as you finish it.</p>
  <div class="grid40">${sched.filter((s) => !s.sunday).map((s) => `<div><b>${s.n}</b><span>${esc(s.day.title)}${dated ? `<br>${esc(s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }))}` : ''}</span></div>`).join('')}</div>
  <div class="folio">${f()}</div>
</section>`);

  let lastWeek = -1;
  let sundayCount = 0;
  for (const s of sched) {
    if (s.sunday) {
      sundayCount += 1;
      pages.push(`<section class="page">
  <div class="day-head"><div class="day-num" style="font-size:24pt">Sunday</div><div class="day-meta"><div class="eyebrow">A day of rest</div>${dated ? `<div class="small">${esc(fmt(s.date))}${sundayCount === 6 ? ' · Palm Sunday' : ''}</div>` : ''}</div></div>
  <p class="reflect" style="margin:18pt 0 8pt;color:var(--muted)">Sundays are not counted in Lent’s forty days. Use this page to look back on the week.</p>
  ${C.sundayPrompts.map((q) => `<p class="question" style="margin-top:16pt">${esc(q)}</p>${lines(5)}`).join('')}
  <div class="folio">${f()}</div>
</section>`);
      continue;
    }
    if (s.day.week !== lastWeek) {
      lastWeek = s.day.week;
      const w = C.weeks[lastWeek];
      pages.push(`<section class="page opener">
  ${lastWeek === 0 ? '<div style="width:1.1in;height:4pt;background:var(--red)"></div>' : `<div class="big-num">${lastWeek}</div>`}
  <div class="eyebrow">${lastWeek === 0 ? 'The first days' : lastWeek === 6 ? 'The last week' : `Week ${lastWeek}`}</div>
  <h2>${esc(w.name)}</h2>
  <p class="note">${esc(w.note)}</p>
  <div class="folio">${f()}</div>
</section>`);
    }
    pages.push(dayPage(s, dated, f()));
    if (sample && s.n === 3) break;
    if (s.day.sevenWords) {
      pages.push(`<section class="page">
  <div class="eyebrow">Good Friday</div>
  <h2 style="font-size:34pt;margin-top:8pt">His seven last words</h2>
  <p class="reflect" style="margin-top:8pt;color:var(--muted)">What he said from the cross, gathered from all four Gospels in the order they are traditionally prayed.</p>
  <div class="seven">${C.sevenWords.map((w, i) => `<div><b>${i + 1}</b><p>${esc(shown(w))}${w.gloss ? `<em>${esc(w.gloss)}</em>` : ''}<span class="c">${esc(w.cite)}</span></p></div>`).join('')}</div>
  <div class="folio">${f()}</div>
</section>`);
    }
  }

  if (sample) {
    pages.push(`<section class="page opener">
  <div class="eyebrow">You have read three of forty</div>
  <h2 style="font-size:40pt">Keep walking</h2>
  <p class="note">The full journal carries on through the Sermon on the Mount, the parables, the storms, the seven "I am" sayings and Holy Week, to his last words from the cross and the morning of Easter. Forty days, six Sunday pages, the seven last words and an Easter page: 61 printable pages in all.</p>
  <div class="folio">${f()}</div>
</section>`);
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(C.title)} · Free sample</title><style>${css(size)}</style></head><body>${pages.join('\n')}</body></html>`;
  }

  pages.push(`<section class="page">
  <div class="day-head"><div class="day-num" style="font-size:28pt">Easter</div><div class="day-meta"><div class="eyebrow">He is risen</div>${dated ? `<div class="small">${esc(fmt(new Date(`${C.easterDate}T00:00:00Z`)))}</div>` : ''}</div></div>
  <div class="stack" style="margin-top:20pt;gap:14pt">
    ${C.easter.sayings.map((x) => `<p class="saying">${esc(shown(x))}</p><div class="cite">${esc(x.cite)}</div>`).join('')}
    <p class="reflect">${esc(C.easter.reflection)}</p>
    <p class="question">${esc(C.easter.question)}</p>
  </div>
  <div style="height:14pt"></div>
  ${lines(9)}
  <div class="folio">${f()}</div>
</section>`);

  for (let i = 0; i < 2; i++) pages.push(`<section class="page"><div class="eyebrow">Notes</div><div style="height:12pt"></div>${lines(24)}<div class="folio">${f()}</div></section>`);

  pages.push(`<section class="page" style="justify-content:flex-end;gap:10pt">
  <p class="small">Scripture: King James Version (1769), public domain. Every quotation is checked word for word against the KJV text of the four Gospels.</p>
  <p class="small">Type: IM Fell English, from the Fell types cut in the 1670s and revived by Igino Marini, and Literata, by TypeTogether. Both are used under the SIL Open Font License.</p>
  <p class="small">For personal use. Print as many copies as you need for yourself and your household.</p>
</section>`);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(C.title)}</title><style>${css(size)}</style></head><body>${pages.join('\n')}</body></html>`;
}

const EDITIONS = [
  { file: `forty-days-in-his-words-lent-${C.year}-letter`, dated: true, size: 'Letter' },
  { file: 'forty-days-in-his-words-undated-letter', dated: false, size: 'Letter' },
  { file: 'forty-days-in-his-words-undated-a4', dated: false, size: 'A4' },
  { file: 'forty-days-in-his-words-free-sample', dated: true, size: 'Letter', sample: true },
];

(async () => {
  fs.mkdirSync(DIST, { recursive: true });
  const puppeteer = require('puppeteer-core');
  const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  for (const ed of EDITIONS) {
    const html = build(ed);
    const htmlPath = path.join(DIST, `${ed.file}.html`);
    fs.writeFileSync(htmlPath, html);
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const pdf = path.join(DIST, `${ed.file}.pdf`);
    await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    const pages = (fs.readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    const missing = await page.evaluate(() => [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family));
    console.log(`${path.relative(process.cwd(), pdf)}  ${pages} pages  ${Math.round(fs.statSync(pdf).size / 1024)} KB${missing.length ? `  MISSING FONTS: ${missing}` : ''}`);
    await page.close();
  }
  await browser.close();
})();
