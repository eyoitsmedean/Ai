#!/usr/bin/env node
'use strict';
// Checks the built files in dist/: file set, PNG pixel sizes and DPI, PDF page count and page size.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { cards, instructions } = require('./content');

const DIST = path.join(__dirname, 'dist');
const POD = path.join(DIST, 'pod');
const problems = [];
const bad = (m) => problems.push(m);

// --- PNGs
function pngInfo(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  const info = { w: b.readUInt32BE(16), h: b.readUInt32BE(20), dpi: null };
  let p = 8;
  while (p < b.length) {
    const len = b.readUInt32BE(p); const type = b.toString('ascii', p + 4, p + 8);
    if (type === 'pHYs') { const ppm = b.readUInt32BE(p + 8); info.dpi = Math.round(ppm * 0.0254); }
    if (type === 'IDAT') break;
    p += 12 + len;
  }
  return info;
}
const expectedFaces = instructions.length + cards.length;
const pngs = fs.existsSync(POD) ? fs.readdirSync(POD).filter((f) => f.endsWith('.png')) : [];
const faces = pngs.filter((f) => f !== 'back.png');
if (faces.length !== expectedFaces) bad(`expected ${expectedFaces} face PNGs, found ${faces.length}`);
if (!pngs.includes('back.png')) bad('missing pod/back.png');
for (const c of cards) if (!faces.some((f) => f.endsWith(`-${c.id}.png`))) bad(`missing PNG for ${c.id}`);
const sizes = {};
for (const f of pngs) {
  const i = pngInfo(path.join(POD, f));
  if (!i) { bad(`${f} is not a PNG`); continue; }
  const k = `${i.w}x${i.h}@${i.dpi}dpi`;
  sizes[k] = (sizes[k] || 0) + 1;
  if (i.w !== 825 || i.h !== 1125 || i.dpi !== 300) bad(`${f} is ${i.w}x${i.h}, at ${i.dpi} dpi, expected 825x1125 at 300 dpi`);
}

// --- PDFs (Chromium writes compressed object streams, so inflate them to count pages)
function pdfPages(file) {
  const b = fs.readFileSync(file);
  const raw = b.toString('latin1');
  let text = raw;
  const re = /stream\r?\n/g; let m;
  while ((m = re.exec(raw))) {
    const start = m.index + m[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) break;
    try { text += zlib.inflateSync(b.subarray(start, end)).toString('latin1'); } catch { /* not deflate */ }
    re.lastIndex = end;
  }
  const pages = (text.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/g)].map((x) => `${(+x[1]).toFixed(1)}x${(+x[2]).toFixed(1)}`);
  return { pages, boxes: [...new Set(boxes)] };
}
const sheets = Math.ceil(expectedFaces / 9) * 2;
const pdfs = { 'table-talk-print-and-cut-letter.pdf': '612.0x792.0', 'table-talk-print-and-cut-a4.pdf': '595.3x841.9' };
const pdfReport = {};
for (const [name, box] of Object.entries(pdfs)) {
  const f = path.join(DIST, name);
  if (!fs.existsSync(f)) { bad(`missing ${name}`); continue; }
  const r = pdfPages(f);
  pdfReport[name] = { ...r, kb: Math.round(fs.statSync(f).size / 1024) };
  if (r.pages !== sheets) bad(`${name}: ${r.pages} pages, expected ${sheets}`);
  if (!r.boxes.every((x) => Math.abs(+x.split('x')[0] - +box.split('x')[0]) < 1 && Math.abs(+x.split('x')[1] - +box.split('x')[1]) < 1)) bad(`${name}: page size ${r.boxes} expected ${box}`);
}

console.log('PNG sizes:', JSON.stringify(sizes));
console.log('PDFs:', JSON.stringify(pdfReport));
if (problems.length) { console.error('FAIL\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`PASS: ${faces.length} faces + back.png at 825x1125; ${Object.keys(pdfs).length} PDFs with ${sheets} pages each`);
