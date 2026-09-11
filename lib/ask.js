/**
 * One-screen advisor — Ask → The words → Meaning (≤4 lines) → What this bot cannot do.
 *
 * This is the later-amendment product (Notion, 2026-09-11): a tired reader, one screen,
 * Jesus’s speech, then silence. Crisis and abuse stop. No Gospel counsel after 988.
 *
 * The five-room folio Advisor (`lib/advise.js`) is the atelier brain. It still writes
 * verses after a crisis line; that drift is recorded in docs/CANON.md. Do not “fix”
 * folio letters here — the 82-question eval encodes those scripts.
 */
const { classify } = require('./advise');
const { lookup } = require('./scripture');
const { THEMES } = require('./curated');
const { tokens } = require('./retrieve');

const CANNOT = [
  'This page is not a pastor, not a diagnosis, and not a substitute for a person who knows your name.',
  'If you are in danger, call 988 in the United States, or start at findahelpline.com anywhere else.',
].join('\n');

const STOP = new Set(['crisis', 'crisisOther', 'crisisLoss', 'crisisAsk', 'abuse']);

const MEANING = {
  'Anxiety & Worry': [
    'Tomorrow is not asking for you yet.',
    'He limits the work to this day so a week you have not been given does not have to live in your chest.',
    'You do not have to finish the future tonight.',
  ].join('\n'),
  Fear: [
    'Fear makes the thing you face larger than everything else.',
    'He does not deny the thing. He tells you what you are worth beside it.',
    'You are held more tightly than the report in the hallway.',
  ].join('\n'),
  'Grief & Loss': [
    'Mourning is not a failure of faith. It is love with nowhere to stand.',
    'He blesses the ones who actually mourn, and He does not hurry them.',
    'You are allowed to say the name. You are not alone in the saying.',
  ].join('\n'),
  Loneliness: [
    'An empty room can feel like a verdict. He answers it as company, not a technique.',
    'You were not meant to be an orphan in this.',
    'The room is less empty than it feels.',
  ].join('\n'),
  Forgiveness: [
    'He never asks you to call the wound small.',
    'Mercy is how the Father looks, and it is also the next honest step you can take today.',
    'You do not have to finish the whole road before evening.',
  ].join('\n'),
  'Shame & Guilt': [
    'Shame wants you out of the room. He still knows how to lift a face.',
    'He tells the story from the shepherd’s side: the finding is a feast, not a courtroom.',
    'You are not too far for Him to walk.',
  ].join('\n'),
  'Suffering & Pain': [
    'Pain is not a riddle you failed to solve.',
    'The invitation is to the exhausted. Rest is a gift, not a prize for the strong.',
    'Your pain is seen. It is not the last sentence.',
  ].join('\n'),
  'Conflict & Relationships': [
    'He takes the other person seriously, and He takes you seriously too.',
    'Blessing is an action, not a feeling you wait to arrive.',
    'You can be clear and still be kind.',
  ].join('\n'),
  'Purpose & Direction': [
    'He tends to hand people a first step and a direction to face, not a whole map.',
    'Light is something you already are. The work is not to hide.',
    'One honest step in this hour is enough.',
  ].join('\n'),
  'Faith & Doubt': [
    'Doubt is not a firing offence in the Gospels. He let a doubter touch the wound.',
    'A troubled heart is invited to believe — not to pretend it is calm first.',
    'You can bring the question. You do not have to bring the proof.',
  ].join('\n'),
  Peace: [
    'The world offers a pause between problems. He leaves a peace that can sit in a troubled room and still be itself.',
    'The storm is addressed by name. Calm is spoken, not negotiated.',
  ].join('\n'),
  Hope: [
    'Hope is not pretending. Sorrow is admitted first.',
    'The joy He speaks of is guarded by His return, not by your grip.',
    'The last word over your life is not the night you are in.',
  ].join('\n'),
};

