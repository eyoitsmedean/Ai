/**
 * The curated Advisor — what answers when there is no model, or the model fails.
 *
 * It is not a chatbot. It reads the question for what the person is carrying,
 * chooses His sayings from the curated theme packs and the spoken corpus, and
 * writes a short letter around them. Every citation is emitted as a {{Book C:V}}
 * placeholder, so the server's substitution step inserts the KJV corpus text and
 * this module never types a verse.
 *
 * Order of reading, most serious first: danger · instructions aimed at the page ·
 * requests outside the room (practical, other authors, licensed professions) ·
 * hostility · gratitude · a felt need · words that match a saying · a short hello.
 */
const { looksLikeCrisis } = require('./scripture');
const { THEMES } = require('./curated');
const { tokens } = require('./retrieve');
const { loadLibrary } = require('./library');

/* One line that meets the person, per theme. Second person, no theology yet. */
const HEAR = {
  'Anxiety & Worry': 'I hear the spiral. Tomorrow has gotten loud, and you are tired of carrying a day that has not arrived.',
  Fear: 'Fear is shrinking the future to the size of the thing you dread. You do not have to pretend the waves are small.',
  'Grief & Loss': 'Something has a name, and it is gone, and you are still here. That is not a failure of faith. It is love with nowhere to stand.',
  Loneliness: 'Loneliness can convince you that you are unseen. You are not an interruption, and you were not meant to be an orphan in this.',
  Forgiveness: 'Forgiveness is one of the hardest sentences He spoke, and one of the freest. You do not have to finish the road today.',
  'Shame & Guilt': 'Shame wants you out of the room. He still knows how to lift a face.',
  'Suffering & Pain': 'Pain is not a riddle you failed to solve. He names tribulation and still says come.',
  'Conflict & Relationships': 'Conflict lodges in the body. He takes the other person seriously, and He takes you seriously too.',
  'Purpose & Direction': 'You want a map, and He tends to hand people a first step and a direction to face.',
  'Faith & Doubt': 'Doubt is not a firing offence in the Gospels. He let a doubter touch the wound.',
  Peace: 'The world offers a pause between problems. He offers a peace that can sit in a troubled room and still be itself.',
  Hope: 'Hope is not pretending. In His words it is anchored in who He is, not in how this hour feels.',
};

