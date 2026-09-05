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
const LOVED_ONE = '(mom|mum|mother|dad|father|husband|wife|son|daughter|baby|child|brother|sister|friend|grandm\\w*|grandf\\w*|grandp\\w*|dog|cat)';
const NEED_CUES = [
  [new RegExp(`\\b(grie[fv]|mourn|died|death\\b|dying(?! to)|funeral|widow|passed away|miss (him|her|them|you|my)|crying|miscarriage|stillborn|lost (my|our) ${LOVED_ONE})`, 'i'), 'Grief & Loss'],
  [/\b(afraid|fear(?!less)|scared|terror|terrif|frighten|dread(?!lock)|panic attack)/i, 'Fear'],
  [/\b(shame(?!less)|guilt(?!y pleasure)|ashamed|unworthy|worthless|disgust|messed up|sin(ned|ner|ning|s)?\b|failure|failing|not good enough|hate myself|i hurt (him|her|them|someone|my))/i, 'Shame & Guilt'],
  [/\b(forgiv|resent|bitter(?!sweet)|grudg|hate (him|her|them)|let it go|let go of|betray|cheated on me|lied to me)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan\b|left me|no one|nobody|isolat|unseen\b|no friends)/i, 'Loneliness'],
  [/\b(pain(?!t)|suffer|sick(?!le)|illness|tribulation|hurt(s|ing)?\b|chronic\b|diagnos|cancer|hospital|surgery)/i, 'Suffering & Pain'],
  [/\b(doubt(?!less)|unbelief|have not seen|(lost|losing|lose|no|little|my|struggling with|questioning) faith|is god (even |really )?(there|real|listening)|feel nothing when i pray|pray(er|ing)? feels? empty|god is silent|heaven is silent|(angry|mad|furious) (at|with) god|far from god|why (does|would|did|is) god|where (is|was) god|god (let|allow|permit)|numb)/i, 'Faith & Doubt'],
  [/\b(fight|fought|conflict|marriage is|divorce|enem(y|ies)\b|argu(e|ed|ing|ment)|(angry|furious|mad) (at|with) (my|him|her|them)|not speaking|(my )?(best )?friend (betrayed|hurt|left|lied)|my (husband|wife|brother|sister|father|mother|friend|boss|son|daughter) (hates|hurt|left|lied|cheated|betrayed|yelled|screamed|won'?t (speak|talk|listen|forgive)|(never|always|keeps) (listens|calls|criticis|yell|scream|blam|ignor|put(s|ting) me down)))/i, 'Conflict & Relationships'],
  [/\b(anxi|worr|overwhelm|stress|panic|restless|can'?t sleep|cannot sleep|spiral|laid off|debt|bills|rent|can'?t afford|money)/i, 'Anxiety & Worry'],
  [/\b(purpose|direction|career|what should i do|meaning(?!ful)|which way|lost my (job|way)|feel lost|am lost|so lost|no direction|wandering)/i, 'Purpose & Direction'],
  [/\b((no|lost|losing|without|any|little) hope|hopeless|despair|give up\b|giving up|pointless|empty\b|keep going|can'?t go on|go on like this|drowning|dark place|no way out)/i, 'Hope'],
  [/\b(peace(?! out)|calm|be still|stillness|can'?t (be|sit) still|quiet my)/i, 'Peace'],
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
