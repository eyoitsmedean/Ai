/* The Quiet Chapel — atmosphere, lectio, command palette, word reveal */
(function (global) {
  'use strict';

  function id(name) {
    return document.getElementById(name);
  }

  function setHourAtmosphere() {
    const h = new Date().getHours();
    let hour = 'day';
    if (h < 6 || h >= 21) hour = 'night';
    else if (h < 11) hour = 'morning';
    else if (h >= 17) hour = 'dusk';
    document.documentElement.dataset.hour = hour;
  }

  function revealWords(el, text) {
    if (!el) return;
    const clean = String(text || '').replace(/^["“]|["”]$/g, '');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = clean.startsWith('“') ? clean : `“${clean}”`;
      return;
    }
    const words = clean.split(/\s+/).filter(Boolean);
    el.innerHTML = '';
    el.classList.add('word-reveal');
    const open = document.createElement('span');
    open.textContent = '“';
    open.style.animationDelay = '0ms';
    el.appendChild(open);
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word + (index === words.length - 1 ? '' : ' ');
      span.style.animationDelay = `${80 + index * 55}ms`;
      el.appendChild(span);
    });
    const close = document.createElement('span');
    close.textContent = '”';
    close.style.animationDelay = `${80 + words.length * 55}ms`;
    el.appendChild(close);
  }

  function openLectio(quote, cite) {
    const root = id('lectio');
    const q = id('lectio-quote');
    const c = id('lectio-cite');
    if (!root || !q) return;
    revealWords(q, quote);
    if (c) c.textContent = cite || '';
    root.classList.add('on');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLectio() {
    const root = id('lectio');
    if (!root) return;
    root.classList.remove('on');
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openLectioFromAff() {
    const quote = (id('aff-quote') && id('aff-quote').textContent) || '';
    const cite = (id('aff-verse') && id('aff-verse').textContent) || '';
    openLectio(quote, cite);
    if (typeof global.markPractice === 'function') global.markPractice('aff');
  }

  function openLectioFromWord() {
    const quote = (id('word-passage') && id('word-passage').textContent) || '';
    const cite = (id('word-verse') && id('word-verse').textContent) || '';
    openLectio(quote, cite);
    if (typeof global.markPractice === 'function') global.markPractice('word');
  }

  const COMMANDS = [
    { label: 'Today’s reading', hint: 'Open Today', run: () => global.switchTab && global.switchTab('today') },
    { label: 'Find encouragement', hint: 'Seek', run: () => global.switchTab && global.switchTab('seek') },
    { label: 'Ask the Advisor', hint: 'Counsel', run: () => global.switchTab && global.switchTab('advisor') },
    { label: 'Open Journal', hint: 'Saved', run: () => global.switchTab && global.switchTab('journal') },
    { label: 'Anxiety & Worry', hint: 'Encouragement', run: () => { global.switchTab && global.switchTab('seek'); setTimeout(() => global.loadEnc && global.loadEnc('Anxiety & Worry'), 120); } },
    { label: 'Grief & Loss', hint: 'Encouragement', run: () => { global.switchTab && global.switchTab('seek'); setTimeout(() => global.loadEnc && global.loadEnc('Grief & Loss'), 120); } },
    { label: 'Forgiveness', hint: 'Encouragement', run: () => { global.switchTab && global.switchTab('seek'); setTimeout(() => global.loadEnc && global.loadEnc('Forgiveness'), 120); } },
    { label: 'Peace', hint: 'Encouragement', run: () => { global.switchTab && global.switchTab('seek'); setTimeout(() => global.loadEnc && global.loadEnc('Peace'), 120); } },
    { label: 'Hope', hint: 'Encouragement', run: () => { global.switchTab && global.switchTab('seek'); setTimeout(() => global.loadEnc && global.loadEnc('Hope'), 120); } },
    { label: 'Sit with today’s word', hint: 'Lectio', run: () => openLectioFromWord() },
    { label: 'Settings', hint: 'Preferences', run: () => global.openSettings && global.openSettings() },
  ];

  let cmdIndex = 0;
  let cmdFiltered = COMMANDS.slice();

  function renderCmdList(filter) {
    const list = id('cmdk-list');
    if (!list) return;
    const q = String(filter || '').trim().toLowerCase();
    cmdFiltered = COMMANDS.filter((item) =>
      !q || item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    );
    if (q.startsWith('ask ') || q.startsWith('how ') || q.length > 18) {
      cmdFiltered = [{
        label: `Ask Advisor: “${filter.trim()}”`,
        hint: 'Chat',
        run: () => {
          global.switchTab && global.switchTab('advisor');
          setTimeout(() => {
            const input = id('chat-input');
            if (input) {
              input.value = filter.trim();
              input.dispatchEvent(new Event('input'));
            }
            global.sendMsg && global.sendMsg(filter.trim());
          }, 160);
        },
      }].concat(cmdFiltered);
    }
    cmdIndex = 0;
    list.innerHTML = '';
    cmdFiltered.forEach((item, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'cmdk-item' + (index === 0 ? ' active' : '');
      row.innerHTML = `<span>${item.label}</span><span class="cmdk-hint">${item.hint}</span>`;
      row.addEventListener('click', () => runCmd(index));
      list.appendChild(row);
    });
  }

  function runCmd(index) {
    const item = cmdFiltered[index];
    closeCommandPalette();
    if (item && typeof item.run === 'function') item.run();
  }

  function openCommandPalette() {
    const root = id('cmdk');
    const input = id('cmdk-input');
    if (!root) return;
    root.classList.add('on');
    root.setAttribute('aria-hidden', 'false');
    renderCmdList('');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 30);
    }
  }

  function closeCommandPalette() {
    const root = id('cmdk');
    if (!root) return;
    root.classList.remove('on');
    root.setAttribute('aria-hidden', 'true');
  }

  function enhanceDailyReveal() {
    const quoteEl = id('aff-quote');
    if (!quoteEl || quoteEl.dataset.revealed === '1') return;
    const text = quoteEl.textContent;
    if (!text || text.length < 8) return;
    quoteEl.dataset.revealed = '1';
    revealWords(quoteEl, text);
  }

  function watchDailyContent() {
    const target = id('aff-content');
    if (!target || typeof MutationObserver === 'undefined') {
      setTimeout(enhanceDailyReveal, 800);
      return;
    }
    const observer = new MutationObserver(() => {
      if (target.style.display !== 'none') {
        enhanceDailyReveal();
      }
    });
    observer.observe(target, { attributes: true, attributeFilter: ['style'], childList: true, subtree: true });
    setTimeout(enhanceDailyReveal, 1200);
  }

  function bindKeys() {
    document.addEventListener('keydown', (event) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const root = id('cmdk');
        if (root && root.classList.contains('on')) closeCommandPalette();
        else openCommandPalette();
        return;
      }
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const tag = (event.target && event.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        event.preventDefault();
        openCommandPalette();
        return;
      }
      if (event.key === 'Escape') {
        closeLectio();
        closeCommandPalette();
      }
      const cmdk = id('cmdk');
      if (cmdk && cmdk.classList.contains('on')) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          cmdIndex = Math.min(cmdIndex + 1, cmdFiltered.length - 1);
          syncCmdActive();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          cmdIndex = Math.max(cmdIndex - 1, 0);
          syncCmdActive();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          runCmd(cmdIndex);
        }
      }
    });

    const input = id('cmdk-input');
    if (input) {
      input.addEventListener('input', () => renderCmdList(input.value));
    }
    const cmdk = id('cmdk');
    if (cmdk) {
      cmdk.addEventListener('click', (event) => {
        if (event.target === cmdk) closeCommandPalette();
      });
    }
    const lectio = id('lectio');
    if (lectio) {
      lectio.addEventListener('click', (event) => {
        if (event.target === lectio) closeLectio();
      });
    }
  }

  function syncCmdActive() {
    const list = id('cmdk-list');
    if (!list) return;
    Array.from(list.children).forEach((child, index) => {
      child.classList.toggle('active', index === cmdIndex);
    });
  }

  function bindHeroScroll() {
    const page = id('today-page');
    const hero = id('aff-card');
    if (!page || !hero) return;
    const onScroll = () => {
      const y = page.scrollTop;
      const fade = Math.max(0, 1 - y / 220);
      hero.style.setProperty('--hero-fade', String(fade));
      hero.classList.toggle('is-scrolled', y > 40);
    };
    page.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function celebratePractice() {
    const complete = id('practice-complete');
    if (!complete || complete.hidden) return;
    complete.classList.remove('ritual');
    // reflow
    void complete.offsetWidth;
    complete.classList.add('ritual');
    document.documentElement.classList.add('practice-done');
    setTimeout(() => document.documentElement.classList.remove('practice-done'), 1600);
  }

  function watchPracticeComplete() {
    const complete = id('practice-complete');
    if (!complete || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      if (!complete.hidden && complete.classList.contains('on')) celebratePractice();
    });
    observer.observe(complete, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }

  function onDailyRendered() {
    enhanceDailyReveal();
    bindHeroScroll();
  }

  function bootAtelier() {
    // Failsafe: never leave the void empty if boot race-hides both shells
    setTimeout(() => {
      const onboarding = document.getElementById('onboarding');
      const app = document.getElementById('app');
      const onboardingHidden = !onboarding || onboarding.classList.contains('hidden');
      const appHidden = !app || app.style.display === 'none' || getComputedStyle(app).display === 'none';
      if (onboardingHidden && appHidden && onboarding) {
        onboarding.classList.remove('hidden');
      }
    }, 120);
    setHourAtmosphere();
    setInterval(setHourAtmosphere, 10 * 60 * 1000);
    bindKeys();
    watchDailyContent();
    watchPracticeComplete();
    bindHeroScroll();
  }

  Object.assign(global, {
    openLectio,
    closeLectio,
    openLectioFromAff,
    openLectioFromWord,
    openCommandPalette,
    closeCommandPalette,
    revealWords,
    onDailyRendered,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAtelier, { once: true });
  } else {
    bootAtelier();
  }
})(window);
