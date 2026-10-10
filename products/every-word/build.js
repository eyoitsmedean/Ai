#!/usr/bin/env node
/**
 * Every Word He Spoke: the words of Jesus from the four Gospels (KJV), with a
 * complete concordance. Builds a KDP-ready paperback interior (6 x 9 in), a
 * wraparound cover sized to the final page count, and an EPUB.
 *
 *   node products/every-word/build.js
 *
 * Source: data/spoken-gospels.json (the app's verified red-letter corpus).
 * Fonts: products/forty-days/fonts (SIL OFL).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const HERE = __dirname;
const DIST = path.join(HERE, 'dist');
const FONTS = path.join(ROOT, 'products', 'forty-days', 'fonts');
const spoken = require(path.join(ROOT, 'data', 'spoken-gospels.json')).books;
const kjv = require(path.join(ROOT, 'data', 'gospels-kjv.json')).books;
const { cleanKjv } = require(path.join(ROOT, 'lib', 'scripture'));
const { THEMES, themeNames } = require(path.join(ROOT, 'lib', 'curated'));

const BOOKS = ['Matthew', 'Mark', 'Luke', 'John'];
const ABBR = { Matthew: 'Mt', Mark: 'Mk', Luke: 'Lk', John: 'Jn' };
const TITLE = 'Every Word He Spoke';
const SUBTITLE = 'The Words of Jesus from the Four Gospels, with a Complete Concordance';
const EDITION = 'King James Version';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const words = (t) => String(t).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];

// --- 1. The text ---------------------------------------------------------------
const text = BOOKS.map((book) => {
  const chapters = [];
  let red = 0;
  let total = 0;
  const marks = []; // per verse of the whole Gospel: share of the verse that is his
  for (const ch of Object.keys(kjv[book]).map(Number).sort((a, b) => a - b)) {
    const verses = [];
    for (const v of Object.keys(kjv[book][ch]).map(Number).sort((a, b) => a - b)) {
      const full = words(cleanKjv(kjv[book][ch][v])).length;
      total += full;
      const t = spoken[book][ch]?.[v];
      if (t) {
        red += words(t).length;
        verses.push({ v, t });
        marks.push(Math.min(1, words(t).length / Math.max(1, full)));
      } else marks.push(0);
    }
    if (verses.length) chapters.push({ ch, verses });
  }
  return { book, chapters, red, total, marks, verseCount: marks.length, spokenCount: marks.filter((m) => m > 0).length };
});
const allVerses = text.flatMap((b) => b.chapters.flatMap((c) => c.verses.map((x) => ({ book: b.book, ch: c.ch, v: x.v, t: x.t }))));
const totalWords = allVerses.reduce((n, x) => n + words(x.t).length, 0);

// --- 2. The concordance ------------------------------------------------------------
// Function words are left out, as in Cruden and Strong. Each form is its own entry.
const STOP = new Set('a an and are as at be but by for from had hath have he her him his i if in into is it its me my nor not o of on or our out shall she so than that the thee their them then there these they thine this thou thy to unto up us was we were what when which who whom will with ye yea you your also all any even no do did doth'.split(' '));
const CAP = 40;
const conc = new Map();
for (const x of allVerses) {
  const toks = x.t.split(/\s+/);
  const seen = new Set();
  toks.forEach((raw, i) => {
    const w = (raw.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/) || [])[0];
    if (!w || w.length < 3 || STOP.has(w) || seen.has(w)) return;
    seen.add(w);
    // Keyword in context: a few words either side, the headword shortened to its initial.
    const left = toks.slice(Math.max(0, i - 4), i).join(' ');
    const right = toks.slice(i + 1, i + 5).join(' ');
    // "abroad." becomes "a." not "a..": the abbreviation point absorbs a full stop.
    const initial = raw.replace(/[a-z][a-z']*/i, (m) => `${m[0]}.`).replace(/\.\./, '.');
    const line = `${i > 4 ? '… ' : ''}${left} ${initial} ${right}${i + 5 < toks.length ? ' …' : ''}`.replace(/\s+/g, ' ').trim();
    if (!conc.has(w)) conc.set(w, []);
    // Up to six words either side; the page trims them to fit the column.
    conc.get(w).push({
      ref: `${ABBR[x.book]} ${x.ch}:${x.v}`, line,
      l: toks.slice(Math.max(0, i - 6), i), k: initial, r: toks.slice(i + 1, i + 7),
      lm: i > 6, rm: i + 7 < toks.length,
    });
  });
}
const concEntries = [...conc.entries()].sort((a, b) => a[0].localeCompare(b[0]));

