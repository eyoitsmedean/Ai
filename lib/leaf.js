/**
 * Household sitting leaf. One sheet. No invented speech.
 * The page at /leaf reads a sitting saved on this device after /ask.
 */
const MAX_WORDS = 2;
const MAX_Q = 2000;

function fourLines(text) {
  return String(text || '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join('\n');
}

function cleanWord(row) {
  if (!row || typeof row !== 'object') return null;
  const verse = String(row.verse || '').trim();
  const quote = String(row.quote || '').trim();
  if (!verse || !quote) return null;
  if (!/^(Matthew|Mark|Luke|John) /.test(verse)) return null;
  return {
    verse,
    quote,
    translation: String(row.translation || 'KJV').trim() || 'KJV',
  };
}

function normalizeSitting(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const crisis = src.crisis === true;
  const words = crisis
    ? []
    : (Array.isArray(src.words) ? src.words : []).map(cleanWord).filter(Boolean).slice(0, MAX_WORDS);
  return {
    q: String(src.q || '').trim().slice(0, MAX_Q),
    crisis,
    notice: crisis ? String(src.notice || '').trim() : '',
    words,
    implication: crisis ? '' : fourLines(src.implication),
    translation: String(src.translation || 'KJV').trim() || 'KJV',
    watch: true,
    amen: !crisis && words.length > 0,
  };
}

function isPrintable(sitting) {
  const leaf = normalizeSitting(sitting);
  if (leaf.crisis) return Boolean(leaf.notice);
  return leaf.words.length > 0;
}

module.exports = { MAX_WORDS, isPrintable, normalizeSitting };
