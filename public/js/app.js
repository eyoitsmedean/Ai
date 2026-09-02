(function (global) {
  'use strict';

  const TABS = ['today', 'seek', 'advisor', 'journal'];
  const NAV_X = {
    today: '0%',
    seek: '25%',
    advisor: '50%',
    journal: '75%',
  };
  const TAB_SUBTITLES = {
    today: 'Daily Words of Life',
    seek: 'Encouragement by Theme',
    advisor: 'Guided by the Gospels',
    journal: 'Your Saved Passages',
  };
  const THEMES = [
    ['Anxiety & Worry', ''],
    ['Grief & Loss', ''],
    ['Forgiveness', ''],
    ['Loneliness', ''],
    ['Conflict & Relationships', ''],
    ['Fear', ''],
    ['Purpose & Direction', ''],
    ['Faith & Doubt', ''],
    ['Suffering & Pain', ''],
    ['Shame & Guilt', ''],
    ['Peace', ''],
    ['Hope', ''],
  ];
  const CHAT_DAILY_LIMIT = 5;
  const MAX_STORED_MESSAGES = 60;

  let corpusPromise = null;
  let dailyData = null;
  let currentEncData = null;
  let currentEncTheme = null;
  let chatHistory = [];
  let isChatBusy = false;
  let started = false;
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let wordObserver = null;
  let encouragementRequest = 0;
  let libraryItems = [];
  const encouragementCache = Object.create(null);

  function id(name) {
    return document.getElementById(name);
  }

  function ls(key) {
    try {
      return global.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function lsSet(key, value) {
    try {
      global.localStorage.setItem(key, String(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function parseJSON(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function todayStr(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function previousDayStr(date = new Date()) {
    return todayStr(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
  }

  function dayOfYear(date = new Date()) {
    const start = Date.UTC(date.getFullYear(), 0, 0);
    const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((current - start) / 86400000);
  }

  function showToast(message) {
    const toast = id('toast');
    if (!toast) return;
    toast.textContent = String(message || '');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = global.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function loadCorpus() {
    if (!corpusPromise) {
      corpusPromise = fetch('/data/corpus.json', { cache: 'force-cache' }).then(async (response) => {
        if (!response.ok) throw new Error(`Corpus request failed (${response.status})`);
        const data = await response.json();
        if (!data || !Array.isArray(data.daily) || !data.encouragement || !Array.isArray(data.library)) {
          throw new Error('Corpus is malformed');
        }
        return data;
      });
    }
    return corpusPromise;
  }

  async function getOfflineDaily() {
    const corpus = await loadCorpus();
    if (!corpus.daily.length) throw new Error('No offline daily readings are available');
    return corpus.daily[dayOfYear() % corpus.daily.length];
  }

  async function fetchJSON(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      let detail = '';
      try {
        const errorBody = await response.json();
        detail = errorBody && errorBody.error ? `: ${errorBody.error}` : '';
      } catch (_) {
        detail = '';
      }
      throw new Error(`Request failed (${response.status})${detail}`);
    }
    const data = await response.json();
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  function validDaily(data) {
    return Boolean(
      data &&
      data.affirmation &&
      typeof data.affirmation.text === 'string' &&
      typeof data.affirmation.quote === 'string' &&
      typeof data.affirmation.verse === 'string' &&
      data.word &&
      typeof data.word.title === 'string' &&
      typeof data.word.passage === 'string' &&
      typeof data.word.verse === 'string'
    );
  }

  function showOnboarding() {
    const onboarding = id('onboarding');
    if (onboarding) onboarding.classList.remove('hidden');
    const app = id('app');
    if (app) {
      app.hidden = true;
      app.classList.remove('is-live');
      app.setAttribute('aria-hidden', 'true');
    }

    const steps = onboarding ? Array.from(onboarding.querySelectorAll('.ob-step')) : [];
    if (steps.length && !steps.some((step) => step.classList.contains('active'))) {
      steps[0].classList.add('active');
    }
  }

  function completeOnboarding(tab = 'today') {
    const destination = TABS.includes(tab) ? tab : 'today';
    lsSet('rla-onboarded', '1');
    const onboarding = id('onboarding');
    if (onboarding) onboarding.classList.add('hidden');
    const app = id('app');
    if (app) { app.hidden = false; app.classList.add('is-live'); app.removeAttribute('aria-hidden'); }
    startApp();
    switchTab(destination);
  }

  function selectIntent(intent) {
    completeOnboarding(TABS.includes(intent) ? intent : 'today');
  }

  function startApp() {
    const onboarding = id('onboarding');
    if (onboarding) onboarding.classList.add('hidden');
    const app = id('app');
    if (app) {
      app.hidden = false; app.classList.add('is-live');
      app.removeAttribute('aria-hidden');
    }
    if (started) return;
    started = true;

    updateDateUI();
    updateStreak();
    renderPractice();
    renderThemeGrid();
    restoreChat();
    updateChatLimitNote();
    renderJournal();

    loadCorpus()
      .then((corpus) => renderLibrary(corpus.library))
      .catch(() => {
        const library = id('library-scroll');
        if (library) library.hidden = true;
      });
    loadDailyContent();
  }

  function switchTab(tab) {
    if (!TABS.includes(tab)) return;
    document.querySelectorAll('.page').forEach((page) => {
      page.classList.toggle('active', page.id === `${tab}-page`);
    });
    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.classList.toggle('active', button.id === `nav-${tab}`);
    });

    const nav = id('nav');
    if (nav) nav.style.setProperty('--nav-x', NAV_X[tab]);
    const subtitle = id('header-sub');
    if (subtitle) subtitle.textContent = TAB_SUBTITLES[tab];
    if (tab === 'journal') renderJournal();
    if (tab === 'advisor') scrollChat();
  }

  function updateDateUI() {
    const now = new Date();
    const greeting = now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';
    const greetingEl = id('today-greeting');
    if (greetingEl) greetingEl.textContent = greeting;
    const dateEl = id('today-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  function updateStreak() {
    // Display only — practice completion (craft.js) earns the streak with grace days.
    if (typeof global.renderStreakUI === 'function') {
      global.renderStreakUI();
      return;
    }
    const saved = parseJSON(ls('rla-streak-v2'), parseJSON(ls('rla-streak'), { count: 1 }));
    const count = Math.max(1, Number(saved.count) || 1);
    const countEl = id('streak-num');
    if (countEl) countEl.textContent = String(count);
    const label = id('today-streak-label');
    if (label) label.textContent = count === 1 ? '✦ Day 1' : `✦ ${count}-day practice`;
    return count;
  }

  function practiceKey() {
    return `rla-practice-${todayStr()}`;
  }

  function getPractice() {
    const saved = parseJSON(ls(practiceKey()), {});
    return {
      aff: saved.aff === true,
      word: saved.word === true,
      reflect: saved.reflect === true,
    };
  }

  function markPractice(step) {
    if (!['aff', 'word', 'reflect'].includes(step)) return;
    const practice = getPractice();
    if (!practice[step]) {
      practice[step] = true;
      lsSet(practiceKey(), JSON.stringify(practice));
    }
    if (dailyData) dailyData.practice = practice;
    renderPractice(practice);
  }

  function renderPractice(practice = getPractice()) {
    const elementIds = {
      aff: 'ps-aff',
      word: 'ps-word',
      reflect: 'ps-reflect',
    };
    Object.entries(elementIds).forEach(([step, elementId]) => {
      const element = id(elementId);
      if (!element) return;
      element.classList.toggle('done', practice[step]);
      element.setAttribute('aria-label', `${step} ${practice[step] ? 'complete' : 'not complete'}`);
    });
    const complete = id('practice-complete');
    if (complete) {
      const isComplete = practice.aff && practice.word && practice.reflect;
      complete.classList.toggle('on', isComplete);
      complete.hidden = !isComplete;
    }
  }

  function watchWordReading() {
    if (wordObserver) wordObserver.disconnect();
    if (!('IntersectionObserver' in global)) return;
    const target = id('word-content') || id('word-card');
    if (!target) return;
    wordObserver = new IntersectionObserver((entries) => {
      const viewed = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55);
      if (viewed && dailyData) {
        markPractice('word');
        wordObserver.disconnect();
      }
    }, { threshold: [0.55] });
    wordObserver.observe(target);
  }

  async function loadDailyContent() {
    let data;
    let offlineFallback = false;
    try {
      data = await fetchJSON('/api/daily');
      if (!validDaily(data)) throw new Error('Daily response is malformed');
    } catch (apiError) {
      try {
        data = await getOfflineDaily();
        offlineFallback = true;
      } catch (corpusError) {
        renderDailyError();
        console.error('Unable to load daily content', apiError, corpusError);
        return;
      }
    }

    dailyData = {
      ...data,
      practice: getPractice(),
    };
    renderDaily(dailyData);
    if (offlineFallback && navigator.onLine) {
      showToast('Showing a saved daily reading');
    }
  }

  function renderDaily(data) {
    const affirmation = data.affirmation;
    const word = data.word;
    const values = {
      'aff-text': affirmation.text,
      'aff-quote': `“${affirmation.quote}”`,
      'aff-verse': `— ${affirmation.verse}`,
      'word-theme': word.theme || 'Reflection',
      'word-title': word.title,
      'word-verse': word.verse,
      'word-reflection': word.reflection || '',
    };
    Object.entries(values).forEach(([elementId, value]) => {
      const element = id(elementId);
      if (element) element.textContent = value;
    });

    const passageEl = id('word-passage');
    if (passageEl) {
      const raw = String(word.passage || '').replace(/^["“]|["”]$/g, '');
      const first = raw.charAt(0);
      const rest = raw.slice(1);
      if (first && /[A-Za-z]/.test(first)) {
        passageEl.innerHTML =
          `<span class="drop-cap" aria-hidden="true">${esc(first)}</span>` +
          `<span class="manuscript-rest">“${esc(rest)}”</span>`;
      } else {
        passageEl.textContent = `“${raw}”`;
      }
    }

    const affSkeleton = id('aff-skel');
    const affContent = id('aff-content');
    const wordSkeleton = id('word-skel');
    const wordContent = id('word-content');
    if (affSkeleton) affSkeleton.style.display = 'none';
    if (affContent) affContent.style.display = 'block';
    if (wordSkeleton) wordSkeleton.style.display = 'none';
    if (wordContent) wordContent.style.display = 'block';

    setSaveBtnState('aff', isSaved(`aff-${todayStr()}`));
    setSaveBtnState('word', isSaved(`word-${todayStr()}`));
    renderPractice(data.practice || getPractice());
    markPractice('aff');
    watchWordReading();
    if (typeof global.onDailyRendered === 'function') global.onDailyRendered(data);
  }

  function renderDailyError() {
    const affSkeleton = id('aff-skel');
    const wordSkeleton = id('word-skel');
    if (affSkeleton) {
      affSkeleton.innerHTML =
        '<p style="color:rgba(255,255,255,.72);font-size:14px;line-height:1.6">Today’s reading is resting for a moment. Please try again when you’re connected.</p>';
    }
    if (wordSkeleton) {
      wordSkeleton.innerHTML =
        '<p style="color:var(--text-3);font-size:14px;line-height:1.6">The Word of the Day could not be loaded yet.</p>';
    }
  }

  async function buildOfflineAdvisorReply(question) {
    const corpus = await loadCorpus();
    const q = String(question || '').toLowerCase();
    const themeHints = [
      [/anx|worr|stress|overwhelm/, 'Anxiety & Worry'],
      [/grief|mourn|loss|died|death|miss /, 'Grief & Loss'],
      [/forgiv/, 'Forgiveness'],
      [/lonely|alone|isolat/, 'Loneliness'],
      [/conflict|argument|relationship|enemy|enemies/, 'Conflict & Relationships'],
      [/afraid|fear|scared|terror/, 'Fear'],
      [/purpose|direction|lost|calling/, 'Purpose & Direction'],
      [/doubt|faith|believe|unbelief/, 'Faith & Doubt'],
      [/suffer|pain|hurt|sick/, 'Suffering & Pain'],
      [/shame|guilt|condemn|regret/, 'Shame & Guilt'],
      [/peace|calm|rest/, 'Peace'],
      [/hope|future|despair/, 'Hope'],
    ];
    let theme = null;
    for (const [re, name] of themeHints) {
      if (re.test(q)) {
        theme = name;
        break;
      }
    }
    const pack = (theme && corpus.encouragement && corpus.encouragement[theme])
      || (corpus.encouragement && corpus.encouragement.Peace)
      || null;
    const libraryHit = (corpus.library || []).find((item) => {
      const themeName = String(item.theme || '').toLowerCase();
      return q.includes(themeName) ||
        (item.quote && q.split(/\s+/).some((w) => w.length > 4 && String(item.quote).toLowerCase().includes(w)));
    });
    const passages = (pack && pack.passages && pack.passages.slice(0, 3)) || (libraryHit ? [{
      verse: libraryHit.verse,
      quote: libraryHit.quote,
      context: 'A word from the red letters for this moment.',
    }] : []);
    if (!passages.length) return null;

    const lines = [
      'I hear you. While the live Advisor is resting, here are words Jesus actually spoke that meet this kind of moment:',
      '',
    ];
    passages.forEach((p) => {
      lines.push(`**${p.verse}**`);
      lines.push(`"${p.quote}"`);
      if (p.context) lines.push(p.context);
      lines.push('');
    });
    lines.push((pack && pack.closing) || 'Sit with these words — they are enough for this hour.');
    lines.push('');
    lines.push('_Offline guidance from the Red Letter library (World English Bible)._');
    return lines.join('\n');
  }

  function discussToday(shouldSend = true) {
    if (!dailyData || !dailyData.word) {
      showToast('Today’s word is still loading');
      return;
    }
    const { verse, passage } = dailyData.word;
    const prompt = `Help me sit with today's word from ${verse}: "${passage}". What does Jesus want me to notice?`;
    markPractice('reflect');
    switchTab('advisor');
    setChatInput(prompt);
    if (shouldSend !== false) sendMsg();
  }

  function renderThemeGrid() {
    const host = id('theme-grid');
    if (!host) return;
    host.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'theme-grid';
    THEMES.forEach(([theme], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-card';
      button.setAttribute('aria-label', `Find encouragement for ${theme}`);
      const ordinal = document.createElement('span');
      ordinal.className = 'theme-ordinal';
      ordinal.textContent = String(index + 1).padStart(2, '0');
      const name = document.createElement('span');
      name.className = 'theme-name';
      name.textContent = theme;
      button.append(ordinal, name);
      button.addEventListener('click', () => loadEnc(theme));
      grid.appendChild(button);
    });
    host.appendChild(grid);
  }

  async function loadEnc(theme) {
    if (!THEMES.some(([name]) => name === theme)) {
      showToast('Please choose an encouragement theme');
      return;
    }
    const requestId = ++encouragementRequest;
    showEncLoading();
    if (encouragementCache[theme]) {
      showEnc(encouragementCache[theme], theme);
      return;
    }

    let data;
    try {
      data = await fetchJSON('/api/encouragement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      if (!validEncouragement(data)) throw new Error('Encouragement response is malformed');
    } catch (apiError) {
      try {
        const corpus = await loadCorpus();
        data = corpus.encouragement[theme];
        if (!validEncouragement(data)) throw new Error('Offline encouragement is unavailable');
      } catch (corpusError) {
        if (requestId !== encouragementRequest) return;
        showThemeGrid();
        showToast('Encouragement could not be loaded yet');
        console.error('Unable to load encouragement', apiError, corpusError);
        return;
      }
    }

    if (requestId !== encouragementRequest) return;
    encouragementCache[theme] = data;
    showEnc(data, theme);
  }

  function validEncouragement(data) {
    return Boolean(
      data &&
      typeof data.headline === 'string' &&
      typeof data.opening === 'string' &&
      Array.isArray(data.passages)
    );
  }

  function showEncLoading() {
    const grid = id('theme-grid');
    const result = id('enc-result');
    const loading = id('enc-loading');
    if (grid) grid.style.display = 'none';
    if (result) result.classList.remove('on');
    if (loading) loading.style.display = 'block';
    const page = id('seek-page');
    if (page) page.scrollTop = 0;
  }

  function showEnc(data, theme) {
    currentEncData = data;
    currentEncTheme = theme;
    const loading = id('enc-loading');
    if (loading) loading.style.display = 'none';

    const fields = {
      'enc-headline': data.headline,
      'enc-opening': data.opening,
      'enc-practice': data.practice || '',
      'enc-closing': data.closing || '',
    };
    Object.entries(fields).forEach(([elementId, value]) => {
      const element = id(elementId);
      if (element) element.textContent = value;
    });

    const passages = id('enc-passages');
    if (passages) {
      passages.innerHTML = '';
      data.passages.forEach((passage) => {
        const card = document.createElement('div');
        card.className = 'passage-card';
        const verse = document.createElement('div');
        verse.className = 'passage-verse-tag';
        verse.textContent = passage.verse || '';
        const quote = document.createElement('div');
        quote.className = 'passage-quote';
        quote.textContent = `“${passage.quote || ''}”`;
        const context = document.createElement('div');
        context.className = 'passage-context';
        context.textContent = passage.context || '';
        card.append(verse, quote, context);
        passages.appendChild(card);
      });
    }

    setSaveBtnState('enc', isSaved(`enc-${slugify(theme)}`));
    const result = id('enc-result');
    if (result) result.classList.add('on');
    const page = id('seek-page');
    if (page) page.scrollTop = 0;
  }

  function showThemeGrid() {
    encouragementRequest += 1;
    const grid = id('theme-grid');
    const result = id('enc-result');
    const loading = id('enc-loading');
    if (grid) grid.style.display = 'block';
    if (result) result.classList.remove('on');
    if (loading) loading.style.display = 'none';
    const page = id('seek-page');
    if (page) page.scrollTop = 0;
  }

  function restoreChat() {
    const stored = parseJSON(ls('rla-chat'), []);
    chatHistory = Array.isArray(stored)
      ? stored
        .filter((message) =>
          message &&
          ['user', 'assistant'].includes(message.role) &&
          typeof message.content === 'string' &&
          message.content.trim()
        )
        .slice(-MAX_STORED_MESSAGES)
      : [];
    while (chatHistory[0] && chatHistory[0].role === 'assistant') {
      chatHistory.shift();
    }
    renderChatHistory();
  }

  function persistChat() {
    chatHistory = chatHistory.slice(-MAX_STORED_MESSAGES);
    while (chatHistory[0] && chatHistory[0].role === 'assistant') {
      chatHistory.shift();
    }
    lsSet('rla-chat', JSON.stringify(chatHistory));
  }

  function messageClass(role) {
    return role === 'user'
      ? 'message user msg msg-user'
      : 'message assistant msg msg-ai';
  }

  function createMessage(role, text, streaming = false) {
    const messages = id('chat-messages');
    if (!messages) return null;
    const wrap = document.createElement('div');
    wrap.className = messageClass(role);
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'user' ? 'You' : '✝';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const content = document.createElement('div');
    content.className = 'message-content';
    if (role === 'assistant') {
      content.innerHTML = streaming
        ? '<span class="text-cursor" aria-hidden="true">▋</span>'
        : formatAI(text);
    } else {
      content.textContent = text;
    }
    bubble.appendChild(content);
    wrap.append(avatar, bubble);
    messages.appendChild(wrap);
    return { wrap, bubble, content };
  }

  function renderChatHistory() {
    const messages = id('chat-messages');
    if (!messages) return;
    messages.innerHTML = '';
    let lastQuestion = '';
    chatHistory.forEach((message) => {
      if (message.role === 'user') {
        lastQuestion = message.content;
        createMessage('user', message.content);
      } else {
        const rendered = createMessage('assistant', message.content);
        if (rendered) {
          addChatSaveButton(rendered, message.content, lastQuestion);
          if (global.RedLetterTrust && typeof global.RedLetterTrust.sealAdvisorMessage === 'function') {
            global.RedLetterTrust.sealAdvisorMessage(rendered.content, message.content);
          }
        }
      }
    });
    const suggestions = id('suggestions');
    if (suggestions) suggestions.style.display = chatHistory.length ? 'none' : '';
    scrollChat();
  }

  function updateStreamMessage(rendered, text, showCursor = true) {
    if (!rendered) return;
    rendered.content.innerHTML = formatAI(text);
    if (showCursor) {
      const cursor = document.createElement('span');
      cursor.className = 'text-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '▋';
      rendered.content.appendChild(cursor);
    }
  }

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function addChatSaveButton(rendered, answer, question) {
    if (!rendered || !rendered.bubble) return;
    const key = `chat-${stableHash(`${question}\n${answer}`)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'msg-save-btn action-btn-dark';
    button.dataset.journalKey = key;

    const update = () => {
      const saved = isSaved(key);
      button.classList.toggle('saved', saved);
      button.textContent = saved ? '✓ Saved to Journal' : '♡ Save to Journal';
    };
    button.addEventListener('click', () => {
      if (isSaved(key)) {
        removeJournalItem(key);
        showToast('Removed from Journal');
      } else {
        saveJournalItem({
          id: key,
          key,
          type: 'chat',
          title: question.length > 72 ? `${question.slice(0, 72)}…` : question || 'Advisor reflection',
          body: answer,
          verse: extractFirstVerse(answer),
        });
        showToast('Saved to Journal ✦');
      }
      update();
    });
    update();
    rendered.bubble.appendChild(button);
  }

  function chatCount() {
    const count = Number.parseInt(ls(`rla-chat-count-${todayStr()}`) || '0', 10);
    return Number.isFinite(count) && count > 0 ? count : 0;
  }

  function incrementChatCount() {
    const count = chatCount() + 1;
    lsSet(`rla-chat-count-${todayStr()}`, String(count));
    updateChatLimitNote();
    return count;
  }

  function updateChatLimitNote() {
    const note = id('chat-limit-note');
    if (!note) return;
    const used = Math.min(chatCount(), CHAT_DAILY_LIMIT);
    if (used >= CHAT_DAILY_LIMIT) {
      note.textContent = 'Today’s five free conversations are complete. Red Letter Plus is coming soon.';
    } else {
      const remaining = CHAT_DAILY_LIMIT - used;
      note.textContent = `${remaining} free conversation${remaining === 1 ? '' : 's'} remaining today`;
    }
  }

  function setChatBusy(busy) {
    isChatBusy = busy;
    const send = id('send-btn');
    if (send) send.disabled = busy;
  }

  function setTyping(show) {
    const typing = id('typing');
    if (typing) typing.classList.toggle('on', show);
  }

  function setChatInput(value) {
    const input = id('chat-input');
    if (!input) return;
    input.value = String(value || '');
    resizeChatInput();
    input.focus();
  }

  function resizeChatInput() {
    const input = id('chat-input');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
  }

  function useSuggestion(suggestion) {
    const text = typeof suggestion === 'string'
      ? suggestion
      : suggestion && suggestion.textContent
        ? suggestion.textContent.trim()
        : '';
    if (!text) return;
    setChatInput(text);
    const suggestions = id('suggestions');
    if (suggestions) suggestions.style.display = 'none';
    sendMsg();
  }

  async function sendMsg(message) {
    const input = id('chat-input');
    const text = String(typeof message === 'string' ? message : input ? input.value : '').trim();
    if (!text || isChatBusy) return;

    setChatBusy(true);
    try {
      const crisis = global.RedLetterCrisis;
      if (crisis && typeof crisis.detectCrisis === 'function' && crisis.detectCrisis(text)) {
        const action = typeof crisis.showCrisisModal === 'function'
          ? await crisis.showCrisisModal()
          : 'close';
        if (action !== 'continue') return;
      }

      if (chatCount() >= CHAT_DAILY_LIMIT) {
        openPlus();
        return;
      }

      if (input && typeof message !== 'string') {
        input.value = '';
        resizeChatInput();
      }
      const suggestions = id('suggestions');
      if (suggestions) suggestions.style.display = 'none';

      chatHistory.push({ role: 'user', content: text });
      persistChat();
      createMessage('user', text);
      setTyping(true);
      scrollChat();

      let rendered = null;
      let fullText = '';
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ messages: chatHistory }),
        });
        if (!response.ok) {
          const offline = await buildOfflineAdvisorReply(text);
          if (offline) {
            setTyping(false);
            rendered = createMessage('assistant', offline, false);
            addChatSaveButton(rendered, offline, text);
            if (global.RedLetterTrust && typeof global.RedLetterTrust.sealAdvisorMessage === 'function') {
              global.RedLetterTrust.sealAdvisorMessage(rendered.content, offline);
            }
            chatHistory.push({ role: 'assistant', content: offline });
            persistChat();
            incrementChatCount();
            showToast('Showing saved Gospel words (offline)');
            return;
          }
          throw new Error(`Chat request failed (${response.status})`);
        }
        if (!response.body) throw new Error('Streaming is not supported by this browser');

        setTyping(false);
        rendered = createMessage('assistant', '', true);
        await readSSE(response, (chunk) => {
          fullText += chunk;
          updateStreamMessage(rendered, fullText, true);
          scrollChat();
        });
        if (!fullText.trim()) throw new Error('The Advisor returned an empty response');

        updateStreamMessage(rendered, fullText, false);
        addChatSaveButton(rendered, fullText, text);
        if (global.RedLetterTrust && typeof global.RedLetterTrust.sealAdvisorMessage === 'function') {
          global.RedLetterTrust.sealAdvisorMessage(rendered.content, fullText);
        }
        chatHistory.push({ role: 'assistant', content: fullText });
        persistChat();
        incrementChatCount();
      } catch (error) {
        setTyping(false);
        try {
          const offline = await buildOfflineAdvisorReply(text);
          if (offline) {
            if (!rendered) rendered = createMessage('assistant', offline, false);
            else updateStreamMessage(rendered, offline, false);
            addChatSaveButton(rendered, offline, text);
            if (global.RedLetterTrust && typeof global.RedLetterTrust.sealAdvisorMessage === 'function') {
              global.RedLetterTrust.sealAdvisorMessage(rendered.content, offline);
            }
            chatHistory.push({ role: 'assistant', content: offline });
            persistChat();
            incrementChatCount();
            showToast('Showing saved Gospel words (offline)');
            return;
          }
        } catch (_) { /* fall through */ }
        if (!rendered) rendered = createMessage('assistant', '', false);
        updateStreamMessage(
          rendered,
          'I could not reach the live Advisor just now. Your question is saved — try again when you are connected, or open Seek for encouragement by theme.',
          false
        );
        showToast('Advisor unavailable — try Seek themes');
        console.error('Chat request failed', error);
      }
    } finally {
      setTyping(false);
      setChatBusy(false);
      scrollChat();
    }
  }

  async function readSSE(response, onText) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finished = false;

    const processEvent = (eventText) => {
      const payloadText = eventText
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n')
        .trim();
      if (!payloadText) return false;
      if (payloadText === '[DONE]') return true;
      const payload = JSON.parse(payloadText);
      if (payload.error) throw new Error(payload.error);
      if (payload.verify && typeof onText._onVerify === 'function') onText._onVerify(payload.verify);
      if (typeof payload.text === 'string') onText(payload.text);
      return false;
    };

    while (!finished) {
      const result = await reader.read();
      buffer += decoder.decode(result.value || new Uint8Array(), { stream: !result.done });
      let boundary = buffer.search(/\r?\n\r?\n/);
      while (boundary !== -1) {
        const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)[0];
        const eventText = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + separator.length);
        if (processEvent(eventText)) {
          finished = true;
          break;
        }
        boundary = buffer.search(/\r?\n\r?\n/);
      }
      if (result.done) {
        if (buffer.trim()) processEvent(buffer);
        finished = true;
      }
    }
    if (reader.cancel) {
      try {
        await reader.cancel();
      } catch (_) {
        // The stream may already be closed.
      }
    }
  }

  function scrollChat() {
    const scroll = id('chat-scroll');
    if (!scroll) return;
    global.requestAnimationFrame(() => {
      scroll.scrollTop = scroll.scrollHeight;
    });
  }

  function clearChat() {
    if (isChatBusy) {
      showToast('Please wait for the current response');
      return;
    }
    chatHistory = [];
    persistChat();
    renderChatHistory();
    const suggestions = id('suggestions');
    if (suggestions) suggestions.style.display = '';
    showToast('Conversation cleared');
  }

  function getJournal() {
    const journal = parseJSON(ls('rla-journal'), []);
    return Array.isArray(journal)
      ? journal.filter((item) => item && typeof item.key === 'string')
      : [];
  }

  function setJournal(items) {
    lsSet('rla-journal', JSON.stringify(items));
  }

  function saveJournalItem(item) {
    if (!item || !item.key) return;
    const items = getJournal().filter((saved) => saved.key !== item.key);
    items.unshift({
      ...item,
      savedAt: new Date().toISOString(),
    });
    setJournal(items);
    renderJournalIfVisible();
  }

  function removeJournalItem(key) {
    setJournal(getJournal().filter((item) => item.key !== key));
    syncSaveButtons();
    syncChatSaveButtons();
    renderJournalIfVisible();
  }

  function isSaved(key) {
    return Boolean(key) && getJournal().some((item) => item.key === key);
  }

  function renderJournalIfVisible() {
    const page = id('journal-page');
    if (page && page.classList.contains('active')) renderJournal();
  }

  function renderJournal() {
    const list = id('journal-list');
    if (!list) return;
    const items = getJournal();
    if (!items.length) {
      list.innerHTML = [
        '<div class="journal-empty">',
        '<div class="journal-empty-mark" aria-hidden="true">✝</div>',
        '<div class="journal-empty-title">A quiet shelf</div>',
        '<div class="journal-empty-text">Save a saying when it finds you. Affirmations, encouragement, and Advisor replies live here.</div>',
        '</div>',
      ].join('');
      return;
    }

    const labels = {
      aff: 'Affirmation',
      word: 'Word of Day',
      enc: 'Encouragement',
      chat: 'Advisor',
    };
    const colors = {
      aff: 'badge-crimson',
      word: 'badge-gold',
      enc: 'badge-crimson',
      chat: 'badge-gold',
    };
    list.innerHTML = items.map((item) => {
      const type = labels[item.type] ? item.type : 'word';
      const savedDate = new Date(item.savedAt);
      const date = Number.isNaN(savedDate.getTime())
        ? ''
        : savedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return [
        '<article class="journal-item">',
        `<button type="button" class="journal-delete" data-delete-key="${esc(item.key)}" aria-label="Remove ${esc(item.title || 'saved item')}">`,
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>',
        '</button>',
        '<div class="journal-type-row">',
        `<span class="badge ${colors[type]}">${labels[type]}</span>`,
        `<time class="journal-date">${esc(date)}</time>`,
        '</div>',
        `<div class="journal-title">${esc(item.title || 'Saved reflection')}</div>`,
        `<div class="journal-body">${esc(item.body || '')}</div>`,
        item.verse ? `<div class="journal-verse">${esc(item.verse)}</div>` : '',
        '</article>',
      ].join('');
    }).join('');

    list.querySelectorAll('[data-delete-key]').forEach((button) => {
      button.addEventListener('click', () => deleteJournalItem(button.dataset.deleteKey));
    });
  }

  function deleteJournalItem(key) {
    removeJournalItem(String(key || ''));
    renderJournal();
    showToast('Removed from Journal');
  }

  function toggleSave(type) {
    const keys = {
      aff: `aff-${todayStr()}`,
      word: `word-${todayStr()}`,
      enc: currentEncTheme ? `enc-${slugify(currentEncTheme)}` : '',
    };
    const key = keys[type];
    if (!key) return;
    if (isSaved(key)) {
      removeJournalItem(key);
      setSaveBtnState(type, false);
      showToast('Removed from Journal');
      return;
    }

    let item = null;
    if (type === 'aff' && dailyData) {
      item = {
        id: key,
        key,
        type: 'aff',
        title: dailyData.affirmation.text,
        body: dailyData.affirmation.quote,
        verse: dailyData.affirmation.verse,
      };
    } else if (type === 'word' && dailyData) {
      item = {
        id: key,
        key,
        type: 'word',
        title: dailyData.word.title,
        body: dailyData.word.passage,
        verse: dailyData.word.verse,
      };
    } else if (type === 'enc' && currentEncData) {
      const first = currentEncData.passages[0] || {};
      item = {
        id: key,
        key,
        type: 'enc',
        title: currentEncData.headline,
        body: [currentEncData.opening, first.quote].filter(Boolean).join('\n\n'),
        verse: first.verse || '',
      };
    }
    if (!item) return;
    saveJournalItem(item);
    setSaveBtnState(type, true);
    showToast('Saved to Journal ✦');
  }

  function setSaveBtnState(type, saved) {
    const button = id(`${type}-save-btn`);
    const label = id(`${type}-save-label`);
    if (button) {
      button.classList.toggle('saved', saved);
      button.setAttribute('aria-pressed', String(saved));
    }
    if (label) {
      label.textContent = saved ? 'Saved ✓' : type === 'enc' ? 'Save this' : 'Save';
    }
  }

  function syncSaveButtons() {
    setSaveBtnState('aff', isSaved(`aff-${todayStr()}`));
    setSaveBtnState('word', isSaved(`word-${todayStr()}`));
    if (currentEncTheme) {
      setSaveBtnState('enc', isSaved(`enc-${slugify(currentEncTheme)}`));
    }
  }

  function syncChatSaveButtons() {
    document.querySelectorAll('.msg-save-btn[data-journal-key]').forEach((button) => {
      const saved = isSaved(button.dataset.journalKey);
      button.classList.toggle('saved', saved);
      button.textContent = saved ? '✓ Saved to Journal' : '♡ Save to Journal';
    });
  }

  function sharePayload(payload) {
    if (!payload || !payload.quote) return Promise.resolve();
    if (!global.RedLetterShare || typeof global.RedLetterShare.shareCard !== 'function') {
      showToast('Sharing is unavailable right now');
      return Promise.resolve();
    }
    return global.RedLetterShare.shareCard({
      quote: payload.quote,
      verse: payload.verse || '',
      theme: payload.theme || '',
    }).then((result) => {
      showToast(result === 'downloaded' ? 'Share card downloaded' : 'Shared ✦');
    }).catch((error) => {
      if (error && error.name === 'AbortError') return;
      showToast('Could not share this card');
      console.error('Share failed', error);
    });
  }

  function shareItem(type) {
    let payload = null;
    if (type === 'aff' && dailyData) {
      payload = {
        quote: dailyData.affirmation.quote,
        verse: dailyData.affirmation.verse,
        theme: 'Daily Affirmation',
      };
    } else if (type === 'word' && dailyData) {
      payload = {
        quote: dailyData.word.passage,
        verse: dailyData.word.verse,
        theme: dailyData.word.theme,
      };
    } else if (type === 'enc' && currentEncData) {
      const first = currentEncData.passages[0];
      if (first) {
        payload = {
          quote: first.quote,
          verse: first.verse,
          theme: currentEncTheme || currentEncData.theme,
        };
      }
    }
    return sharePayload(payload);
  }

  function renderLibrary(items) {
    const scroll = id('library-scroll');
    if (!scroll) return;
    libraryItems = Array.isArray(items) ? items : [];
    scroll.hidden = false;
    scroll.innerHTML = '';
    libraryItems.forEach((item, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'library-chip';
      chip.textContent = item.theme || item.verse || 'Passage';
      chip.addEventListener('click', () => openLibraryItem(index));
      scroll.appendChild(chip);
    });

    let panel = id('library-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'library-panel';
      panel.className = 'library-panel';
      scroll.insertAdjacentElement('afterend', panel);
    }
  }

  function openLibraryItem(index) {
    const item = libraryItems[index];
    const panel = id('library-panel');
    const scroll = id('library-scroll');
    if (!item || !panel) return;
    if (scroll) {
      Array.from(scroll.querySelectorAll('.library-chip')).forEach((chip, chipIndex) => {
        chip.classList.toggle('active', chipIndex === index);
      });
    }
    panel.innerHTML = '';
    panel.classList.add('on');

    const card = document.createElement('div');
    card.className = 'library-item';
    const body = document.createElement('div');
    body.style.flex = '1';
    const verse = document.createElement('div');
    verse.className = 'passage-verse-tag';
    verse.textContent = item.verse || '';
    const quote = document.createElement('div');
    quote.className = 'passage-quote';
    quote.textContent = `“${item.quote || ''}”`;
    const actions = document.createElement('div');
    actions.className = 'card-actions dark-sep';

    const share = document.createElement('button');
    share.type = 'button';
    share.className = 'action-btn-dark';
    share.textContent = 'Share';
    share.addEventListener('click', () => sharePayload(item));

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'action-btn-dark';
    const key = libraryKey(item);
    const updateSave = () => {
      const saved = isSaved(key);
      save.classList.toggle('saved', saved);
      save.textContent = saved ? 'Saved ✓' : 'Save';
    };
    save.addEventListener('click', () => {
      if (isSaved(key)) {
        removeJournalItem(key);
        showToast('Removed from Journal');
      } else {
        saveJournalItem({
          id: key,
          key,
          type: 'word',
          title: item.theme || item.verse,
          body: item.quote,
          verse: item.verse,
        });
        showToast('Saved to Journal ✦');
      }
      updateSave();
    });
    updateSave();

    const discuss = document.createElement('button');
    discuss.type = 'button';
    discuss.className = 'action-btn-dark';
    discuss.textContent = 'Discuss';
    discuss.addEventListener('click', () => {
      switchTab('advisor');
      setChatInput(`Help me sit with ${item.verse}: "${item.quote}". What does Jesus want me to notice?`);
      sendMsg();
    });

    actions.append(share, save, discuss);
    body.append(verse, quote, actions);
    card.appendChild(body);
    panel.appendChild(card);
  }

  function libraryKey(item) {
    return `library-${slugify(item.theme)}-${slugify(item.verse)}`;
  }

  function openSettings() {
    closePlus();
    const overlay = id('overlay');
    const sheet = id('settings-sheet');
    if (overlay) overlay.classList.add('on');
    if (sheet) {
      sheet.classList.add('on');
      sheet.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSettings() {
    const sheet = id('settings-sheet');
    if (sheet) {
      sheet.classList.remove('on');
      sheet.setAttribute('aria-hidden', 'true');
    }
    const plus = id('plus-sheet');
    if (plus && plus.classList.contains('on')) {
      closePlus();
      return;
    }
    const overlay = id('overlay');
    if (overlay) overlay.classList.remove('on');
  }

  function toggleDark(on) {
    const toggle = id('dark-toggle');
    const enabled = typeof on === 'boolean' ? on : toggle ? toggle.checked : false;
    document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
    if (toggle) toggle.checked = enabled;
    lsSet('rla-dark', enabled ? '1' : '0');
  }

  function setFs(size) {
    const selected = ['sm', 'md', 'lg'].includes(size) ? size : 'md';
    document.documentElement.dataset.fs = selected;
    lsSet('rla-fs', selected);
    ['sm', 'md', 'lg'].forEach((option) => {
      const button = id(`fs-${option}`);
      if (button) {
        button.classList.toggle('active', option === selected);
        button.setAttribute('aria-pressed', String(option === selected));
      }
    });
  }

  function applySettings() {
    const darkPreference = ls('rla-dark');
    const systemDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = darkPreference === null ? systemDark : darkPreference === '1';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const toggle = id('dark-toggle');
    if (toggle) toggle.checked = dark;
    setFs(ls('rla-fs') || 'md');
  }

  function preparePlusSheet() {
    const sheet = id('plus-sheet');
    if (!sheet || sheet.dataset.prepared === 'true') return;
    sheet.dataset.prepared = 'true';
    const card = sheet.querySelector('.plus-card') || sheet;
    if (!card.querySelector('.plus-preview-copy')) {
      const copy = document.createElement('p');
      copy.className = 'plus-preview-copy';
      copy.textContent =
        'Red Letter Plus is coming soon. Its support will help keep daily guidance accessible and sustain the mission. This preview does not start a subscription.';
      copy.style.cssText = 'color:rgba(255,255,255,.78);font-size:13px;line-height:1.55;margin:0 0 16px';
      const title = card.querySelector('.plus-title');
      if (title) title.insertAdjacentElement('afterend', copy);
      else card.insertBefore(copy, card.firstChild);
    }
    sheet.querySelectorAll('.plus-cta, .plus-dismiss, [data-plus-dismiss]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        closePlus();
        showToast('Red Letter Plus is coming soon');
      }, true);
    });
  }

  function openPlus() {
    preparePlusSheet();
    const settings = id('settings-sheet');
    if (settings) settings.classList.remove('on');
    const overlay = id('overlay');
    const sheet = id('plus-sheet');
    if (overlay) overlay.classList.add('on');
    if (sheet) {
      sheet.classList.add('on');
      sheet.setAttribute('aria-hidden', 'false');
    } else {
      showToast('Five free conversations are available each day. Plus is coming soon.');
    }
  }

  function closePlus() {
    const sheet = id('plus-sheet');
    if (sheet) {
      sheet.classList.remove('on');
      sheet.setAttribute('aria-hidden', 'true');
    }
    const settings = id('settings-sheet');
    const overlay = id('overlay');
    if (overlay && (!settings || !settings.classList.contains('on'))) {
      overlay.classList.remove('on');
    }
  }

  function updateOnlineStatus(announce = false) {
    const banner = id('offline-banner');
    const offline = navigator.onLine === false;
    if (banner) {
      if (!banner.textContent.trim()) {
        banner.textContent = 'You’re offline — saved readings remain available.';
      }
      banner.classList.toggle('on', offline);
    }
    if (announce && !offline) showToast('Back online');
  }

  function setupConnectivity() {
    updateOnlineStatus(false);
    global.addEventListener('offline', () => updateOnlineStatus(false));
    global.addEventListener('online', () => updateOnlineStatus(true));
  }

  function setupInstallPrompt() {
    const button = id('install-btn');
    global.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      global.deferredInstallPrompt = event;
      if (button) {
        button.classList.add('visible', 'show');
        button.hidden = false;
        button.textContent = 'Install';
      }
    });
    // Click handling lives in mobile.js so iOS gets Add-to-Home guidance
    // when beforeinstallprompt is unavailable.
    global.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      global.deferredInstallPrompt = null;
      if (button) {
        button.classList.remove('visible', 'show');
        button.hidden = true;
      }
      showToast('Red Letter installed');
    });
  }

  function setupChatInput() {
    const input = id('chat-input');
    if (!input) return;
    input.addEventListener('input', resizeChatInput);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        sendMsg();
      }
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed', error);
      });
    }
  }

  function formatInline(text) {
    const versePattern = /((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–-]\s*\d+(?:[a-z])?)?)/gi;
    return String(text || '').split(/(\*\*[^*]+\*\*)/g).map((part) => {
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold) {
        const value = bold[1];
        const isVerse = /(?:Matthew|Mark|Luke|John)\s+\d+:\d+/i.test(value);
        return isVerse
          ? `<strong class="citation">${esc(value)}</strong>`
          : `<strong>${esc(value)}</strong>`;
      }
      return esc(part).replace(versePattern, '<span class="citation">$1</span>');
    }).join('');
  }

  function formatAI(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const parts = [];
    const citationLine = /^\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–-]\s*\d+(?:[a-z])?)?)\*\*\s*$/i;
    let index = 0;

    while (index < lines.length) {
      const line = lines[index].trim();
      const citation = line.match(citationLine);
      if (citation) {
        let next = index + 1;
        while (next < lines.length && !lines[next].trim()) next += 1;
        const quoteLine = next < lines.length ? lines[next].trim() : '';
        if (/^["“]/.test(quoteLine)) {
          const quote = quoteLine.replace(/^["“]+/, '').replace(/["”]+\s*$/, '');
          let contextIndex = next + 1;
          while (contextIndex < lines.length && !lines[contextIndex].trim()) contextIndex += 1;
          let context = '';
          if (
            contextIndex < lines.length &&
            !citationLine.test(lines[contextIndex].trim()) &&
            !/^["“]/.test(lines[contextIndex].trim())
          ) {
            context = lines[contextIndex].trim();
            contextIndex += 1;
          }
          parts.push([
            '<div class="scripture-block">',
            `<div class="scripture-verse">${esc(citation[1])}</div>`,
            `<div class="scripture-quote">“${esc(quote)}”</div>`,
            context ? `<div class="scripture-ctx">${formatInline(context)}</div>` : '',
            '</div>',
          ].join(''));
          index = contextIndex;
          continue;
        }
        parts.push(`<p class="ai-p"><strong class="citation">${esc(citation[1])}</strong></p>`);
        index += 1;
        continue;
      }
      if (!line) {
        parts.push('<div class="ai-spacer" aria-hidden="true"></div>');
        index += 1;
        continue;
      }
      if (/^["“]/.test(line)) {
        const quote = line.replace(/^["“]+/, '').replace(/["”]+\s*$/, '');
        parts.push(`<div class="scripture-block"><div class="scripture-quote">“${esc(quote)}”</div></div>`);
        index += 1;
        continue;
      }
      parts.push(`<p class="ai-p">${formatInline(line)}</p>`);
      index += 1;
    }
    return parts.join('');
  }

  function extractFirstVerse(text) {
    const match = String(text || '').match(
      /(Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–-]\s*\d+(?:[a-z])?)?/i
    );
    return match ? match[0] : '';
  }

  function boot() {
    applySettings();
    setupChatInput();
    setupConnectivity();
    setupInstallPrompt();
    preparePlusSheet();
    registerServiceWorker();
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSettings();
        closePlus();
        if (typeof global.closeBlessing === 'function') global.closeBlessing();
        if (typeof global.closeAmen === 'function') global.closeAmen();
      }
    });

    if (ls('rla-onboarded')) startApp();
    else showOnboarding();
  }

  Object.assign(global, {
    completeOnboarding,
    selectIntent,
    switchTab,
    toggleSave,
    shareItem,
    loadEnc,
    showThemeGrid,
    sendMsg,
    useSuggestion,
    openSettings,
    closeSettings,
    toggleDark,
    setFs,
    deleteJournalItem,
    discussToday,
    markPractice,
    openPlus,
    closePlus,
    clearChat,
    ls,
    lsSet,
    esc,
    slugify,
    todayStr,
    formatAI,
    extractFirstVerse,
    showToast,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(window);
