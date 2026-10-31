/* Shared slot math for the Night leaf. Same local-midnight clock as lib/curated.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RLA_NIGHT = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function dailyIndex(date, length) {
    if (!length) return 0;
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const raw = Math.floor(local.getTime() / 86400000) % length;
    return raw < 0 ? raw + length : raw;
  }

  function pickDaily(days, date) {
    if (!Array.isArray(days) || !days.length) return null;
    return days[dailyIndex(date || new Date(), days.length)] || null;
  }

  function dateKey(date) {
    const d = date || new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function storageKey(date) {
    return 'rla-night-' + dateKey(date);
  }

  /** One sentence, kept on the device. Newlines become a space. */
  function normalizeLeave(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
  }

  /** null = not yet closed. '' = Amen with nothing written. */
  function readLeave(storage, date) {
    try {
      const raw = storage.getItem(storageKey(date));
      if (raw == null) return null;
      return normalizeLeave(raw);
    } catch (_) {
      return null;
    }
  }

  function writeLeave(storage, date, text) {
    const value = normalizeLeave(text);
    storage.setItem(storageKey(date), value);
    return value;
  }

  return { dailyIndex, pickDaily, dateKey, storageKey, normalizeLeave, readLeave, writeLeave };
});
