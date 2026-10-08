#!/usr/bin/env node
/**
 * Build the live Advisor page (live/red-letter-advisor.html), published as a
 * claude.ai artifact with the `sample` capability: Claude writes each letter
 * on the viewer's own Claude account, no API key or server needed.
 *
 * The page embeds the app's own browser files unchanged (crisis rules,
 * curated passages, offline composer) plus the library and help notices, so
 * rebuild it whenever any of those change:  npm run build:live
 */
const fs = require('fs');
const path = require('path');
const { loadLibrary } = require('../lib/library');
const { themesForSaying } = require('../lib/themes');
const { themeNames } = require('../lib/curated');
const { crisisNotice } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const esc = (s) => s.replace(/<\/(script)/gi, '<\\/$1');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const names = themeNames();
const data = {
  themes: names,
  sayings: loadLibrary().sayings.map((s) => [s.citation, s.text, themesForSaying(s).map((t) => names.indexOf(t)).filter((i) => i >= 0)]),
  notices: Object.fromEntries(['self:en', 'other:en', 'danger:en', 'assault:en', 'self:es', 'danger:es', 'assault:es']
    .map((k) => { const [kind, lang] = k.split(':'); return [k, crisisNotice({ kind, lang }).trim()]; })),
};

let html = read('live/advisor.template.html');
for (const [marker, file] of Object.entries({
  __CRISIS__: 'public/data/crisis.js',
  __CURATED__: 'public/data/curated.js',
  __ADVISOR__: 'public/data/advisor.js',
})) html = html.split(marker).join(esc(read(file)));
html = html.replace('__DATA__', esc(JSON.stringify(data)));

const out = path.join(ROOT, 'live', 'red-letter-advisor.html');
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(ROOT, out)} (${Math.round(html.length / 1024)} KB)`);
