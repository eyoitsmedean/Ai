const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { lookup, parseAllRefs } = require('../lib/scripture');

// The page shows these offline, where nothing verifies them at run time.
// Every quote must be made of exact KJV phrases from the cited verses;
// "…" may join two phrases, never stand in for changed words.
global.window = global.window || {};
require('../public/data/curated.js');
require('../public/data/paths.js');

const squash = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function quotes(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) { obj.forEach((o) => quotes(o, out)); return out; }
  const cite = obj.verse || obj.citation;
  const quote = obj.quote || obj.passage;
  if (typeof cite === 'string' && typeof quote === 'string' && parseAllRefs(cite).length) out.push([cite, quote]);
  Object.values(obj).forEach((o) => quotes(o, out));
  return out;
}

const SOURCES = {
  'public/curated.json': JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'curated.json'), 'utf8')),
  'public/data/curated.js': window.RLA_CURATED,
  'public/data/paths.js': window.RLA_FORTY,
};

describe('curated quotes are exact KJV', () => {
  for (const [name, data] of Object.entries(SOURCES)) {
    if (!data) continue;
    it(name, () => {
      const bad = [];
      for (const [cite, quote] of quotes(data)) {
        const full = squash(lookup(cite)?.full || '');
        for (const part of quote.split('…')) {
          if (squash(part) && !full.includes(squash(part))) bad.push(`${cite}: "${part.trim()}"`);
        }
      }
      assert.deepEqual(bad, []);
    });
  }
});
