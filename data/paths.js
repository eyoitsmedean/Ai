/* Named paths — Seven is the first week; Forty is the longer story (Lent, or after Day 7).
   Both come from lib/curated.js through the generated data; nothing here types Scripture. */
(function () {
  var paths = (window.RLA_CURATED && window.RLA_CURATED.paths) || {};
  window.RLA_FORTY = (paths.forty || []).slice();

  window.RLA_pathList = function (kind) {
    if (kind === 'forty' && window.RLA_FORTY.length) return window.RLA_FORTY;
    return window.RLA_SEVEN || [];
  };
})();
