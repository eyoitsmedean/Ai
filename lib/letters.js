// lib/letters.js — every sentence a reader can see that the model did not write.
// Owner: Dean — this is his voice; edit wording only with him.
// Moved from server.js 2026-09-11. Wording, regexes and citations unchanged.

const { lookup, parseRef, safetyKind, conversationSafety } = require('./scripture');
const { THEMES } = require('./curated');
const { sayingTouchesCitation } = require('./themes');
const {
  retrieveSayings,
  assessScope,
  looksHostile,
  looksLikeGreeting,
  looksLikeIdentityQuestion,
} = require('./retrieve');

function curatedPassageFor(saying, themes) {
  for (const name of themes) {
    const pack = THEMES[name];
    if (!pack) continue;
    const hit = (pack.passages || []).find((p) => sayingTouchesCitation(saying, p.verse));
    if (hit && hit.context) return hit;
  }
  return null;
}

const FALLBACK_LETTER = [
  'I am here with you, and I will not rush past what you just named.',
  '',
  '{{John 14:27}}',
  'These words meet a troubled heart without asking it to perform calm first.',
  '',
  '{{Matthew 11:28}}',
  'The invitation is for the exhausted — including this moment.',
  '',
  'Sit with these two sentences. You do not have to solve the whole day.',
].join('\n');

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Without a model, the letter is still shaped by what was written. Curated
// theme passages come first (short, chosen by hand, each with a context line);
// library retrieval fills in only when no theme matches, and long multi-verse
// spans are skipped because they read badly as a reply.
// The one invitation that fits every hour; used as the open door when a
// letter cannot honestly answer the question that was asked.
const DOOR = '{{Matthew 11:28}}\nThis is the one invitation that fits every hour, whatever brought you here.';

const BOUNDARY_LETTER = [
  'I hear the question, and I will not pretend to answer it.',
  '',
  'This room holds only one thing — the words Jesus spoke in Matthew, Mark, Luke, and John — so I cannot help with that, and I would rather say so than invent something.',
  '',
  'If there is something underneath the question — a worry, a decision, a person — say it plainly and I will bring what he said about it.',
  '',
  DOOR,
].join('\n');

const HOSTILE_LETTER = [
  'You do not owe me your trust, and I am not going to argue for it.',
  '',
  'You are right that I am not a person. I am a page that holds the words Jesus spoke, checked against the Gospel text before they reach you, and nothing else — no sermon, no sales pitch.',
  '',
  'If you ever want to test that, ask something real and check every verse against Matthew, Mark, Luke, or John yourself. Until then the door stays open:',
  '',
  DOOR,
].join('\n');

const GREETING_LETTER = [
  'I am here.',
  '',
  'Whenever you are ready, say what is on your heart — a worry, a grief, a person, a decision. I will answer with what Jesus actually said about it, and nothing I made up.',
  '',
  DOOR,
].join('\n');

// "Are you a real person?" deserves the plain answer, not a boundary.
const IDENTITY_LETTER = [
  'No. I am not a person, and I will not pretend to be one.',
  '',
  'This is a page that holds the words Jesus spoke in Matthew, Mark, Luke, and John, checked against the Gospel text before they reach you. There is no pastor behind it and no one reading along. If you need a human, please find one — a friend, a minister, a counselor — and let this page be the smaller thing it is.',
  '',
  'If you still want to ask something, I will answer with his words and nothing I made up.',
  '',
  DOOR,
].join('\n');

// A short answer with no cue at all ("help", "why me", a sentence in another
// language): warmth and an open door, never "I cannot help with that".
const UNSURE_LETTER = [
  'I am here, and I am listening.',
  '',
  'I am not sure yet what is underneath what you wrote, and I would rather ask than guess. Say a little more when you can — who or what this is about, and what it is doing to you — and I will bring what Jesus said about it.',
  '',
  '{{John 14:27}}',
  'Until then, this is his, spoken to people who were frightened and did not yet have words for it.',
  '',
  DOOR,
].join('\n');