/* Cues are weighted: a strong word names the need outright; a soft word only leans. */
const CUES = {
  'Anxiety & Worry': { strong: ['anxious', 'anxiety', 'worry', 'worried', 'worrying', 'overwhelmed', 'overwhelm', 'panic', 'stressed', 'stress', 'racing thoughts', "can't sleep", 'cant sleep', 'cannot sleep', 'not sleeping', 'no sleep', 'sleepless', 'insomnia', 'overthinking'], soft: ['tomorrow', 'bills', 'money', 'deadline', 'exam', 'interview', 'restless'] },
  Fear: { strong: ['afraid', 'scared', 'terrified', 'fear', 'frightened', 'dread', 'phobia'], soft: ['unsafe', 'danger', 'nightmare', 'diagnosis', 'surgery', 'future'] },
  'Grief & Loss': { heavy: ['died', 'passed away', 'funeral', 'miscarriage', 'stillborn', 'buried', 'widow', 'widower'], strong: ['grief', 'grieving', 'mourning', 'mourn', 'lost my mother', 'lost my father', 'lost my mom', 'lost my dad', 'lost my son', 'lost my daughter', 'lost my wife', 'lost my husband', 'lost my baby', 'lost my friend'], soft: ['death', 'loss', 'gone', 'miss her', 'miss him', 'miss them', 'anniversary', 'crying', 'cry', 'tears'] },
  Loneliness: { strong: ['lonely', 'loneliness', 'alone', 'isolated', 'abandoned', 'no one cares', 'nobody cares', 'no friends', 'forgotten', 'left me', 'nobody would notice', 'no one would notice', 'nobody would miss', 'no one would miss', 'disappeared', 'nobody to talk to', 'no one to talk to'], soft: ['single', 'moved', 'new city', 'invisible', 'unseen', 'nobody', 'no one'] },
  Forgiveness: { strong: ['forgive him', 'forgive her', 'forgive them', 'forgive my', 'forgive the', "can't forgive", 'cant forgive', 'cannot forgive', 'never forgive', 'forgiving him', 'forgiving her', 'forgiving them', 'resentment', 'resent', 'bitter', 'bitterness', 'grudge', 'betrayed', 'cheated on me', "can't let go", 'cant let go'], soft: ['forgive', 'forgiveness', 'forgiving', 'hurt me', 'wronged', 'revenge', 'hate him', 'hate her', 'hate them'] },
  'Shame & Guilt': { heavy: ['forgive me', 'be forgiven', 'unforgivable', 'stops forgiving', 'stop forgiving', 'will god forgive', 'can god forgive', 'does god forgive', 'could god forgive', 'too far gone', 'beyond forgiveness', 'never tell anyone'], strong: ['shame', 'ashamed', 'guilt', 'guilty', 'unworthy', 'disgusted with myself', 'hate myself', 'sinned', 'relapsed', 'relapse', 'failure', 'messed up', 'screwed up', 'porn', 'addiction', 'addicted'], soft: ['regret', 'mistake', 'confess', 'unforgivable', 'too far'] },
  'Suffering & Pain': { strong: ['pain', 'hurting', 'suffering', 'suffer', 'chronic', 'sick', 'illness', 'cancer', 'hospital', 'disabled', 'disability', 'ache', 'exhausted', 'exhaustion', 'burned out', 'burnt out', 'burnout', 'so tired', 'tired of everything', 'weary', 'worn out', 'running on empty', "can't keep going", 'cant keep going', 'the strong one'], soft: ['tired', 'heavy', 'drained', 'depleted'] },
  'Conflict & Relationships': { strong: ['divorce', 'argument', 'arguing', 'argued', 'fight', 'fighting', 'fought', 'conflict', 'estranged', 'not speaking', "won't speak", 'wont speak', 'furious', 'toxic', 'enemy', 'enemies', 'cheating', 'affair'], soft: ['angry at', 'marriage', 'husband', 'wife', 'boyfriend', 'girlfriend', 'partner', 'my mother', 'my father', 'my mom', 'my dad', 'my son', 'my daughter', 'my brother', 'my sister', 'coworker', 'boss', 'boundaries', 'family', 'friend', 'in-laws', 'neighbor', 'neighbour'] },
  'Purpose & Direction': { strong: ['purpose', 'direction', 'calling', 'career', 'what should i do', 'decision', 'decide', 'crossroads', 'meaning', 'pointless', 'stuck', 'quit my job', 'lost my job', 'unemployed'], soft: ['confused', 'plan', 'path', 'next step', 'choose', 'college', 'move', 'retire'] },
  'Faith & Doubt': { strong: ['doubt', 'doubting', "don't believe", 'dont believe', 'unbelief', 'is god real', 'where is god', 'god is silent', 'lost my faith', 'losing my faith', 'prayers unanswered', 'unanswered', 'questioning', 'agnostic', 'atheist', 'heard nothing', 'no one listening', 'nobody listening', 'no one is listening', 'god is silent', 'silence from god', 'prayed for years', 'prayed and prayed', 'does god hear', 'does he hear'], heavy: ['why does god', 'why would god', 'why did god', 'how could god', 'if god is good', 'if god is real', 'if god loves'], soft: ['angry at god', 'mad at god', 'angry with god', 'believe', 'faith', 'pray', 'prayed', 'praying', 'prayer', 'prayers', 'church', 'god'] },
  Peace: { strong: ['peace', 'calm', 'quiet my mind', 'troubled', 'unsettled', 'agitated'], soft: ['still', 'rest', 'storm', 'noise', 'chaos'] },
  Hope: { strong: ['hopeless', 'hope', 'despair', 'give up', 'giving up', 'nothing will change', 'dark place', 'empty', 'numb', 'depressed', 'depression'], soft: ['joy', 'cheer', 'better', 'someday', 'light'] },
};

