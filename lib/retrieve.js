const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme } = require('./themes');

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'were', 'been', 'being', 'they', 'them', 'their',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will', 'just',
  'about', 'into', 'over', 'after', 'before', 'than', 'then', 'also', 'very',
]);

// Cues are stems: a leading word boundary only, so "forgive", "anxious",
// "lonely" and "abandoned" all match their theme.
const NEED_CUES = [
  [/\b(anxi|worr|overwhelm|stress|panic|can'?t stop thinking|what if|debt|bills|can'?t afford|broke\b|evict|rent\b|paycheck|mortgage)/i, 'Anxiety & Worry'],
  [/\b(grie|mourn|died|death|dying|funeral|widow|passed away|miscarr|lost my (mom|mother|dad|father|wife|husband|son|daughter|baby|child|friend|brother|sister))/i, 'Grief & Loss'],
  [/\b(forgiv|resent|bitter|hate (him|her|them|my)|trespass|grudge|anger|angry|rage|furious|betray)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan|left me|nobody|no one (cares|calls|understands)|isolated|invisible)/i, 'Loneliness'],
  [/\b(conflict|enem|argu|estrange|my (neighbou?r|boss|coworker|in-laws)|cheat|hates? me|bully|betrayed me|persecut)/i, 'Conflict & Relationships'],
  [/\b(afraid|fear|scare|terror|terrif|frighten|dread|nightmare|unsafe|petrified|biopsy|test results|waiting (for|on) (the )?results)/i, 'Fear'],
  [/\b(purpose|direction|calling|what (should|am) i (do|supposed)|meaning|lost\b|no direction|wandering|stuck|crossroads|decision|which (job|path|way)|my life)/i, 'Purpose & Direction'],
  [/\b(doubt|unbelie|have not seen|faith|far from god|distant from god|god (feels|seems) (far|silent|absent)|does god|is god|used to believe|stopped believing|lost my belief)/i, 'Faith & Doubt'],
  [/\b(pain|suffer|sick|ill\b|illness|tribulation|diagnos|hospital|cancer|chemo|chronic|disab|surgery|hurting)/i, 'Suffering & Pain'],
  [/\b(shame|guilt|ashamed|unworthy|regret|failure|failed|not good enough|worthless|disgust(ed)? with myself|sinn?(ed|er)|lied|lying to|addict|porn|relapse)/i, 'Shame & Guilt'],
  [/\b(peace|calm|still\b|rest\b|tired|exhaust|weary|burn(t|ed)? ?out|can'?t sleep|overworked)/i, 'Peace'],
  [/\b(hope|joy|cheer|future|hopeless|depress|empty|numb|pointless|give up|dark)/i, 'Hope'],
];

// Any of these marks a message as a real life question even when no theme
// cue fires: the person is naming a feeling, a relationship, a body, money,
// work, or faith.
const LIFE_RE = /\b(i (feel|am so|am not|was|keep|cannot|can'?t|don'?t|need|hate|miss|lost|have been|struggle)|i'?m (so |really |very |just |always )?(scared|afraid|terrified|tired|lost|alone|lonely|angry|sad|worried|anxious|ashamed|broken|exhausted|done|hurting|grieving|struggling|failing|drowning|numb|empty)|my (life|heart|mind|soul|family|kids|children|job|work|money|debt|health|body|faith|marriage|friend|brother|sister|mother|father|mom|dad|son|daughter|wife|husband|partner)|jesus|god|christ|lord|bible|gospel|scripture|church|sin\b|sins|heaven|kingdom|money|rich|poor|wealth|greed|possessions|generous|neighbou?r|humble|pride|judg(e|ing) (others|people|them)|enemy|enemies|honest|temptation|tempted|disciple|blessed|mercy|meek|forgive|pray)/i;

// Modern words the KJV never uses, mapped onto the words it does.
const SYNONYMS = {
  money: ['mammon', 'treasure', 'riches', 'rich'],
  cash: ['mammon', 'treasure'],
  wealth: ['riches', 'rich', 'treasure', 'mammon'],
  wealthy: ['rich', 'riches'],
  greed: ['covetousness', 'mammon'],
  greedy: ['covetousness'],
  possessions: ['treasure', 'goods', 'riches'],
  stuff: ['treasure', 'goods'],
  pray: ['pray', 'prayest', 'prayer', 'ask'],
  praying: ['pray', 'prayest', 'prayer'],
  prayer: ['pray', 'prayest', 'prayer'],
  judging: ['judge', 'judged', 'mote', 'beam'],
  judgmental: ['judge', 'judged', 'mote', 'beam'],
  judge: ['judge', 'judged', 'mote', 'beam'],
  criticize: ['judge', 'mote', 'beam'],
  worry: ['thought', 'morrow', 'sparrows'],
  worried: ['thought', 'morrow', 'sparrows'],
  anxious: ['thought', 'morrow', 'troubled'],
  neighbor: ['neighbour'],
  neighbors: ['neighbour'],
  enemy: ['enemies', 'enemy', 'curse', 'persecute'],
  angry: ['angry', 'wrath', 'brother'],
  anger: ['angry', 'wrath'],
  marriage: ['wife', 'husband', 'joined', 'asunder', 'peacemakers'],
  married: ['wife', 'husband', 'joined'],
  wife: ['wife', 'joined', 'asunder'],
  husband: ['husband', 'wife', 'joined'],
  kids: ['children', 'little', 'child'],
  children: ['children', 'little', 'child'],
  teenager: ['son', 'child', 'father', 'prodigal', 'compassion'],
  dad: ['father'],
  mom: ['mother'],
  job: ['labour', 'hire', 'vineyard', 'servant'],
  work: ['labour', 'work', 'vineyard'],
  boss: ['master', 'servant', 'lord'],
  tired: ['labour', 'heavy laden', 'rest', 'weary'],
  exhausted: ['labour', 'heavy laden', 'rest'],
  sick: ['sick', 'whole', 'heal', 'physician'],
  healing: ['heal', 'whole', 'healed'],
  died: ['dead', 'die', 'resurrection', 'mourn'],
  death: ['dead', 'die', 'resurrection', 'mourn'],
  lonely: ['alone', 'comfortless', 'orphans', 'with you'],
  afraid: ['afraid', 'fear', 'troubled'],
  scared: ['afraid', 'fear', 'troubled'],
  forgive: ['forgive', 'forgiven', 'trespasses', 'seventy'],
  lying: ['truth', 'lie', 'light'],
  honest: ['truth', 'light', 'yea'],
  doubt: ['believe', 'doubt', 'faith', 'seen'],
  hope: ['joy', 'rejoice', 'light', 'life'],
  purpose: ['light', 'salt', 'follow', 'seek'],
  give: ['give', 'alms', 'poor'],
  giving: ['give', 'alms', 'poor'],
  generous: ['give', 'alms', 'poor', 'treasure'],
  serve: ['serve', 'servant', 'minister'],
  humble: ['humble', 'meek', 'lowly', 'least'],
  proud: ['humble', 'exalt', 'abased'],
  pride: ['humble', 'exalt', 'abased'],
  temptation: ['temptation', 'tempted', 'watch', 'pray'],
  tempted: ['temptation', 'tempted', 'watch'],
};

// Strip the commonest English endings so "judging" reaches "judge",
// "worried" reaches "worry"; only stems of four or more letters are kept.
function stem(word) {
  const w = String(word);
  const rules = [/ingly$/, /edly$/, /ing$/, /ies$/, /ied$/, /ed$/, /ly$/, /es$/, /s$/];
  for (const re of rules) {
    if (re.test(w)) {
      const s = w.replace(re, w.endsWith('ies') || w.endsWith('ied') ? 'y' : '');
      if (s.length >= 4) return s;
    }
  }
  return w;
}

function tokens(text) {
  const raw = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const out = new Set();
  for (const w of raw) {
    out.add(w);
    const s = stem(w);
    if (s !== w) out.add(s);
    for (const syn of SYNONYMS[w] || SYNONYMS[s] || []) out.add(syn);
  }
  return [...out];
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
  const topScore = scored.length ? scored[0].score : 0;
  if (!picks.length) {
    return {
      themes,
      topScore,
      matched: false,
      sayings: loadLibrary().sayings.filter((s) => /14:27|11:28|4:39/.test(s.citation)).slice(0, 3),
    };
  }
  return { themes, topScore, matched: true, sayings: picks.slice(0, limit) };
}

// A message is treated as a life question when a need cue fires or the
// words themselves land on a saying with some weight (two ordinary words or
// one long word). Below that the letter should be an honest boundary, not a
// verse chosen by coincidence.
const SCOPE_FLOOR = 5;

function assessScope(query) {
  const retrieved = retrieveSayings(query, { limit: 1 });
  const q = String(query || '');
  const inScope = retrieved.themes.length > 0
    || LIFE_RE.test(q)
    || (retrieved.matched && retrieved.topScore >= SCOPE_FLOOR);
  return { inScope, themes: retrieved.themes, topScore: retrieved.topScore };
}

// Insult or a demand to argue, aimed at the advisor itself: answered with calm
// honesty, not a sermon. Cues are anchored to "you"/"this" so a confession
// ("I keep lying to my wife") is never read as hostility.
const HOSTILE_RE = /\b(you('re| are)\s+(a\s+|so\s+|just\s+(a\s+)?)?(fake|stupid|useless|idiot|scam|liar|bot|robot|ai|program|code|joke|worthless|pathetic)|this\s+(app\s+)?is\s+(fake|stupid|useless|bullshit|bs|garbage|a\s+scam|a\s+joke|pathetic)|shut\s+up|prove\s+(to\s+me\s+)?(god|jesus|he|it|that)\s+(exists?|is\s+real)|god\s+(isn'?t|is\s+not|doesn'?t)\s+(real|exist)|religion\s+is\s+(fake|a\s+lie|for\s+idiots|stupid)|brainwash|you\s+(can'?t|cannot)\s+help\s+(me|anyone))/i;

function looksHostile(query) {
  return HOSTILE_RE.test(String(query || ''));
}

// A bare greeting, thanks, or "amen": met with a doorway, not a boundary.
const GREETING_RE = /^\W*(hi|hello|hey|hiya|yo|good\s+(morning|afternoon|evening|night)|thanks?(\s+you)?(\s+so\s+much)?|thank\s+you|ty|ok(ay)?|amen|bless\s+you|goodnight|good\s+bye|bye|i'?m\s+here|are\s+you\s+there|hello\?|anyone\s+there)\W*$/i;

function looksLikeGreeting(query) {
  const q = String(query || '').trim();
  return q.length <= 40 && GREETING_RE.test(q);
}

function formatAllowList(sayings) {
  return (sayings || [])
    .map((s) => `{{${s.citation}}}`)
    .join('\n');
}

module.exports = {
  assessScope,
  formatAllowList,
  guessThemes,
  looksHostile,
  looksLikeGreeting,
  retrieveSayings,
  SCOPE_FLOOR,
  tokens,
};
