/* Visible scripture cites must name the translation (prompt 10).
   Online Today / Seek / Advisor are KJV. Offline ordinary readings are WEB.
   Do not invent a label when the source did not say. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RedLetterCite = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LABEL_RE = /\s*[·•]\s*(KJV(?:\s+pack)?|WEB)\s*$/i;
  const LEADING_DASH_RE = /^[—–\-\s]+/;

  function citeTranslation(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const fromLabel = raw.match(LABEL_RE);
    if (fromLabel) return /WEB/i.test(fromLabel[1]) ? 'WEB' : 'KJV';
    const upper = raw.toUpperCase();
    if (upper === 'KJV' || upper.startsWith('KJV')) return 'KJV';
    if (upper === 'WEB' || /WORLD ENGLISH/.test(upper)) return 'WEB';
    return '';
  }

  function bareCitation(ref) {
    return String(ref || '')
      .replace(LEADING_DASH_RE, '')
      .replace(LABEL_RE, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatVerseCite(ref, translation) {
    const verse = bareCitation(ref);
    if (!verse) return '';
    const label = citeTranslation(translation) || citeTranslation(ref);
    return label ? `${verse} · ${label}` : verse;
  }

  return { citeTranslation, bareCitation, formatVerseCite };
});
