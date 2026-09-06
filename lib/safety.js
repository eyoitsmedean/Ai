'use strict';
/*
  Safety routing for the Advisor. One source of truth: the server uses these
  patterns directly; `npm run safety` writes public/data/safety.js so the room
  (online and offline) hears exactly the same phrasings.

  Order of precedence in server.js: crisis → medical → identity → decision → scope.
  Crisis always wins, so "I have the pills ready" never reaches the medical branch.

  Sources for the crisis list: C-SSRS screener Q1–Q6 (cssrs.columbia.edu), the
  SAMHSA 988 warning-signs card (PEP23-08-03-001), PHQ-9 item 9, and the
  Breaker's 2026-09-06 probe of slang, means, past tense, and third person.
*/

const PERSON = '(?:my|our|his|her|their) (?:son|daughter|kid|child|children|boy|girl|teen|teenager|friend|best friend|wife|husband|partner|boyfriend|girlfriend|brother|sister|mom|mum|mother|dad|father|parent|student|roommate)';

const CRISIS = [
  // explicit — including misspellings, slang, past and third person
  'su+i?cid',
  'sucide',
  'unalive',
  '\\bkms\\b',
  'kill(?:ing|ed|s)? (?:my|him|her|them|your|our)sel(?:f|ves)',
  'kill(?:s|ed)? (?:themselves|himself|herself)',
  'end(?:ing|ed)? (?:my|his|her|their|it) (?:own )?(?:life|all)',
  'end(?:ing)? (?:things|everything|it all)',
  'take (?:my|his|her|their) (?:own )?life',
  'wan(?:t|ts|na|ted) to die',
  'wan(?:t|ts|na|ted) to be dead',
  'wish(?:ed|ing|es)? (?:i|he|she|they) (?:were|was|could be) dead',
  'wish(?:ed|ing|es)? (?:i|he|she|they) (?:could|would) (?:die|disappear)',
  'wish(?:ed|ing)? (?:to die|i (?:was|were) never born|i had never been born)',
  '(?:go|going|fall) (?:to sleep|asleep) and (?:not|never) wake up',
  'not (?:be )?alive anymore',
  'not (?:want|wanna) to (?:be here|be alive|be around|exist|wake up) anymore',
  '(?:don\'?t|do not|dont) (?:want to|wanna) (?:live|be here|be alive|be around|exist|wake up)',
  'disappear forever',
  'better off (?:dead|without me|if i (?:was|were) (?:dead|gone))',
  'no (?:reason|point) (?:to live|in living|to (?:go|be) on|to be here|to keep going|in (?:going on|staying|anything anymore))',
  '(?:life|it) (?:is|isn\'?t|is not) (?:not )?worth (?:living|it anymore)',
  'can(?:\'?t|not) go on (?:living|anymore|any more)',
  'done with (?:life|living|everything|it all)',
  'i\'?m done\\.? tonight',
  'tonight is the night',
  '(?:the )?only way out',
  'no way out',
  // self-harm
  'self[-\\s]?harm',
  'hurt(?:ing)? myself',
  'cut(?:ting)? (?:myself|again)',
  'been cutting',
  'burn(?:ing)? myself',
  // means and plans (C-SSRS Q3–Q6)
  'hang myself',
  'overdos(?:e|ing|ed)?\\b(?! of (?:joy|love|cute|sugar|caffeine|coffee))',
  '(?:have|got|bought|keep|keeping|holding) (?:the |a |my )?(?:pills|gun|rope|razor|blade|knife) (?:ready|here|with me|in my hand|next to me|and i know)',
  '(?:the |my )?pills (?:are )?ready',
  'bought a gun',
  'jump (?:off|from) (?:the |a )?(?:bridge|roof|building|balcony|window)',
  '(?:the )?bridge tonight',
  'how (?:much|many) [^.?!]{0,30}(?:is too much|to (?:die|overdose|kill)|would it take|to end)',
  'wrote (?:a|the|my) (?:letter|note|goodbye|will) (?:to|for) (?:my|the)',
  '(?:goodbye|suicide) (?:letter|note)',
  'said (?:my )?goodbyes? to everyone',
  'gave (?:my |the |away )?(?:dog|cat|pet|stuff|things|belongings)(?: away)?[^.?!]{0,40}goodbye',
  'plan(?:ning|ned)? to (?:kill|end|die|hang|jump|overdose)',
  'planning (?:my|to end my) (?:death|life)',
  'have a plan to (?:die|end)',
  'made (?:my )?peace with dying',
  // isolation / burden (988 warning signs)
  '(?:a )?burden to (?:everyone|everybody|my family|them|others|the people)',
  '(?:nobody|no one|no-one) would (?:miss|notice|care)',
  'want (?:it all|everything) to (?:end|be over)',
  'want to (?:end it|be gone|not exist|stop existing)',
  // theological and third person
  '(?:people|those|someone) who (?:kill|killed|end|ended|take|took) (?:themselves|their (?:own )?li(?:fe|ves))',
  'forgive me if i (?:kill|killed|end|ended|die|died)',
  'go(?:es|ing)? to hell if (?:i|you) (?:kill|end)',
  PERSON + ' (?:says|said|tells me|told me|thinks|thinks about|talks about|keeps talking about|is thinking about|is talking about|wants|wanted|threatened|is threatening)[^.?!]{0,30}(?:die|dying|dead|kill|suicid|hurt (?:him|her|them)self|end (?:his|her|their) life|not be here)',
  PERSON + ' (?:is|are) (?:suicidal|cutting|self[-\\s]?harming)',
];

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'If this is about someone you love, 988 is for you too — they will tell you what to do next.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

