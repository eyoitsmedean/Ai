const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');
const { parseRef } = require('./scripture');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Word-initial stems: "anxi" must catch anxious/anxiety, "forgiv" forgive/forgiveness.
const NEED_CUES = [
  [/\b(anxi|worr|overwhelm|stress|tomorrow|panic|restless|racing|can'?t sleep)/i, 'Anxiety & Worry'],
  [/\b(grie[fv]|mourn|died|death|dying|funeral|widow|passed away|miss (him|her|them))/i, 'Grief & Loss'],
  [/\b(forgiv|resent|bitter|grudge|hate (him|her|them)|trespass|let it go|let go of)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan|left me|no one|nobody|isolat|unseen)/i, 'Loneliness'],
  [/\b(fight|fought|conflict|marriage|divorce|enem|argu|my (husband|wife|brother|sister|father|mother|friend|boss))/i, 'Conflict & Relationships'],
  [/\b(afraid|fear|scared|terror|terrified|frighten|dread)/i, 'Fear'],
  [/\b(purpose|direction|calling|career|what should i do|meaning|which way)/i, 'Purpose & Direction'],
  [/\b(doubt|unbelie|have not seen|faith|is god (even |really )?(there|real|listening)|feel nothing when i pray|pray(er|ing)? feels? empty|silen(t|ce))/i, 'Faith & Doubt'],
  [/\b(pain|suffer|sick|ill(ness)?|tribulation|hurt(s|ing)?|chronic|diagnos)/i, 'Suffering & Pain'],
  [/\b(shame|guilt|ashamed|unworthy|disgust|messed up|sinned|failure|failed)/i, 'Shame & Guilt'],
  [/\b(peace|calm|still|quiet my)/i, 'Peace'],
  [/\b(hope|joy|cheer|future|despair|give up|pointless|empty)/i, 'Hope'],
  [/\b(lost|no direction|wandering)/i, 'Purpose & Direction'],
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
    const gentle = new Set(['John 14:27', 'Matthew 11:28', 'Mark 4:39']);
    return {
      themes,
      sayings: loadLibrary().sayings.filter((s) => gentle.has(s.citation) || (parseRef(s.citation) && gentle.has(`${s.book} ${s.chapter}:${s.start}`))).slice(0, 3),
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
