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
  'If you are in crisis or thinking about harming yourself, call or text 988 in the United States (Suicide & Crisis Lifeline), or start at https://findahelpline.com anywhere else, or talk to a local pastor, counselor, or trusted human.',
  'This screen cannot replace real people who can help.',
].join(' ');

const EMPTY_IMPLY = 'Name the feeling — fear, shame, grief, weariness — and the page can set a saying. Nothing is invented to fill the silence.';

function spokenWord(citation) {
  const spoken = spokenLookup(citation);
  if (!spoken || !spoken.text) return null;
  return { verse: spoken.citation, quote: spoken.text, translation: 'KJV' };
}

function fourLines(text) {
  const parts = String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  let out = parts.join('\n');
  if (out.length > 320) {
    out = `${out.slice(0, 317).replace(/\s+\S*$/, '')}…`;
  }
  return out;
}

function emptyAsk({ crisis = false, notice = '' } = {}) {
  return {
    crisis,
    notice,
    words: [],
    implication: crisis ? '' : fourLines(EMPTY_IMPLY),
    cannot: CANNOT,
    translation: 'KJV',
    verified: false,
    watch: true,
  };
}

function askFor(query) {
  const asked = String(query || '').trim();
  if (!asked) return emptyAsk();

  if (looksLikeCrisis(asked)) {
    return emptyAsk({ crisis: true, notice: CRISIS_NOTICE.trim() });
  }

  const { themes } = retrieveSayings(asked, { limit: 3 });
  const pack = themes[0] ? encouragementFor(themes[0]) : null;
  if (!pack || !pack.passages) return emptyAsk();

  const words = pack.passages.slice(0, 2).map((p) => spokenWord(p.verse)).filter(Boolean);
  if (!words.length) return emptyAsk();

  return {
    crisis: false,
    notice: '',
    words,
    implication: fourLines([pack.opening, pack.passages[0]?.context].filter(Boolean).join(' ')),
    cannot: CANNOT,
    translation: 'KJV',
    theme: pack.theme,
    verified: true,
    watch: true,
  };
}

module.exports = { CANNOT, CRISIS_NOTICE, askFor };
