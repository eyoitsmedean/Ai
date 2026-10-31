/* Named paths — Seven is the first week; Advent waits; Forty is the Lent road.
   Words are public-domain KJV speech of Jesus. */
(function () {
  // Forty is the Lent path in forty.js (load it first); these are its counted days.
  window.RLA_FORTY = (window.RLA_FORTY_PATH || []).filter(function (e) { return e.kind === 'day'; });
  window.RLA_ADVENT = window.RLA_ADVENT_PATH || [];

  window.RLA_pathList = function (kind) {
    if (kind === 'advent' && window.RLA_ADVENT && window.RLA_ADVENT.length) return window.RLA_ADVENT;
    if (kind === 'forty' && window.RLA_FORTY && window.RLA_FORTY.length) return window.RLA_FORTY;
    return window.RLA_SEVEN || [];
  };
})();