// --- 3. Life situations -------------------------------------------------------------
const SITUATIONS = {
  'Anxiety & Worry': 'For nights when tomorrow is too loud.',
  'Grief & Loss': 'For the ones who mourn.',
  Forgiveness: 'For the hardest command, and the freest.',
  Loneliness: 'For when no one seems to be there.',
  'Conflict & Relationships': 'For the people closest to us, and the ones we cannot stand.',
  Fear: 'For storms, of every kind.',
  'Purpose & Direction': 'For the next step, when the map is missing.',
  'Faith & Doubt': 'For belief mixed with unbelief.',
  'Suffering & Pain': 'For bodies and hearts that hurt.',
  'Shame & Guilt': 'For the ones who think they must leave the room.',
  Peace: 'For a troubled heart.',
  Hope: 'For when it seems nothing will change.',
};
const curatedJs = fs.readFileSync(path.join(ROOT, 'public', 'data', 'curated.js'), 'utf8');
const win = {};
new Function('window', curatedJs)(win);
const situations = themeNames().map((name) => {
  const seen = new Set();
  const list = [];
  for (const p of [...(THEMES[name].passages || []), ...((win.RLA_CURATED.encouragement[name] || {}).passages || [])]) {
    const key = p.verse.replace(/[–-]/g, '-');
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ cite: p.verse, text: p.quote });
  }
  return { name, line: SITUATIONS[name] || '', list: list.slice(0, 6) };
});

// --- 4. Interior -----------------------------------------------------------------
function css() {
  const font = (name, file, style = 'normal', weight = '400') => `@font-face{font-family:"${name}";src:url("file://${path.join(FONTS, file)}");font-style:${style};font-weight:${weight};}`;
  return `
${font('Fell', 'IMFeENrm28P.ttf')}${font('Fell', 'IMFeENit28P.ttf', 'italic')}
${font('Lit', 'Literata[opsz,wght].ttf', 'normal', '200 900')}${font('Lit', 'Literata-Italic[opsz,wght].ttf', 'italic', '200 900')}
@page { size: 6in 9in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Lit, Georgia, serif; color: #000; font-variant-numeric: lining-nums; }
#src { display: none; }
.page { width: 6in; height: 9in; position: relative; overflow: hidden; page-break-after: always; }
.page.recto { padding: 0.75in 0.55in 0.75in 0.8in; }
.page.verso { padding: 0.75in 0.8in 0.75in 0.55in; }
.body { height: 7.5in; overflow: hidden; }
.head { position: absolute; top: 0.42in; left: 0; right: 0; font: 500 6.5pt Lit, serif; letter-spacing: 0.18em; text-transform: uppercase; color: #444; }
.recto .head { text-align: right; padding: 0 0.55in 0 0.8in; }
.verso .head { text-align: left; padding: 0 0.8in 0 0.55in; }
.folio { position: absolute; bottom: 0.42in; font: 400 8pt Lit, serif; color: #333; }
.recto .folio { right: 0.55in; }
.verso .folio { left: 0.55in; }
.bare .head, .bare .folio { display: none; }

/* Text */
.chap { font: 300 14pt/1 Lit, serif; margin: 10pt 0 5pt; display: flex; align-items: baseline; gap: 8pt; break-after: avoid; }
.chap small { font: 500 6.5pt Lit, serif; letter-spacing: 0.18em; text-transform: uppercase; color: #555; }
.vs { font: 400 9.3pt/13.2pt Lit, serif; margin: 0 0 3.2pt; text-indent: -0.17in; padding-left: 0.17in; text-align: left; hyphens: auto; }
.vs b { font: 600 6.4pt Lit, serif; color: #555; display: inline-block; min-width: 0.17in; text-indent: 0; vertical-align: 1.2pt; }
.gap { height: 5pt; border-top: 0.4pt dotted #999; margin: 5pt 0.9in 6pt; }

/* Openers */
.opener .body { display: flex; flex-direction: column; justify-content: center; }
.part-no { font: 500 7pt Lit, serif; letter-spacing: 0.24em; text-transform: uppercase; color: #555; }
.opener h1 { font: 400 36pt/1 Fell, serif; margin: 10pt 0 14pt; }
.opener p { font: 400 9.5pt/1.55 Lit, serif; margin: 0 0 8pt; }
.strip { width: 100%; height: 0.55in; display: block; margin: 16pt 0 4pt; }
.strip-note { font: 400 6.8pt/1.4 Lit, serif; color: #555; }
.stat { font: 400 9pt/1.5 Lit, serif; }
.stat b { font: 600 9pt Lit, serif; }

/* Front matter */
.title-page .body { display: flex; flex-direction: column; justify-content: space-between; text-align: center; padding: 0.6in 0 0.3in; }
.title-page h1 { font: 400 34pt/1.02 Fell, serif; margin: 0; }
.title-page .sub { font: italic 400 11pt/1.45 Lit, serif; margin: 14pt auto 0; max-width: 3.6in; }
.title-page .ed { font: 500 7pt Lit, serif; letter-spacing: 0.24em; text-transform: uppercase; }
.small { font: 400 7.6pt/1.55 Lit, serif; margin: 0 0 7pt; }
.prose h2 { font: 400 20pt/1.1 Fell, serif; margin: 0 0 12pt; }
.prose h3 { font: 600 8pt Lit, serif; letter-spacing: 0.14em; text-transform: uppercase; margin: 12pt 0 4pt; }
.prose p { font: 400 9.3pt/1.55 Lit, serif; margin: 0 0 7pt; }
.toc div { display: flex; justify-content: space-between; font: 400 9.5pt/2 Lit, serif; border-bottom: 0.4pt dotted #aaa; }
.toc div.sub { padding-left: 14pt; font-size: 8.8pt; }

/* Situations */
.sit-h { font: 400 16pt/1.1 Fell, serif; margin: 12pt 0 2pt; break-after: avoid; }
.sit-l { font: italic 400 8.6pt Lit, serif; color: #444; margin: 0 0 6pt; }
.sit-i { font: 400 9.1pt/1.45 Lit, serif; margin: 0 0 6pt; padding-left: 0.17in; }
.sit-i span { display: block; font: 600 6.6pt Lit, serif; letter-spacing: 0.1em; text-transform: uppercase; color: #555; margin-top: 1pt; }

/* Concordance */
.cols { display: flex; gap: 0.22in; height: 100%; }
.col { flex: 1; min-width: 0; height: 100%; overflow: hidden; }
.cw { font: 700 7.6pt/1 Lit, serif; margin: 5pt 0 1.5pt; }
.cw small { font: 400 6pt Lit, serif; color: #555; margin-left: 3pt; }
.cl { font: 400 6.5pt/8.15pt Lit, serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cl b { font-weight: 600; display: inline-block; width: 0.52in; }
.cx { font: italic 400 6.2pt/7.8pt Lit, serif; color: #333; padding-left: 0.1in; }
`;
}

