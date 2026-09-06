/**
 * Scripture verification helpers.
 * Preference order: local red-letter corpus → bible-api.com (WEB) → unverified flag.
 */
const corpus = require('./red-letters');

const apiCache = new Map();

function normalizeText(s) {
  return String(s || '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function similarity(a, b) {
  const A = normalizeText(a);
  const B = normalizeText(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A)) return 0.92;
  // Token Jaccard
  const ta = new Set(A.split(' ').filter(Boolean));
  const tb = new Set(B.split(' ').filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.max(1, ta.size + tb.size - inter);
}

async function fetchFromApi(rawRef) {
  // bible-api rejects typographic dashes in ranges ("6:25–27"); normalize to ASCII.
  const ref = String(rawRef || '').replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
  const key = ref.toLowerCase().replace(/\s+/g, '');
  if (apiCache.has(key)) return apiCache.get(key);
  try {
    const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=web`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const text = String(data.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const out = { text, reference: data.reference || ref, source: 'bible-api', translation: 'WEB' };
    apiCache.set(key, out);
    return out;
  } catch {
    return null;
  }
}

/**
 * Verify a single citation+quote pair.
 * Returns { verse, quote, verified, source, similarity }
 */
const GOSPEL_RE = /^(?:matthew|matt|mt|mark|mk|mr|luke|lk|lu|john|jn|joh)\.?\s+\d+:\d+/i;

/** True only for citations inside Matthew, Mark, Luke, or John. */
function isGospelRef(ref) {
  return GOSPEL_RE.test(String(ref || '').trim());
}

async function verifyPassage({ verse, quote, context }) {
  // Scope guard: the product promise is Jesus's own words. A citation outside the
  // four Gospels can never be "verified" here, even if bible-api has the text.
  if (!isGospelRef(verse)) {
    return {
      verse: verse || '',
      quote: quote || '',
      context: context || undefined,
      verified: false,
      outOfScope: true,
      source: 'out-of-scope',
      similarity: 0,
    };
  }

  const local = corpus.findByRef(verse);
  if (local) {
    const sim = quote ? similarity(quote, local.text) : 1;
    return {
      verse: corpus.cite(local),
      quote: local.text,
      context: context || undefined,
      verified: true,
      source: 'corpus',
      similarity: sim,
      translation: 'WEB',
    };
  }

  const api = await fetchFromApi(verse);
  if (api) {
    const sim = quote ? similarity(quote, api.text) : 1;
    // If model quote diverges badly, prefer API text but mark low-sim
    return {
      verse: api.reference,
      quote: api.text,
      context: context || undefined,
      verified: true,
      source: 'bible-api',
      similarity: sim,
      translation: 'WEB',
      modelDiverged: sim < 0.55,
    };
  }

  return {
    verse,
    quote: quote || '',
    context: context || undefined,
    verified: false,
    source: 'unverified',
    similarity: 0,
  };
}

async function verifyPassages(passages) {
  if (!Array.isArray(passages)) return [];
  return Promise.all(passages.map(p => verifyPassage(p)));
}

/** Extract **Book N:N** citations from freeform advisor text and annotate. */
function extractCitations(text) {
  const re = /\*\*([1-3]?\s?[A-Za-z]+\s+\d+:\d+(?:\s*[–-]\s*\d+)?)\*\*/g;
  const found = [];
  let m;
  while ((m = re.exec(text))) found.push(m[1]);
  return [...new Set(found)];
}

/**
 * Lattice / Apologist-style grounding:
 * After each **Citation**, replace the following quoted line with verified corpus
 * (or bible-api) text when available. Unverifiable citations stay flagged.
 */
async function groundAdvisorText(text) {
  const lines = String(text || '').split('\n');
  const citations = [];
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const vm = line.trim().match(/^\*\*((?:Matthew|Mark|Luke|John|[1-3]?\s?[A-Za-z]+)\s+\d+:\d+(?:\s*[–-]\s*\d+)?)\*\*\s*$/i);
    if (!vm) {
      out.push(line);
      continue;
    }

    const citation = vm[1].trim();
    out.push(line);

    // Skip blank lines after citation
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) {
      out.push(lines[j]);
      j++;
    }

    if (j >= lines.length) {
      citations.push({ citation, verified: false, quote: '', verse: citation });
      i = j - 1;
      continue;
    }

    const quoteLine = lines[j];
    const trimmed = quoteLine.trim();
    const isQuote = trimmed.length > 8 && (/^["“]/.test(trimmed) || /^[A-Z]/.test(trimmed));
    const modelQuote = trimmed.replace(/^["“]+/, '').replace(/["”]+$/, '');
    const verified = await verifyPassage({ verse: citation, quote: modelQuote });

    citations.push({
      citation,
      verified: verified.verified,
      quote: verified.quote,
      verse: verified.verse || citation,
      similarity: verified.similarity,
      source: verified.source,
      outOfScope: !!verified.outOfScope,
      modelDiverged: !!verified.modelDiverged || (verified.verified && modelQuote && verified.similarity < 0.55),
    });

    if (verified.verified && verified.quote) {
      out.push(`"${verified.quote}"`);
      i = j; // consume original quote line
      continue;
    }

    out.push(quoteLine);
    i = j;
  }

  // Also annotate any bold citations that had no quote block
  const allCites = extractCitations(text);
  for (const c of allCites) {
    if (citations.some((x) => x.citation === c)) continue;
    const v = await verifyPassage({ verse: c, quote: '' });
    citations.push({
      citation: c,
      verified: v.verified,
      quote: v.quote,
      verse: v.verse || c,
      similarity: v.similarity,
      source: v.source,
      outOfScope: !!v.outOfScope,
    });
  }

  return {
    text: out.join('\n'),
    citations,
    grounded: citations.filter((c) => c.verified).length,
    unverified: citations.filter((c) => !c.verified).length,
    outOfScope: citations.filter((c) => c.outOfScope).length,
  };
}

async function annotateAdvisorText(text) {
  return groundAdvisorText(text);
}

/** Build offline daily content from corpus (no LLM). */
function offlineDaily(dateSeed) {
  const list = corpus.passages;
  const day = Math.abs(hash(dateSeed || new Date().toISOString().slice(0, 10)));
  const a = list[day % list.length];
  const b = list[(day + 7) % list.length];
  const affirmations = [
    'You are held in the same care Jesus named for the sparrows — seen, known, and valued.',
    'You do not have to carry tomorrow’s weight today. His words give you this hour.',
    'You are invited to rest under a yoke that is light — not to prove yourself, but to receive Him.',
    'You are not forgotten. The One who spoke peace still speaks it over anxious hearts.',
    'You can return to His words whenever the day grows loud. They remain.',
  ];
  return {
    affirmation: {
      text: affirmations[day % affirmations.length],
      verse: corpus.cite(a),
      quote: a.text,
      verified: true,
    },
    word: {
      theme: a.theme[0],
      title: 'His Words for Today',
      passage: b.text,
      verse: corpus.cite(b),
      reflection: 'Sit with these words without rushing. Let one phrase stay with you through the next thing you must do.',
      verified: true,
    },
    offline: true,
    verified: true,
  };
}

// Warm, theme-specific framing for corpus-mode replies (no model involved).
const THEME_CONTEXT = {
  'Anxiety & Worry': [
    'He is not scolding the worry — He is pointing at what already holds you.',
    'Spoken to people with real bills and real fears, not to people who had it easy.',
    'Let this be about today. Tomorrow is not yours to carry yet.',
  ],
  'Grief & Loss': [
    'He does not hurry the mourner, and He does not explain the loss away.',
    'These words were spoken to people who were actually weeping.',
    'He promises to be in the loss with you, not to make it small.',
  ],
  Forgiveness: [
    'He knew how hard this is — He was asked about it more than once.',
    'Forgiveness here is a release you are given, not a debt you must earn.',
    'These words were spoken to people who had been wronged for real.',
  ],
  Loneliness: [
    'This is a promise, not a mood. It does not depend on how the room feels.',
    'He speaks as someone who knew what it is to be left by friends.',
    'You are counted — one by one, not as a crowd.',
  ],
  'Conflict & Relationships': [
    'He does not pretend the other person is easy. He shows a way through anyway.',
    'This is spoken to the wounded party, not to excuse the wound.',
    'Peace here is something you carry into the room, not something you wait for.',
  ],
  Fear: [
    'He said these kinds of words to frightened people in real danger.',
    'Fear is met here with presence, not with a lecture.',
    'He does not say the storm is not real. He says who is in it with you.',
  ],
  'Purpose & Direction': [
    'A call, not a checklist. It begins with following, not with figuring it all out.',
    'Your next step is allowed to be small.',
    'He gives direction as an invitation, never as pressure.',
  ],
  'Faith & Doubt': [
    'He said things like this to people who were unsure, and He did not rush them.',
    'The doubters in the Gospels were still welcomed to the table.',
    'Belief here is offered, not demanded.',
  ],
  'Suffering & Pain': [
    'Rest is offered to the weary, not to the finished.',
    'He does not promise the pain is small. He promises you will not carry it alone.',
    'Spoken by someone who suffered, to people who did too.',
  ],
  'Shame & Guilt': [
    'He spoke this way to people the crowd had already condemned.',
    'Not condoned, not condemned — released.',
    'His first word to the ashamed was never “how could you.”',
  ],
  Peace: [
    'This peace is His to give — it is not something you have to manufacture.',
    'He spoke of peace on nights He knew what was coming. It was still His word.',
    'You may take this as a gift, not an assignment.',
  ],
  Hope: [
    'Spoken to people who could not yet see how things would turn out.',
    'Hope here rests on Him, not on the odds.',
    'He speaks as someone who has already overcome what frightens you.',
  ],
};

// Hand-curated lead passages per theme, in the order a careful friend would
// offer them, each with a one-line "why" that is true of that passage.
// Corpus-mode replies show the first two, then one of the remaining leads.
const THEME_LEADS = {
  'Anxiety & Worry': [
    ['mt6-25-27', 'He does not shame the worry. He points at the birds and asks you to look up for a moment.'],
    ['mt11-28-30', 'Rest is offered to the burdened, not to the finished. You qualify right now.'],
    ['mt6-34', 'Only today is yours to carry. He says so plainly.'],
    ['jn14-27', 'A peace that is given, not earned — and He tells you not to let fear take it back.'],
  ],
  'Grief & Loss': [
    ['mt5-4', 'He does not hurry the mourner. Mourning itself is named blessed.'],
    ['jn14-1-3', 'Said to friends about to lose Him: a promised place, and a promised return.'],
    ['jn16-20-22', 'He does not deny the weeping. He says it will not have the last word.'],
    ['jn11-25-26', 'Spoken at a tomb to a grieving sister. The question at the end is gentle, not a test.'],
  ],
  Forgiveness: [
    ['mt18-21-22', 'Asked how many times, He refused to set a ceiling.'],
    ['lk6-37', 'Set free — forgiveness here is a release, for you as much as for them.'],
    ['mt6-14-15', 'He ties our release to theirs; forgiveness is a way of living, not a single transaction.'],
    ['lk23-34', 'He said this while it was being done to Him. Forgiveness at its costliest.'],
  ],
  Loneliness: [
    ['mt28-20', 'Always. Not when you feel it — always.'],
    ['jn14-18', '“Orphans” is His word for how abandonment feels. He promises to come.'],
    ['mt18-12-14', 'One out of a hundred is still worth the search. That is how He counts.'],
    ['jn10-27-28', 'He knows His own by name, and no one snatches them away.'],
  ],
  'Conflict & Relationships': [
    ['mt7-12', 'Start with what you would want done to you — He says this is the whole of it.'],
    ['mt5-23-24', 'He puts repair before ritual: go and make it right first.'],
    ['lk17-3-4', 'Rebuke and forgive both belong here — honesty and mercy in one breath.'],
    ['mt5-44', 'He does not pretend the other person is easy. He shows a way through anyway.'],
  ],
  Fear: [
    ['mt14-27', 'Spoken across the water to terrified friends. Presence before explanation.'],
    ['mt10-29-31', 'He knows the count of sparrows and the hairs on your head. You are not unnoticed.'],
    ['lk12-32', '“Little flock” — He names how small and exposed we feel, and answers it with the Father’s pleasure.'],
    ['jn16-33', 'He does not say the trouble is not real. He says who has already overcome it.'],
  ],
  'Purpose & Direction': [
    ['jn15-16', 'You were chosen before you chose. Purpose starts as a gift.'],
    ['mt5-14-16', 'You are already light. The work is letting it be seen, not manufacturing it.'],
    ['mt6-33', 'Seek first — one thing, not the whole plan. The rest follows.'],
    ['mt25-21', 'Faithful over a few things. He counts the small work.'],
  ],
  'Faith & Doubt': [
    ['mt17-20', 'Faith the size of a mustard seed is still faith. He works with small.'],
    ['jn20-29', 'Said to a doubter He had just welcomed back. A blessing for those who cannot see.'],
    ['mt7-7-8', 'Ask, seek, knock — the invitation stands for the unsure.'],
    ['mk5-36', 'Said to a father at the worst moment of his life. Fear and faith, side by side.'],
  ],
  'Suffering & Pain': [
    ['mt11-28-30', 'Come to me — the invitation is to the weary, not the strong.'],
    ['lk6-21', 'He blesses those who weep now. Now is where He meets you.'],
    ['jn16-33', 'Oppression is real; so is His peace. Both are in one sentence.'],
    ['mt26-39', 'He asked for the cup to pass, too. You are allowed to ask.'],
  ],
  'Shame & Guilt': [
    ['jn8-10-11', 'Said to a woman the crowd had already condemned. Neither do I condemn you.'],
    ['lk15-20-24', 'The father ran — before the speech, before the apology was finished.'],
    ['lk7-50', 'Go in peace — released, not lectured.'],
    ['jn8-36', 'Free indeed — His word, not a loophole.'],
  ],
  Peace: [
    ['jn14-27', 'My peace I give — a gift, not an assignment.'],
    ['jn14-1', 'Don’t let your heart be troubled: He speaks it as something you can receive.'],
    ['mk4-39', 'Spoken to a storm. It obeyed.'],
    ['jn20-19', 'His first words to friends who had failed Him: Peace be to you.'],
  ],
  Hope: [
    ['jn16-33', 'I have overcome — past tense. Hope rests on what is already done.'],
    ['jn10-10', 'Abundant life is His stated purpose for coming.'],
    ['mt24-35', 'Everything else passes. His words do not.'],
    ['lk12-32', 'The Kingdom is given with pleasure, not grudgingly.'],
  ],
};

// First line of a corpus-mode reply. Meets the person before any verse.
const THEME_OPENER = {
  'Anxiety & Worry': 'That kind of worry is exhausting, and it is not a failure of faith to feel it. Here are words Jesus spoke to people carrying the same weight:',
  'Grief & Loss': 'I am so sorry. Grief does not keep the schedule everyone else does, and you do not have to be “back to normal.” Jesus spoke into exactly this:',
  Forgiveness: 'Forgiveness is one of the hardest things anyone is asked to do, and the hurt underneath it is real. Here is what Jesus actually said about it:',
  Loneliness: 'Loneliness has a way of convincing you that no one sees you. Jesus spoke directly to that feeling:',
  'Conflict & Relationships': 'Conflict with someone close is its own kind of pain. Jesus did not avoid this subject; here are His words:',
  Fear: 'Fear is a heavy thing to carry alone. Jesus said “don’t be afraid” more than almost anything else — here is how He said it:',
  'Purpose & Direction': 'Not knowing what comes next is disorienting, and you are not behind. Here is what Jesus said about where to begin:',
  'Faith & Doubt': 'Doubt is not the opposite of faith; it is usually faith asking honest questions. Jesus met doubters gently, and these are His words:',
  'Suffering & Pain': 'I am sorry you are in this much pain. Jesus never pretended suffering was small — here is what He said to people in it:',
  'Shame & Guilt': 'Carrying guilt alone is crushing. Notice how Jesus actually spoke to people who had failed — it is not what most expect:',
  Peace: 'You asked for peace, and that is a good thing to ask for. Jesus offered it in His own words:',
  Hope: 'Thank you for bringing this here. Here are words Jesus spoke to people who could not yet see how things would turn out:',
};

/** Build offline encouragement pack from corpus. `seed` varies the third pick deterministically. */
function offlineEncouragement(theme, seed) {
  const byId = new Map(corpus.passages.map((p) => [p.id, p]));
  const leads = (THEME_LEADS[theme] || []).filter(([id]) => byId.has(id));
  const contexts = THEME_CONTEXT[theme] || [`Jesus speaks directly into ${String(theme).toLowerCase()}.`];
  const h = seed ? Math.abs(hash(String(seed))) : 0;

  let chosen;
  if (leads.length >= 3) {
    const rest = leads.slice(2);
    const third = rest[h % rest.length];
    const remaining = rest.filter((l) => l !== third);
    chosen = [leads[0], leads[1], third, ...remaining].slice(0, 4);
  } else {
    const picks = corpus.byTheme(theme);
    const pool = picks.length ? picks : corpus.passages;
    const start = seed ? h % pool.length : 0;
    chosen = pool.slice(start).concat(pool.slice(0, start)).slice(0, 4).map((p, i) => [p.id, contexts[(start + i) % contexts.length]]);
  }

  const passages = chosen.map(([id, why]) => {
    const p = byId.get(id);
    return {
      verse: corpus.cite(p),
      quote: p.text,
      context: why,
      verified: true,
      source: 'corpus',
    };
  });
  return {
    theme,
    opener: THEME_OPENER[theme] || 'I hear you. Here are words Jesus actually spoke that speak into what you shared:',
    headline: `Held in His Words`,
    opening: `Whatever brought you here under “${theme}” — you do not have to carry it alone. Here are words Jesus actually spoke.`,
    passages,
    practice: 'Read one passage aloud once. Then sit in silence for one minute before you move on.',
    closing: 'His words remain. You can return to them whenever you need.',
    offline: true,
    verified: true,
  };
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const CRISIS_PATTERNS = [
  /\bkill\s+myself\b/i,
  /\bsuicid/i,
  /\bend\s+my\s+life\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt\s+myself\b/i,
  /\bcut(?:ting)?\s+myself\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\bend(?:ing)?\s+it\s+all\b/i,
  /\bbetter\s+off\s+(?:if\s+i\s+(?:was|were|am|died)\s+)?(?:dead|gone|without\s+me)\b/i,
  /\bwish\s+i\s+(?:was|were)\s+dead\b/i,
  /\bno\s+reason\s+to\s+(?:live|go\s+on|keep\s+going|be\s+alive)\b/i,
  /\bdon'?t\s+want\s+to\s+(?:be\s+here|be\s+alive|live|wake\s+up)\s*(?:anymore|any\s+more)?\b/i,
  /\boverdos(?:e|ing)\b/i,
  /\bplan(?:ning)?\s+to\s+(?:die|kill)\b/i,
];

function detectCrisis(text) {
  return CRISIS_PATTERNS.some(re => re.test(String(text || '')));
}

// Danger to the person from someone else (domestic violence, abuse). Handled
// deterministically so the handoff never depends on the model.
const ABUSE_PATTERNS = [
  /\b(?:he|she|they|my (?:husband|wife|partner|boyfriend|girlfriend|dad|mom|father|mother|parent|son|daughter|brother|sister|ex))\b[^.!?]{0,60}\b(?:hits?|hit|beats?|beat|chokes?|choked|punche[sd]|slap(?:s|ped)|threatens? to (?:kill|hurt)|threatened to (?:kill|hurt))\b[^.!?]{0,40}\b(?:me|us|the kids|my kids|my children)\b/i,
  /\b(?:being|getting|been|am|i'm|i am)\s+(?:physically |sexually )?(?:abused|assaulted|raped|molested)\b/i,
  /\b(?:abusive|violent)\s+(?:husband|wife|partner|boyfriend|girlfriend|relationship|marriage|home|parent|father|mother)\b/i,
  /\b(?:domestic violence|domestic abuse)\b/i,
  /\b(?:i'?m|i am|we are|we're) (?:not safe|in danger|scared for my life|afraid for my life)\b/i,
  /\bafraid (?:he|she|they)(?:'ll| will|'s going to| is going to) (?:hurt|kill) (?:me|us|the kids)\b/i,
];
function detectAbuse(text) {
  return ABUSE_PATTERNS.some(re => re.test(String(text || '')));
}

// Requests the Advisor is not for: code, homework, trivia, weather, sports,
// medical dosing, legal filings, betting. Life questions that merely mention
// these words still pass through (see the negative guards below).
const OFFSCOPE_PATTERNS = [
  /\b(?:write|fix|debug|generate|refactor)\b[^.!?]{0,40}\b(?:code|function|script|program|regex|sql|query|python|javascript|java|c\+\+|html|css)\b/i,
  /\b(?:python|javascript|typescript|c\+\+|sql|regex)\b[^.!?]{0,30}\b(?:error|bug|snippet|code|function)\b/i,
  /\bcapital of\b|\bhow many (?:ounces|grams|miles|kilometers|calories|planets|states)\b|\bwhat year (?:did|was)\b|\bwho (?:won|invented|discovered)\b/i,
  /\b(?:weather|forecast|temperature) (?:today|tomorrow|this week|in [A-Z][a-z]+)\b/i,
  /\b(?:stock|share) price\b|\bbitcoin\b|\bcrypto\b|\bwhich stocks?\b|\bshould i (?:buy|sell|short) (?:stock|shares|crypto|bitcoin)\b|\bbetting odds\b|\bparlay\b/i,
  /\b(?:solve|calculate|compute|what is|what's)\s+[\d(][\d\s+\-*/^().x=]*[\d)]\s*[?]?$/i,
  /\b(?:essay|homework|book report|cover letter|resume|résumé|business plan|marketing plan)\b[^.!?]{0,40}\b(?:write|draft|for me|do my)\b|\b(?:write|draft|do) my (?:essay|homework|cover letter|resume|résumé)\b/i,
  /\b(?:recipe for|how (?:do i|to) (?:cook|bake|install|configure|reset|unlock|jailbreak))\b/i,
  /\b(?:dosage|how many (?:mg|milligrams|pills)|what dose)\b/i,
  /\b(?:translate|translation of) (?:this|the following|into)\b/i,
  /\bwho (?:will|is going to) win (?:the|this)\b|\bpredict (?:the|this) (?:game|match|election|season)\b/i,
  /\b(?:tell me|write) (?:a|me a) (?:joke|poem|story|song|rap|limerick)\b/i,
];
function detectOffScope(text) {
  const t = String(text || '');
  if (/\b(?:god|jesus|pray|faith|forgive|grief|anxious|anxiety|afraid|lonely|hurt|marriage|divorce|my (?:son|daughter|wife|husband|mom|dad|friend))\b/i.test(t) &&
      !/\b(?:code|python|javascript|sql|regex|homework|essay|stock|bitcoin|weather|capital of)\b/i.test(t)) {
    return false;
  }
  return OFFSCOPE_PATTERNS.some(re => re.test(t));
}

// Contempt or attack aimed at the Advisor, the faith, or Jesus. Not blocked —
// routed to a warm, non-defensive reply.
const HOSTILE_PATTERNS = [
  /\b(?:this|your app|you|this app|this bot|religion|christianity|the bible|jesus|god) (?:is|are) (?:a )?(?:scam|fake|bullshit|bs|garbage|stupid|a joke|nonsense|a lie|made up|useless|a fairy ?tale|a cult)\b/i,
  /\bjesus (?:never existed|isn'?t real|is a myth|was a fraud|was just a man)\b/i,
  /\b(?:prove|show me proof|where'?s (?:your|the) (?:proof|evidence))\b[^.!?]{0,40}\b(?:god|jesus|exists|real)\b/i,
  /\b(?:fuck|screw|shut up|damn) (?:you|this|off|jesus|god)\b|\bf\*+k (?:you|this|off)\b/i,
  /\byou'?re (?:just )?(?:a|an) (?:ai|bot|chatbot|program|computer|algorithm)\b[^.!?]{0,40}\b(?:what do you know|you can'?t|don'?t pretend|stop pretending)\b/i,
  /\bwhy (?:would|should) i (?:listen to|trust|believe) (?:you|a bot|an ai|a computer|this)\b/i,
];
function detectHostile(text) {
  return HOSTILE_PATTERNS.some(re => re.test(String(text || '')));
}

/**
 * Deterministic intent gate that runs before any model call.
 * Order matters: safety first, then scope, then tone.
 */
function classifyIntent(text) {
  if (detectCrisis(text)) return 'crisis';
  if (detectAbuse(text)) return 'abuse';
  if (detectOffScope(text)) return 'offscope';
  if (detectHostile(text)) return 'hostile';
  return 'guidance';
}

module.exports = {
  corpus,
  verifyPassage,
  verifyPassages,
  annotateAdvisorText,
  groundAdvisorText,
  extractCitations,
  offlineDaily,
  offlineEncouragement,
  detectCrisis,
  detectAbuse,
  detectOffScope,
  detectHostile,
  classifyIntent,
  isGospelRef,
  similarity,
};
