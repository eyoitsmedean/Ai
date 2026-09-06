#!/usr/bin/env node
/**
 * Build the web layer for a native shell (Capacitor) or a static host that talks to a separate API.
 *
 *   node scripts/build-shell.js https://api.example.org        # writes dist-shell/
 *
 * Copies public/ verbatim and sets <meta name="rla-api-base"> so every /api call goes to the named host.
 * The source tree is never edited; dist-shell/ is gitignored and is what capacitor.config.json points at.
 * The same host must list the shell's origin in RLA_ALLOWED_ORIGINS (capacitor://localhost on iOS,
 * https://localhost on Android) or the browser will refuse the cross-origin call.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'dist-shell');
const apiBase = String(process.argv[2] || '').replace(/\/$/, '');

if (!/^https:\/\/[^/\s]+$/.test(apiBase) && apiBase !== 'http://localhost:3000' && !/^http:\/\/(127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+):\d+$/.test(apiBase)) {
  console.error('Usage: node scripts/build-shell.js https://api.host   (https, or a LAN address for a device on your network)');
  process.exit(2);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });

const indexPath = path.join(OUT, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const marker = '<meta name="rla-api-base" content="" />';
if (!html.includes(marker)) {
  console.error('public/index.html has no rla-api-base meta tag; refusing to guess.');
  process.exit(1);
}
fs.writeFileSync(indexPath, html.replace(marker, `<meta name="rla-api-base" content="${apiBase}" />`));

console.log(`dist-shell/ written · /api → ${apiBase} · ${fs.readdirSync(OUT).length} entries`);
