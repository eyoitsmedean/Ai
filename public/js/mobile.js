/* Mobile production — keyboard, install (iOS+Android), safe viewport, SW updates */
(function (global) {
  'use strict';

  function id(name) {
    return document.getElementById(name);
  }

  function isStandalone() {
    return (
      global.matchMedia('(display-mode: standalone)').matches ||
      global.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  function isIos() {
    const ua = global.navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (global.navigator.platform === 'MacIntel' && global.navigator.maxTouchPoints > 1);
  }

  function isAndroid() {
    return /Android/i.test(global.navigator.userAgent || '');
  }

  /* ── Soft keyboard: keep Advisor composer visible ─────────────── */

  let keyboardOpen = false;

  function applyKeyboardInset() {
    const vv = global.visualViewport;
    if (!vv) return;
    const inset = Math.max(0, global.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--keyboard-inset', `${inset}px`);
    document.body.classList.toggle('keyboard-open', inset > 80);
    keyboardOpen = inset > 80;

    const wrap = id('chat-input-wrap') || document.querySelector('.chat-input-wrap');
    if (wrap && keyboardOpen) {
      wrap.scrollIntoView({ block: 'end', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
    }
  }

  function setupKeyboardGuards() {
    if (!global.visualViewport) return;
    global.visualViewport.addEventListener('resize', applyKeyboardInset);
    global.visualViewport.addEventListener('scroll', applyKeyboardInset);

    document.addEventListener('focusin', (event) => {
      const tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        setTimeout(applyKeyboardInset, 50);
        setTimeout(applyKeyboardInset, 300);
      }
    });
    document.addEventListener('focusout', () => {
      setTimeout(applyKeyboardInset, 100);
    });
  }

  /* ── iOS / Android install education ──────────────────────────── */

  function openInstallHelp() {
    const sheet = id('install-sheet');
    const overlay = id('overlay');
    if (!sheet) return;
    const body = id('install-sheet-body');
    if (body) {
      if (isIos()) {
        body.innerHTML = [
          '<p>On iPhone or iPad:</p>',
          '<ol class="install-steps">',
          '<li>Tap the <strong>Share</strong> button in Safari</li>',
          '<li>Scroll and tap <strong>Add to Home Screen</strong></li>',
          '<li>Tap <strong>Add</strong> — Red Letter opens full-screen</li>',
          '</ol>',
          '<p class="install-note">Works best in Safari. Chrome on iOS cannot install PWAs the same way.</p>',
        ].join('');
      } else if (isAndroid()) {
        body.innerHTML = [
          '<p>On Android Chrome:</p>',
          '<ol class="install-steps">',
          '<li>Tap the menu (⋮)</li>',
          '<li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></li>',
          '<li>Confirm — Red Letter opens like an app</li>',
          '</ol>',
        ].join('');
      } else {
        body.innerHTML = '<p>Use your browser’s <strong>Install</strong> or <strong>Add to Home Screen</strong> option to keep Red Letter close.</p>';
      }
    }
    sheet.classList.add('on');
    sheet.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('on');
  }

  function closeInstallHelp() {
    const sheet = id('install-sheet');
    if (sheet) {
      sheet.classList.remove('on');
      sheet.setAttribute('aria-hidden', 'true');
    }
    const overlay = id('overlay');
    const settings = id('settings-sheet');
    const plus = id('plus-sheet');
    const share = id('share-sheet');
    const blessing = id('blessing-sheet');
    if (
      overlay &&
      (!settings || !settings.classList.contains('on')) &&
      (!plus || !plus.classList.contains('on')) &&
      (!share || !share.classList.contains('on')) &&
      (!blessing || !blessing.classList.contains('on'))
    ) {
      overlay.classList.remove('on');
    }
  }

  function setupInstallButton() {
    const button = id('install-btn');
    if (!button) return;

    if (isStandalone()) {
      button.hidden = true;
      return;
    }

    // Always offer a visible path on mobile (iOS has no beforeinstallprompt)
    if (isIos() || isAndroid()) {
      button.hidden = false;
      button.classList.add('visible', 'show');
      button.textContent = 'Add';
      button.setAttribute('aria-label', 'Add to Home Screen');
      button.title = 'Add to Home Screen';
    }

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const deferred = global.deferredInstallPrompt;
      if (deferred) {
        deferred.prompt();
        try {
          await deferred.userChoice;
        } catch (_) { /* ignore */ }
        global.deferredInstallPrompt = null;
        button.hidden = true;
        return;
      }
      openInstallHelp();
    });
  }

  /* ── Service worker update toast ──────────────────────────────── */

  function setupServiceWorkerUpdates() {
    if (!('serviceWorker' in navigator)) return;
    // First-ever install also fires controllerchange (clients.claim); only a
    // page that already had a controller is a real update.
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      if (document.body.dataset.swRefreshing) return;
      document.body.dataset.swRefreshing = '1';
      if (typeof global.showToast === 'function') {
        global.showToast('Update ready — refreshing');
      }
      setTimeout(() => global.location.reload(), 700);
    });

    navigator.serviceWorker.ready.then((reg) => {
      if (!reg) return;
      setInterval(() => {
        try { reg.update(); } catch (_) { /* ignore */ }
      }, 60 * 60 * 1000);
    });
  }

  /* ── Pause speech when backgrounded ───────────────────────────── */

  function setupSpeechLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && global.speechSynthesis) {
        try { global.speechSynthesis.cancel(); } catch (_) { /* ignore */ }
      }
    });
    global.addEventListener('pagehide', () => {
      if (global.speechSynthesis) {
        try { global.speechSynthesis.cancel(); } catch (_) { /* ignore */ }
      }
    });
  }

  /* ── Modal focus: inert the shell while a dialog is open ───────── */

  const MODAL_IDS = [
    'lectio', 'amen', 'cmdk', 'settings-sheet', 'plus-sheet',
    'share-sheet', 'blessing-sheet', 'install-sheet',
  ];
  let lastFocused = null;
  let shellInert = false;

  function isModalOpen(el) {
    return el.classList.contains('on') && el.getAttribute('aria-hidden') !== 'true';
  }

  function anyModalOpen() {
    return MODAL_IDS.some((name) => {
      const el = id(name);
      return el && isModalOpen(el);
    });
  }

  function focusFirstIn(el) {
    const target = el.querySelector(
      'input:not([type="hidden"]), textarea, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (target && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
    }
  }

  function syncModalState() {
    const open = anyModalOpen();
    const app = id('app');
    const onboarding = id('onboarding');
    if (open && !shellInert) {
      lastFocused = document.activeElement;
      shellInert = true;
      if (app) app.inert = true;
      if (onboarding) onboarding.inert = true;
      const active = MODAL_IDS.map(id).find((el) => el && isModalOpen(el));
      if (active && !active.contains(document.activeElement)) {
        setTimeout(() => focusFirstIn(active), 60);
      }
    } else if (!open && shellInert) {
      shellInert = false;
      if (app) app.inert = false;
      if (onboarding) onboarding.inert = false;
      if (lastFocused && typeof lastFocused.focus === 'function' && document.contains(lastFocused)) {
        try { lastFocused.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
      }
      lastFocused = null;
    }
  }

  function setupModalFocus() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(syncModalState);
    MODAL_IDS.forEach((name) => {
      const el = id(name);
      if (!el) return;
      el.setAttribute('aria-modal', 'true');
      observer.observe(el, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    });
  }

  /* ── Standalone class for CSS ─────────────────────────────────── */

  function markStandalone() {
    document.documentElement.classList.toggle('is-standalone', isStandalone());
    document.documentElement.classList.toggle('is-ios', isIos());
    document.documentElement.classList.toggle('is-android', isAndroid());
  }

  function bootMobile() {
    markStandalone();
    setupKeyboardGuards();
    setupInstallButton();
    setupServiceWorkerUpdates();
    setupSpeechLifecycle();
    setupModalFocus();
    applyKeyboardInset();
  }

  Object.assign(global, {
    openInstallHelp,
    closeInstallHelp,
    isStandalone,
    isIos,
    isAndroid,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootMobile, { once: true });
  } else {
    bootMobile();
  }
})(window);
