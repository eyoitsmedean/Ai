#!/usr/bin/env node
/**
 * Verify every corpus passage against the World English Bible source text.
 *
 * Source: bible-api.com (?translation=web). Each passage must appear verbatim
 * (after punctuation/whitespace normalization) inside the WEB text of its
 * reference. Narrator framing such as "Jesus said," may be omitted from the
 * corpus, so containment — not equality — is the test.
 *
 * Usage: node scripts/verify-corpus.js [--json] [--only=id1,id2]
 *        node scripts/verify-corpus.js --fix   # rewrite drifted quotes to exact WEB wording
 * Exit 1 if any passage fails.
 */
const corpus = require('../data/red-letters');

const JSON_OUT = process.argv.includes('--json');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);

function norm(s) {
  return String(s || '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}
function loose(s) {
  return norm(s).toLowerCase().replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
}

const MAX_ATTEMPTS = 7;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWeb(ref, attempt = 0) {
  const url = 'https://bible-api.com/' + encodeURIComponent(ref.replace(/[–—]/g, '-')) + '?translation=web';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await res.text();
    let data = null;
    try { data = JSON.parse(body); } catch (_) {}
    // bible-api rate-limits with a 200 "Retry later" text body as well as 429s.
    if (res.status === 429 || !data || /retry later/i.test(body)) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(30000, 2000 * 2 ** attempt));
        return fetchWeb(ref, attempt + 1);
      }
      return null;
    }
    if (!res.ok || data.error) return null;
    // Whitespace-normalize only; keep WEB's typographic quotes for alignment output.
    return { text: String(data.text || '').replace(/\s+/g, ' ').trim(), verses: data.verses || [] };
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      await sleep(Math.min(30000, 1500 * 2 ** attempt));
      return fetchWeb(ref, attempt + 1);
    }
    return null;
  }
}

function firstDivergence(a, b) {
  const A = loose(a).split(' ');
  const B = loose(b).split(' ');
  for (let i = 0; i < Math.min(A.length, B.length); i++) {
    if (A[i] !== B[i]) return { at: i, corpus: A.slice(Math.max(0, i - 4), i + 6).join(' '), web: B.slice(Math.max(0, i - 4), i + 6).join(' ') };
  }
  return null;
}