// Only a treatment DECISION triggers the medical line. A therapist who says
// "pray more" or a pair of prescription glasses does not.
const TREATMENT = '(?:medication|medications|meds|medicine|pills|antidepressants?|anxiety meds|insulin|chemo|chemotherapy|radiation|dialysis|treatment|prescription|prescribed|therapy|counseling|doctor\'?s? (?:orders|advice|plan)|surgery|transfusion|vaccine|inhaler|blood pressure pills)';
const MEDICAL = [
  '(?:should i|can i|do i have to|is it ok to|is it okay to|is it a sin to|would it be wrong to|thinking about|thinking of|going to|want to|planning to|decided to) (?:just )?(?:stop|quit|skip|go off|come off|get off|not take|not start|refuse|throw away|flush|ignore|delay|cancel|replace)[^.?!]{0,30}' + TREATMENT,
  '(?:stop|stopped|stopping|quit|quitting|skip|skipping|refuse|refusing|off) (?:taking |my |the |his |her )*' + TREATMENT + '[^.?!]{0,40}(?:pray|faith|trust god|god will|jesus will|heal)',
  TREATMENT + '[^.?!]{0,40}(?:instead|rather than|or (?:just |only )?pray|and (?:just |only )?pray|would rather pray|trust god|have faith|faith (?:instead|alone)|god will heal|jesus will heal)',
  '(?:pray|prayer|faith|trust god|god|jesus) (?:instead of|rather than|not) (?:the |my |his |her |a )?' + TREATMENT,
  '(?:healed|cured) (?:without|instead of) (?:the |my )?' + TREATMENT,
  '(?:is|are) (?:antidepressants|meds|medication|therapy|chemo) (?:a sin|against god|unbiblical|a lack of faith)',
];

const MEDICAL_NOTICE = [
  'A word first about the decision itself: this page is not medical care, and it will not tell you to start, stop, or change a medication or treatment.',
  'That decision belongs with you and the clinician who prescribed it. Please bring the question to them, and let these words keep you company while you do.',
  '',
].join('\n');

// "Are you Jesus?" deserves a straight answer before any verse. Bare words
// like "robot" or "bot" are not enough; the sentence has to be about this room.
const IDENTITY = [
  'pretend(?:ing|s)? to be (?:jesus|god|christ|him)',
  'are you (?:really |actually |secretly )?(?:jesus|god|christ|the lord|a bot|a robot|an ai|a computer|a person|a real person|human|a human|alive)',
  'is this (?:really |actually )?(?:jesus|god|christ|a bot|a robot|an ai|a person|a real person)',
  '(?:am i|are we) (?:really |actually )?talking to (?:jesus|god|christ|a bot|a robot|an ai|a person|a machine)',
  'ai jesus',
  'jesus (?:ai|bot|robot|app that talks)',
  'you(?:\'re| are) (?:just |only |nothing but )?(?:an? )?(?:ai|bot|chat ?bot|robot|machine|program|computer|algorithm|language model)',
  'speak(?:ing|s)? (?:as|for) (?:jesus|god|christ)',
  'playing (?:jesus|god)',
  'who (?:am i talking to|is (?:this|writing|answering))',
];

const IDENTITY_NOTICE = [
  'You are right to ask, so here it is plainly: this is software, not a person, and not Him. It does not speak for Jesus; it carries what He is recorded as saying in Matthew, Mark, Luke, and John, checked line by line against the King James text.',
  'Doubt is welcome here. So is staying.',
  '',
].join('\n');

// Big life decisions the room must not make for anyone.
const DECISION = [
  'should i (?:sue|divorce|leave (?:my|him|her|them)|stay with|marry|break up|move out|move away|quit my job|take the job|report (?:him|her|them|my)|confront|cut (?:him|her|them|off)|cut off my|give (?:all|everything|my savings|my house|my inheritance)|sell (?:my|the) house|invest|lend|co-?sign|forgive the debt|press charges|call the police|tell (?:my|his|her) (?:wife|husband|partner|parents))',
  'do i (?:have to |need to )?(?:leave|divorce|sue|stay with|forgive and stay|give (?:all|everything))',
  'is it (?:a sin|wrong|okay|ok) to (?:divorce|leave|sue|remarry|press charges|report)',
];

