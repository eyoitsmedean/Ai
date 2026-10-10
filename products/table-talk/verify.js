'use strict';
// Verifies Table Talk content. Exits non-zero on any failure.
const fs = require('fs');
const path = require('path');
const { lookup, parseRef } = require(require('path').join(__dirname, '../..', 'lib/scripture'));
const { meta, suits, instructions, cards } = require('./content');

const SPOKEN = JSON.parse(fs.readFileSync(require('path').join(__dirname, '../..', 'data/spoken-gospels.json'), 'utf8'));
const norm = (s) => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s) => String(s).replace(/…/g, ' ').trim().split(/\s+/).filter(Boolean).length;

const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);

// Verse texts straight from the red-letter corpus for a citation.
function versesFor(citation) {
  const p = parseRef(citation);
  if (!p) return null;
  const ch = SPOKEN.books?.[p.book]?.[String(p.chapter)];
  if (!ch) return null;
  const out = [];
  for (let v = p.start; v <= p.end; v++) if (ch[String(v)]) out.push(ch[String(v)]);
  return out.length ? out : null;
}

// Exported so build.js can re-run it before rendering.
function checkQuote(citation, saying) {
  const verses = versesFor(citation);
  if (!verses) return 'citation is not red-letter in the corpus';
  const lk = lookup(citation);
  if (!lk) return 'lookup() returned null';
  const parts = saying.split(' … ');
  // Parts must appear in reading order: verse index, then offset within it.
  let vi = 0;
  let off = 0;
  const joined = verses.map((v) => ' ' + norm(v) + ' ');
  for (const part of parts) {
    const n = ' ' + norm(part) + ' ';
    if (!n.trim()) return 'empty quotation part';
    let found = false;
    for (let i = vi; i < joined.length; i++) {
      const at = joined[i].indexOf(n, i === vi ? off : 0);
      if (at !== -1) { vi = i; off = at + n.length - 1; found = true; break; }
    }
    if (!found) return `part not found, in order, as a span of one verse: "${part}"`;
  }
  return null;
}

function run() {
  const YESNO = /^(is|are|am|was|were|do|does|did|have|has|had|can|could|will|would|should|shall|may|might|must)\b/i;
  const suitKeys = new Set(suits.map((s) => s.key));
  if (cards.length !== 52) fail('deck', `expected 52 cards, found ${cards.length}`);
  if (instructions.length !== 2) fail('deck', `expected 2 instruction cards, found ${instructions.length}`);
  const cites = new Map();
  const sayings = new Map();
  const perSuit = {};
  const gospelBySuit = {};
  for (const c of cards) {
    const id = c.id || c.citation;
    if (!suitKeys.has(c.suit)) fail(id, `unknown suit ${c.suit}`);
    perSuit[c.suit] = (perSuit[c.suit] || 0) + 1;
    const book = parseRef(c.citation)?.book;
    (gospelBySuit[c.suit] ||= new Set()).add(book);
    if (cites.has(c.citation)) fail(id, `duplicate citation ${c.citation} (also ${cites.get(c.citation)})`);
    cites.set(c.citation, id);
    const ns = norm(c.saying);
    if (sayings.has(ns)) fail(id, `duplicate saying text (also ${sayings.get(ns)})`);
    sayings.set(ns, id);
    const qerr = checkQuote(c.citation, c.saying);
    if (qerr) fail(id, `${c.citation}: ${qerr}`);
    // A few corpus verses keep narration around his words (e.g. Mark 9:35).
    if (/\b(jesus|saith unto (them|him|her)|said unto (them|him|her)|and he said)\b/i.test(c.saying)) fail(id, 'saying appears to include narration');
    if (words(c.saying) > 30) fail(id, `saying has ${words(c.saying)} words (max 30)`);
    const q = c.question;
    if (!q.trim().endsWith('?')) fail(id, 'question must end with "?"');
    if (words(q) >= 22) fail(id, `question has ${words(q)} words (must be under 22)`);
    if (YESNO.test(q.trim())) fail(id, `question reads as yes/no: "${q}"`);
    if ((q.match(/\?/g) || []).length !== 1) fail(id, 'question should contain exactly one "?"');
  }
  for (const s of suits) {
    if (perSuit[s.key] !== 13) fail(s.key, `expected 13 cards, found ${perSuit[s.key] || 0}`);
    const g = gospelBySuit[s.key] || new Set();
    for (const b of ['Matthew', 'Mark', 'Luke', 'John']) if (!g.has(b)) fail(s.key, `no saying from ${b}`);
  }
  // Copy hygiene: no em dashes anywhere in the content.
  const allCopy = JSON.stringify({ meta, suits, instructions, cards });
  if (/—/.test(allCopy)) fail('copy', 'contains an em dash');

  const byBook = {};
  for (const c of cards) { const b = parseRef(c.citation).book; byBook[b] = (byBook[b] || 0) + 1; }
  return { errors, byBook };
}

module.exports = { checkQuote, run };

if (require.main === module) {
  const { errors: errs, byBook } = run();
  console.log(`Table Talk verify: ${cards.length} cards, ${new Set(cards.map((c) => c.citation)).size} unique citations, ${instructions.length} instruction cards`);
  console.log('By Gospel:', JSON.stringify(byBook));
  const longest = cards.reduce((a, c) => (words(c.saying) > words(a.saying) ? c : a));
  const longestQ = cards.reduce((a, c) => (words(c.question) > words(a.question) ? c : a));
  console.log(`Longest saying: ${words(longest.saying)} words (${longest.citation}); longest question: ${words(longestQ.question)} words (${longestQ.id})`);
  if (errs.length) {
    console.error(`FAIL (${errs.length}):\n  ` + errs.join('\n  '));
    process.exit(1);
  }
  console.log('PASS: all quotations match the red-letter corpus; all content rules hold.');
}