function stripSvg(marks) {
  const w = 1000;
  const h = 100;
  const step = w / marks.length;
  let bars = '';
  marks.forEach((m, i) => {
    const bh = m ? 18 + m * 78 : 6;
    bars += `<rect x="${(i * step).toFixed(2)}" y="${(h - bh).toFixed(1)}" width="${Math.max(0.9, step - 0.25).toFixed(2)}" height="${bh.toFixed(1)}" fill="${m ? '#000' : '#bbb'}"/>`;
  });
  return `<svg class="strip" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function blocks() {
  const out = [];
  const add = (b) => out.push(b);
  // Front matter, each block is its own page or a run of pages.
  add({ page: 'title' });
  add({ page: 'copyright' });
  add({ page: 'contents' });
  add({ page: 'intro' });
  add({ page: 'numbers' });
  // Part one
  add({ page: 'part', no: 'Part one', title: 'His Words', note: 'Every saying of Jesus in Matthew, Mark, Luke and John, in the order each Gospel gives them. Each verse is its own paragraph, as in the King James Bible. A dotted rule marks a place where the Gospel goes on without him speaking.' });
  for (const b of text) {
    add({ page: 'gospel', b });
    for (const c of b.chapters) {
      add({ type: 'chap', head: `${b.book} ${c.ch}`, html: `<div class="chap">${c.ch}<small>${esc(b.book)} · chapter ${c.ch}</small></div>` });
      let prev = null;
      for (const x of c.verses) {
        if (prev && x.v !== prev + 1) add({ type: 'flow', head: `${b.book} ${c.ch}`, html: '<div class="gap"></div>' });
        add({ type: 'flow', head: `${b.book} ${c.ch}`, html: `<p class="vs"><b>${x.v}</b>${esc(x.t)}</p>` });
        prev = x.v;
      }
    }
  }
  // Part two
  add({ page: 'part', no: 'Part two', title: 'His Words for Life', note: 'Twelve situations people bring to him, with the sayings that speak most directly to each. A place to begin, not a substitute for reading the whole.' });
  for (const s of situations) {
    add({ type: 'flow', head: s.name, html: `<div class="sit-h">${esc(s.name)}</div><div class="sit-l">${esc(s.line)}</div>` });
    for (const p of s.list) add({ type: 'flow', head: s.name, html: `<p class="sit-i">${esc(p.text)}<span>${esc(p.cite)}</span></p>` });
  }
  // Part three
  add({ page: 'part', no: 'Part three', title: 'A Concordance of His Words', note: `Every word of more than two letters that Jesus speaks in the four Gospels, except the commonest connecting words, with the places he says it. ${concEntries.length.toLocaleString('en-US')} words in all. Each line shows a few words either side; the word itself is shortened to its first letter, as in the classic concordances. Where a word occurs more than ${CAP} times, the first ${CAP} are shown in context and the rest are listed by reference.` });
  for (const [w, list] of concEntries) {
    add({ type: 'cw', word: w, html: `<div class="cw">${esc(w)}<small>${list.length}</small></div>` });
    for (const o of list.slice(0, CAP)) add({ type: 'cl', word: w, kwic: { ref: o.ref, l: o.l, k: o.k, r: o.r, lm: o.lm, rm: o.rm }, html: '<div class="cl"></div>' });
    if (list.length > CAP) {
      const rest = list.slice(CAP).map((o) => o.ref);
      for (let i = 0; i < rest.length; i += 7) add({ type: 'cl', word: w, html: `<div class="cx">${i === 0 ? 'Also ' : ''}${rest.slice(i, i + 7).join(', ')}</div>` });
    }
  }
  return out;
}

function frontHtml(kind) {
  if (kind === 'title') {
    return `<div class="body"><div><div class="ed">The Words of Jesus</div></div><div><h1>${esc(TITLE)}</h1><p class="sub">${esc(SUBTITLE)}</p></div><div class="ed">${esc(EDITION)}</div></div>`;
  }
  if (kind === 'copyright') {
    return `<div class="body" style="display:flex;flex-direction:column;justify-content:flex-end">
<p class="small"><i>${esc(TITLE)}: ${esc(SUBTITLE)}</i></p>
<p class="small">The scripture text is the King James Version (1769), which is in the public domain in the United States.</p>
<p class="small">Selection, arrangement, concordance and introductory material © ${new Date().getUTCFullYear()} Red Letter. All rights reserved.</p>
<p class="small">Typeset in Literata and IM Fell English, both under the SIL Open Font License.</p>
<p class="small">The concordance and every count in this book were produced directly from the text printed in Part one.</p></div>`;
  }
  return '';
}

function htmlDoc() {
  const data = { blocks: blocks(), title: TITLE };
  // Pages that are pre-built rather than flowed.
  const pre = {
    title: frontHtml('title'),
    copyright: frontHtml('copyright'),
    intro: `<div class="body prose">
<h2>About this book</h2>
<p>This book prints only the words Jesus speaks in the four Gospels, in the King James Version, and nothing else: no narration, no other speakers, no commentary. Read straight through, it is about ${Math.round(totalWords / 1000)} thousand words, a little over two hours aloud.</p>
<h3>How the words were chosen</h3>
<p>Red-letter Bibles have printed his words in red since 1899, and editions do not always agree on where his speech begins and ends. The text here was checked verse by verse against an independent red-letter edition, and every disagreement was decided by reading the verse itself. Parables are printed whole, because the whole story is his telling, including the lines he gives its characters. Lines spoken by others, and the narrator's words around his, are left out. Where the evangelist translates his Aramaic, as with <i>Talitha cumi</i>, only his own words are printed.</p>
<h3>How to use it</h3>
<p>Part one can be read like a book, one Gospel at a time. Part two gathers sayings for twelve situations people bring to him. Part three is a concordance: look up a word, such as <i>peace</i>, <i>father</i> or <i>afraid</i>, to find every place he says it.</p>
</div>`,
    numbers: `<div class="body prose">
<h2>His words in numbers</h2>
${text.map((b) => `<p class="stat"><b>${b.book}.</b> Jesus speaks in ${b.spokenCount} of its ${b.verseCount} verses; ${Math.round((100 * b.red) / b.total)}% of its words are his (${b.red.toLocaleString('en-US')} of ${b.total.toLocaleString('en-US')}).</p>`).join('')}
<p class="stat" style="margin-top:10pt"><b>All four.</b> ${allVerses.length.toLocaleString('en-US')} verses and ${totalWords.toLocaleString('en-US')} words. He uses ${concEntries.length.toLocaleString('en-US')} different words of three letters or more, leaving aside the commonest; ${[...conc.values()].filter((l) => l.length === 1).length} of them he says only once.</p>
<p class="stat"><b>His most frequent words</b> of that kind: ${[...conc.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12).map(([w, l]) => `${w} (${l.length})`).join(', ')}.</p>
<p class="stat"><b>His first recorded words</b>, at twelve, in the temple: “${esc(spoken.Luke['2']['49'])}” (Luke 2:49).</p>
</div>`,
  };
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(TITLE)}</title><style>${css()}</style></head><body>
<div id="book"></div>
<script>window.PRE = ${JSON.stringify(pre)}; window.DATA = ${JSON.stringify(data).replace(/<\//g, '<\\/')}; window.STRIPS = ${JSON.stringify(Object.fromEntries(text.map((b) => [b.book, { svg: stripSvg(b.marks), b: { book: b.book, red: b.red, total: b.total, spokenCount: b.spokenCount, verseCount: b.verseCount } }])))};</script>
</body></html>`;
}

