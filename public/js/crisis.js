/* Crisis detection & escalation — interrupt chat flow with real help */
(function (global) {
  const PATTERNS = [
    /\b(kill\s+(my|him|her|them|myself)|killing\s+myself)\b/i,
    /\b(suicid(e|al)|end\s+my\s+life|take\s+my\s+life)\b/i,
    /\b(want\s+to\s+die|wanna\s+die|going\s+to\s+die\s+by)\b/i,
    /\b(self[-\s]?harm|cut\s+myself|hurt\s+myself)\b/i,
    /\b(hang\s+myself|overdose\s+on|jump\s+off)\b/i,
    /\b(no\s+reason\s+to\s+live|better\s+off\s+dead|nobody\s+would\s+miss\s+me)\b/i,
  ];

  function detectCrisis(text) {
    const t = String(text || '');
    return PATTERNS.some((re) => re.test(t));
  }

  function ensureModal() {
    let el = document.getElementById('crisis-modal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'crisis-modal';
    el.className = 'crisis-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'crisis-title');
    el.innerHTML = `
      <div class="crisis-card">
        <div class="crisis-eyebrow">You are not alone</div>
        <h2 id="crisis-title">Please reach a person who can help right now</h2>
        <p class="crisis-body">If you are in crisis or thinking about harming yourself, this app is not the right place for that moment. Real people are ready to help — free and confidential.</p>
        <div class="crisis-actions">
          <a class="crisis-primary" href="tel:988">Call or text 988 (US)</a>
          <a class="crisis-secondary" href="https://988lifeline.org/" target="_blank" rel="noopener">988 Lifeline website</a>
          <a class="crisis-secondary" href="https://www.iasp.info/suicidalthoughts/" target="_blank" rel="noopener">Find help worldwide (IASP)</a>
        </div>
        <p class="crisis-note">If you are in immediate danger, call your local emergency number.</p>
        <div class="crisis-footer">
          <button type="button" class="crisis-dismiss" id="crisis-continue">I am safe — continue carefully</button>
          <button type="button" class="crisis-close" id="crisis-close">Close</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function showCrisisModal() {
    return new Promise((resolve) => {
      const el = ensureModal();
      el.classList.add('on');
      const finish = (action) => {
        el.classList.remove('on');
        resolve(action);
      };
      document.getElementById('crisis-continue').onclick = () => finish('continue');
      document.getElementById('crisis-close').onclick = () => finish('close');
    });
  }

  global.RedLetterCrisis = { detectCrisis, showCrisisModal };
})(window);
