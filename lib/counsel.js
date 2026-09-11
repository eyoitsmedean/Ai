/* The letter the room writes when the model is not available — no key, an outage, a refusal.
   It must still answer *this* question: the need is guessed from the writer's words, the passages
   come from the curated rooms (each already verified against the corpus), and every citation is
   filled and verified by verifyAndSubstitute before it leaves the server. The voice lines are the same ones the client's
   offline advisor (data/advisor.js) uses, so the room sounds the same with or without the lamp. */
const { encouragementFor, themeNames } = require('./curated');
const { guessThemes } = require('./retrieve');
const { lookup, looksLikeCrisis, looksLikeAbuse } = require('./scripture');

const VOICE = {
  'Anxiety & Worry': {
    hear: 'I hear the spiral. Tomorrow has gotten too loud, and you are tired of carrying a day that has not arrived.',
    close: 'One day is enough to hold. His words meet you in the room with no windows.',
  },
  Fear: {
    hear: 'Fear is shrinking the future. You do not have to pretend the waves are small.',
    close: 'Courage is not the absence of fear. It is hearing “it is I” in the middle of it.',
  },
  'Grief & Loss': {
    hear: 'Grief is not a failure of faith. Something has a name, and it is gone, and you are still here.',
    close: 'Your tears are seen. Comfort is company within pain — not a dismissal of it.',
  },
  Loneliness: {
    hear: 'Loneliness can convince you that you are unseen. You are not an interruption.',
    close: 'You are someone Jesus calls friend. Presence does not expire at the end of a text thread.',
  },
  Forgiveness: {
    hear: 'Forgiveness is one of the hardest sentences he spoke — and one of the freest. You do not have to finish the road today.',
    close: 'Mercy is often a road, not a moment. Take the next honest step.',
  },
  'Shame & Guilt': {
    hear: 'Shame wants you out of the room. He still knows how to lift a face.',
    close: 'You are not your worst hour. Neither do I condemn thee is the first word, not the last excuse.',
  },
  'Suffering & Pain': {
    hear: 'Pain is not a riddle you failed to solve. He names tribulation and still says come.',
    close: 'Your pain is not a failure of faith. Rest is offered to the laden, not the finished.',
  },
  'Conflict & Relationships': {
    hear: 'Conflict lodges in the body. He treats the other person as worship’s unfinished business — not a side issue.',
    close: 'You do not have to finish the story today. You can take the next faithful step toward them.',
  },
  'Purpose & Direction': {
    hear: 'Direction-anxiety wants a five-year map. He offers a first thing and a following.',
    close: 'You do not need the whole map. You need the next yes.',
  },
  'Faith & Doubt': {
    hear: 'Doubt is not a firing offense in the Gospels. He lets a doubter touch the wound.',
    close: 'Faith is not the absence of questions. It is staying close enough to touch.',
  },
  Peace: {
    hear: 'The world offers a pause between problems. He offers a peace that can sit in a troubled room and still be itself.',
    close: 'His peace is not the absence of storms. It is his presence within them.',
  },
  Hope: {
    hear: 'Hope is not naive optimism. In his words it is anchored in who he is, not in how you feel this hour.',
    close: 'Good cheer is possible because he has overcome — not because you have to.',
  },
};

