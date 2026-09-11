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
const GOSPEL_RE = /^(?:matthew|matt|mat|mt|mark|mk|mr|luke|lk|lu|john|jn|joh)\.?\s+\d+:\d+/i;

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
    // The text is exact WEB and inside the Gospels, but bible-api cannot tell
    // us who is speaking (Matthew 1:1 is narration). Only the curated corpus
    // can vouch for red letters, so this is honest-but-not-verified.
    return {
      verse: api.reference,
      quote: api.text,
      context: context || undefined,
      verified: false,
      speakerUnverified: true,
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
    const headerIndex = out.length;
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
      speakerUnverified: !!verified.speakerUnverified,
      modelDiverged: !!verified.modelDiverged || (verified.verified && modelQuote && verified.similarity < 0.55),
    });

    if ((verified.verified || verified.speakerUnverified) && verified.quote) {
      // The text shown must be labelled with the range it actually covers.
      if (verified.verse && verified.verse !== citation) out[headerIndex] = `**${verified.verse}**`;
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
      speakerUnverified: !!v.speakerUnverified,
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
    ['jn13-34-35', 'Love one another, as I have loved you — the measure is His love, not their behaviour.'],
    ['mt7-1-3', 'He asks you to look at your own eye first. Not to excuse them; to free you.'],
    ['mt5-23-24', 'He puts repair before ritual: go and make it right first.'],
  ],
  Fear: [
    ['mt10-29-31', 'He knows the count of sparrows and the hairs on your head. You are not unnoticed.'],
    ['jn14-27', 'His peace is given, not earned — and He tells you not to let fear take it back.'],
    ['lk12-32', '“Little flock” — He names how small and exposed we feel, and answers it with the Father’s pleasure.'],
    ['jn14-1', 'Don’t let your heart be troubled — He speaks it as something you can receive, not perform.'],
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
    ['mt26-39', 'He asked for the cup to pass, too. You are allowed to ask.'],
    ['jn14-1', 'Troubled hearts were the ones He was speaking to.'],
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
    ['mt11-28-30', 'Come to me — the first word to the weary is an invitation, not a demand.'],
    ['lk12-32', 'The Kingdom is given with pleasure, not grudgingly.'],
    ['jn14-27', 'Peace as a gift, left with you on purpose.'],
    ['mt7-7-8', 'Ask, seek, knock — the door is described as one that opens.'],
  ],
};

