const fs = require('fs');
const path = require('path');

const LIBRARY_PATH = path.join(__dirname, '..', 'public', 'library.json');
let _lib = null;

function loadLibrary() {
  if (_lib) return _lib;
  _lib = JSON.parse(fs.readFileSync(LIBRARY_PATH, 'utf8'));
  return _lib;
}

const { isKnownTheme, themesForSaying } = require('./themes');

function searchLibrary({ book = '', q = '', theme = '', limit = 60, offset = 0 } = {}) {
  const all = loadLibrary().sayings;
  const query = String(q || '').trim().toLowerCase();
  const wanted = String(book || '').trim();
  const room = isKnownTheme(theme) ? theme : '';
  let rows = all;
  if (wanted && wanted !== 'All') rows = rows.filter((s) => s.book === wanted);
  if (room) rows = rows.filter((s) => themesForSaying(s).includes(room));
  if (query) {
    rows = rows.filter((s) => (
      s.text.toLowerCase().includes(query) ||
      s.citation.toLowerCase().includes(query)
    ));
  }
  const start = Math.max(0, Number(offset) || 0);
  const take = Math.min(120, Math.max(1, Number(limit) || 60));
  return {
    total: rows.length,
    verses: loadLibrary().verses,
    sayings: rows.slice(start, start + take),
  };
}

function verseCount() {
  return loadLibrary().verses || 0;
}

function sayingCount() {
  return (loadLibrary().sayings || []).length;
}

module.exports = { loadLibrary, searchLibrary, verseCount, sayingCount };
