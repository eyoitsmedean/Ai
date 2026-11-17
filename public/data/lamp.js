/**
 * Night-watch Lamp. One rule: if the reader has not locked parchment or
 * dark paper, the room follows the night office (9pm–6am).
 *
 * The page loads this in <head> so the first paint is already dark at 3am.
 * The server does not need it; tests require the same file.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RedLetterLamp = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const PAPER = '#F4EFE4';
  const VOID = '#14110D';

  function isNightHour(hour) {
    const h = Number(hour);
    return h < 6 || h >= 21;
  }

  function lampShouldBeDark(pref, hour) {
    if (pref === '1') return true;
    if (pref === '0') return false;
    return isNightHour(hour);
  }

  function applyLamp(doc, pref, hour) {
    const dark = lampShouldBeDark(pref, hour);
    if (!doc || !doc.documentElement) return dark;
    doc.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const meta = doc.querySelector && doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? VOID : PAPER);
    const bar = doc.querySelector && doc.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (bar) bar.setAttribute('content', dark ? 'black-translucent' : 'default');
    return dark;
  }

  return { PAPER, VOID, isNightHour, lampShouldBeDark, applyLamp };
});
