/**
 * Text normalisation shared by the safety gate and citation verification.
 *
 * Two different jobs, two different functions:
 *   normalizeText  — for comparing scripture quotes (typographic quotes/dashes → ASCII)
 *   normForIntent  — for classifying user input (NFKC, strip zero-width, lowercase)
 * They are kept separate on purpose: quote comparison must not be as aggressive
 * as intent normalisation, and intent normalisation must defeat evasion.
 */

function normalizeText(s) {
  return String(s || '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function similarity(a, b) {
  const A = normalizeText(a);
  const B = normalizeText(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A)) return 0.92;
  // Token Jaccard
  const ta = new Set(A.split(' ').filter(Boolean));
  const tb = new Set(B.split(' ').filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.max(1, ta.size + tb.size - inter);
}

// Normalise before classifying: NFKC, strip zero-width chars, collapse
// whitespace, lowercase. Keeps "k\u200bill myself" and curly apostrophes from
// slipping past the patterns.
function normForIntent(text) {
  return String(text || '')
    .normalize('NFKC')
    .replace(/[\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Deterministic 32-bit string hash used to vary picks by date or seed. */
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

module.exports = { normalizeText, similarity, normForIntent, hash };