const ANYONE = {
  hear: 'I am here with what you brought. Before advice, two sentences he actually spoke.',
  close: 'You can sit with one line. Nothing else is required of this hour.',
  passages: [
    { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted, not the already-healed.' },
    { verse: 'John 14:27', context: 'Peace is left with you — a gift, not a mood you manufacture.' },
  ],
};

/* The room holds only His words. When nothing in the question reaches them, say so rather than
   pretend a verse answers a weather report — and leave the door open for what is underneath. */
const OUT_OF_ROOM = {
  hear: 'This room holds only what Jesus said, so I cannot answer that as it is asked. If there is something under the question — a worry, a person, a night that will not end — write it plainly and I will look for his words on it. Until then, two sentences anyone may keep.',
  close: 'Come back with the thing itself. The room is open.',
};

/* Under the human-help notice a crisis line gets company, not a scope disclaimer — the same words the
   client's offline advisor uses. Passages come from the room the writer's words reached, if any. */
const CRISIS_BODY = {
  hear: 'While you reach a person who can help, here is a word he spoke to the heavy-laden.',
  close: 'You are not alone in this hour. Please go toward help now.',
};

/* A person being hurt at home does not get "love your enemies" as the first word.
   These two sayings are His, already in the corpus: flee when persecuted; He came
   that they might have life, not destruction. */
const DANGER_BODY = {
  hear: 'What is happening to you is not a riddle you failed. Safety is not a lack of faith.',
  close: 'You may leave a room that is killing you. A person who can help outranks this page.',
};

const DANGER_PASSAGES = [
  { verse: 'Matthew 10:23', context: 'He names fleeing a city that persecutes you. Leaving is not the opposite of faith.' },
  { verse: 'John 10:10', context: 'The thief comes to steal and kill. He came that you might have life.' },
];

const ENEMY_LOVE = /\b(Matthew 5:39|Matthew 5:44|Luke 6:27|Luke 6:28|Matthew 5:38)\b/;

/* Cues the retriever does not carry but a reader at a low moment often writes. Weight 2 is a named
   feeling or event; weight 1 is a noun that only hints at the room ("wife", "job"). Rooms are summed
   and the heaviest wins; ties fall to ROOM_PRIORITY, where the more particular need outranks the
   general one (grief before anxiety, shame before conflict). */
const EXTRA_CUES = [
  [/\b(depress|hopeless|numb|empty inside|can'?t get out of bed|nothing (?:matters|will (?:ever )?change)|no point|tired of everything)/i, 'Hope', 2],
  [/\b(exhaust|burn(?:t|ed)? out|nothing left|running on empty|so tired)/i, 'Suffering & Pain', 1],
  [/\b(angry|anger|furious|rage|resent|jealous|env(?:y|ious)|hate (?:him|her|them|my)|cruel|abus)/i, 'Forgiveness', 2],
  [/\b(divorc|marriage|husband|wife|partner|boyfriend|girlfriend|breakup|broke up|cheated|affair|estranged|won'?t (?:talk|speak) to me)/i, 'Conflict & Relationships', 1],
  [/\b(my (?:son|daughter|kids?|children|teenager|parents|dad|mom|mother|father|brother|sister) (?:won'?t|doesn'?t|hates|and I))/i, 'Conflict & Relationships', 1],
  [/\b(money|debt|bills|rent|job|fired|laid off|unemploy|afford|broke|enough for us|interview|deadline|exam)/i, 'Anxiety & Worry', 1],
  [/\b(diagnos|cancer|hospital|chemo|surgery|chronic|disease|doctor said|stage [1-4]|terminal|tumou?r|hospice|dementia|alzheimer|caregiv|take care of my)/i, 'Suffering & Pain', 2],
  [/\b(failed|failure|mistake|regret|ruined|let (?:everyone|them|her|him) down|disappoint|ashamed|relaps|not (?:good )?enough|come up short|compar(?:e|ing) my|worthless|inadequate|screwed up|messed up)/i, 'Shame & Guilt', 2],
  [/\b(pray|prayer|god (?:is|feels) (?:silent|far|gone)|does god|is god (?:even )?(?:real|there|listening)|where is god|believe|atheist|unbeliev|faith feels)/i, 'Faith & Doubt', 2],
  [/\b(miss (?:him|her|them|my)|passed away|gone forever|since (?:he|she|they) died|miscarr|stillbirth|lost (?:the|my|our) (?:baby|child|son|daughter|mother|father|mom|dad|wife|husband|brother|sister)|funeral|buried)/i, 'Grief & Loss', 3],
  [/\b(nobody|no one|by myself|isolated|friendless|no friends|invisible|unseen|ignored|left out|don'?t belong|can'?t breathe)/i, 'Loneliness', 2],
  [/\b(decision|decide|choose|which (?:way|path|job)|should i (?:take|move|leave|stay)|what to do with my life|every path|no idea what|stuck|meaning)/i, 'Purpose & Direction', 2],
  [/\b(chaos|can'?t (?:settle|rest)|racing)/i, 'Peace', 1],
];

const ROOM_PRIORITY = [
  'Grief & Loss', 'Suffering & Pain', 'Shame & Guilt', 'Fear', 'Loneliness', 'Forgiveness',
  'Faith & Doubt', 'Conflict & Relationships', 'Purpose & Direction', 'Hope', 'Anxiety & Worry', 'Peace',
];

function themesFor(text) {
  const score = new Map();
  const bump = (theme, w) => { if (themeNames().includes(theme)) score.set(theme, (score.get(theme) || 0) + w); };
  for (const theme of guessThemes(text)) bump(theme, 2);
  for (const [re, theme, w] of EXTRA_CUES) if (re.test(text)) bump(theme, w);
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || ROOM_PRIORITY.indexOf(a[0]) - ROOM_PRIORITY.indexOf(b[0]))
    .map(([theme]) => theme);
}

/* The model's own marker form; verifyAndSubstitute fills it from the corpus, so no verse is typed here. */
function block(verse, context) {
  return lookup(verse) ? `{{${verse}}}\n${context}` : null;
}

function composeLetter(text) {
  const raw = String(text || '').trim();
  const crisis = looksLikeCrisis(raw);
  const abuse = looksLikeAbuse(raw);
  const themes = themesFor(raw);

  if (abuse && !crisis) {
    const passages = DANGER_PASSAGES.map((p) => block(p.verse, p.context)).filter(Boolean);
    return [DANGER_BODY.hear, '', ...passages.flatMap((p) => [p, '']), DANGER_BODY.close].join('\n').trim();
  }

  if (crisis && !themes.length) {
    const passages = ANYONE.passages.map((p) => block(p.verse, p.context)).filter(Boolean);
    return [CRISIS_BODY.hear, '', ...passages.flatMap((p) => [p, '']), CRISIS_BODY.close].join('\n').trim();
  }

  if (!themes.length) {
    const passages = ANYONE.passages.map((p) => block(p.verse, p.context)).filter(Boolean);
    return [OUT_OF_ROOM.hear, '', ...passages.flatMap((p) => [p, '']), OUT_OF_ROOM.close].join('\n').trim();
  }

  const lead = themes[0];
  const voice = crisis ? CRISIS_BODY : (VOICE[lead] || ANYONE);
  const passages = [];
  const seen = new Set();
  const want = themes.length > 1 ? 3 : 2;
  for (const theme of themes.slice(0, 2)) {
    const pack = encouragementFor(theme);
    for (const p of (pack && pack.passages) || []) {
      if (passages.length >= want) break;
      if (seen.has(p.verse)) continue;
      seen.add(p.verse);
      const b = block(p.verse, p.context);
      if (b) passages.push(b);
    }
  }
  if (!passages.length) {
    for (const p of ANYONE.passages) {
      const b = block(p.verse, p.context);
      if (b) passages.push(b);
    }
  }
  return [voice.hear, '', ...passages.flatMap((p) => [p, '']), voice.close].join('\n').trim();
}

/* Another author cited as scripture. The Gospels are not in this list on purpose. */
const OTHER_AUTHOR = /\b(Psalms?|Proverbs|Isaiah|Jeremiah|Ezekiel|Daniel|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Chronicles|Job|Ecclesiastes|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+(?::\d+)?/;

/* The floor every letter must clear after verifyAndSubstitute, whoever wrote it: at least one of His
   sayings printed from the corpus, and no other author cited as scripture. A model letter that fails
   is replaced by composeLetter, which cannot fail it. */
function letterPassesFloor(letter) {
  const text = String(letter || '');
  if (OTHER_AUTHOR.test(text)) return false;
  const lines = text.split('\n');
  return lines.some((line, i) => {
    const m = line.trim().match(/^\*\*([^*]+)\*\*$/);
    if (!m) return false;
    const hit = lookup(m[1]);
    return Boolean(hit && hit.redLetter && (lines[i + 1] || '').trim() === `“${hit.text}”`);
  });
}

module.exports = { composeLetter, letterPassesFloor, themesFor, ROOM_PRIORITY, VOICE, OUT_OF_ROOM, CRISIS_BODY, DANGER_BODY, ENEMY_LOVE, OTHER_AUTHOR };
