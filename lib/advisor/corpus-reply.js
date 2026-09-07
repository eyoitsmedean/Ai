/**
 * Corpus-mode replies — what the Advisor says when no model is available.
 *
 * Everything here is built from the curated red-letter corpus, so every
 * passage is verified by construction. The voice is a careful friend:
 * meet the person first (THEME_OPENER), then two hand-picked leads, then one
 * rotating lead (THEME_LEADS), each with a one-line "why" that is true of that
 * passage. THEME_CONTEXT is the generic framing used only when a theme has no
 * curated leads. Lead choice is a safety decision: RELEASE.md §F B04/B10
 * records why "Cheer up!" and "steal, kill, and destroy" were removed from
 * the defaults.
 */
const corpus = require('../../data/red-letters');
const { hash } = require('./normalize');

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

module.exports = { offlineDaily, offlineEncouragement, THEME_LEADS, THEME_OPENER, THEME_CONTEXT };
