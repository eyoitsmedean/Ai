/* Signals — the one copy of what the Advisor listens for before it answers.
   Self-harm, poisoning, violence (received or feared from oneself), and bereavement.

   Loaded by the page (window.RLA_SIGNALS), by the static composer (advisor.js), and
   required by lib/scripture.js on the server, so there is nothing to keep in step.
   No lookbehind: this runs on phones. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RLA_SIGNALS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Words people reach for when they do not want the filter to hear them:
  // zero-width joiners, letters spaced or dotted apart, leetspeak. Detection runs on
  // the text as written and on this folded copy; nothing folded is ever shown.
  function fold(text) {
    var t = String(text || '');
    t = t.replace(/[\u200b-\u200d\u2060\ufeff\u00ad]/g, '');
    t = t.replace(/\b(?:[a-z][ .\/\-*_]){2,}[a-z]\b/gi, function (m) { return m.replace(/[ .\/\-*_]/g, ''); });
    t = t.replace(/\b([a-z]+)[.\/*_]([a-z]{2,})\b/gi, '$1$2');
    for (var pass = 0; pass < 2; pass++) {
      t = t.replace(/([a-z])[1!|]([a-z])/gi, '$1i$2');
      t = t.replace(/([a-z])3(?=[a-z]|\b)/gi, '$1e');
      t = t.replace(/([a-z])0([a-z])/gi, '$1o$2');
      t = t.replace(/([a-z])@([a-z])/gi, '$1a$2');
      t = t.replace(/([a-z])\$([a-z])/gi, '$1s$2');
    }
    return t;
  }

  var CRISIS_RE = /\b(?:suicid\w*|sucid\w*|suicd\w*|unaliv\w*|sewer\s?slide|kms|kys|kill(?:ing|ed)?\s+(?:my|him|her|your|them|our)\s*s(?:el|le)\w{0,4}|end(?:ed|ing)?\s+(?:my|his|her|their|your)\s+(?:own\s+)?life|tak(?:e|ing|en)\s+(?:my|his|her|their)\s+(?:own\s+)?life(?!\s+as)|want(?:s|ing|ed)?\s+(?:to|2)\s+(?:die|be\s+dead)(?!\s+(?:on\s+this\s+hill|of\s+(?:embarrassment|shame|laugh\w*|boredom|cringe)|laughing))|wanna\s+(?:die|be\s+dead)|ready\s+to\s+die(?!\s+(?:of|from)\s+(?:embarrassment|shame|laugh\w*|boredom|cringe))|wish(?:es|ed|ing)?\s+(?:i|he|she)\s+(?:was|were)\s+(?:dead|never\s+born)|rather\s+be\s+dead|wish\s+i\s+(?:had\s+)?never\s+(?:been\s+)?born|self[-\s]?harm\w*|hurt(?:ing)?\s+myself|cut(?:ting)?\s+(?:my|him|her|them|your)\s*sel(?:f|ves)|cutting\s+again|hang(?:ing)?\s+myself|shoot(?:ing)?\s+myself|(?:slit|cut)(?:ting)?\s+my\s+wrists?|(?:to|gonna|planning\s+to|going\s+to)\s+od\b|(?:going|gonna|want|wanna|about|plan|planning)\s+to\s+(?:take|swallow)\s+(?:all|every|the\s+whole|a\s+bottle)|(?:take|taking|swallow|swallowing)\s+(?:the|a|an|my)\s+(?:whole|entire)\s+bottle(?!\s+of\s+(?:wine|beer|water|champagne|whiskey|whisky|vodka|tequila|rum|gin|soda|kombucha))|jump(?:ing)?\s+(?:off|from)\s+(?:a|the)\s+(?:bridge|building|roof)|drive\s+into\s+a\s+wall|noose|bought\s+a\s+rope|gun\s+in\s+my\s+hand|have\s+the\s+means|(?:pills|rope|gun|blade|razor)\s+ready|(?:way|ways|how)\s+to\s+die|how\s+i\s+would\s+do\s+it|painless\s+way|goodbye\s+everyone|my\s+last\s+message|suicide\s+note|written\s+my\s+note|tell\s+my\s+(?:kids|children|family|wife|husband|mom|dad)\s+i\s+loved\s+them|(?:want|wanna|going|gonna|ready|about|decided|plan|planning|need)\s+to\s+end\s+(?:it|things|everything|myself)(?!\s+with)|(?:think|thinking|thought)\s+(?:about|of)\s+ending\s+(?:it|things|everything|myself|my\s+life)|imma\s+end\s+it|end(?:ing)?\s+it\s+(?:all|tonight|soon)|end(?:ing)?\s+myself|(?:don'?t|do\s+not|dont|doesn'?t|does\s+not)\s+(?:want\s+to|wanna)\s+(?:live|exist|be\s+alive|wake\s+up)|(?:don'?t|do\s+not|dont|doesn'?t|does\s+not)\s+(?:want\s+to|wanna)\s+be\s+here\s+anymore|(?:think|thinking|thought)\s+about\s+not\s+being\s+here(?!\s+(?:for|at|when|on|during|next))|(?:don'?t|do\s+not|can'?t|cannot)\s+see\s+a\s+future\s+for\s+myself|(?:hope|hoping|wish|wishing|pray|praying)\s+(?:that\s+)?i\s+(?:don'?t|do\s+not|won'?t|will\s+not|never)\s+wake\s+up|(?:sleep|asleep)\s+and\s+(?:not|never)\s+wake\s+up|sleep\s+forever|disappear\s+forever|want(?:s|ed)?\s+to\s+(?:just\s+)?disappear(?!\s+(?:for\s+a|into|to\s+a|on\s+vacation|for\s+the\s+weekend|from\s+social|off\s+the\s+grid))|stop\s+existing|better\s+off\s+dead|better\s+off\s+without\s+me|miss\s+me\s+if\s+i\s+(?:was|were)\s+gone|happier\s+(?:if|when)\s+i(?:'?m|\s+was|\s+am)\s+gone|happier\s+if\s+i\s+(?:wasn'?t|weren'?t|was\s+not|were\s+not)\s+(?:around|here|alive|born)|i(?:'?m|\s+am)\s+(?:such\s+)?a\s+burden|no\s+reason\s+to\s+live|not\s+worth\s+living|life\s+(?:isn'?t|is\s+not|ain'?t)\s+worth|(?:don'?t|do\s+not)\s+deserve\s+to\s+live|no\s+point\s+(?:in\s+)?(?:going\s+on|living|being\s+alive)|can'?t\s+go\s+on(?:\s+anymore)?|can'?t\s+do\s+this\s+anymore|(?:won'?t|not\s+going\s+to|not\s+gonna)\s+be\s+here\s+tomorrow|i\s+(?:want|wanna|need)\s+to\s+go\s+home\s+to\s+jesus|(?:have|got|made)\s+a\s+plan\s+and\s+a\s+date|giving\s+away\s+my\s+(?:things|stuff|belongings|possessions)|saying\s+goodbye\s+to\s+(?:people|everyone|my\s+friends)|starving\s+myself|no\s+quiero\s+vivir|quiero\s+morir\w*|matarme|suicidarme|acabar\s+con\s+(?:mi\s+vida|todo)|je\s+veux\s+mourir|me\s+tuer|ich\s+will\s+sterben|mich\s+umbringen|quero\s+morrer|me\s+matar)\b/i;

  // Something has been taken. Past tense only: "I take all my meds at night" is a routine.
  var SUBSTANCE = 'pills?|tablets?|capsules?|paracetamol|tylenol|acetaminophen|ibuprofen|advil|aspirin|xanax|ambien|oxy\\w*|vicodin|percocet|benadryl|insulin|meds|medication|medicine|prescription|antidepressants?|sleeping\\s+pills|blood\\s+pressure\\s+(?:meds|pills)|heart\\s+pills';
  var POISON_RE = new RegExp(
    '\\b(?:overdos\\w*|od\'?d\\b|too\\s+many\\s+pills' +
    '|(?:took|taken|swallowed|ate|drank|downed|popped)\\s+(?:\\d{2,}|a\\s+(?:handful|bunch|lot|bottle|box|pack|packet|strip)\\s+of|all\\s+(?:of\\s+)?(?:my|his|her|the|our)|every|(?:the|a|an|my)\\s+(?:whole|entire|full)\\s+bottle(?:\\s+of)?|way\\s+more\\s+than\\s+i\\s+should|too\\s+much\\s+of\\s+my)(?:\\s+[\\w\'’]+){0,3}?\\s+(?:' + SUBSTANCE + ')\\b' +
    '|(?:took|swallowed|drank|ate)\\s+(?:some\\s+|the\\s+|a\\s+lot\\s+of\\s+|a\\s+bunch\\s+of\\s+|a\\s+handful\\s+of\\s+|a\\s+bottle\\s+of\\s+|a\\s+cup\\s+of\\s+)?(?:bleach|antifreeze|rat\\s+poison|drain\\s+cleaner|lighter\\s+fluid|pesticide|weed\\s+killer)' +
    '|(?:whole|entire)\\s+bottle\\s+of\\s+(?:' + SUBSTANCE + '|my\\s+(?:meds|medication|medicine|pills|prescription))' +
    '|poison(?:ed|ing)?\\s+myself)\\b', 'i');
  // The overdose was someone else's, or long ago. Removed from the text before the
  // poisoning check, so "my son overdosed last year and tonight I took all my pills" still counts.
  var POISON_NOT_ME_RE = /\b(?:died\s+(?:of|from|after)\s+(?:an?\s+)?(?:overdose|od)|(?:his|her|their|\w+'s)\s+(?:overdose|od)\b|overdos(?:ed|e)\s+and\s+died|(?:he|she|they|my\s+(?:\w+\s+)?\w+)\s+(?:overdosed|od'?d)\b|(?:overdose|overdosed|od'?d)\s+(?:\w+\s+){0,3}?(?:years?|months?|weeks?)\s+ago|(?:years?|months?|weeks?|a\s+while|long)\s+ago\s+i\s+(?:overdosed|took))\b/gi;

  // Objects that make "hit my …" or "kill my …" an idiom, a sport, or a body part.
  var NOT_A_PERSON = 'head|knee|elbow|hand|foot|toe|leg|arm|shin|thumb|finger|chest|back|knees?|liver|voice|snooze|stride|limit|goal|goals|target|quota|peak|mark|record|best|pb|personal\\s+best|numbers|deadline|shot|serve|drive|putt|high\\s+score|addiction|depression|cancer|anxiety|demons|fear|illness|diagnosis|own|wall|desk|pillow|punching\\s+bag|bag|drum|drums|ball|brakes|gym|sourdough|starter|plants?|houseplants?|lawn|garden|phone|laptop|car|time|career|chances|vibe|buzz|appetite|business|brand|character|darlings|ego|pride|momentum|streak|progress|gains|batter(?:y|ies)|productivity|weekend|evening|day|night|morning|sleep|schedule|budget|diet|savings|credit|feelings|reputation|grades?|gpa|social\\s+life|way|stride|flow|groove';
  var PERSON = 'wife|husband|girlfriend|boyfriend|partner|spouse|kids?|son|daughter|child|children|toddler|teenager|baby|mom|mother|dad|father|sister|brother';

  // The person writing is the one who hit, or is frightened they will.
  var BY_YOU_RE = new RegExp(
    '\\b(?:allowed\\s+to\\s+(?:beat|hit|hurt|spank)' +
    '|i\\s+(?:hit|beat|slapped|punched|choked|strangled|shook|kicked|smacked|shoved|bit|burned)\\s+(?:my\\s+(?!(?:' + NOT_A_PERSON + ')\\b)\\w+|him|her|them)\\b(?!\\s+(?:at|in|to|by|up)\\b)' +
    '|i\\s+pushed\\s+(?:him|her|my\\s+(?:' + PERSON + '))\\b(?!\\s+(?:to|toward|towards|into\\s+(?:a|the|going|taking|doing|trying|applying|it)|hard\\s+(?:in|at|to|academically)|too\\s+hard|away|harder|further|past|beyond|in\\s+(?:her|his)\\s+(?:career|studies)))' +
    '|i\\s+grabbed\\s+(?:my\\s+\\w+|him|her)\\s+(?:by\\s+the\\s+(?:throat|neck|hair|arm|wrist|collar|shoulders)|so\\s+hard|and\\s+(?:shook|squeezed))|grabbed\\s+(?:her|his)\\s+(?:arm|wrist|hair|neck|throat)\\s+so\\s+hard' +
    '|i\\s+threw\\s+(?:\\w+\\s+){1,3}?at\\s+(?:my\\s+(?:' + PERSON + ')|him|her)\\b' +
    '|i\\s+(?:burned|burnt|bruised|scalded)\\s+my\\s+(?:' + PERSON + ')' +
    '|i\\s+locked\\s+my\\s+(?:' + PERSON + ')\\s+in' +
    '|put\\s+my\\s+hands\\s+on\\s+(?:my\\s+(?:' + PERSON + ')|him|her)' +
    '|my\\s+hands\\s+around\\s+(?:her|his)\\s+(?:neck|throat)' +
    '|(?:leaving|left)\\s+(?:bruises|marks)\\s+on\\s+(?:my|him|her)' +
    '|(?:it|things|i)\\s+(?:gets|got|get|turned|turns)\\s+physical' +
    '|(?:want|wanna|wanted|going|gonna|about|tempted|urge|urges)\\s+to\\s+(?:hit|beat|hurt|kill|strangle|choke|shake|smack)\\s+(?:my\\s+(?!(?:' + NOT_A_PERSON + ')\\b)|him|her|them|the\\s+baby|our\\s+baby)\\b(?!\\s+(?:at|in)\\b)' +
    '|(?:scared|afraid|worried|terrified|frightened)\\s+(?:that\\s+)?(?:i(?:\'?m|\\s+am)\\s+(?:going\\s+to|gonna)|i(?:\'ll|\\s+will|\\s+might|\\s+could))\\s+(?:hurt|hit|kill|shake|snap\\s+and\\s+hurt|lose\\s+it\\s+and\\s+hurt)\\s+(?:my|him|her|them|the\\s+baby|someone)' +
    '|afraid\\s+(?:of\\s+)?what\\s+i(?:\'ll|\\s+will|\\s+might|\\s+could|\\s+would)\\s+do(?:\\s+to\\s+(?:my|him|her|them|someone|the\\s+baby))?)\\b', 'i');

  // Someone is being hurt, or is not safe at home — or is the one hurting.
  var NOT_A_BLOW = 'up|at|in|to|by|hard|like|that|how|when|with\\s+(?:the|a|some|his|her)\\s+(?:news|question|idea|truth|fact|reality|bill|story|request)';
  var DANGER_RE = new RegExp(
    '\\b(?:he|she|they|my\\s+(?:dad|father|mom|mother|husband|wife|partner|boyfriend|girlfriend|stepdad|stepfather|stepmom|stepmother|brother|sister|son|daughter|uncle|ex|roommate))\\s+(?:' +
      '(?:hit|hits|beat|beats|punched|punches|choked|chokes|strangled|kicked|kicks|slapped|slaps|shoved|shoves|slammed|grabbed|grabs|burned|burns|bit|bites)\\s+(?:me|us|my\\s+(?:mom|mother|kids?|child|children|daughter|son|sister|brother)|the\\s+(?:kids|children|baby|dog))\\b(?!\\s+(?:' + NOT_A_BLOW + ')\\b)' +
      '|pushed\\s+me\\b(?!\\s+(?:to|toward|towards|away|too\\s+hard|harder|further|past|beyond|in\\s+the\\s+right|out\\s+of\\s+my\\s+comfort|into\\s+(?:going|trying|doing|taking|applying|it|this|that|a\\s+career|the\\s+job)))' +
      '|(?:threatened|threatens)\\s+(?:to\\s+(?:kill|hurt|hit)|me|us)' +
      '|(?:gets|got|turns|turned|becomes|became|is|was)\\s+(?:violent|physical)' +
      '|(?:hits|beats)\\s+(?:me\\s+)?when\\s+(?:he|she)\\s+(?:drinks|is\\s+drunk|gets\\s+angry|loses)' +
      '|controls\\s+(?:all\\s+)?(?:the|our|my)\\s+money|checks\\s+my\\s+phone|won\'?t\\s+let\\s+me\\s+(?:leave|go\\s+out|see\\s+my|have\\s+friends|work|talk\\s+to)' +
      '|(?:threw|pushed|shoved|slammed|held|pinned)\\s+me\\s+(?:against|down|onto|into|to\\s+the\\s+(?:ground|floor|wall))' +
      '|forc(?:es|ed|ing)\\s+me\\s+to\\s+(?:have\\s+sex|sleep\\s+with|do\\s+things)' +
      '|touch(?:es|ed)\\s+me\\s+(?:at\\s+night|when\\s+i\\s+was|inappropriately|down\\s+there|under\\s+my|in\\s+my)' +
      '|threatens?\\s+to\\s+take\\s+(?:the|my|our)\\s+kids)' +
    // No subject: "husband hit me", but not "it hit me hard" or "the news hit me".
    '|\\b(?!(?:it|this|that|news|truth|reality|realization|grief|loss|wave|feeling|guilt|silence|song|line|verse|sermon|message|moment|thought|idea|smell|memory)\\s)\\w+\\s+(?:hit|hits|beat|beats|punched|choked|strangled|slapped|kicked|shoved)\\s+(?:me|my\\s+mom|my\\s+mother|my\\s+kids|my\\s+child|my\\s+daughter|my\\s+son)\\b(?!\\s+(?:' + NOT_A_BLOW + ')\\b)' +
    '|\\b(?:threw|throws|throwing)\\s+(?!(?:a|the|his|her)\\s+(?:ball|frisbee|pillow|snowball|football|baseball|party))(?:a|an|the|his|her|my|things|stuff|\\w+)\\s+(?:\\w+\\s+){0,2}?at\\s+(?:me|us|my\\s+(?:kids?|son|daughter|mom|mother))\\b' +
    '|\\b(?:\'s|s\')\\s+(?:boyfriend|husband|wife|partner|dad|father|mom|mother|stepdad|stepfather|stepmom|ex)\\s+(?:hits|beats|hit|beat|chokes|choked|slaps|slapped|is\\s+beating|has\\s+been\\s+(?:hitting|beating)|threatens|threatened)\\s+(?:her|him|them|the\\s+kids)\\b' +
    '|\\b(?:beats|hits|is\\s+beating|has\\s+been\\s+beating)\\s+(?:his|her)\\s+(?:kids|wife|children|girlfriend|husband|boyfriend|son|daughter)\\b' +
    '|\\b(?:abus(?:e|es|ed|ing|ive)\\s+(?:me|us|my|her|him)\\b|(?:is|was|being|so|very|really|gets|been)\\s+abusive|abusive\\s+(?:husband|wife|partner|boyfriend|girlfriend|relationship|home|marriage|father|mother|dad|mom|ex|parent)|(?:sexually|physically|emotionally)\\s+abus\\w*|molest\\w*|raped?\\b|rape[sd]?\\s+me|domestic\\s+violence|not\\s+safe\\s+at\\s+home|afraid\\s+(?:of|to\\s+go)\\s+home|afraid\\s+(?:he|she)(?:\'ll|\\s+will)\\s+(?:hurt|kill)|(?:he|she)(?:\'ll|\\s+will)\\s+kill\\s+me|scared\\s+(?:he|she)(?:\'ll|\\s+will)\\s+hurt|(?:hands?|hand)\\s+(?:around|on)\\s+my\\s+(?:neck|throat))\\b' +
    '|' + BY_YOU_RE.source, 'i');

  // Someone else died — by suicide, by overdose, or at all. The writer may still be the
  // one at risk; that is checked separately.
  var BEREAVED_RE = /\b(?:(?:he|she|they|my\s+(?:\w+\s+)?\w+|our\s+\w+)\s+(?:died|passed(?:\s+away)?|is\s+dead|was\s+killed|killed\s+(?:him|her)self|took\s+(?:his|her)\s+(?:own\s+)?life|overdosed|committed\s+suicide|died\s+by\s+suicide|hanged\s+(?:him|her)self)|(?:his|her|their)\s+(?:suicide|overdose|death|funeral)|died\s+(?:by|of|from)\s+(?:suicide|an?\s+overdose)|lost\s+(?:my|our)\s+(?:\w+\s+){0,2}?(?:to\s+(?:suicide|an?\s+overdose|cancer|covid|a\s+drunk\s+driver)|last\s+\w+|\d+\s+\w+\s+ago|in\s+(?:a|the)\s+(?:crash|accident|fire))|(?:the|my\s+\w+'?s?)\s+funeral)\b/i;
  var FIRST_PERSON_CRISIS_RE = /\b(?:i\s+(?:want|wanna|need|am\s+going|'m\s+going|plan|am\s+ready|'m\s+ready)\s+to\s+(?:die|end|kill|join|be\s+with|go\s+too|follow)|myself|my\s+(?:own\s+)?life|kill\s+me|i\s+(?:can'?t|cannot)\s+(?:go\s+on|do\s+this)|i\s+(?:don'?t|do\s+not)\s+want\s+to\s+(?:live|be\s+here|wake)|better\s+off\s+dead|i\s+wish\s+i\s+(?:was|were)\s+dead|join\s+(?:him|her|them)|kms|kys)\b/i;

  function looksLikePoisoning(text) {
    if (!text) return false;
    var t = String(text);
    var mine = t.replace(POISON_NOT_ME_RE, ' ');
    return POISON_RE.test(mine) || POISON_RE.test(fold(mine));
  }
  function looksLikeCrisis(text) {
    if (!text) return false;
    var t = String(text);
    return CRISIS_RE.test(t) || CRISIS_RE.test(fold(t)) || looksLikePoisoning(t);
  }
  function looksLikeDanger(text) {
    if (!text) return false;
    var t = String(text);
    return DANGER_RE.test(t) || DANGER_RE.test(fold(t));
  }
  function looksLikeByYou(text) {
    if (!text) return false;
    var t = String(text);
    return BY_YOU_RE.test(t) || BY_YOU_RE.test(fold(t));
  }
  function looksLikeBereaved(text) {
    if (!text) return false;
    var t = String(text);
    return BEREAVED_RE.test(t) && !FIRST_PERSON_CRISIS_RE.test(t);
  }

  var POISON_LINE = 'If you have taken pills or anything else to harm yourself, that is a medical emergency before it is anything else: in the United States call 911, or Poison Control at 1-800-222-1222, right now — even if you feel fine.';
  var CRISIS_NOTICE = [
    'If you are in danger or thinking of ending your life, please stop here and get human help now.',
    'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
    'I am not a person, and this page is not emergency care.',
    '',
  ].join('\n');
  var DANGER_NOTICE = [
    'If someone is hurting you, if you are not safe at home, or if you are afraid of what you might do to someone, you deserve help from a person — tonight, not later.',
    'In the United States, the National Domestic Violence Hotline is 1-800-799-7233 (or text START to 88788), free and confidential, 24/7; if you are in immediate danger, call 911. Anywhere else, https://findahelpline.com lists abuse and violence lines by country.',
    'I am not a person, and this page is not emergency care.',
    '',
  ].join('\n');

  return {
    fold: fold,
    CRISIS_RE: CRISIS_RE,
    POISON_RE: POISON_RE,
    POISON_NOT_ME_RE: POISON_NOT_ME_RE,
    DANGER_RE: DANGER_RE,
    BY_YOU_RE: BY_YOU_RE,
    BEREAVED_RE: BEREAVED_RE,
    FIRST_PERSON_CRISIS_RE: FIRST_PERSON_CRISIS_RE,
    looksLikeCrisis: looksLikeCrisis,
    looksLikePoisoning: looksLikePoisoning,
    looksLikeDanger: looksLikeDanger,
    looksLikeByYou: looksLikeByYou,
    looksLikeBereaved: looksLikeBereaved,
    POISON_LINE: POISON_LINE,
    CRISIS_NOTICE: CRISIS_NOTICE,
    DANGER_NOTICE: DANGER_NOTICE,
  };
});
