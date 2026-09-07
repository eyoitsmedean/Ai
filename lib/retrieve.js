// Retrieval: which of Jesus's sayings are offered to the model for a message.
//
// Organizing idea: readers write in 2026 English; the sayings are 1611 English.
// A lexicon translates the reader's need into the vocabulary the sayings
// actually use ("worried about tomorrow" -> thought, morrow, sparrows) and into
// a theme room. BM25 scores the translated query against every saying, theme
// and curated-passage priors lift the well-known lines, and a quality floor
// means a message that matches nothing gets known comfort verses, not noise.
//
// BM25 form and defaults follow Robertson & Zaragoza's presentation
// (k1 in [1.2, 2.0], b = 0.75; IDF = ln((N - n + 0.5)/(n + 0.5) + 1)).
const { loadLibrary } = require('./library');
const { themesForSaying, isKnownTheme, themeCitations, sayingTouchesCitation } = require('./themes');
const { lookup, parseRef } = require('./scripture');
const { looksLikeCrisis } = require('./crisis');

const K1 = 1.5;
const B = 0.75;
const LEXICON_TERM_WEIGHT = 1.3;
const THEME_BOOST = 4;
const CURATED_BOOST = 3;
const FAMILIAR_BOOST = 1;
const SCORE_FLOOR = 2.5;
const MAX_CURATED = 4;

// When a reader writes in crisis, token matching must not choose what they are
// shown (it once offered Mark 13's wars and famines). These single verses are
// the whole allow-list; each prints as one short sentence of comfort.
const CRISIS_CITATIONS = ['Matthew 11:28', 'John 14:27', 'Luke 12:7', 'John 14:18', 'Matthew 5:4', 'John 16:33', 'Luke 12:32'];

// Offered when nothing in the message maps to a need and nothing scores.
const DEFAULT_CITATIONS = ['Matthew 11:28', 'John 14:27', 'Matthew 6:34', 'John 16:33', 'Luke 12:7'];

// Sermon on the Mount, Sermon on the Plain, Luke 12 and 15, Farewell Discourse:
// the sayings most readers already half-know. A small, constant lift.
const FAMILIAR = [
  ['Matthew', 5, 7], ['Luke', 6, 6], ['Luke', 12, 12], ['Luke', 15, 15], ['John', 14, 16],
];

const STOP = new Set(`
a an the and or but for nor so yet of to in on at by with from into onto over under about after before than then
as if when where which who whom whose what why how that this these those there here
i me my mine we us our you your yours he him his she her hers it its they them their theirs
am is are was were be been being have has had having do does did doing done
can could will would shall should may might must
not no nor never none nothing
just really very so too also even still much many more most some any all both each every either neither
feel feels feeling felt like want wants wanted know knows knew think thinks keep keeps kept get gets got going gonna
thing things something anything everything someone anyone everyone people way ways
ye thee thou thy thine unto shalt hath doth saith verily yea nay lo wherefore therefore thereof whosoever whatsoever
own upon said say saith spake
`.trim().split(/\s+/));

const IRREGULAR = {
  died: 'die', dies: 'die', dying: 'die', dieth: 'die', dead: 'die', death: 'die',
  wept: 'weep', weepeth: 'weep', weeping: 'weep',
  children: 'child', brethren: 'brother', men: 'man', women: 'woman',
  gave: 'give', given: 'give', giveth: 'give',
  forgave: 'forgive', forgiven: 'forgive', forgiveth: 'forgive', forgiveness: 'forgive',
  sought: 'seek', seeketh: 'seek', found: 'find', findeth: 'find',
  lost: 'lose', loseth: 'lose', loss: 'lose',
  came: 'come', cometh: 'come', went: 'go', goeth: 'go',
  knew: 'know', knoweth: 'know', known: 'know',
  labour: 'labor', labours: 'labor', laboureth: 'labor', neighbour: 'neighbor', neighbours: 'neighbor',
  honour: 'honor', saviour: 'savior', behaviour: 'behavior',
  afraid: 'fear', feareth: 'fear', fearful: 'fear',
  troubled: 'trouble', troubles: 'trouble', troubling: 'trouble',
  comforted: 'comfort', comfortless: 'comfort', comforter: 'comfort',
  sorrowful: 'sorrow', sorrows: 'sorrow',
  anxious: 'anxiety', worried: 'worry', worries: 'worry', worrying: 'worry',
  enemies: 'enemy', mercies: 'mercy', merciful: 'mercy',
  believeth: 'believe', believed: 'believe', believing: 'believe', belief: 'believe',
  prayed: 'pray', prayer: 'pray', prayers: 'pray', prayest: 'pray', praying: 'pray', prayeth: 'pray',
};