// First line of a corpus-mode reply. Meets the person before any verse.
const THEME_OPENER = {
  'Anxiety & Worry': 'That kind of worry is exhausting, and it is not a failure of faith to feel it. Here are words Jesus spoke to people carrying the same weight:',
  'Grief & Loss': 'I am so sorry. Grief does not keep the schedule everyone else does, and you do not have to be “back to normal.” Jesus spoke into exactly this:',
  Forgiveness: 'Forgiveness is one of the hardest things anyone is asked to do, and the hurt underneath it is real. Here is what Jesus actually said about it:',
  Loneliness: 'Loneliness has a way of convincing you that no one sees you. Jesus spoke directly to that feeling:',
  'Conflict & Relationships': 'The people closest to us are where this gets hardest, and it is good that you want to get it right. Jesus spoke plainly about how to treat one another — here are His words:',
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

// Normalise before classifying: NFKC, strip zero-width chars, collapse
// whitespace, lowercase. Keeps "k\u200bill myself" and curly apostrophes from
// slipping past the patterns.
function normForIntent(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/[\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Active suicidal / self-harm intent. Written for how people actually type at
// 2 a.m.: contractions, slang, typos, methods, farewells.
const CRISIS_PATTERNS = [
  /\bkill (?:my ?self)\b|\b(?:wanna|want to|gonna|going to|should i|could i) kill me\b/,
  /\bsu+i+c+i+d|\bsucide|\bsuicde|\bsuiside/,
  /\bkms\b|\bunalive\b/,
  /\bend (?:my|it|things|everything|my own)\b(?: ?(?:life|all|tonight|today))?/,
  /\bending (?:my (?:own )?life|it all|things|everything)\b/,
  /\btake (?:my (?:own )?life|all (?:my|the) pills)\b/,
  /\b(?:wanna|want to|going to|gonna|ready to|plan(?:ning)? to|about to|thinking (?:of|about)) (?:die|be dead|end (?:it|things|my life|everything)|kill (?:my ?self|me)|jump|hang (?:my ?self|me)|overdose|od\b|not (?:be here|exist|wake up)|disappear for good|stop existing)\b/,
  /\b(?:i )?(?:wanna|want to) (?:die|be dead|not exist|stop existing)\b/,
  /\bdon'?t (?:want|wanna) to (?:be here|be alive|live|wake up|exist|go on|keep going)\b/,
  /\b(?:dont|don'?t) wanna live\b|\bno (?:reason|point) (?:to|in) (?:live|living|go(?:ing)? on|keep going|be(?:ing)? alive|being here)\b/,
  /\blife (?:isn'?t|is not|aint|ain'?t) worth (?:living|it)\b/,
  /\b(?:better off|be better|be happier) (?:if i (?:was |were |am |just |had )?(?:dead|gone|died)|if i (?:wasn'?t|weren'?t|had never been|was never) (?:here|around|alive|born)|without me|dead|gone)\b/,
  /\b(?:no|don'?t see (?:a|the|any)|can'?t see (?:a|the|any)|there'?s no) point (?:in|of|to) (?:being alive|living|staying alive|life anymore|going on)\b/,
  /\b(?:wanna|want to) dye\b(?! (?:my|the|his|her) )/,
  /\bwish i (?:was|were|could be) dead\b|\bwish i (?:had never been born|wasn'?t born|would die|could die|didn'?t wake up|would disappear)\b/,
  /\bself[- ]?harm(?:ing|ed)?\b|\bhurt(?:ing)? myself\b|\bcut(?:ting)? (?:myself|again|my (?:wrists?|arms?))\b/,
  /\bhang(?:ing)? myself\b|\bjump (?:off|from|in front of)\b|\bgoing to jump\b/,
  /\boverdos(?:e|ing|ed)\b|\bpills (?:lined up|in front of me|ready|in my hand)\b|\btake all (?:my|the|these) pills\b|\bswallow (?:all )?(?:the|my|these) pills\b/,
  /\b(?:i have|i've got|got) (?:a )?(?:gun|rope|pills|blade|knife) (?:and|ready|in my hand|next to me|and i know)\b/,
  /\b(?:written|wrote|writing) (?:my|the|a) (?:suicide )?note\b|\bgoodbye(?: letter| note)?\b.{0,40}\b(?:tell|sorry)\b/,
  /\b(?:end|ending) (?:things|it|everything) tonight\b|\btonight (?:is|will be) the (?:night|last)\b|\bnot going to be here tomorrow\b|\bwon'?t be here tomorrow\b/,
  /\b(?:how (?:much|many) (?:tylenol|acetaminophen|ibuprofen|pills|sleeping pills|xanax|benadryl))\b.{0,40}\b(?:die|not wake up|kill|overdose|end)\b/,
  /\bplan(?:ning)? to (?:die|kill|end)\b/,
  /\bsleep and never wake up\b|\bnever wake up\b/,
  /\b(?:want|need) (?:it|this|everything|the pain) to (?:stop|end|be over)\b.{0,30}\b(?:for good|forever|permanently)\b/,
  /\b(?:i'?m|i am) (?:done|finished) (?:with life|living|with everything)\b/,
  // Spanish (common in US audience)
  /\bquiero morir(?:me)?\b|\bmatarme\b|\bsuicidarme\b|\bquitarme la vida\b|\bno quiero vivir\b/,
];
function detectCrisis(text) {
  const t = normForIntent(text);
  return CRISIS_PATTERNS.some((re) => re.test(t));
}

// Passive ideation / farewell language that is not an explicit statement of
// intent. Not blocked — the reply keeps its scripture but appends a 988 line.
const PASSIVE_IDEATION_PATTERNS = [
  /\bnobody (?:would|will) (?:notice|miss|care)\b.{0,30}\b(?:gone|disappeared|dead|died|wasn'?t (?:here|around))\b/,
  /\b(?:everyone|everybody|they|my family|my kids) (?:would|will) be (?:fine|better|happier|better off) (?:without me|if i (?:wasn'?t|weren'?t) (?:here|around))\b/,
  /\bwhat(?:'s| is) the point (?:of (?:anything|living|going on|it all|me|any of (?:this|it)))?\b/,
  /\b(?:i )?(?:can'?t|cannot) (?:do|take|go on like) this (?:anymore|any more|any longer)\b/,
  /\bnobody would (?:notice|miss|care) if i (?:disappeared|was gone|were gone|died|left)\b/,
  /\bi (?:just )?want (?:it|this|everything|the pain) to (?:stop|end|be over)\b/,
  /\b(?:tired of|sick of) (?:living|being alive|existing|life)\b/,
  /\bi (?:feel like|wish i could) (?:disappear|vanish)\b|\bdisappear(?:ing)? (?:forever|for good)\b/,
  /\bhow much (?:tylenol|acetaminophen|ibuprofen|pills|sleeping pills|xanax|benadryl)\b/,
  /\b(?:goodbye|good bye|farewell)\b.{0,60}\b(?:sorry|tell (?:my|them|everyone))\b/,
];
function detectPassiveIdeation(text) {
  const t = normForIntent(text);
  return PASSIVE_IDEATION_PATTERNS.some((re) => re.test(t));
}

// Danger to the person from someone else (domestic violence, sexual abuse,
// child abuse). Handled deterministically so the handoff never depends on
// the model. Patterns are deliberately loose: a false positive costs a
// hotline line; a false negative can cost far more.
const PERSON = "(?:he|she|they|my (?:hus?band|husbamd|wife|partner|boyfriend|girlfriend|bf|gf|fianc[eé]e?|dad|mom|mum|father|mother|stepdad|stepmom|step-?father|step-?mother|parents?|son|daughter|brother|sister|uncle|aunt|ex|roommate|boss|coach|pastor|teacher))";
const VIOLENCE = "(?:hits?|hitting|beats?|beating|chok(?:es?|ed|ing)|strangl(?:es?|ed|ing)|punch(?:es|ed|ing)?|slap(?:s|ped|ping)?|kick(?:s|ed|ing)?|shov(?:es?|ed|ing)|push(?:es|ed) me (?:down|into|against)|threw|throws|grab(?:s|bed) me|drag(?:s|ged) me|pull(?:s|ed) my hair|spits? (?:on|at) me|burn(?:s|ed) me|put his hands on me|puts his hands on me|laid hands on me|lock(?:s|ed) me (?:in|out|up)|took my phone|takes my phone|won'?t let me leave|threatens? (?:to )?(?:kill|hurt|beat)|threatened (?:to )?(?:kill|hurt|beat)|rap(?:es?|ed|ing)|forc(?:es?|ed|ing) me to have sex|forced (?:himself|herself) on me|touch(?:es|ed|ing) me|molest(?:s|ed|ing)?)";
const ABUSE_PATTERNS = [
  new RegExp(`\\b${PERSON}\\b[^.!?]{0,60}\\b${VIOLENCE}\\b`),
  new RegExp(`\\b${VIOLENCE}\\b[^.!?]{0,20}\\b(?:me|us|my (?:kids?|children|little (?:sister|brother)|daughter|son|mom|mother))\\b`),
  /\b(?:being|getting|been|am|i'm|i am|was|got|i was) (?:physically |sexually |emotionally )?(?:abused|assaulted|raped|molested|beaten|beat up|hit|choked|strangled|groped)\b/,
  /\b(?:someone|he|she|they|a man|my \w+) (?:raped|assaulted|molested|groped|forced) me\b|\bforced (?:me )?to have sex\b|\bhad sex with me (?:when|while) i (?:was|said)\b|\bi (?:said no|didn'?t consent|told (?:him|her|them) (?:no|to stop))\b.{0,40}\b(?:anyway|didn'?t stop|kept going)\b/,
  /\b(?:abusive|violent) (?:husband|wife|partner|boyfriend|girlfriend|relationship|marriage|home|parent|father|mother|dad|mom|ex)\b/,
  /\b(?:domestic violence|domestic abuse|sexual abuse|sexually abused|child abuse|molested)\b/,
  /\b(?:i'?m|i am|we are|we're) (?:not safe|in danger|scared for my life|afraid for my life|being hurt)\b/,
  /\b(?:i'?m|i am|im) (?:scared|afraid|terrified) of my (?:husband|wife|partner|boyfriend|girlfriend|dad|mom|father|mother|stepdad|stepmom|ex)\b/,
  /\bafraid (?:he|she|they)(?:'ll| will|'s going to| is going to|s gonna| gonna) (?:hurt|kill|hit|beat) (?:me|us|the kids|my kids)\b/,
  /\btouch(?:es|ed|ing) me (?:when|where|and|in)\b|\btouches me (?:inappropriately|down there|at night|when mom)\b/,
  /\b(?:hits?|beats?|kicks?|chokes?|hurts?) my (?:little |younger |baby )?(?:sister|brother|kids?|children|daughter|son)\b/,
  /\bcontrols? (?:all )?(?:my|our) money\b.{0,60}\b(?:worthless|stupid|can'?t leave|scared|afraid|threat)\b/,
  /\bthrew (?:a |the )?\w+ at (?:me|my head|my face)\b/,
  // Spanish disclosures (US audience). Loose on purpose — same as English.
  /\b(?:mi (?:esposo|esposa|marido|mujer|novio|novia|papá|padre|mamá|madre|padrastro)|él|ella)\b[^.!?]{0,40}(?:me (?:pega|pegó|golpea|golpeó|encierra|amenaza|viola|violó|tocó|toca)|pega(?:r)?me|golpearme)/u,
  /(?:me (?:está |estan |están )?golpeando|me pega|me viola|me abusó|abuso (?:doméstico|sexual)|violencia (?:doméstica|de género))/u,
  /(?:tengo|tenemos) miedo de (?:mí|mi|él|ella|mi (?:esposo|marido|novio|padre))/u,
];
function detectAbuse(text) {
  const t = normForIntent(text);
  return ABUSE_PATTERNS.some((re) => re.test(t));
}

// Requests the Advisor is not for: code, homework, trivia, weather, sports,
// medical dosing, finance tips, betting. A life question that merely mentions
// one of these words passes through: EMOTIONAL_GUARD wins unless the sentence
// is plainly a request for the thing itself.
const EMOTIONAL_GUARD =
  /\b(?:god|jesus|pray|faith|forgiv|griev|grief|mourn|anxious|anxiety|afraid|scared|terrified|lonely|alone|hurt|hurting|marriage|divorce|hopeless|worthless|broke|broken|gambl|exhausted|numb|depress|cry|crying|tears|died|death|dying|funeral|hospital|relapse|sober|addict|hate myself|can'?t sleep|panic|ashamed|shame|guilt|betray|cheated|abandon|miscarr|cancer|diagnos|sick|fired|laid off|lost my|my (?:son|daughter|wife|husband|mom|dad|friend|partner|neighbor|neighbour|family|kids?|baby)|feel(?:ing)? (?:like|so|lost|empty))\w*\b/;
const OFFSCOPE_PATTERNS = [
  /\b(?:write|fix|debug|generate|refactor|explain)\b[^.!?]{0,40}\b(?:code|function|script|program|regex|sql|query|python|javascript|java|c\+\+|html|css)\b/,
  /\b(?:python|javascript|typescript|c\+\+|sql|regex)\b[^.!?]{0,30}\b(?:error|bug|snippet|code|function)\b/,
  /\bcapital of\b|\bhow many (?:ounces|grams|miles|kilometers|calories|planets|states|countries)\b|\bwhat year (?:did|was)\b|\bwho (?:won|invented|discovered)\b|\bhow (?:tall|old|far|big) is\b/,
  /\b(?:weather|forecast|temperature) (?:today|tomorrow|this week|in [a-z]+)\b/,
  /\b(?:stock|share|bitcoin|btc|eth|crypto) price\b|\bwhich (?:stocks?|coins?) (?:should|to) (?:i )?buy\b|\bshould i (?:buy|sell|short|invest in) (?:stocks?|shares|crypto|bitcoin|btc|eth|gold|tesla|nvidia)\b|\bbetting odds\b|\bparlay\b|\bprice prediction\b/,
  /\b(?:solve|calculate|compute|what is|what's)\s+[\d(][\d\s+\-*/^().x=]*[\d)]\s*[?]?$/,
  /\b(?:essay|homework|book report|cover letter|resume|résumé|business plan|marketing plan)\b[^.!?]{0,40}\b(?:write|draft|for me|do my)\b|\b(?:write|draft|do) my (?:essay|homework|cover letter|resume|résumé)\b/,
  /\b(?:recipe for|how (?:do i|to) (?:cook|bake|install|configure|reset|unlock|jailbreak|root))\b/,
  /\b(?:how many (?:mg|milligrams|pills|tablets) (?:of \w+ )?(?:can|should) i take|what(?:'s| is) the (?:max|maximum|right|correct|safe) dos(?:e|age)|safe dos(?:e|age)|max dos(?:e|age)|can i take \d+ ?(?:mg|pills|tablets))\b/,
  /\b(?:translate|translation of) (?:this|the following|into)\b/,
  /\bwho (?:will|is going to|'s gonna) win (?:the|this|tonight)\b|\bpredict (?:the|this) (?:game|match|election|season)\b/,
  /\b(?:tell me|write) (?:a|me a) (?:joke|poem|story|song|rap|limerick|haiku)\b/,
];
function detectOffScope(text) {
  const t = normForIntent(text);
  if (EMOTIONAL_GUARD.test(t) && !/\b(?:write|fix|debug) (?:me )?(?:a |some )?(?:code|function|script|python)|\bcapital of\b|\bhomework for me\b|\bmy essay for me\b/.test(t)) {
    return false;
  }
  return OFFSCOPE_PATTERNS.some((re) => re.test(t));
}

// Contempt or attack aimed at the Advisor, the faith, or Jesus. Not blocked —
// routed to a warm, non-defensive reply.
const HOSTILE_PATTERNS = [
  /\b(?:this|your app|you|this app|this bot|religion|christianity|the bible|jesus|god) (?:is|are) (?:a |just a |all )?(?:scam|fake|bullshit|bs|garbage|stupid|a joke|nonsense|a lie|made up|useless|a fairy ?tale|fairy ?tales?|a cult|for (?:weak|stupid|dumb) people)\b/,
  /\bjesus (?:never existed|isn'?t real|is a myth|was a fraud|was just a man|is fake)\b/,
  /\b(?:prove|show me proof|where'?s (?:your|the) (?:proof|evidence))\b[^.!?]{0,40}\b(?:god|jesus|exists|real)\b/,
  /\b(?:fuck|screw|shut up|damn) (?:you|this|off|jesus|god)\b|\bf\*+k (?:you|this|off)\b/,
  /\byou'?re (?:just )?(?:a|an) (?:ai|bot|chatbot|program|computer|algorithm)\b[^.!?]{0,40}\b(?:what do you know|you can'?t|don'?t pretend|stop pretending)\b/,
  /\bwhy (?:would|should) i (?:listen to|trust|believe) (?:you|a bot|an ai|a computer|this|a \d+ year old book)\b/,
];
function detectHostile(text) {
  const t = normForIntent(text);
  return HOSTILE_PATTERNS.some((re) => re.test(t));
}

/** Rough Spanish detector for the safety replies (two or more common function words). */
function looksSpanish(text) {
  const t = normForIntent(text);
  const hits = (t.match(/\b(?:quiero|vivir|morir|morirme|estoy|muy|triste|ayuda|ayúdame|me siento|no sé|qué|hacer|mi vida|nadie|solo|sola|dios|jesús|por favor|ya no|puedo|tengo|esposo|esposa|marido|novio|novia|pega|pegó|golpea|golpeó|golpeando|miedo|abuso|violó|viola|anoche|ayúdame)\b/gu) || []).length;
  return hits >= 2;
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

function guessTheme(text) {
  const t = String(text || '').normalize('NFKC').toLowerCase();
  const map = [
    [/\blost (?:my|our) (?:baby|child|son|daughter|wife|husband|mom|mother|dad|father|brother|sister|friend|partner)\b|passed away|miscarr|stillbir|\bdied\b|\bdeath\b|funeral|grief|griev|mourn|widow|\bburied\b/, 'Grief & Loss'],
    [/cancer|biopsy|diagnos|terminal|hospice|chemo|dementia|alzheim|hospital|surgery|afraid of dying|scared of dying/, 'Fear'],
    [/angry at god|mad at god|angry with god|where (?:is|was) god|why (?:did|would) god/, 'Faith & Doubt'],
    [/i cheated|i had an affair|my affair|i lied|guilt|ashamed|shame|regret|hate myself|i'?m a failure|failed as a|can'?t forgive myself|what i did/, 'Shame & Guilt'],
    [/texting another|another (?:woman|man)|(?:he|she) cheated|(?:his|her) affair|trust (?:him|her|them) again|betray|stole|lied to me|forgive (?:him|her|them|my)/, 'Forgiveness'],
    [/sober|drink(?:ing)?|addict|craving|urge to|relapse|temptation|tempted/, 'Suffering & Pain'],
    [/exhaust|burn(?:ed|t)? out|numb|feel nothing|nothing left|so tired|worn out|can'?t keep up|drained|chronic pain|in pain|hurts? so much|suffer|sick|illness|patients? die|watched .{0,20}die/, 'Suffering & Pain'],
    [/anxi|worr|stress|overwhelm|panic|can'?t sleep|debt|bills|rent|money|laid off|lose my job|losing my job|fired/, 'Anxiety & Worry'],
    [/lonely|alone|abandon|nobody|no one|isolat|left me|left out|single|estranged|won'?t talk to me/, 'Loneliness'],
    [/forgiv|let go of/, 'Forgiveness'],
    [/came out|is gay|is trans|how (?:do i|to|should i) (?:respond|react|talk to)|don'?t know how to (?:respond|react)|conflict|enemy|anger|angry|argue|fight|relationship|coworker|boss|in-?laws?|voted|can'?t stand|resent/, 'Conflict & Relationships'],
    [/fear|afraid|scared|terrified|frighten|nightmare/, 'Fear'],
    [/purpose|direction|calling|supposed to do|do with my life|everyone else (?:seems|has)|point of me|useless|retire|no plan|behind in life|compar/, 'Purpose & Direction'],
    [/doubt|faith|believe|pray|talking to a ceiling|god (?:is|isn'?t|doesn'?t)|angry at god|where is god/, 'Faith & Doubt'],
    [/peace|rest|calm|quiet|still/, 'Peace'],
    [/hope|despair|hopeless|give up|giving up/, 'Hope'],
  ];
  for (const [re, theme] of map) {
    if (re.test(t)) return theme;
  }
  return 'Hope';
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
  detectPassiveIdeation,
  looksSpanish,
  detectAbuse,
  detectOffScope,
  detectHostile,
  classifyIntent,
  guessTheme,
  isGospelRef,
  similarity,
};
