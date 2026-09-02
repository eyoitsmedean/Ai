/* Quiet Chapel craft — grace streaks, listen, week ribbon, reminders, emotion routing */
(function (global) {
  'use strict';

  function id(name) { return document.getElementById(name); }
  function ls(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function lsSet(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  function parseJSON(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }
  function todayStr(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }
  function shiftDay(dateStr, delta) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    return todayStr(d);
  }
  function weekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun
    const diff = (day + 6) % 7; // Monday-start week
    d.setDate(d.getDate() - diff);
    return todayStr(d);
  }

  function practicedOn(dateStr) {
    const raw = parseJSON(ls(`rla-practice-${dateStr}`), {});
    return Boolean(raw.aff && raw.word && raw.reflect);
  }

  function getStreakState() {
    return parseJSON(ls('rla-streak-v2'), {
      count: 0,
      lastPractice: '',
      graceWeek: '',
      graceUsed: false,
      longest: 0,
    });
  }

  function setStreakState(state) {
    lsSet('rla-streak-v2', JSON.stringify(state));
  }

  /** Compassionate streak: one grace day per week. Practice completion earns the day. */
  function recordPracticeDay() {
    const today = todayStr();
    if (!practicedOn(today)) return getStreakState();

    const state = getStreakState();
    if (state.lastPractice === today) {
      renderWeekRibbon();
      renderStreakUI(state);
      return state;
    }

    const yesterday = shiftDay(today, -1);
    const twoAgo = shiftDay(today, -2);
    const week = weekStart();
    if (state.graceWeek !== week) {
      state.graceWeek = week;
      state.graceUsed = false;
    }

    if (!state.lastPractice) {
      state.count = 1;
    } else if (state.lastPractice === yesterday) {
      state.count = (Number(state.count) || 0) + 1;
    } else if (state.lastPractice === twoAgo && !state.graceUsed) {
      // One missed day — grace, not guilt
      state.count = (Number(state.count) || 0) + 1;
      state.graceUsed = true;
      if (typeof global.showToast === 'function') {
        global.showToast('Grace held your practice — welcome back');
      }
    } else if (state.lastPractice === today) {
      // no-op
    } else {
      state.count = 1;
    }

    state.lastPractice = today;
    state.longest = Math.max(Number(state.longest) || 0, state.count);
    setStreakState(state);
    renderStreakUI(state);
    renderWeekRibbon();
    return state;
  }

  function renderStreakUI(state = getStreakState()) {
    const count = Math.max(0, Number(state.count) || 0);
    const countEl = id('streak-num');
    if (countEl) countEl.textContent = String(count || 1);
    const label = id('today-streak-label');
    if (label) {
      if (count <= 1) label.textContent = '✦ Day 1';
      else if (state.graceUsed && state.graceWeek === weekStart()) {
        label.textContent = `✦ ${count}-day practice · grace this week`;
      } else {
        label.textContent = `✦ ${count}-day practice`;
      }
    }
  }

  function renderWeekRibbon() {
    const host = id('week-ribbon');
    if (!host) return;
    host.innerHTML = '';
    const today = todayStr();
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    // Build Mon→Sun of current week
    const start = weekStart();
    for (let i = 0; i < 7; i += 1) {
      const date = shiftDay(start, i);
      const cell = document.createElement('div');
      cell.className = 'week-cell';
      if (practicedOn(date)) cell.classList.add('done');
      if (date === today) cell.classList.add('today');
      if (date > today) cell.classList.add('future');
      cell.innerHTML = `<span class="week-dot" aria-hidden="true"></span><span class="week-lab">${labels[i]}</span>`;
      cell.title = date;
      host.appendChild(cell);
    }
  }

  const EMOTIONS = [
    { label: 'Anxious', theme: 'Anxiety & Worry' },
    { label: 'Grieving', theme: 'Grief & Loss' },
    { label: 'Afraid', theme: 'Fear' },
    { label: 'Lonely', theme: 'Loneliness' },
    { label: 'Ashamed', theme: 'Shame & Guilt' },
    { label: 'Weary', theme: 'Suffering & Pain' },
    { label: 'Seeking peace', theme: 'Peace' },
    { label: 'Needing hope', theme: 'Hope' },
  ];

  function renderEmotionStrip() {
    const host = id('emotion-strip');
    if (!host) return;
    host.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'emotion-label';
    title.textContent = 'How are you feeling?';
    host.appendChild(title);
    const row = document.createElement('div');
    row.className = 'emotion-row';
    EMOTIONS.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emotion-chip';
      btn.textContent = item.label;
      btn.addEventListener('click', () => {
        if (typeof global.loadEnc === 'function') global.loadEnc(item.theme);
      });
      row.appendChild(btn);
    });
    host.appendChild(row);
  }

  let speaking = false;
  let utterance = null;

  function stopListening() {
    if (global.speechSynthesis) global.speechSynthesis.cancel();
    speaking = false;
    const btn = id('lectio-listen');
    if (btn) {
      btn.textContent = 'Listen';
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  function toggleListen() {
    if (!global.speechSynthesis) {
      if (typeof global.showToast === 'function') global.showToast('Listening isn’t available on this device');
      return;
    }
    if (speaking) {
      stopListening();
      return;
    }
    const quote = (id('lectio-quote') && id('lectio-quote').textContent) || '';
    const cite = (id('lectio-cite') && id('lectio-cite').textContent) || '';
    const text = `${quote.replace(/[“”]/g, '')}. ${cite.replace(/^—\s*/, '')}`;
    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1;
    const voices = global.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en(-|_)US/i.test(v.lang) && /natural|premium|enhanced|samantha|google/i.test(v.name))
      || voices.find((v) => /^en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => stopListening();
    utterance.onerror = () => stopListening();
    speaking = true;
    const btn = id('lectio-listen');
    if (btn) {
      btn.textContent = 'Pause';
      btn.setAttribute('aria-pressed', 'true');
    }
    global.speechSynthesis.speak(utterance);
  }

  function openShareSheet(type) {
    const sheet = id('share-sheet');
    const overlay = id('overlay');
    if (!sheet) {
      if (typeof global.shareItem === 'function') global.shareItem(type);
      return;
    }
    sheet.dataset.shareType = type || 'aff';
    sheet.classList.add('on');
    sheet.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('on');
  }

  function closeShareSheet() {
    const sheet = id('share-sheet');
    if (sheet) {
      sheet.classList.remove('on');
      sheet.setAttribute('aria-hidden', 'true');
    }
    const settings = id('settings-sheet');
    const plus = id('plus-sheet');
    const blessing = id('blessing-sheet');
    const overlay = id('overlay');
    if (
      overlay &&
      (!settings || !settings.classList.contains('on')) &&
      (!plus || !plus.classList.contains('on')) &&
      (!blessing || !blessing.classList.contains('on'))
    ) {
      overlay.classList.remove('on');
    }
  }

  async function shareWithTheme(style) {
    const type = (id('share-sheet') && id('share-sheet').dataset.shareType) || 'aff';
    closeShareSheet();
    const payload = buildSharePayload(type);
    if (!payload) return;
    payload.style = style || 'void';
    if (global.RedLetterShare && typeof global.RedLetterShare.shareCard === 'function') {
      try {
        const result = await global.RedLetterShare.shareCard(payload);
        if (typeof global.showToast === 'function') {
          global.showToast(result === 'downloaded' ? 'Share card saved' : 'Shared');
        }
      } catch (_) {
        if (typeof global.showToast === 'function') global.showToast('Unable to share right now');
      }
    }
  }

  function buildSharePayload(type) {
    const daily = global.dailyData || null;
    // dailyData is module-private; read from DOM / journal helpers via exposed getters if needed
    if (type === 'aff') {
      const quote = id('aff-quote') && id('aff-quote').textContent;
      const verse = id('aff-verse') && id('aff-verse').textContent;
      if (!quote) return null;
      return {
        quote: quote.replace(/[“”]/g, ''),
        verse: (verse || '').replace(/^—\s*/, ''),
        theme: 'Daily Affirmation',
      };
    }
    if (type === 'word') {
      const quote = id('word-passage') && id('word-passage').textContent;
      const verse = id('word-verse') && id('word-verse').textContent;
      const theme = id('word-theme') && id('word-theme').textContent;
      if (!quote) return null;
      return {
        quote: quote.replace(/[“”]/g, ''),
        verse: verse || '',
        theme: theme || 'Word of the Day',
      };
    }
    if (type === 'enc') {
      const first = id('enc-passages') && id('enc-passages').querySelector('.passage-quote');
      const verse = id('enc-passages') && id('enc-passages').querySelector('.passage-verse-tag');
      if (!first) return null;
      return {
        quote: first.textContent.replace(/[“”]/g, ''),
        verse: verse ? verse.textContent : '',
        theme: 'Encouragement',
      };
    }
    if (type === 'lectio') {
      const quote = id('lectio-quote') && id('lectio-quote').textContent;
      const verse = id('lectio-cite') && id('lectio-cite').textContent;
      if (!quote) return null;
      return {
        quote: quote.replace(/[“”]/g, ''),
        verse: (verse || '').replace(/^—\s*/, ''),
        theme: 'Lectio',
      };
    }
    if (type === 'blessing' && global.__blessingPayload) {
      return global.__blessingPayload;
    }
    return null;
  }

  function setupReminderToggle() {
    const toggle = id('reminder-toggle');
    if (!toggle) return;
    toggle.checked = ls('rla-reminder') === '1';
    toggle.addEventListener('change', async () => {
      if (toggle.checked) {
        if (!('Notification' in global)) {
          toggle.checked = false;
          if (typeof global.showToast === 'function') global.showToast('Notifications aren’t available here');
          return;
        }
        let permission = Notification.permission;
        if (permission === 'default') permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toggle.checked = false;
          lsSet('rla-reminder', '0');
          if (typeof global.showToast === 'function') global.showToast('Reminder permission was declined');
          return;
        }
        lsSet('rla-reminder', '1');
        if (typeof global.showToast === 'function') global.showToast('Morning nudge on · while app is open');
      } else {
        lsSet('rla-reminder', '0');
      }
    });
  }

  function checkMorningReminder() {
    if (ls('rla-reminder') !== '1') return;
    if (!('Notification' in global) || Notification.permission !== 'granted') return;
    const now = new Date();
    if (now.getHours() < 8 || now.getHours() > 10) return;
    const key = `rla-reminded-${todayStr()}`;
    if (ls(key) === '1') return;
    if (practicedOn(todayStr())) return;
    try {
      new Notification('Red Letter', {
        body: 'A quiet word is waiting for you today.',
        icon: '/icon-192.png',
        tag: 'rla-morning',
      });
      lsSet(key, '1');
    } catch (_) { /* ignore */ }
  }

  function patchShareButtons() {
    // Prefer share sheet themes when craft is present
    global.shareItemThemed = function (type) {
      openShareSheet(type);
    };
  }

  function onPracticeCompleteHook() {
    const complete = id('practice-complete');
    if (!complete || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      if (!complete.hidden && complete.classList.contains('on')) {
        recordPracticeDay();
      }
    });
    observer.observe(complete, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }

  function bootCraft() {
    renderWeekRibbon();
    renderStreakUI();
    renderEmotionStrip();
    setupReminderToggle();
    onPracticeCompleteHook();
    patchShareButtons();
    checkMorningReminder();
    setInterval(checkMorningReminder, 5 * 60 * 1000);

    // Re-render week ribbon when practice steps change
    ['ps-aff', 'ps-word', 'ps-reflect'].forEach((stepId) => {
      const el = id(stepId);
      if (!el || typeof MutationObserver === 'undefined') return;
      new MutationObserver(() => {
        renderWeekRibbon();
        if (practicedOn(todayStr())) recordPracticeDay();
      }).observe(el, { attributes: true, attributeFilter: ['class'] });
    });

    if (global.speechSynthesis) {
      global.speechSynthesis.getVoices();
      global.speechSynthesis.onvoiceschanged = () => global.speechSynthesis.getVoices();
    }
  }

  Object.assign(global, {
    recordPracticeDay,
    renderWeekRibbon,
    renderEmotionStrip,
    renderStreakUI,
    toggleListen,
    stopListening,
    openShareSheet,
    closeShareSheet,
    shareWithTheme,
    practicedOn,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCraft, { once: true });
  } else {
    bootCraft();
  }
})(window);