const SUFFIXES = [
  [/ieth$/, 'y'], [/ies$/, 'y'], [/eth$/, ''], [/est$/, ''], [/ing$/, ''], [/ed$/, ''],
  [/ness$/, ''], [/less$/, ''], [/ful$/, ''], [/ly$/, ''], [/es$/, ''], [/s$/, ''],
];

function stem(word) {
  let w = word;
  if (IRREGULAR[w]) {
    w = IRREGULAR[w];
  } else if (w.length > 3) {
    for (const [re, rep] of SUFFIXES) {
      if (re.test(w)) {
        const next = w.replace(re, rep);
        if (next.length >= 3) { w = next; break; }
      }
    }
    if (IRREGULAR[w]) w = IRREGULAR[w];
  }
  if (w.length > 4 && /e$/.test(w)) w = w.slice(0, -1);
  return w;
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  return normalize(text)
    .replace(/'/g, '')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem)
    .filter((w) => w.length > 1);
}

// Modern phrasing -> KJV vocabulary the sayings actually use + theme room.
// Cue regexes run on the normalized message. Terms are stemmed at index time.
const LEXICON = [
  { cue: /\b(anxi|worr|stress|overwhelm|panic|nervous|cannot sleep|can'?t sleep|racing|what if)/, terms: ['thought', 'morrow', 'careful', 'troubled', 'sparrows', 'lilies', 'fowls', 'sufficient'], themes: ['Anxiety & Worry'] },
  { cue: /\b(tomorrow|future|what will happen|what happens next|uncertain)/, terms: ['morrow', 'thought', 'sufficient', 'troubled'], themes: ['Anxiety & Worry'] },
  { cue: /\b(money|rent|bills?|debt|afford|broke|poor|paycheck|income|feed my)/, terms: ['treasure', 'mammon', 'raiment', 'fowls', 'barns', 'feedeth', 'eat', 'drink', 'kingdom', 'first', 'sufficient'], themes: ['Anxiety & Worry'] },
  { cue: /\b(greed|greedy|jealous|envy|envious|covet|rich|wealth|richer|success)/, terms: ['covetousness', 'treasure', 'mammon', 'rich', 'riches', 'soul', 'exchange', 'evil eye', 'lawful', 'own'], themes: [] },
  { cue: /\b(grie[fv]|mourn|died|(?:is|are|was) dying|death of|(?:his|her|their|the) death|funeral|widow|passed away|miscarri|stillb|overdosed|le(?:ft|aving) us|buried|cemetery|lost (?:my|our|the) (?:mother|father|mom|dad|son|daughter|baby|wife|husband|child|brother|sister|friend|dog|cat))/, terms: ['mourn', 'comforted', 'sorrow', 'weep', 'resurrection', 'life', 'die', 'joy', 'live'], themes: ['Grief & Loss'] },
  { cue: /\b(forgiv|resent|bitter|grudge|hate (?:them|him|her|my)|trespass|apolog|betray|cheated on|lied to me|stole|wronged me)/, terms: ['forgive', 'trespasses', 'debts', 'merciful', 'seventy', 'enemies', 'brother', 'reconciled'], themes: ['Forgiveness'] },
  { cue: /\b(enem|cruel|bully|bullied|humiliat|mock|insult|ridicul|revil|persecut|spread(?:ing)? lies|gossip|slander|treated me|unfair)/, terms: ['enemies', 'curse', 'revile', 'persecute', 'despitefully', 'smite', 'cheek', 'bless', 'reward', 'hate', 'love'], themes: ['Conflict & Relationships'] },
  { cue: /\b(lonel|alone|abandon|orphan|left me|no one|nobody|isolat|by myself|divorce|no friends)/, terms: ['comfortless', 'alway', 'abide', 'friends', 'love', 'come', 'world'], themes: ['Loneliness'] },
  { cue: /\b(fight|fighting|conflict|argu|divorce|separat|angry|anger|rage|furious|temper|punched|yell)/, terms: ['peacemakers', 'reconciled', 'brother', 'adversary', 'agree', 'angry', 'love', 'one another', 'commandment'], themes: ['Conflict & Relationships'] },
  // Estrangement is a father-and-son story, not an enemies story.
  { cue: /\b(estrange|won'?t speak|not speaking|stopped speaking|cut me off|no contact|won'?t talk|won'?t answer|walked out on)/, terms: ['father', 'son', 'compassion', 'lost', 'found', 'alive again', 'kissed', 'ran', 'sheep', 'rejoice'], themes: [] },
  { cue: /\b(afraid|fear|scared|terrif|dread|frighten|nightmare|panic)/, terms: ['fear', 'afraid', 'troubled', 'sparrows', 'hairs', 'numbered', 'flock', 'cheer', 'peace'], themes: ['Fear'] },
  { cue: /\b(dying(?! to\b)|die|death|mortal|terminal|hospice|biopsy|cancer|diagnos)/, terms: ['resurrection', 'life', 'mansions', 'believeth', 'everlasting', 'never die', 'fear', 'soul', 'body'], themes: ['Fear', 'Suffering & Pain'] },
  { cue: /\b(purpose|direction|calling|what should i do|wasted my life|no purpose|lost my job|got fired|fired|laid off|unemploy|career|next step|meaning)/, terms: ['light', 'kingdom', 'seek', 'first', 'salt', 'city', 'follow', 'candle', 'works'], themes: ['Purpose & Direction'] },
  { cue: /\b(i (?:am|feel) lost|lost my way|no direction|wandering|adrift|drifting)/, terms: ['lost', 'sheep', 'found', 'light', 'way'], themes: ['Purpose & Direction'] },
  { cue: /\b(doubt|unbelief|believe anymore|faith|hear nothing|silent|silence|pray|hears? me|listening|unanswered|nothing changes)/, terms: ['believe', 'faith', 'mustard', 'ask', 'seek', 'knock', 'given', 'receive', 'pray', 'father knoweth', 'unbelief'], themes: ['Faith & Doubt'] },
  { cue: /\b(pain|suffer|sick|ill|illness|chronic|cancer|leukemia|diagnos|surgery|hospital|exhaust|burn(?:ed|t) out|weary|worn out|tired|killing me|hours a week|hour weeks|abus|assault|raped|molest|hurt me|trauma)/, terms: ['tribulation', 'cheer', 'labour', 'heavy laden', 'rest', 'yoke', 'burden', 'poor in spirit', 'overcome', 'world'], themes: ['Suffering & Pain'] },
  { cue: /\b(shame|guilt|ashamed|unworthy|relapse|disgust|sin|sinned|failed|failure|lied|cheated|regret|my fault|hate myself)/, terms: ['sin', 'sinner', 'lost', 'sheep', 'found', 'repent', 'condemn', 'forgiven', 'father', 'compassion', 'joy', 'reconciled', 'altar', 'brother'], themes: ['Shame & Guilt'] },
  { cue: /\b(addict|drinking|drunk|alcohol|drugs|gambling|porn|can'?t stop|cannot stop|craving|sober|clean for)/, terms: ['sin', 'servant', 'free', 'flesh', 'weak', 'spirit', 'watch', 'drunkenness', 'surfeiting', 'rest'], themes: ['Shame & Guilt'] },
  { cue: /\b(peace|calm|quiet my|be still|peace of mind|mind never stops|racing thoughts)/, terms: ['peace', 'still', 'rest', 'troubled', 'afraid', 'world giveth'], themes: ['Peace'] },
  { cue: /\b(hope|hopeless|joy|numb|empty|feel nothing|pointless|dark|darkness)/, terms: ['joy', 'full', 'sorrow', 'light', 'life', 'abundantly', 'darkness', 'cheer'], themes: ['Hope'] },
  { cue: /\b(son|daughter|teenager|my kid|my child|children|parent|estranged|prodigal|ran away)/, terms: ['father', 'son', 'compassion', 'lost', 'found', 'sheep', 'kissed', 'alive again', 'little ones'], themes: [] },
  { cue: /\b(temptation|tempted|lust|resist|weak)/, terms: ['tempt', 'watch', 'pray', 'flesh', 'weak', 'spirit', 'willing'], themes: [] },
  { cue: /\b(judg|hypocri|critic|self-?righteous|look down)/, terms: ['judge', 'mote', 'beam', 'measure', 'condemn', 'brother'], themes: [] },
  { cue: /\b(love|kind|compassion|neighbou?r)/, terms: ['love', 'neighbour', 'one another', 'enemies', 'commandment', 'mercy'], themes: [] },
];

let _index = null;

function verseAsSaying(cite) {
  const ref = parseRef(cite);
  const hit = ref && lookup(ref);
  if (!hit) return null;
  return { id: `verse:${cite}`, book: ref.book, chapter: ref.chapter, start: ref.start, end: ref.end, citation: hit.citation, text: hit.text };
}

function familiar(saying) {
  return FAMILIAR.some(([book, from, to]) => saying.book === book && saying.chapter >= from && saying.chapter <= to);
}

function buildIndex() {
  if (_index) return _index;
  const sayings = loadLibrary().sayings;
  const docs = sayings.map((s) => {
    const toks = tokens(s.text);
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    return { saying: s, tf, length: toks.length, themes: themesForSaying(s), familiar: familiar(s) };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const avgdl = docs.reduce((sum, d) => sum + d.length, 0) / (docs.length || 1);
  const N = docs.length;
  const idf = new Map();
  for (const [t, n] of df) idf.set(t, Math.log((N - n + 0.5) / (n + 0.5) + 1));
  _index = { docs, idf, avgdl };
  return _index;
}

function bm25Term(doc, term, idf, avgdl) {
  const f = doc.tf.get(term);
  if (!f) return 0;
  return (idf.get(term) || 0) * ((f * (K1 + 1)) / (f + K1 * (1 - B + B * (doc.length / avgdl))));
}

function needsOf(query) {
  const q = normalize(query);
  const themes = [];
  const terms = new Map();
  for (const entry of LEXICON) {
    if (!entry.cue.test(q)) continue;
    for (const theme of entry.themes) if (isKnownTheme(theme) && !themes.includes(theme)) themes.push(theme);
    for (const phrase of entry.terms) for (const t of tokens(phrase)) terms.set(t, LEXICON_TERM_WEIGHT);
  }
  return { themes, terms };
}

function guessThemes(query) {
  return needsOf(query).themes;
}

// One verse per detected room, then a second round, so a message that touches
// grief and fear hears from both rooms instead of three lines from the first.
function curatedFor(themes) {
  const cites = themeCitations();
  const queues = themes.map((t) => [...(cites[t] || [])]);
  const out = [];
  let progressed = true;
  while (out.length < MAX_CURATED && progressed) {
    progressed = false;
    for (const queue of queues) {
      if (out.length >= MAX_CURATED) break;
      const cite = queue.shift();
      if (!cite) continue;
      progressed = true;
      if (out.some((s) => s.citation === cite)) continue;
      const s = verseAsSaying(cite);
      if (s) out.push(s);
    }
  }
  return out;
}

function retrieveSayings(query, { limit = 8, explain = false } = {}) {
  if (looksLikeCrisis(query)) {
    return { themes: ['Peace'], crisis: true, sayings: CRISIS_CITATIONS.map(verseAsSaying).filter(Boolean).slice(0, limit) };
  }
  const { docs, idf, avgdl } = buildIndex();
  const { themes, terms } = needsOf(query);
  const weights = new Map(terms);
  for (const t of tokens(query)) if (!weights.has(t)) weights.set(t, 1);

  const scored = [];
  for (const d of docs) {
    let score = 0;
    for (const [t, w] of weights) score += w * bm25Term(d, t, idf, avgdl);
    if (score === 0) continue;
    for (const theme of themes) if (d.themes.includes(theme)) { score += THEME_BOOST; break; }
    if (d.familiar) score += FAMILIAR_BOOST;
    scored.push({ saying: d.saying, score });
  }
  scored.sort((a, b) => b.score - a.score);

  const picks = curatedFor(themes);
  for (const p of picks) {
    const block = scored.find((r) => sayingTouchesCitation(r.saying, p.citation));
    if (block) block.score += CURATED_BOOST;
  }
  scored.sort((a, b) => b.score - a.score);

  const seen = new Set(picks.map((p) => p.id));
  for (const row of scored) {
    if (picks.length >= limit) break;
    if (row.score < SCORE_FLOOR) break;
    if (seen.has(row.saying.id)) continue;
    // The model sees citations only, so a curated single verse already covers
    // its block; offering the block too would print five verses where one serves.
    if (picks.some((p) => p.id.startsWith('verse:') && sayingTouchesCitation(row.saying, p.citation))) continue;
    seen.add(row.saying.id);
    picks.push(row.saying);
  }

  if (picks.length < 3) {
    for (const cite of DEFAULT_CITATIONS) {
      if (picks.length >= 3) break;
      if (picks.some((p) => sayingTouchesCitation(p, cite))) continue;
      const s = verseAsSaying(cite);
      if (s) picks.push(s);
    }
  }

  const result = { themes, sayings: picks.slice(0, limit) };
  if (explain) result.scores = scored.slice(0, limit).map((r) => ({ citation: r.saying.citation, score: Number(r.score.toFixed(2)) }));
  return result;
}

function formatAllowList(sayings) {
  return (sayings || [])
    .map((s) => `{{${s.citation}}}`)
    .join('\n');
}

module.exports = {
  CRISIS_CITATIONS,
  DEFAULT_CITATIONS,
  LEXICON,
  buildIndex,
  formatAllowList,
  guessThemes,
  retrieveSayings,
  stem,
  tokens,
};
