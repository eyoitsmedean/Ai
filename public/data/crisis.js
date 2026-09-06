/* Human-help gate — one source of truth for the server (lib/scripture.js) and
   the page (public/index.html). Tuned against test/crisis.test.js: the
   sentences people actually type at 2 a.m. must trigger; ordinary grief,
   idiom, and theology must not. Over-triggering costs a gentle notice;
   missing costs more. */
(function (root) {
  const PATTERNS = [
    /\bsuicid/i,
    /\b(kill|killing|hurt|hurting|harm|harming|cut|cutting|hang|hanging|shoot|shooting|unalive|unaliving)\s+(myself|him|her|them|someone|somebody|people|my\s+\w+)\b/i,
    /\b(end|ending|take|taking)\s+(my|his|her|their)\s+(own\s+)?life\b/i,
    /\b(end|ending)\s+(it\s+all|things|everything)\b/i,
    /\b(want|wanna|wanted|wish|wishing)\s+(to\s+)?(die|be\s+dead)\b/i,
    /\bwish\s+i\s+(was|were|could\s+be)\s+dead\b/i,
    /\bself[-\s]?harm/i,
    /\boverdos/i,
    /\b(took|taken|taking|swallowed)\s+(too\s+many|a\s+bunch\s+of|a\s+lot\s+of|all\s+(of\s+)?(my|the)|the\s+whole\s+bottle\s+of)\s+\w*\s*(pills|tablets|medication|meds)\b/i,
    /\b(don'?t|do\s+not|dont)\s+want\s+to\s+(live|be\s+here|be\s+alive|wake\s+up|exist)\b/i,
    /\bbetter\s+off\s+(dead|without\s+me)\b/i,
    /\bno\s+reason\s+to\s+(live|go\s+on|keep\s+going)\b/i,
    /\b(isn'?t|is\s+not|not)\s+worth\s+living\b/i,
    /\b(going|gonna|about)\s+to\s+jump\b/i,
    /\b(hits|hit|beats|beat|chokes|choked|strangled|punches|punched|rapes|raped|abuses|abusing)\s+me\b/i,
    /\b(going|gonna|threatens?|threatened|said\s+he\s+will|said\s+she\s+will)\s+to\s+kill\s+me\b/i,
    /\bwill\s+kill\s+me\b/i,
  ];

  function looksLikeCrisis(text) {
    if (!text || typeof text !== 'string') return false;
    const s = text.replace(/[\u2018\u2019]/g, "'");
    return PATTERNS.some(function (re) { return re.test(s); });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRISIS_PATTERNS: PATTERNS, looksLikeCrisis: looksLikeCrisis };
  }
  if (root) root.RLA_looksLikeCrisis = looksLikeCrisis;
})(typeof window !== 'undefined' ? window : null);