const KIND_MEANING = {
  hello: [
    'Whatever brought you to a page like this one, this is the door He leaves open.',
    'You do not have to be well to come. One sentence about what is heavy is enough.',
  ].join('\n'),
  gratitude: [
    'Take the sentence with you. It was spoken to be kept.',
    'Go gently. The page stays open.',
  ].join('\n'),
  practical: [
    'This page cannot help with that practical question. He did not speak to it.',
    'If something under the question is heavy, name that in a sentence.',
  ].join('\n'),
  otherAuthor: [
    'This page keeps to the four Gospels and to His own speech, so it will not open the other books.',
    'He did answer the question underneath most of them. Here is where He began.',
  ].join('\n'),
  professional: [
    'I am not a doctor, a lawyer, or a financial adviser, and these words are not that kind of help.',
    'Take the practical question to someone licensed to answer it.',
    'What He said can sit beside you while you do.',
  ].join('\n'),
  hostile: [
    'This is a page that keeps His recorded words and cites them so you can check every line.',
    'I have no argument to win. If you want to test the words rather than the page, they are here.',
  ].join('\n'),
  injection: [
    'I only carry one set of instructions here: the words Jesus spoke, cited so you can check every line.',
    'I cannot set that aside or become something else. If there is a real question under this one, ask it plainly.',
  ].join('\n'),
  search: [
    'You did not name a feeling, so this is the saying that sits closest to your words.',
    'If it is not the one you needed, say more in a sentence.',
  ].join('\n'),
  ref: [
    'You brought one of His sentences with you. Here it is whole, from the Gospel it is printed in.',
    'Read it once more, slowly. A sentence you carry is already a prayer.',
  ].join('\n'),
  refOther: [
    'Those words are printed in the Gospel around Him, but they are not words He spoke.',
    'This page will not put them in His mouth. Here is what He said that still meets a person who arrived with that verse.',
  ].join('\n'),
  spanish: [
    'Esta página todavía lee solo en inglés, y no quiero adivinar lo que llevas.',
    'If you can, write one sentence in English. The sentence below is His invitation, in the English this room keeps.',
  ].join('\n'),
};

const HANDOFF = {
  crisis: [
    'If you are in danger of harming yourself, stop here.',
    '',
    'United States: 988 — call, text, or chat. https://988lifeline.org/',
    'Anywhere else: https://findahelpline.com/',
    '',
    'This page will not add counsel or a verse after that number. I am not a person, and this is not emergency care.',
  ].join('\n'),
  crisisOther: [
    'You are carrying someone else’s danger. If they are in immediate danger, call 911 or your local emergency number now.',
    '',
    '988 (call, text, or chat at 988lifeline.org) is also for people worried about someone they love.',
    'Anywhere else: https://findahelpline.com/',
    '',
    'Ask them directly whether they are thinking of ending their life. Stay close. This page will not add a verse. I am not a person, and this is not emergency care.',
  ].join('\n'),
  crisisLoss: [
    'Someone you love died this way, and you are still here with the questions that kind of death leaves behind. I am sorry.',
    '',
    '988 (call, text, or chat at 988lifeline.org) also answers for people grieving a death by suicide or overdose.',
    'Anywhere else: https://findahelpline.com/',
    '',
    'This page will not add counsel or a verse tonight. I am not a person, and this is not counselling.',
  ].join('\n'),
  crisisAsk: [
    'If you are asking about yourself, stop here and reach a person.',
    '',
    'United States: 988 — call, text, or chat. https://988lifeline.org/',
    'Anywhere else: https://findahelpline.com/',
    '',
    'This page will not answer that question with a verse. I am not a person, and this is not emergency care.',
  ].join('\n'),
  abuse: [
    'What you are describing is violence, and it is not the fault of the person it is happening to. If anyone is in danger right now, call 911 or your local emergency number.',
    '',
    'United States: National Domestic Violence Hotline — 1-800-799-7233, text START to 88788, or thehotline.org.',
    'Sexual assault: RAINN — 800-656-4673, text HOPE to 64673, or hotline.rainn.org.',
    '',
    'This page will not add a verse. I am not a person, and this page cannot keep anyone safe; those lines can help you plan how to be.',
  ].join('\n'),
  softCrisis: [
    'What you wrote is heavy enough that this page should not answer with a verse.',
    '',
    'United States: 988 — call, text, or chat. https://988lifeline.org/',
    'Anywhere else: https://findahelpline.com/',
    '',
    'This page will not add counsel or a verse. I am not a person, and this is not emergency care.',
  ].join('\n'),
  spanishCrisis: [
    'Si estás pensando en quitarte la vida, por favor busca a una persona ahora.',
    '',
    'Estados Unidos: 988 (llamar, escribir, o chat). https://988lifeline.org/',
    'Otros países: https://findahelpline.com/',
    '',
    'Esta página no añadirá un versículo después de ese número. No soy una persona, y esto no es atención de emergencia.',
  ].join('\n'),
};

