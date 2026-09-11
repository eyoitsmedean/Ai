#!/usr/bin/env node
/**
 * Generate the on-device Advisor from the same composer the server runs.
 * Pages, the phone, and a dropped API host then answer with the same letters.
 *
 *   node scripts/bundle-advisor.js
 */
const fs = require('fs');
const path = require('path');
const { lookup, looksLikeCrisis } = require('../lib/scripture');
const { THEMES } = require('../lib/curated');
const { loadLibrary } = require('../lib/library');
const spoken = require('../data/spoken-gospels.json');

const ROOT = path.join(__dirname, '..');
const ADVISE = fs.readFileSync(path.join(ROOT, 'lib/advise.js'), 'utf8');
const SCRIPTURE = fs.readFileSync(path.join(ROOT, 'lib/scripture.js'), 'utf8');
const CRISIS = SCRIPTURE.match(/function looksLikeCrisis[\s\S]*?return (\/.*?\/i)\.test/)[1];
if (!CRISIS || !looksLikeCrisis('I want to die')) {
  throw new Error('could not extract the crisis regex from lib/scripture.js');
}

const SEVEN = `  window.RLA_SEVEN = [
    { title: 'Come', theme: 'Rest', verse: 'Matthew 11:28–29', passage: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.', reflection: 'Day one is not a program. It is an invitation. Come as you are — laden, not finished.' },
    { title: 'Peace', theme: 'Peace', verse: 'John 14:27', passage: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', reflection: 'The world offers a pause. He leaves a gift. You do not have to manufacture calm to receive it.' },
    { title: 'Light', theme: 'Light', verse: 'John 8:12', passage: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.', reflection: 'Dark seasons are real. He does not deny them. Following is how the next step becomes visible.' },
    { title: 'Love', theme: 'Love', verse: 'John 13:34', passage: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.', reflection: 'The mark is not an argument. It is how you treat the person next to you today.' },
    { title: 'Forgive', theme: 'Forgiveness', verse: 'Matthew 18:21–22', passage: 'I say not unto thee, Until seven times: but, Until seventy times seven.', reflection: 'Mercy is a way of life, not a single heroic act. One name is enough for this day.' },
    { title: 'Abide', theme: 'Abide', verse: 'John 15:4–5', passage: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me. I am the vine, ye are the branches.', reflection: 'Fruit comes from staying close, not from straining alone. Remain. That is the work.' },
    { title: 'Go', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you alway, even unto the end of the world.', reflection: 'The last word of the seven is not goodbye. It is presence that does not expire. Go — he goes too.' }
  ];`;

const needed = new Set();
for (const pack of Object.values(THEMES)) {
  for (const p of pack.passages) needed.add(p.verse);
}
for (const m of ADVISE.matchAll(/verse:\s*'([^']+)'/g)) needed.add(m[1]);
for (const m of ADVISE.matchAll(/'((?:Matthew|Mark|Luke|John) \d{1,3}:\d{1,3}(?:[–\-]\d{1,3})?)'/g)) needed.add(m[1]);
for (const extra of ['John 16:22', 'John 11:25', 'Matthew 11:28', 'Luke 12:6–7', 'Matthew 7:7–8', 'Matthew 22:37–40', 'John 15:11', 'John 14:27', 'Mark 5:36', 'Matthew 5:4', 'Luke 15:4', 'Luke 15:4–7', 'Luke 15:20–24', 'Matthew 6:19–21', 'Matthew 5:3–10', 'Matthew 6:9–13', 'Matthew 25:35–36', 'Matthew 28:19–20', 'Matthew 19:8–9', 'Matthew 19:14', 'Matthew 26:39', 'Luke 23:34', 'Matthew 13:3–8', 'Matthew 13:31–32', 'Luke 10:33–37', 'John 10:11', 'John 15:5', 'Matthew 5:13', 'Matthew 5:14–16', 'Matthew 7:12', 'Matthew 7:13–14', 'Matthew 25:21']) {
  needed.add(extra);
}

const VERSES = {};
for (const cite of needed) {
  const hit = lookup(cite);
  if (hit && hit.text) {
    VERSES[hit.citation] = hit.text;
    if (hit.verses) {
      for (const v of hit.verses) {
        if (v.redLetter && v.text) VERSES[`${hit.book} ${hit.chapter}:${v.verse}`] = v.text;
      }
    }
  }
}

const RED = [];
for (const [book, chs] of Object.entries(spoken.books)) {
  for (const [ch, verses] of Object.entries(chs)) {
    for (const vs of Object.keys(verses)) RED.push(`${book} ${ch}:${vs}`);
  }
}

const slimThemes = {};
for (const [name, pack] of Object.entries(THEMES)) {
  slimThemes[name] = {
    passages: pack.passages.map((p) => ({ verse: p.verse, context: p.context })),
    practice: pack.practice,
    closing: pack.closing,
  };
}

