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

const CATCH_STOP = new Set('the a an and or but for with from that this you your i we they to of in on as is be my our not'.split(' '));

function catchwordOf(text) {
  const words = String(text || '').replace(/[“”"'.,;:!?]/g, '').split(/\s+/).filter(Boolean);
  return words.find((w) => w.length > 3 && !CATCH_STOP.has(w.toLowerCase())) || words[0] || '';
}

function localDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sheetFor(raw, now = new Date()) {
  const today = localDate(now);
  const src = raw && typeof raw === 'object' ? raw : {};
  const until = /^\d{4}-\d{2}-\d{2}$/.test(String(src.until || '')) ? String(src.until) : today;
  if (until < today) {
    return {
      q: '',
      crisis: false,
      notice: '',
      words: [],
      implication: '',
      translation: 'KJV',
      watch: true,
      amen: false,
      catchword: '',
      until,
      kept: false,
    };
  }
  const leaf = normalizeSitting(src);
  leaf.words = leaf.words.slice(0, 1);
  leaf.until = until;
  leaf.catchword = leaf.crisis ? '' : catchwordOf(leaf.words[0] && leaf.words[0].quote);
  leaf.amen = !leaf.crisis && leaf.words.length > 0;
  leaf.kept = leaf.crisis ? Boolean(leaf.notice) : leaf.words.length > 0;
  return leaf;
}

module.exports = {
  CATCH_STOP,
  MAX_WORDS,
  catchwordOf,
  isPrintable,
  localDate,
  normalizeSitting,
  sheetFor,
};
