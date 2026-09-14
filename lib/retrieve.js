const { loadLibrary } = require('./library');
const { themesForSaying } = require('./themes');
const { BETRAYED_RE, WOUNDED_RE, ILLNESS_RE, guessThemes } = require('../public/data/rooms.js');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

// `themesOnly`: score by the rooms the question names, never by its own words — the
// list handed to the model must not contain a verse a keyword dragged in.
function retrieveSayings(query, { limit = 8, themesOnly = false } = {}) {
  const themes = guessThemes(query);
  const qTokens = themesOnly ? [] : tokens(query);
  const scored = [];
  for (const saying of loadLibrary().sayings) {
    let score = 0;
    const hay = `${saying.text} ${saying.citation}`.toLowerCase();
    const words = new Set(hay.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/));
    for (const t of qTokens) {
      // Whole words count; a bare prefix hit ("sleep" in "sleepeth") counts a little.
      if (words.has(t)) score += t.length > 5 ? 3 : 2;
      else if (t.length > 4 && hay.includes(t)) score += 1;
    }
    const st = themesForSaying(saying);
    for (const theme of themes) {
      if (st.includes(theme)) score += 10;
    }
    if (score > 0) scored.push({ saying, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const picks = [];
  const seen = new Set();
  for (const row of scored) {
    if (seen.has(row.saying.id)) continue;
    seen.add(row.saying.id);
    picks.push(row.saying);
    if (picks.length >= limit) break;
  }
  if (picks.length < 3) {
    for (const theme of themes) {
      for (const saying of loadLibrary().sayings) {
        if (seen.has(saying.id)) continue;
        if (!themesForSaying(saying).includes(theme)) continue;
        seen.add(saying.id);
        picks.push(saying);
        if (picks.length >= limit) break;
      }
      if (picks.length >= 3) break;
    }
  }
  if (!picks.length) {
    return {
      themes,
      sayings: loadLibrary().sayings.filter((s) => /14:27|11:28|4:39/.test(s.citation)).slice(0, 3),
    };
  }
  return { themes, sayings: picks.slice(0, limit) };
}

function formatAllowList(sayings) {
  return (sayings || [])
    .map((s) => `{{${s.citation}}}`)
    .join('\n');
}

module.exports = {
  BETRAYED_RE,
  ILLNESS_RE,
  WOUNDED_RE,
  formatAllowList,
  guessThemes,
  retrieveSayings,
  tokens,
};
