#!/usr/bin/env node
// Builds dist/hide-it.html: one self-contained file with the fonts, styles,
// script and every saying inlined. It refuses to build if any quotation of
// Jesus differs from the red-letter KJV corpus, before and after assembly.
//
//   node build.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { verify, quoteMatches } = require('./verify.js');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const SRC = path.join(HERE, 'src');
const DIST = path.join(HERE, 'dist');
const OUT = path.join(DIST, 'hide-it.html');
const MAX_BYTES = 1.5 * 1024 * 1024;

function fail(msg, list = []) {
  console.error(`BUILD FAILED: ${msg}`);
  for (const l of list) console.error(`  - ${l}`);
  process.exit(1);
}

// 1. Verify the source content.
delete require.cache[require.resolve('./src/content.js')];
const content = require('./src/content.js');
const pre = verify(content);
pre.report.forEach((l) => console.log(l));
if (!pre.ok) fail(`${pre.errors.length} content problem(s)`, pre.errors);

// 2. Serialize the content as a JS literal (ui strings include small functions).
function lit(v) {
  if (typeof v === 'function') {
    const src = v.toString();
    if (!/^\(?[\w\s,]*\)?\s*=>/.test(src)) fail(`ui function is not a plain arrow function: ${src.slice(0, 60)}`);
    return `(${src})`;
  }
  if (Array.isArray(v)) return `[${v.map(lit).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}:${lit(x)}`).join(',')}}`;
  return JSON.stringify(v);
}
const data = lit({ collections: content.collections, modes: content.modes, mastery: content.mastery, ui: content.ui }).replace(/<\//g, '<\\/');

// 3. Fonts, inlined as woff2 (subsets made by tools/subset-fonts.py).
const faces = [
  ['IM Fell English', 'normal', '400', 'fell-roman.woff2'],
  ['IM Fell English', 'italic', '400', 'fell-italic.woff2'],
  ['Literata', 'normal', '400 700', 'literata.woff2'],
  ['Literata', 'italic', '400 600', 'literata-italic.woff2'],
];
const fonts = faces.map(([family, style, weight, file]) => {
  const p = path.join(SRC, 'fonts', file);
  if (!fs.existsSync(p)) fail(`missing font ${p}; run tools/subset-fonts.py`);
  const b64 = fs.readFileSync(p).toString('base64');
  return `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
}).join('\n');

// 4. Assemble.
const ui = content.ui;
const fill = {
  TITLE: ui.appName,
  TAGLINE: ui.tagline,
  BRAND: ui.brand,
  SKIP: ui.a11y.skip,
  NAV_TODAY: ui.nav.today,
  NAV_SAYINGS: ui.nav.collections,
  NAV_PROGRESS: ui.nav.progress,
  NAV_ABOUT: ui.nav.about,
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
for (const [k, v] of Object.entries(fill)) html = html.split(`{{${k}}}`).join(esc(v));
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'app.js'), 'utf8');
if (/<\/script/i.test(js) || /<\/style/i.test(css)) fail('source contains a closing script or style tag');
// Function replacements so "$&" style patterns in the payload are left alone.
html = html.replace('{{FONTS}}', () => fonts).replace('{{CSS}}', () => css).replace('{{DATA}}', () => data).replace('{{JS}}', () => js);
const left = html.match(/\{\{[A-Z_]+\}\}/g);
if (left) fail(`unfilled placeholders: ${left.join(', ')}`);

// 5. Re-verify what actually landed in the file.
const m = /window\.__HIDEIT__ = ([\s\S]*?);\n<\/script>/.exec(html);
if (!m) fail('could not find the embedded data in the output');
const sandbox = {};
vm.runInNewContext(`out = ${m[1]};`, sandbox);
const embedded = sandbox.out;
const post = verify(embedded);
if (!post.ok) fail(`${post.errors.length} problem(s) in the embedded data`, post.errors);
// And an independent pass straight against the corpus, sayings only.
const spoken = require(path.join(ROOT, 'data', 'spoken-gospels.json')).books;
const bad = [];
let n = 0;
for (const c of embedded.collections) for (const s of c.sayings) {
  n++;
  const [, book, ch, vs] = /^(\w+) (\d+):(\d+)$/.exec(s.ref) || [];
  const verse = spoken[book] && spoken[book][ch] && spoken[book][ch][vs];
  if (!verse || !quoteMatches(s.text, verse)) bad.push(`${s.ref}: "${s.text}"`);
}
if (bad.length) fail('embedded quotation differs from the corpus', bad);

// 6. Self-contained and small.
const external = [...html.matchAll(/(?:src|href)\s*=\s*["']?(https?:)?\/\/[^"'\s>]+|url\(\s*["']?https?:/gi)].map((x) => x[0]);
if (external.length) fail('external requests found', external);
const bytes = Buffer.byteLength(html);
if (bytes > MAX_BYTES) fail(`output is ${bytes} bytes; budget is ${MAX_BYTES}`);

fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`\nverified ${n} embedded sayings against data/spoken-gospels.json`);
console.log(`wrote ${path.relative(ROOT, OUT)} (${(bytes / 1024).toFixed(1)} KB, no external requests)`);
