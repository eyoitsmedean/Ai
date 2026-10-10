#!/usr/bin/env node
'use strict';
// Re-checks a finished build without rendering: quotations, every expected file,
// JPEG pixel size and 300 dpi header, PDF page counts. Exits 1 on any problem.
const fs = require('fs');
const path = require('path');
require('./verify').run({ quiet: true });
const { designs, ratios, DPI } = require('./designs');

const DIST = path.join(__dirname, 'dist');
const problems = [];
function jpegInfo(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let dpi = null;
  if (buf.readUInt16BE(2) === 0xffe0 && buf.toString('ascii', 6, 10) === 'JFIF') dpi = buf[13] === 1 ? buf.readUInt16BE(14) : null;
  for (let i = 2; i < buf.length;) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5), dpi };
    i += 2 + len;
  }
  return null;
}
let n = 0;
for (const d of designs) for (const r of ratios) {
  const f = path.join(DIST, d.slug, `design-${String(d.n).padStart(2, '0')}-${d.slug}-${r.key}.jpg`);
  if (!fs.existsSync(f)) { problems.push(`missing ${path.relative(DIST, f)}`); continue; }
  const info = jpegInfo(fs.readFileSync(f));
  if (!info) problems.push(`unreadable ${f}`);
  else if (info.w !== r.px[0] || info.h !== r.px[1] || info.dpi !== DPI) problems.push(`${path.basename(f)}: ${info.w}x${info.h} @${info.dpi}dpi, expected ${r.px.join('x')} @${DPI}`);
  else n++;
}
for (const [f, pages] of [['all-designs-preview.pdf', 1], ['size-guide.pdf', 2]]) {
  const p = path.join(DIST, f);
  if (!fs.existsSync(p)) { problems.push(`missing ${f}`); continue; }
  const got = (fs.readFileSync(p, 'latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
  if (got !== pages) problems.push(`${f}: ${got} pages, expected ${pages}`);
}
const extra = fs.readdirSync(DIST, { recursive: true }).filter((f) => /\.(jpg|png|pdf)$/.test(f)).length - designs.length * ratios.length - 2;
if (extra) problems.push(`${extra} unexpected file(s) in dist`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK ${n} masters at exact pixel size and ${DPI} dpi; contact sheet 1 page; size guide 2 pages`);
