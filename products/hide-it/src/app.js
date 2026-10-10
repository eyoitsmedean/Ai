(function () {
  'use strict';

  var C = window.__HIDEIT__;
  var ui = C.ui;
  var MODES = C.modes;
  var MASTERY = C.mastery;
  var INTERVALS = [0, 1, 3, 7, 14, 30];
  var KEY = 'redletter.hideit.v1';
  var DAY = 86400000;

  // ---------- Sayings ----------
  var ALL = [];
  var BY_ID = {};
  C.collections.forEach(function (c) {
    c.sayings.forEach(function (s) {
      var x = { id: s.id, ref: s.ref, cue: s.cue, text: s.text, collection: c.id, collectionName: c.name, index: ALL.length };
      ALL.push(x);
      BY_ID[s.id] = x;
    });
  });

  function normWord(w) {
    return String(w).toLowerCase().replace(/[’‘']/g, '').replace(/[^a-z0-9]/g, '');
  }
  // The KJV verse may run on with a colon; the saying is shown without it and
  // a muted ellipsis marks that the verse continues.
  function shown(text) { return text.replace(/[:;,]$/, ''); }
  function runsOn(text) { return /[:;,]$/.test(text); }
  function tokens(text) {
    return shown(text).split(' ').map(function (raw, i) { return { raw: raw, norm: normWord(raw), i: i }; });
  }
  function phrases(toks) {
    var out = [[]];
    toks.forEach(function (t, i) {
      out[out.length - 1].push(t);
      if (/[,;:.?!]$/.test(t.raw) && i < toks.length - 1) out.push([]);
    });
    return out;
  }
  function sizeClass(n) { return n > 24 ? 'size-l' : n > 14 ? 'size-m' : ''; }

  // Deterministic shuffles so a saying behaves the same way each visit.
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // ---------- Clock ----------
  function now() { return typeof window.__hideItNow === 'number' ? window.__hideItNow : Date.now(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function keyOf(ms) { var d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return keyOf(now()); }
  function parseKey(k) { var p = k.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = new Date(parseKey(k) + n * DAY); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function diffDays(a, b) { return Math.round((parseKey(b) - parseKey(a)) / DAY); }
  function weekday(k) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(parseKey(k)).getUTCDay()]; }

  // ---------- Storage ----------
  var memory = null;
  var storageOK = true;
  function fresh() {
    return { v: 1, sayings: {}, streak: { count: 0, last: null, grace: [], days: [] }, settings: { theme: 'auto', motion: false, newPerDay: 3 }, learnedOn: {} };
  }
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function load() {
    var raw = null, s = null;
    try {
      raw = window.localStorage.getItem(KEY);
      window.localStorage.setItem(KEY + '.probe', '1');
      window.localStorage.removeItem(KEY + '.probe');
    } catch (e) { storageOK = false; }
    // Unreadable saved data is set aside; storage itself still works.
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    var base = fresh();
    if (!isObj(s)) return base;
    // Take only fields of the right shape, so data from an older or newer
    // version (or a half-written save) can never stop the app from starting.
    if (isObj(s.sayings)) {
      Object.keys(s.sayings).forEach(function (id) {
        var r = s.sayings[id];
        if (!isObj(r)) return;
        var box = Math.max(0, Math.min(5, Math.floor(+r.box) || 0));
        base.sayings[id] = {
          box: box,
          due: typeof r.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.due) ? r.due : (box > 0 ? today() : null),
          modes: isObj(r.modes) ? r.modes : {},
          reviews: +r.reviews || 0,
          lapses: +r.lapses || 0,
        };
        if (typeof r.last === 'string') base.sayings[id].last = r.last;
      });
    }
    if (isObj(s.streak)) {
      var st = s.streak;
      base.streak.count = Math.max(0, Math.floor(+st.count) || 0);
      base.streak.last = typeof st.last === 'string' ? st.last : null;
      base.streak.grace = Array.isArray(st.grace) ? st.grace.filter(function (k) { return typeof k === 'string'; }) : [];
      base.streak.days = Array.isArray(st.days) ? st.days.filter(function (k) { return typeof k === 'string'; }) : [];
    }
    if (isObj(s.settings)) {
      var se = s.settings;
      if (se.theme === 'auto' || se.theme === 'light' || se.theme === 'dark') base.settings.theme = se.theme;
      if (typeof se.motion === 'boolean') base.settings.motion = se.motion;
      var npd = Math.floor(+se.newPerDay);
      if (npd >= 1 && npd <= 20) base.settings.newPerDay = npd;
    }
    if (isObj(s.learnedOn)) Object.keys(s.learnedOn).forEach(function (k) { var v = +s.learnedOn[k]; if (v >= 0) base.learnedOn[k] = v; });
    return base;
  }
  function save() {
    memory = JSON.stringify(state);
    try { window.localStorage.setItem(KEY, memory); } catch (e) { storageOK = false; }
  }
  var state = load();

  function rec(id) {
    if (!state.sayings[id]) state.sayings[id] = { box: 0, due: null, modes: {}, reviews: 0, lapses: 0 };
    return state.sayings[id];
  }
  function boxOf(id) { return state.sayings[id] ? state.sayings[id].box : 0; }
  function started(id) { var r = state.sayings[id]; return !!(r && (r.box > 0 || Object.keys(r.modes || {}).length)); }
  function dueList() {
    var t = today();
    return ALL.filter(function (s) { var r = state.sayings[s.id]; return r && r.box > 0 && r.due && r.due <= t; })
      .sort(function (a, b) { return state.sayings[a.id].due < state.sayings[b.id].due ? -1 : state.sayings[a.id].due > state.sayings[b.id].due ? 1 : a.index - b.index; });
  }
  function nextNew() { for (var i = 0; i < ALL.length; i++) if (boxOf(ALL[i].id) === 0) return ALL[i]; return null; }
  function learnedToday() { return state.learnedOn[today()] || 0; }

  // ---------- Streak ----------
  function graceLeft(t) {
    var used = state.streak.grace.filter(function (d) { var g = diffDays(d, t); return g > 0 && g <= 7; }).length;
    return Math.max(0, 2 - used);
  }
  function markActivity() {
    var t = today();
    var s = state.streak;
    if (s.last === t) return null;
    var msg = null;
    if (!s.last) s.count = 1;
    else {
      var gap = diffDays(s.last, t) - 1;
      if (gap <= 0) s.count += 1;
      else if (gap <= graceLeft(t)) {
        for (var k = 1; k <= gap; k++) s.grace.push(addDays(s.last, k));
        s.count += 1;
        msg = ui.streak.graceUsed;
      } else { s.count = 1; msg = ui.streak.restarted; }
    }
    s.last = t;
    if (s.days.indexOf(t) < 0) s.days.push(t);
    s.days = s.days.slice(-90);
    s.grace = s.grace.slice(-30);
    return msg;
  }
  function streakNow() {
    var s = state.streak;
    if (!s.last) return 0;
    var gap = diffDays(s.last, today()) - 1;
    if (gap <= 0) return s.count;
    return gap <= graceLeft(today()) ? s.count : 0;
  }

  // ---------- Scheduling ----------
  function learnSaying(id) {
    var r = rec(id);
    if (r.box > 0) return false;
    r.box = 1;
    r.due = addDays(today(), INTERVALS[1]);
    r.learned = today();
    var n = learnedToday();
    state.learnedOn = {};
    state.learnedOn[today()] = n + 1;
    return true;
  }
  function rate(id, how) {
    var r = rec(id);
    r.reviews += 1;
    if (how === 'again') { r.box = 1; r.lapses += 1; }
    else if (how === 'good') r.box = Math.min(5, Math.max(1, r.box) + 1);
    else r.box = Math.max(1, r.box);
    r.due = addDays(today(), INTERVALS[r.box]);
    r.last = today();
    return r;
  }

  // ---------- Typing check ----------
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 2;
    var prev = [], cur = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  // 'ok' for an exact match. 'near' for a one-letter slip in a long word, so
  // thee, thou, ye and hath must still be typed as written. Old verb and
  // pronoun forms (shalt, hast, saith, thine, giveth...) never get the
  // allowance either, so 'shall' for 'shalt' or 'gives' for 'giveth' is missed.
  var ARCHAIC = { shalt: 1, hast: 1, hadst: 1, wast: 1, wilt: 1, art: 1, doth: 1, dost: 1, saith: 1, thine: 1, thee: 1, thou: 1, thy: 1, ye: 1, hath: 1, canst: 1, couldest: 1, didst: 1, shouldest: 1, wouldest: 1, knowest: 1, sayest: 1, mayest: 1, seest: 1, lovest: 1, unto: 1, alway: 1 };
  function archaic(w) { return ARCHAIC[w] === 1 || (w.length >= 5 && /[^aeiou]eth$/.test(w)); }
  function wordMatch(want, got) {
    if (want === got) return 'ok';
    if (archaic(want)) return null;
    if (want.length >= 5 && got.length >= 4 && lev(want, got) === 1) return 'near';
    return null;
  }
  function checkTyped(text, typed) {
    var want = tokens(text);
    var got = String(typed).split(/\s+/).map(normWord).filter(Boolean);
    var n = want.length, m = got.length;
    var L = [];
    for (var i = 0; i <= n; i++) { L[i] = []; for (var j = 0; j <= m; j++) L[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
      L[i][j] = wordMatch(want[i].norm, got[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var marks = want.map(function () { return 'missed'; });
    var extra = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      var mt = wordMatch(want[i].norm, got[j]);
      if (mt && L[i][j] === L[i + 1][j + 1] + 1) { marks[i] = mt; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else { extra.push(got[j]); j++; }
    }
    while (j < m) { extra.push(got[j]); j++; }
    var missed = marks.filter(function (k) { return k === 'missed'; }).length;
    var near = marks.filter(function (k) { return k === 'near'; }).length;
    var verdict = missed === 0 ? 'perfect' : missed <= Math.max(1, Math.round(n * 0.2)) ? 'close' : 'keepGoing';
    return { tokens: want, marks: marks, extra: extra, missed: missed, near: near, total: n, got: n - missed, verdict: verdict };
  }

  // ---------- Helpers ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var $main = document.getElementById('main');
  var $toast = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg) {
    if (!msg) return;
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.classList.remove('show'); }, 4200);
  }
  // Feedback is always announced; it is shown on screen only when nothing
  // else on the page already says it (a wrong chip, for example).
  function say(el, msg, good, visible) {
    if (!el) return;
    el.textContent = '';
    el.className = 'feedback' + (good ? ' good' : '') + (visible ? '' : ' sr-only');
    // A fresh text node makes screen readers announce repeats too.
    setTimeout(function () { el.textContent = msg; }, 30);
  }
  function pips(box) {
    var h = '<span class="pips" role="img" aria-label="' + esc(ui.a11y.masteryOf(MASTERY[box].name)) + '">';
    for (var i = 1; i <= 5; i++) h += '<i class="' + (i <= box ? 'on' : '') + '"></i>';
    return h + '</span>';
  }
  function sayingHTML(s, inner) {
    return '<p class="saying-text ' + sizeClass(tokens(s.text).length) + '" lang="en">' + inner +
      (runsOn(s.text) ? '<span class="trail" aria-hidden="true"> …</span>' : '') + '</p>';
  }
  function cite(s) { return '<p class="cite">' + esc(s.ref) + '</p>'; }

  function applySettings() {
    var root = document.documentElement;
    if (state.settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', state.settings.theme);
    root.classList.toggle('reduce-motion', !!state.settings.motion);
  }
  function renderStreakPill() {
    var n = streakNow();
    var el = document.getElementById('streak-pill');
    el.className = 'streak-pill' + (n ? '' : ' zero');
    el.innerHTML = '<span class="flame" aria-hidden="true"></span><span><span class="sr-only">' + esc(ui.streak.label) + ': </span>' + esc(ui.streak.count(n)) + '</span>';
  }

  // ---------- Router ----------
  var view = { name: '', params: [] };
  var session = null; // transient practice or review state
  function route() {
    var h = (location.hash || '#/today').replace(/^#\/?/, '').split('/');
    var name = h[0] || 'today';
    var params = h.slice(1).map(decodeURIComponent);
    var focus = view.name !== '' && (view.name !== name || params[0] !== view.params[0]);
    view = { name: name, params: params };
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === name || (name === 'practice' && a.getAttribute('data-nav') === 'sayings') || (name === 'review' && a.getAttribute('data-nav') === 'today');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var fn = VIEWS[name] || VIEWS.today;
    $main.classList.remove('view-enter');
    void $main.offsetWidth;
    $main.classList.add('view-enter');
    fn.apply(null, params);
    renderStreakPill();
    if (focus) {
      window.scrollTo(0, 0);
      var h1 = $main.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

  var VIEWS = {};

  // ---------- Today ----------
  VIEWS.today = function () {
    session = null;
    var due = dueList();
    var nn = nextNew();
    var anyStarted = ALL.some(function (s) { return started(s.id); });
    var h = '<h1 class="sr-only">' + esc(ui.today.title) + '</h1>';
    h += '<p class="epigraph">' + esc(ui.epigraph) + '</p>';
    if (!anyStarted) {
      h += '<section class="card welcome wide" aria-labelledby="welcome-h"><h2 id="welcome-h">' + esc(ui.welcome.title) + '</h2>';
      ui.welcome.body.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
      h += '<a class="btn primary" href="#/practice/' + ALL[0].id + '/read" data-test="start">' + esc(ui.welcome.start) + ' <span class="arrow" aria-hidden="true">→</span></a></section><div class="spacer"></div>';
    }
    h += '<div class="today-grid">';
    // Review card
    h += '<section class="card" aria-labelledby="due-h"><p class="eyebrow" id="due-h">' + esc(ui.today.dueHeading) + '</p>';
    h += '<p class="bignum" data-test="due-num">' + due.length + '</p>';
    h += '<p class="muted" data-test="due-text">' + esc(due.length ? ui.today.dueCount(due.length) : ui.today.noneDue) + '</p>';
    if (due.length) h += '<a class="btn primary" href="#/review" data-test="start-review">' + esc(ui.today.startReview) + '</a>';
    else if (anyStarted && state.streak.last === today()) h += '<p class="small muted" style="margin-top:12px">' + esc(ui.today.sessionDone) + ' ' + esc(ui.today.sessionDoneNote) + '</p>';
    h += '</section>';
    // New card
    h += '<section class="card" aria-labelledby="new-h"><p class="eyebrow" id="new-h">' + esc(ui.today.newHeading) + '</p>';
    if (!nn) h += '<p>' + esc(ui.today.allLearned) + '</p>';
    else if (learnedToday() >= state.settings.newPerDay) {
      h += '<p data-test="new-done">' + esc(ui.today.newDone(learnedToday())) + '</p><p class="small muted" style="margin-top:8px">' + esc(ui.today.newDoneNote) + '</p>';
      h += '<a class="btn" href="#/practice/' + nn.id + '/read">' + esc(ui.today.learnNew) + '</a>';
    } else {
      h += '<p class="muted small">' + esc(ui.today.newSuggest) + '</p>';
      h += '<div class="next-saying"><p class="cue">' + esc(nn.cue) + '</p><p class="ref">' + esc(nn.ref) + ' · ' + esc(nn.collectionName) + '</p></div>';
      h += '<a class="btn' + (due.length ? '' : ' primary') + '" href="#/practice/' + nn.id + '/read" data-test="learn-new">' + esc(ui.today.learnNew) + '</a>';
    }
    h += '</section>';
    // Streak card
    var n = streakNow();
    h += '<section class="card wide" aria-labelledby="streak-h"><p class="eyebrow" id="streak-h">' + esc(ui.streak.label) + '</p>';
    h += '<p class="bignum" data-test="streak-num">' + n + '<small>' + esc(n === 1 ? 'day' : 'days') + '</small></p>';
    h += weekStrip();
    h += '<p class="small">' + esc(n ? ui.streak.grace(graceLeft(today())) : ui.streak.zero) + '</p>';
    h += '<p class="small muted" style="margin-top:4px">' + esc(ui.streak.graceExplain) + '</p></section>';
    h += '</div>';
    $main.innerHTML = h;
  };
  function weekStrip() {
    var t = today();
    var h = '<div class="week" role="list" aria-label="' + esc(ui.a11y.weekStrip) + '">';
    for (var i = 6; i >= 0; i--) {
      var d = addDays(t, -i);
      var done = state.streak.days.indexOf(d) >= 0;
      var grace = state.streak.grace.indexOf(d) >= 0;
      var label = done ? ui.a11y.practicedOn(weekday(d)) : grace ? ui.a11y.graceOn(weekday(d)) : ui.a11y.restOn(weekday(d));
      h += '<div role="listitem" class="day' + (done ? ' done' : grace ? ' grace' : '') + (i === 0 ? ' today' : '') + '" aria-label="' + esc(label) + '"><span class="dot" aria-hidden="true"></span><span aria-hidden="true">' + weekday(d).charAt(0) + '</span></div>';
    }
    return h + '</div>';
  }

  // ---------- Sayings ----------
  VIEWS.sayings = function () {
    session = null;
    var h = '<h1 class="view-title">' + esc(ui.nav.collections) + '</h1>';
    h += '<p class="lede">' + esc(ui.progress.learned(ALL.filter(function (s) { return started(s.id); }).length, ALL.length)) + '</p>';
    C.collections.forEach(function (c) {
      var count = c.sayings.filter(function (s) { return started(s.id); }).length;
      h += '<section class="collection" aria-labelledby="c-' + c.id + '"><div class="collection-head"><h2 id="c-' + c.id + '">' + esc(c.name) + '</h2><span class="count">' + esc(ui.progress.learned(count, c.sayings.length)) + '</span></div>';
      h += '<p class="blurb">' + esc(c.blurb) + '</p><ul class="saying-list">';
      c.sayings.forEach(function (s0) {
        var s = BY_ID[s0.id];
        var b = boxOf(s.id);
        h += '<li><a class="saying-row" href="#/practice/' + s.id + '/read" data-id="' + s.id + '"><span class="words">' + esc(shown(s.text)) + (runsOn(s.text) ? ' …' : '') + '</span>' +
          '<span class="meta"><span class="ref">' + esc(s.ref) + '</span> · ' + esc(MASTERY[b].name) + '</span>' + pips(b) + '</a></li>';
      });
      h += '</ul></section>';
    });
    $main.innerHTML = h;
  };

  // ---------- Practice ----------
  VIEWS.practice = function (id, mode) {
    var s = BY_ID[id];
    if (!s) return go('#/sayings');
    if (!MODES.some(function (m) { return m.id === mode; })) mode = 'read';
    if (!session || session.kind !== 'practice' || session.id !== id || session.mode !== mode) session = newPractice(s, mode);
    var r = state.sayings[id] || { box: 0, modes: {} };
    var mi = MODES.findIndex(function (m) { return m.id === mode; });
    var M = MODES[mi];
    var h = '<a class="back" href="#/sayings"><span aria-hidden="true">←</span> ' + esc(ui.practice.back) + '</a>';
    h += '<header class="saying-head"><h1 class="cue">' + esc(s.cue) + '</h1><div class="meta"><span class="ref">' + esc(s.ref) + ' · ' + esc(s.collectionName) + '</span><span class="badge">' + pips(r.box) + ' ' + esc(MASTERY[r.box].name) + '</span></div></header>';
    h += '<nav class="modes" aria-label="' + esc(ui.practice.modeLabel) + '">';
    MODES.forEach(function (m, i) {
      var done = r.modes && r.modes[m.id];
      h += '<a class="mode-tab" href="#/practice/' + id + '/' + m.id + '" data-mode="' + m.id + '"' + (m.id === mode ? ' aria-current="step"' : '') + (done ? ' aria-label="' + esc(ui.a11y.modeDone(m.name)) + '"' : '') + '>' +
        '<span class="n" aria-hidden="true">' + (done ? '<span class="tick">✓</span>' : (i + 1)) + '</span><span>' + esc(m.name) + '</span></a>';
    });
    h += '</nav>';
    h += '<section class="card stage" aria-labelledby="mode-h"><h2 class="sr-only" id="mode-h">' + esc(M.name) + '</h2><p class="instructions">' + esc(M.instructions) + '</p><div id="stage"></div>';
    h += '<p class="feedback sr-only" id="fb" role="status" aria-live="polite" aria-label="' + esc(ui.a11y.feedbackRegion) + '"></p><div id="complete"></div></section>';
    $main.innerHTML = h;
    STAGES[mode](s);
    if (session.completed) showComplete(s, mode, session.completedMsg);
  };
  function newPractice(s, mode) {
    var toks = tokens(s.text);
    var p = { kind: 'practice', id: s.id, mode: mode, toks: toks, completed: false };
    if (mode === 'read') { p.phr = phrases(toks); p.hidden = false; p.shownCount = 0; }
    if (mode === 'fade') {
      p.rounds = Math.min(6, Math.max(3, Math.ceil(toks.length / 4) + 1));
      p.round = 1;
      p.order = shuffle(toks.map(function (t) { return t.i; }), seeded(s.id + ':fade'));
      p.peeks = 0;
      p.peeking = {};
    }
    if (mode === 'build') {
      var rnd = seeded(s.id + ':build');
      var order = shuffle(toks.map(function (t) { return t.i; }), rnd);
      if (toks.length > 1 && order.every(function (v, i) { return v === i; })) order.reverse();
      p.pool = order; p.placed = []; p.mistakes = 0;
    }
    return p;
  }
  function completeMode(s, mode, msgExtra) {
    var r = rec(s.id);
    r.modes[mode] = true;
    var lines = [];
    var streakMsg = markActivity();
    var allDone = MODES.every(function (m) { return r.modes[m.id]; });
    if (allDone && learnSaying(s.id)) lines.push(ui.feedback.sayingLearned);
    save();
    session.completed = true;
    session.completedMsg = [msgExtra].concat(lines).filter(Boolean).join(' ');
    toast(streakMsg);
    renderStreakPill();
    // Refresh the tab ticks and the mastery badge without losing the stage.
    var tab = $main.querySelector('.mode-tab[data-mode="' + mode + '"] .n');
    if (tab) { tab.innerHTML = '<span class="tick">✓</span>'; tab.parentNode.setAttribute('aria-label', ui.a11y.modeDone(MODES.find(function (m) { return m.id === mode; }).name)); }
    var badge = $main.querySelector('.saying-head .badge');
    if (badge) badge.innerHTML = pips(r.box) + ' ' + esc(MASTERY[r.box].name);
    showComplete(s, mode, session.completedMsg);
  }
  function showComplete(s, mode, extra) {
    var mi = MODES.findIndex(function (m) { return m.id === mode; });
    var M = MODES[mi];
    var next = MODES[mi + 1];
    var h = '<div class="complete" data-test="complete"><p class="msg">' + esc(ui.feedback.modeComplete(M.name)) + (extra ? '<span>' + esc(extra) + '</span>' : '') + '</p>';
    h += '<button class="btn quiet" type="button" data-act="again">' + esc(ui.practice.tryAgain) + '</button>';
    if (next) h += '<a class="btn primary" href="#/practice/' + s.id + '/' + next.id + '" data-test="next-mode">' + esc(ui.practice.nextMode) + ': ' + esc(next.name) + ' <span class="arrow" aria-hidden="true">→</span></a>';
    else h += '<a class="btn primary" href="#/today" data-test="finish">' + esc(ui.practice.toToday) + '</a>';
    h += '</div>';
    var el = document.getElementById('complete');
    el.innerHTML = h;
    el.querySelector('[data-act="again"]').addEventListener('click', function () {
      session = newPractice(s, mode);
      VIEWS.practice(s.id, mode);
      var first = $main.querySelector('#stage button, #stage textarea');
      if (first) first.focus();
    });
  }

  var STAGES = {};

  STAGES.read = function (s) {
    var p = session;
    var stage = document.getElementById('stage');
    function draw() {
      var inner = p.phr.map(function (ph, k) {
        var txt = ph.map(function (t) { return esc(t.raw); }).join(' ');
        var covered = p.hidden && k >= p.shownCount;
        return '<span class="ph' + (covered ? ' covered' : '') + (p.hidden && k === p.shownCount ? ' next' : '') + '"' + (covered ? ' aria-hidden="true"' : '') + '>' + txt + '</span>';
      }).join(' ');
      var h = sayingHTML(s, inner) + cite(s) + '<div class="controls">';
      if (!p.hidden) h += '<button class="btn primary" type="button" data-act="hide" data-test="hide">' + esc(ui.practice.hideToRecall) + '</button>';
      else if (p.shownCount < p.phr.length) {
        h += '<button class="btn primary" type="button" data-act="reveal" data-test="reveal">' + esc(MODES[0].action) + '</button>';
        h += '<span class="counter">' + p.shownCount + ' / ' + p.phr.length + '</span>';
      } else h += '<button class="btn" type="button" data-act="again-read">' + esc(ui.practice.readAgain) + '</button>';
      stage.innerHTML = h + '</div>';
      var b = stage.querySelector('[data-act]');
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        if (act === 'hide') { p.hidden = true; p.shownCount = 0; }
        else if (act === 'reveal') p.shownCount++;
        else { p.hidden = false; p.shownCount = 0; }
        draw();
        var nb = stage.querySelector('[data-act]');
        if (nb) nb.focus();
        if (p.hidden && p.shownCount === p.phr.length && !p.completed) completeMode(s, 'read', MODES[0].done + '.');
        else if (act === 'reveal') say(document.getElementById('fb'), p.phr[p.shownCount - 1].map(function (t) { return t.raw; }).join(' '));
      });
    }
    draw();
  };

  STAGES.fade = function (s) {
    var p = session;
    var stage = document.getElementById('stage');
    function hiddenSet() {
      var n = Math.round(p.toks.length * p.round / p.rounds);
      var set = {};
      p.order.slice(0, n).forEach(function (i) { set[i] = true; });
      return set;
    }
    function draw() {
      var hid = hiddenSet();
      var k = 0;
      var inner = p.toks.map(function (t) {
        if (!hid[t.i]) return esc(t.raw);
        k++;
        var m = /^(.*?)([,;:.?!]*)$/.exec(t.raw);
        var w = m[1], punct = m[2];
        if (p.peeking[t.i]) return '<button type="button" class="blank peek" data-i="' + t.i + '" aria-label="' + esc(ui.a11y.blank(k)) + ': ' + esc(w) + '">' + esc(w) + '</button>' + esc(punct);
        var width = (0.42 * Math.max(2, w.length) + 0.2).toFixed(2);
        return '<button type="button" class="blank" data-i="' + t.i + '" style="width:' + width + 'em" aria-label="' + esc(ui.a11y.blank(k)) + ', ' + esc(ui.practice.peek) + '"></button>' + esc(punct);
      }).join(' ');
      var last = p.round >= p.rounds;
      var h = sayingHTML(s, inner) + cite(s) + '<div class="controls">';
      if (!p.completed) h += '<button class="btn primary" type="button" data-act="next" data-test="fade-next">' + esc(last ? ui.practice.finish : MODES[1].action) + '</button>';
      h += '<span class="counter" data-test="round">' + esc(ui.practice.progress(p.round, p.rounds)) + (p.peeks ? ' · ' + esc(ui.practice.peeks(p.peeks)) : '') + '</span></div>';
      stage.innerHTML = h;
      stage.querySelectorAll('.blank').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i');
          if (!p.peeking[i]) p.peeks++;
          p.peeking[i] = !p.peeking[i];
          draw();
          var nb = stage.querySelector('.blank[data-i="' + i + '"]');
          if (nb) nb.focus();
          if (p.peeking[i]) setTimeout(function () { if (p.peeking[i] && session === p) { p.peeking[i] = false; var had = document.activeElement && document.activeElement.getAttribute('data-i') == i; draw(); if (had) { var x = stage.querySelector('.blank[data-i="' + i + '"]'); if (x) x.focus(); } } }, 1800);
        });
      });
      var nx = stage.querySelector('[data-act="next"]');
      if (nx) nx.addEventListener('click', function () {
        if (p.round >= p.rounds) {
          p.completed = true;
          draw();
          completeMode(s, 'fade', MODES[1].done + '.' + (p.peeks ? ' ' + ui.practice.peeks(p.peeks) + '.' : ''));
          var nm = $main.querySelector('[data-test="next-mode"]'); if (nm) nm.focus();
          return;
        }
        p.round++;
        p.peeking = {};
        draw();
        say(document.getElementById('fb'), ui.practice.progress(p.round, p.rounds));
        var b2 = stage.querySelector('[data-act="next"]'); if (b2) b2.focus();
      });
    }
    draw();
  };

  function lettersInner(toks) {
    return toks.map(function (t) {
      var m = /^([^A-Za-z]*)([A-Za-z])([A-Za-z']*)([^A-Za-z']*)$/.exec(t.raw);
      if (!m) return esc(t.raw);
      var rest = m[3].replace(/'/g, '').length;
      return '<span class="fl">' + esc(m[1] + m[2]) + (rest ? '<span class="rest" style="width:' + (0.34 * rest).toFixed(2) + 'em"></span>' : '') + esc(m[4]) + '</span>';
    }).join(' ');
  }
  function resultHTML(res) {
    var cls = res.verdict === 'perfect' ? ' perfect' : '';
    var verdict = res.verdict === 'perfect' ? ui.feedback.perfect : res.verdict === 'close' ? ui.feedback.close(res.missed) : ui.feedback.keepGoing;
    var h = '<div class="result' + cls + '" data-test="result" data-missed="' + res.missed + '" data-verdict="' + res.verdict + '"><p class="verdict">' + esc(verdict) + '</p>';
    h += '<p class="score">' + esc(ui.practice.score(res.got, res.total)) + '</p>';
    if (res.missed || res.near) {
      if (res.missed) h += '<p class="small muted" style="margin-top:8px">' + esc(ui.feedback.missedHeading) + '</p>';
      else h += '<p class="small muted" style="margin-top:8px">' + esc(ui.practice.nearHeading) + '</p>';
      h += '<p class="diff">' + res.tokens.map(function (t, i) {
        var k = res.marks[i];
        return k === 'ok' ? esc(t.raw) : '<span class="w-' + k + '">' + esc(t.raw) + '</span>';
      }).join(' ') + '</p>';
    }
    if (res.extra.length) h += '<p class="extra">' + esc(ui.feedback.extraHeading) + ': ' + res.extra.map(function (w) { return '<s>' + esc(w) + '</s>'; }).join(', ') + '</p>';
    return h + '</div>';
  }
  function typeBox(id) {
    return '<label class="field-label" for="' + id + '">' + esc(ui.practice.typeLabel) + '</label>' +
      '<textarea class="type-area" id="' + id + '" rows="3" placeholder="' + esc(ui.practice.typePlaceholder) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done"></textarea>';
  }
  function bindEnter(ta, fn) {
    var fit = function () { ta.style.height = 'auto'; ta.style.height = Math.max(96, ta.scrollHeight + 2) + 'px'; };
    ta.addEventListener('input', fit);
    fit();
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); fn(); } });
  }

  STAGES.letters = function (s) {
    var p = session;
    var stage = document.getElementById('stage');
    var h = sayingHTML(s, '<span aria-hidden="true">' + lettersInner(p.toks) + '</span><span class="sr-only">' + esc(p.toks.map(function (t) { return t.raw.charAt(0); }).join(' ')) + '</span>') + cite(s);
    h += typeBox('typed');
    h += '<div class="controls"><button class="btn primary" type="button" data-act="check" data-test="check">' + esc(MODES[2].action) + '</button><span class="kbd-hint">Enter</span></div><div id="res"></div>';
    stage.innerHTML = h;
    var ta = stage.querySelector('textarea');
    if (p.typed) ta.value = p.typed;
    function check() {
      p.typed = ta.value;
      if (!ta.value.trim()) { ta.focus(); return; }
      var res = checkTyped(s.text, ta.value);
      p.lastResult = res;
      document.getElementById('res').innerHTML = resultHTML(res);
      var verdict = res.verdict === 'perfect' ? ui.feedback.perfect : res.verdict === 'close' ? ui.feedback.close(res.missed) : ui.feedback.keepGoing;
      say(document.getElementById('fb'), verdict, res.verdict === 'perfect');
      if (res.verdict === 'perfect' && !p.completed) {
        completeMode(s, 'letters', MODES[2].done + '.');
        var nm = $main.querySelector('[data-test="next-mode"]'); if (nm) nm.focus();
      }
    }
    stage.querySelector('[data-act="check"]').addEventListener('click', check);
    bindEnter(ta, check);
    if (p.lastResult) document.getElementById('res').innerHTML = resultHTML(p.lastResult);
  };

  STAGES.build = function (s) {
    var p = session;
    var stage = document.getElementById('stage');
    function draw(focusIdx) {
      var placed = p.placed.map(function (i) { return esc(p.toks[i].raw); }).join(' ');
      var done = p.placed.length === p.toks.length;
      var h = '<p class="sr-only" id="built-l">' + esc(ui.practice.builtLabel) + '</p>';
      h += '<div class="built' + (done ? ' done' : '') + '" aria-labelledby="built-l" data-empty="' + esc(MODES[3].action) + '" data-test="built">' + placed + (done && runsOn(s.text) ? '<span class="trail" aria-hidden="true" style="color:var(--muted)"> …</span>' : '') + '</div>';
      if (done) h += cite(s);
      h += done ? '<div>' : '<div class="chips" role="group" aria-label="' + esc(ui.practice.chipsLabel) + '">';
      p.pool.forEach(function (i, k) {
        if (p.placed.indexOf(i) >= 0) return;
        h += '<button type="button" class="chip" data-i="' + i + '" data-k="' + k + '" aria-label="' + esc(ui.a11y.chip(p.toks[i].raw)) + '">' + esc(p.toks[i].raw) + '</button>';
      });
      h += '</div><div class="controls">';
      if (!done) {
        h += '<button class="btn quiet" type="button" data-act="undo"' + (p.placed.length ? '' : ' disabled') + '>' + esc(ui.practice.undo) + '</button>';
        h += '<span class="counter grow" data-test="mistakes">' + esc(ui.practice.mistakes(p.mistakes)) + '</span>';
      } else h += '<span class="counter" data-test="mistakes">' + esc(ui.practice.mistakes(p.mistakes)) + '</span>';
      stage.innerHTML = h + '</div>';
      stage.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { tap(+b.getAttribute('data-i'), b); }); });
      var u = stage.querySelector('[data-act="undo"]');
      if (u) u.addEventListener('click', function () { p.placed.pop(); draw(); var f = stage.querySelector('.chip'); if (f) f.focus(); });
      if (typeof focusIdx === 'number') {
        var chips = stage.querySelectorAll('.chip');
        if (chips.length) chips[Math.min(focusIdx, chips.length - 1)].focus();
      }
    }
    function tap(i, btn) {
      var want = p.toks[p.placed.length];
      if (p.toks[i].norm === want.norm) {
        // Equal words (two "the"s) are interchangeable; place in text order.
        var k = Array.prototype.indexOf.call(stage.querySelectorAll('.chip'), btn);
        p.placed.push(want.i === i ? i : swapEqual(i, want.i));
        draw(k);
        if (p.placed.length === p.toks.length) {
          say(document.getElementById('fb'), ui.feedback.builtCorrect, true);
          completeMode(s, 'build', MODES[3].done + '. ' + ui.practice.mistakes(p.mistakes) + '.');
          var f = $main.querySelector('[data-test="finish"]'); if (f) f.focus();
        }
      } else {
        p.mistakes++;
        btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong');
        var c = stage.querySelector('[data-test="mistakes"]'); if (c) c.textContent = ui.practice.mistakes(p.mistakes);
        say(document.getElementById('fb'), ui.feedback.wrongChip, false, true);
      }
    }
    function swapEqual(tapped, wanted) {
      var a = p.pool.indexOf(tapped), b = p.pool.indexOf(wanted);
      p.pool[a] = wanted; p.pool[b] = tapped;
      return wanted;
    }
    draw();
  };

  // ---------- Review ----------
  VIEWS.review = function () {
    if (!session || session.kind !== 'review') {
      var q = dueList().map(function (s) { return s.id; });
      session = { kind: 'review', queue: q, i: 0, revealed: false, typing: false, result: null, done: 0 };
    }
    var p = session;
    var h = '<a class="back" href="#/today"><span aria-hidden="true">←</span> ' + esc(ui.practice.toToday) + '</a>';
    if (p.i >= p.queue.length) {
      h += '<div class="card" style="margin-top:14px" data-test="review-done"><h1 class="view-title">' + esc(ui.today.sessionDone) + '</h1><p class="muted">' + esc(ui.today.sessionDoneNote) + '</p>';
      h += '<div class="row-gap" style="margin-top:6px"><a class="btn primary" href="#/today">' + esc(ui.practice.toToday) + '</a><a class="btn" href="#/sayings">' + esc(ui.nav.collections) + '</a></div></div>';
      $main.innerHTML = h;
      return;
    }
    var s = BY_ID[p.queue[p.i]];
    var r = rec(s.id);
    h += '<div class="progress-line" aria-hidden="true"><i style="width:' + (100 * p.i / p.queue.length).toFixed(1) + '%"></i></div>';
    h += '<section class="card stage" aria-labelledby="rv-h"><div class="row-gap" style="justify-content:space-between"><p class="eyebrow" style="margin:0" data-test="review-counter">' + esc(ui.review.counter(p.i + 1, p.queue.length)) + '</p><span class="badge">' + pips(r.box) + ' ' + esc(MASTERY[r.box].name) + '</span></div>';
    h += '<h1 class="review-cue" id="rv-h">' + esc(s.cue) + '</h1><p class="ref">' + esc(s.ref) + ' · ' + esc(s.collectionName) + '</p>';
    if (!p.revealed) {
      h += '<p class="review-prompt" style="margin-top:18px">' + esc(ui.review.showCue) + '</p>';
      if (p.typing) {
        h += typeBox('rv-typed') + '<div class="controls"><button class="btn primary" type="button" data-act="check" data-test="rv-check">' + esc(ui.review.check) + '</button><button class="btn quiet" type="button" data-act="show">' + esc(ui.review.reveal) + '</button></div>';
      } else {
        h += '<div class="controls"><button class="btn primary" type="button" data-act="show" data-test="rv-show">' + esc(ui.review.reveal) + '</button><button class="btn" type="button" data-act="type" data-test="rv-type">' + esc(ui.review.typeInstead) + '</button></div>';
      }
    } else {
      h += '<div style="margin-top:20px">' + sayingHTML(s, esc(shown(s.text))) + (p.result ? resultHTML(p.result) : '') + '</div>';
      h += '<p class="eyebrow" style="margin-top:22px" id="rate-h">' + esc(ui.review.rateHeading) + '</p><div class="rate" role="group" aria-labelledby="rate-h">';
      [['again', ui.review.rateAgain, ui.review.rateAgainNote], ['hard', ui.review.rateHard, ui.review.rateHardNote], ['good', ui.review.rateGood, ui.review.rateGoodNote]].forEach(function (b) {
        var suggest = p.result && ((p.result.verdict === 'perfect' && b[0] === 'good') || (p.result.verdict === 'close' && b[0] === 'hard') || (p.result.verdict === 'keepGoing' && b[0] === 'again'));
        h += '<button class="btn' + (suggest || (!p.result && b[0] === 'good') ? ' primary' : '') + '" type="button" data-rate="' + b[0] + '" data-test="rate-' + b[0] + '">' + esc(b[1]) + '<span>' + esc(b[2]) + '</span></button>';
      });
      h += '</div>';
    }
    h += '<p class="feedback sr-only" id="fb" role="status" aria-live="polite"></p></section>';
    $main.innerHTML = h;
    var showB = $main.querySelector('[data-act="show"]');
    if (showB) showB.addEventListener('click', function () { p.revealed = true; VIEWS.review(); focusFirst('[data-rate="good"]'); });
    var typeB = $main.querySelector('[data-act="type"]');
    if (typeB) typeB.addEventListener('click', function () { p.typing = true; VIEWS.review(); focusFirst('textarea'); });
    var ta = $main.querySelector('textarea');
    if (ta) {
      var check = function () {
        if (!ta.value.trim()) return ta.focus();
        p.result = checkTyped(s.text, ta.value);
        p.revealed = true;
        VIEWS.review();
        var v = p.result.verdict === 'perfect' ? ui.feedback.perfect : p.result.verdict === 'close' ? ui.feedback.close(p.result.missed) : ui.feedback.keepGoing;
        say(document.getElementById('fb'), v, p.result.verdict === 'perfect');
        focusFirst('.rate .btn.primary');
      };
      $main.querySelector('[data-act="check"]').addEventListener('click', check);
      bindEnter(ta, check);
    }
    $main.querySelectorAll('[data-rate]').forEach(function (b) {
      b.addEventListener('click', function () {
        var how = b.getAttribute('data-rate');
        var rr = rate(s.id, how);
        var streakMsg = markActivity();
        save();
        var msg = how === 'good' ? ui.feedback.levelUp(MASTERY[rr.box].name) : how === 'hard' ? ui.feedback.stayed : ui.feedback.again;
        toast(streakMsg ? streakMsg + ' ' + msg : msg);
        p.i++; p.revealed = false; p.typing = false; p.result = null; p.done++;
        VIEWS.review();
        renderStreakPill();
        focusFirst('[data-act="show"], [data-test="review-done"] a');
      });
    });
  };
  function focusFirst(sel) { var el = $main.querySelector(sel); if (el) el.focus(); }

  // ---------- Progress ----------
  VIEWS.progress = function () {
    session = null;
    var startedN = ALL.filter(function (s) { return started(s.id); }).length;
    var mastered = ALL.filter(function (s) { return boxOf(s.id) === 5; }).length;
    var due = dueList().length;
    var h = '<h1 class="view-title">' + esc(ui.progress.title) + '</h1>';
    if (!storageOK) h += '<p class="confirm small" data-test="storage-off" style="margin:10px 0 0">' + esc(ui.progress.storageOff) + '</p>';
    h += '<div class="stats">';
    h += '<div class="stat"><div class="num" data-test="started">' + startedN + '</div><div class="lbl">' + esc(ui.progress.learned(startedN, ALL.length)) + '</div></div>';
    h += '<div class="stat"><div class="num">' + mastered + '</div><div class="lbl">' + esc(ui.progress.mastered(mastered)) + '</div></div>';
    h += '<div class="stat"><div class="num">' + streakNow() + '</div><div class="lbl">' + esc(ui.streak.label) + '</div></div>';
    h += '</div>';
    // By collection
    h += '<section class="card" aria-labelledby="bc-h" style="margin-top:16px"><h2 id="bc-h">' + esc(ui.progress.byCollection) + '</h2><ul class="bars">';
    C.collections.forEach(function (c) {
      var n = c.sayings.length;
      var segs = '';
      for (var b = 5; b >= 1; b--) {
        var k = c.sayings.filter(function (s) { return boxOf(s.id) === b; }).length;
        if (k) segs += '<i style="width:' + (100 * k / n).toFixed(2) + '%;opacity:' + (0.25 + 0.15 * b).toFixed(2) + '" title="' + esc(MASTERY[b].name) + ': ' + k + '"></i>';
      }
      var inReview = c.sayings.filter(function (s) { return boxOf(s.id) > 0; }).length;
      h += '<li><span>' + esc(c.name) + '</span><span class="bar" role="img" aria-label="' + esc(c.name + ': ' + ui.progress.learned(inReview, n)) + '">' + segs + '</span><span class="n">' + inReview + '/' + n + '</span></li>';
    });
    h += '</ul><div class="legend" aria-hidden="true">';
    for (var b = 1; b <= 5; b++) h += '<span><i style="opacity:' + (0.25 + 0.15 * b).toFixed(2) + '"></i>' + esc(MASTERY[b].name) + '</span>';
    h += '</div></section>';
    // Upcoming
    var up = ALL.filter(function (s) { return boxOf(s.id) > 0; }).sort(function (a, b) { var x = state.sayings[a.id].due, y = state.sayings[b.id].due; return x < y ? -1 : x > y ? 1 : a.index - b.index; }).slice(0, 8);
    if (up.length) {
      h += '<section class="card" aria-labelledby="up-h"><h2 id="up-h">' + esc(ui.progress.nextReview) + '</h2><ul class="upcoming">';
      up.forEach(function (s) {
        var d = diffDays(today(), state.sayings[s.id].due);
        h += '<li><span><span class="ref">' + esc(s.ref) + '</span><br><span class="small">' + esc(s.cue) + '</span></span><span class="when">' + esc(d <= 0 ? ui.progress.dueNow : ui.progress.dueIn(d)) + '</span></li>';
      });
      h += '</ul>' + (due ? '<a class="btn primary" href="#/review">' + esc(ui.today.startReview) + '</a>' : '') + '</section>';
    }
    // Settings
    var st = state.settings;
    h += '<section class="card" aria-labelledby="set-h"><h2 id="set-h">' + esc(ui.settings.title) + '</h2>';
    h += '<div class="setting"><span id="theme-l">' + esc(ui.settings.theme) + '</span><div class="seg" role="group" aria-labelledby="theme-l">';
    [['auto', ui.settings.themeAuto], ['light', ui.settings.themeLight], ['dark', ui.settings.themeDark]].forEach(function (o) {
      h += '<button type="button" data-theme-set="' + o[0] + '" aria-pressed="' + (st.theme === o[0]) + '">' + esc(o[1]) + '</button>';
    });
    h += '</div></div>';
    h += '<div class="setting"><span id="motion-l">' + esc(ui.settings.motion) + '</span><button type="button" class="switch" role="switch" aria-checked="' + !!st.motion + '" aria-labelledby="motion-l" data-act="motion"></button></div>';
    h += '<div class="setting"><span id="npd-l">' + esc(ui.settings.newPerDay) + '</span><div class="stepper" role="group" aria-labelledby="npd-l"><button type="button" data-npd="-1" aria-label="−">−</button><output aria-live="polite">' + st.newPerDay + '</output><button type="button" data-npd="1" aria-label="+">+</button></div></div>';
    h += '<div class="setting"><span></span><button type="button" class="btn quiet danger" data-act="reset" data-test="reset">' + esc(ui.progress.reset) + '</button></div>';
    h += '<div id="confirm"></div></section>';
    $main.innerHTML = h;

    $main.querySelectorAll('[data-theme-set]').forEach(function (b) {
      b.addEventListener('click', function () { st.theme = b.getAttribute('data-theme-set'); save(); applySettings(); VIEWS.progress(); focusFirst('[data-theme-set="' + st.theme + '"]'); });
    });
    $main.querySelector('[data-act="motion"]').addEventListener('click', function () { st.motion = !st.motion; save(); applySettings(); VIEWS.progress(); focusFirst('[data-act="motion"]'); });
    $main.querySelectorAll('[data-npd]').forEach(function (b) {
      b.addEventListener('click', function () { st.newPerDay = Math.min(10, Math.max(1, st.newPerDay + +b.getAttribute('data-npd'))); save(); $main.querySelector('.stepper output').textContent = st.newPerDay; });
    });
    $main.querySelector('[data-act="reset"]').addEventListener('click', function () {
      var c = document.getElementById('confirm');
      c.innerHTML = '<div class="confirm" role="alertdialog" aria-labelledby="cf-t"><p id="cf-t">' + esc(ui.progress.resetConfirm) + '</p><div class="row-gap" style="margin-top:10px"><button type="button" class="btn primary" data-act="yes" data-test="reset-yes">' + esc(ui.progress.reset) + '</button><button type="button" class="btn" data-act="no">' + esc(ui.a11y.closeDialog) + '</button></div></div>';
      c.querySelector('[data-act="no"]').addEventListener('click', function () { c.innerHTML = ''; focusFirst('[data-act="reset"]'); });
      c.querySelector('[data-act="yes"]').addEventListener('click', function () {
        var keep = state.settings;
        state = fresh(); state.settings = keep; save();
        VIEWS.progress(); renderStreakPill(); toast(ui.progress.resetDone);
      });
      c.querySelector('[data-act="no"]').focus();
    });
  };

  // ---------- About ----------
  VIEWS.about = function () {
    session = null;
    var h = '<h1 class="view-title">' + esc(ui.about.title) + '</h1><p class="epigraph" style="margin:8px 0 22px">' + esc(ui.tagline) + '</p><div class="prose">';
    ui.about.body.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
    h += '</div><div class="colophon"><p>' + esc(ui.about.kjvNote) + '</p><p>' + esc(ui.about.fonts) + '</p><p>' + esc(ui.about.credit) + '</p></div>';
    $main.innerHTML = h;
  };

  // ---------- Start ----------
  applySettings();
  window.addEventListener('hashchange', route);
  if (!location.hash) history.replaceState(null, '', '#/today');
  route();

  // A small hook for the automated test and for curious players.
  window.HideIt = {
    state: function () { return JSON.parse(JSON.stringify(state)); },
    storageOK: function () { return storageOK; },
    rerender: route,
    checkTyped: checkTyped,
    toast: toast,
    today: today,
    count: ALL.length
  };
})();
