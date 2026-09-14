/**
 * One-screen advisor payload.
 * Ask → the words → four lines of implication → what this bot cannot do.
 * Crisis: name 988 and stop. No further counsel.
 *
 * Words come from the primary theme pack. If retrieval found a wider
 * spoken span of the same saying, that span is set instead. Implication
 * is the stored context of the verses shown — not the theme essay.
 */
const { retrieveSayings, guessThemes } = require('./retrieve');
const { encouragementFor } = require('./curated');
const { looksLikeCrisis, CRISIS_NOTICE, spokenLookup, parseRef } = require('./scripture');

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

function refsOverlap(a, b) {
  const pa = parseRef(a);
  const pb = parseRef(b);
  if (!pa || !pb || pa.book !== pb.book || pa.chapter !== pb.chapter) return false;
  return pa.start <= pb.end && pa.end >= pb.start;
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

function implicationFor(pack, words) {
  const bits = [];
  for (const w of words) {
    const row = (pack.passages || []).find((p) => refsOverlap(p.verse, w.verse));
    if (row?.context) bits.push(row.context);
  }
  if (!bits.length && pack.opening) bits.push(pack.opening);
  return fourLines(bits.join(' '));
}

function citationToSet(packVerse, retrievedCite) {
  if (!retrievedCite || !refsOverlap(packVerse, retrievedCite)) return packVerse;
  const pack = parseRef(packVerse);
  const got = parseRef(retrievedCite);
  if (!pack || !got) return packVerse;
  // A span that starts much earlier is a different saying with this verse inside it.
  if (got.start < pack.start - 1) return packVerse;
  return retrievedCite;
}

function wordsForPack(pack, retrieved) {
  const sayings = retrieved || [];
  const out = [];
  const seen = new Set();
  for (const passage of pack.passages || []) {
    const match = sayings.find((s) => refsOverlap(s.citation, passage.verse));
    const word = spokenWord(citationToSet(passage.verse, match && match.citation));
    if (!word) continue;
    const key = word.verse.toLowerCase();
    if (seen.has(key) || out.some((w) => refsOverlap(w.verse, word.verse))) continue;
    seen.add(key);
    out.push(word);
    if (out.length >= 2) break;
  }
  return out;
}

function askFor(query) {
  const asked = String(query || '').trim();
  if (!asked) return emptyAsk();

  if (looksLikeCrisis(asked)) {
    return emptyAsk({ crisis: true, notice: CRISIS_NOTICE.trim() });
  }

  const themes = guessThemes(asked);
  if (!themes.length) return emptyAsk();

  const pack = encouragementFor(themes[0]);
  if (!pack || !pack.passages) return emptyAsk();

  const { sayings } = retrieveSayings(asked, { limit: 6 });
  const words = wordsForPack(pack, sayings);
  if (!words.length) return emptyAsk();

  return {
    crisis: false,
    notice: '',
    words,
    implication: implicationFor(pack, words),
    cannot: CANNOT,
    translation: 'KJV',
    theme: pack.theme,
    verified: true,
    watch: true,
  };
}

module.exports = { CANNOT, CRISIS_NOTICE, askFor, refsOverlap };