// Runs in the page: flows the blocks into 6 x 9 pages.
function paginate() {
  const book = document.getElementById('book');
  const pages = [];
  const newPage = (cls = '') => {
    const side = pages.length % 2 === 0 ? 'recto' : 'verso';
    const el = document.createElement('section');
    el.className = `page ${side} ${cls}`;
    el.innerHTML = '<div class="head"></div><div class="body"></div><div class="folio"></div>';
    book.appendChild(el);
    pages.push({ el, heads: [], cls });
    return pages[pages.length - 1];
  };
  const toRecto = () => { if (pages.length % 2 === 1) newPage('bare'); };
  const over = (box) => box.scrollHeight > box.clientHeight + 0.5;
  let cur = null;
  let mode = null; // 'flow' | 'conc'
  let col = null;
  const contents = [];

  const startFlow = () => { cur = newPage(); mode = 'flow'; };
  const startConc = () => {
    cur = newPage();
    mode = 'conc';
    cur.el.querySelector('.body').innerHTML = '<div class="cols"><div class="col"></div><div class="col"></div></div>';
    col = 0;
  };
  const html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; };
  const escH = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  // Keyword in context, trimmed word by word from the outer ends until it fits
  // the column, so no line is ever cut off mid-word.
  const fit = (node, q) => {
    const l = q.l.slice();
    const r = q.r.slice();
    let lm = q.lm;
    let rm = q.rm;
    const render = () => {
      node.innerHTML = `<b>${escH(q.ref)}</b>${lm ? '… ' : ''}${escH(l.join(' '))} ${escH(q.k)} ${escH(r.join(' '))}${rm ? ' …' : ''}`;
    };
    render();
    while (node.scrollWidth > node.clientWidth + 0.5 && (l.length || r.length)) {
      if (l.length >= r.length && l.length) { l.shift(); lm = true; } else { r.pop(); rm = true; }
      render();
    }
  };

  for (const b of window.DATA.blocks) {
    if (b.page) {
      mode = null;
      if (b.page === 'title') { cur = newPage('bare title-page'); cur.el.innerHTML += ''; cur.el.querySelector('.body').outerHTML = window.PRE.title; continue; }
      if (b.page === 'copyright') { cur = newPage('bare'); cur.el.querySelector('.body').outerHTML = window.PRE.copyright; continue; }
      if (b.page === 'contents') { toRecto(); cur = newPage('bare contents'); continue; }
      if (b.page === 'intro' || b.page === 'numbers') { toRecto(); cur = newPage(); cur.el.querySelector('.body').outerHTML = window.PRE[b.page]; cur.heads.push(b.page === 'intro' ? 'About this book' : 'His words in numbers'); continue; }
      if (b.page === 'part') {
        toRecto();
        cur = newPage('bare opener');
        cur.el.querySelector('.body').innerHTML = `<div class="part-no">${b.no}</div><h1>${b.title}</h1><p>${b.note}</p>`;
        contents.push({ title: b.title, no: b.no, page: pages.length });
        continue;
      }
      if (b.page === 'gospel') {
        toRecto();
        const s = window.STRIPS[b.b.book];
        cur = newPage('bare opener');
        const pct = Math.round((100 * s.b.red) / s.b.total);
        cur.el.querySelector('.body').innerHTML = `<div class="part-no">The Gospel according to</div><h1>${s.b.book}</h1><p>Jesus speaks in ${s.b.spokenCount} of the ${s.b.verseCount} verses of ${s.b.book}; ${pct}% of its words are his.</p>${s.svg}<div class="strip-note">Each mark is one verse of ${s.b.book}, from the first chapter to the last. A tall black mark is a verse where he speaks; the taller, the more of the verse is his.</div>`;
        contents.push({ title: s.b.book, sub: true, page: pages.length + 1 });
        startFlow();
        continue;
      }
    }
    if (b.type === 'cw' || b.type === 'cl') {
      if (mode !== 'conc') { toRecto(); startConc(); }
      let cols = cur.el.querySelectorAll('.col');
      let node = html(b.html);
      cols[col].appendChild(node);
      if (b.kwic) fit(node, b.kwic);
      if (over(cols[col])) {
        cols[col].removeChild(node);
        // A headword must not end a column alone.
        let carry = [];
        const last = cols[col].lastElementChild;
        if (last && last.classList.contains('cw')) { carry.push(last); cols[col].removeChild(last); }
        if (col === 0) col = 1; else startConc();
        cols = cur.el.querySelectorAll('.col');
        for (const c of carry) cols[col].appendChild(c);
        if (b.type === 'cl' && !carry.length) cols[col].appendChild(html(`<div class="cw">${b.word}<small>continued</small></div>`));
        cols[col].appendChild(node);
      }
      cur.heads.push(b.word);
      continue;
    }
    // Flowed text
    if (mode !== 'flow') startFlow();
    let box = cur.el.querySelector('.body');
    const node = html(b.html);
    if (b.html.includes('class="gap"') && !box.children.length) continue;
    box.appendChild(node);
    if (over(box)) {
      box.removeChild(node);
      const last = box.lastElementChild;
      const carry = last && (last.classList.contains('chap') || last.classList.contains('sit-h') || last.classList.contains('sit-l')) ? [last] : [];
      if (carry.length && last.classList.contains('sit-l') && last.previousElementSibling && last.previousElementSibling.classList.contains('sit-h')) carry.unshift(last.previousElementSibling);
      carry.forEach((c) => box.removeChild(c));
      startFlow();
      box = cur.el.querySelector('.body');
      carry.forEach((c) => box.appendChild(c));
      if (!node.classList.contains('gap')) box.appendChild(node);
    }
    cur.heads.push(b.head);
  }

  // Contents page
  const tocPage = pages.find((p) => p.cls.includes('contents'));
  tocPage.el.querySelector('.body').innerHTML = `<div class="prose"><h2>Contents</h2></div><div class="toc">${[{ title: 'About this book', page: pages.findIndex((p) => p.heads[0] === 'About this book') + 1 }, { title: 'His words in numbers', page: pages.findIndex((p) => p.heads[0] === 'His words in numbers') + 1 }, ...contents].map((c) => `<div class="${c.sub ? 'sub' : ''}"><span>${c.no ? `${c.no}: ` : ''}${c.title}</span><span>${c.page}</span></div>`).join('')}</div>`;

  // Running heads and folios
  pages.forEach((p, i) => {
    const n = i + 1;
    p.el.querySelector('.folio').textContent = n;
    const isVerso = n % 2 === 0;
    let head = window.DATA.title;
    if (!isVerso && p.heads.length) {
      const a = p.heads[0];
      const z = p.heads[p.heads.length - 1];
      head = a === z ? a : (/^[a-z]/.test(a) ? `${a} – ${z}` : a);
    }
    p.el.querySelector('.head').textContent = head;
  });
  return pages.length;
}

