'use strict';
// Verifies Words in Frame content. Exits non-zero on any failure, so build.js
// can call it (require('./verify').run() throws) before rendering.
const path = require('path');
const fs = require('fs');

const SPOKEN = path.join(__dirname, '..', '..', 'data', 'spoken-gospels.json');
const HARSH = /\b(woe|hell|damn\w*|millstone|fire|outer darkness|gnashing|perish|serpents|vipers|hypocrites?|cursed)\b/i;

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRef(ref) {
  const m = /^(Matthew|Mark|Luke|John) (\d{1,3}):(\d{1,3})$/.exec(ref);
  return m ? { book: m[1], chapter: m[2], verse: m[3] } : null;
}

// Each " … " part of a quotation must be a substring of the verse's red-letter text.
function checkQuote(quote, ref, corpus) {
  const p = parseRef(ref);
  if (!p) return `bad citation format "${ref}" (expected one verse, e.g. "John 14:1")`;
  const verse = corpus.books?.[p.book]?.[p.chapter]?.[p.verse];
  if (!verse) return `${ref} is not red-letter in the corpus`;
  const hay = norm(verse);
  for (const part of quote.split(' … ')) {
    const n = norm(part);
    if (!n) return `empty quotation part in ${ref}`;
    if (!hay.includes(n)) return `"${part}" not found in ${ref}: "${verse}"`;
  }
  return null;
}

