const { retrieveSayings } = require('./retrieve');
const { encouragementFor, dailyForDate } = require('./curated');
const { fillPlaceholders, looksLikeCrisis, looksLikeDanger } = require('./scripture');

const NO_ROOM_OPENING = 'I could not tell from your words which room they belong in, so I will not pretend to. Here is what He said that holds on most nights. If you can name the weight in one more sentence, I will look again.';
const CRISIS_OPENING = 'What you wrote matters more than anything else on this page. The numbers above reach real people, tonight, and they are the first step — not this room. These words are for while you wait on the line, or for after.';
const CRISIS_FOR_ANOTHER_OPENING = 'Someone you love has said the hardest thing there is to hear. The numbers above are for them and for you — a counselor can tell you what to say tonight, and how to stay close. These words are for you while you make that call.';
const DANGER_OPENING = 'What happened to you — or is still happening — is not your fault, and you should not have to carry it alone. The people at the numbers above will believe you. These words are for you, not for anyone who has hurt you.';
const DANGER_BY_YOU_OPENING = 'You asked about hurting someone. He never said that — not once, in any Gospel. The people at the number above also talk with people who are frightened of their own anger, and they will not shame you for calling. These words are for you.';

// The only passages a crisis-shaped question is ever answered with.
const CRISIS_PASSAGES = [
  { verse: 'John 14:27', context: 'He leaves peace the way someone leaves a key. It is already in the house.' },
  { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted. Rest is a gift, not a prize for the strong.' },
  { verse: 'Luke 12:7', context: 'Counted, down to the hairs of your head. You are not a burden to Him.' },
];
// Passages any composer (server or client) may hand a person in crisis. Nothing about departure or heaven-as-escape.
const CRISIS_SAFE = ['John 14:27', 'Matthew 11:28', 'Matthew 11:28–29', 'Matthew 11:28–30', 'Luke 12:7', 'Luke 12:6–7', 'John 16:33', 'Mark 4:39', 'Matthew 28:20', 'John 14:18'];

const THIRD_PERSON_RE = /\b(?:himself|herself|themselves|his life|her life|their life|he wants|she wants|my (?:son|daughter|friend|brother|sister|wife|husband|mom|mum|dad|mother|father|kid|child|student|partner|boyfriend|girlfriend) (?:said|told|wants|is|has|keeps))\b/i;
const BY_YOU_RE = /\b(?:allowed to (?:beat|hit|hurt)|i (?:want|wanna|am going|'m going|might|could) (?:to )?(?:hit|beat|hurt|kill) (?:my|him|her|them)|i (?:hit|beat|hurt) (?:my|him|her)|afraid (?:of what )?i(?:'ll| will| might) (?:do|hurt|hit))\b/i;

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

  const crisis = looksLikeCrisis(q);
  const danger = !crisis && looksLikeDanger(q);
  const themes = retrieveSayings(q, { limit: 1 }).themes || [];

  let opening;
  let chosen;
  let pack;

  if (crisis) {
    opening = THIRD_PERSON_RE.test(q) ? CRISIS_FOR_ANOTHER_OPENING : CRISIS_OPENING;
    chosen = CRISIS_PASSAGES.map((p) => ({ cite: p.verse, context: p.context }));
    pack = encouragementFor('Peace');
  } else {
    const primary = danger ? 'Suffering & Pain' : (themes[0] || 'Peace');
    pack = encouragementFor(primary) || encouragementFor('Peace');
    opening = danger
      ? (BY_YOU_RE.test(q) ? DANGER_BY_YOU_OPENING : DANGER_OPENING)
      : (themes.length ? pack.opening : NO_ROOM_OPENING);
    chosen = [];
    const seen = new Set();
    const add = (p) => {
      if (!p || seen.has(p.verse)) return;
      seen.add(p.verse);
      chosen.push({ cite: p.verse, context: p.context });
    };
    pack.passages.slice(0, 2).forEach(add);
    const second = !danger && themes[1] ? encouragementFor(themes[1]) : null;
    if (second) add(second.passages[0]);
    if (chosen.length < 3) pack.passages.slice(2).forEach(add);
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

module.exports = { adviseLetter, CRISIS_PASSAGES, CRISIS_SAFE, CRISIS_OPENING, CRISIS_FOR_ANOTHER_OPENING, DANGER_OPENING, DANGER_BY_YOU_OPENING, NO_ROOM_OPENING };