/** Scripture the client ships inline (offline fallbacks, examen, parables). */
function clientInlinePassages() {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const out = [];
  const objRe = /\{[^{}]*?verse:\s*'([^']+)'[^{}]*?text:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;
  let m;
  while ((m = objRe.exec(html))) {
    const text = (m[2] ?? m[3] ?? '').replace(/\\(['"])/g, '$1');
    out.push({ id: 'client:' + m[1].replace(/\s+/g, '') + '@' + html.slice(0, m.index).split('\n').length, ref: m[1], text });
  }
  return out;
}

const webCache = new Map();
async function fetchWebCached(ref) {
  const k = ref.replace(/[–—]/g, '-').toLowerCase();
  if (!webCache.has(k)) {
    webCache.set(k, await fetchWeb(ref));
    await sleep(Number(process.env.VERIFY_DELAY_MS || 2100));
  }
  return webCache.get(k);
}

async function verifyOne(id, ref, text) {
  const web = await fetchWebCached(ref);
  if (!web) return { id, ref, status: 'unavailable' };
  // Abridged quotes use an ellipsis; each segment must itself be verbatim WEB.
  const segments = norm(text).split(/…|\.\.\./).map((s) => s.trim()).filter(Boolean);
  let status = 'verbatim';
  let entry = { id, ref, status, webLength: web.text.length, corpusLength: norm(text).length, segments: segments.length };
  // Outer double quotes are typography (WEB re-opens “ at each paragraph), not wording.
  const dq = (s) => s.replace(/"/g, '');
  for (const seg of segments) {
    const exact = dq(norm(web.text)).includes(dq(seg));
    const looseHit = loose(web.text).includes(loose(seg));
    const s = exact ? 'verbatim' : looseHit ? 'verbatim-loose' : 'MISMATCH';
    if (s === 'MISMATCH' || (s === 'verbatim-loose' && status === 'verbatim')) status = s;
    if (!exact) {
      const lw = loose(web.text);
      const lc = loose(seg);
      const idx = lw.indexOf(lc.split(' ').slice(0, 5).join(' '));
      entry.divergence = firstDivergence(lc, idx >= 0 ? lw.slice(idx) : lw) || { corpus: lc.slice(0, 80), web: lw.slice(0, 80) };
      entry.web = web.text;
    }
  }
  entry.status = status;
  return entry;
}

/**
 * Align a (possibly drifted) quote to the exact WEB wording covering the same span.
 * Word-level: find the first 3 and last 3 loose tokens of the quote inside WEB tokens,
 * return the original WEB tokens between them with their punctuation intact.
 */
function alignToWeb(text, webText) {
  // Keep WEB's typographic quotes: they never collide with JS string delimiters.
  const webTokens = String(webText).replace(/\s+/g, ' ').trim().split(' ');
  const webLoose = webTokens.map((t) => loose(t));
  const segs = norm(text).split(/…|\.\.\./).map((s) => s.trim()).filter(Boolean);
  const outSegs = [];
  for (const seg of segs) {
    const q = loose(seg).split(' ').filter(Boolean);
    if (q.length < 3) return null;
    const head = q.slice(0, 3);
    const tail = q.slice(-3);
    let start = -1;
    for (let i = 0; i <= webLoose.length - 3; i++) {
      if (webLoose[i] === head[0] && webLoose[i + 1] === head[1] && webLoose[i + 2] === head[2]) { start = i; break; }
    }
    if (start < 0) return null;
    let end = -1;
    for (let i = start + q.length - 6; i < webLoose.length - 2; i++) {
      if (i < start) continue;
      if (webLoose[i] === tail[0] && webLoose[i + 1] === tail[1] && webLoose[i + 2] === tail[2]) { end = i + 2; break; }
    }
    if (end < 0) return null;
    let slice = webTokens.slice(start, end + 1).join(' ');
    // WEB re-opens “ at each paragraph of a continuing speech and closes ” only at the end.
    // Inside a red-letter excerpt those outer marks are typography, not wording: drop
    // unbalanced outer double quotes (leading, trailing, and paragraph re-openers).
    const opens = (slice.match(/“/g) || []).length;
    const closes = (slice.match(/”/g) || []).length;
    if (opens !== closes || /^“/.test(slice)) {
      slice = slice.replace(/^“/, '').replace(/”$/, '').replace(/([.!?;])\s+“/g, '$1 ').replace(/([.!?])”(\s|$)/g, '$1$2');
    }
    // A slice that stops mid-sentence should not end on a comma or semicolon.
    slice = slice.replace(/[,;:]$/, '');
    outSegs.push(slice.trim());
  }
  const joined = outSegs.join('… ');
  if (/["']/.test(joined)) throw new Error('straight quote in WEB slice; refusing to write: ' + joined.slice(0, 60));
  return joined;
}

async function fixAll() {
  const fs = require('fs');
  const path = require('path');
  const changes = [];
  const rlPath = path.join(__dirname, '..', 'data', 'red-letters.js');
  let rl = fs.readFileSync(rlPath, 'utf8');
  for (const p of corpus.passages) {
    const web = await fetchWebCached(corpus.cite(p));
    if (!web) { changes.push({ id: p.id, status: 'unavailable' }); continue; }
    if (norm(web.text).includes(norm(p.text))) continue;
    const fixed = alignToWeb(p.text, web.text);
    if (!fixed) { changes.push({ id: p.id, status: 'could-not-align' }); continue; }
    const literal = JSON.stringify(p.text);
    const before = rl;
    rl = rl.replace('text: ' + literal, 'text: ' + JSON.stringify(fixed));
    if (rl === before) {
      // Source may use a different literal form; fall back to raw text replacement.
      rl = rl.split(p.text).join(fixed);
    }
    changes.push({ id: p.id, status: before === rl ? 'not-found-in-file' : 'fixed', old: p.text, new: fixed });
  }
  fs.writeFileSync(rlPath, rl);

  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  for (const c of clientInlinePassages()) {
    const web = await fetchWebCached(c.ref);
    if (!web || norm(web.text).includes(norm(c.text))) continue;
    const fixed = alignToWeb(c.text, web.text);
    if (!fixed) { changes.push({ id: c.id, status: 'could-not-align' }); continue; }
    const before = html;
    // Client literals may be single- or double-quoted; replace the inner text only.
    html = html.split(c.text).join(fixed).split(c.text.replace(/'/g, "\\'")).join(fixed);
    changes.push({ id: c.id, status: before === html ? 'not-found-in-file' : 'fixed', old: c.text, new: fixed });
  }
  fs.writeFileSync(htmlPath, html);
  for (const ch of changes) {
    console.log(ch.status.padEnd(18), ch.id);
    if (ch.old) console.log('   - ' + ch.old + '\n   + ' + ch.new);
  }
  console.log('\n' + changes.filter((c) => c.status === 'fixed').length + ' passages rewritten to exact WEB wording');
}

async function main() {
  if (process.argv.includes('--fix')) return fixAll();
  const passages = corpus.passages.filter((p) => !ONLY.length || ONLY.includes(p.id));
  const results = [];
  for (const p of passages) results.push(await verifyOne(p.id, corpus.cite(p), p.text));
  if (!ONLY.length) {
    for (const c of clientInlinePassages()) results.push(await verifyOne(c.id, c.ref, c.text));
  }

  const failed = results.filter((r) => r.status === 'MISMATCH' || r.status === 'unavailable');
  if (JSON_OUT) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      const mark = r.status === 'verbatim' ? '✓' : r.status === 'verbatim-loose' ? '~' : '✗';
      console.log(mark, r.id.padEnd(28), r.ref.padEnd(20), r.status);
      if (r.divergence) console.log('    corpus:', r.divergence.corpus, '\n    web:   ', r.divergence.web);
      if (r.status === 'MISMATCH' && !r.divergence) console.log('    web:', r.web.slice(0, 200));
    }
    console.log('\n' + (results.length - failed.length) + '/' + results.length + ' passages verified against WEB' + (failed.length ? '; ' + failed.length + ' need attention' : ''));
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
