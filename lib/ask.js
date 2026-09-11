/**
 * One-screen advisor payload.
 * Ask → the words → four lines of implication → what this bot cannot do.
 * Crisis: name 988 and stop. No further counsel.
 */
const { retrieveSayings } = require('./retrieve');
const { encouragementFor } = require('./curated');
const { looksLikeCrisis, CRISIS_NOTICE, spokenLookup } = require('./scripture');

const CANNOT = [
  'This is not a pastor, not a church, not a confession booth, and not a crisis counselor.',
  'If you are in crisis or thinking about harming yourself, call or text 988 in the United States, or talk to a local pastor, counselor, or trusted human.',
  'This screen cannot replace real people who can help.',
].join(' ');

const COMFORT = ['John 14:27', 'Matthew 11:28'];

function spokenWord(citation) {
  const spoken = spokenLookup(citation);
  if (!spoken) return null;
  return { verse: spoken.citation, quote: spoken.text, translation: 'KJV' };
}

function fourLines(text) {
  const parts = String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  return parts.join('\n');
}

function askFor(query) {
  const asked = String(query || '').trim();
  if (!asked) {
    return {
      crisis: false,
      notice: '',
      words: [],
      implication: '',
      cannot: CANNOT,
      translation: 'KJV',
      verified: true,
      watch: true,
    };
  }

  if (looksLikeCrisis(asked)) {
    return {
      crisis: true,
      notice: CRISIS_NOTICE.trim(),
      words: [],
      implication: '',
      cannot: CANNOT,
      translation: 'KJV',
      verified: true,
      watch: true,
    };
  }

  const { themes } = retrieveSayings(asked, { limit: 3 });
  const pack = themes[0] ? encouragementFor(themes[0]) : null;
  const cites = pack && pack.passages
    ? pack.passages.slice(0, 2).map((p) => p.verse)
    : COMFORT;
  const words = cites.map(spokenWord).filter(Boolean);
  const sealed = words.length ? words : COMFORT.map(spokenWord).filter(Boolean);

  const implication = pack
    ? fourLines([pack.opening, pack.passages?.[0]?.context].filter(Boolean).join(' '))
    : fourLines('These words meet a troubled heart without asking it to perform calm first. You do not have to solve the whole day.');

  return {
    crisis: false,
    notice: '',
    words: sealed,
    implication,
    cannot: CANNOT,
    translation: 'KJV',
    theme: pack ? pack.theme : '',
    verified: sealed.length > 0,
    watch: true,
  };
}

module.exports = { CANNOT, CRISIS_NOTICE, askFor };
