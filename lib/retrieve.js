const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');
const { lookup, parseRef } = require('./scripture');
const { looksLikeCrisis } = require('./crisis');

// When a reader writes in crisis, token matching must not choose what they are
// shown (it once offered Mark 13's wars and famines). These single verses are
// the whole allow-list; each prints as one short sentence of comfort.
const CRISIS_CITATIONS = ['Matthew 11:28', 'John 14:27', 'Luke 12:7', 'John 14:18', 'Matthew 5:4', 'John 16:33', 'Luke 12:32'];

function crisisSayings() {
  return CRISIS_CITATIONS.map((cite) => {
    const ref = parseRef(cite);
    const hit = ref && lookup(ref);
    if (!hit) return null;
    return { id: `crisis:${cite}`, book: ref.book, chapter: ref.chapter, start: ref.start, end: ref.end, citation: hit.citation, text: hit.text };
  }).filter(Boolean);
}

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Cues are word stems: a leading \b only, so "worry", "worried", "anxious",
// "forgive", "lonely" all match. A trailing \b would demand the stem be a
// whole word and silently drop most real phrasing (eval/questions.json guards this).
const NEED_CUES = [
  [/\b(anxi|worr|overwhelm|stress|tomorrow|panic|money|bills|rent)/i, 'Anxiety & Worry'],
  [/\b(grie[fv]|mourn|died|dying(?! to\b)|death|funeral|widow|passed away|miscarri|stillb|overdosed|le(?:ft|aving) us|lost (?:my|our|the) (?:mother|father|mom|dad|son|daughter|baby|wife|husband|child|brother|sister|friend|dog|cat))/i, 'Grief & Loss'],
  [/\b(forgiv|resent|bitter|hate (?:them|him|her|my)|trespass|apolog)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan|left me|no one|nobody|isolat)/i, 'Loneliness'],
  [/\b(fight|conflict|marriage|divorce|enemy|enemies|argu|anger|angry|rage|furious|temper|estrange|won'?t speak)/i, 'Conflict & Relationships'],
  [/\b(afraid|fear|scared|terror|frighten|dread)/i, 'Fear'],
  [/\b(purpose|direction|calling|what should i do|wasted my life|no purpose|lost my job|next step)/i, 'Purpose & Direction'],
  [/\b(doubt|unbelief|have not seen|faith|believe anymore|hear nothing|pray|hears? me|listening to me)/i, 'Faith & Doubt'],
  [/\b(pain|suffer|sick|illness|tribulation|cancer|leukemia|diagnos|exhaust|burn(?:ed|t) out|weary|worn out|killing me|hours a week|hour weeks)/i, 'Suffering & Pain'],
  [/\b(shame|guilt|ashamed|unworthy|relapse|disgust)/i, 'Shame & Guilt'],
  [/\b(peace|calm|still|quiet my)/i, 'Peace'],
  [/\b(hope|joy|cheer|future)/i, 'Hope'],
  [/\b(lost|no direction|wandering)\b/i, 'Purpose & Direction'],
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
  if (looksLikeCrisis(query)) {
    return { themes: ['Peace'], crisis: true, sayings: crisisSayings().slice(0, limit) };
  }
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
  CRISIS_CITATIONS,
  formatAllowList,
  guessThemes,
  retrieveSayings,
  tokens,
};