const body = ADVISE
  .replace(/^const \{[^}]+\} = require\('\.\/scripture'\);\n/m, '')
  .replace(/^const \{[^}]+\} = require\('\.\/curated'\);\n/m, '')
  .replace(/^const \{[^}]+\} = require\('\.\/retrieve'\);\n/m, '')
  .replace(/^const \{[^}]+\} = require\('\.\/library'\);\n/m, '')
  .replace(/\nmodule\.exports = \{[^}]+};\n?$/, '\n');

const out = `/* Generated by scripts/bundle-advisor.js — do not edit by hand.
   Same composer as lib/advise.js. Crisis regex is copied from lib/scripture.js. */
(function () {
  const CRISIS = ${CRISIS};

  const THEMES = ${JSON.stringify(slimThemes)};
  const VERSES = ${JSON.stringify(VERSES)};
  const RED = new Set(${JSON.stringify(RED)});

  const BOOK_ALIASES = { matthew: 'Matthew', matt: 'Matthew', mt: 'Matthew', mark: 'Mark', mk: 'Mark', luke: 'Luke', lk: 'Luke', john: 'John', jn: 'John' };
  const REF_RE = /\\b(Matthew|Matt\\.?|Mt\\.?|Mark|Mk\\.?|Luke|Lk\\.?|John|Jn\\.?)\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[–—\\-]\\s*(\\d{1,3}))?/gi;

  function looksLikeCrisis(text) {
    if (!text) return false;
    return CRISIS.test(String(text));
  }

  function parseRef(input) {
    if (!input || typeof input !== 'string') return null;
    REF_RE.lastIndex = 0;
    const m = REF_RE.exec(input.trim());
    if (!m) return null;
    const book = BOOK_ALIASES[m[1].toLowerCase().replace(/\\./g, '')] || null;
    if (!book) return null;
    const chapter = Number(m[2]);
    const start = Number(m[3]);
    const end = m[4] ? Number(m[4]) : start;
    if (!chapter || !start || end < start) return null;
    return { book, chapter, start, end, raw: m[0] };
  }

  function citeOf(book, ch, v) { return book + ' ' + ch + ':' + v; }

  function lookup(ref) {
    const parsed = typeof ref === 'string' ? parseRef(ref) : ref;
    if (!parsed) return null;
    const start = parsed.start;
    const end = parsed.end;
    const citation = start === end
      ? citeOf(parsed.book, parsed.chapter, start)
      : (citeOf(parsed.book, parsed.chapter, start) + '–' + end);
    const cites = [];
    for (let v = start; v <= end; v++) cites.push(citeOf(parsed.book, parsed.chapter, v));
    const red = cites.some((c) => RED.has(c)) || RED.has(citation);
    if (VERSES[citation]) return { citation, text: VERSES[citation], redLetter: true };
    const parts = cites.map((c) => VERSES[c]).filter(Boolean);
    if (parts.length === cites.length) return { citation, text: parts.join(' '), redLetter: true };
    const lib = (typeof window !== 'undefined' && window.RLA_LIBRARY && window.RLA_LIBRARY.sayings) || [];
    const exact = lib.find((s) => s.citation === citation);
    if (exact) return { citation, text: exact.text, redLetter: red || true };
    if (!red) return { citation: parsed.raw || citation, text: '', redLetter: false };
    return { citation, text: parts.join(' '), redLetter: true };
  }

  const STOP = new Set(['the','and','for','you','your','that','this','with','from','have','not','but','are','was','were','been','being','they','them','their','what','when','where','which','who','how','why','can','will','just','about','into','over','after','before','than','then','also','very']);
  function tokens(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').split(/\\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  }

  function loadLibrary() {
    return (typeof window !== 'undefined' && window.RLA_LIBRARY) || { sayings: [], verses: 0 };
  }

${body}
  function fillDevice(text) {
    return String(text || '').replace(/\\{\\{([^}]+)\\}\\}/g, function (_, raw) {
      const hit = lookup(String(raw).replace(/^[\"'“”]+|[\"'“”]+$/g, '').trim());
      if (hit && hit.redLetter && hit.text) return '**' + hit.citation + '**\\n“' + hit.text + '”';
      return '';
    }).replace(/\\n{3,}/g, '\\n\\n');
  }

  window.RLA_advise = function (text, opts) {
    return fillDevice(compose(text, opts || {}));
  };
  window.RLA_classify = classify;
  window.RLA_compose = compose;

${SEVEN}
})();
`;

const dest = path.join(ROOT, 'public/data/advisor.js');
const copy = path.join(ROOT, 'data/advisor.js');
fs.writeFileSync(dest, out);
fs.writeFileSync(copy, out);
console.log('bundled advisor', Buffer.byteLength(out), 'bytes', 'verses', Object.keys(VERSES).length, 'red', RED.length, 'library', loadLibrary().sayings.length);
