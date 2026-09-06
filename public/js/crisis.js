/* Crisis detection & escalation — interrupt chat flow with real help.
   Two kinds: 'crisis' (suicidality / self-harm) and 'danger' (abuse, violence,
   immediate physical danger). Stems carry a leading boundary only so
   inflections match ("suicidal", "overdosing"); apostrophes are optional. */
(function (global) {
  const CRISIS_PATTERNS = [
    /\b(kill(ing)?\s+(my|him|her|them)self|killing\s+myself)/i,
    /\b(suicid|end(ing)?\s+my\s+life|tak(e|ing)\s+my\s+(own\s+)?life)/i,
    /\b(want\s+to\s+die|wanna\s+die|going\s+to\s+die\s+by|not\s+worth\s+living|end\s+it\s+all)/i,
    /\b(self[-\s]?harm|cut(ting)?\s+myself|hurt(ing)?\s+myself)/i,
    /\b(hang(ing)?\s+myself|overdos|jump\s+off)/i,
    /\b(no\s+reason\s+to\s+live|better\s+off\s+dead|nobody\s+would\s+miss\s+me)/i,
    /\b(don[’']?t\s+want\s+to\s+(live|be\s+here|be\s+alive|wake\s+up)|do\s+not\s+want\s+to\s+live)/i,
  ];

  const DANGER_PATTERNS = [
    /\b(he|she|they|my\s+\w+)\s+(hit|hits|beat|beats|choke[sd]?|strangle[sd]?|punche[sd]|slap(s|ped)?|threaten(s|ed)?\s+to\s+(kill|hurt))\s+(me|us|him|her|them|the\s+kids|my\s+(little\s+|younger\s+|older\s+|baby\s+)?(kids|children|son|daughter|brother|sister|sibling|mom|mother|wife|husband|partner|girlfriend|boyfriend))/i,
    /\babus(ive|ing|es|ed)\s+(me|us|husband|wife|partner|boyfriend|girlfriend|relationship|father|mother|dad|mom|home)/i,
    /\bdomestic\s+violence\b/i,
    /\b(not|never)\s+safe\s+(at\s+home|with\s+(him|her|them))/i,
    /\bafraid\s+(of|for\s+my\s+life\s+around)\s+my\s+(husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|stepdad|stepfather)/i,
    /\b(rape[ds]?|molest(ed|ing)?|sexual(ly)?\s+assault(ed)?)\b/i,
    /\b(going\s+to\s+(kill|hurt)\s+me|threatening\s+(me|my\s+life)|hurts?\s+me\s+when\s+(he|she)|scared\s+(he|she)\s+will\s+(hurt|kill)\s+me)\b/i,
  ];

  function detectKind(text) {
    const t = String(text || '');
    if (CRISIS_PATTERNS.some((re) => re.test(t))) return 'crisis';
    if (DANGER_PATTERNS.some((re) => re.test(t))) return 'danger';
    return null;
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
      document.body.appendChild(el);
    }
    el.dataset.kind = kind;
    el.innerHTML = `
      <div class="crisis-card">
        <div class="crisis-eyebrow">${copy.eyebrow}</div>
        <h2 id="crisis-title">${copy.title}</h2>
        <p class="crisis-body">${copy.body}</p>
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
      const el = ensureModal(kind === 'danger' ? 'danger' : 'crisis');
      el.classList.add('on');
      const finish = (action) => {
        el.classList.remove('on');
        resolve(action);
      };
      document.getElementById('crisis-continue').onclick = () => finish('continue');
      document.getElementById('crisis-close').onclick = () => finish('close');
      const primary = el.querySelector('.crisis-primary');
      if (primary && typeof primary.focus === 'function') primary.focus();
    });
  }

  global.RedLetterCrisis = { detectCrisis, detectKind, showCrisisModal };
})(window);
