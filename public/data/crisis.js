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

  // --- second pass: families found by a blind corpus (Oct 2026) -------------
  // The first lists matched exact phrasings; these catch the ways people
  // actually say the same things: passive wishes, means and rehearsal,
  // goodbyes and timelines, understatement, and parents afraid of their hands.

  const P2 = '(?:pills?|meds|medication|tylenol|seroquel|xanax|klonopin|ambien|trazodone|zoloft|lexapro|prozac|lithium|oxycodone|percocet|vicodin|hydrocodone|gabapentin|sleeping pills|insulin|heart pills)';
  const PLACE = '(?:bridge|overpass|parking garage|roof|rooftop|tracks|train tracks|edge|cliff|dam)';
  const GUN = '(?:gun|pistol|revolver|service revolver|service pistol|rifle|shotgun|glock|45|9mm)';

  const SELF_EN2 = [
    // asking God to end it, or to be with him now
    /\b(?:pray|praying|prayed|ask|asking|beg|begging|keep praying|keep asking)(?: that)? (?:god|the lord|jesus|him)(?: to)? (?:just )?(?:doesnt let me wake up|not let me wake up|take me|takes me|let me die|let me go|end it)\b/,
    /\b(?:lord|god|jesus|father) (?:please )?(?:just )?take me (?:home|now|tonight|in my sleep|away)\b/,
    /\b(?:is it (?:wrong|a sin|bad)) to (?:ask|pray|want) (?:god|jesus|the lord)? ?(?:to )?(?:let me die|take me|for death)\b/,
    /\b(?:just )?want to (?:go )?be with (?:you|jesus|the lord|god|him|her|them) (?:now|already|tonight)\b|\bplease dont make me stay\b/,
    /\bheaven (?:sounds|has to be|must be|is|seems) (?:so )?(?:much )?better than (?:here|this|living)\b.*\b(?:go now|wait|sooner|now|early|tonight)\b/,
    /\b(?:go|going) (?:to )?see (?:her|him|them|mom|dad|my \w+) sooner than\b/,
    /\b(?:just )?want to go now\b/,
    // passive wishes
    /\b(?:tired of|stop|stopped|done) existing\b|\b(?:dont|do not|no longer) want to exist\b|\bnot exist anymore\b/,
    /\bstop being here\b/,
    /\b(?:disappointed|sad|upset|angry) (?:that )?i (?:woke|wake) up\b|\bwake up disappointed\b/,
    /\bwouldnt be (?:so )?bad if (?:a|the|some) (?:truck|car|bus|train|drunk driver) (?:just )?hit me\b|\bwouldnt be (?:so )?bad if i (?:just )?(?:didnt wake up|died|crashed|never woke up)\b/,
    /\bdisappear\b.{0,40}\b(?:forever|for good|permanently)\b(?! (?:on|to|at|in|for|with))/,
    /\bnobody would have to deal with me\b/,
    /\b(?:cant|cannot|dont) (?:see|picture|imagine) (?:any|a|my) future\b|\bcant picture myself (?:next year|in a year|older|getting older)\b/,
    /\bif i (?:just )?(?:disappeared|was gone|were gone|died|stopped existing|wasnt here)\b.{0,30}\b(?:no ?one|nobody|noone|no body) would (?:even )?(?:notice|miss|care)\b/,
    /\b(?:no ?one|nobody|noone) would (?:even )?(?:notice|miss me|care) if i (?:just )?(?:stopped existing|disappeared|was gone|were gone|died|wasnt here)\b(?! for (?:a|the|\d|one|two|an))|\bno one would miss me\b|\bnobody would miss (?:me|an old man|an old woman)\b/,
    /\b(?:everyone|my family|my kids|my wife|my husband|they|he|she) (?:would|d|will) (?:all )?be better off\b(?! (?:at|in|with|going|moving|if we|financially|than))/,
    /\b(?:doing|do) (?:everyone|them|my family|the world) a favor\b/,
    /\bwont be (?:a burden|here|around) (?:anymore|much longer|to see it|for)\b|\bi wont be here to see\b|\bthis time tomorrow i wont\b/,
    /\b(?:wont|will not) be (?:a burden|in the way) anymore\b/,
    /\bjust waiting (?:to die|for it to be over)\b/,
    /\bshould (?:of|have|ve) died (?:over there|with (?:my|them|the|him|her))\b/,
    /\bwhy i (?:havent|have not) (?:yet|done it|done the same)\b|\b22 a day\b/,
    /\bnot sure ill be around much longer\b/,
    // means, rehearsal, and timeline
    new RegExp(`\\b(?:saving|stockpiling|hoarding|collecting|saving up|been saving|been stockpiling) (?:up )?(?:my |all my )?(?:\\w+ )?${P2}`),
    new RegExp(`\\b(?:looking|staring|stare|look) at (?:the|my|that|his|her) (?:\\w+ )?(?:${P2}|pill bottle|bottle|${GUN}|${PLACE}|rope|razor|noose)\\b.*\\b(?:thinking|think|how easy|about it|ready)\\b`),
    new RegExp(`\\bkeep (?:looking|staring) at (?:the|my|that) (?:\\w+ )?(?:${P2}|pill bottle|${GUN}|${PLACE}|rope|razor|noose)\\b`),
    /\b(?:would|will|could) get (?:the |my )?(?:sgli|life insurance|insurance money|insurance payout|policy money)\b/,
    /\bwould raise (?:them|my kids|him|her) better\b/,
    /\b(?:forgive|into heaven|go to heaven)\b.*\b(?:takes? (?:himself|herself|themselves) out|takes? (?:his|her|their|my) (?:own )?life|kill(?:s|ed)? (?:himself|herself|myself))\b.*\b(?:asking for me|for me|before|if i)\b/,
    /\bwant to go be with (?:him|her|them|my \w+) (?:and (?:jesus|god|the lord)|in heaven|again)\b/,
    new RegExp(`\\bcounting (?:them|the ${P2}|my ${P2}|the pills|out)\\b`),
    new RegExp(`\\bhow (?:much|many) (?:of )?(?:my |the |\\w+ )?${P2} (?:does it take|it takes|it would take|would it take|is too (?:much|many))\\b`),
    /\b(?:hurts the least|least painful|painless way|quickest way to go|fastest way to go)\b/,
    /\b(?:already|just) (?:took|swallowed|taken) (?:them|it all|all of them|all of it|the (?:whole )?(?:bottle|pills))\b|\btook them (?:like )?\d+ minutes ago\b/,
    new RegExp(`\\b(?:drove|drive|went|walked|sat|sitting|standing|stand|im|i am|parked) (?:to|at|on|by|near) the ${PLACE}\\b`),
    new RegExp(`\\b(?:drive|driving|drove|jump|jumping) (?:the truck |the car |my car |my truck )?off (?:the|an|a) ${PLACE}\\b`),
    new RegExp(`\\blooked up the (?:tallest|highest) (?:\\w+ )?${PLACE}\\b`),
    /\bmake it look like an accident\b/,
    new RegExp(`\\b(?:bought|got|have|loaded|load|cleaning|cleaned) (?:a|my|the|one) (?:${GUN}|round|bullet)\\b.*\\b(?:not for (?:protection|hunting|the range)|sat with it|in my mouth|till sunrise|tonight|looking at it)\\b`),
    new RegExp(`\\bloaded (?:the|my|one) (?:${GUN}|round)\\b`),
    /\b(?:one|single) trigger pull\b|\bpull the trigger\b(?! on)|\beat(?:ing)? my gun\b/,
    /\b(?:got|have|bought|tied) (?:the|a) (?:rope|noose)\b(?! for)/,
    /\b(?:razor|blade) (?:is )?(?:next to|beside|with|in front of) me\b/,
    /\bdont need (?:it|them|that|anything|my \w+) where im going\b/,
    /\b(?:i have|ive got|got) it (?:all )?(?:planned|figured) out\b.*\b(?:when|after|before|so|while|everyone|nobody|no one)\b/,
    /\bfigured out (?:the|how|the way) (?:i want to|im going to|to) go\b/,
    /\btake (?:myself|me) out\b(?! (?:for|to|of))/,
    /\btonights the night\b/,
    /\bforgive me for what im (?:about to|going to) do\b/,
    /\bthis is my last (?:night|day)\b(?! (?:in|at|here|of|before|with|on))/,
    // letters and goodbyes
    /\b(?:wrote|written|writing|left) (?:a )?letters? (?:to|for) (?:my|each of my|both|everyone|all)\b.*\b(?:just in case|find them|so they know|couldnt stay|after i|before i|when im gone|for after|i loved|goodbye|before)\b/,
    /\btell my (?:\w+ )?(?:and my \w+ )?(?:that )?i loved (?:them|her|him|you)\b/,
    /\b(?:say|saying|said|posted|texted me) (?:goodbye|bye forever)\b(?! to (?:my|the|our) (?:old )?(?:house|home|job|apartment|city|church|team|class|car))/,
    /\bnot scared anymore\b.*\bgoodbye\b|\bgoodbye\b.*\bnot scared anymore\b/,
    // self harm
    /\bcut myself\b(?! (?:shaving|cooking|chopping|on|with|while|by accident|accidentally|off))/,
    /\b(?:still|i|been|started|stopped) sh\b(?! (?:sh|sh sh))/,
  ];

  const OTHER_EN2 = [
    /\b(?:he|she|they|my \w+)(?:s| is| keeps| has been| keeps saying (?:hes|shes)) (?:saying )?(?:hes |shes |theyre )?ready to (?:go be with|meet the lord|go home|die|be with)\b/,
    /\bstopped taking (?:his|her|their) (?:\w+ )?(?:pills|meds|medication|insulin)\b/,
    /\b(?:giving|gave|gives) away (?:his|her|their) (?:stuff|things|tools|belongings)\b/,
    /\b(?:he|she|they) (?:has|have|had) a (?:rope|gun|pistol)\b.*\b(?:point|burden|figured out|truck|tonight)\b/,
    /\bdoesnt (?:see (?:the|any) point|want to be a burden)\b/,
    /\b(?:posted|texted|sent) (?:me )?(?:a )?(?:goodbye|bye forever)\b/,
    /\b(?:wrote|written) a letter to each of (?:her|his|their) kids\b|\bgave (?:them|it|the letters) to me just in case\b/,
  ];

  const ASSAULT_EN2 = [
    /\bforced (?:himself|herself) on me\b/,
    /\bcomes? (?:in|into) my room at night\b/,
    /\basked (?:her|him|me|my \w+) to send (?:him |her )?(?:pictures|pics|photos|nudes)\b/,
  ];

  const DANGER_EN2 = [
    /\b(?:keeps showing up|showed up|shows up|keeps driving by|driving by|drives by|parked outside)\b.*\b(?:my (?:house|job|work|school|window)|outside)\b|\bfollows me\b|\bfollowing me (?:home|everywhere|around)\b/,
    /\b(?:kill|hurt) me and (?:the kids|them|my kids|the baby)\b/,
    /\bshowed me (?:the|a) (?:knife|gun)\b/,
    /\b(?:never|nobody would (?:ever )?|no one would (?:ever )?)find my body\b|\bnext time it wont be\b|\bgoes after me\b/,
    /\bbroke my (?:nose|arm|ribs?|jaw|wrist|finger)\b/,
    /\bslapping (?:the kids|me|us|them) around\b/,
    /\bgrabbed (?:me|my \w+|her|him) by the (?:throat|neck|hair)\b/,
    // the writer fears what they might do
    /\b(?:thoughts|thinking|think) (?:about|of) (?:hurting|dropping|smothering|drowning|shaking|stabbing|killing) (?:her|him|my \w+|the baby)\b/,
    /\b(?:scared|afraid|terrified) to be alone with (?:her|him|the baby|my baby|my son|my daughter)\b/,
    /\b(?:im|i am|i think im|i keep thinking im|scared im|afraid im) (?:going to|gonna) (?:kill|stab|hurt) (?:somebody|someone|him|her)\b/,
    /\bfeel like im (?:going to|gonna) (?:stab|kill|hurt)\b/,
    /\bshook (?:him|her|the baby|my baby)\b/,
  ];

  const SELF_ES2 = [
    /\bquitar(?:me)? la vida\b/,
    /\bsi me mato\b|\bme voy a (?:tirar|aventar) (?:del|de la|al)\b|\bestoy en el puente\b/,
    /\bojala no (?:despertara|despierte|amanezca)\b/,
    /\bpastillas\b.*\b(?:todas|tomarmelas|tomarlas)\b/,
    /\bcarta\b.*\bdespues de que me vaya\b/,
    /\bsoy una carga\b/,
    /\bno quiero existir\b|\bdesaparecer para siempre\b/,
  ];

  const OTHER_ES2 = [/\bse quiere (?:matar|morir)\b/];

  const DANGER_ES2 = [
    /\bme sigue a todos lados\b/,
    /\bme ahorco\b|\bme estrangulo\b/,
    /\b(?:lastimar|pegarle|hacerle dano) a mi (?:bebe|hijo|hija)\b/,
    /\bganas de matar a\b|\ble hago algo\b/,
  ];

  // Past and recovered: a testimony is not a crisis unless something is
  // happening now. Present-tense markers keep a real disclosure live.
  const RECOVERED = /\b(?:\w+ (?:years?|months?) ago|years? back|used to|in (?:high school|\d+th grade|college)|been clean|im (?:doing )?(?:better|in a good place) now|doing better now|got baptized|testimony|found me in time|god (?:kept|brought|pulled) me|thank god|wanna thank god|want to thank god)\b/;
  const PRESENT = /\b(?:tonight|right now|rn|again|anymore|these days|lately|this week|keep (?:looking|thinking|counting)|about to|going to|gonna|still (?:want|do|think|cut)|next time)\b/;
  // Talking about someone who died by suicide, or a song, is not a disclosure.
  const ABOUT_OTHERS = /\b(?:died|passed) (?:by suicide|that way)\b|\b(?:dad|mom|father|mother|uncle|aunt|friend|brother|sister|cousin|son|daughter|grandpa|grandma)\b.*\b(?:died by|took (?:his|her|their) (?:own )?life|killed (?:himself|herself))\b/;
  const FIRST_PERSON_RISK = /\b(?:for me|i want|i just want|i wanna|i keep|im going|myself|my own life|me too)\b/;
  const SONG = /\b(?:song|lyrics?|humming|album|singing along)\b/;
  const JOKING = /\b(?:lol|lmao|lmfao|haha\w*|jk|rofl)\b/;
  const SINCERE = /\b(?:fr|for real|not joking|srsly|seriously|no joke)\b/;
  const ILLNESS = /\b(?:cancer|hospice|terminal|chemo|diagnos\w*|doctor says|stage \d|tumou?r)\b/;

  function guarded(t) {
    if (RECOVERED.test(t) && !PRESENT.test(t)) return true;
    if (ABOUT_OTHERS.test(t) && !FIRST_PERSON_RISK.test(t)) return true;
    if (SONG.test(t) && !PRESENT.test(t)) return true;
    return false;
  }

  // --- assess ----------------------------------------------------------------

  function assessCrisis(text) {
    let t = normalize(text);
    if (!t.trim()) return null;
    for (const re of IDIOMS) t = t.replace(re, ' ');
    // Context that turns a cue into a figure of speech.
    if (JOKING.test(t) && !SINCERE.test(t)) t = t.replace(/\bkms\b/g, ' ');
    t = t.replace(/\b(?:mom|dad|mother|father|parents|wife|husband|boss|teacher|coach)(?: is| are)? (?:gonna|going to) kill me when (?:she|he|they) (?:sees?|finds? out|hears?)\b/g, ' ');
    t = t.replace(/\bstarv\w* myself of\b/g, ' ');
    if (ILLNESS.test(t)) t = t.replace(/\b(?:might|may|wont|will not) (?:not )?be (?:around|here) (?:much longer|for long)\b/g, ' ');
    const hit = (list) => list.some((re) => re.test(t));
    const past = guarded(t);
    // The writer's own life first, then sexual violence, then someone else's
    // life, then other danger. Language follows the words that matched.
    if (!past && (hit(SELF_ES) || hit(SELF_ES2))) return { kind: 'self', lang: 'es' };
    if (!past && (hit(SELF_EN) || hit(SELF_EN2))) return { kind: 'self', lang: 'en' };
    if (hit(ASSAULT_ES)) return { kind: 'assault', lang: 'es' };
    if (hit(ASSAULT_EN) || hit(ASSAULT_EN2)) return { kind: 'assault', lang: 'en' };
    if (!past && hit(OTHER_ES2)) return { kind: 'other', lang: 'es' };
    if (!past && (hit(OTHER_EN) || hit(OTHER_EN2))) return { kind: 'other', lang: 'en' };
    if (hit(DANGER_ES) || hit(DANGER_ES2)) return { kind: 'danger', lang: 'es' };
    if (hit(DANGER_EN) || hit(DANGER_EN2)) return { kind: 'danger', lang: 'en' };
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