function fourLines(text) {
  const lines = String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.slice(0, 4).join('\n');
}

function sealed(citation) {
  const hit = lookup(citation);
  if (!hit || !hit.redLetter || !hit.text) return null;
  return hit;
}

function themeOf(c) {
  if (c.theme && THEMES[c.theme]) return c.theme;
  const top = c.themes && c.themes[0];
  if (top && top.n >= 1 && THEMES[top.theme]) return top.theme;
  return '';
}

function stopKind(c) {
  if (!c) return '';
  if (c.kind === 'spanish' && c.crisis) return 'spanishCrisis';
  if (STOP.has(c.kind)) return c.kind;
  if (c.softCrisis) return 'softCrisis';
  return '';
}

function priorStop(prior) {
  if (!Array.isArray(prior)) return '';
  for (const line of prior) {
    const kind = stopKind(classify(String(line || '')));
    if (kind) return kind;
  }
  return '';
}

function pickCitation(c) {
  if (c.kind === 'ref') return c.ref;
  const theme = themeOf(c);
  if (theme) return THEMES[theme].passages[0].verse;
  if (c.kind === 'professional') return 'Matthew 11:28';
  if (c.kind === 'hostile' || c.kind === 'injection') return 'Matthew 7:7–8';
  if (c.kind === 'otherAuthor') return 'Matthew 22:37–40';
  if (c.kind === 'gratitude') return 'John 14:27';
  return 'Matthew 11:28';
}

function meaningFor(c) {
  if (KIND_MEANING[c.kind] && c.kind !== 'need' && c.kind !== 'search') {
    return fourLines(KIND_MEANING[c.kind]);
  }
  const theme = themeOf(c);
  if (theme && MEANING[theme]) return fourLines(MEANING[theme]);
  return fourLines(KIND_MEANING.search);
}

function stopResult(kind) {
  return {
    stop: true,
    kind,
    citation: '',
    quote: '',
    meaning: '',
    handoff: HANDOFF[kind] || HANDOFF.crisis,
    cannot: CANNOT,
    edition: '',
  };
}

function counselResult(c) {
  const hit = sealed(pickCitation(c));
  if (!hit) {
    return {
      stop: false,
      kind: c.kind,
      citation: '',
      quote: '',
      meaning: fourLines('I looked, and I will not invent a sentence He did not speak. Say more in a sentence, and I will look again.'),
      handoff: '',
      cannot: CANNOT,
      edition: '',
    };
  }
  return {
    stop: false,
    kind: c.kind,
    citation: hit.citation,
    quote: hit.text,
    meaning: meaningFor(c),
    handoff: '',
    cannot: CANNOT,
    edition: 'KJV 1769',
  };
}

/**
 * composeAsk(text, { prior })
 * prior: earlier user lines, oldest first. A short follow-up stays with the last real ask.
 */
function composeAsk(raw, { prior = [] } = {}) {
  const text = String(raw || '').trim();
  if (!text) {
    return {
      stop: false,
      kind: 'empty',
      citation: '',
      quote: '',
      meaning: '',
      handoff: '',
      cannot: CANNOT,
      edition: '',
    };
  }

  const held = priorStop(prior);
  if (held) return stopResult(held);

  let c = classify(text);
  if ((c.kind === 'hello' || c.kind === 'search') && tokens(text).length <= 3 && Array.isArray(prior) && prior.length) {
    const back = prior.slice().reverse().find((p) => tokens(p).length >= 3);
    if (back) {
      const before = classify(back);
      const heldBack = stopKind(before);
      if (heldBack) return stopResult(heldBack);
      if (before.kind === 'need' || before.kind === 'ref') c = before;
    }
  }

  const now = stopKind(c);
  if (now) return stopResult(now);
  return counselResult(c);
}

module.exports = {
  CANNOT,
  HANDOFF,
  MEANING,
  composeAsk,
};