function run({ quiet = false } = {}) {
  delete require.cache[require.resolve('./designs')];
  const { collection, ratios, designs, sizeGuide, DPI, SAFE_MARGIN_IN } = require('./designs');
  const corpus = JSON.parse(fs.readFileSync(SPOKEN, 'utf8'));
  const errors = [];
  const warnings = [];
  const log = quiet ? () => {} : console.log;

  // Designs: count, numbering, slugs.
  if (designs.length !== 12) errors.push(`expected 12 designs, found ${designs.length}`);
  const slugs = new Set();
  const refs = new Set();
  designs.forEach((d, i) => {
    const id = `design ${String(d.n).padStart(2, '0')} (${d.slug})`;
    if (d.n !== i + 1) errors.push(`${id}: n should be ${i + 1}`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) errors.push(`${id}: slug must be kebab-case`);
    if (slugs.has(d.slug)) errors.push(`${id}: duplicate slug`);
    slugs.add(d.slug);
    if (refs.has(d.ref)) errors.push(`${id}: duplicate citation ${d.ref}`);
    refs.add(d.ref);
    for (const k of ['title', 'ref', 'quote', 'ground', 'layout', 'ornament']) {
      if (!d[k]) errors.push(`${id}: missing ${k}`);
    }

    // Quotation against corpus.
    const qerr = checkQuote(d.quote, d.ref, corpus);
    if (qerr) errors.push(`${id}: ${qerr}`);
    else log(`  ok  ${String(d.n).padStart(2, '0')}  ${d.ref.padEnd(14)} "${d.quote}"`);

    // Line breaks reproduce the quotation exactly.
    if (!Array.isArray(d.lines) || !d.lines.length) errors.push(`${id}: missing lines`);
    else {
      if (d.lines.join(' ') !== d.quote) errors.push(`${id}: lines joined ("${d.lines.join(' ')}") differ from quote`);
      if (d.lines.some((l) => l !== l.trim() || !l)) errors.push(`${id}: a line has stray spaces or is empty`);
      const allowed = new Set(d.singleWordLines || []);
      d.lines.forEach((l, li) => {
        const single = !/\s/.test(l);
        if (single && !allowed.has(l)) errors.push(`${id}: line ${li + 1} "${l}" is a lone word (orphan); list it in singleWordLines if intended`);
      });
      for (const s of allowed) if (!d.lines.includes(s)) errors.push(`${id}: singleWordLines entry "${s}" is not a line`);
      const last = d.lines[d.lines.length - 1];
      if (!/\s/.test(last)) errors.push(`${id}: last line "${last}" is a single word`);
      // Balance (warning): flag big jumps between adjacent lines in plain layouts.
      if (!d.singleWordLines) {
        const lens = d.lines.map((l) => l.length);
        if (Math.max(...lens) > 2.6 * Math.min(...lens)) warnings.push(`${id}: line lengths ${lens.join('/')} look unbalanced`);
      }
    }

    // Accent must be found in a line.
    const accents = d.accent == null ? [] : [].concat(d.accent);
    for (const a of accents) {
      if (!d.lines.some((l) => l.includes(a))) errors.push(`${id}: accent "${a}" not found in any line`);
    }

    if (HARSH.test(d.quote)) errors.push(`${id}: quotation contains a word that reads harsh out of context`);
    if (d.quote.split(/\s+/).length > 22) errors.push(`${id}: quotation is too long for wall art (${d.quote.split(/\s+/).length} words)`);
    if (!['paper', 'stone', 'ink', 'red'].includes(d.ground)) errors.push(`${id}: unknown ground "${d.ground}"`);
  });

  // Spread across the four Gospels.
  const books = {};
  for (const d of designs) {
    const b = d.ref.split(' ')[0];
    books[b] = (books[b] || 0) + 1;
  }
  for (const b of ['Matthew', 'Mark', 'Luke', 'John']) {
    if (!books[b]) errors.push(`no saying from ${b}`);
    else if (books[b] > 5) errors.push(`${b} has ${books[b]} sayings; spread them out`);
  }

  // Grounds: a few dark, one or two red, mostly light.
  const g = {};
  for (const d of designs) g[d.ground] = (g[d.ground] || 0) + 1;
  if (!(g.red >= 1 && g.red <= 2)) errors.push(`expected 1-2 red-ground designs, found ${g.red || 0}`);
  if (!(g.ink >= 2 && g.ink <= 4)) errors.push(`expected 2-4 dark (ink) designs, found ${g.ink || 0}`);
  if ((g.paper || 0) + (g.stone || 0) < 6) errors.push('expected at least 6 light-ground designs');
  // Layout and ornament variety.
  const layouts = new Set(designs.map((d) => d.layout));
  if (layouts.size !== designs.length) errors.push(`layouts should all differ (${layouts.size} distinct of ${designs.length})`);
  // No two adjacent designs share a ground.
  for (let i = 1; i < designs.length; i++) {
    if (designs[i].ground === designs[i - 1].ground) warnings.push(`designs ${i} and ${i + 1} share the ${designs[i].ground} ground`);
  }

  // Ratios: exact pixel sizes at 300 dpi.
  if (DPI !== 300) errors.push('DPI must be 300');
  if (SAFE_MARGIN_IN !== 0.4) errors.push('safe margin must be 0.4 in');
  const expectPx = { '4x5': [4800, 6000], '3x4': [5400, 7200], '2x3': [7200, 10800], '11x14': [3300, 4200], iso: [3508, 4961] };
  for (const [k, px] of Object.entries(expectPx)) {
    const r = ratios.find((x) => x.key === k);
    if (!r) { errors.push(`missing ratio ${k}`); continue; }
    if (r.px[0] !== px[0] || r.px[1] !== px[1]) errors.push(`ratio ${k}: px ${r.px} should be ${px}`);
    const fromIn = [Math.round(r.master.w * DPI), Math.round(r.master.h * DPI)];
    if (fromIn[0] !== px[0] || fromIn[1] !== px[1]) errors.push(`ratio ${k}: master inches give ${fromIn}, not ${px}`);
  }

  // Our own copy (not quotations): no em dashes, no "not X but Y" filler, no preachiness.
  const copy = [
    ...Object.values(collection),
    ...designs.flatMap((d) => [d.title, d.note]),
    sizeGuide.title, sizeGuide.intro, ...sizeGuide.tips, sizeGuide.fileNaming, sizeGuide.closing,
    ...ratios.flatMap((r) => [r.label, ...r.prints]),
  ];
  for (const s of copy) {
    if (/[—]|--/.test(s)) errors.push(`copy uses an em dash: "${s}"`);
    if (/\bnot\b[^.;:]{1,40}\bbut\b/i.test(s)) errors.push(`copy uses "not X but Y": "${s}"`);
    if (/\b(you must|you should|sinners?|repent|counsel(l)?ing|therapy|cure)\b/i.test(s)) errors.push(`copy sounds preachy or makes a claim: "${s}"`);
  }
  if (collection.brand !== 'Red Letter') errors.push('brand must be "Red Letter"');

  log(`\n  ${designs.length} designs; gospels ${JSON.stringify(books)}; grounds ${JSON.stringify(g)}`);
  for (const w of warnings) log(`  warn  ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  FAIL  ${e}`);
    const err = new Error(`verify: ${errors.length} problem(s)`);
    err.errors = errors;
    throw err;
  }
  log('  PASS  all quotations match the red-letter corpus; content rules hold.');
  return { designs: designs.length, warnings };
}

module.exports = { run, checkQuote, norm };

if (require.main === module) {
  try {
    run();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
