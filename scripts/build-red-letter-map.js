#!/usr/bin/env node
/**
 * Derive a named, reproducible red-letter map from two public-domain editions:
 *   primary  — eBible.org King James Version OSIS  (`<q who="Jesus">`)
 *   witness  — eBible.org World English Bible USFX (`<wj>`)
 *
 * The committed product still uses data/red-letter-source.json. This script
 * writes data/red-letter-ebible-kjv.json alongside it. It never overwrites
 * the production map, the spoken corpus, or the library.
 *
 *   node scripts/build-red-letter-map.js --from DIR
 *   node scripts/build-red-letter-map.js            # fetch both sources
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'red-letter-ebible-kjv.json');
const GOSPELS = { Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John' };
const WEB_BOOKS = { MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John' };

const PRIMARY = {
  edition: 'King James Version, 1769 standardized text',
  format: 'OSIS',
  publisherElectronic: 'eBible.org',
  rights: 'public domain',
  url: 'https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-kjv.osis.xml',
  mirrorCommit: '7768dacf2653164dd036d14a2d3f877d925015d3',
  mirrorDate: '2015-05-07',
  sourceRevision: '2013.07.12',
  sha256: 'eeeae647fc28360ce47f9c0d5cc3b397b7fdd9913fe53dc9f44eb6deee50e253',
  markup: '<q who="Jesus">',
};

const WITNESS = {
  edition: 'World English Bible',
  format: 'USFX',
  publisherElectronic: 'eBible.org',
  rights: 'public domain',
  url: 'https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml',
  mirrorCommit: '7768dacf2653164dd036d14a2d3f877d925015d3',
  mirrorDate: '2015-05-07',
  sha256: '5ffa2626f170a109a4a96afc90775c06f0821cb4ba81ed34e63663e085708d68',
  markup: '<wj>',
};

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function clean(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseOsis(xml) {
  const start = xml.indexOf('<div type="book" osisID="Matt"');
  const end = xml.indexOf('<div type="book" osisID="Acts"');
  if (start < 0 || end < 0) throw new Error('OSIS file has no Matthew–Acts book range');
  const g = xml.slice(start, end);
  const out = {};
  let verse = null;
  let inJesus = false;
  let inTitle = false;
  for (const t of g.split(/(<[^>]+>)/)) {
    if (!t) continue;
    if (t[0] === '<') {
      let m;
      if ((m = t.match(/^<verse osisID="([A-Za-z]+)\.(\d+)\.(\d+)"/))) {
        verse = `${GOSPELS[m[1]]} ${m[2]}:${m[3]}`;
        if (!verse.startsWith('undefined')) out[verse] = out[verse] || { full: '', spans: [] };
        if (inJesus && out[verse] && !out[verse].spans.length) out[verse].spans.push('');
      } else if (/^<verse eID=/.test(t)) {
        verse = null;
      } else if (/^<q who="Jesus"[^>]*sID=/.test(t)) {
        inJesus = true;
        if (verse) out[verse].spans.push('');
      } else if (/^<q [^>]*eID=/.test(t)) {
        inJesus = false;
      } else if (/^<title/.test(t)) inTitle = true;
      else if (/^<\/title/.test(t)) inTitle = false;
      continue;
    }
    if (inTitle || !verse || !out[verse]) continue;
    out[verse].full += t;
    if (inJesus) {
      if (!out[verse].spans.length) out[verse].spans.push('');
      out[verse].spans[out[verse].spans.length - 1] += t;
    }
  }
  const map = {};
  for (const [k, v] of Object.entries(out)) {
    const full = clean(v.full);
    const spans = v.spans.map(clean).filter(Boolean);
    if (!spans.length) continue;
    const joined = spans.join(' ');
    map[k] = joined === full ? 'full' : joined;
  }
  return map;
}

function parseWeb(xml) {
  const out = {};
  for (const [id, name] of Object.entries(WEB_BOOKS)) {
    const s = xml.indexOf(`<book id="${id}">`);
    if (s < 0) throw new Error(`WEB USFX has no book ${id}`);
    const e = xml.indexOf('<book id=', s + 10);
    const body = xml.slice(s, e < 0 ? undefined : e);
    let ch = 0;
    let vs = 0;
    let inWj = false;
    let inNote = false;
    for (const t of body.split(/(<[^>]+>)/)) {
      if (!t) continue;
      if (t[0] === '<') {
        let m;
        if ((m = t.match(/^<c id="(\d+)"/))) ch = Number(m[1]);
        else if ((m = t.match(/^<v id="(\d+)"/))) vs = Number(m[1]);
        else if (/^<ve\b/.test(t)) vs = 0;
        else if (/^<wj>/.test(t)) inWj = true;
        else if (/^<\/wj>/.test(t)) inWj = false;
        else if (/^<f\b/.test(t) || /^<x\b/.test(t)) inNote = true;
        else if (/^<\/f>/.test(t) || /^<\/x>/.test(t)) inNote = false;
        continue;
      }
      if (inNote || !ch || !vs) continue;
      const key = `${name} ${ch}:${vs}`;
      out[key] = out[key] || { full: '', spoken: '' };
      out[key].full += t;
      if (inWj) out[key].spoken += t;
    }
  }
  const map = {};
  for (const [k, v] of Object.entries(out)) {
    if (!clean(v.spoken)) continue;
    map[k] = true;
  }
  return map;
}

async function load(url, local, expected) {
  let buf;
  if (local && fs.existsSync(local)) buf = fs.readFileSync(local);
  else {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }
  const hash = sha256(buf);
  if (hash !== expected) throw new Error(`hash mismatch for ${url}: got ${hash}`);
  return buf.toString('utf8');
}

async function main() {
  const fromIdx = process.argv.indexOf('--from');
  const dir = fromIdx !== -1 ? process.argv[fromIdx + 1] : '';
  const osisXml = await load(PRIMARY.url, dir && path.join(dir, 'eng-kjv.osis.xml'), PRIMARY.sha256);
  const webXml = await load(WITNESS.url, dir && path.join(dir, 'eng-web.usfx.xml'), WITNESS.sha256);

  const verses = parseOsis(osisXml);
  const web = parseWeb(webXml);
  const osisOnly = Object.keys(verses).filter((k) => !web[k]).sort();
  const webOnly = Object.keys(web).filter((k) => !verses[k]).sort();
  const per = {};
  let full = 0;
  for (const [k, v] of Object.entries(verses)) {
    per[k.split(' ')[0]] = (per[k.split(' ')[0]] || 0) + 1;
    if (v === 'full') full += 1;
  }

  const out = {
    description: 'Red-letter spans from the eBible.org King James Version OSIS (1769), Gospels only. A WEB USFX witness records which verses a second public-domain edition also marks as His speech. This file is a named source, not the production map.',
    note: "For verses where the OSIS marks the entire verse as His, the value is 'full'. For partial verses, the exact spoken span is given. Production continues to use data/red-letter-source.json until Dean authorizes a swap.",
    translation: 'KJV',
    provenance: {
      primary: PRIMARY,
      witness: WITNESS,
      built: '2026-09-07',
    },
    counts: {
      Matthew: per.Matthew,
      Mark: per.Mark,
      Luke: per.Luke,
      John: per.John,
      total: Object.keys(verses).length,
      full,
      partial: Object.keys(verses).length - full,
      webAgrees: Object.keys(verses).length - osisOnly.length,
      osisOnly: osisOnly.length,
      webOnly: webOnly.length,
    },
    osisOnly,
    webOnly,
    verses,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
  console.log(
    'red-letter-ebible-kjv.json',
    out.counts.total,
    'verses · WEB agrees',
    out.counts.webAgrees,
    '· OSIS-only',
    osisOnly.length,
    '· WEB-only',
    webOnly.length,
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