// --- 5. Cover (KDP wraparound) -----------------------------------------------------
function coverHtml(pageCount) {
  const spine = +(pageCount * 0.002252).toFixed(4); // white paper, black ink
  const bleed = 0.125;
  const W = bleed * 2 + 6 * 2 + spine;
  const H = 9 + bleed * 2;
  const font = (name, file, style = 'normal', weight = '400') => `@font-face{font-family:"${name}";src:url("file://${path.join(FONTS, file)}");font-style:${style};font-weight:${weight};}`;
  const strips = text.map((b) => stripSvg(b.marks).replace('class="strip"', 'class="cs"').replace(/fill="#000"/g, 'fill="#e8c6a8"').replace(/fill="#bbb"/g, 'fill="#5a1520"')).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${font('Fell', 'IMFeENrm28P.ttf')}${font('Fell', 'IMFeENit28P.ttf', 'italic')}${font('Lit', 'Literata[opsz,wght].ttf', 'normal', '200 900')}
@page { size: ${W}in ${H}in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
.cover { width: ${W}in; height: ${H}in; background: #6e1423; color: #f4ece2; position: relative; font-family: Lit, serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.front { position: absolute; top: ${bleed}in; left: ${bleed + 6 + spine}in; width: 6in; height: 9in; padding: 0.85in 0.7in 0.6in; display: flex; flex-direction: column; }
.back { position: absolute; top: ${bleed}in; left: ${bleed}in; width: 6in; height: 9in; padding: 0.8in 0.7in; }
.spine { position: absolute; top: ${bleed}in; left: ${bleed + 6}in; width: ${spine}in; height: 9in; display: flex; align-items: center; justify-content: center; }
.spine div { transform: rotate(90deg); white-space: nowrap; font: 400 ${Math.min(14, spine * 72 * 0.5).toFixed(1)}pt Fell, serif; letter-spacing: 0.04em; }
.k { font: 500 8pt Lit, serif; letter-spacing: 0.26em; text-transform: uppercase; color: #e8c6a8; }
h1 { font: 400 50pt/0.98 Fell, serif; margin: 16pt 0 0; }
.sub { font: italic 400 13pt/1.45 Lit, serif; margin: 16pt 0 0; color: #f0dccb; max-width: 4.3in; }
.cs { display: block; width: 100%; height: 0.38in; margin: 0 0 7pt; }
.strips { margin-top: auto; }
.strips p { font: 400 7pt/1.4 Lit, serif; color: #e8c6a8; margin: 8pt 0 0; }
.foot { margin-top: 18pt; display: flex; justify-content: space-between; font: 500 7.5pt Lit, serif; letter-spacing: 0.22em; text-transform: uppercase; color: #e8c6a8; }
.back p { font: 400 10.5pt/1.6 Lit, serif; margin: 0 0 10pt; }
.back .q { font: italic 400 15pt/1.4 Fell, serif; color: #f4ece2; margin-bottom: 18pt; }
.back ul { font: 400 9.5pt/1.7 Lit, serif; padding-left: 14pt; margin: 0 0 12pt; }
/* KDP prints the barcode in the lower right of the back cover; that corner stays empty. */
</style></head><body><div class="cover">
<div class="back">
  <p class="q">“Heaven and earth shall pass away, but my words shall not pass away.”<br><span class="k" style="font-style:normal">Mark 13:31</span></p>
  <p>Every word Jesus speaks in Matthew, Mark, Luke and John, and only his words, in the King James Version. No narration, no commentary: just what he said, in the order the Gospels give it.</p>
  <ul>
    <li>All ${totalWords.toLocaleString('en-US')} of his words, verse by verse, checked against an independent red-letter edition</li>
    <li>A complete concordance of his vocabulary: ${concEntries.length.toLocaleString('en-US')} words, every place he says them</li>
    <li>His words for twelve situations, from worry and grief to doubt and forgiveness</li>
    <li>For each Gospel, a picture of where his voice falls, verse by verse</li>
  </ul>
  <p>For reading straight through, for daily devotion, and for finding the place where he said it.</p>
</div>
<div class="spine">${spine >= 0.25 ? `<div>${esc(TITLE)} · The Words of Jesus</div>` : ''}</div>
<div class="front">
  <div class="k">The Words of Jesus · ${esc(EDITION)}</div>
  <h1>Every Word<br>He Spoke</h1>
  <p class="sub">The words of Jesus from the four Gospels, with a complete concordance</p>
  <div class="strips">${strips}<p>Matthew, Mark, Luke and John, verse by verse: each light mark is a verse where he speaks.</p></div>
  <div class="foot"><span>Red Letter</span><span>Matthew · Mark · Luke · John</span></div>
</div>
</div></body></html>`;
  return { html, spine, W, H };
}

// --- 6. EPUB ---------------------------------------------------------------------------
function buildEpub(file) {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'epub-'));
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), s); };
  const xhtml = (title, body) => `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>${esc(title)}</title><link rel="stylesheet" href="style.css"/></head><body>${body}</body></html>`;
  const chapters = [];
  chapters.push({ id: 'intro', title: 'About this book', body: `<h1>About this book</h1><p>This book prints only the words Jesus speaks in the four Gospels, in the King James Version: no narration, no other speakers, no commentary.</p><p>The text was checked verse by verse against an independent red-letter edition, and every disagreement was decided by reading the verse itself. Parables are printed whole, because the whole story is his telling.</p><p>The scripture text is the King James Version (1769), public domain in the United States.</p>` });
  for (const b of text) {
    chapters.push({ id: b.book.toLowerCase(), title: b.book, body: `<h1>${b.book}</h1><p class="note">Jesus speaks in ${b.spokenCount} of the ${b.verseCount} verses of ${b.book}.</p>${b.chapters.map((c) => `<h2>Chapter ${c.ch}</h2>${c.verses.map((x) => `<p class="vs"><b>${x.v}</b> ${esc(x.t)}</p>`).join('')}`).join('')}` });
  }
  chapters.push({ id: 'life', title: 'His Words for Life', body: `<h1>His Words for Life</h1>${situations.map((s) => `<h2>${esc(s.name)}</h2><p class="note">${esc(s.line)}</p>${s.list.map((p) => `<p>${esc(p.text)} <span class="ref">${esc(p.cite)}</span></p>`).join('')}`).join('')}` });
  const letters = [...new Set(concEntries.map(([wd]) => wd[0]))];
  for (const L of letters) {
    chapters.push({ id: `conc-${L}`, title: `Concordance: ${L.toUpperCase()}`, body: `<h1>Concordance: ${L.toUpperCase()}</h1>${concEntries.filter(([wd]) => wd[0] === L).map(([wd, list]) => `<h3>${esc(wd)} (${list.length})</h3>${list.slice(0, CAP).map((o) => `<p class="cl"><b>${o.ref}</b> ${esc(o.line)}</p>`).join('')}${list.length > CAP ? `<p class="cl">Also ${list.slice(CAP).map((o) => o.ref).join(', ')}</p>` : ''}`).join('')}` });
  }
  w('mimetype', 'application/epub+zip');
  w('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  w('OEBPS/style.css', 'body{font-family:serif;line-height:1.5}h1{font-size:1.6em;margin:1em 0 .5em}h2{font-size:1.15em;margin:1.2em 0 .4em}h3{font-size:1em;margin:1em 0 .2em}.vs{margin:0 0 .4em}.vs b{font-size:.7em;vertical-align:super;margin-right:.2em}.note{font-style:italic}.ref{font-size:.8em;font-variant:small-caps}.cl{margin:0;font-size:.9em}.cl b{margin-right:.4em}');
  chapters.forEach((c) => w(`OEBPS/${c.id}.xhtml`, xhtml(c.title, c.body)));
  w('OEBPS/nav.xhtml', xhtml('Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${chapters.map((c) => `<li><a href="${c.id}.xhtml">${esc(c.title)}</a></li>`).join('')}</ol></nav>`));
  const id = 'urn:uuid:7c1f2a3e-5b7d-4e2a-9c61-every-word-he-spoke'.replace('every-word-he-spoke', '0f3b9d1e2a4c');
  w('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">${id}</dc:identifier><dc:title>${esc(TITLE)}: ${esc(SUBTITLE)}</dc:title><dc:language>en</dc:language><dc:creator>Red Letter</dc:creator><dc:rights>Scripture: King James Version, public domain in the United States.</dc:rights><meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>${chapters.map((c) => `<item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${chapters.map((c) => `<itemref idref="${c.id}"/>`).join('')}</spine></package>`);
  // mimetype must be the first entry, stored uncompressed.
  execFileSync('python3', ['-I', '-c', `
import zipfile,os,sys
d,out=sys.argv[1],sys.argv[2]
z=zipfile.ZipFile(out,'w')
z.write(os.path.join(d,'mimetype'),'mimetype',compress_type=zipfile.ZIP_STORED)
for root,_,files in os.walk(d):
  for f in sorted(files):
    p=os.path.join(root,f); a=os.path.relpath(p,d)
    if a!='mimetype': z.write(p,a,compress_type=zipfile.ZIP_DEFLATED)
z.close()`, dir, file]);
  fs.rmSync(dir, { recursive: true, force: true });
}

// --- 7. Build ---------------------------------------------------------------------------
(async () => {
  fs.mkdirSync(DIST, { recursive: true });
  const puppeteer = require('puppeteer-core');
  const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  const htmlPath = path.join(DIST, 'interior.html');
  fs.writeFileSync(htmlPath, htmlDoc());
  await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  // Load every face first: the browser fetches a font only when text uses it,
  // and measuring with a fallback face would make every page overflow later.
  await page.evaluate(async () => {
    await Promise.all(['9pt Lit', '600 9pt Lit', '700 9pt Lit', '500 9pt Lit', 'italic 9pt Lit', '9pt Fell', 'italic 9pt Fell'].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  });
  const pageCount = await page.evaluate(paginate);
  const check = await page.evaluate(() => {
    const pages = [...document.querySelectorAll('.page')];
    return {
      overflow: pages.map((el, i) => [i + 1, el.querySelector('.body')]).filter(([, b]) => b && b.scrollHeight > b.clientHeight + 1).map(([i]) => i),
      cut: [...document.querySelectorAll('.cl')].filter((e) => e.scrollWidth > e.clientWidth + 1).length,
    };
  });
  if (check.overflow.length || check.cut) throw new Error(`Layout check failed: overflowing pages ${check.overflow.slice(0, 10)}, cut concordance lines ${check.cut}`);
  const missing = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family));
  if (missing.length) throw new Error(`Fonts did not load: ${missing}`);
  const interior = path.join(DIST, 'every-word-he-spoke-interior-6x9.pdf');
  await page.pdf({ path: interior, preferCSSPageSize: true, printBackground: true });
  console.log(`interior: ${pageCount} pages, ${Math.round(fs.statSync(interior).size / 1024)} KB`);

  const cover = coverHtml(pageCount);
  const coverHtmlPath = path.join(DIST, 'cover.html');
  fs.writeFileSync(coverHtmlPath, cover.html);
  const cp = await browser.newPage();
  await cp.goto(`file://${coverHtmlPath}`, { waitUntil: 'load' });
  await cp.evaluate(() => document.fonts.ready);
  const coverPdf = path.join(DIST, 'every-word-he-spoke-cover.pdf');
  await cp.pdf({ path: coverPdf, preferCSSPageSize: true, printBackground: true });
  console.log(`cover: ${cover.W.toFixed(4)} x ${cover.H} in, spine ${cover.spine} in`);
  await browser.close();

  const epub = path.join(DIST, 'every-word-he-spoke.epub');
  buildEpub(epub);
  console.log(`epub: ${Math.round(fs.statSync(epub).size / 1024)} KB`);
  fs.writeFileSync(path.join(DIST, 'build.json'), JSON.stringify({ pageCount, spine: cover.spine, coverWidth: cover.W, coverHeight: cover.H, words: totalWords, verses: allVerses.length, concordanceWords: concEntries.length }, null, 2));
})();
