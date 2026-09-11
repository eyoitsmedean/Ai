/* The letterpress — one engine for the Advisor when no model speaks.
   Runs in Node (server.js) and in the browser (GitHub Pages) unchanged.
   It holds only logic and cues. Sayings arrive hydrated from lib/curated.js, so
   this file never types Scripture. The server renders {{Book C:V}} placeholders
   that lib/scripture fills from the corpus; the page renders the same sayings
   from the generated curated data, which is checked against the corpus in test. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RLA_LETTERPRESS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LETTER_LENGTH = 2;

  var LOVED_ONE = '(mom|mum|mother|dad|father|husband|wife|son|daughter|baby|child|brother|sister|friend|grandm\\w*|grandf\\w*|grandp\\w*|dog|cat)';

  // Ordered by gravity: when a message names several needs, the heavier one is answered first.
  // Stems are word-initial ("anxi" hears anxious and anxiety) and bounded where a stem would
  // otherwise hear ordinary words (pain but not painting, still only as "be still").
  var NEED_CUES = [
    [new RegExp('\\b(grie[fv]|mourn|died|death\\b|dying(?! to)|funeral|widow|passed away|miss (him|her|them|you|my)|crying|miscarriage|stillborn|lost (my|our) ' + LOVED_ONE + ')', 'i'), 'Grief & Loss'],
    [/\b(afraid|fear(?!less)|scared|terror|terrif|frighten|dread(?!lock)|panic attack)/i, 'Fear'],
    [/\b(shame(?!less)|guilt(?!y pleasure)|ashamed|unworthy|worthless|disgust|messed up|sin(ned|ner|ning|s)?\b|failure|failing|not good enough|(not|don'?t|never|no longer) (feel )?worthy|hate myself|i hurt (him|her|them|someone|my))/i, 'Shame & Guilt'],
    [/\b(forgiv|resent|bitter(?!sweet)|grudg|hate (him|her|them)|let it go|let go of|betray|cheated on me|lied to me)/i, 'Forgiveness'],
    [/\b(lonel|alone|abandon|orphan\b|left me|no one|nobody|isolat|unseen\b|no friends)/i, 'Loneliness'],
    [/\b(pain(?!t)|suffer|sick(?!le)|illness|tribulation|hurt(s|ing)?\b|chronic\b|diagnos|cancer|hospital|surgery)/i, 'Suffering & Pain'],
    [/\b(doubt(?!less)|unbelief|have not seen|(lost|losing|lose|no|little|my|struggling with|questioning) faith|is god (even |really )?(there|real|listening)|feel nothing when i pray|pray(er|ing)? feels? empty|god is silent|heaven is silent|(angry|mad|furious) (at|with) god|far from god|why (does|would|did|is) god|where (is|was) god|god (let|allow|permit)|numb)/i, 'Faith & Doubt'],
    [/\b(fight|fought|conflict|marriage is|divorce|enem(y|ies)\b|argu(e|ed|ing|ment)|(angry|furious|mad) (at|with) (my|him|her|them)|not speaking|(my )?(best )?friend (betrayed|hurt|left|lied)|my (husband|wife|brother|sister|father|mother|friend|boss|son|daughter) (hates|hurt|left|lied|cheated|betrayed|yelled|screamed|won'?t (speak|talk|listen|forgive)|(never|always|keeps) (listens|calls|criticis|yell|scream|blam|ignor|put(s|ting) me down)))/i, 'Conflict & Relationships'],
    [/\b(anxi|worr|overwhelm|stress|panic|restless|can'?t sleep|cannot sleep|spiral|laid off|debt|bills|rent|can'?t afford|money)/i, 'Anxiety & Worry'],
    [/\b(purpose|direction|career|what should i do|meaning(?!ful)|which way|lost my (job|way)|feel lost|am lost|so lost|no direction|wandering)/i, 'Purpose & Direction'],
    [/\b((no|lost|losing|without|any|little) hope|hopeless|despair|give up\b|giving up|pointless|empty\b|keep going|can'?t go on|go on like this|drowning|dark place|no way out)/i, 'Hope'],
    [/\b(peace(?! out)|calm|be still|stillness|can'?t (be|sit) still|quiet my)/i, 'Peace'],
  ];

  var CRISIS_RE = /\b(suicid|kill(ing)? myself|(end|ending|take|taking) my (own )?life|want to die|wanna die|self[-\s]?harm|hurt(ing)? myself|cut(ting)? myself|hang(ing)? myself|overdos|don'?t want to (live|be here anymore|be alive)|do not want to (live|be here anymore|be alive)|better off dead|no reason to live|not worth living|no point (in )?living|wish i (was|were) dead|wish i (was|were)n'?t (here|alive))\b/i;

  var CRISIS_NOTICE = [
    'If you are in danger or thinking of ending your life, please stop here and get human help now.',
    'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
    'I am not a person, and this page is not emergency care.',
    '',
  ].join('\n');

  var GENERIC = {
    opening: 'I keep only the words He spoke. Here are two, set for this hour — not as an answer to every question, only as what I have.',
    closing: 'You can sit with one line. Nothing else is required of this hour.',
  };

  // Short names a reader or client will send ("Anxiety") and the rooms they name.
  var THEME_ALIASES = {
    anxiety: 'Anxiety & Worry',
    worry: 'Anxiety & Worry',
    grief: 'Grief & Loss',
    loss: 'Grief & Loss',
    shame: 'Shame & Guilt',
    guilt: 'Shame & Guilt',
    conflict: 'Conflict & Relationships',
    relationship: 'Conflict & Relationships',
    relationships: 'Conflict & Relationships',
    purpose: 'Purpose & Direction',
    direction: 'Purpose & Direction',
    faith: 'Faith & Doubt',
    doubt: 'Faith & Doubt',
    suffering: 'Suffering & Pain',
    pain: 'Suffering & Pain',
    lonely: 'Loneliness',
    loneliness: 'Loneliness',
    fear: 'Fear',
    peace: 'Peace',
    hope: 'Hope',
    forgiveness: 'Forgiveness',
    forgive: 'Forgiveness',
  };

  function resolveTheme(name, known) {
    var raw = String(name || '').trim();
    if (!raw) return '';
    var list = known && known.length ? known : [];
    if (list.indexOf(raw) !== -1) return raw;
    var lower = raw.toLowerCase();
    var i;
    for (i = 0; i < list.length; i++) if (list[i].toLowerCase() === lower) return list[i];
    if (THEME_ALIASES[lower] && (!list.length || list.indexOf(THEME_ALIASES[lower]) !== -1)) return THEME_ALIASES[lower];
    if (lower.length >= 4) {
      for (i = 0; i < list.length; i++) {
        var first = list[i].toLowerCase().split(/[\s&]+/)[0];
        if (first === lower) return list[i];
      }
    }
    return '';
  }

  // Read when the writer has stayed on one need past the sentences kept for it.
  var CONTINUING = {
    opening: 'You have stayed with this. Here is more of what He said, still for what you named.',
  };

  // Read when every sentence kept for this correspondence has already been sent.
  var EXHAUSTED = {
    opening: 'I have given you every sentence I hold for this. One of them is worth hearing again.',
    closing: 'A line can be read again. You do not have to find a new one.',
  };

  var BOOKS = { matthew: 'Matthew', matt: 'Matthew', mt: 'Matthew', mark: 'Mark', mk: 'Mark', mrk: 'Mark', luke: 'Luke', lk: 'Luke', luk: 'Luke', john: 'John', jn: 'John', jhn: 'John' };
  var REF_RE = /\b(Matthew|Matt|Mt|Mark|Mk|Mrk|Luke|Lk|Luk|John|Jn|Jhn)\.?\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[–—-]\s*(\d{1,3}))?/gi;

  function parseRefs(text) {
    var out = [];
    var m;
    var re = new RegExp(REF_RE.source, 'gi');
    while ((m = re.exec(String(text || '')))) {
      var book = BOOKS[m[1].toLowerCase()];
      var start = Number(m[3]);
      var end = m[4] ? Number(m[4]) : start;
      if (!book || end < start) continue;
      out.push({ book: book, chapter: Number(m[2]), start: start, end: end });
    }
    return out;
  }

  function overlaps(a, b) {
    var ra = parseRefs(a)[0];
    var rb = parseRefs(b)[0];
    if (!ra || !rb) return false;
    return ra.book === rb.book && ra.chapter === rb.chapter && ra.start <= rb.end && ra.end >= rb.start;
  }

  function looksLikeCrisis(text) {
    var raw = String(text || '');
    if (!raw) return false;
    // Accidents are not a crisis. "I cut myself again last night" still is.
    if (/\bcut(ting)? myself (shaving|cooking|chopping|slicing|on (a |the )?(knife|glass|paper|can|lid))\b/i.test(raw)) return false;
    return CRISIS_RE.test(raw);
  }

  function guessThemes(text, known) {
    var hits = [];
    var raw = String(text || '');
    for (var i = 0; i < NEED_CUES.length; i++) {
      var theme = NEED_CUES[i][1];
      if (NEED_CUES[i][0].test(raw) && hits.indexOf(theme) === -1) {
        if (!known || known.indexOf(theme) !== -1) hits.push(theme);
      }
    }
    return hits;
  }

  function citedBefore(history) {
    var seen = [];
    for (var i = 0; i < (history || []).length; i++) {
      var m = history[i];
      if (!m || m.role !== 'assistant' || typeof m.content !== 'string') continue;
      var refs = parseRefs(m.content);
      for (var j = 0; j < refs.length; j++) {
        var r = refs[j];
        seen.push(r.book + ' ' + r.chapter + ':' + r.start + (r.end !== r.start ? '-' + r.end : ''));
      }
    }
    return seen;
  }

  function packSayings(pack) {
    if (!pack) return [];
    return (pack.passages || []).concat(pack.more || []);
  }

  /* packs:   { 'Theme': { opening, closing, passages: [{verse, quote, context}], more: [...] } }
     commons: [{verse, quote, context}]
     history: [{ role, content }] — earlier turns of this correspondence */
  function composeLetter(text, opts) {
    opts = opts || {};
    var packs = opts.packs || {};
    var commons = opts.commons || [];
    var history = Array.isArray(opts.history) ? opts.history : [];
    var raw = String(text || '').trim();
    var themes = guessThemes(raw, Object.keys(packs));
    var primary = themes[0] || null;
    var used = citedBefore(history);
    var chosen = [];

    function add(candidate) {
      if (chosen.length >= LETTER_LENGTH) return;
      if (!candidate || !candidate.verse) return;
      for (var i = 0; i < used.length; i++) if (overlaps(used[i], candidate.verse)) return;
      for (var j = 0; j < chosen.length; j++) if (overlaps(chosen[j].verse, candidate.verse)) return;
      chosen.push({ verse: candidate.verse, quote: candidate.quote || '', context: candidate.context || '' });
    }

    for (var t = 0; t < themes.length; t++) {
      var sayings = packSayings(packs[themes[t]]);
      for (var s = 0; s < sayings.length; s++) add(sayings[s]);
      if (chosen.length >= LETTER_LENGTH) break;
    }
    for (var c = 0; c < commons.length; c++) add(commons[c]);

    // A room's opening names its first sentences, so it is read only the first time in that room.
    // A crisis notice may stand before the letter; look past it.
    var firstTimeHere = Boolean(primary) && !history.some(function (m) {
      if (!m || m.role !== 'assistant' || typeof m.content !== 'string') return false;
      var content = m.content.indexOf(CRISIS_NOTICE) === 0 ? m.content.slice(CRISIS_NOTICE.length) : m.content;
      return content.indexOf(packs[primary].opening) === 0;
    });

    var opening;
    var closing;
    var exhausted = false;
    if (!chosen.length) {
      exhausted = true;
      var gentlest = commons[0] || packSayings(packs[primary])[0];
      if (gentlest) chosen.push({ verse: gentlest.verse, quote: gentlest.quote || '', context: gentlest.context || '' });
      opening = EXHAUSTED.opening;
      closing = EXHAUSTED.closing;
    } else if (firstTimeHere) {
      opening = packs[primary].opening;
      closing = packs[primary].closing;
    } else if (primary) {
      opening = CONTINUING.opening;
      closing = packs[primary].closing;
    } else {
      opening = GENERIC.opening;
      closing = GENERIC.closing;
    }

    return {
      theme: primary,
      themes: themes,
      exhausted: exhausted,
      citations: chosen.map(function (p) { return p.verse; }),
      passages: chosen,
      opening: opening,
      closing: closing,
    };
  }

  /* placeholders: true → {{Book C:V}} for lib/scripture to fill from the corpus.
     placeholders: false → the hydrated quote text carried by the passage. */
  function renderLetter(letter, opts) {
    opts = opts || {};
    var body = letter.passages.map(function (p) {
      var head = opts.placeholders ? '{{' + p.verse + '}}' : '**' + p.verse + '**\n“' + p.quote + '”';
      return head + '\n' + p.context;
    }).join('\n\n');
    return letter.opening + '\n\n' + body + '\n\n' + letter.closing;
  }

  return {
    CRISIS_NOTICE: CRISIS_NOTICE,
    GENERIC: GENERIC,
    NEED_CUES: NEED_CUES,
    citedBefore: citedBefore,
    composeLetter: composeLetter,
    guessThemes: guessThemes,
    looksLikeCrisis: looksLikeCrisis,
    renderLetter: renderLetter,
    resolveTheme: resolveTheme,
  };
});
