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
  [/\b(anxi|worr|overwhelm|stress|panic|can'?t stop thinking|what if|debt|bills|can'?t afford|cannot afford|broke\b|evict|rent\b|paycheck|mortgage|lost (his|her|my|the|our) job|laid off|unemploy|got fired|out of work|no income)/i, 'Anxiety & Worry'],
  [/\b(grie|mourn|died|death|dying|funeral|widow|passed away|miscarr|lost my (mom|mother|dad|father|wife|husband|son|daughter|baby|child|friend|brother|sister))/i, 'Grief & Loss'],
  [/\b(forgiv(?!e myself)(?!ing myself)|resent|bitter|hate (him|her|them|my \w+)\b|trespass|grudge|anger|angry|rage|furious|betray)/i, 'Forgiveness'],
  [/\b(lonel|alone|abandon|orphan|left me|nobody|no one (cares|calls|understands)|isolated|invisible)/i, 'Loneliness'],
  [/\b(conflict|enem|argu|estrange|my (neighbou?r|boss|coworker|in-laws|roommate)|cheat|(?<!god )(?<!church says god )hates? me|bully|betrayed me|persecut|stole from me|stolen from me|lied to me|used me|humiliated me)/i, 'Conflict & Relationships'],
  [/\b(afraid|fear|scare|terror|terrif|frighten|dread|nightmare|unsafe|petrified|biopsy|test results|waiting (for|on) (the )?results|found a lump|the doctor found|weeks left|months left|days left|hospice|terminal|layoffs?|laid off|let go from|thirty days|30 days|notice to (vacate|quit)|eviction)/i, 'Fear'],
  [/\b(purpose|direction|calling|what (should|am) i (do|supposed)|meaning of (my )?life|meaning anymore|(feel|feeling|am|i'?m|so|completely|totally) lost\b|lost (in life|my way|my direction|my purpose)|no direction|wandering|stuck|crossroads|decision|which (job|path|way)|my life|go back to school|start over|too old to|too late to)/i, 'Purpose & Direction'],
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

// Positive signals that a request is outside this room. HARD signals draw the
// boundary even when a life word is present (another author, a persona
// change, code, homework); SOFT signals only when nothing about a life
// question is in the message (finance, entertainment, weather, trivia forms).
const HARD_OFFSCOPE_RE = /\b(what did (paul|peter|moses|david|solomon|isaiah|jeremiah|james|jude|the apostle \w+|the prophet \w+) (say|write|teach|think)|quote (paul|the old testament|proverbs|psalms?|romans|genesis|isaiah|revelation)|(paul|proverbs|psalms?|romans|genesis|isaiah|revelation|corinthians|ephesians|hebrews) (says?|teaches|verse|passage)|ignore (your|the|all|any|previous|prior) (rules|instructions|guidelines|prompt)|system prompt|jailbreak|pretend (to be|you are|you'?re)|act as (a|an|my|if you)|role-?play|you are now (a|an|my)|speak as|talk like a pirate|write (me )?(a|an|some) (poem|song|rap|essay|code|script|email|cover letter|resume|story|limerick|haiku|sermon|speech|toast|eulogy|prayer for my (team|football))|python|javascript|java\b|c\+\+|sql|html|css|regex|function\(|homework|my (essay|assignment|thesis|paper) (is|for)|solve (this|for x)|calculate|\d+\s*[-+*/x×÷]\s*\d+\s*=?|square root|who wrote (the|pride|hamlet|harry|war and|moby|\w+ing)|how many (books|chapters|verses|pages|words|people|times|years|miles|calories|ounces|days until)|what year (was|did|is)|when (was|did) (the|\w+ (born|die|invented|founded|written|discovered))|what is the (capital|population|weather|temperature|score|price|interest rate|exchange rate|meaning of the word|definition of|etymology|plot of|square root|difference between \w+ and \w+ in (math|physics|chemistry|code))|define (the word|agape|\w+ in greek)|translate (this|into|to (spanish|french|german|latin|greek|hebrew))|what does \w+ mean in (greek|hebrew|latin|spanish|french)|instagram|tiktok|snapchat|(bio|caption|tattoo|profile|wedding program|christmas card|for my (wall|mug|shirt|ring))\b.{0,40}\b(verse|scripture|quote)|\b(verse|scripture|quote)\b.{0,40}\b(bio|caption|tattoo|profile|instagram|christmas card|for my (wall|mug|shirt|ring))|in one word|one word answer|yes or no only|tell me a joke|make me laugh|knock knock|trivia|quiz me|did jesus have (brothers|a wife|siblings|kids|children|a girlfriend|a beard|blue eyes)|how (tall|old|heavy) was jesus|what (language|color|colour) (did jesus|was jesus|were jesus)|what (shows?|movies?|series|games?|anime|podcast) should i (watch|play|listen)|recommend (a |some |me a )?(show|movie|book|restaurant|series|game|podcast|recipe)|recipe|how do i (cook|bake|grill|fix my|install|set up|configure|jailbreak|root|hack|code|program|build a (website|app))|weather (today|tomorrow|this week|forecast)|forecast|who (won|will win|is winning) (the|tonight|today)|super bowl|world cup|playoffs|nba|nfl|mlb|premier league|election|who should i vote|president|congress|stock (price|tip|market)|crypto|bitcoin|ethereum|dogecoin|nft|forex|day trad|mortgage rate|interest rate|apr\b|refinanc|roth ira|401k|index fund|etf|invest (my|in|savings)|how (do|can) i (get rich|make money fast|make a million|get a raise)|lottery|powerball|jackpot|prayer (for|so) (my |our |the )?(team|football|game|lottery|bet|parlay).{0,20}(win|score)|so we win|help me win (the|a|my) (game|match|bet|lottery|argument)|(buy|rent)[^.?!]{0,30}(rates are|interest|market|prices are)|is (a|an) \w+ a good investment|should i (buy|sell) (stocks?|bitcoin|crypto|gold|a tesla))\b/i;
const SOFT_OFFSCOPE_RE = /\b(sports|football|basketball|baseball|soccer|hockey|golf|tennis|the game tonight|final score|celebrity|kardashian|taylor swift|netflix|hbo|disney|marvel|star wars|video game|fortnite|minecraft|xbox|playstation|nintendo|iphone|android|laptop|wifi|printer|password|my computer|my phone (wont|is|keeps)|car (wont start|is making)|oil change|plumber|electrician|what time is it|what day is it|how far is|directions to|nearest|open (now|today|on sunday)|hours|menu|price of|how much (does|is|do) (a|an|the|it|they) cost|discount|coupon|sale on|best (phone|laptop|car|tv|deal|brand|restaurant|pizza|coffee|beer|wine|whiskey))\b/i;

function assessScope(query) {
  const retrieved = retrieveSayings(query, { limit: 1 });
  const q = String(query || '');
  const inScope = retrieved.themes.length > 0
    || LIFE_RE.test(q)
    || (retrieved.matched && retrieved.topScore >= SCOPE_FLOOR);
  const hardOffScope = HARD_OFFSCOPE_RE.test(q);
  const offScope = hardOffScope || SOFT_OFFSCOPE_RE.test(q);
  return { inScope, offScope, hardOffScope, themes: retrieved.themes, topScore: retrieved.topScore };
}

// "Are you a real person?", "who are you", "what is this" — an honest answer
// about what this page is, not a boundary letter.
const IDENTITY_RE = /^\W*((are|r) (you|u) (a )?(real|actual|human|person|bot|robot|an? ai|a computer|a machine|alive|a pastor|a priest|a christian|jesus|god)(\s+person|\s+being|\s+human)?|who (are|r) (you|u)|what (are|r) (you|u)|what is this( place| app| thing)?|is (this|there) a (real )?(person|human|bot|pastor) (here|reading|behind this)|am i talking to (a|an) (real )?(person|human|bot|ai|robot|computer|pastor)|is (anyone|someone|anybody) (really )?(there|reading|listening)|is this (a )?(real|human|bot|ai|automated|chatgpt|gpt))\W*$/i;

function looksLikeIdentityQuestion(query) {
  const q = String(query || '').trim();
  return q.length <= 80 && IDENTITY_RE.test(q);
}

// Insult or a demand to argue, aimed at the advisor itself: answered with calm
// honesty, not a sermon. Cues are anchored to "you"/"this" so a confession
// ("I keep lying to my wife") is never read as hostility.
const HOSTILE_RE = /\b(you('re| are)\s+(a\s+|so\s+|just\s+(a\s+)?)?(fake|stupid|useless|idiot|scam|liar|bot|robot|ai|program|code|joke|worthless|pathetic)|this\s+(app\s+)?is\s+(fake|stupid|useless|bullshit|bs|garbage|a\s+scam|a\s+joke|pathetic)|shut\s+up|prove\s+(to\s+me\s+)?(god|jesus|he|it|that)\s+(exists?|is\s+real)|god\s+(isn'?t|is\s+not|doesn'?t)\s+(real|exist)|religion\s+is\s+(fake|a\s+lie|for\s+idiots|stupid)|brainwash|you\s+(can'?t|cannot)\s+help\s+(me|anyone))/i;

function looksHostile(query) {
  return HOSTILE_RE.test(String(query || ''));
}

// A bare greeting, thanks, or "amen": met with a doorway, not a boundary.
const GREETING_RE = /^\W*((hi|hello|hey|hiya|yo|good\s+(morning|afternoon|evening|night)|thanks?(\s+you)?(\s+so\s+much)?(\s+for\s+(this|that|listening|the\s+words|your\s+help))?|thank\s+you(\s+so\s+much)?(\s+for\s+(this|that|listening|the\s+words|your\s+help))?|ty|ok(ay)?(\s+thanks?(\s+you)?)?|(ok(ay)?|alright|got\s+it|i\s+see|understood|that\s+helps?|that\s+helped)|amen|bless\s+you|goodnight|good\s+bye|bye|i'?m\s+here|are\s+you\s+there|hello\?|anyone\s+there|(that('?s| is| was) )?(beautiful|helpful|lovely|kind|nice|good)(\s+thank\s+you|\s+thanks)?)[\s.!,]*)+$/i;

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
  looksLikeIdentityQuestion,
  retrieveSayings,
  SCOPE_FLOOR,
  tokens,
};
