#!/usr/bin/env node
/**
 * Serve the Ninety Days playbook (plans/) on the local network so it opens on a phone.
 * Usage: npm run plans   →  http://<this machine>:3010
 * No dependencies. Serves only files inside plans/. Not for the public internet.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..', 'plans');
const PORT = Number(process.env.PLANS_PORT || 3010);
const TYPES = { '.html': 'text/html; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not here.');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log(`Ninety Days · serving ${ROOT}`);
  console.log(`  this machine  http://localhost:${PORT}`);
  lan.forEach(ip => console.log(`  your phone    http://${ip}:${PORT}   (same Wi-Fi)`));
  console.log('Everything you tick or log stays in that browser. Ctrl-C to stop.');
});
