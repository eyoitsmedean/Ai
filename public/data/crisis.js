/* Human-help gate — one source of truth for the server (lib/scripture.js) and
   the page (public/index.html). Tuned against test/crisis.test.js, which pins
   the sentences people actually type at 2 a.m. (must trigger) and ordinary
   grief, idiom, Bible history, and "die to self" theology (must not).
   Over-triggering costs a gentle notice; missing costs more. English plus a
   thin Spanish layer; anything subtler is the live model's job. */
(function (root) {
  const SELF = '(?:my\\s*sel[fv]e?|myslef|me\\s+self)';
  const OTHERS = '(?:him|her|them|someone|somebody|people|everyone|everybody|my\\s+(?:kids?|children|baby|babies|son|daughter|wife|husband|family|mom|mother|dad|father|brother|sister|partner|girlfriend|boyfriend|ex))';
  const INTENT = '(?:want(?:s)?|wanna|gonna|going|about|plan(?:ning)?|tempted|need|have)\\s+(?:to\\s+)?';
  const ABUSER = '(?:he|she|they|my\\s+(?:husband|wife|boyfriend|girlfriend|partner|ex|stepdad|stepfather|stepmom|stepmother))';

  const PATTERNS = [
    /\bsu+i?c+i?d/i,
    /\bkms\b/i,
    /\bunaliv/i,
    /\bself[-\s]?harm/i,

    new RegExp('\\b(?:kill|killing|hurt|hurting|harm|harming|cut|cutting|hang|hanging|shoot|shooting|stab|stabbing|burn|burning|drown|drowning|poison|poisoning)\\s+' + SELF + '\\b(?!\\s+(?:off|out|from|laughing|up\\s+about))', 'i'),
    /\b(?:cut|cutting|burned|burnt|burning)\s+(?:myself\s+)?(?:again|on\s+purpose)\b/i,
    /\b(?:end|ending|take|taking)\s+(?:my|his|her|their)\s+(?:own\s+)?life\b/i,
    /\b(?:end|ending)\s+(?:it\s+all|it|things|everything)\b(?!\s+(?:with|there|here|on)\b)/i,
    /\b(?:want|wanna|wanted|wish|wishing)\s+(?:to\s+)?(?:die|be\s+dead)\b(?!\s+to\b)/i,
    /\bwish\s+i\s+(?:was|were|could\s+be|had\s+never\s+been)\s+(?:dead|born)\b/i,
    /\b(?:don'?t|do\s+not|dont)\s+(?:want|wanna)\s+(?:to\s+)?(?:live|be\s+alive|be\s+here|wake\s+up|exist)\b(?!\s+(?:in|like|with|a|an|the|this|that|for|under|without|there|at|on|by)\b)/i,
    /\b(?:not|never)\s+wake\s+up\s+(?:tomorrow|again|anymore)\b/i,
    /\btired\s+of\s+(?:being\s+alive|living|breathing)\b/i,
    /\bbetter\s+off\s+(?:dead|without\s+me|if\s+i\s+(?:was|were|wasn'?t|weren'?t)\s+(?:gone|dead|around|here))\b/i,
    /\bhappier\s+(?:without\s+me|if\s+i\s+(?:wasn'?t|weren'?t|was\s+not)\s+(?:around|here|alive))\b/i,
    /\bno\s+(?:reason|point)\s+(?:in\s+|to\s+)?(?:live|living|go\s+on|going\s+on|keep\s+going|keeping\s+going)\b/i,
    /\b(?:isn'?t|is\s+not|not|ain'?t)\s+worth\s+(?:living|it\s+anymore)\b/i,
    /\b(?:won'?t|will\s+not|not\s+going\s+to|don'?t\s+think\s+i(?:'ll|\s+will|\s+am\s+going\s+to|m\s+going\s+to)?)\s+be\s+(?:here|around|alive)\s+(?:much\s+longer|next\s+week|tomorrow|anymore|for\s+long)\b/i,
    /\btonight\s+is\s+the\s+night\b/i,
    /\bdisappear\s+(?:forever|for\s+good)\b/i,
    /\b(?:going|gonna|about|want|wanna)\s+to\s+jump\b(?!\s+(?:in|into\s+the\s+pool|for|at|on)\b)/i,
    /\b(?:gun|pistol|rifle|knife|blade|razor|rope)\s+(?:in\s+my\s+hand|to\s+my\s+head|to\s+my\s+wrist|in\s+my\s+mouth)\b/i,

    /\boverdos/i,
    /\bod'?e?d\b/i,
    /\b(?:took|taken|taking|swallowed)\s+(?:too\s+many|a\s+bunch\s+of|a\s+lot\s+of|a\s+handful\s+of|all\s+(?:of\s+)?(?:my|the)|the\s+(?:whole|entire)\s+bottle\s+of|\d{2,}\s*)\s*\w*\s*(?:pills|tablets|medication|meds|tylenol|advil|ibuprofen|xanax|oxy\w*|sleeping\s+pills)\b(?![^.!?]*\b(?:doctor|prescribed|as\s+directed|supposed\s+to|on\s+time|like\s+i'?m\s+supposed)\b)/i,
    /\b(?:took|swallowed)\s+the\s+(?:whole|entire)\s+bottle\b/i,
    /\b(?:drank|drink|drinking)\s+(?:a\s+bottle\s+of\s+|some\s+)?(?:bleach|antifreeze|poison)\b/i,

    new RegExp('\\b' + INTENT + '(?:kill|hurt|harm|strangle|smother|shoot|stab|choke|drown|poison)\\s+' + OTHERS + '\\b', 'i'),
    /\bshoot\s+up\s+(?:my|the|a)\s+(?:school|church|office|work|store|mall)\b/i,
    new RegExp('(?<!\\b(?:life|it|this|that|sermon|news|reality|truth|god|word|verse|song|music)\\s(?:really\\s|just\\s|always\\s)?)\\b(?:hits|hitting|beats|beating|chokes|choked|choking|strangles|strangled|strangling|punches|punched|punching|kicks|kicked|kicking|slaps|slapped|slapping|rapes|raped|abuses|abused|abusing|molests|molested)\\s+(?:me|my\\s+(?:mom|mother|dad|father|sister|brother|kids?|children|wife|husband|baby))\\b(?!\\s+(?:at|in)\\s+(?:chess|cards|checkers|basketball|a\\s+game))', 'i'),
    /\bthrew\s+me\s+(?:against|down|into|across)\b/i,
    /\bhands?\s+(?:around|on)\s+my\s+(?:throat|neck)\b/i,
    /\b(?:touches|touched)\s+me\s+(?:and\s+i\s+can'?t\s+tell|where|inappropriately|there|at\s+night|under)\b/i,
    new RegExp('\\b' + ABUSER + '\\s+(?:will|would|\'ll|\'d|is\\s+going\\s+to|says?\\s+(?:he|she)\\s*(?:\'ll|\\s+will|\\s+would)|said\\s+(?:he|she)\\s*(?:\'d|\\s+would|\\s+will)|threatens?\\s+to|threatened\\s+to|tried\\s+to|is\\s+trying\\s+to)\\s+kill\\s+me\\b', 'i'),
    /\b(?:i'?m|i\s+am)\s+(?:scared|afraid|terrified)\s+(?:he|she)\s+(?:will|is\s+going\s+to|might)\s+(?:kill|hurt)\s+me\b/i,

    /\bquiero\s+morir(?:me)?\b/i,
    /\bmatarme\b/i,
    /\bno\s+quiero\s+(?:vivir|seguir\s+viviendo)\b/i,
    /\bacabar\s+con\s+mi\s+vida\b/i,
    /\bme\s+(?:golpea|pega|maltrata)\b/i,
  ];

  function looksLikeCrisis(text) {
    if (!text || typeof text !== 'string') return false;
    const s = text.replace(/[\u2018\u2019\u00B4`]/g, "'").replace(/\u200b/g, '');
    return PATTERNS.some(function (re) { return re.test(s); });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CRISIS_PATTERNS: PATTERNS, looksLikeCrisis: looksLikeCrisis };
  }
  if (root) root.RLA_looksLikeCrisis = looksLikeCrisis;
})(typeof window !== 'undefined' ? window : null);