/* When two needs score alike, the heavier one is answered first. */
const PRIORITY = ['Grief & Loss', 'Shame & Guilt', 'Suffering & Pain', 'Fear', 'Anxiety & Worry', 'Hope', 'Loneliness', 'Forgiveness', 'Faith & Doubt', 'Conflict & Relationships', 'Purpose & Direction', 'Peace'];

/* Passages the room turns to when the question is not about a felt need. */
const DOORS = {
  invitation: { verse: 'Matthew 11:28', context: 'Whatever brought you to a page like this one, this is the door He leaves open.' },
  asking: { verse: 'Matthew 7:7–8', context: 'He answers a demand for proof with an invitation to keep asking.' },
  twoCommands: { verse: 'Matthew 22:37–40', context: 'Asked what the whole of scripture came to, He answered with two sentences.' },
  joy: { verse: 'John 15:11', context: 'He said why He spoke at all: so that joy would remain, and be full.' },
  peace: { verse: 'John 14:27', context: 'Peace is left behind the way a key is left on the table. It is already in the house.' },
  value: { verse: 'Luke 12:6–7', context: 'Sparrows and hairs. He argues your worth from small things that are counted.' },
};

const INJECTION_RE = /(ignore|disregard|forget)\s+(all\s+|any\s+|your\s+|the\s+)?(previous|prior|above|earlier|system)\s+(instructions?|prompts?|rules?)|system prompt|you are now\b|pretend (to be|you are)|act as (a|an|if)\b|jailbreak|developer mode|\bDAN\b|reveal your (prompt|instructions)|repeat (your|the) (prompt|instructions)|repeat (the |all |every )?(words|text|lines?|message) above|words above|starting with ['"]you are|include everything|print (your|the) (prompt|instructions)|what (are|were) your instructions|show me your (prompt|rules|instructions)|initial prompt|hidden (prompt|rules|instructions)/i;
const PRACTICAL_RE = /\b(weather|forecast|stock price|stocks?|bitcoin|crypto|recipe|cook|bake|javascript|python|java\b|css|html|sql|code|coding|debug|program|homework|essay|assignment|math problem|equation|calculate|translate|capital of|who won|score of|lottery|horoscope|astrology|tarot|wifi|password|iphone|android|windows|excel|spreadsheet|movie|netflix|song lyrics|football|soccer|basketball|nba|nfl|election|vote for|president|democrat|republican)\b/i;
const OTHER_AUTHOR_RE = /\b(paul|apostle|epistles?|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|hebrews|revelation|old testament|genesis|exodus|leviticus|deuteronomy|psalms?|proverbs|ecclesiastes|isaiah|jeremiah|ezekiel|book of \w+|the bible says?|does the bible say|torah|quran|koran|bhagavad|book of mormon)\b/i;
const PROFESSIONAL_DOMAIN_RE = /\b(dosage|dose|mg|milligrams|prescription|prescribed|medication|meds|antidepressants?|ssri|xanax|zoloft|prozac|lexapro|adderall|diagnos\w*|symptoms?|blood pressure|lawyer|attorney|lawsuit|sue|custody|visa|immigration|contract|invest|investments?|401k|mortgage|refinance|loan|bankruptcy|taxes|irs)\b/i;
const PROFESSIONAL_ASK_RE = /\b(should i|can i|could i|how much|how many|what (dose|dosage)|is it (safe|legal|normal|okay|ok)|do i need|which (medication|lawyer|drug)|stop taking|take more|double my|skip my|instead of (my|the) (meds|medication))\b/i;
const HOSTILE_RE = /\b(fake|scam|bullshit|bs\b|stupid|dumb|idiot|liar|lying|garbage|nonsense|fairy tale|fairytale|brainwash\w*|cult|you'?re not real|not real|just a bot|just an ai|a bot|an ai|a robot|prove (it|god|he exists|jesus)|there is no god|god isn'?t real|god is not real|religion is)\b/i;
const NEGATED_CRISIS_RE = /\b(not|never|no|isn'?t|am not|i'?m not)\s+(suicidal|going to (kill|hurt) myself|thinking of (suicide|killing myself)|about to (kill|hurt) myself)\b|\bnot suicidal\b/i;
const CRISIS_CORE_RE = /\b(kill myself|killing myself|end my life|take my life|want to die|wanna die|hurt(ing)? myself|cut(ting)? myself|hang myself|overdos\w*|better off dead|no reason to live|not worth living|end it all|ending it all|don[’']?t want to live|do not want to live)\b/i;
const GRATITUDE_RE = /^\s*(thank you|thanks|thank u|ty|that helped|this helped|amen|bless you|goodnight|good night|bye|goodbye)\b/i;
const HELLO_RE = /^\s*(hi|hello|hey|help|help me|please help|i need help|are you there|yo|sup)\s*[.!?]*\s*$/i;

function hashOf(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function cueRe(k) {
  return new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]") + '\\b', 'i');
}

function scoreThemes(raw) {
  const text = String(raw || '');
  const scores = [];
  for (const [theme, cue] of Object.entries(CUES)) {
    let n = 0;
    for (const k of cue.heavy || []) if (cueRe(k).test(text)) n += 6;
    for (const k of cue.strong) if (cueRe(k).test(text)) n += 3;
    for (const k of cue.soft) if (cueRe(k).test(text)) n += 1;
    if (n > 0) scores.push({ theme, n });
  }
  scores.sort((a, b) => b.n - a.n || PRIORITY.indexOf(a.theme) - PRIORITY.indexOf(b.theme));
  return scores;
}

function classify(raw) {
  const text = String(raw || '').trim();
  if (!text) return { kind: 'hello' };
  if (looksLikeCrisis(text)) {
    if (NEGATED_CRISIS_RE.test(text) && !CRISIS_CORE_RE.test(text)) return { kind: 'need', theme: 'Hope', themes: scoreThemes(text), softCrisis: true };
    return { kind: 'crisis' };
  }
  if (INJECTION_RE.test(text)) return { kind: 'injection' };
  const themes = scoreThemes(text);
  const top = themes[0];
  const strongNeed = top && top.n >= 3;
  if (PROFESSIONAL_DOMAIN_RE.test(text) && PROFESSIONAL_ASK_RE.test(text)) return { kind: 'professional', themes };
  if (OTHER_AUTHOR_RE.test(text)) return strongNeed ? { kind: 'need', theme: top.theme, themes, otherAuthor: true } : { kind: 'otherAuthor', themes };
  if (!strongNeed && PRACTICAL_RE.test(text)) return { kind: 'practical', themes };
  if (!strongNeed && HOSTILE_RE.test(text)) return { kind: 'hostile', themes };
  if (GRATITUDE_RE.test(text)) return { kind: 'gratitude', themes };
  if (HELLO_RE.test(text) || tokens(text).length === 0) return { kind: 'hello' };
  if (strongNeed) return { kind: 'need', theme: top.theme, themes };
  return { kind: 'search', themes };
}

function pick(list, n, seed) {
  const out = [];
  const start = seed % list.length;
  for (let i = 0; i < list.length && out.length < n; i += 1) out.push(list[(start + i) % list.length]);
  return out;
}

function passageBlock(verse, context) {
  return `{{${verse}}}\n${context}`;
}

function themeLetter(theme, raw, { lead, closing } = {}) {
  const pack = THEMES[theme];
  const seed = hashOf(raw);
  const chosen = pick(pack.passages, 2, seed);
  const lines = [lead || HEAR[theme] || pack.opening, ''];
  for (const p of chosen) lines.push(passageBlock(p.verse, p.context), '');
  const echo = matchedSaying(raw, chosen.map((p) => p.verse));
  if (echo) lines.push(passageBlock(echo.citation, echo.context), '');
  lines.push(pack.practice, '', closing || pack.closing);
  return lines.join('\n');
}

/* Stories and sayings people name rather than quote. Each anchor is His own speech. */
const ALIASES = [
  [/\bprodigal\b|\byounger son\b|\bfatted calf\b/i, 'Luke 15:20–24', 'The story you named turns here: the father runs before the speech is finished.'],
  [/\bgood samaritan\b|\bsamaritan\b/i, 'Luke 10:33–37', 'The neighbour question, answered with a story and a command: go, and do thou likewise.'],
  [/\blost sheep\b|\bninety[- ]nine\b|\bone sheep\b/i, 'Luke 15:4–7', 'He tells it from the shepherd’s side: the one is worth the walk, and the finding is a feast.'],
  [/\bmustard seed\b/i, 'Matthew 13:31–32', 'Smallest seed, largest herb. He measures beginnings differently.'],
  [/\bsower\b|\bseed (fell|falls)\b|\bgood ground\b/i, 'Matthew 13:3–8', 'Four soils, one sower. The seed is not the variable.'],
  [/\blilies\b|\blily\b/i, 'Matthew 6:28–30', 'Consider the lilies: He points at flowers to answer a fear about money.', 'subject'],
  [/\bsparrows?\b/i, 'Luke 12:6–7', 'Sparrows and hairs. He argues your worth from small things that are counted.', 'subject'],
  [/\bvine\b|\bbranches\b|\babide\b/i, 'John 15:5', 'Fruit comes from staying close, not from straining alone.', 'subject'],
  [/\bgood shepherd\b|\bshepherd\b/i, 'John 10:11', 'A shepherd who stays when it costs something. That is the whole difference.', 'subject'],
  [/\bsalt of the earth\b|\bsalt\b/i, 'Matthew 5:13', 'Salt is useful by being itself. He is not asking you to become something louder.', 'subject'],
  [/\blight of the world\b/i, 'Matthew 5:14–16', 'You do not have to become visible. You already are. The work is not to hide.', 'subject'],
  [/\bnarrow (gate|way|road|path)\b|\bstrait gate\b/i, 'Matthew 7:13–14', 'He does not pretend the way is wide. He says it is worth finding.', 'subject'],
  [/\bgolden rule\b|\bdo unto others\b/i, 'Matthew 7:12', 'The whole of the law and the prophets, in one sentence you can act on before lunch.', 'subject'],
  [/\blord'?s prayer\b|\bour father\b|\bhow (do|should) i pray\b|\bteach me to pray\b/i, 'Matthew 6:9–13', 'Asked how to pray, He gave a prayer short enough to keep.', 'subject'],
  [/\bbeatitudes?\b|\bblessed are\b/i, 'Matthew 5:3–10', 'The sermon opens with the people nobody was congratulating.', 'subject'],
  [/\bgreat commission\b|\bgo ye\b/i, 'Matthew 28:19–20', 'The sending ends with a promise of company, to the end.', 'subject'],
  [/\btalents?\b|\bwell done\b/i, 'Matthew 25:21', 'Faithfulness in a few things is the whole test. Scale comes later.'],
  [/\bleast of these\b|\bsheep and (the )?goats\b|\bfeed the (hungry|poor)\b/i, 'Matthew 25:35–36', 'He locates Himself among the hungry, the stranger, the sick, the prisoner.'],
  [/\bcup pass\b|\bgethsemane\b|\bthy will\b/i, 'Matthew 26:39', 'He does not pretend the cup is sweet. Honesty and surrender sit in one sentence.', 'subject'],
  [/\b(rich|riches|wealth|wealthy|money|mammon|treasure|greed|greedy|possessions|materialis\w+)\b/i, 'Matthew 6:19–21', 'He does not forbid having. He asks where the treasure is kept, because the heart follows it there.', 'subject'],
  [/\b(my (kids|children|child|toddler|teenager|teen)|parenting|parent|father to|mother to|raise (my|our))\b/i, 'Matthew 19:14', 'He made room for children when the adults were busy. That is a word to the ones raising them, too.', 'subject'],
  [/\bforgive them\b|\bfrom the cross\b|\bcrucif\w+\b/i, 'Luke 23:34', 'The first word from the cross is a prayer for the people holding the hammers.', 'subject'],
];

const ECHO_STOP = new Set(['father', 'better', 'become', 'people', 'think', 'thing', 'things', 'really', 'would', 'could', 'should', 'because', 'someone', 'everything', 'nothing', 'always', 'never', 'every', 'there', 'their', 'these', 'those', 'through', 'still', 'again', 'another', 'other', 'being', 'going', 'doing', 'having', 'saying', 'jesus', 'christ', 'bible', 'verse', 'scripture', 'feel', 'feeling', 'like', 'want', 'know', 'need', 'help', 'please', 'much', 'more', 'most', 'some', 'even', 'only', 'life', 'time', 'today', 'right', 'good', 'make', 'made', 'does', 'mean', 'keep', 'stop', 'start', 'anymore']);

function aliasFor(raw) {
  for (const [re, verse, context, kind] of ALIASES) if (re.test(raw)) return { verse, context, kind: kind || 'story' };
  return null;
}

/* Rarer words weigh more; long groupings lose to short ones that say the same thing. */
let _df = null;
function docFreq() {
  if (_df) return _df;
  _df = new Map();
  for (const s of loadLibrary().sayings) {
    for (const t of new Set(tokens(s.text))) _df.set(t, (_df.get(t) || 0) + 1);
  }
  return _df;
}

function searchSayings(raw, limit = 2) {
  const df = docFreq();
  const all = loadLibrary().sayings;
  const q = [...new Set(tokens(raw))].filter((t) => t.length > 3 && !ECHO_STOP.has(t));
  if (!q.length) return [];
  const scored = [];
  for (const s of all) {
    const words = s.text.split(/\s+/).length;
    if (words > 80) continue;
    const hay = ' ' + tokens(s.text).join(' ') + ' ';
    let score = 0;
    let hits = 0;
    for (const t of q) {
      if (hay.includes(' ' + t + ' ')) { hits += 1; score += Math.log(all.length / (1 + (df.get(t) || 0))); }
    }
    if (hits) scored.push({ s, score: score / Math.log(words + 4), hits });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((r) => r.score >= 1.2).slice(0, limit).map((r) => r.s);
}

function chapterKey(citation) {
  return String(citation).split(':')[0];
}

/* A saying whose own words overlap the question strongly enough to be worth opening. */
function matchedSaying(raw, exclude) {
  const alias = aliasFor(raw);
  if (alias && alias.kind === 'story' && !exclude.some((v) => chapterKey(v) === chapterKey(alias.verse))) return { citation: alias.verse, context: alias.context };
  return null;
}

function searchLetter(raw) {
  const alias = aliasFor(raw);
  const lines = [];
  if (alias) {
    const story = alias.kind === 'story';
    lines.push(story ? 'You named one of His stories. Here is where it turns, in His own words.' : 'You asked about something He spoke to directly. Here it is, in His own words.', '', passageBlock(alias.verse, alias.context), '');
    const more = searchSayings(raw, 1).filter((s) => chapterKey(s.citation) !== chapterKey(alias.verse));
    for (const s of more) lines.push(passageBlock(s.citation, 'And this, which uses a word you used.'), '');
    lines.push(story ? 'If you tell me why that story came to mind, I will stay with that part of it.' : 'If there is a situation behind the question, tell me in a sentence and I will stay with that.');
    return lines.join('\n');
  }
  const picks = searchSayings(raw, 2);
  if (!picks.length) {
    return [
      'I did not find His words close to yours yet, and I will not hand you a verse that does not fit. Tell me what is underneath the question in one plain sentence — a feeling, a person, a fear — and I will look again.',
      '',
      passageBlock(DOORS.invitation.verse, 'Until then, this is the door He leaves open.'),
      '',
      'There is no wrong way to begin.',
    ].join('\n');
  }
  lines.push('You did not name a feeling, so I looked for the words of His that sit closest to yours. Read them slowly; if none of them is the one you needed, say more and I will look again.', '');
  for (const s of picks) lines.push(passageBlock(s.citation, 'He said this. You can check it against the Gospel it is printed in.'), '');
  lines.push('One sentence about what is heavy is enough.');
  return lines.join('\n');
}

function compose(raw) {
  const text = String(raw || '').trim();
  const c = classify(text);
  switch (c.kind) {
    case 'crisis':
      return [
        'I am glad you wrote instead of staying silent. What you are carrying sounds unbearable, and it deserves a person, not a page: please reach 988 (call, text, or chat at 988lifeline.org) if you are in the United States, or findahelpline.com anywhere else, and tell someone near you tonight.',
        '',
        'I am not a person, and this page is not emergency care. While you reach someone who is, here is a word He spoke to the heavy-laden.',
        '',
        passageBlock('Matthew 11:28', 'The invitation is to the exhausted. You do not have to be well to come.'),
        '',
        passageBlock('Luke 12:6–7', 'You are counted, down to the hairs of your head. That is His arithmetic, not mine.'),
        '',
        'Please go toward help now. This page will still be here afterwards.',
      ].join('\n');
    case 'injection':
      return [
        'I only carry one set of instructions here: the words Jesus spoke, cited so you can check every line. I cannot set that aside or become something else.',
        '',
        passageBlock(DOORS.asking.verse, 'If there is a real question under this one, ask it plainly and I will answer from His words.'),
        '',
        'Nothing you type is judged here. Say what you are carrying.',
      ].join('\n');
    case 'practical':
      return [
        'This room cannot help with that. It holds only the words Jesus spoke, and He did not speak to that question.',
        '',
        passageBlock(DOORS.invitation.verse, DOORS.invitation.context),
        '',
        'If something under the question is heavy, name it in a sentence, and I will find His words for it.',
      ].join('\n');
    case 'otherAuthor': {
      const lines = [
        'This room keeps to the four Gospels and to His own speech, so I cannot open the other books here. He did answer the question underneath most of them.',
        '',
        passageBlock(DOORS.twoCommands.verse, DOORS.twoCommands.context),
        '',
      ];
      const top = c.themes[0];
      if (top && top.n >= 3) {
        const p = THEMES[top.theme].passages[hashOf(text) % THEMES[top.theme].passages.length];
        lines.push(passageBlock(p.verse, p.context), '');
      }
      lines.push('If you want, tell me what sent you looking, and I will stay with that.');
      return lines.join('\n');
    }
    case 'professional': {
      const theme = (c.themes[0] && c.themes[0].n >= 3 && c.themes[0].theme) || 'Anxiety & Worry';
      const lead = 'I am not a doctor, a lawyer, or a financial adviser, and these words are not that kind of help. Please take the practical question to someone licensed to answer it. What He said can sit beside you while you do.';
      return themeLetter(theme, text, { lead, closing: 'Make the call to the professional first. Then come back and read these again.' });
    }
    case 'hostile':
      return [
        'I am not a person, and I will not pretend otherwise. This is a page that keeps His recorded words and cites them so you can check every line against the Gospel yourself. I have no argument to win.',
        '',
        passageBlock(DOORS.asking.verse, DOORS.asking.context),
        '',
        'If you ever want to test the words rather than the page, they are all here, and none of them are mine.',
      ].join('\n');
    case 'gratitude':
      return [
        'I am glad. Take one of these with you; they were spoken to be kept.',
        '',
        passageBlock(DOORS.joy.verse, DOORS.joy.context),
        '',
        passageBlock(DOORS.peace.verse, DOORS.peace.context),
        '',
        'Go gently. The room stays open.',
      ].join('\n');
    case 'hello':
      return [
        'I am here. Say what you are carrying in a sentence; there is no wrong way to begin, and nothing you write leaves this device.',
        '',
        passageBlock(DOORS.invitation.verse, 'This is the door He leaves open for anyone who arrives tired.'),
        '',
        'One sentence is enough.',
      ].join('\n');
    case 'need': {
      const lead = c.otherAuthor
        ? 'This room keeps to the four Gospels and to His own speech, so I cannot open the other books here. He spoke to this, though. ' + (HEAR[c.theme] || '')
        : (c.softCrisis ? 'I heard the second half of that sentence, and I believe you. I am staying with the first half: ' + (HEAR[c.theme] || '') : undefined);
      const letter = themeLetter(c.theme, text, { lead });
      if (!c.softCrisis) return letter;
      return letter + '\n\nAnd if the dark ever turns toward ending it, 988 (call, text, or chat at 988lifeline.org) answers day and night in the United States; findahelpline.com lists lines everywhere else. I am not a person, and this page is not emergency care.';
    }
    default:
      return searchLetter(text);
  }
}

module.exports = { CUES, HEAR, DOORS, classify, compose, scoreThemes };
