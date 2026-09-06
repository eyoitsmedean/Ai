const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Order matters: the first cue that fires names the room the letter opens in.
// Cues are prefixes (\b...), so "forgiv" catches forgive, forgiven, forgiveness.
// The day a betrayal is discovered, the first word is comfort, not a command to
// forgive. These route to Suffering & Pain and keep Forgiveness out of the letter.
const BETRAYED_RE = /\b(?:cheat(?:ed|ing)\s+on\s+me|(?:he|she)\s+(?:has\s+been|is|was|'s\s+been|had\s+been)\s+cheating|(?:his|her)\s+affair|(?:he|she)\s+(?:had|is\s+having|has\s+been\s+having)\s+an\s+affair|been\s+unfaithful|left\s+me\s+for\s+(?:another|someone|a\s+younger|his|her))\b/i;

const NEED_CUES = [
  [/\b(abus|assault|molest|raped?\b|hit me|hits me|beat me|beats me|violen|bullied|bullying|bully)/i, 'Suffering & Pain'],
  [BETRAYED_RE, 'Suffering & Pain'],
  [/\b(furious|enraged|rage|so angry|livid|protected the wrong|covered (it )?up)\b/i, 'Suffering & Pain'],
  [/\b(grief|griev|mourn|died|death|dying|funeral|widow|hospice|passed away|buried|miscarri|stillb|lost the baby|lost our baby|dementia|alzheimer|doesn'?t (know|recognize|recognise) me|infertil|can'?t (get|have) (pregnant|children|a baby)|ivf|all my friends are (dead|gone)|lost my (mom|mum|dad|mother|father|wife|husband|son|daughter|brother|sister|baby|child))/i, 'Grief & Loss'],
  [/\b(shame|guilt|ashamed|unworthy|filthy|dirty|disgust|deserve|regret|can'?t undo|cannot undo|relapse|drinking again|using again|i cheated|i lied|i stole|i hit (my|him|her)|i killed|people i killed|their faces|haunted by|haunts me|can'?t forgive myself|cannot forgive myself|hate myself)/i, 'Shame & Guilt'],
  [/\b(forgiv|resent|bitter|hate (him|her|them)|trespass|betray|grudge|stole from|cheat(ed|ing|s)\b|affair|unfaithful)/i, 'Forgiveness'],
  [/\b(afraid|fear|scared|terror|terrified|frightened|scan|diagnos|biopsy|results|cancer|tumor|tumour|leukemia|leukaemia|nicu|icu|deport|immigration)/i, 'Fear'],
  [/\b(anxi|worr|overwhelm|stress|tomorrow|panic|interview|laid off|fired|rent|bills|debt|money|income|bankrupt|can'?t sleep|cannot sleep|racing)/i, 'Anxiety & Worry'],
  [/\b(pain|suffer|sick|illness|tribulation|chronic|hurts|breaking|exhaust|so tired|burnt? out|burning out|numb\b)/i, 'Suffering & Pain'],
  [/\b(lonel|alone|abandon|orphan|left me|no one|nobody|by myself|isolat|no friends|waiting to die|coming out|come out to)/i, 'Loneliness'],
  [/\b(fight|fought|conflict|marriage|divorce|enemy|argue|argument|feud|not speaking|barely speaks?|won'?t talk|losing (him|her))/i, 'Conflict & Relationships'],
  [/\b(doubt|unbelief|have not seen|faith|believe|god is even|is god|talking to the ceiling|not sure god|prayer feels|pray and)/i, 'Faith & Doubt'],
  [/\b(purpose|direction|calling|what should i do|what i'?m for|what am i for|meaning|tempted|temptation|fudge|lie about|honest|integrity|lost|wandering)/i, 'Purpose & Direction'],
  [/\b(hope|joy|cheer|future|never change|give up|pointless)/i, 'Hope'],
  [/\b(peace|calm|still|quiet|rest)/i, 'Peace'],
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
  const betrayed = BETRAYED_RE.test(query);
  return hits.filter((t) => isKnownTheme(t) && !(betrayed && t === 'Forgiveness'));
}

function retrieveSayings(query, { limit = 8 } = {}) {
  const themes = guessThemes(query);
  const qTokens = tokens(query);
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
  formatAllowList,
  guessThemes,
  retrieveSayings,
  tokens,
};
