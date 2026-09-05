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

  // Optional remote API origin for static hosts (GitHub Pages) that have no
  // /api routes of their own: <meta name="rla-api-base" content="https://…">
  function detectApiBase() {
    const meta = document.querySelector('meta[name="rla-api-base"]');
    const value = meta && meta.getAttribute('content');
    if (!value || !/^https?:\/\//i.test(value.trim())) return '';
    return value.trim().replace(/\/+$/, '');
  }

  const API_BASE = detectApiBase();

  function rlaUrl(path) {
    const raw = String(path || '');
    if (/^https?:\/\//i.test(raw)) return raw;
    const normalized = raw.charAt(0) === '/' ? raw : `/${raw}`;
    if (API_BASE && /^\/api\//.test(normalized)) return `${API_BASE}${normalized}`;
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
    __RLA_API_BASE__: API_BASE,
    rlaUrl,
    localTodayStr,
    cleanCitation,
  });
})(window);
