/* The letter the room writes when the model is not available — no key, an outage, a refusal.
   It must still answer *this* question: the need is guessed from the writer's words, the passages
   come from the curated rooms (each already verified against the corpus), and every citation is
   filled and verified by verifyAndSubstitute before it leaves the server. The voice lines are the same ones the client's
   offline advisor (data/advisor.js) uses, so the room sounds the same with or without the lamp. */
const { encouragementFor, themeNames } = require('./curated');
const { guessThemes } = require('./retrieve');
const { lookup } = require('./scripture');

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

/* Cues the retriever does not carry but a reader at a low moment often writes. Each maps to a room. */
const EXTRA_CUES = [
  [/\b(depress|hopeless|numb|empty|can'?t get out of bed|nothing matters|no point|exhausted|burn(?:t|ed)? out|tired of everything)\b/i, 'Hope'],
  [/\b(angry|anger|furious|rage|resent)\b/i, 'Forgiveness'],
  [/\b(divorc|marriage|husband|wife|partner|boyfriend|girlfriend|breakup|broke up|cheated|affair)\b/i, 'Conflict & Relationships'],
  [/\b(money|debt|bills|rent|job|fired|laid off|unemploy|afford|broke)\b/i, 'Anxiety & Worry'],
  [/\b(diagnos|cancer|hospital|chemo|surgery|chronic|disease)\b/i, 'Suffering & Pain'],
  [/\b(failed|failure|mistake|regret|ruined|let everyone down|disappoint)\b/i, 'Shame & Guilt'],
  [/\b(pray|prayer|god (?:is|feels) (?:silent|far|gone)|does god|is god (?:even )?(?:real|there|listening)|where is god|believe|atheist|unbeliev)/i, 'Faith & Doubt'],
  [/\b(miss (?:him|her|them|my)|passed|gone forever|since (?:he|she|they) died)\b/i, 'Grief & Loss'],
  [/\b(nobody|no one|by myself|isolated|friendless|no friends)\b/i, 'Loneliness'],
  [/\b(decision|decide|choose|which (?:way|path|job)|should i (?:take|move|leave|stay))\b/i, 'Purpose & Direction'],
];

function themesFor(text) {
  const found = guessThemes(text);
  for (const [re, theme] of EXTRA_CUES) {
    if (re.test(text) && !found.includes(theme) && themeNames().includes(theme)) found.push(theme);
  }
  return found;
}

/* The model's own marker form; verifyAndSubstitute fills it from the corpus, so no verse is typed here. */
function block(verse, context) {
  return lookup(verse) ? `{{${verse}}}\n${context}` : null;
}

function composeLetter(text) {
  const raw = String(text || '').trim();
  const themes = themesFor(raw);

  if (!themes.length) {
    const passages = ANYONE.passages.map((p) => block(p.verse, p.context)).filter(Boolean);
    return [OUT_OF_ROOM.hear, '', ...passages.flatMap((p) => [p, '']), OUT_OF_ROOM.close].join('\n').trim();
  }

  const lead = themes[0];
  const voice = VOICE[lead] || ANYONE;
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

module.exports = { composeLetter, themesFor, VOICE, OUT_OF_ROOM };
