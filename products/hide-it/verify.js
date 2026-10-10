#!/usr/bin/env node
// Checks src/content.js against the red-letter corpus and the content rules.
// Usage: node verify.js      (exit 1 on any error)
// build.js calls verify() and refuses to build if it reports errors.

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const spoken = require(path.join(ROOT, 'data', 'spoken-gospels.json')).books;
const { lookup } = require(path.join(ROOT, 'lib', 'scripture'));

const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
// Quotations in the copy that are not words of Jesus, with their source text.
const OTHER_QUOTES = {
  'Thy word have I hid in mine heart': 'Psalm 119:11 (KJV): Thy word have I hid in mine heart, that I might not sin against thee.',
};
const HARSH = /\b(woe|hell|millstones?|damnation|damned|gnashing|outer darkness|everlasting fire|furnace|vipers|hypocrites?)\b/i;
const NUMBER_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60 };

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/'/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const words = (s) => norm(s).split(' ').filter(Boolean);

function parseSingleRef(ref) {
  const m = /^(Matthew|Mark|Luke|John) (\d+):(\d+)$/.exec(ref);
  return m ? { book: m[1], chapter: m[2], verse: m[3] } : null;
}

// Each " … " part must be a substring of the verse, in order.
function quoteMatches(text, verse) {
  const v = ` ${norm(verse)} `;
  let from = 0;
  for (const part of text.split(' … ')) {
    const p = ` ${norm(part)} `;
    if (p.trim() === '') return false;
    const at = v.indexOf(p, from);
    if (at < 0) return false;
    from = at + p.length - 1;
  }
  return true;
}

function longestCommonRun(a, b) {
  let best = 0;
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) {
      let k = 0;
      while (a[i + k] && a[i + k] === b[j + k]) k++;
      if (k > best) best = k;
    }
  return best;
}

function numberWordValue(w) {
  w = w.toLowerCase();
  if (NUMBER_WORDS.includes(w)) return NUMBER_WORDS.indexOf(w);
  const [t, u] = w.split('-');
  if (TENS[t] !== undefined) return TENS[t] + (u ? NUMBER_WORDS.indexOf(u) : 0);
  return null;
}

// Collect every string of UI copy, calling functions with sample arguments.
function collectCopy(obj, where, out) {
  if (typeof obj === 'string') out.push({ where, text: obj });
  else if (typeof obj === 'function') {
    const samples = obj.length >= 2 ? [[1, 54], [3, 10]] : [[1], [2], [5], ['Fade'], ['Steady'], ['thee']];
    for (const args of samples) {
      const r = obj(...args);
      if (typeof r === 'string') out.push({ where: `${where}(${args.join(',')})`, text: r });
    }
  } else if (Array.isArray(obj)) obj.forEach((v, i) => collectCopy(v, `${where}[${i}]`, out));
  else if (obj && typeof obj === 'object')
    for (const [k, v] of Object.entries(obj)) collectCopy(v, where ? `${where}.${k}` : k, out);
  return out;
}

