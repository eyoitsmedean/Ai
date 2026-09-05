/* Quiet Chapel trust — citation lock, Amen ritual, Send a Blessing */
(function (global) {
  'use strict';

  const CITATION_RE =
    /\b((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\b/gi;

  let verseIndex = null;
  let verseList = [];
  let amenTimer = null;
  let lectioOpenedAt = 0;
  let blessingPick = null;

  function id(name) {
    return document.getElementById(name);
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeCitation(cite) {
    return String(cite || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[–—]/g, '-')
      .replace(/\s*-\s*/g, '-')
      .trim();
  }

  function citationKeys(cite) {
    const norm = normalizeCitation(cite);
    const keys = new Set([norm]);
    const match = norm.match(/^(matthew|mark|luke|john)\s+(\d+):(\d+)(?:[a-z])?(?:-(\d+)(?:[a-z])?)?$/i);
    if (match) {
      const book = match[1];
      const chapter = match[2];
      const start = Number(match[3]);
      const end = match[4] ? Number(match[4]) : start;
      keys.add(`${book} ${chapter}:${start}`);
      if (end !== start) keys.add(`${book} ${chapter}:${start}-${end}`);
      for (let verse = start; verse <= end; verse += 1) {
        keys.add(`${book} ${chapter}:${verse}`);
      }
    }
    return [...keys];
  }

  function normalizeQuote(quote) {
    return String(quote || '')
      .toLowerCase()
      .replace(/[“”"'`]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function quoteOverlap(a, b) {
    const left = normalizeQuote(a);
    const right = normalizeQuote(b);
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.includes(right) || right.includes(left)) {
      return Math.min(left.length, right.length) / Math.max(left.length, right.length);
    }
    const leftWords = new Set(left.split(' ').filter((w) => w.length > 3));
    const rightWords = right.split(' ').filter((w) => w.length > 3);
    if (!rightWords.length) return 0;
    let hits = 0;
    rightWords.forEach((word) => {
      if (leftWords.has(word)) hits += 1;
    });
    return hits / rightWords.length;
  }

  function buildIndex(corpus) {
    const byKey = new Map();
    const list = [];

    function register(verse, quote, theme) {
      if (!verse || !quote) return;
      const entry = {
        verse: String(verse).trim(),
        quote: String(quote).trim(),
        theme: theme || '',
      };
      list.push(entry);
      citationKeys(entry.verse).forEach((key) => {
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(entry);
      });
    }

    (corpus.verses || []).forEach((item) => register(item.verse, item.quote, item.theme));
    (corpus.daily || []).forEach((day) => {
      if (day.affirmation) register(day.affirmation.verse, day.affirmation.quote, day.word && day.word.theme);
      if (day.word) register(day.word.verse, day.word.passage, day.word.theme);
    });
    Object.values(corpus.encouragement || {}).forEach((pack) => {
      (pack.passages || []).forEach((passage) => register(passage.verse, passage.quote, pack.theme));
    });
    (corpus.library || []).forEach((item) => register(item.verse, item.quote, item.theme));

    // Dedupe list by verse+quote
    const seen = new Set();
    verseList = list.filter((item) => {
      const key = `${normalizeCitation(item.verse)}|${normalizeQuote(item.quote).slice(0, 80)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    verseIndex = byKey;
    return { index: byKey, list: verseList };
  }

  async function ensureIndex() {
    if (verseIndex) return verseIndex;
    try {
      const response = await fetch(
        typeof global.rlaUrl === 'function' ? global.rlaUrl('/data/corpus.json') : '/data/corpus.json',
        { cache: 'force-cache' }
      );
      const corpus = await response.json();
      buildIndex(corpus);
    } catch (_) {
      verseIndex = new Map();
      verseList = [];
    }
    return verseIndex;
  }

  function lookup(citation) {
    if (!verseIndex) return [];
    const found = [];
    citationKeys(citation).forEach((key) => {
      const matches = verseIndex.get(key);
      if (matches) found.push(...matches);
    });
    return found;
  }

  function verifyCitation(verse, quote) {
    const matches = lookup(verse);
    if (!matches.length) {
      return { verse, verified: false, reason: 'unknown-citation', match: null, score: 0 };
    }
    if (!quote) {
      return { verse, verified: true, reason: 'citation-known', match: matches[0], score: 0.7 };
    }
    let best = null;
    let bestScore = 0;
    matches.forEach((entry) => {
      const score = quoteOverlap(entry.quote, quote);
      if (!best || score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    if (bestScore >= 0.55) {
      return { verse, verified: true, reason: 'quote-match', match: best, score: bestScore };
    }
    return {
      verse,
      verified: false,
      reason: 'quote-mismatch',
      match: best,
      score: bestScore,
      expected: best ? best.quote : null,
    };
  }

  function extractBlocks(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const citationLine =
      /^\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\*\*\s*$/i;
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
      const line = lines[index].trim();
      const citation = line.match(citationLine);
      if (citation) {
        let next = index + 1;
        while (next < lines.length && !lines[next].trim()) next += 1;
        const quoteLine = next < lines.length ? lines[next].trim() : '';
        let quote = '';
        if (/^["“]/.test(quoteLine)) {
          quote = quoteLine.replace(/^["“]+/, '').replace(/["”]+\s*$/, '');
          index = next + 1;
        } else {
          index += 1;
        }
        blocks.push({ verse: citation[1], quote });
        continue;
      }
      index += 1;
    }

    // Also catch inline citations without block structure
    const inline = String(text || '').match(CITATION_RE) || [];
    inline.forEach((cite) => {
      if (!blocks.some((block) => normalizeCitation(block.verse) === normalizeCitation(cite))) {
        blocks.push({ verse: cite, quote: '' });
      }
    });
    return blocks;
  }

  async function verifyResponse(text) {
    await ensureIndex();
    const blocks = extractBlocks(text);
    const results = blocks.map((block) => verifyCitation(block.verse, block.quote));
    const verified = results.filter((item) => item.verified).length;
    return {
      total: results.length,
      verified,
      unverified: results.length - verified,
      results,
      allVerified: results.length > 0 && results.every((item) => item.verified),
    };
  }

  function annotateMessage(contentEl, report) {
    if (!contentEl || !report || !report.total) return;
    contentEl.querySelectorAll('.scripture-block').forEach((block) => {
      const verseEl = block.querySelector('.scripture-verse');
      const quoteEl = block.querySelector('.scripture-quote');
      if (!verseEl) return;
      const verse = verseEl.textContent.trim();
      const quote = quoteEl
        ? quoteEl.textContent.replace(/^["“]|["”]$/g, '').trim()
        : '';
      const result = report.results.find(
        (item) => normalizeCitation(item.verse) === normalizeCitation(verse)
      ) || verifyCitation(verse, quote);
      const seal = document.createElement('div');
      seal.className = result.verified ? 'trust-seal verified' : 'trust-seal caution';
      seal.textContent = result.verified ? 'Verified red letter' : 'Needs human check';
      seal.title = result.verified
        ? 'This citation matches our saved WEB red-letter index'
        : 'This citation was not confirmed against the local Gospel index — read carefully';
      block.appendChild(seal);
      if (!result.verified) block.classList.add('scripture-unverified');
      else block.classList.add('scripture-verified');
    });

    if (report.unverified > 0) {
      const note = document.createElement('div');
      note.className = 'trust-note';
      note.innerHTML =
        'One or more citations could not be confirmed against our saved red-letter index. Prefer the sealed passages above, or open Seek for verified readings.';
      contentEl.appendChild(note);
    } else if (report.verified > 0) {
      const note = document.createElement('div');
      note.className = 'trust-note ok';
      note.textContent =
        report.verified === 1
          ? 'Citation sealed against the local Gospel index.'
          : `${report.verified} citations sealed against the local Gospel index.`;
      contentEl.appendChild(note);
    }
  }

  async function sealAdvisorMessage(contentEl, text) {
    if (!contentEl) return null;
    const report = await verifyResponse(text);
    annotateMessage(contentEl, report);
    return report;
  }

  /* ── Amen ritual ─────────────────────────────────────────────── */

  function openAmen(opts = {}) {
    const root = id('amen');
    if (!root) return;
    const echo = id('amen-echo');
    const cite = id('amen-cite');
    const verse = typeof global.cleanCitation === 'function'
      ? global.cleanCitation(opts.verse)
      : String(opts.verse || '').replace(/^[—–\-\s]+/, '').trim();
    if (echo) {
      const quoteText = opts.quote
        ? String(opts.quote).replace(/^["“]|["”]$/g, '')
        : '';
      // Keep Amen still: one clear echo, no stacked word-reveal ghosts
      echo.textContent = quoteText ? `“${quoteText}”` : '';
      echo.hidden = !quoteText;
    }
    if (cite) {
      cite.textContent = verse || '';
      cite.hidden = !verse;
    }
    root.classList.add('on');
    root.setAttribute('aria-hidden', 'false');
    clearTimeout(amenTimer);
    amenTimer = setTimeout(closeAmen, opts.holdMs || 3200);
  }

  function closeAmen() {
    const root = id('amen');
    if (!root) return;
    root.classList.remove('on');
    root.setAttribute('aria-hidden', 'true');
    clearTimeout(amenTimer);
  }

  function amenFromLectio() {
    const quote = (id('lectio-quote') && id('lectio-quote').textContent) || '';
    const verse = typeof global.cleanCitation === 'function'
      ? global.cleanCitation(id('lectio-cite') && id('lectio-cite').textContent)
      : ((id('lectio-cite') && id('lectio-cite').textContent) || '');
    // Amen (z 420) rises over Lectio (z 400) first; Lectio leaves underneath
    // once Amen is opaque, so Today never flashes through.
    if (typeof global.stopListening === 'function') global.stopListening();
    openAmen({ quote, verse, holdMs: 3600 });
    setTimeout(() => {
      if (typeof global.closeLectio === 'function') global.closeLectio();
    }, 650);
  }

  function maybeAmenAfterLectio() {
    if (!lectioOpenedAt) return;
    const stayed = Date.now() - lectioOpenedAt;
    lectioOpenedAt = 0;
    if (stayed < 8000) return;
    const quote = (id('lectio-quote') && id('lectio-quote').textContent) || '';
    const verse = (id('lectio-cite') && id('lectio-cite').textContent) || '';
    openAmen({ quote: quote.slice(0, 160), verse, holdMs: 2600 });
  }

  function watchLectioForAmen() {
    const root = id('lectio');
    if (!root || typeof MutationObserver === 'undefined') return;
    new MutationObserver(() => {
      if (root.classList.contains('on')) {
        lectioOpenedAt = Date.now();
      } else if (lectioOpenedAt) {
        maybeAmenAfterLectio();
      }
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  function watchPracticeCompleteAmen() {
    const complete = id('practice-complete');
    if (!complete || typeof MutationObserver === 'undefined') return;
    let fired = '';
    new MutationObserver(() => {
      const today = typeof global.todayStr === 'function'
        ? global.todayStr()
        : (typeof global.localTodayStr === 'function' ? global.localTodayStr() : new Date().toISOString().slice(0, 10));
      if (!complete.hidden && complete.classList.contains('on') && fired !== today) {
        fired = today;
        const quote = (id('aff-quote') && id('aff-quote').textContent) || '';
        const verse = typeof global.cleanCitation === 'function'
          ? global.cleanCitation(id('aff-verse') && id('aff-verse').textContent)
          : ((id('aff-verse') && id('aff-verse').textContent) || '').replace(/^[—–\-\s]+/, '');
        setTimeout(() => openAmen({ quote, verse, holdMs: 3200 }), 600);
      }
    }).observe(complete, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }

  /* ── Send a Blessing ─────────────────────────────────────────── */

  async function openBlessing(seed) {
    await ensureIndex();
    const root = id('blessing-sheet');
    const overlay = id('overlay');
    if (!root) return;
    blessingPick = seed || null;
    renderBlessingList(seed);
    root.classList.add('on');
    root.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('on');
    const note = id('blessing-note');
    if (note) note.value = '';
    updateBlessingPreview();
  }

  function closeBlessing() {
    const root = id('blessing-sheet');
    const overlay = id('overlay');
    if (root) {
      root.classList.remove('on', 'open');
      root.setAttribute('aria-hidden', 'true');
    }
    const settings = id('settings-sheet');
    const plus = id('plus-sheet');
    const share = id('share-sheet');
    if (
      overlay &&
      (!settings || !settings.classList.contains('on')) &&
      (!plus || !plus.classList.contains('on')) &&
      (!share || !share.classList.contains('on'))
    ) {
      overlay.classList.remove('on');
    }
  }

  function renderBlessingList(seed) {
    const list = id('blessing-list');
    if (!list) return;
    const picks = verseList.slice(0, 24);
    if (seed && seed.verse && seed.quote) {
      const exists = picks.some(
        (item) =>
          normalizeCitation(item.verse) === normalizeCitation(seed.verse) &&
          normalizeQuote(item.quote) === normalizeQuote(seed.quote)
      );
      if (!exists) picks.unshift(seed);
      blessingPick = seed;
    } else if (!blessingPick && picks[0]) {
      blessingPick = picks[0];
    }

    list.innerHTML = picks
      .map((item, index) => {
        const selected =
          blessingPick &&
          normalizeCitation(blessingPick.verse) === normalizeCitation(item.verse) &&
          normalizeQuote(blessingPick.quote).slice(0, 40) === normalizeQuote(item.quote).slice(0, 40);
        const short = item.quote.length > 90 ? `${item.quote.slice(0, 90)}…` : item.quote;
        return `<button type="button" class="blessing-item${selected ? ' selected' : ''}" data-index="${index}">
          <span class="blessing-item-cite">${esc(item.verse)}</span>
          <span class="blessing-item-quote">“${esc(short)}”</span>
        </button>`;
      })
      .join('');

    // Selecting must not re-render (which would reorder and scroll the list).
    list.querySelectorAll('.blessing-item').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-index'));
        blessingPick = picks[index];
        list.querySelectorAll('.blessing-item').forEach((b) => b.classList.toggle('selected', b === button));
        updateBlessingPreview();
      });
    });
  }

  function updateBlessingPreview() {
    const preview = id('blessing-preview');
    if (!preview || !blessingPick) return;
    const note = (id('blessing-note') && id('blessing-note').value.trim()) || '';
    preview.innerHTML = [
      note ? `<div class="blessing-preview-note">${esc(note)}</div>` : '',
      `<div class="blessing-preview-quote">“${esc(blessingPick.quote)}”</div>`,
      `<div class="blessing-preview-cite">${esc(blessingPick.verse)}</div>`,
    ].join('');
  }

  async function sendBlessing(style = 'void') {
    if (!blessingPick) {
      if (typeof global.showToast === 'function') global.showToast('Choose a verse first');
      return;
    }
    const note = (id('blessing-note') && id('blessing-note').value.trim()) || 'A blessing for you';
    const payload = {
      quote: blessingPick.quote,
      verse: blessingPick.verse,
      theme: note,
      brand: 'Red Letter',
      style,
    };
    closeBlessing();
    const shareFn =
      (global.RedLetterShare && global.RedLetterShare.shareCard) ||
      global.shareCard;
    if (typeof shareFn === 'function') {
      try {
        const result = await shareFn(payload);
        if (typeof global.showToast === 'function') {
          if (result === 'aborted') global.showToast('Blessing kept here');
          else if (result === 'downloaded') global.showToast('Blessing card saved');
          else global.showToast('Blessing ready to send');
        }
      } catch (_) {
        if (typeof global.showToast === 'function') global.showToast('Could not share blessing');
      }
      return;
    }
    if (typeof global.openShareSheet === 'function') {
      global.__blessingPayload = payload;
      global.openShareSheet('blessing');
    }
  }

  function blessingFromToday() {
    const quote = (id('aff-quote') && id('aff-quote').textContent) || '';
    const verse = typeof global.cleanCitation === 'function'
      ? global.cleanCitation(id('aff-verse') && id('aff-verse').textContent)
      : ((id('aff-verse') && id('aff-verse').textContent) || '').replace(/^[—–\-\s]+/, '');
    openBlessing(quote && verse ? { quote, verse, theme: 'Today' } : null);
  }

  function bootTrust() {
    ensureIndex();
    watchLectioForAmen();
    watchPracticeCompleteAmen();

    const note = id('blessing-note');
    if (note) note.addEventListener('input', updateBlessingPreview);

    const amenRoot = id('amen');
    if (amenRoot) {
      amenRoot.addEventListener('click', closeAmen);
    }

    // Extend command palette if atelier already defined COMMANDS via openCommandPalette path
    if (typeof global.openCommandPalette === 'function') {
      // Soft patch: expose blessing in global API for cmdk consumers
    }
  }

  Object.assign(global, {
    RedLetterTrust: {
      ensureIndex,
      verifyResponse,
      verifyCitation,
      sealAdvisorMessage,
      getVerses: () => verseList.slice(),
    },
    openAmen,
    closeAmen,
    amenFromLectio,
    openBlessing,
    closeBlessing,
    sendBlessing,
    blessingFromToday,
    updateBlessingPreview,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTrust, { once: true });
  } else {
    bootTrust();
  }
})(window);
