/**
 * Deterministic intent gate — the Advisor's safety layer.
 *
 * Runs on every user turn before the model, before the paywall, and outside
 * the rate limiter (see server.js). Nothing here depends on a network call or
 * a model, so a person in danger always gets the same handoff.
 *
 * Tiers, in the order classifyIntent() applies them:
 *   crisis   — explicit suicidal / self-harm intent, methods, farewells, Spanish
 *   abuse    — danger from another person (domestic, sexual, child abuse)
 *   offscope — requests the Advisor is not for (code, trivia, dosing, finance…)
 *   hostile  — contempt aimed at the app, the faith, or Jesus (warm reply, not blocked)
 *   guidance — everything else
 * Plus one flag that does not change the route:
 *   passive ideation — "nobody would miss me": scripture stays, a 988 line is appended
 *
 * Every pattern list is pinned by test/intent.test.js with the phrasings the
 * independent Breaker found (RELEASE.md §F). Add the phrase to the test first,
 * then the pattern. Patterns match against normForIntent(text): lowercase,
 * NFKC, zero-width characters removed, curly apostrophes straightened.
 */
const { normForIntent } = require('./normalize');

// Active suicidal / self-harm intent. Written for how people actually type at
// 2 a.m.: contractions, slang, typos, methods, farewells.
const CRISIS_PATTERNS = [
  /\bkill (?:my ?self)\b|\b(?:wanna|want to|gonna|going to|should i|could i) kill me\b/,
  /\bsu+i+c+i+d|\bsucide|\bsuicde|\bsuiside/,
  /\bkms\b|\bunalive\b/,
  /\bend (?:my|it|things|everything|my own)\b(?: ?(?:life|all|tonight|today))?/,
  /\bending (?:my (?:own )?life|it all|things|everything)\b/,
  /\btake (?:my (?:own )?life|all (?:my|the) pills)\b/,
  /\b(?:wanna|want to|going to|gonna|ready to|plan(?:ning)? to|about to|thinking (?:of|about)) (?:die|be dead|end (?:it|things|my life|everything)|kill (?:my ?self|me)|jump|hang (?:my ?self|me)|overdose|od\b|not (?:be here|exist|wake up)|disappear for good|stop existing)\b/,
  /\b(?:i )?(?:wanna|want to) (?:die|be dead|not exist|stop existing)\b/,
  /\bdon'?t (?:want|wanna) to (?:be here|be alive|live|wake up|exist|go on|keep going)\b/,
  /\b(?:dont|don'?t) wanna live\b|\bno (?:reason|point) (?:to|in) (?:live|living|go(?:ing)? on|keep going|be(?:ing)? alive|being here)\b/,
  /\blife (?:isn'?t|is not|aint|ain'?t) worth (?:living|it)\b/,
  /\b(?:better off|be better|be happier) (?:if i (?:was |were |am |just |had )?(?:dead|gone|died)|if i (?:wasn'?t|weren'?t|had never been|was never) (?:here|around|alive|born)|without me|dead|gone)\b/,
  /\b(?:no|don'?t see (?:a|the|any)|can'?t see (?:a|the|any)|there'?s no) point (?:in|of|to) (?:being alive|living|staying alive|life anymore|going on)\b/,
  /\b(?:wanna|want to) dye\b(?! (?:my|the|his|her) )/,
  /\bwish i (?:was|were|could be) dead\b|\bwish i (?:had never been born|wasn'?t born|would die|could die|didn'?t wake up|would disappear)\b/,
  /\bself[- ]?harm(?:ing|ed)?\b|\bhurt(?:ing)? myself\b|\bcut(?:ting)? (?:myself|again|my (?:wrists?|arms?))\b/,
  /\bhang(?:ing)? myself\b|\bjump (?:off|from|in front of)\b|\bgoing to jump\b/,
  /\boverdos(?:e|ing|ed)\b|\bpills (?:lined up|in front of me|ready|in my hand)\b|\btake all (?:my|the|these) pills\b|\bswallow (?:all )?(?:the|my|these) pills\b/,
  /\b(?:i have|i've got|got) (?:a )?(?:gun|rope|pills|blade|knife) (?:and|ready|in my hand|next to me|and i know)\b/,
  /\b(?:written|wrote|writing) (?:my|the|a) (?:suicide )?note\b|\bgoodbye(?: letter| note)?\b.{0,40}\b(?:tell|sorry)\b/,
  /\b(?:end|ending) (?:things|it|everything) tonight\b|\btonight (?:is|will be) the (?:night|last)\b|\bnot going to be here tomorrow\b|\bwon'?t be here tomorrow\b/,
  /\b(?:how (?:much|many) (?:tylenol|acetaminophen|ibuprofen|pills|sleeping pills|xanax|benadryl))\b.{0,40}\b(?:die|not wake up|kill|overdose|end)\b/,
  /\bplan(?:ning)? to (?:die|kill|end)\b/,
  /\bsleep and never wake up\b|\bnever wake up\b/,
  /\b(?:want|need) (?:it|this|everything|the pain) to (?:stop|end|be over)\b.{0,30}\b(?:for good|forever|permanently)\b/,
  /\b(?:i'?m|i am) (?:done|finished) (?:with life|living|with everything)\b/,
  // Spanish (common in US audience)
  /\bquiero morir(?:me)?\b|\bmatarme\b|\bsuicidarme\b|\bquitarme la vida\b|\bno quiero vivir\b/,
];
function detectCrisis(text) {
  const t = normForIntent(text);
  return CRISIS_PATTERNS.some((re) => re.test(t));
}

// Passive ideation / farewell language that is not an explicit statement of
// intent. Not blocked — the reply keeps its scripture but appends a 988 line.
const PASSIVE_IDEATION_PATTERNS = [
  /\bnobody (?:would|will) (?:notice|miss|care)\b.{0,30}\b(?:gone|disappeared|dead|died|wasn'?t (?:here|around))\b/,
  /\b(?:everyone|everybody|they|my family|my kids) (?:would|will) be (?:fine|better|happier|better off) (?:without me|if i (?:wasn'?t|weren'?t) (?:here|around))\b/,
  /\bwhat(?:'s| is) the point (?:of (?:anything|living|going on|it all|me|any of (?:this|it)))?\b/,
  /\b(?:i )?(?:can'?t|cannot) (?:do|take|go on like) this (?:anymore|any more|any longer)\b/,
  /\bnobody would (?:notice|miss|care) if i (?:disappeared|was gone|were gone|died|left)\b/,
  /\bi (?:just )?want (?:it|this|everything|the pain) to (?:stop|end|be over)\b/,
  /\b(?:tired of|sick of) (?:living|being alive|existing|life)\b/,
  /\bi (?:feel like|wish i could) (?:disappear|vanish)\b|\bdisappear(?:ing)? (?:forever|for good)\b/,
  /\bhow much (?:tylenol|acetaminophen|ibuprofen|pills|sleeping pills|xanax|benadryl)\b/,
  /\b(?:goodbye|good bye|farewell)\b.{0,60}\b(?:sorry|tell (?:my|them|everyone))\b/,
];
function detectPassiveIdeation(text) {
  const t = normForIntent(text);
  return PASSIVE_IDEATION_PATTERNS.some((re) => re.test(t));
}

// Danger to the person from someone else (domestic violence, sexual abuse,
// child abuse). Handled deterministically so the handoff never depends on
// the model. Patterns are deliberately loose: a false positive costs a
// hotline line; a false negative can cost far more.
const PERSON = "(?:he|she|they|my (?:hus?band|husbamd|wife|partner|boyfriend|girlfriend|bf|gf|fianc[eé]e?|dad|mom|mum|father|mother|stepdad|stepmom|step-?father|step-?mother|parents?|son|daughter|brother|sister|uncle|aunt|ex|roommate|boss|coach|pastor|teacher))";
const VIOLENCE = "(?:hits?|hitting|beats?|beating|chok(?:es?|ed|ing)|strangl(?:es?|ed|ing)|punch(?:es|ed|ing)?|slap(?:s|ped|ping)?|kick(?:s|ed|ing)?|shov(?:es?|ed|ing)|push(?:es|ed) me (?:down|into|against)|threw|throws|grab(?:s|bed) me|drag(?:s|ged) me|pull(?:s|ed) my hair|spits? (?:on|at) me|burn(?:s|ed) me|put his hands on me|puts his hands on me|laid hands on me|lock(?:s|ed) me (?:in|out|up)|took my phone|takes my phone|won'?t let me leave|threatens? (?:to )?(?:kill|hurt|beat)|threatened (?:to )?(?:kill|hurt|beat)|rap(?:es?|ed|ing)|forc(?:es?|ed|ing) me to have sex|forced (?:himself|herself) on me|touch(?:es|ed|ing) me|molest(?:s|ed|ing)?)";
const ABUSE_PATTERNS = [
  new RegExp(`\\b${PERSON}\\b[^.!?]{0,60}\\b${VIOLENCE}\\b`),
  new RegExp(`\\b${VIOLENCE}\\b[^.!?]{0,20}\\b(?:me|us|my (?:kids?|children|little (?:sister|brother)|daughter|son|mom|mother))\\b`),
  /\b(?:being|getting|been|am|i'm|i am|was|got|i was) (?:physically |sexually |emotionally )?(?:abused|assaulted|raped|molested|beaten|beat up|hit|choked|strangled|groped)\b/,
  /\b(?:someone|he|she|they|a man|my \w+) (?:raped|assaulted|molested|groped|forced) me\b|\bforced (?:me )?to have sex\b|\bhad sex with me (?:when|while) i (?:was|said)\b|\bi (?:said no|didn'?t consent|told (?:him|her|them) (?:no|to stop))\b.{0,40}\b(?:anyway|didn'?t stop|kept going)\b/,
  /\b(?:abusive|violent) (?:husband|wife|partner|boyfriend|girlfriend|relationship|marriage|home|parent|father|mother|dad|mom|ex)\b/,
  /\b(?:domestic violence|domestic abuse|sexual abuse|sexually abused|child abuse|molested)\b/,
  /\b(?:i'?m|i am|we are|we're) (?:not safe|in danger|scared for my life|afraid for my life|being hurt)\b/,
  /\b(?:i'?m|i am|im) (?:scared|afraid|terrified) of my (?:husband|wife|partner|boyfriend|girlfriend|dad|mom|father|mother|stepdad|stepmom|ex)\b/,
  /\bafraid (?:he|she|they)(?:'ll| will|'s going to| is going to|s gonna| gonna) (?:hurt|kill|hit|beat) (?:me|us|the kids|my kids)\b/,
  /\btouch(?:es|ed|ing) me (?:when|where|and|in)\b|\btouches me (?:inappropriately|down there|at night|when mom)\b/,
  /\b(?:hits?|beats?|kicks?|chokes?|hurts?) my (?:little |younger |baby )?(?:sister|brother|kids?|children|daughter|son)\b/,
  /\bcontrols? (?:all )?(?:my|our) money\b.{0,60}\b(?:worthless|stupid|can'?t leave|scared|afraid|threat)\b/,
  /\bthrew (?:a |the )?\w+ at (?:me|my head|my face)\b/,
];
function detectAbuse(text) {
  const t = normForIntent(text);
  return ABUSE_PATTERNS.some((re) => re.test(t));
}

// Requests the Advisor is not for: code, homework, trivia, weather, sports,
// medical dosing, finance tips, betting. A life question that merely mentions
// one of these words passes through: EMOTIONAL_GUARD wins unless the sentence
// is plainly a request for the thing itself.
const EMOTIONAL_GUARD =
  /\b(?:god|jesus|pray|faith|forgiv|griev|grief|mourn|anxious|anxiety|afraid|scared|terrified|lonely|alone|hurt|hurting|marriage|divorce|hopeless|worthless|broke|broken|gambl|exhausted|numb|depress|cry|crying|tears|died|death|dying|funeral|hospital|relapse|sober|addict|hate myself|can'?t sleep|panic|ashamed|shame|guilt|betray|cheated|abandon|miscarr|cancer|diagnos|sick|fired|laid off|lost my|my (?:son|daughter|wife|husband|mom|dad|friend|partner|neighbor|neighbour|family|kids?|baby)|feel(?:ing)? (?:like|so|lost|empty))\w*\b/;
const OFFSCOPE_PATTERNS = [
  /\b(?:write|fix|debug|generate|refactor|explain)\b[^.!?]{0,40}\b(?:code|function|script|program|regex|sql|query|python|javascript|java|c\+\+|html|css)\b/,
  /\b(?:python|javascript|typescript|c\+\+|sql|regex)\b[^.!?]{0,30}\b(?:error|bug|snippet|code|function)\b/,
  /\bcapital of\b|\bhow many (?:ounces|grams|miles|kilometers|calories|planets|states|countries)\b|\bwhat year (?:did|was)\b|\bwho (?:won|invented|discovered)\b|\bhow (?:tall|old|far|big) is\b/,
  /\b(?:weather|forecast|temperature) (?:today|tomorrow|this week|in [a-z]+)\b/,
  /\b(?:stock|share|bitcoin|btc|eth|crypto) price\b|\bwhich (?:stocks?|coins?) (?:should|to) (?:i )?buy\b|\bshould i (?:buy|sell|short|invest in) (?:stocks?|shares|crypto|bitcoin|btc|eth|gold|tesla|nvidia)\b|\bbetting odds\b|\bparlay\b|\bprice prediction\b/,
  /\b(?:solve|calculate|compute|what is|what's)\s+[\d(][\d\s+\-*/^().x=]*[\d)]\s*[?]?$/,
  /\b(?:essay|homework|book report|cover letter|resume|résumé|business plan|marketing plan)\b[^.!?]{0,40}\b(?:write|draft|for me|do my)\b|\b(?:write|draft|do) my (?:essay|homework|cover letter|resume|résumé)\b/,
  /\b(?:recipe for|how (?:do i|to) (?:cook|bake|install|configure|reset|unlock|jailbreak|root))\b/,
  /\b(?:how many (?:mg|milligrams|pills|tablets) (?:of \w+ )?(?:can|should) i take|what(?:'s| is) the (?:max|maximum|right|correct|safe) dos(?:e|age)|safe dos(?:e|age)|max dos(?:e|age)|can i take \d+ ?(?:mg|pills|tablets))\b/,
  /\b(?:translate|translation of) (?:this|the following|into)\b/,
  /\bwho (?:will|is going to|'s gonna) win (?:the|this|tonight)\b|\bpredict (?:the|this) (?:game|match|election|season)\b/,
  /\b(?:tell me|write) (?:a|me a) (?:joke|poem|story|song|rap|limerick|haiku)\b/,
];
function detectOffScope(text) {
  const t = normForIntent(text);
  if (EMOTIONAL_GUARD.test(t) && !/\b(?:write|fix|debug) (?:me )?(?:a |some )?(?:code|function|script|python)|\bcapital of\b|\bhomework for me\b|\bmy essay for me\b/.test(t)) {
    return false;
  }
  return OFFSCOPE_PATTERNS.some((re) => re.test(t));
}

// Contempt or attack aimed at the Advisor, the faith, or Jesus. Not blocked —
// routed to a warm, non-defensive reply.
const HOSTILE_PATTERNS = [
  /\b(?:this|your app|you|this app|this bot|religion|christianity|the bible|jesus|god) (?:is|are) (?:a |just a |all )?(?:scam|fake|bullshit|bs|garbage|stupid|a joke|nonsense|a lie|made up|useless|a fairy ?tale|fairy ?tales?|a cult|for (?:weak|stupid|dumb) people)\b/,
  /\bjesus (?:never existed|isn'?t real|is a myth|was a fraud|was just a man|is fake)\b/,
  /\b(?:prove|show me proof|where'?s (?:your|the) (?:proof|evidence))\b[^.!?]{0,40}\b(?:god|jesus|exists|real)\b/,
  /\b(?:fuck|screw|shut up|damn) (?:you|this|off|jesus|god)\b|\bf\*+k (?:you|this|off)\b/,
  /\byou'?re (?:just )?(?:a|an) (?:ai|bot|chatbot|program|computer|algorithm)\b[^.!?]{0,40}\b(?:what do you know|you can'?t|don'?t pretend|stop pretending)\b/,
  /\bwhy (?:would|should) i (?:listen to|trust|believe) (?:you|a bot|an ai|a computer|this|a \d+ year old book)\b/,
];
function detectHostile(text) {
  const t = normForIntent(text);
  return HOSTILE_PATTERNS.some((re) => re.test(t));
}

/** Rough Spanish detector for the safety replies (two or more common function words). */
function looksSpanish(text) {
  const t = normForIntent(text);
  const hits = (t.match(/\b(?:quiero|vivir|morir|morirme|estoy|muy|triste|ayuda|ayúdame|me siento|no sé|qué|hacer|mi vida|nadie|solo|sola|dios|jesús|por favor|ya no|puedo|tengo)\b/g) || []).length;
  return hits >= 2;
}

/**
 * Deterministic intent gate that runs before any model call.
 * Order matters: safety first, then scope, then tone.
 */
function classifyIntent(text) {
  if (detectCrisis(text)) return 'crisis';
  if (detectAbuse(text)) return 'abuse';
  if (detectOffScope(text)) return 'offscope';
  if (detectHostile(text)) return 'hostile';
  return 'guidance';
}

module.exports = {
  classifyIntent,
  detectCrisis,
  detectPassiveIdeation,
  detectAbuse,
  detectOffScope,
  detectHostile,
  looksSpanish,
  normForIntent,
  // Exposed for tests and audits only; server code should call the detect* functions.
  CRISIS_PATTERNS,
  PASSIVE_IDEATION_PATTERNS,
  ABUSE_PATTERNS,
  OFFSCOPE_PATTERNS,
  HOSTILE_PATTERNS,
};