// Letters for the two safety cases. The notice (numbers, emergency line) is
// prepended separately; these carry the words that follow it. Scripture here
// is deliberately secondary and never prescriptive.
const CRISIS_LETTER = [
  'Thank you for saying it here instead of carrying it silently. Before anything else on this page: the number above reaches a real person who will stay with you. Please use it — now, if you can.',
  '',
  '{{Matthew 11:28}}',
  'He speaks first to the exhausted, not to the fixed. Heavy laden is allowed.',
  '',
  '{{John 14:18}}',
  'Spoken to people who were about to feel abandoned. It is a promise, not a technique.',
  '',
  'Make the call. Come back afterwards if you want to; this page will still be here.',
].join('\n');

const DANGER_LETTER = [
  'You named it, and that took courage. What is happening to you is not yours to endure, and nothing Jesus said asks you to stay within reach of the hand that hurts you. Forgiveness in his words is never a reason to stay in danger.',
  '',
  '{{Luke 4:18}}',
  'He announced release for the bruised as his own work — not as a test of their patience.',
  '',
  '{{Matthew 10:31}}',
  'Your safety is not a small thing to him. You are worth protecting.',
  '',
  'Please reach the advocates above; they will help you think through what is possible, at your pace. Come back whenever you want.',
].join('\n');

const ASSAULT_LETTER = [
  'Thank you for trusting this page with something that heavy. What was done to you was not your fault, and nothing Jesus said asks you to carry it quietly or to pray as if it did not happen. Not being able to pray is not a failure; it is a wound.',
  '',
  '{{Matthew 5:4}}',
  'Mourning is named blessed before it is named finished. You are allowed to be here a long time.',
  '',
  '{{Luke 4:18}}',
  'Healing the brokenhearted and freeing the bruised is how he described his own work — not something he waits for you to earn.',
  '',
  'The people at the number above listen to survivors every hour of the day, at whatever pace you need. Come back whenever you want.',
].join('\n');

// Later turns in a conversation that began with abuse or assault. The question
// underneath is almost always "must I forgive him and stay?", and the answer
// his words give is no: forgiveness is never a reason to remain in reach.
const DANGER_FOLLOWUP_LETTER = [
  'I am still holding what you told me earlier, and it changes how every one of these questions is answered. Nothing Jesus said asks you to stay within reach of someone who hurts you, to submit to it, or to keep it quiet. Forgiveness in his words is something you may reach in time, from safety — it is never a reason to go back into danger.',
  '',
  '{{Matthew 10:16}}',
  'He sends his own people out told to be wise, not only harmless. Protecting yourself is wisdom, not a failure of love.',
  '',
  '{{John 10:10}}',
  'He describes what he came for as life, and life in abundance. That is his intention for you, not endurance.',
  '',
  '{{Luke 10:34}}',
  'In his own story, the wounded man is bound up and carried somewhere safe. Nobody tells him to stay in the road.',
  '',
  'The advocates at the number above will help you think through what is possible at your own pace. You can bring every one of these questions to them too.',
].join('\n');

const CRISIS_FOLLOWUP_LETTER = [
  'I am still here, and I have not forgotten what you told me a moment ago. Before anything else: if the weight is still there, please reach the number above, or the emergency number where you are. A real person will stay with you in a way this page cannot.',
  '',
  '{{Matthew 11:28}}',
  'He does not ask you to be well first. Heavy laden is the qualification.',
  '',
  '{{Luke 12:7}}',
  'Counted down to the hairs of your head — that is how closely he says you are known.',
  '',
  'Stay with someone tonight if you can. Come back afterwards; this page will still be here.',
].join('\n');

