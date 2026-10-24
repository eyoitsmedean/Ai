/**
 * Crisis language, in one place. The server requires this file and the page
 * loads it as a script, so the two can never drift apart again.
 *
 * Misses are the costly error: a false alarm shows a helpline, a miss answers
 * someone in danger with a devotional. So the cues are broad (plans, means,
 * goodbyes, passive wishes, "would God forgive me if...", worry for someone
 * else, abuse and assault), and ordinary idioms are removed first rather than
 * narrowing the cues ("this job is killing me", "die to self", "cut myself
 * shaving").
 *
 * Measured against test/fixtures/crisis-corpus.json: `npm run eval:crisis`.
 *
 * assessCrisis(text) -> null | { kind, lang }
 *   kind: 'self'    the writer may be in danger from themselves
 *         'other'   the writer fears for someone else's life
 *         'danger'  someone is hurting or threatening them (or they fear
 *                   they will hurt someone)
 *         'assault' sexual violence
 *   lang: 'en' | 'es' (the language of the words that matched)
 */
(function (root) {
  // --- normalising ----------------------------------------------------------

  // Spellings people use to slip past filters, and common typos.
  const RESPELL = [
    [/\bs\s?u\s?i\s?c\s?i\s?d\s?e\b/g, 'suicide'],
    [/\b(?:sewer ?slide|su+ic+ide|sui?ci?de|suiside|suic?ide|sucide|suicde|suacide)\b/g, 'suicide'],
    [/\bk[!1i|]ll\b/g, 'kill'],
    [/\bmysle?f\b|\bmyslef\b|\bmyelf\b/g, 'myself'],
    [/\bun ?alive\b/g, 'unalive'],
    [/\bmy self\b/g, 'myself'],
    [/\bwant(?:s)? to dye\b/g, 'want to die'],
    [/\bhusba?m?nd\b|\bhusbamd\b/g, 'husband'],
  ];

  function normalize(text) {
    let t = String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[‘’ʼ`´']/g, '')
      .replace(/[^a-z0-9!|\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    for (const [re, to] of RESPELL) t = t.replace(re, to);
    return ` ${t} `;
  }

  // Idioms and denials that look like danger and are not. Removed before the
  // cues run, so a real disclosure in the same message still matches.
  const IDIOMS = [
    /\bdie (?:to|of) (?:self|myself|the self|embarrassment|laughter|laughing|boredom|shame|cringe)\b/g,
    /\bready to die of \w+/g,
    /\bdying (?:to|for) (?:see|know|try|meet|hear|go|get)\b/g,
    /\b(?:killing|kill) (?:me|myself) (?:at|with|for) (?:work|the gym|laughter|laughing|this job|overtime)\b/g,
    /\bkilling myself (?:at|for) \w+/g,
    /\bkill(?:ed)? (?:myself|me) laughing\b/g,
    /\bkill for a\b/g,
    /\b(?:this|that|the|my|our|these|those) (?:\w+ ){0,2}(?:is|are|was|will|would)? ?(?:going to|gonna|will|is|are|about to) kill(?:ing)? (?:me|us)\b(?! when| if| because)/g,
    /\b(?:this|that|it|the \w+) (?:is|was) killing me\b/g,
    /\bmy (?:boss|teacher|coach|manager|professor|team|editor|landlord|supervisor) (?:is |will |would )?(?:going to|gonna|will|is about to) kill me\b/g,
    /\bcut (?:myself|my finger|my hand) (?:shaving|cooking|chopping|on|with|while)\b/g,
    /\b(?:hit|hits) (?:me|him|her) up\b/g,
    /\bhit (?:a|the) (?:home run|jackpot|road|gym|books)\b/g,
    /\bbeats? (?:me|him|her|us) at\b/g,
    /\bbeat (?:cancer|covid|the odds|it|the traffic)\b/g,
    /\b(?:im |i am )?not suicidal\b/g,
    /\b(?:would|will) never (?:hurt|kill|harm) myself\b/g,
    /\bdied (?:of|from) an overdose\b/g,
    /\b(?:dog|cat|plant|phone|battery|car|starter|sourdough) (?:died|is dying|is dead)\b/g,
    /\bkill (?:my|the|this) (?:sourdough|starter|plant|vibe|mood|battery|engine|lights)\b/g,
    /\bkilled the (?:sourdough|starter|plant|vibe|mood)\b/g,
  ];

  // --- cues (run on normalised, apostrophe-free text) -----------------------

  const P = '(?:pills?|meds|medication|medicine|tablets|tylenol|paracetamol|acetaminophen|ibuprofen|advil|insulin|morphine|opioids?|oxy\\w*|fentanyl|sleeping pills|antidepressants|blood pressure meds|heart pills|lithium|seroquel|zoloft|prozac|lexapro|wellbutrin|klonopin|xanax|ativan|valium|lorazepam|benadryl|my meds)';
  const FAMILY = '(?:son|daughter|kid|child|teen|friend|best friend|brother|sister|husband|wife|partner|boyfriend|girlfriend|mom|mother|dad|father|student|roommate|cousin|coworker|grandson|granddaughter|niece|nephew)';
  const ABUSER = '(?:he|she|they|my (?:husband|wife|boyfriend|girlfriend|partner|fiance|ex|ex husband|ex wife|dad|father|mom|mother|stepdad|stepfather|stepmom|stepmother|step dad|brother|sister|uncle|aunt|grandpa|grandfather|cousin|pastor|youth pastor|priest|coach|teacher|boss|son|daughter|roommate)|(?:my )?(?:husbands|wifes|boyfriends|girlfriends|partners|daughters|sons|sisters|moms|dads) (?:boyfriend|girlfriend|husband|wife|partner)|her (?:boyfriend|husband)|his (?:girlfriend|wife))';
  const HIT = '(?:hits|hit|hitting|beats|beat|beating|slaps|slapped|punch(?:es|ed)?|kick(?:s|ed)|chok(?:es|ed)|strangl(?:es|ed)|shov(?:es|ed)|push(?:es|ed)|threw \\w+(?: \\w+)? at|throws \\w+(?: \\w+)? at|burn(?:s|ed)|bit|drag(?:s|ged)|threaten(?:s|ed)|hurts|hurt|abus(?:es|ed)|put (?:his|her|their) hands on)';
  const VICTIM = '(?:me|us|my (?:mom|mother|sister|brother|kids?|son|daughter|children|baby|little \\w+))';

  const SELF_EN = [
    // explicit
    /\bsuicid\w*/,
    /\b(?:kill|killing|killed|off|offing|unalive|unaliving|hang|hanging|hurt|hurting|harm|harming|shoot|shooting|drown|drowning|starve|starving|yeet|yeeting) myself\b/,
    /\bkms\b/,
    /\bself ?harm\w*/,
    /\bcutting (?:again|myself|my (?:arms?|legs?|wrists?|thighs?))\b/,
    /\bbeen cutting\b(?! (?:carbs|back|down|sugar|out|costs|coupons|class|classes|school|grass|wood|hair|my hair|the))/,
    /\b(?:end|ending|take|taking|finish|finishing|make) my (?:own )?(?:life|end)\b/,
    /\bthinking (?:to|of|about) (?:finish|end|make) my (?:life|end)\b/,
    /\b(?:want|wanna|wanted|wanting|going|gonna|ready) (?:to )?die\b/,
    /\b(?:want|wanna) (?:to )?be dead\b/,
    /\bwish (?:i|id) (?:was|were|could be) dead\b/,
    /\bwish (?:i|id) (?:was|were|had) never (?:been )?born\b/,
    /\bbetter off dead\b/,
    /\bplanning (?:my|on) (?:death|dying|killing)\b/,
    // passive
    /\b(?:not|never) (?:to )?wake up\b/,
    /\b(?:dont|do not|dont really|no longer) (?:want|wanna|wish) (?:to )?(?:live|be alive|exist|be here|wake up|keep living|go on)\b/,
    /\bno (?:more )?(?:wish|will|desire|reason|point) (?:for|to|in|of)? ?(?:living|live|being alive|waking up|going on)\b/,
    /\b(?:see|see no|no|dont see a|dont see the|dont see any) point (?:in|of) (?:being alive|living|waking up|going on)\b/,
    /\b(?:whats|what is) the point (?:of|in) (?:anything|living|life|it all)(?: anymore)?\b/,
    /\bthere(?:s| is) no point anymore\b/,
    /\blife (?:isnt|is not|aint) worth (?:living|it)\b/,
    /\bnothing to live for\b/,
    /\b(?:tired|sick) of (?:living|being alive|life)\b/,
    /\b(?:nobody|no one|noone) would (?:miss|notice|care|even notice)\b.*\b(?:gone|dead|died|here|around|disappeared)\b(?! for a)/,
    /\b(?:better off|fine|happier|better) (?:without me|if (?:i|id) (?:was|were|wasnt|werent) (?:gone|here|around|alive|dead)|if i died)\b/,
    /\bthrow a party if i died\b/,
    /\b(?:i|me) (?:just )?want (?:it|it all|everything|this|the pain) to (?:stop|end|be over)(?: for good)?\b/,
    /\bwant it all to be over\b/,
    /\bdisappear (?:forever|for good|permanently)\b(?! on| to| at| in| for)/,
    /\b(?:not|wont be) (?:going to|gonna)? ?be (?:here|around) (?:tomorrow|much longer|next week|anymore|for long)\b/,
    /\bnot (?:going to|gonna) be around\b/,
    /\bmight (?:just )?not be here\b/,
    /\b(?:asking|begging|praying for) god to (?:take me|let me die)\b/,
    /\bwaiting to (?:die|stop breathing)\b/,
    /\bhope (?:i|you) (?:just |simply |never )?(?:dont|never|do not) wake up\b/,
    /\bdont deserve to (?:be here|live|be alive)\b/,
    /\bshould have been me\b/,
    /\bcant (?:go on|keep going|keep living|take (?:it|this) anymore)\b(?! at (?:work|school)| with (?:my|this) (?:boss|job|class))/,
    /\b(?:im|i am|i feel like) (?:just )?(?:a|such a) burden\b/,
    /\bwant to be with (?:my )?\w+ again\b.*\b(?:passed|died|gone|heaven)\b/,
    // intent, timing, goodbyes
    /\b(?:end|ending) (?:it|things|everything|it all|my suffering|my pain)(?: tonight| today| soon| now)?\b(?! with (?:him|her|them))/,
    /\btonights? (?:is )?the night\b(?! (?:we|for|to|of|when|that|i get|my)\b)/,
    /\b(?:made|got|have|found) (?:a|my) (?:plan|decision about how this ends|arrangements)\b/,
    /\bmade (?:my|the) arrangements\b/,
    /\bgoing to jump\b/,
    /\b(?:written|wrote|writing|left) (?:the|a|my) (?:note|notes|goodbye)\b(?! (?:for|to) (?:work|school|the teacher))|\b(?:written|wrote|writing|left) (?:the|my) (?:letters?|notes?) (?:to|for) my (?:kids|children|family|wife|husband|mom|parents)\b(?! for the| about)/,
    /\bthis is my last (?:message|post|goodbye)\b/,
    /\bgoodbye\b.*\b(?:sorry|last|forever|everyone|world)\b/,
    /\b(?:giving|gave|given) (?:away )?(?:my|all my) (?:things|stuff|belongings|dog|cat|pets?) away\b|\bgiving away my (?:things|stuff|belongings)\b|\bgave my (?:dog|cat|things|stuff) away\b/,
    /\bsaying goodbye to (?:everyone|people|everybody)\b/,
    /\bsaid goodbye to (?:everyone|everybody|all of them|my family)\b/,
    /\blogging off for real\b/,
    /\b(?:accounts|affairs|everything) (?:are|is) (?:settled|in order|written down)\b/,
    // means
    new RegExp(`\\b${P}\\b.*\\b(?:lined up|ready|saved|saved up|stockpil\\w*|counted|in front of me|enough to)\\b`),
    new RegExp(`\\b(?:saved|saved up|saving|been saving|saving up|stockpiled|stockpiling|hoarded|hoarding|collecting|counted out) (?:enough |all )?(?:of )?(?:my )?${P}`),
    // A quantity is required: "taking my meds" is ordinary, "took all my meds" is not.
    new RegExp(`\\b(?:take|taking|took|swallow|swallowed|taken|ate|eaten) (?:every|every single|all the|all|all of|the whole bottle of|a bottle of|a whole bottle of|a bunch of|too many|\\d+|a handful of|the rest of) (?:my |the |of my |my moms |my dads |of )?(?:${P}|pill|them)\\b`),
    new RegExp(`\\boverdosed on\\b`),
    /\b(?:ive|i have|i) (?:already )?swallowed them\b/,
    /\boverdos\w*\b(?!.* (?:died|passed))/,
    new RegExp(`\\bhow (?:much|many) ${P}\\b.*\\b(?:too much|to die|kill|lethal|not wake up|take to|overdose)\\b|\\bhow (?:much|many) ${P} is too much\\b`),
    /\bhow long does it take to (?:bleed out|die|drown|suffocate)\b/,
    /\bwhat floor\b.*\b(?:work|die|enough)\b/,
    /\bways to (?:die|kill (?:myself|yourself)|end it)\b/,
    /^(?!.*\b(?:deer|hunting|hunt|season|elk|duck|turkey|range|target practice)\b).*\b(?:bought|got|have|holding|loaded|cleaning|cleaned|clean) (?:a|my|the) (?:gun|rope|pistol|rifle|service pistol|shotgun|noose)\b.*\b(?:tonight|looking at it|know what|going to do|every night|in front of me|on the table|ready|loaded)\b/,
    /^(?!.*\b(?:deer|hunting|hunt|season|elk|duck|turkey|range|target practice)\b).*\b(?:gun|pistol|rifle|rope|noose)\b.*\b(?:loaded|in front of me|on the table|keep looking at it|tonight)\b/,
    /\b(?:walk|walking|drive|driving|jump|jumping|step|stepping) (?:into|in front of|off|from) (?:the |a |an )?(?:lake|river|sea|ocean|oncoming traffic|traffic|train|bridge|building|roof|cliff|highway)\b/,
    /\bno guardrail\b/,
    /\bcar running\b.*\bgarage\b|\bgarage\b.*\bcar running\b/,
    new RegExp(`\\bstop(?:ped)? (?:eating|taking my ${P})\\b.*\\b(?:hoping|on purpose|takes care of itself|so i)\\b|\\bstop(?:ped)? taking my ${P} on purpose\\b`),
    // religious framing
    /\b(?:would|will|does) god (?:still )?forgive (?:me|someone|people|a person) (?:if|who|that) (?:i |they |he |she )?(?:kill|killed|end|ended|take|took|commit)\w*/,
    /\bwhat (?:does|did|would) (?:jesus|god|the bible) (?:say|think) about (?:people who )?(?:kill(?:ing)? (?:themselves|yourself)|end(?:ing)? (?:their|your|my) (?:own )?life|taking (?:their|your|my) (?:own )?life)\b/,
    /\bpeople who (?:kill themselves|end their (?:own )?(?:lives?|life)|take their (?:own )?(?:lives?|life))\b/,
    /\b(?:ready|want|going) to (?:meet jesus|see jesus|be with jesus|go home to (?:god|jesus))\b.*\b(?:tonight|today|now|arrangements)\b/,
    /\b(?:the lord|god|jesus) can (?:have|take) me (?:back|home|now)\b/,
    /\bim ready to go home\b/,
    /\bheaven\b.*\b(?:early|got there early|take me)\b/,
    // oblique: what people write when they never use the word
    /\bjust know (?:that )?(?:it|this) (?:wasnt|isnt|was not|is not) (?:anyones|anybodys|your|yalls) fault\b/,
    /\b(?:if (?:i dont|i do not|i never|i die|im gone|im not here)|anything happens to me|when im gone)\b.*\b(?:wasnt|isnt|was not|is not|not) (?:anyones|anybodys|your|yalls) fault\b/,
    /\b(?:praying|hoping|pray|hope|wishing|wish) (?:that )?(?:the |my )?(?:cancer|tumou?r|illness|disease|heart attack|stroke) (?:comes back|come back|takes me|take me|gets me|kills me|wins)\b/,
    /\b(?:dont|wont|do not|will not) have to do it myself\b/,
    /\bhoping\b.{0,40}\b(?:doesnt|dont|never|wont|wouldnt) (?:end|wake up|wake)\b/,
    /\b(?:22|twenty two) a day\b.*\b(?:im|i am|ill|i will|tomorrow|tonight|me|number)\b/,
    /\b(?:tomorrow|tonight|soon) (?:im|i am|ill be|i will be) (?:number )?(?:23|twenty three)\b/,
    /\b(?:looked|looking|look|staring|stare|stared) (?:at|in|into|through) (?:whats in )?(?:the |my |our )?(?:medicine cabinet|pill bottles?|gun safe)\b(?! for\b)/,
    /\b(?:give|gave|leave|raise) (?:the|my) (?:baby|kids|children|son|daughter)\b.*\b(?:better (?:at it|mother|mom|parent|dad|father|off|than me))\b/,
    new RegExp(`\\b(?:stop|stopped|quit|quitting|stopping) (?:taking )?my ${P}\\b.*\\b(?:havent told|not told|didnt tell|wont tell|dont tell|no one knows|nobody knows|without telling|hoping|on purpose|let it|ready to go|so i|not going back|point)\\b`),
    new RegExp(`\\b(?:outlived|ready to go|burden|tired of|done with)\\b.*\\b(?:stop|stopped|quit|quitting) (?:taking )?my ${P}\\b`),
    /\boutlived my (?:usefulness|purpose|welcome|time)\b/,
    /\b(?:country|place|clinic|state) where (?:they )?(?:let you|you can|its legal to|it is legal to) (?:choose|die|end it|go peacefully)\b/,
    /\b(?:looking into|looked into|applying for|apply for|qualify for|signed up for) (?:euthanasia|assisted (?:dying|death)|maid|dignitas)\b/,
    /\b(?:arm|arms|wrist|wrists|thigh|thighs|leg|legs) (?:wont|will not|doesnt|isnt) stop(?:ping)?(?: bleeding)?\b/,
    /\bwont stop bleeding\b.*\b(?:dont want|not going|wont|dont) (?:to )?(?:call|tell|go)\b/,
    /^(?!.*\b(?:wedding|picnic|party|baptism|baptiz\w*|reunion|birthday|vacation|camping|shower|photos?|shoot|meeting|dinner|lunch|breakfast|eat|restaurant|funeral|memorial|burial|garden|tent|moving|recital|game|tournament|trip|retreat|anniversary|propos\w*|house|apartment|school|church plant|blind|deer|hunt\w*|fishing trip)\b).*\b(?:picked|picked out|chose|chosen|found|decided on) (?:the|a|my) (?:spot|place|bridge|tree)\b/,
    /\b(?:gets|get|will get) better\b.*\b(?:decided to stop|stop waiting|done waiting|not waiting anymore|stopped waiting)\b/,
    /^(?!.*\b(?:will|estate|insurance|lawyer|attorney|trust fund|deploy\w*|trip|travel\w*|business|work|shift|daycare|babysitter|vacation|surgery|out of town|overseas|at camp)\b).*\b(?:when|after|once|if) (?:im|i am|i was|im ever) (?:not around|no longer around|no longer here|gone)\b(?! (?:to|for|on|at|this|next|until|till|from)\b)/,
    /\b(?:tired|exhausted) in a way (?:that )?sleep (?:doesnt|dont|wont|cant|does not|will not) fix\b/,
    /\b(?:dont|do not) want to be (?:fixed|saved|rescued) anymore\b/,
    /\bis it (?:a sin|wrong|okay|ok) (?:if|to) (?:i |someone |a person )?(?:go|goes|going) home (?:to (?:the lord|god|jesus|heaven) )?(?:early|on purpose|now|tonight|sooner)\b/,
    /\bgo home to (?:the lord|god|jesus|heaven) (?:early|on purpose|tonight|sooner)\b/,
    /\bis it (?:a sin|wrong|unforgivable) (?:if|to) (?:i |someone |a person )?(?:end|ends|take|takes|stop|stops|kill|kills|die|dies)\b/,
    /^(?!.*\b(?:move|moving|trip|wedding|estate sale|divorce|deploy\w*)\b).*\b(?:gave|giving|given) (?:away )?my \w+ to\b.*\b(?:settled|taken care of|in order|wont need|last|goodbye)\b/,
    /^(?!.*\b(?:move|moving|trip|wedding|vacation|surgery|tax\w*|deploy\w*)\b).*\b(?:have|got|get|getting) everything (?:settled|in order|taken care of)\b/,
    new RegExp(`\\benough (?:of )?(?:my |the |these |those |his |her )?${P}\\b(?! for (?:the|a|our|my) (?:trip|week|month|vacation))`),
    /\bgo quiet(?:ly)?\b.*\b(?:pills|meds|for good|forever)\b|\b(?:pills|meds)\b.*\bgo quiet(?:ly)?\b/,
    /\bworth more dead\b/,
    /\binsurance\b.*\b(?:if (?:something|anything) (?:happened|happens|were to happen) to me|if i (?:was|were) gone|than (?:with )?me|than i am alive)\b/,
    /\b(?:wrote|written|writing|left) letters? (?:to|for) (?:my|each|everyone)\b.*\b(?:drawer|in case|take care of|one more thing|goodbye|find them|after im)\b/,
    /\bcut (?:again|deeper)(?: tonight| today| last night)?\b(?! (?:the|my|our|his|her|it|them|costs|back|down)\b)/,
    /\bdeeper than (?:before|last time|ever)\b.*\b(?:cut|stop|blood)\b|\bcut\b.*\bdeeper than (?:before|last time)\b/,
    /\bmade my peace\b.*\b(?:goodbye|tonight|ready|last)\b/,
    /\b(?:this is|this will be|its|pretty sure this is) my last (?:week|day|night|weekend|sunday|christmas|birthday|summer)\b(?! (?:at|of|on|in|before|here|working|with|as|for)\b)/,
    /\b(?:whats|what is) the point (?:of|in) (?:sticking around|staying around|being here)\b/,
    /\b(?:god|jesus|the lord|he) (?:to )?(?:will |would )?take me home (?:early|now|tonight|soon|sooner)\b|\btake me home early\b/,
    /\b(?:sidearm|service weapon|handgun|pistol|gun|rifle)\b.*\bloaded it\b|\bloaded it\b.*\bsitting (?:here )?with it\b|\bsitting (?:here )?with (?:it|the gun|my gun)\b.*\bloaded\b/,
    /\b(?:looking|look|staring|stare|keep looking) at (?:the|my|a) (?:rope|noose|gun|pistol|rifle|sidearm)\b/,
    /\b(?:gun|rifle|pistol|sidearm|shotgun|rope|noose)\b.*\b(?:keep looking at it|keep staring at it|staring at it|sitting (?:here )?with it|in my mouth|to my head|under my chin)\b/,
    /\b(?:rest|sleep)\b.*\bforever (?:kind|rest|sleep)\b|\bthe forever kind\b|\b(?:rest|sleep) forever\b/,
    /\b(?:ready|going|want|wanna) to stop fighting\b(?! (?:with|over|about)\b)(?! for (?!good\b))/,
    /\blook like an accident\b/,
    /\bi (?:gave|have given|am giving|been giving) (?:away )?(?:\w+ ){0,4}\b.*\b(?:wont|will not|not going to) (?:be )?need(?:ing)? (?:it|them|any of)\b/,
    /\b(?:thank you|thanks) for everything\b.*\b(?:take care of|goodbye|not answering|wont answer|sorry for)\b/,

  ];

  const OTHER_EN = [
    new RegExp(`\\b(?:my )?${FAMILY}s? (?:is|was|has been|keeps|says|said|told me|wrote|talks|texted)\\b.*\\b(?:suicid\\w*|wants? to die|wish(?:es)? (?:he|she|they) (?:was|were) dead|kill(?:ing)? (?:him|her|them)sel(?:f|ves)|end (?:his|her|their) life|cutting|doesnt want to be alive|dont want to be alive|ways to die|not (?:want|wanting) to live|own funeral)\\b`),
    /\b(?:he|she|they) (?:wants?|keeps saying (?:he|she|they) wants?) to (?:die|end (?:his|her|their) life|kill (?:him|her|them)sel(?:f|ves))\b/,
    new RegExp(`\\bmy ${FAMILY}s? (?:\\w+ ){0,2}(?:wants?|wanted|is going|is planning|tried|is trying) to (?:die|end (?:his|her|their) life|kill (?:him|her|them)sel(?:f|ves))\\b`),
    /\b(?:he|she|they)s? (?:is |are )?(?:suicidal|cutting (?:again|(?:him|her|them)sel(?:f|ves)))\b/,
    /\b(?:googling|searching|looking up) ways to die\b/,
    /\bkilling (?:himself|herself|themselves)\b/,
    /\bcoward for not having done it\b/,
    /\bdoesnt want to be alive\b/,
    /\bpasswords\b.*\bin case\b/,
    /\binsurance\b.*\bthan (?:with )?(?:him|her|them)\b/,
    /\b(?:he|she|they|my \w+) (?:\w+ ){0,2}gave away\b.*\b(?:wont|will not|isnt going to|not going to) (?:be )?need(?:ing)?\b/,
    /\b(?:he|she|they|my \w+) bought a (?:gun|rifle|pistol|handgun|rope)\b.*\b(?:doesnt|dont|never|does not) (?:hunt|shoot|own)\b/,
    /\b(?:died|passed|left)\b.*\b(?:he|she) bought a (?:gun|rifle|pistol|handgun)\b/,
    new RegExp(`\\b(?:he|she|they|my \\w+) (?:has|have|has been|is|been|keeps) (?:stockpil\\w*|saving|hoarding|collecting) (?:up )?(?:his|her|their) ${P}`),
    /\b(?:he|she|they) (?:has|have|told me (?:he|she|they) (?:has|have)|said (?:he|she|they) (?:has|have)) a plan\b/,
  ];

  const ASSAULT_EN = [
    /\b(?:raped|rape|sexually (?:assaulted|abused)|molested|molests|groped)\b/,
    /\bforced (?:me|her|him) (?:to have sex|into sex|to do (?:sexual|things))\b/,
    /\bforc(?:es|ed|ing) (?:himself|herself|themselves) on (?:me|her)\b/,
    /\bmakes me have sex\b|\bmade me have sex\b/,
    /\b(?:clothes off|naked|undressed|pants off|no clothes)\b.*\b(?:dont remember|cant remember|no memory|blacked out|drugged)\b|\b(?:drugged|roofied|spiked) (?:me|my drink)\b/,
    /\bi said no\b.*\b(?:didnt stop|kept going|wouldnt stop|did it anyway|kept doing it)\b/,
    /\b(?:didnt|wouldnt|did not|would not) stop when i (?:said|told him|told her) (?:no|stop|to stop)\b/,
    new RegExp(`\\b${ABUSER} (?:touches|touched|keeps touching) (?:me|her|him)\\b`),
    /\btouches me (?:at night|when|while|and)\b/,
  ];

  const DANGER_EN = [
    new RegExp(`\\b${ABUSER} (?:\\w+ ){0,2}${HIT} ${VICTIM}\\b`),
    new RegExp(`\\b${ABUSER} (?:\\w+ ){0,2}${HIT} her\\b`),
    /\b(?:threw|throws|throwing) (?:\w+ ){1,3}at (?:me|my head|my face)\b/,
    /\b(?:going|gonna|threatened|threatening|threatens|said (?:he|she|they)(?:ll| will| would)) (?:to )?kill me\b/,
    /\bkill me if i (?:leave|tell|go)\b/,
    /\b(?:im|i am|being) (?:being )?abused\b|\babusive (?:relationship|husband|wife|partner|boyfriend|girlfriend|home|marriage|parents?|dad|mom|father|mother)\b|\bin an abusive\b/,
    /\bmy (?:husband|wife|partner|boyfriend|girlfriend|dad|mom|father|mother|stepdad) is abusive\b/,
    /\babused me\b/,
    new RegExp(`\\b(?:scared|afraid|terrified|frightened) (?:of|for my life around) (?:my (?:husband|wife|boyfriend|girlfriend|partner|dad|father|stepdad|mom|ex)|him|her|what (?:he|she|they)(?:ll| will| would| might) do)\\b`),
    /\bafraid for my life\b/,
    /\b(?:dont|do not|no longer|never) feel safe (?:at home|with (?:him|her|them|my \w+)|in my (?:own )?home|anymore)\b/,
    /\bnot safe (?:at home|with (?:him|her|them)|in my (?:own )?home)\b/,
    /^(?!.*\b(?:beers?|drinks|drunk|drinking|glad (?:he|she|they) did)\b).*\b(?:took|takes|hides|hid|destroyed) my (?:passport|phone|keys|car keys|id|documents|money)\b/,
    /\b(?:wont|will not|doesnt|does not) let me (?:leave|go out|see my|have money|out)\b/,
    /\blocked me (?:in|out)\b/,
    /\bcontrols (?:all )?(?:the |my )?money\b.*\b(?:checks my phone|wont let me|screams|calls me)\b/,
    /\bscreams at me\b.*\b(?:worthless|stupid|daily|every day)\b|\bcalls me worthless\b/,
    // the writer fears hurting someone
    /\b(?:want|going|gonna|scared im going|afraid im going|afraid i will|scared i will|about) to (?:hit|hurt|shake|beat|strangle|kill) (?:my )?(?:kid|kids|baby|child|children|son|daughter|wife|husband|partner)\b/,
    /\b(?:i )?(?:hit|pushed|shoved|shook|choked|slapped|beat|kicked) (?:my )?(?:wife|husband|partner|kid|kids|baby|child|son|daughter|girlfriend|boyfriend)\b/,
    /\bit gets physical\b/,
    /\bkill me and (?:then )?(?:himself|herself|themselves|the kids)\b/,
    /\bif i (?:ever )?(?:left|leave|try to leave|tried to leave|told|tell)\b.*\b(?:kill me|take the kids|never see (?:them|the kids|my kids)|hurt (?:me|the kids))\b/,
    /\b(?:stopped|stop|stops|wont|doesnt|never) let(?:ting|s)? me (?:see|go|leave|talk to|have|out)\b/,
    /\bhands? (?:around|on|over) my (?:neck|throat|mouth)\b/,
    /\bnext time it (?:wont|will not|isnt going to) be the (?:wall|door|table|dog)\b/,
    /\bpunch(?:es|ed)? (?:the |a )?(?:wall|door|holes?)\b.*\b(?:my head|my face|next to me|next time|scared)\b/,
    /\b(?:my ex|he|she|they) (?:\w+ ){0,2}(?:showing up|shows up|showed up) (?:outside|at) (?:my|our|the kids)\b/,
    /\b(?:my ex|he|she|they) (?:\w+ ){0,2}(?:following me|follows me|stalking|stalks|tracking me|tracks my|tracked my)\b/,
    /\ballowed to (?:beat|hit) (?:my )?(?:kids|children|wife|husband)\b/,
  ];

  const SELF_ES = [
    /\bsuicid(?:io|arme|arse|a|as)\b/,
    /\bmatarme\b/,
    /\bme quiero (?:matar|morir)\b/,
    /\bquitarme la vida\b/,
    /\bacabar con (?:mi vida|todo)\b/,
    /\b(?:quiero|quisiera|deseo) morir(?:me)?\b/,
    /\bno quiero (?:seguir )?viv(?:ir|iendo)(?: mas)?\b/,
    /\bya no quiero (?:estar aqui|existir|despertar)\b/,
    /\b(?:hacerme dano|lastimarme|cortarme|autolesion\w*)\b/,
    /\bmejor (?:muerto|muerta)\b/,
    /\bno tengo (?:razon|razones|motivo|motivos) para vivir\b/,
    /\b(?:pido|pidiendo|ruego|rogando) a dios que me (?:lleve|recoja|lleve ya)\b/,
    /\bya no aguanto (?:mas|esto|nada)\b/,
    // French, answered with the English notice (findahelpline lists France).
    /\bje veux mourir\b/,
    /\bme suicider\b/,
  ];

  const OTHER_ES = [
    /\bmi (?:hijo|hija|esposo|esposa|marido|amigo|amiga|hermano|hermana|papa|mama|novio|novia) (?:\w+ ){0,3}(?:quiere (?:morir\w*|matarse|suicidarse)|se quiere (?:morir|matar)|habla de (?:morir\w*|matarse|suicid\w*))\b/,
  ];

  const DANGER_ES = [
    /\bme (?:pega|pego|golpea|golpeo|amenaza|amenazo|encierra|encerro)\b/,
    /\bme va a matar\b/,
    /\bno estoy (?:a salvo|segur[oa]) en (?:mi )?casa\b/,
    /\btengo miedo de mi (?:esposo|marido|novio|pareja|padre|papa)\b/,
    /\b(?:violencia domestica|me maltrata|maltrato)\b/,
  ];

  const ASSAULT_ES = [
    /\bme (?:violo|violaron|abuso sexualmente|toco|toca)\b/,
    /\babuso sexual\b/,
  ];

  // --- assess ----------------------------------------------------------------

  function assessCrisis(text) {
    let t = normalize(text);
    if (!t.trim()) return null;
    for (const re of IDIOMS) t = t.replace(re, ' ');
    const hit = (list) => list.some((re) => re.test(t));
    // The writer's own life first, then sexual violence, then someone else's
    // life, then other danger. Language follows the words that matched.
    if (hit(SELF_ES)) return { kind: 'self', lang: 'es' };
    if (hit(SELF_EN)) return { kind: 'self', lang: 'en' };
    if (hit(ASSAULT_ES)) return { kind: 'assault', lang: 'es' };
    if (hit(ASSAULT_EN)) return { kind: 'assault', lang: 'en' };
    if (hit(OTHER_ES)) return { kind: 'other', lang: 'es' };
    if (hit(OTHER_EN)) return { kind: 'other', lang: 'en' };
    if (hit(DANGER_ES)) return { kind: 'danger', lang: 'es' };
    if (hit(DANGER_EN)) return { kind: 'danger', lang: 'en' };
    return null;
  }

  function looksLikeCrisis(text) {
    return assessCrisis(text) !== null;
  }

  // A disclosure stays in force for the rest of the conversation: "How do I
  // forgive him?" two turns after "he hits me" is the same conversation.
  function assessConversation(texts) {
    const list = Array.isArray(texts) ? texts : [texts];
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const found = assessCrisis(list[i]);
      if (found) return found;
    }
    return null;
  }

  // --- which of his words to hold back after a disclosure --------------------

  // To someone who may end their life: nothing about dying, losing one's life,
  // crosses, graves, mourning, or cutting off a hand.
  const UNSAFE_SELF = /\b(?:die|dieth|died|dying|death|dead|kill\w*|slay|slain|lose (?:his|her|your|their|my) life|loseth|hate(?:th)? (?:not )?(?:his|her) (?:own )?life|life also|cross|grave|graves|sepulchre|tomb|mourn\w*|perish\w*|cut (?:it|them|him) off|pluck (?:it|them) out|hell|millstone|drowned|gnashing|destroy\w*|blood|bury|buried|burial|body)\b/i;
  // To someone being hurt: nothing that tells them to forgive, turn the other
  // cheek, reconcile, stay married, or look at their own fault.
  const UNSAFE_DANGER = /\b(?:enem(?:y|ies)|other (?:cheek|also)|resist not|seventy times|forgive|forgiveth|trespass\w*|his fault|beam|mote|adversary|asunder|put away (?:his|her) (?:wife|husband)|putteth away|joined together|despitefully|smite|smiteth|compel|cloke|judge not|reconciled|agree with|sin no more|condemn)\b/i;

  function unsafeSaying(kind, text) {
    if (!kind) return false;
    const re = kind === 'self' || kind === 'other' ? UNSAFE_SELF : UNSAFE_DANGER;
    return re.test(String(text || ''));
  }

  // Exact KJV; what a letter falls back on when the rest is held back.
  const SAFE_PASSAGES = {
    life: [
      { verse: 'Matthew 11:28', quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', context: 'The invitation is to the exhausted, exactly as you are tonight.' },
      { verse: 'Luke 12:7', quote: 'But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.', context: 'Your life is counted, hair by hair. It is not too small to keep.' },
      { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', context: 'Peace is left with you as a gift; you do not have to manufacture it.' },
    ],
    danger: [
      { verse: 'Luke 12:7', quote: 'But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.', context: 'You are of great worth. No one has the right to treat you as less.' },
      { verse: 'Matthew 14:27', quote: 'Be of good cheer; it is I; be not afraid.', context: 'He spoke this into a storm, to people who were afraid for their lives.' },
      { verse: 'Matthew 11:28', quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', context: 'Rest, not endurance, is what he offers the heavy-laden.' },
    ],
  };

  function safePassages(kind) {
    return kind === 'self' || kind === 'other' ? SAFE_PASSAGES.life : SAFE_PASSAGES.danger;
  }

  const api = { assessCrisis, assessConversation, looksLikeCrisis, safePassages, unsafeSaying };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_CRISIS = api;
})(typeof self !== 'undefined' ? self : this);
