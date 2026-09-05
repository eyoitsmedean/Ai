/* Resolve asset/API paths for Railway (/) and GitHub Pages (/Ai/). */
(function (global) {
  'use strict';

  function detectBase() {
    let path = global.location.pathname || '/';
    if (/\/index\.html$/i.test(path)) {
      path = path.replace(/\/index\.html$/i, '/');
    }
    if (path === '/' || path === '') return '';
    return path.replace(/\/$/, '');
  }

  const BASE = detectBase();

  function rlaUrl(path) {
    const raw = String(path || '');
    if (/^https?:\/\//i.test(raw)) return raw;
    const normalized = raw.charAt(0) === '/' ? raw : `/${raw}`;
    return `${BASE}${normalized}`;
  }

  function localTodayStr(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function cleanCitation(verse) {
    return String(verse || '')
      .replace(/^[—–\-\s]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  Object.assign(global, {
    __RLA_BASE__: BASE,
    rlaUrl,
    localTodayStr,
    cleanCitation,
  });
})(window);