// Situations the twelve curated themes do not cover well. Each entry is a
// short set of Jesus's own words with a one-line context, checked against the
// KJV corpus at boot (see the self-check below). Ordered: most specific first.
const SITUATIONS = [
  {
    // Someone condemning themselves: mercy first, never the condition in
    // Matthew 6:15 handed to a person already certain they are unforgivable.
    name: 'self-condemnation',
    re: /\b((cannot|can'?t|cant|will never|never) forgive myself|forgive myself|hate myself|hate my life|hate who i am|(disgust|loathe|despise)\w* (myself|who i am)|will god (ever |still )?forgive me|can god (ever |still )?forgive me|does god (still |even )?love me|god (hates|is disgusted with|gave up on|has given up on|is done with|cannot love|can'?t love) me|says? god hates me|i am (a |an )?(monster|worthless|disgusting|unforgivable|failure as a|terrible person|bad person|beyond (saving|forgiveness|hope|help))|i'?m (a |an )?(monster|worthless|disgusting|unforgivable|terrible person|bad person|beyond (saving|forgiveness|hope|help))|abortion|too far gone|what i (did|have done) (is|was) (unforgivable|too much)|unforgivable|i (ruined|destroyed) (everything|my life|their lives)|no one could (love|forgive) me)\b/i,
    passages: [
      ['John 6:37', 'Spoken about anyone at all who comes to him: in no wise cast out. There is no footnote excluding your case.'],
      ['John 8:11', 'Said to a woman standing in front of a crowd that had already decided about her. He speaks before she has explained anything.'],
      ['Luke 15:22', 'The father does not audit the confession. He interrupts it with a robe. That is the kind of welcome his story describes.'],
    ],
  },
  {
    name: 'honesty',
    re: /\b(i (keep |have been |am |was |always |sometimes )?(lying|lie|lied)|my lies?|i am a liar|i'?m a liar|dishonest|(i|i'?ve|i have) (been )?cheat(ed|ing) on|secret from|hiding (it|this|the truth) from|not (been )?honest with)\b/i,
    passages: [
      ['Matthew 5:37', 'Plain speech is the whole instruction. The lie is exhausting because it is more than yea and nay.'],
      ['John 8:32', 'Truth is described as the thing that frees — not the thing that ends you.'],
      ['Luke 15:20', 'The son rehearsed his confession on the road and never got to finish it; the father was already running.'],
    ],
  },
  {
    // Betrayed, not the betrayer: comfort first, forgiveness is a later question.
    name: 'betrayed',
    re: /\b(cheated on me|cheating on me|had an affair|having an affair|an affair|betrayed me|found (messages|texts|photos|pictures) on (his|her|their) phone|sleeping with (someone|another|his|her|my)|unfaithful|slept with (someone|another|my)|left me for|walked out on (me|us)|abandoned (me|us) for)\b/i,
    passages: [
      ['Matthew 5:4', 'What you are carrying is a kind of mourning, and he calls the ones who mourn blessed before anything is fixed.'],
      ['John 16:33', 'He does not promise the tribulation away. He promises to be larger than it.'],
      ['Matthew 11:28', 'Rest is offered to the heavy laden — not to the ones who have already sorted out what to do next.'],
    ],
  },
  {
    name: 'marriage',
    re: /\b(marriage|we fight|fight(ing)? (all the time|every day|every single day|constantly|nonstop)|divorc|separat(ed|ing|ion)|falling apart|my (wife|husband|spouse|partner) and i (fight|argue|can'?t talk|don'?t talk|are (fighting|struggling|drifting|distant))|(wife|husband|spouse|partner) (and i )?(never|don'?t|won'?t|can'?t) (talk|speak|listen))\b/i,
    passages: [
      ['Matthew 5:9', 'Peacemaking is named blessed — a work you can begin from your side of the table tonight.'],
      ['Matthew 18:15', 'He gives the first step for a wound between two people: go, and say it plainly, alone, before anyone else hears it.'],
      ['Matthew 7:3', 'The beam in your own eye first — not because your hurt is not real, but because it is the one thing you can actually move.'],
    ],
  },
  {
    name: 'estranged child',
    re: /\b(my (teenager|teen|son|daughter|kid|kids|child|children) (won'?t|will not|doesn'?t|refuses?|hasn'?t|stopped)|won'?t (speak|talk) to me|not speaking to me|estranged|prodigal|cut me off)/i,
    passages: [
      ['Luke 15:20', 'The father in the story sees the child a great way off — he had been watching the road the whole time. Keep watching the road.'],
      ['Matthew 7:7', 'Ask, seek, knock. Persistence is his own instruction, and it fits the silence you are standing in.'],
      ['Luke 15:31–32', 'Even the one who stayed home is told: you are ever with me. Nobody in that house is written off.'],
    ],
  },
  {
    name: 'prayer',
    re: /\b(how (do|should|can|to) i pray|pray|prayer|praying)/i,
    passages: [
      ['Matthew 6:6', 'Start with a shut door and no audience. That is the whole instruction on where.'],
      ['Matthew 6:7–8', 'He removes the pressure of finding the right words before you have said any — the Father already knows what you need.'],
      ['Matthew 6:9–13', 'When the disciples asked the same question, this is what he handed them. You may borrow it word for word.'],
    ],
  },
  {
    // Someone I love is in harm's way and out of reach.
    name: 'loved one at risk',
    re: /\b(deployed|deployment|overseas with the|in the (army|military|navy|marines|air force)|at war|in combat|on the front|in a war zone|missing for|hasn'?t (called|come home|checked in)|in surgery right now|in the (icu|intensive care|hospital tonight))\b/i,
    passages: [
      ['Matthew 10:29–31', 'Sparrows and the hairs of your head — his argument is that nothing about the ones you love is outside his attention.'],
      ['Mark 5:36', 'Said to a father on the way to a child he could not reach. It is the sentence for the hours of not knowing.'],
      ['John 14:27', 'Not the world\'s peace, which needs good news first. His, which is given before the news arrives.'],
    ],
  },
  {
    // A person who feels like a failure: worth, not repentance.
    name: 'failure',
    re: /\b(i(?:'m| am) (such )?a (failure|disappointment|loser|screw-?up|mess|burden)|feel like a (failure|disappointment|loser|burden|fraud)|i (failed|keep failing|am failing) (at|as|them|everyone|my family)|let (everyone|them|my (family|kids|children|parents|wife|husband)) down|not good enough|never good enough|screw(ed)? (it |everything )?up again|i can'?t do anything right|everything i touch)\b/i,
    passages: [
      ['Luke 12:7', 'Counted down to the hairs of your head. His measure of your worth was never your results.'],
      ['Matthew 11:28', 'The invitation is addressed to the tired and the loaded down — not to the ones who have it together.'],
      ['Luke 12:32', 'Fear not, little flock. Small, tired, and still handed the kingdom.'],
    ],
  },
  {
    // The love of money, not the lack of it: shortage is a worry question and
    // belongs to the Anxiety passages.
    name: 'money',
    re: /\b((love|obsessed with|think about|chasing|chase|worship|idolize|hoard|hoarding) (of )?(money|wealth|riches|possessions|stuff|things)|money (too much|is all i|has become|controls|owns) |i (love|want|need) (more )?money|(jesus|he|christ) (say|said|teach|taught|think|thought)s? about (money|wealth|riches|possessions|the rich|giving|tithing)|about money|money[^.?!]{0,40}\btoo much|get(ting)? rich|be(come|coming)? rich|wealth(y|ier)?|greed(y)?|possessions|mammon|materialis|tithe|tithing|how much (should|do) i give|generous|generosity|giving (money|to the poor|to church))\b/i,
    passages: [
      ['Matthew 6:24', 'He does not call money evil; he calls it a rival master. The question is only which one you answer to.'],
      ['Matthew 6:19–21', 'Where you keep your treasure is where your heart will follow — his diagnosis runs the other way from ours.'],
      ['Luke 12:15', 'A life is not measured by what it holds. Spoken to a crowd, to be overheard by the one who needed it.'],
    ],
  },
  {
    name: 'judging',
    re: /\b(judg(e|ing|mental|y)|criticiz|critical of|look(ing)? down on|gossip|condemn(ing)? (people|others|them))/i,
    passages: [
      ['Matthew 7:1–2', 'The measure you use comes back around. He says it as a warning, not a threat.'],
      ['Matthew 7:3', 'Start with your own eye — not to silence you, but because it is the only one you can reach.'],
      ['Luke 6:37', 'Judging, condemning, forgiving: he puts them in a row so you can see which one he is asking for.'],
    ],
  },
  {
    name: 'anger',
    re: /\b(angry|anger|rage|furious|temper|lash(ed|ing)? out|yell(ed|ing)? at|snap(ped)? at)/i,
    passages: [
      ['Matthew 5:23–24', 'Repair first, then worship. He puts the person you hurt ahead of the altar.'],
      ['Matthew 11:29', 'Meek and lowly in heart is how he describes himself — and the rest he offers comes with that yoke.'],
      ['Luke 6:31', 'The whole ethic in one line, small enough to remember in the second before you speak.'],
    ],
  },
  {
    name: 'marked day',
    re: /\b(father'?s day|mother'?s day|anniversary of|the holidays|first (christmas|thanksgiving|easter|birthday) without|birthday without|would have been)/i,
    passages: [
      ['Matthew 5:4', 'Comfort is promised to those who actually mourn — and a marked day is when mourning comes back.'],
      ['John 14:18', 'Spoken to people about to lose the one who held them together.'],
      ['John 16:22', 'Sorrow now, joy later — he does not skip the first half.'],
    ],
  },
];

function overlaps(a, b) {
  const p = parseRef(a);
  const q = parseRef(b);
  return Boolean(p && q && p.book === q.book && p.chapter === q.chapter && p.start <= q.end && p.end >= q.start);
}

// The fixed letter for a safety verdict. `carried` means the disclosure was
// made in an earlier turn and the current message is a follow-up.
function safetyLetter(kind, carried) {
  if (kind === 'crisis') return carried ? CRISIS_FOLLOWUP_LETTER : CRISIS_LETTER;
  if (kind === 'assault') return carried ? DANGER_FOLLOWUP_LETTER : ASSAULT_LETTER;
  if (kind === 'danger') return carried ? DANGER_FOLLOWUP_LETTER : DANGER_LETTER;
  return null;
}

// The safety verdict for a conversation: the current message first, then any
// disclosure in the recent user turns. A bare greeting or thanks after a
// disclosure is answered as a greeting, not with the handoff again.
function chatSafety(messages, current) {
  const text = String(current || '');
  const own = safetyKind(text);
  if (own) return { kind: own, carried: false };
  if (looksLikeGreeting(text)) return { kind: null, carried: false };
  return conversationSafety(messages);
}

// Cues are read from the last message first; earlier user turns only widen
// the search when the last message alone names nothing.
function fallbackLetter(query, history = []) {
  const text = String(query || '');
  const safe = chatSafety(history, text);
  if (safe.kind) return safetyLetter(safe.kind, safe.carried);

  let retrieved;
  let themes;
  const situations = [];
  try {
    if (looksLikeGreeting(text)) return GREETING_LETTER;
    if (looksLikeIdentityQuestion(text)) return IDENTITY_LETTER;
    if (looksHostile(text)) return HOSTILE_LETTER;
    const earlier = (history || [])
      .filter((m) => m && m.role === 'user' && typeof m.content === 'string')
      .slice(-3, -1)
      .map((m) => m.content)
      .join(' ');
    let cueText = text;
    const ownThemes = assessScope(text).themes.length > 0 || SITUATIONS.some((s) => s.re.test(text));
    if (earlier && !ownThemes) {
      const combined = `${earlier} ${text}`;
      if (assessScope(combined).themes.length || SITUATIONS.some((s) => s.re.test(earlier))) cueText = combined;
    }
    const scope = assessScope(cueText);
    const situationHit = SITUATIONS.some((s) => s.re.test(cueText));
    // A boundary is only drawn on a positive off-scope signal (trivia, code,
    // finance, another author). A message with no cue at all is met with a
    // question, never with "I cannot help with that".
    if (scope.hardOffScope) return BOUNDARY_LETTER;
    if (scope.offScope && !scope.inScope && !situationHit) return BOUNDARY_LETTER;
    if (!scope.inScope && !situationHit) return UNSURE_LETTER;
    for (const s of SITUATIONS) if (s.re.test(cueText)) situations.push(s);
    retrieved = retrieveSayings(cueText, { limit: 6 });
    themes = retrieved.themes || [];
  } catch (_) {
    return FALLBACK_LETTER;
  }

  const blocks = [];
  const usedCites = [];
  const usedContexts = new Set();
  const push = (citation, context) => {
    if (blocks.length >= 3) return;
    if (usedCites.some((c) => overlaps(c, citation))) return;
    if (usedContexts.has(context)) return;
    usedCites.push(citation);
    usedContexts.add(context);
    blocks.push(`{{${citation}}}\n${context}`);
  };

  if (situations[0]) situations[0].passages.forEach(([verse, context]) => push(verse, context));
  if (situations[1] && blocks.length < 3) situations[1].passages.slice(0, 1).forEach(([verse, context]) => push(verse, context));
  if (themes[0] && THEMES[themes[0]]) {
    THEMES[themes[0]].passages.slice(0, 2).forEach((p) => push(p.verse, p.context));
  }
  if (themes[1] && THEMES[themes[1]]) {
    THEMES[themes[1]].passages.slice(0, 1).forEach((p) => push(p.verse, p.context));
  }
  // Retrieved sayings without a hand-written context are only used when the
  // letter would otherwise be thin; a bare verse next to a real wound reads as
  // a lottery ticket.
  for (const saying of retrieved.sayings || []) {
    if (blocks.length >= 3) break;
    if (wordCount(saying.text) > 45) continue;
    const curated = curatedPassageFor(saying, themes);
    if (curated) push(curated.verse, curated.context);
    else if (blocks.length < 2) push(saying.citation, 'Kept here exactly as it was spoken, for this moment.');
  }
  if (blocks.length < 2) return FALLBACK_LETTER;

  return [
    'I am here with you, and I will not rush past what you just named.',
    '',
    blocks.join('\n\n'),
    '',
    'Sit with these words for a minute. You do not have to solve the whole day.',
  ].join('\n');
}

// Every hand-picked citation above must resolve to Jesus's own speech; a typo
// here would otherwise surface as a silently dropped block.
function selfCheckCuratedCitations() {
  const all = [
    CRISIS_LETTER, DANGER_LETTER, ASSAULT_LETTER, CRISIS_FOLLOWUP_LETTER, DANGER_FOLLOWUP_LETTER,
    BOUNDARY_LETTER, HOSTILE_LETTER, GREETING_LETTER, IDENTITY_LETTER, UNSURE_LETTER, FALLBACK_LETTER,
  ]
    .flatMap((letter) => [...letter.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]))
    .concat(SITUATIONS.flatMap((s) => s.passages.map(([verse]) => verse)));
  for (const cite of all) {
    const hit = lookup(cite);
    if (!hit || !hit.redLetter) throw new Error(`Curated citation is not a red-letter saying: ${cite}`);
  }
  return all.length;
}
selfCheckCuratedCitations();

module.exports = {
  DOOR,
  FALLBACK_LETTER,
  BOUNDARY_LETTER,
  HOSTILE_LETTER,
  GREETING_LETTER,
  IDENTITY_LETTER,
  UNSURE_LETTER,
  CRISIS_LETTER,
  DANGER_LETTER,
  ASSAULT_LETTER,
  DANGER_FOLLOWUP_LETTER,
  CRISIS_FOLLOWUP_LETTER,
  SITUATIONS,
  safetyLetter,
  chatSafety,
  fallbackLetter,
  selfCheckCuratedCitations,
};
