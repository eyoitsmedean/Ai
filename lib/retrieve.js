const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
  'say', 'said', 'know', 'like', 'feel', 'felt', 'really', 'something',
  'anything', 'going', 'because', 'would', 'could', 'should', 'want', 'need',
  'make', 'made', 'thing', 'things', 'even', 'much', 'more', 'some', 'dont',
  'did', 'does', "don't", 'cant', "can't", 'please', 'help',
]);

const NEED_CUES = [
  [/\b(anxi|worr|overwhelm|stress|tomorrow|panic|restless)\b/i, 'Anxiety & Worry'],
  [/\b(weary|exhausted|tired|heavy laden|burn(?:ed|t)? ?out)\b/i, 'Anxiety & Worry'],
  [/\b(grief|mourn|died|death|funeral|widow|passed away)\b/i, 'Grief & Loss'],
  [/\b(forgiv|resent|bitter|hate them|trespass|grudge)\b/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan|left me|isolated)\b/i, 'Loneliness'],
  [/\b(fight|conflict|marriage|husband|wife|spouse|divorce|enemy|argue|hate him|hate her)\b/i, 'Conflict & Relationships'],
  [/\b(afraid|fear|scared|terror|frightened|dread)\b/i, 'Fear'],
  [/\b(purpose|direction|calling|what should i do|lost my way)\b/i, 'Purpose & Direction'],
  [/\b(doubt|unbelief|have not seen|faith)\b/i, 'Faith & Doubt'],
  [/\b(pain|suffer|sick|illness|tribulation)\b/i, 'Suffering & Pain'],
  [/\b(shame|guilt|ashamed|unworthy|condemn)\b/i, 'Shame & Guilt'],
  [/\b(peace|calm|still)\b/i, 'Peace'],
  [/\b(hope|joy|cheer|future)\b/i, 'Hope'],
  [/\b(lost|no direction|wandering)\b/i, 'Purpose & Direction'],
];

const COMFORT_RE = /14:27|11:28|4:39/;

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function guessThemes(query) {
  const hits = [];
  for (const [re, theme] of NEED_CUES) {
    if (re.test(query) && !hits.includes(theme)) hits.push(theme);
  }
  return hits.filter(isKnownTheme);
}

function comfortSayings(limit = 3) {
  return loadLibrary().sayings.filter((s) => COMFORT_RE.test(s.citation)).slice(0, limit);
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
    const floor = themes.length ? 8 : 6;
    if (score >= floor) scored.push({ saying, score });
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
    return { themes, sayings: comfortSayings(3) };
  }
  return { themes, sayings: picks.slice(0, limit) };
}

function formatAllowList(sayings) {
  return (sayings || [])
    .map((s) => {
      const preview = String(s.text || '').replace(/\s+/g, ' ').slice(0, 72);
      return `{{${s.citation}}}${preview ? ` — ${preview}` : ''}`;
    })
    .join('\n');
}

module.exports = {
  COMFORT_RE,
  formatAllowList,
  guessThemes,
  retrieveSayings,
  tokens,
};
