/* The hour names the room. Between 9pm and 6am it does not keep score. */
(function (root) {
  function watchForHour(hour) {
    const h = Number(hour);
    if (h < 6) return 'night';
    if (h < 11) return 'dawn';
    if (h < 17) return 'day';
    if (h < 21) return 'vespers';
    return 'night';
  }

  function keepsScore(hour) {
    return watchForHour(hour) !== 'night';
  }

  const api = { watchForHour, keepsScore };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_WATCH = api;
})(typeof self !== 'undefined' ? self : this);
