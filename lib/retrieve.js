const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Stems match any ending ("worr" -> worrying, "lonel" -> lonely); whole
// words and phrases keep a closing \b.
const NEED_CUES = [
  [/\b(?:anxi|worr|overwhelm|stress|panic)\w*|\btomorrow\b/i, 'Anxiety & Worry'],
  [/\b(?:grie|mourn|funeral|widow)\w*|\b(?:died|death)\b/i, 'Grief & Loss'],
  [/\b(?:forgiv|resent|bitter|trespass)\w*|\bhate them\b/i, 'Forgiveness'],
  [/\b(?:lonel|abandon|orphan)\w*|\b(?:alone|left me)\b/i, 'Loneliness'],
  [/\b(?:fight|conflict|divorc|argu)\w*|\b(?:marriage|enemy|enemies)\b/i, 'Conflict & Relationships'],
  [/\b(?:afraid|fear|scared|terr|frighten)\w*/i, 'Fear'],
  [/\b(?:purpose|direction|calling|what should i do)\b/i, 'Purpose & Direction'],
  [/\b(?:doubt|unbelie)\w*|\b(?:have not seen|faith)\b/i, 'Faith & Doubt'],
  [/\b(?:suffer|sick|ill|tribulation)\w*|\b(?:pain|painful|hurting)\b/i, 'Suffering & Pain'],
  [/\b(?:shame|guilt|ashamed|unworth)\w*/i, 'Shame & Guilt'],
  [/\b(?:peace|calm|still)\b/i, 'Peace'],
  [/\b(?:hope|joy|cheer|future)\w*/i, 'Hope'],
  [/\b(?:lost|no direction|wandering)\b/i, 'Purpose & Direction'],
];

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function guessThemes(query) {
  const hits = [];
  for (const [re, theme] of NEED_CUES) {
    if (re.test(query) && !hits.includes(theme)) hits.push(theme);
  }
  return hits.filter(isKnownTheme);
}

function retrieveSayings(query, { limit = 8 } = {}) {
  const themes = guessThemes(query);
  const qTokens = tokens(query);
  const scored = [];
  for (const saying of loadLibrary().sayings) {
    let score = 0;
    const hay = `${saying.text} ${saying.citation}`.toLowerCase();
    for (const t of qTokens) {
      if (hay.includes(t)) score += t.length > 5 ? 3 : 2;
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
  formatAllowList,
  guessThemes,
  retrieveSayings,
  tokens,
};
