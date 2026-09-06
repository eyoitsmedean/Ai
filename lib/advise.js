const { retrieveSayings } = require('./retrieve');
const { encouragementFor, dailyForDate } = require('./curated');
const { fillPlaceholders, looksLikeCrisis, looksLikeDanger, looksLikeByYou, looksLikeBereaved, parseRef } = require('./scripture');

const NO_ROOM_OPENING = 'I could not tell from your words which room they belong in, so I will not pretend to. Here is what He said that holds on most nights. If you can name the weight in one more sentence, I will look again.';
const CRISIS_OPENING = 'What you wrote matters more than anything else on this page. The numbers above reach real people, tonight, and they are the first step — not this room. These words are for while you wait on the line, or for after.';
const CRISIS_FOR_ANOTHER_OPENING = 'Someone you love has said the hardest thing there is to hear. The numbers above are for them and for you — a counselor can tell you what to say tonight, and how to stay close. These words are for you while you make that call.';
const CRISIS_BEREAVED_OPENING = 'Someone you love is gone, and the way they went has left you carrying more than grief. The number above is for you too: the people there sit with those left behind, tonight, and will not hurry you. These words are for you.';
const DANGER_OPENING = 'What happened to you — or is still happening — is not your fault, and you should not have to carry it alone. The people at the numbers above will believe you. These words are for you, not for anyone who has hurt you.';
const DANGER_BY_YOU_OPENING = 'You asked about hurting someone. He never said that — not once, in any Gospel. The people at the number above also talk with people who are frightened of their own anger, and they will not shame you for calling. These words are for you.';

