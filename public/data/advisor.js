/* Living Advisor for the static page — the same letterpress the server runs,
   fed the same generated sayings. Works with no API host at all. */
(function () {
  function data() {
    return window.RLA_CURATED || { packs: {}, commons: [] };
  }

  function press() {
    return window.RLA_LETTERPRESS;
  }

  /* text: what the reader wrote. history: earlier turns [{ role, content }]. */
  window.RLA_advise = function (text, history) {
    var engine = press();
    if (!engine) return '';
    var letter = engine.composeLetter(text, {
      history: history || [],
      packs: data().packs,
      commons: data().commons,
    });
    var body = engine.renderLetter(letter, { placeholders: false });
    return engine.looksLikeCrisis(text) ? engine.CRISIS_NOTICE + body : body;
  };

  /* Seven Days with His words — the named path (Hallow’s lesson, our length). */
  window.RLA_SEVEN = ((data().paths || {}).seven || []).slice();
})();