function verify(content = require('./src/content.js')) {
  const errors = [];
  const report = [];
  const { collections, modes, mastery, ui } = content;
  const all = [];
  const ids = new Set();
  const refs = new Set();
  const texts = new Set();
  const cues = new Map();

  if (!Array.isArray(collections) || collections.length < 4) errors.push('need at least 4 collections');

  for (const c of collections) {
    if (!c.id || !c.name || !c.blurb) errors.push(`collection ${c.id || '?'}: needs id, name, blurb`);
    if (!Array.isArray(c.sayings) || c.sayings.length < 5) errors.push(`collection ${c.id}: needs at least 5 sayings`);
    if (ids.has(c.id)) errors.push(`duplicate id ${c.id}`);
    ids.add(c.id);
    let prevLen = 0;
    let prevPrayer = null;
    let prayerDone = false;
    for (const s of c.sayings) {
      const tag = `${c.id}/${s.id}`;
      for (const k of ['id', 'ref', 'cue', 'text']) if (!s[k] || typeof s[k] !== 'string') errors.push(`${tag}: missing ${k}`);
      if (ids.has(s.id)) errors.push(`duplicate id ${s.id}`);
      ids.add(s.id);
      if (refs.has(s.ref)) errors.push(`${tag}: ref ${s.ref} used twice`);
      refs.add(s.ref);
      if (texts.has(norm(s.text))) errors.push(`${tag}: text used twice`);
      texts.add(norm(s.text));

      // 1. The quotation itself.
      const r = parseSingleRef(s.ref);
      if (!r) { errors.push(`${tag}: ref "${s.ref}" is not a single Gospel verse`); continue; }
      const verse = spoken[r.book]?.[r.chapter]?.[r.verse];
      if (!verse) { errors.push(`${tag}: ${s.ref} is not red-letter in data/spoken-gospels.json`); continue; }
      if (!quoteMatches(s.text, verse)) errors.push(`${tag}: text differs from ${s.ref}\n    have: ${s.text}\n    KJV:  ${verse}`);
      const lk = lookup(s.ref);
      if (!lk || !lk.redLetter || lk.citation !== s.ref) errors.push(`${tag}: lib/scripture lookup disagrees for ${s.ref}`);
      if (/^[a-z]/.test(s.text)) errors.push(`${tag}: starts mid-sentence in lower case`);
      if (/[^A-Za-z ,.;:'?!…]/.test(s.text)) errors.push(`${tag}: unexpected character in text`);
      if (/\s{2}|^\s|\s$/.test(s.text)) errors.push(`${tag}: stray whitespace`);
      if (HARSH.test(s.text)) errors.push(`${tag}: harsh out of context (${s.text.match(HARSH)[0]})`);

      // 2. Ordering: short to long within a collection.
      //    Lines of the Lord's Prayer (prayerLine) keep prayer order instead:
      //    consecutive verses of one chapter, listed together.
      const n = words(s.text).length;
      if (s.prayerLine) {
        if (prevPrayer && !(prevPrayer.book === r.book && prevPrayer.chapter === r.chapter && +r.verse === +prevPrayer.verse + 1))
          errors.push(`${tag}: prayer line ${s.ref} does not follow ${prevPrayer.book} ${prevPrayer.chapter}:${prevPrayer.verse}`);
        if (prayerDone) errors.push(`${tag}: prayer lines must be listed together`);
        prevPrayer = r;
      } else {
        if (prevPrayer) prayerDone = true;
        if (n < prevLen) errors.push(`${tag}: ${n} words follows a ${prevLen}-word saying (keep short ones first)`);
        prevLen = n;
      }

      // 3. The cue: short, and never a loose paraphrase of his words.
      if (s.cue.length > 50) errors.push(`${tag}: cue longer than 50 characters`);
      const run = longestCommonRun(words(s.cue), words(s.text));
      if (run >= 3 && !` ${norm(s.text)} `.includes(` ${norm(s.cue)} `))
        errors.push(`${tag}: cue echoes ${run} words of the saying without quoting it exactly`);
      if (HARSH.test(s.cue)) errors.push(`${tag}: harsh word in cue`);
      // Each cue must point to exactly one saying.
      const cueKey = norm(s.cue);
      if (cues.has(cueKey)) errors.push(`${tag}: cue "${s.cue}" is also used by ${cues.get(cueKey)}`);
      else cues.set(cueKey, s.id);
      // A cue made only of his words, in his order, must be an exact span (a near-quote reads as a misquote).
      const cw = words(s.cue), tw = words(s.text);
      let k = 0;
      for (const w of tw) if (k < cw.length && w === cw[k]) k++;
      if (cw.length >= 2 && k === cw.length && !` ${norm(s.text)} `.includes(` ${cueKey} `))
        errors.push(`${tag}: cue "${s.cue}" looks like a quotation but is not an exact span of ${s.ref}`);

      all.push({ ...s, collection: c.id, book: r.book, words: n });
    }
  }

  // Totals and spread.
  if (all.length < 40 || all.length > 60) errors.push(`${all.length} sayings; brief asks for 40 to 60`);
  for (const g of GOSPELS) if (!all.some((s) => s.book === g)) errors.push(`no sayings from ${g}`);
  const first = collections[0].sayings.map((s) => words(s.text).length);
  const meanOf = (c) => c.sayings.reduce((t, s) => t + words(s.text).length, 0) / c.sayings.length;
  if (Math.max(...first) > 12) errors.push('first collection should hold only short sayings (12 words or fewer)');
  for (const c of collections.slice(1))
    if (meanOf(c) <= meanOf(collections[0])) errors.push(`collection ${c.id} is shorter on average than the first collection`);

  // Modes and mastery.
  const modeIds = (modes || []).map((m) => m.id).join(',');
  if (modeIds !== 'read,fade,letters,build') errors.push(`modes should be read,fade,letters,build (have ${modeIds})`);
  for (const m of modes || []) for (const k of ['name', 'short', 'instructions']) if (!m[k]) errors.push(`mode ${m.id}: missing ${k}`);
  if (!Array.isArray(mastery) || mastery.some((m, i) => m.box !== i || !m.name)) errors.push('mastery levels must be boxes 0..n with names');

  // 4. Copy rules across every word that is not a saying.
  const copy = collectCopy({ ui, modes, mastery }, '', []);
  for (const c of collections) {
    copy.push({ where: `${c.id}.name`, text: c.name }, { where: `${c.id}.blurb`, text: c.blurb });
    for (const s of c.sayings) copy.push({ where: `${c.id}/${s.id}.cue`, text: s.cue });
  }
  for (const { where, text } of copy) {
    if (/[—–]|--/.test(text)) errors.push(`${where}: dash in copy: "${text}"`);
    if (/\bnot\b[^.!?;:]*\bbut\b/i.test(text)) errors.push(`${where}: "not X but Y" construction: "${text}"`);
    if (/\b(you must|you should|you need to|sinners?|repent)\b/i.test(text)) errors.push(`${where}: preachy wording: "${text}"`);
    if (/\b(undefined|NaN|null|TODO)\b|\[object/.test(text)) errors.push(`${where}: placeholder text: "${text}"`);
    if (HARSH.test(text)) errors.push(`${where}: harsh word in copy`);
    if (/["“”]/.test(text)) {
      for (const q of text.match(/["“]([^"”]+)["”]/g) || []) {
        const inner = q.slice(1, -1).replace(/[.,]$/, '');
        const other = Object.keys(OTHER_QUOTES).find((k) => norm(OTHER_QUOTES[k]).includes(norm(inner)));
        const his = all.find((s) => quoteMatches(inner, spoken[s.book][s.ref.split(' ')[1].split(':')[0]][s.ref.split(':')[1]]));
        if (!other && !his) errors.push(`${where}: quotation "${inner}" is not verified`);
      }
    }
    if (/\bcounsel(ing|or)\b/i.test(text) && !/not a substitute/i.test(text)) errors.push(`${where}: mentions counseling without the not-a-substitute line`);
  }
  if (!copy.some((c) => /not a substitute/i.test(c.text) && /counsel/i.test(c.text)))
    errors.push('copy must say the product is not a substitute for counseling');

  // The epigraph's spelled-out count must match.
  const m = /^([A-Z][a-z]+(?:-[a-z]+)?) sayings/.exec(ui.epigraph || '');
  if (!m || numberWordValue(m[1]) !== all.length) errors.push(`epigraph count "${m && m[1]}" does not match ${all.length} sayings`);

  // Report.
  const byBook = Object.fromEntries(GOSPELS.map((g) => [g, all.filter((s) => s.book === g).length]));
  report.push(`${all.length} sayings in ${collections.length} collections; ${copy.length} copy strings checked`);
  report.push(`by Gospel: ${GOSPELS.map((g) => `${g} ${byBook[g]}`).join(', ')}`);
  for (const c of collections) {
    const lens = c.sayings.map((s) => words(s.text).length);
    report.push(`  ${c.name.padEnd(18)} ${String(c.sayings.length).padStart(2)} sayings, ${Math.min(...lens)}-${Math.max(...lens)} words`);
  }
  return { ok: errors.length === 0, errors, report, sayings: all };
}

module.exports = { verify, quoteMatches, norm };

if (require.main === module) {
  const { ok, errors, report } = verify();
  for (const line of report) console.log(line);
  if (!ok) {
    console.error(`\nFAILED: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('\nOK: every quotation matches the red-letter KJV corpus and the copy rules pass.');
}
