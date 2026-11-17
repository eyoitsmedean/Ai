/* The hours of the folio, in one place. The Lamp, the office names, the
   wash and the score all read these bands, so they turn at the same minute.
     night    21:00–05:59  Compline; the Lamp; no score
     dawn     06:00–11:59  Morning
     day      12:00–16:59  Afternoon
     vespers  17:00–20:59  Vespers */
(function (root) {
  function watchForHour(hour) {
    const h = Number(hour);
    if (h < 6) return 'night';
    if (h < 12) return 'dawn';
    if (h < 17) return 'day';
    if (h < 21) return 'vespers';
    return 'night';
  }

  function isNightHour(hour) {
    return watchForHour(hour) === 'night';
  }

  // The evening office runs from Vespers through Compline.
  function isEveningHour(hour) {
    const w = watchForHour(hour);
    return w === 'vespers' || w === 'night';
  }

  function officeNameForHour(hour) {
    return { night: 'Compline', vespers: 'Vespers', dawn: 'Morning', day: 'Afternoon' }[watchForHour(hour)];
  }

  function keepsScore(hour) {
    return !isNightHour(hour);
  }

  const api = { watchForHour, isNightHour, isEveningHour, officeNameForHour, keepsScore };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_HOURS = api;
})(typeof self !== 'undefined' ? self : this);
