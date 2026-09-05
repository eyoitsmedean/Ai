const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme, sayingTouchesCitation } = require('./themes');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Ordered by gravity: when a message names several needs, the heavier one is answered first.
// Stems are word-initial ("anxi" hears anxious and anxiety) and bounded where a stem would
// otherwise hear ordinary words (pain but not painting, still only as "be still").
const NEED_CUES = [
  [/\b(grie[fv]|mourn|died|death\b|dying|funeral|widow|passed away|miss (him|her|them))/i, 'Grief & Loss'],
  [/\b(afraid|fear(?!less)|scared|terror|terrif|frighten|dread(?!lock))/i, 'Fear'],
  [/\b(shame(?!less)|guilt(?!y pleasure)|ashamed|unworthy|disgust|messed up|sin(ned|ner|ning|s)?\b|failure)/i, 'Shame & Guilt'],
  [/\b(forgiv|resent|bitter(?!sweet)|grudg|hate (him|her|them|myself)|let it go|let go of)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan\b|left me|no one|nobody|isolat|unseen\b)/i, 'Loneliness'],
  [/\b(pain(?!t)|suffer|sick(?!le)|illness|tribulation|hurt(s|ing)?\b|chronic\b|diagnos|cancer)/i, 'Suffering & Pain'],
  [/\b(doubt(?!less)|unbelief|have not seen|faith\b|is god (even |really )?(there|real|listening)|feel nothing when i pray|pray(er|ing)? feels? empty|god is silent|heaven is silent)/i, 'Faith & Doubt'],
  [/\b(fight|fought|conflict|marriage|divorce|enem(y|ies)\b|argu(e|ed|ing|ment)|(angry|furious|mad) (at|with) (my|him|her|them)|my (husband|wife|brother|sister|father|mother|friend|boss|son|daughter) (and i|hates|hurt|left|lied|won'?t|never|always|keeps|cheated|betrayed|yelled))/i, 'Conflict & Relationships'],
  [/\b(anxi|worr|overwhelm|stress|panic|restless|can'?t sleep|cannot sleep|spiral)/i, 'Anxiety & Worry'],
  [/\b(purpose|direction|career|what should i do|meaning(?!ful)|which way|lost\b(?! my (keys|phone|wallet))|no direction|wandering)/i, 'Purpose & Direction'],
  [/\b(hope(?!fully)|hopeless|despair|give up\b|giving up|pointless|empty\b)/i, 'Hope'],
  [/\b(peace|calm|be still|stillness|can'?t (be|sit) still|quiet my)/i, 'Peace'],
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
    const gentle = ['John 14:27', 'Matthew 11:28', 'Mark 4:39'];
    return {
      themes,
      sayings: loadLibrary().sayings.filter((s) => gentle.some((c) => sayingTouchesCitation(s, c))).slice(0, 3),
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