const DECISION_NOTICE = [
  'A word first: this page will not tell you whether to stay or leave, sue or forgive, give or keep. That decision is yours, and worth a trusted person in the room with you.',
  'What it can do is set one sentence He spoke beside the decision while you make it.',
  '',
].join('\n');

// Requests for another book, another voice, or a chore. The room says what it
// carries instead of quietly answering a different question. A book name alone
// is not enough ("my friend Paul died", "a revelation about my marriage"): it
// has to look like a citation or a request to quote.
const OTHER_BOOK = '(?:paul|psalms?|proverbs|genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation|revelations|old testament|the epistles|the prophets|torah|quran|koran|hadith|bhagavad gita|gita|book of mormon|tao te ching|dhammapada)';
const OFFSCOPE = [
  '\\b' + OTHER_BOOK + ' \\d{1,3}(?::\\d{1,3})?\\b',
  '(?:book of|epistle of|letter to the|gospel of) ' + OTHER_BOOK,
  '(?:what (?:does|did|do) |read (?:me )?|quote (?:me )?|recite |explain |from |show me |give me |tell me what |where in |find (?:me )?)(?:the |st\\.? |saint )?' + OTHER_BOOK + '\\b',
  '\\b' + OTHER_BOOK + ' (?:say|says|said|teach|teaches|wrote|writes|verse|passage|chapter)',
  '\\b(?:in|from) ' + OTHER_BOOK + '\\b',
  '\\b(?:quran|koran|hadith|torah|bhagavad gita|book of mormon|nietzsche|buddha|the buddha|marcus aurelius|rumi|confucius)\\b',
  'tell (?:me )?(?:a |another |one more )?joke',
  'a joke about',
  '(?:the |tomorrow\'?s |today\'?s )?weather (?:today|tomorrow|tonight|this week|forecast|like|in |for )',
  'weather forecast',
  '(?:write|draft|fix|improve|make) (?:me )?(?:my |a |an )?(?:resume|résumé|cv|cover letter|essay|homework|code|poem|song|speech|email|report|business plan)',
  'do my homework',
  '(?:lottery|winning) numbers',
  'stock (?:tip|tips|pick|picks)',
  '(?:give me|share|what\'?s|whats) (?:a |the |your )?recipe',
];

const OFFSCOPE_NOTICE = [
  'One thing first: this room carries only the words Jesus spoke in Matthew, Mark, Luke, and John. It will not quote another book or another voice, and it does not do tasks.',
  'If there is something underneath the question that you are carrying, a sentence of His can sit beside it.',
  '',
].join('\n');

function compile(list) {
  return new RegExp(list.join('|'), 'i');
}

const CRISIS_PATTERN = compile(CRISIS);
const MEDICAL_PATTERN = compile(MEDICAL);
const IDENTITY_PATTERN = compile(IDENTITY);
const DECISION_PATTERN = compile(DECISION);
const OFFSCOPE_PATTERN = compile(OFFSCOPE);

const test = (re) => (text) => Boolean(text) && re.test(String(text));

// The room's routing decision, in precedence order. Returns the notice to put
// before the letter (or '') and the kind, so callers do not re-derive the order.
function route(text) {
  if (test(CRISIS_PATTERN)(text)) return { kind: 'crisis', notice: CRISIS_NOTICE };
  if (test(MEDICAL_PATTERN)(text)) return { kind: 'medical', notice: MEDICAL_NOTICE };
  if (test(IDENTITY_PATTERN)(text)) return { kind: 'identity', notice: IDENTITY_NOTICE };
  if (test(DECISION_PATTERN)(text)) return { kind: 'decision', notice: DECISION_NOTICE };
  if (test(OFFSCOPE_PATTERN)(text)) return { kind: 'offscope', notice: OFFSCOPE_NOTICE };
  return { kind: 'need', notice: '' };
}

// What the room downloads: the same alternations, ready for `new RegExp(list.join('|'), 'i')`.
function clientBundle() {
  return { crisis: CRISIS, medical: MEDICAL, identity: IDENTITY, decision: DECISION, offscope: OFFSCOPE, crisisNotice: CRISIS_NOTICE };
}

module.exports = {
  CRISIS, MEDICAL, IDENTITY, DECISION, OFFSCOPE,
  CRISIS_PATTERN, MEDICAL_PATTERN, IDENTITY_PATTERN, DECISION_PATTERN, OFFSCOPE_PATTERN,
  CRISIS_NOTICE, MEDICAL_NOTICE, IDENTITY_NOTICE, DECISION_NOTICE, OFFSCOPE_NOTICE,
  looksLikeCrisis: test(CRISIS_PATTERN),
  looksLikeMedical: test(MEDICAL_PATTERN),
  looksLikeIdentity: test(IDENTITY_PATTERN),
  looksLikeDecision: test(DECISION_PATTERN),
  looksLikeOffScope: test(OFFSCOPE_PATTERN),
  route,
  clientBundle,
};
