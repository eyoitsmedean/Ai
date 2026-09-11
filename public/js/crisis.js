/* Crisis detection & escalation — interrupt chat flow with real help.
   Detection is shared with the server (safety-patterns.js) so the modal and
   the server's notice always agree. Kinds: 'crisis' (suicidality / self-harm),
   'assault' (sexual assault) and 'danger' (abuse, violence, threats); the
   modal shows suicide lines for 'crisis' and advocate lines for the other two. */
(function (global) {
  function detectKind(text) {
    const shared = global.RedLetterSafety;
    if (!shared || typeof shared.detectKind !== 'function') return null;
    return shared.detectKind(text);
  }

  function detectCrisis(text) {
    return detectKind(text) !== null;
  }

  // Numbers: 988 (US, CA), Samaritans 116 123 (UK & IE), Lifeline 13 11 14 (AU);
  // National Domestic Violence Hotline 1-800-799-7233 / text START to 88788
  // (verified 2026-09-06 at thehotline.org).
  const COPY = {
    crisis: {
      eyebrow: 'You are not alone',
      title: 'Please reach a person who can help right now',
      body: 'If you are in crisis or thinking about harming yourself, this app is not the right place for that moment. Real people are ready to help — free and confidential.',
      actions: `
          <a class="crisis-primary" href="tel:988">Call or text 988 (US)</a>
          <a class="crisis-secondary" href="https://988lifeline.org/" target="_blank" rel="noopener">988 Lifeline website</a>
          <a class="crisis-secondary" href="tel:988" data-region="ca">Call or text 9-8-8 (Canada)</a>
          <a class="crisis-secondary" href="tel:116123">Samaritans 116 123 (UK &amp; Ireland)</a>
          <a class="crisis-secondary" href="tel:131114">Lifeline 13 11 14 (Australia)</a>
          <a class="crisis-secondary" href="https://findahelpline.com/" target="_blank" rel="noopener">Find a helpline in your country</a>
          <a class="crisis-secondary" href="https://www.iasp.info/suicidalthoughts/" target="_blank" rel="noopener">IASP crisis centres worldwide</a>`,
      note: 'If you are in immediate danger, call your local emergency number.',
      continueLabel: 'I am safe — continue carefully',
    },
    danger: {
      eyebrow: 'This is not yours to endure',
      title: 'Please reach someone who can help you be safe',
      body: 'What you described sounds like someone is hurting you or threatening you. Nothing here will tell you to stay in danger. Trained advocates can talk through what is happening and what is possible — free, confidential, any hour.',
      actions: `
          <a class="crisis-primary" href="tel:18007997233">Call 1-800-799-7233 (US Domestic Violence Hotline)</a>
          <a class="crisis-secondary" href="sms:88788?&body=START">Text START to 88788 (US)</a>
          <a class="crisis-secondary" href="https://www.thehotline.org/" target="_blank" rel="noopener">Chat at thehotline.org</a>
          <a class="crisis-secondary" href="https://findahelpline.com/" target="_blank" rel="noopener">Find a helpline in your country</a>`,
      note: 'If you are in danger right now, call 911 or your local emergency number first. If someone watches your phone, clear this conversation afterwards.',
      continueLabel: 'I am safe right now — continue',
    },
    assault: {
      eyebrow: 'This was not your fault',
      title: 'Please reach someone who listens to survivors',
      body: 'What was done to you is not something you should have to carry alone. Trained advocates at the sexual assault hotline listen every hour of the day, at whatever pace you need — free and confidential. Nothing here will tell you to stay quiet or to pray as if it did not happen.',
      actions: `
          <a class="crisis-primary" href="tel:18006564673">Call 1-800-656-4673 (RAINN, US)</a>
          <a class="crisis-secondary" href="https://hotline.rainn.org/" target="_blank" rel="noopener">Chat at hotline.rainn.org</a>
          <a class="crisis-secondary" href="tel:18007997233">Call 1-800-799-7233 (US Domestic Violence Hotline)</a>
          <a class="crisis-secondary" href="https://findahelpline.com/" target="_blank" rel="noopener">Find a helpline in your country</a>`,
      note: 'If you are in danger right now, call 911 or your local emergency number first. If someone watches your phone, clear this conversation afterwards.',
      continueLabel: 'I am safe right now — continue',
    },
  };

  function ensureModal(kind) {
    const copy = COPY[kind] || COPY.crisis;
    let el = document.getElementById('crisis-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'crisis-modal';
      el.className = 'crisis-modal';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'crisis-title');
      el.setAttribute('aria-describedby', 'crisis-body');
      document.body.appendChild(el);
    }
    el.dataset.kind = kind;
    el.innerHTML = `
      <div class="crisis-card">
        <div class="crisis-eyebrow">${copy.eyebrow}</div>
        <h2 id="crisis-title">${copy.title}</h2>
        <p class="crisis-body" id="crisis-body">${copy.body}</p>
        <div class="crisis-actions">${copy.actions}
        </div>
        <p class="crisis-note">${copy.note}</p>
        <div class="crisis-footer">
          <button type="button" class="crisis-dismiss" id="crisis-continue">${copy.continueLabel}</button>
          <button type="button" class="crisis-close" id="crisis-close">Close</button>
        </div>
      </div>`;
    return el;
  }

  function showCrisisModal(kind) {
    return new Promise((resolve) => {
      const copyKind = kind === 'assault' ? 'assault' : (kind === 'danger' ? 'danger' : 'crisis');
      const el = ensureModal(copyKind);
      const opener = document.activeElement;
      const app = document.getElementById('app');
      if (app) app.inert = true;
      let settled = false;
      const focusables = () => [...el.querySelectorAll('a[href], button:not([disabled])')];
      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); finish('close'); return; }
        if (e.key !== 'Tab') return;
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      const finish = (action) => {
        if (settled) return;
        settled = true;
        document.removeEventListener('keydown', onKey, true);
        el.classList.remove('on');
        if (app) app.inert = false;
        if (opener && typeof opener.focus === 'function') {
          try { opener.focus({ preventScroll: true }); } catch (_) { /* detached */ }
        }
        resolve(action);
      };
      document.getElementById('crisis-continue').onclick = () => finish('continue');
      document.getElementById('crisis-close').onclick = () => finish('close');
      el.onclick = (e) => { if (e.target === el) finish('close'); };
      document.addEventListener('keydown', onKey, true);
      el.classList.add('on');
      // The element was re-rendered while its visibility transition was still
      // starting; focus only lands once it is actually shown, so it is placed
      // on the next frame and again after the transition has begun.
      const focusPrimary = () => {
        const primary = el.querySelector('.crisis-primary');
        if (primary && typeof primary.focus === 'function' && !settled) primary.focus();
      };
      requestAnimationFrame(focusPrimary);
      setTimeout(focusPrimary, 60);
      const card = el.querySelector('.crisis-card');
      if (card) card.scrollTop = 0;
    });
  }

  global.RedLetterCrisis = { detectCrisis, detectKind, showCrisisModal };
})(window);