// The only passages a crisis-shaped question is ever answered with.
const CRISIS_PASSAGES = [
  { verse: 'John 14:27', context: 'He leaves peace the way someone leaves a key. It is already in the house.' },
  { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted. Rest is a gift, not a prize for the strong.' },
  { verse: 'Luke 12:7', context: 'Counted, down to the hairs of your head. You are not a burden to Him.' },
];
// Passages any composer (server, client, or model) may hand a person in crisis. Nothing about departure or heaven-as-escape.
const CRISIS_SAFE = ['John 14:27', 'Matthew 11:28', 'Matthew 11:28–29', 'Matthew 11:28–30', 'Luke 12:7', 'Luke 12:6–7', 'John 16:33', 'Mark 4:39', 'Matthew 28:20', 'John 14:18'];

const THIRD_PERSON_RE = /\b(?:himself|herself|themselves|his life|her life|their life|he wants|she wants|he doesn'?t|she doesn'?t|he wishes|she wishes|he keeps|she keeps|my (?:son|daughter|friend|brother|sister|wife|husband|mom|mum|dad|mother|father|kid|child|student|partner|boyfriend|girlfriend) (?:said|told|wants|is|has|keeps))\b/i;

/**
 * Which room a question belongs in, and everything that follows from that:
 * the notice, the opening, the passages any composer may use. The model path and
 * the retrieval path both read this, so no composer can wander out of the room.
 */
function roomFor(question) {
  const q = String(question || '').trim();
  const crisis = looksLikeCrisis(q);
  const bereaved = crisis && looksLikeBereaved(q);
  const danger = !crisis && looksLikeDanger(q);
  const byYou = danger && looksLikeByYou(q);
  const themes = q ? (retrieveSayings(q, { limit: 1 }).themes || []) : [];

  let primary;
  let opening;
  let allowed;
  if (crisis && bereaved) {
    primary = 'Grief & Loss';
    opening = CRISIS_BEREAVED_OPENING;
    allowed = [...encouragementFor(primary).passages.map((p) => p.verse), ...CRISIS_SAFE];
  } else if (crisis) {
    primary = 'Peace';
    opening = THIRD_PERSON_RE.test(q) ? CRISIS_FOR_ANOTHER_OPENING : CRISIS_OPENING;
    allowed = [...CRISIS_SAFE];
  } else if (danger) {
    primary = 'Suffering & Pain';
    opening = byYou ? DANGER_BY_YOU_OPENING : DANGER_OPENING;
    allowed = [...encouragementFor(primary).passages.map((p) => p.verse), ...encouragementFor('Peace').passages.map((p) => p.verse)];
  } else {
    primary = themes[0] || 'Peace';
    const pack = encouragementFor(primary) || encouragementFor('Peace');
    opening = themes.length ? pack.opening : NO_ROOM_OPENING;
    allowed = pack.passages.map((p) => p.verse);
    if (themes[1] && encouragementFor(themes[1])) allowed.push(...encouragementFor(themes[1]).passages.map((p) => p.verse));
    if (themes.length) {
      // Sayings the Library tags with the same rooms — never the question's own keywords.
      for (const s of retrieveSayings(q, { limit: 12, themesOnly: true }).sayings || []) allowed.push(s.citation);
    } else {
      allowed.push(...encouragementFor('Peace').passages.map((p) => p.verse), 'Matthew 28:20', 'John 14:18');
    }
  }
  const pack = encouragementFor(primary) || encouragementFor('Peace');
  return { question: q, crisis, bereaved, danger, byYou, themes, primary, pack, opening, allowed: [...new Set(allowed)] };
}

// Same book and chapter, and the cited verses fall inside (strict) or touch (loose) an allowed span.
function citationAllowed(cite, allowed, { strict = false } = {}) {
  const c = parseRef(cite);
  if (!c) return false;
  for (const a of allowed) {
    const p = parseRef(a);
    if (!p || p.book !== c.book || p.chapter !== c.chapter) continue;
    if (strict ? (c.start >= p.start && c.end <= p.end) : (c.start <= p.end && c.end >= p.start)) return true;
  }
  return false;
}

/**
 * The Advisor letter when no model is configured.
 *
 * The room the question names supplies every passage: curated, exact, humane,
 * and each with a written sentence of context. Nothing is pulled in by the
 * question's own keywords — "brother", "house", "sleep", "sword" have all
 * dragged in a verse that wounded someone on a bad day.
 */
function adviseLetter(question) {
  const q = String(question || '').trim();
  if (!q) {
    const daily = dailyForDate(new Date());
    return fillPlaceholders([
      'Peace I leave with you.',
      '',
      `{{${daily.word.verse}}}`,
      daily.word.reflection,
    ].join('\n'));
  }

  const room = roomFor(q);
  const { crisis, bereaved, danger, themes, pack, opening } = room;

  let chosen;
  if (crisis && !bereaved) {
    chosen = CRISIS_PASSAGES.map((p) => ({ cite: p.verse, context: p.context }));
  } else {
    chosen = [];
    const seen = new Set();
    const add = (p) => {
      if (!p || seen.has(p.verse)) return;
      seen.add(p.verse);
      chosen.push({ cite: p.verse, context: p.context });
    };
    pack.passages.slice(0, 2).forEach(add);
    const second = !danger && !crisis && themes[1] ? encouragementFor(themes[1]) : null;
    if (second) add(second.passages[0]);
    // A question with no room gets the two calmest lines and an invitation to say more — not a third
    // passage about tribulation handed to someone planning a visit or painting a nursery.
    const noRoom = !crisis && !danger && !themes.length;
    if (chosen.length < 3 && !noRoom) pack.passages.slice(2).forEach(add);
  }

  const lines = [opening, ''];
  for (const item of chosen.slice(0, 3)) {
    lines.push(`{{${item.cite}}}`);
    lines.push(item.context);
    lines.push('');
  }
  if (pack.practice) lines.push(pack.practice);
  if (pack.closing) {
    lines.push('');
    lines.push(pack.closing);
  }
  return fillPlaceholders(lines.join('\n'));
}

module.exports = {
  adviseLetter,
  citationAllowed,
  roomFor,
  CRISIS_PASSAGES,
  CRISIS_SAFE,
  CRISIS_OPENING,
  CRISIS_FOR_ANOTHER_OPENING,
  CRISIS_BEREAVED_OPENING,
  DANGER_OPENING,
  DANGER_BY_YOU_OPENING,
  NO_ROOM_OPENING,
};
