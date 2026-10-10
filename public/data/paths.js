/* Named paths — Seven is the first week; Forty is the longer story (Lent, or after Day 7).
   Words are public-domain KJV speech of Jesus. */
(function () {
  // Forty is the Lent path in forty.js (load it first); these are its counted days.
  window.RLA_FORTY = (window.RLA_FORTY_PATH || []).filter(function (e) { return e.kind === 'day'; });

  window.RLA_pathList = function (kind) {
    if (kind === 'forty' && window.RLA_FORTY && window.RLA_FORTY.length) return window.RLA_FORTY;
    return window.RLA_SEVEN || [];
  };
})();
