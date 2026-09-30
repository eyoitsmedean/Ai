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

  const P = '(?:pills?|meds|medication|medicine|tablets|tylenol|paracetamol|acetaminophen|ibuprofen|advil|insulin|morphine|opioids?|oxy\\w*|fentanyl|sleeping pills|antidepressants|blood pressure meds|heart pills)';
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
    /\bhope (?:i|you) (?:dont|never|do not) wake up\b/,
    /\bdont deserve to (?:be here|live|be alive)\b/,
    /\bshould have been me\b/,
    /\bcant (?:go on|keep going|keep living|take (?:it|this) anymore)\b(?! at (?:work|school)| with (?:my|this) (?:boss|job|class))/,
    /\b(?:im|i am|i feel like) (?:just )?(?:a|such a) burden\b/,
    /\bwant to be with (?:my )?\w+ again\b.*\b(?:passed|died|gone|heaven)\b/,
    // intent, timing, goodbyes
    /\b(?:end|ending) (?:it|things|everything|it all|my suffering|my pain)(?: tonight| today| soon| now)?\b(?! with (?:him|her|them))/,
    /\btonight is the night\b(?! (?:we|for|to|of|when|that|i get|my)\b)/,
    /\b(?:made|got|have|found) (?:a|my) (?:plan|decision about how this ends|arrangements)\b/,
    /\bmade (?:my|the) arrangements\b/,
    /\bgoing to jump\b/,
    /\b(?:written|wrote|writing|left) (?:the|a|my) (?:note|notes|goodbye)\b(?! (?:for|to) (?:work|school|the teacher))|\b(?:written|wrote|writing|left) (?:the|my) (?:letters?|notes?) (?:to|for) my (?:kids|children|family|wife|husband|mom|parents)\b(?! for the| about)/,
    /\bthis is my last (?:message|post|goodbye)\b/,
    /\bgoodbye\b.*\b(?:sorry|last|forever|everyone|world)\b/,
    /\b(?:giving|gave|given) (?:away )?(?:my|all my) (?:things|stuff|belongings|dog|cat|pets?) away\b|\bgiving away my (?:things|stuff|belongings)\b|\bgave my (?:dog|cat|things|stuff) away\b/,
    /\bsaying goodbye to (?:everyone|people|everybody)\b/,
    /\bsaid goodbye to everyone\b/,
    /\blogging off for real\b/,
    /\b(?:accounts|affairs|everything) (?:are|is) (?:settled|in order|written down)\b/,
    // means
    new RegExp(`\\b${P}\\b.*\\b(?:lined up|ready|saved|saved up|stockpil\\w*|counted|in front of me|enough to)\\b`),
    new RegExp(`\\b(?:saved|saved up|stockpiled|hoarded|counted out) (?:enough |all )?(?:of )?(?:my )?${P}`),
    // A quantity is required: "taking my meds" is ordinary, "took all my meds" is not.
    new RegExp(`\\b(?:take|taking|took|swallow|swallowed|taken|ate|eaten) (?:all|all of|the whole bottle of|a bottle of|a whole bottle of|a bunch of|too many|\\d+|a handful of|the rest of) (?:my |the |of my |my moms |my dads |of )?(?:${P}|them)\\b`),
    new RegExp(`\\boverdosed on\\b`),
    /\b(?:ive|i have|i) (?:already )?swallowed them\b/,
    /\boverdos\w*\b(?!.* (?:died|passed))/,
    new RegExp(`\\bhow (?:much|many) ${P}\\b.*\\b(?:too much|to die|kill|lethal|not wake up|take to|overdose)\\b|\\bhow (?:much|many) ${P} is too much\\b`),
    /\bhow long does it take to (?:bleed out|die|drown|suffocate)\b/,
    /\bwhat floor\b.*\b(?:work|die|enough)\b/,
    /\bways to (?:die|kill (?:myself|yourself)|end it)\b/,
    /\b(?:bought|got|have|holding|loaded|cleaning|clean) (?:a|my|the) (?:gun|rope|pistol|rifle|service pistol|shotgun|noose)\b.*\b(?:tonight|looking at it|know what|going to do|every night|in front of me|on the table|ready|loaded)\b/,
    /\b(?:gun|pistol|rifle|rope|noose)\b.*\b(?:loaded|in front of me|on the table|keep looking at it|tonight)\b/,
    /\b(?:walk|walking|drive|driving|jump|jumping|step|stepping) (?:into|in front of|off|from) (?:the |a |an )?(?:lake|river|sea|ocean|oncoming traffic|traffic|train|bridge|building|roof|cliff|highway)\b/,
    /\bno guardrail\b/,
    /\bcar running\b.*\bgarage\b|\bgarage\b.*\bcar running\b/,
    new RegExp(`\\bstop(?:ped)? (?:eating|taking my ${P})\\b.*\\b(?:hoping|on purpose|takes care of itself|so i)\\b|\\bstop(?:ped)? taking my ${P} on purpose\\b`),
    // religious framing
    /\b(?:would|will|does) god (?:still )?forgive (?:me|someone|people|a person) (?:if|who|that) (?:i |they |he |she )?(?:kill|killed|end|ended|take|took|commit)\w*/,
    /\bwhat (?:does|did|would) (?:jesus|god|the bible) (?:say|think) about (?:people who )?(?:kill(?:ing)? (?:themselves|yourself)|end(?:ing)? (?:their|your|my) (?:own )?life|taking (?:their|your|my) (?:own )?life)\b/,
    /\bpeople who (?:kill themselves|end their (?:own )?lives?|end their life|take their own lives?)\b/,
    /\b(?:ready|want|going) to (?:meet jesus|see jesus|be with jesus|go home to (?:god|jesus))\b.*\b(?:tonight|today|now|arrangements)\b/,
    /\b(?:the lord|god|jesus) can (?:have|take) me (?:back|home|now)\b/,
    /\bim ready to go home\b/,
    /\bheaven\b.*\b(?:early|got there early|take me)\b/,
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
  ];

  const ASSAULT_EN = [
    /\b(?:raped|rape|sexually (?:assaulted|abused)|molested|molests|groped)\b/,
    /\bforced (?:me|her|him) (?:to have sex|into sex|to do (?:sexual|things))\b/,
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
    /\b(?:took|takes|hides|hid|destroyed) my (?:passport|phone|keys|car keys|id|documents|money)\b/,
    /\b(?:wont|will not|doesnt|does not) let me (?:leave|go out|see my|have money|out)\b/,
    /\blocked me (?:in|out)\b/,
    /\bcontrols (?:all )?(?:the |my )?money\b.*\b(?:checks my phone|wont let me|screams|calls me)\b/,
    /\bscreams at me\b.*\b(?:worthless|stupid|daily|every day)\b|\bcalls me worthless\b/,
    // the writer fears hurting someone
    /\b(?:want|going|gonna|scared im going|afraid im going|afraid i will|scared i will|about) to (?:hit|hurt|shake|beat|strangle|kill) (?:my )?(?:kid|kids|baby|child|children|son|daughter|wife|husband|partner)\b/,
    /\b(?:i )?(?:hit|pushed|shoved|shook|choked|slapped|beat|kicked) (?:my )?(?:wife|husband|partner|kid|kids|baby|child|son|daughter|girlfriend|boyfriend)\b/,
    /\bit gets physical\b/,
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
    // French, answered with the English notice (findahelpline lists France).
    /\bje veux mourir\b/,
    /\bme suicider\b/,
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
    if (hit(OTHER_EN)) return { kind: 'other', lang: 'en' };
    if (hit(DANGER_ES)) return { kind: 'danger', lang: 'es' };
    if (hit(DANGER_EN)) return { kind: 'danger', lang: 'en' };
    return null;
  }

  function looksLikeCrisis(text) {
    return assessCrisis(text) !== null;
  }

  const api = { assessCrisis, looksLikeCrisis };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_CRISIS = api;
})(typeof self !== 'undefined' ? self : this);
