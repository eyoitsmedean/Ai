/*
  Safety core for the Red Letter Advisor. ONE file, run unchanged on the server
  (require) and in the room (copied to public/data/safety.js by `npm run safety`).
  Nothing here may use require() or Node globals.

  Crisis detection is a cue scorer, not a phrase list. It fires on:
    E   explicit language (suicide, kill myself, kms, unalive, off myself…)
    X   an act in progress or completed (took a bunch of pills an hour ago)
    INT first-person intent/wish/readiness + a death or means object in a short window
    HS  strong hopelessness that stands alone (tired of being alive, no point anymore)
    T   a close other described as suicidal (says / googling / threatened + die/kill)
  or on a COMBINATION of weaker cues: D death words about the self, M means,
  F finality (tonight, arrangements, goodbyes, giving things away), H hopelessness.
  Benign contexts (shooting range, carbs, farewell party, vacation, debt, baptism)
  raise the bar for combinations but never silence E, X, INT, HS, or T.

  Design sources: C-SSRS screener Q1–Q6 (wish to be dead; thoughts; method; intent;
  plan; preparatory acts), SAMHSA 988 warning-signs card PEP23-08-03-001 (burden,
  trapped, no reason to live, giving away possessions, saying goodbye), PHQ-9 item 9.
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RLA_SAFETY_CORE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const W = '[^.?!\\n]{0,';
  const rx = (parts, flags) => new RegExp(parts.join('|'), flags || 'i');

  const PERSON = '(?:my|our|his|her|their) (?:son|daughter|kid|child|children|boy|girl|teen|teenager|friend|best friend|wife|husband|partner|boyfriend|girlfriend|brother|sister|mom|mum|mother|dad|father|parent|student|roommate|grandson|granddaughter|nephew|niece|cousin)';

  // ---- explicit (fire alone) ------------------------------------------------
  const EXPLICIT = rx([
    'su+i?cid', 'sucide', 'suiside', 'unalive', '\\bkms\\b', '\\bkys\\b',
    '(?:kill|killing|killed|off|offing|offed) (?:my|him|her|them|your|our)sel(?:f|ves)',
    'kill(?:s|ed|ing)? (?:themselves|himself|herself)',
    '(?:end|ending|ended|finish|finishing|take|taking|took) (?:my|his|her|their) (?:own )?life',
    'end(?:ing)? (?:it all|things|everything|my suffering|the suffering)',
    'wan(?:t|ts|na|ted) to (?:die|be dead|not exist|stop existing)',
    'wish(?:ed|ing|es)? (?:i|he|she|they) (?:were|was|could be|would be) dead',
    'wish(?:ed|ing|es)? (?:i|he|she|they) (?:could|would) (?:die|disappear|not wake up)',
    'wish(?:ed|ing)? (?:to die|i (?:was|were) never born|i had never been born|i (?:could|would) (?:just )?(?:go|fall) to sleep)',
    '(?:go|going|fall|falling) (?:to sleep|asleep) and (?:not|never) wake up',
    'not (?:be )?alive anymore', 'be (?:dead|gone) by (?:morning|tomorrow|tonight)',
    '(?:don\'?t|do not|dont) (?:want to|wanna) (?:live|be alive|be here anymore|exist|wake up)',
    'better off (?:dead|without me|if i (?:was|were) (?:dead|gone))',
    'ways to (?:die|kill (?:myself|yourself|himself|herself)|end (?:it|my life)|painlessly)',
    'how to (?:die|kill myself|end it|hang|overdose)',
    'self[-\\s]?harm', 'hurt(?:ing)? myself', 'cut(?:ting)? (?:myself|again|my (?:arms?|wrists?|legs?|thighs?))', 'burn(?:ing)? myself',
    'hang myself', 'shoot myself', 'jump(?:ing)? (?:off|from) (?:the |a )?(?:bridge|roof|building|balcony|window|cliff|overpass)',
    'overdos(?:e|ing|ed)?\\b(?! of (?:joy|love|cute|sugar|caffeine|coffee|nostalgia|fun))',
    '(?:driving|drive|steer|swerve) into (?:oncoming )?(?:traffic|a tree|a wall|the barrier)',
    'no (?:reason|point) (?:to live|in living|to (?:go|be) on|to be here|to keep going|in (?:going on|staying|anything anymore|being here))',
    '(?:life|it) (?:is|isn\'?t|is not) (?:not )?worth (?:living|it anymore)',
    'can(?:\'?t|not) go on (?:living|anymore|any more)',
    'done with (?:life|living|being alive)',
    'tired of (?:being alive|living|life|existing|waking up)',
    'hate being alive', 'not (?:going to|gonna) be around (?:much longer|anymore|for long)',
    'won\'?t be around (?:much longer|anymore|for long)',
    '(?:a )?burden to (?:everyone|everybody|my family|them|others|the people|the world)',
    '(?:nobody|no one|no-one) would (?:miss|notice|care)',
    '(?:if|when) i (?:died|was dead|were dead|was gone|were gone|killed myself)',
    'throw a party if i',
    'want (?:it all|everything|my life) to (?:end|be over)',
    'made (?:my )?peace with dying', 'ready to (?:die|go|meet (?:jesus|god|my maker)|be with the lord)',
    '(?:go|going) home to (?:god|jesus|the lord) tonight',
    '(?:people|those|someone) who (?:kill|killed|end|ended|take|took) (?:themselves|their (?:own )?li(?:fe|ves))',
    'forgive me if i (?:kill|killed|end|ended|die|died)',
    'the only way out', 'no way out(?! of (?:this|the|my) (?:debt|contract|lease|mess|situation|deal|job|meeting))',
    'no point (?:anymore|any more|in anything|to anything|in trying anymore)', 'nothing (?:left )?to live for',
    '(?:have|got|have got|keep|keeping|holding) (?:the |my |a |some |all the )?(?:pills|gun|pistol|rope|razor|blade|knife|bottle) (?:ready|here|with me|in my hand|next to me|in front of me|lined up|counted out|out)',
    '(?:the |my )?pills (?:are )?(?:ready|lined up|counted out|in front of me)',
    '(?:bought|got|borrowed|found|have) (?:a |the |my )?(?:gun|pistol|rifle|rope|noose)' + W + '35}(?:know what (?:i am|i\'?m|im) going to do|going to do with it|for myself|to use|tonight)',
    'how (?:much|many) (?:\\w+ ){0,3}(?:pills|tablets|tylenol|acetaminophen|ibuprofen|xanax|benadryl|sleeping pills|of (?:my|these|the) (?:pills|meds|medication))' + W + '25}(?:is too much|too many|to (?:die|overdose|kill)|would (?:it|that) take|is lethal|is fatal|is deadly|to end|to not wake up)',
    'wrote the (?:letter|note|letters|notes) (?:to|for) (?:my|the|each of my|everyone)',
    'plan(?:ning|ned)? (?:my|his|her|their|to end my) (?:death|funeral|suicide|exit)', 'plan(?:ning|ned)? to (?:kill|end (?:it|my life|things|everything)|die|hang|jump|overdose)',
    '(?:stop|stopped|skip|skipping|not take|not taking)' + W + '20}(?:insulin|meds|medication|pills|dialysis|inhaler|heart pills)' + W + '20}on purpose',
    'on purpose' + W + '20}(?:stop|skip|not take) (?:my )?(?:insulin|meds|medication|pills)',
  ]);

  // ---- act in progress / completed --------------------------------------------
  const IN_PROGRESS = rx([
    '(?:took|swallowed|taken) (?:a bunch|a lot|a handful|all|too many|the whole bottle|the rest|everything|\\d+) (?:of )?(?:the |my |these |some )?(?:pills|tablets|tylenol|acetaminophen|ibuprofen|xanax|sleeping pills|meds|medication)',
    '(?:pills|tylenol|meds) (?:a few|an?|\\d+) (?:hours?|minutes?) ago',
    '(?:already|just) (?:took|cut|swallowed|drank) ' + W + '20}(?:pills|bottle|bleach|blade|razor)',
    '(?:loaded|cocked) (?:gun|pistol|rifle|shotgun|revolver)' + W + '30}(?:in front of me|on the table|in my hand|next to me|in my lap|to my head)',
    '(?:gun|pistol|rifle|shotgun|revolver)' + W + '20}(?:loaded|in my hand|to my head|in my mouth|on the table in front of me)',
    'standing on (?:the |a )?(?:bridge|ledge|roof|edge|tracks|platform edge)',
    '(?:rope|noose|belt) (?:is )?(?:ready|tied|around my neck)',
    'bleeding (?:right now|a lot|and i)',
  ]);

  // ---- first-person intent + object, within a window --------------------------
  const INTENT_VERB = '(?:i|i\'?m|im|i am|ive|i\'ve|i would|i\'?d) (?:really |just |seriously |honestly |finally |actually )?(?:want|wanna|wish|am going|going|gonna|am about|about|am ready|ready|keep thinking about|think about|am thinking about|thinking about|am thinking to|thinking to|thought about|have thought about|have been thinking about|plan|am planning|planning|planned|decided|have decided|intend|need|have to|might|may|could|would rather|would like|am tempted|tempted|feel like|am considering|considering)';
  const HARD_OBJECT = '(?:to )?(?:die|be dead|kill|end (?:it all|my life|my suffering|everything|things)|finish (?:it|my life|myself)|off myself|not wake up|never wake up|sleep forever|go to sleep forever|be with (?:him|her|them|my (?:wife|husband|son|daughter|mom|mum|dad|mother|father|baby|brother|sister)) again|see (?:him|her|them|my \\w+) again in heaven|meet (?:jesus|god|my maker)|go home to (?:god|jesus|the lord)|be in heaven|jump|overdose|hang|shoot myself|cut (?:deeper|deep)|drive (?:off|into)|step (?:off|in front)|swallow (?:the|all|every)|take (?:all|every|the whole|a bunch of|the rest of)(?: my| the)? pills)';
  const SOFT_OBJECT = '(?:to )?(?:disappear|vanish|not be here|not exist|be gone|be over|be done with (?:it all|everything|life)|check out|end (?:it|this|the pain))';
  const INTENT = new RegExp(INTENT_VERB + W + '20}' + HARD_OBJECT + '\\b', 'i');
  const INTENT_SOFT = new RegExp(INTENT_VERB + W + '20}' + SOFT_OBJECT + '\\b', 'i');

  // ---- close other, described as at risk --------------------------------------
  const THIRD = new RegExp(PERSON + ' (?:says|said|tells me|told me|thinks|thinks about|talks about|keeps talking about|is talking about|has been talking about|is thinking about|has been thinking about|wants|wanted|threatened|is threatening|threatens|has been googling|googled|googling|is searching|has been searching|searched|searching|is looking up|looked up|looking up|is researching|researched|wrote|has been cutting|is cutting|cut|is|has been)' + W + '35}(?:die|dying|dead|kill|suicid|hurt (?:him|her|them)self|end (?:his|her|their) life|not (?:want to )?be here|ways to|not wake up|overdos|pills|cutting|self[-\\s]?harm|be alive)', 'i');

  // ---- weak cues (fire only in combination) -----------------------------------
  const DEATH_SELF = rx([
    '\\b(?:i|i\'?m|im|me|myself|my own)\\b' + W + '25}\\b(?:die|died|dying|dead|death|gone for good|not here anymore|not around)\\b',
    'disappear forever', 'not wake up', 'be gone', 'end my (?:pain|suffering|misery)', 'end the pain',
    'my (?:own )?(?:death|funeral|grave|obituary|suicide)', 'when i\'?m gone', 'after i\'?m gone',
    'be with (?:him|her|them|my \\w+) again', 'see (?:him|her|them) again soon',
    'meet (?:jesus|god|my maker)', 'go(?:ing)? home to (?:god|jesus|the lord)',
  ]);
  const MEANS = rx([
    '\\bpills\\b', 'tylenol', 'acetaminophen', 'ibuprofen', 'xanax', 'sleeping pills', 'insulin', 'bottle of',
    '\\b(?:gun|pistol|rifle|shotgun|revolver|firearm)\\b', 'bullet', 'rope', 'noose', 'razor', 'blade', 'knife',
    '\\bbridge\\b', 'rooftop', 'ledge', 'overpass', 'train tracks', 'oncoming traffic', 'carbon monoxide', 'exhaust', 'bleach', 'antifreeze',
    'how (?:much|many) ' + W + '30}(?:is too much|to (?:die|overdose|kill)|would it take|to end|is lethal|is fatal)',
    'lethal', 'fatal dose',
  ]);
  const TIME = rx(['\\btonight\\b', 'by (?:morning|tomorrow)', 'not much longer', 'one last', 'for the last time', 'last time']);
  const FINALITY = rx([
    'tonight is the night', 'made (?:my |the )?arrangements', 'my arrangements', 'my affairs in order', 'affairs in order', 'my will', 'wrote (?:a |the |my )?will',
    'wrote (?:a |the |my )?(?:letter|note|letters|notes) (?:to|for) (?:my|the|everyone|each)', 'goodbye (?:letter|note|letters|notes|video)',
    'sa(?:id|ying|y) (?:my )?goodbyes?', 'goodbye to (?:everyone|everybody|people|my|the)',
    'giv(?:e|en|ing) away (?:my |all my |the )?(?:things|stuff|belongings|possessions|clothes|books|dog|cat|pet|guitar|car)',
    'gave (?:away )?(?:my |all my |the )?(?:things|stuff|belongings|possessions|dog|cat|pet)(?: away)?',
    'deleted (?:my )?(?:accounts?|everything|photos)', 'set a date', 'picked a date', 'have a date', 'i\'?m done\\b', 'im done\\b',
    'this is (?:it|the end|goodbye)',
  ]);
  const HOPELESS = rx([
    'no point', 'no point anymore', 'no way out', 'nothing left', 'nothing to live for', 'no future', 'no hope', 'hopeless',
    'can(?:\'?t|not) (?:do this|take (?:it|this)|keep going|go on|handle (?:it|this)) (?:anymore|any more)',
    'can(?:\'?t|not) (?:do this|take it|keep going|go on) (?:anymore|any more|like this)',
    'tired of (?:everything|it all|fighting|trying|pretending|hurting)', 'so tired of (?:this|everything|all of it)',
    'want (?:it|the pain|this|everything) to (?:end|stop|be over|go away)',
    'everyone would be (?:happier|better|relieved|fine) without me', 'wouldn\'?t (?:care|notice|miss me)',
    'burden', 'trapped', 'unbearable', 'worthless', 'a failure at everything', 'hate myself', 'waste of (?:space|a life|oxygen)',
    'tired of being (?:a burden|alive|here|me|in pain)', 'i give up', 'giving up',
  ]);
  const BENIGN = rx([
    '\\b(?:shooting |gun |firing |rifle |the )range\\b', 'hunting', 'skeet', 'carbs', 'calories', 'sugar', 'gluten', 'caffeine', 'smoking', 'cigarettes', 'vap(?:e|ing)', 'drinking', 'alcohol', 'weed',
    '\\bdebt\\b', 'bills', 'mortgage', 'lease', 'contract', 'shift', 'overtime', 'office', 'my boss', 'at work', 'work tonight', 'deadline', 'project', 'exam', 'finals', 'homework',
    'farewell', 'retire', 'retirement', 'last day at', 'moving to', 'vacation', 'holiday', 'trip', 'flight', 'cruise', 'time capsule', 'keepsake', 'scrapbook',
    'burden of proof', 'baptize', 'baptism', 'wedding', 'birthday', 'anniversary', 'graduation', 'party for', 'surprise party',
    'headache', 'migraine', 'toothache', 'my knee', 'my back', 'cramps', 'for the pain in',
    'the game', 'season', 'playoffs', 'marathon', 'race', 'kids to bed', 'dishes', 'laundry', 'diet', 'fasting',
  ]);
  const FEAR = rx(['(?:scared|afraid|frightened|terrified|fear(?:ful)?|anxious|worried|nervous|dread) (?:of|about|that) ' + W + '15}(?:die|dying|death|dead)', 'fear of death', 'what happens when (?:i|we) die', 'thinking about my own mortality']);
  const GRIEF_OTHER = new RegExp('(?:' + PERSON + '|my (?:grandma|grandpa|grandmother|grandfather|baby|dog|cat|pet|colleague|coworker|neighbor|pastor|teacher|friend \\w+|\\w+))' + W + '30}(?:died|passed|passed away|is dead|was killed|lost (?:his|her|their) life|funeral)', 'i');

  function cues(text) {
    const t = String(text || '').toLowerCase();
    return {
      explicit: EXPLICIT.test(t),
      inProgress: IN_PROGRESS.test(t),
      intent: INTENT.test(t),
      intentSoft: INTENT_SOFT.test(t),
      third: THIRD.test(t),
      deathSelf: DEATH_SELF.test(t),
      means: MEANS.test(t),
      finality: FINALITY.test(t),
      time: TIME.test(t),
      hopeless: HOPELESS.test(t),
      benign: BENIGN.test(t),
      fear: FEAR.test(t),
      griefOther: GRIEF_OTHER.test(t),
    };
  }

  function crisis(text) {
    const c = cues(text);
    if (c.explicit || c.inProgress || c.intent || c.third) return { fire: true, cues: c, why: 'strong' };
    let weak = 0;
    const self = c.deathSelf && !c.fear && !c.griefOther;
    if (self) weak += 1;
    if (c.intentSoft) weak += 1;              // "I want to disappear" — soft object, needs company
    if (c.means) weak += 1;
    if (c.finality) weak += 1;
    if (c.hopeless) weak += 1;
    if (c.time && (self || c.hopeless || c.intentSoft)) weak += 1;   // "tonight" only beside a self/hopeless cue
    // two finality cues (giving things away AND saying goodbye) count double
    const finalityHits = (String(text || '').toLowerCase().match(new RegExp(FINALITY.source, 'gi')) || []).length;
    if (finalityHits >= 2) weak += 1;
    const bar = c.benign ? 3 : 2;
    return { fire: weak >= bar, cues: c, weak, why: weak >= bar ? 'combination' : 'none' };
  }

  function looksLikeCrisis(text) { return crisis(text).fire; }

  // First-person death reference that is not fear and not grief for another:
  // even when the crisis scorer stays quiet, no resurrection/mourning/"kill and
  // destroy" verse may be served. Callers use this to force the standing letter.
  function mentionsOwnDeath(text) {
    const c = cues(text);
    return (c.deathSelf || c.explicit || c.intent) && !c.fear && !c.griefOther;
  }
  const DEATH_VERSES = /^(John 11:25|John 11:26|John 10:10|Matthew 5:4)$/;
  function verseSafeFor(text, verse) {
    return !(mentionsOwnDeath(text) && DEATH_VERSES.test(String(verse || '')));
  }

  // ---- medical: a treatment DECISION, not a mention -----------------------------
  const TREATMENT = '(?:medication|medications|meds|medicine|pills|antidepressants?|anxiety meds|insulin|chemo|chemotherapy|radiation|dialysis|treatment|prescription|prescribed|therapy|counseling|doctor\'?s? (?:orders|advice|plan)|surgery|transfusion|vaccine|inhaler|blood pressure pills)';
  const MEDICAL = rx([
    '(?:should i|can i|do i have to|is it ok to|is it okay to|is it a sin to|would it be wrong to|thinking about|thinking of|going to|want to|planning to|decided to) (?:just )?(?:stop|quit|skip|go off|come off|get off|not take|not start|refuse|throw away|flush|ignore|delay|cancel|replace)' + W + '30}' + TREATMENT,
    '(?:stop|stopped|stopping|quit|quitting|skip|skipping|refuse|refusing|off) (?:taking |my |the |his |her )*' + TREATMENT + W + '40}(?:pray|faith|trust god|god will|jesus will|heal)',
    TREATMENT + W + '40}(?:instead|rather than|or (?:just |only )?pray|and (?:just |only )?pray|would rather pray|trust god|have faith|faith (?:instead|alone)|god will heal|jesus will heal)',
    '(?:pray|prayer|faith|trust god|god|jesus) (?:instead of|rather than|not) (?:the |my |his |her |a )?' + TREATMENT,
    '(?:healed|cured) (?:without|instead of) (?:the |my )?' + TREATMENT,
    '(?:is|are) (?:antidepressants|meds|medication|therapy|chemo) (?:a sin|against god|unbiblical|a lack of faith)',
  ]);

  // ---- identity: about this room, not about robots in general -------------------
  const IDENTITY = rx([
    'pretend(?:ing|s)? to be (?:jesus|god|christ|him)',
    'are you (?:really |actually |secretly )?(?:jesus|god|christ|the lord|a bot|a robot|an ai|a computer|a person|a real person|human|a human|alive)',
    'is this (?:really |actually )?(?:jesus|god|christ|a bot|a robot|an ai|a person|a real person)',
    '(?:am i|are we) (?:really |actually )?talking to (?:jesus|god|christ|a bot|a robot|an ai|a person|a machine)',
    'ai jesus', 'jesus (?:ai|bot|robot|app that talks)',
    'you(?:\'re| are) (?:just |only |nothing but )?(?:an? )?(?:ai|bot|chat ?bot|robot|machine|program|computer|algorithm|language model)',
    'speak(?:ing|s)? (?:as|for) (?:jesus|god|christ)', 'playing (?:jesus|god)',
    'who (?:am i talking to|is (?:this|writing|answering))',
  ]);

  // ---- big life decisions the room must not make --------------------------------
  const DECISION = rx([
    'should i (?:sue|divorce|leave (?:my|him|her|them)|stay with|marry|break up|move out|move away|quit my job|take the job|report (?:him|her|them|my)|confront|cut (?:him|her|them|off)|cut off my|give (?:all|everything|my savings|my house|my inheritance)|sell (?:my|the) house|invest|lend|co-?sign|forgive the debt|press charges|call the police|tell (?:my|his|her) (?:wife|husband|partner|parents))',
    'do i (?:have to |need to )?(?:leave|divorce|sue|stay with|forgive and stay|give (?:all|everything))',
    'is it (?:a sin|wrong|okay|ok) to (?:divorce|leave|sue|remarry|press charges|report)',
  ]);

  // ---- scope: a citation or a request to quote, never a bare name --------------
  const OTHER_BOOK = '(?:psalms?|proverbs|genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation|revelations|old testament|the epistles|the prophets|torah|quran|koran|hadith|bhagavad gita|gita|book of mormon|tao te ching|dhammapada)';
  const PAUL = '(?:the apostle paul|apostle paul|st\\.? paul|saint paul|paul (?:the apostle|wrote|writes|said in|says in|teaches|taught|\'s (?:letter|letters|epistle|epistles))|what (?:did|does) paul (?:say|write|teach|mean)|paul (?:to|in) (?:the )?(?:romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon))';
  const OFFSCOPE = rx([
    '\\b' + OTHER_BOOK + ' \\d{1,3}(?::\\d{1,3})?\\b',
    '(?:book of|epistle of|letter to the|gospel of) ' + OTHER_BOOK,
    '(?:what (?:does|did|do) |read (?:me )?|quote (?:me )?|recite |explain |from |show me |give me |tell me what |where in |find (?:me )?)(?:the |st\\.? |saint )?' + OTHER_BOOK + '\\b',
    '\\b' + OTHER_BOOK + ' (?:say|says|said|teach|teaches|wrote|writes|verse|passage|chapter)',
    '\\b(?:in|from) ' + OTHER_BOOK + '\\b',
    PAUL,
    '\\b(?:quran|koran|hadith|torah|bhagavad gita|book of mormon|nietzsche|buddha|the buddha|marcus aurelius|rumi|confucius)\\b',
    'tell (?:me )?(?:a |another |one more )?joke', 'a joke about',
    '(?:the |tomorrow\'?s |today\'?s )?weather (?:today|tomorrow|tonight|this week|forecast|like|in |for )', 'weather forecast',
    '(?:write|draft|fix|improve|make) (?:me )?(?:my |a |an )?(?:resume|résumé|cv|cover letter|essay|homework|code|poem|song|speech|email|report|business plan)',
    'do my homework', '(?:lottery|winning) numbers', 'stock (?:tip|tips|pick|picks)', '(?:give me|share|what\'?s|whats) (?:a |the |your )?recipe',
  ]);

  const NOTICES = {
    crisis: [
      'If you are in danger or thinking of ending your life, please stop here and get human help now.',
      'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
      'If this is about someone you love, 988 is for you too — they will tell you what to do next.',
      'I am not a person, and this page is not emergency care.',
      '',
    ].join('\n'),
    medical: [
      'A word first about the decision itself: this page is not medical care, and it will not tell you to start, stop, or change a medication or treatment.',
      'That decision belongs with you and the clinician who prescribed it. Please bring the question to them, and let these words keep you company while you do.',
      '',
    ].join('\n'),
    identity: [
      'You are right to ask, so here it is plainly: this is software, not a person, and not Him. It does not speak for Jesus; it carries what He is recorded as saying in Matthew, Mark, Luke, and John, checked line by line against the King James text.',
      'Doubt is welcome here. So is staying.',
      '',
    ].join('\n'),
    decision: [
      'A word first: this page will not tell you whether to stay or leave, sue or forgive, give or keep. That decision is yours, and worth a trusted person in the room with you.',
      'What it can do is set one sentence He spoke beside the decision while you make it.',
      '',
    ].join('\n'),
    offscope: [
      'One thing first: this room carries only the words Jesus spoke in Matthew, Mark, Luke, and John. It will not quote another book or another voice, and it does not do tasks.',
      'If there is something underneath the question that you are carrying, a sentence of His can sit beside it.',
      '',
    ].join('\n'),
  };

  const test = (re) => (text) => Boolean(text) && re.test(String(text));

  // Precedence: crisis → medical → identity → decision → scope → need.
  function route(text) {
    if (looksLikeCrisis(text)) return { kind: 'crisis', notice: NOTICES.crisis };
    if (test(MEDICAL)(text)) return { kind: 'medical', notice: NOTICES.medical };
    if (test(IDENTITY)(text)) return { kind: 'identity', notice: NOTICES.identity };
    if (test(DECISION)(text)) return { kind: 'decision', notice: NOTICES.decision };
    if (test(OFFSCOPE)(text)) return { kind: 'offscope', notice: NOTICES.offscope };
    return { kind: 'need', notice: '' };
  }

  return {
    VERSION: 2,
    NOTICES,
    crisis,
    cues,
    looksLikeCrisis,
    mentionsOwnDeath,
    verseSafeFor,
    looksLikeMedical: test(MEDICAL),
    looksLikeIdentity: test(IDENTITY),
    looksLikeDecision: test(DECISION),
    looksLikeOffScope: test(OFFSCOPE),
    route,
  };
});
