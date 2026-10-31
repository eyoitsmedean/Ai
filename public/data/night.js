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

  return { dailyIndex, pickDaily };
});
