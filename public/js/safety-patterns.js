/* Safety detection shared by the server (lib/scripture.js) and the page
   (crisis.js), so both sides always reach the same verdict for a message.

   Three kinds:
     'crisis'  — suicidality or self-harm
     'assault' — sexual assault or sexual abuse
     'danger'  — physical abuse, violence, threats, not being safe at home

   Text is normalised first (lower case, apostrophes removed, whitespace
   collapsed) and common idioms that borrow this vocabulary are scrubbed out
   ("kill myself laughing", "hit me up", "beats me at scrabble") before any
   pattern runs. A match whose span carries a negation ("he would never hurt
   me") is discarded. Patterns are written against the normalised text, so
   they never contain apostrophes. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RedLetterSafety = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[\u2018\u2019\u02bc']/g, '')
      .replace(/[\u201c\u201d"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Ordinary speech that shares words with the patterns below. Each is
  // removed before detection runs.
  const IDIOMS = [
    /\bkill(ing)? myself (laughing|trying|at work|over (this|it)|to (get|make|finish|keep|pay)|working|for (this|that|a) (job|company|deadline|paycheck|test))\b/g,
    /\b(die|dying|died) (of|from) (embarrassment|laughter|laughing|boredom|shame|cringe|curiosity|thirst|hunger)\b/g,
    /\bdying to (see|know|hear|try|meet|go|tell|find out|get)\b/g,
    /\bwant(ed)? to die (of|from) (embarrassment|shame|laughter)\b/g,
    /\boverdos(e|ed|ing) on (coffee|caffeine|sugar|netflix|chocolate|carbs|cake|pizza|candy|espresso|tv)\b/g,
    /\bcut myself (shaving|on (a|the|some) \w+|with (a|the) (knife|scissors|blade) (while|when) (cooking|chopping|opening))\b/g,
    /\bhurt myself (at the gym|lifting|running|playing|working out|skiing|skating|falling|on the (stairs|ice))\b/g,
    /\bjump(ed|ing)? off (the|a|my) (couch|bed|chair|wall|step|deck|dock|diving board|swing|table|stage|boat)\b/g,
    /\b(this|that|the) (heat|traffic|weather|commute|workload|hill|exam|test|deadline|homework|class|schedule|week|move|project|job|humidity|cold|wait|suspense) is (going to|gonna) kill me\b/g,
    /\b(my|the) (boss|coach|teacher|professor|manager|trainer|editor|landlord|mom|mother|dad|father|parents|wife|husband|partner|girlfriend|boyfriend) (is|are) (going to|gonna) kill me (when|if) (she|he|they) (sees?|finds? out|hears?|reads?|gets? (home|the bill|back)|knows?|learns?|realizes?|opens?)\b/g,
    /\bbeats? me (at|in) (\w+ )?(scrabble|chess|cards|checkers|monopoly|golf|tennis|every game|the game|a game|it|everything|poker|basketball|racing|running|a race|the race|the match|wordle|trivia|mario|fortnite|ping pong|pool|darts|bowling)\b/g,
    /\bbeats? me (home|there|to (it|the|a|my)\b)/g,
    /(^|[.!?,;] ?)beats me( why| how| what| where| when| who|,|\.|$)/g,
    /\bhits? me up\b/g,
    /\bhit me with a (pillow|snowball|water balloon|nerf \w+|foam \w+|balloon|towel|noodle)\b/g,
    /\b(die|dying|died) laughing\b/g,
    /\bwant(ed|s)? to die laughing\b/g,
    /\b(so long|so boring|so awkward|so embarrassing|so cringe|so bad)[^.!?]{0,24} i wanted to die\b/g,
    /\bcut myself (chopping|slicing|dicing|cooking|opening|while (cooking|chopping|shaving|opening))\b/g,
    /\bhang myself out to dry\b/g,
    /\bcut (myself|my ?self) off (from|because)\b/g,
    /\bcut (myself|my ?self) some slack\b/g,
    /\bending things with (the|a|our|my) (contractor|vendor|supplier|agency|company|firm|client|landlord|realtor|team)\b/g,
    /\bhit me with (the |a |an |some |another |great |big |tough |hard |that |this |quite (a|the) )*(news|question|questions|idea|bill|invoice|truth|fact|facts|reality|surprise|announcement|update|request|joke|line|story|price|quote|feels|nostalgia|memories|a wave of)\b/g,
    /\bit hit me (that|like|hard|when|how)\b/g,
    /\b(really |just |finally )?hit me (that|how|like a ton of bricks)\b/g,
    /\bslapped me on the (back|shoulder|arm)\b/g,
    /\bslap on the wrist\b/g,
    /\bkicked (me|us) (out|off)\b/g,
    /\bpushed (me|us) to (be|do|try|finish|work|study|apply|go|become|grow)\b/g,
    /\bpush(es|ed|ing)? (me|us) (too )?hard\b/g,
    /\bbeat (them|us|me) (\d|by|in the (game|match|final|first))\b/g,
    /\bmy team beat\b/g,
    /\brapes? the (couch|pillow|cushion|cushions|blanket|bed|toy)\b/g,
    /\bthrew (me|us) a (party|shower|surprise|lifeline|bone)\b/g,
    /\bkill (it|them|the game|the interview|the presentation|the show|time)\b/g,
    /\bkill(ed|ing)? (my|the) (mood|vibe|buzz|appetite|battery|engine|lights|plants?|grass|weeds|bacteria|germs|mosquitoes|bugs|time)\b/g,
    /\bhurt(s)? (my|their|his|her) feelings\b/g,
  ];

  function scrub(text) {
    let t = normalize(text);
    for (const re of IDIOMS) t = t.replace(re, ' ');
    return t.replace(/\s+/g, ' ');
  }

  // Someone the writer lives with or depends on. Used where a physical verb
  // needs a human subject so "the ball hit me" never counts.
  // Someone the writer lives with or is bound to; "is abusive" from one of
  // these is a hotline case, where the same words about a boss are a
  // workplace question.
  const HOUSEHOLD = '(?:he|she|they|hes|shes|theyre|my (?:ex[- ]?)?(?:husband|wife|spouse|partner|boyfriend|girlfriend|bf|gf|fiance|fiancee|dad|father|stepdad|stepfather|mom|mother|stepmom|stepmother|brother|sister|stepbrother|stepsister|son|daughter|uncle|aunt|grandfather|grandpa|grandmother|grandma|cousin|roommate|caregiver|carer|parents?|family|ex)|(?:the|a|this) (?:man|guy|person|woman) (?:i|we) (?:live with|am with|are with|am dating|married|know))';
  const PERSON = '(?:' + HOUSEHOLD + '|my (?:boss|coach|teacher|pastor|neighbou?r|landlord|manager|supervisor|professor))';
  const VICTIM = '(?:me|us|my (?:\\w+ )?(?:kids?|children|child|son|daughter|baby|brother|sister|sibling|mom|mother|dad|father|wife|husband|partner|family)|the (?:kids|children|baby))';
  const FEAR_OF = '(?:him|her|them|my (?:ex[- ]?)?(?:husband|wife|spouse|partner|boyfriend|girlfriend|bf|gf|fiance|fiancee|dad|father|stepdad|stepfather|mom|mother|stepmom|stepmother|brother|sister|stepbrother|stepsister|son|uncle|grandfather|grandpa|cousin|roommate|ex|parents?))';

  const CRISIS = [
    /\b(su[i]?c[i]?d\w*|suiside|suecide|sewerslide)\b/,
    /\bkill(ing)? my ?self\b/,
    /\b(kms|kys)\b/,
    /\b(off|unalive|unaliving) my ?self\b/,
    /\bunalive\b/,
    /\bend(ing)? (my|it) (own )?(life|all)\b/,
    /\bend(ing)? (things|it) (tonight|today|now|soon|for good|this week|before|once and for all)\b/,
    /\bending (my (own )?life|it all)\b/,
    /\btak(e|ing) my (own )?life\b/,
    /\bwant(s|ed)? to (die|be dead|not exist|stop existing|disappear (forever|for good|and never come back))\b/,
    /\bwanna (die|be dead|disappear forever)\b/,
    /\bwish i (was|were|could be|wasnt|werent|was not|were not) (dead|gone|never born|not here|here|alive|around|born)( anymore)?\b/,
    { re: /\bwish i (could|would) (die|disappear|not wake up|never wake up|just (die|disappear|sleep forever))\b/, neg: false },
    /\b(would )?rather be dead\b/,
    /\brather (die|be dead) than\b/,
    /\bdeserve to (die|be dead|suffer|not exist)\b/,
    /\bwish i (didnt|did not|dont|do not) exist\b/,
    /\b(dont|do not|didnt|cant|can not|cannot|no longer|not) (really )?want to (live|be alive|be here|exist|wake up|go on|carry on|keep (going|living)|be around)( anymore)?\b/,
    /\bdont wanna (live|be here|exist|wake up|be alive)\b/,
    /\b(everyone|everybody|my family|the world|they) would be (better|happier) (off )?without me\b/,
    /\b(nobody|no one|noone) would (even )?notice if i (was|were|wasnt|disappeared|died|left|vanished)\b/,
    /\bbetter off (dead|without me|if i (was|were|wasnt|werent) (dead|gone|here|around|alive))\b/,
    /\b(nobody|no one|noone) would (miss me|even notice|care if i (died|was gone|disappeared|wasnt here))\b/,
    { re: /\b(go to sleep|fall asleep|sleep) and (never|not) wake up\b/, neg: false },
    { re: /\bnever wake up\b/, neg: false },
    { re: /\b(want to|hope i|hoping i|wish i|hope to|praying i|pray i) (not wake up|dont wake up|do not wake up|never wake up)\b/, neg: false },
    /\bcant (go on|take it anymore|take this anymore|keep (going|living)|live like this|do this anymore|carry on)\b/,
    /\b(no|whats the|dont see (a|the|any)) point (in|of|to) (living|going on|life|anything|trying|being here)\b/,
    /\bno point (anymore|in anything)\b/,
    /\bnot worth living\b/,
    /\blife (isnt|is not|aint|is no longer) worth (living|it)\b/,
    /\bno reason to (live|keep going|go on|stay alive|be here)\b/,
    /\bnothing (left )?to live for\b/,
    /\bwant (it all|everything|the pain|it) to (end|stop|be over)[, ]*(forever|for good|permanently|completely)\b/,
    /\bwant to (end|stop) (it all|everything)\b/,
    /\b(ready|planning|plan|going|gonna|about|decided) to (die|end (it|things|my (own )?life|it all)|kill my ?self|take my (own )?life|do it tonight)\b/,
    /\bplanning (my )?(death|suicide|to end|on ending)\b/,
    /\b(tonight|today) (is|will be|might be) (the|my) last (night|day)\b/,
    /\bgoodbye (everyone|world|forever|cruel world)\b/,
    /\b(writing|wrote|written) (my |a |the )?(suicide |goodbye |final )?(notes?|letters? to everyone|goodbye letters?|farewell letters?)\b/,
    /\bsay(ing)? goodbye to everyone\b/,
    /\b(have|got|lined up|counted|counting|stockpil(ed|ing)|saving|saved|hoarding) (the |my |some |enough |a bottle of |all the |all my )?(pills|rope|gun|blade|razor|razors|bullets|a plan)\b/,
    /\bbought (a |some |the |my )?(rope|noose|pills|razor blades|blades)\b/,
    /\b(have|got) a (plan|method|date|gun|rope|noose)( and (a|the) (plan|means|gun|rope))?( to (die|end|do it|kill myself))?\b/,
    /\bpills (lined up|ready|counted out|next to me|in my hand)\b/,
    /\b(took|swallowed|taken|take) (too many|a bunch of|all my|all the|all of my|a bottle of|a handful of|the whole bottle of|every) (pills|tablets|meds|medication|pill)\b/,
    /\boverdos/,
    /\bhang(ing|ed)? my ?self\b/,
    /\b(shoot|shooting|shot) my ?self\b/,
    /\bslit(ting)? my (wrists?|throat)\b/,
    /\bcut(ting)? my ?self\b/,
    /\b(i keep|started|been|still) cutting\b/,
    /\bcut(ting)? again\b/,
    /\bburn(ing|ed|t)? my ?self\b/,
    /\bhurt(ing)? my ?self\b/,
    /\bto punish my ?self\b/,
    /\bon purpose to (hurt|punish|harm) my ?self\b/,
    /\bself[- ]?harm/,
    /\bjump(ing)? (off|from|out of) (a |the |my |this )?(bridge|building|roof|balcony|window|cliff|overpass|ledge|parking (garage|deck)|top floor|\d+(th|st|nd|rd) floor)\b/,
    /\b(step|walk|jump) (in front of|into) (traffic|a (car|train|bus|truck)|the (train|traffic|road))\b/,
    /\bdrive (my car |the car )?(into|off) (a |the )?(tree|wall|bridge|cliff|barrier|river|lake)\b/,
    /\bstop (existing|living|being alive)\b/,
    /\b(not|dont) (want to )?exist anymore\b/,
    /\bcease to exist\b/,
    /\bthinking (about|of) (suicide|killing myself|ending (it|it all|my life|things)|dying (a lot|every day|constantly)|hurting myself|not being here|not waking up|taking my life)\b/,
    /\bthoughts (of|about) (suicide|killing myself|dying|death|ending (it|my life)|hurting myself|not being (here|alive))\b/,
    /\bdeath (would be|seems like|feels like) (a relief|easier|the (only|best) (way|option|answer))\b/,
    /\b(want|wanted|wanting) to (hurt|harm|punish) my ?self\b/,
    /\bstarv(e|ing|ed) my ?self\b/,
  ];

  const ASSAULT = [
    /\b(was|were|been|got|get|gets|getting|being|am|is|are) (being )?(raped|molested|sexually (assaulted|abused|harassed|violated)|violated|groped|touched inappropriately)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(raped|rapes|molested|molests|molesting|sexually (assaulted|abused|abuses|abusing)|assaulted|groped|gropes)\\b[^.?!]{0,20}?\\b' + VICTIM + '\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\bforced (me|us|himself|herself|themselves) (to have sex|into sex|to do (sexual|things|it)|on (me|us)|to touch|to (undress|strip|perform)|into (bed|it))\\b'),
    /\bforc(ed|es|ing) (himself|herself|themselves) on (me|us|my)\b/,
    /\bforc(es|ed|ing) (me|us) (to have sex|into sex|to do (sexual|things|it)|to touch|to (undress|strip|perform)|into (bed|it))\b/,
    /\bmy (stepdad|stepfather|uncle|dad|father|brother|stepbrother|cousin|grandfather|grandpa|stepmom|stepmother|mom|mother|aunt|teacher|coach|pastor|priest|babysitter|neighbou?r|boyfriend|husband|partner|boss|landlord|roommate) (touches|touched|keeps touching|has been touching|is touching|gropes|groped) me\b/,
    /\b(stepdad|stepfather|uncle|dad|father|coach|teacher|pastor|priest|babysitter|neighbou?r|brother|stepbrother|cousin|grandfather|grandpa|boyfriend|husband|friend of (his|hers|the family)|family friend) (touched|touches|has been touching|is touching|molested|molests|raped|rapes|groped) (her|him|them|my (son|daughter|child|kids?|children))\b/,
    /\b(someone|he|she|they|a (man|guy|boy|coach|teacher|pastor|priest|relative|friend|stranger|date)) (raped|molested|assaulted|groped|drugged and|forced himself on|forced herself on) (me|us|my)\b/,
    /\brape[ds]? (me|us|my)\b/,
    /\b(the|my|his|her|that) (rape|molestation|sexual assault|sexual abuse|assault) (last|when|that|i|by|in|at|happened|two|three|years|months|weeks)\b/,
    /\b(i|we) (was|were|am|got|have been) (a )?(rape|sexual assault|sexual abuse|incest|molestation) (victim|survivor)\b/,
    /\b(sexual(ly)? (assault|abuse|abused|assaulted)|molest|incest)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\btouch(es|ed|ing)? (me|us|my (?:\\w+ )?(?:son|daughter|kids?|children|child|brother|sister|body|private|privates|chest|breasts?|thigh|leg|genitals))\\b[^.?!]{0,30}?(at night|inappropriately|when (i|we) (sleep|am asleep|are asleep)|under (my|the)|in my sleep|where (he|she) (shouldnt|should not)|in (my|the|our) (private|bathing suit|swimsuit) (area|parts|places)|down there|between my legs|while i (sleep|slept|was sleeping))'),
    /\btouch(es|ed|ing)? (me|my (son|daughter|child|kids?)) (at night|inappropriately|in my sleep|down there|between (my|the) legs)\b/,
    /\b(made|makes|making) me (have sex|do sexual|touch (him|her|his|it)|watch (porn|him|her)|undress|strip|take (off )?my clothes)\b/,
    /\bdate rape\b/,
    /\b(drugged|roofied) (me|my drink|us)\b/,
  ];

  const DANGER = [
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(hit|hits|hitting|beat|beats|beating|beat up|choked?|chokes|choking|strangled?|strangles|strangling|punched|punches|punching|slapped|slaps|slapping|kicked|kicks|kicking|shoved|shoves|shoving|dragged|drags|dragging|burned|burnt|burns|burning|bit|bites|spat on|spits on|smacked|smacks|smacking|whipped|whips|stabbed|stabs|shot|shoots|headbutted|hurts|physically hurts?|hurting|abused|abuses|abusing|attacked|attacks|attacking|assaulted|assaults|battered|batters|threw (\\w+ )?at)\\b[^.?!]{0,20}?\\b' + VICTIM + '\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(threw|throws|throwing|pushed|pushes|pushing|shoved|shoves|slammed|slams|knocked|knocks|pinned|pins|dragged|drags) ' + VICTIM + ' (against|into|down|across|out of|onto|to the (ground|floor|wall)|over|off|through|around)\\b'),
    /\b(threw|throws|throwing|thrown|chucked|hurled|launched) (things|stuff|plates|objects|dishes|bottles|glasses|furniture|a (plate|glass|bottle|chair|phone|remote|cup|mug|book|shoe|lamp|vase)|the (plate|glass|bottle|chair|phone|remote|cup|mug|book|shoe|lamp|vase)|his (phone|shoe|drink|beer)|her (phone|shoe|drink)) at (me|us|my|the kids|the children|our)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\b(grabbed|grabs|grabbing|squeezed|squeezes) my (neck|throat|hair|face|jaw|arm so|wrist so|arms so)\\b'),
    /\bgrabbed (me|us) by the (throat|neck|hair|arm|wrist|face|jaw|collar|shirt)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\bhurt (me|us) again\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\bforc(es|ed|ing) (me|us)( |$|\\.|,)(?!to (move|work|go to (church|school|work)|eat|clean|study|apologi|pay|sell|attend|quit|change|wear|cook|call|visit|choose))'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\bthrows? (things|stuff|plates|objects|dishes|bottles|glasses|furniture|a (plate|glass|bottle|chair|phone|remote)|the (plate|glass|bottle|chair|phone|remote)) at (me|us|my)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(grabbed|grabs|grabbing|held|holds|holding) (me|us|my (?:\\w+ )?(?:son|daughter|kids?|child|children|arm|wrist|neck|throat|hair|face|jaw)) (by the (throat|neck|hair|arm|wrist|face|jaw|collar)|down|against|so hard|until|so tight)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(put|puts|putting|laid|lays|laying|lay) (his|her|their) hands on (me|us|my)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(locked|locks|locking) (me|us|my (?:\\w+ )?(?:son|daughter|kids?|child|children)) (in|out of the house|outside|in (the|a|my) (room|closet|basement|bathroom|car|garage|bedroom)|up)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(broke|fractured|cracked|dislocated|bruised|blackened|split|busted) my (arm|nose|jaw|rib|ribs|wrist|finger|fingers|lip|eye|cheek|collarbone|leg|hand|skull|tooth|teeth|eardrum)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(gave|gives|left|leaves|giving) (me|us|my (?:\\w+ )?(?:son|daughter|kid|child)) (a )?(bruises?|a black eye|black eyes|a bloody (nose|lip|mouth)|welts|marks|cuts|a concussion|scars|a busted lip|a split lip|a fat lip)\\b'),
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,40}?\\b(threaten(s|ed|ing)?|threats?) (me|us|my (?:\\w+ )?(?:kids?|children|child|son|daughter|family|life|mother|mom|dad|father|brother|sister|dog|cat)|to (kill|hurt|hit|beat|shoot|stab|burn|strangle|choke|find|track|take (the|my|our) (kids|children|baby|son|daughter)|leave me (dead|on the street|with nothing)|ruin|destroy|expose|report|deport|have me (killed|deported|arrested)|kick me out|throw me out|cut me off|take everything|kill (himself|herself) if))\\b'),
    /\bthreaten(s|ed|ing)? (to (kill|hurt|hit|beat|shoot|stab|burn|strangle|choke)|me|us|my (life|kids?|children|family))\b/,
    /\b(pulled|pulls|pointed|points|held|holds|put|puts|has|had|waved|waves|brought|brings|keeps|kept) (a|his|her|the|their) (gun|knife|weapon|pistol|rifle|blade|machete|bat|hammer) (on|to|at|against|near|toward|towards|by) (me|us|my)\b/,
    /\b(pulled|pulls) a (gun|knife|weapon) (on|out on)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\b(said|says|told me|tells me|promised|swore|swears|warned|warns|is going to|is gonna|s going to|s gonna|gonna|will|would|might|wants to|tried to|tries to|trying to|threatened to|could) [^.?!]{0,25}?\\b(kill|murder|hurt|beat|shoot|stab|strangle|choke|bury|end|find|hunt) (me|us|my (?:\\w+ )?(?:kids?|children|child|son|daughter|family|mother|mom|dad|father|brother|sister))\\b'),
    /\b(hes|shes|theyre|he is|she is|they are|he s|she s) (gonna|going to|about to|threatening to|trying to) (kill|hurt|beat|shoot|stab|strangle|choke|find|murder) (me|us|my)\b/,
    /\b(i am|im|we are|were|i have been|ive been|weve been|i was|we were|i keep|i get|i got|being|getting|got|gets) (being |getting )?(abused|beaten|beat up|beaten up|battered|assaulted|attacked|strangled|choked|hit|punched|slapped|kicked|threatened|hurt physically|physically (hurt|abused|assaulted|attacked))( by| at home| every| again| when| since| for| and| last| in my| daily| regularly| since| a lot|$|\.|,)/,
    /\b(i am|im|we are|were|i have been|ive been|i was|stuck|trapped|living|i live|we live|im living|im stuck) (in|with) (an |a )?(abusive|violent|physically abusive|dangerous) (relationship|marriage|home|household|situation|partner|husband|wife|boyfriend|girlfriend|man|woman|family|environment|house)\b/,
    /\b(abusive|violent|physically abusive) (husband|wife|spouse|partner|boyfriend|girlfriend|relationship|marriage|home|household|father|mother|dad|mom|parent|parents|ex|stepdad|stepfather|stepmom|stepmother|boyfriends|man|situation|family)\b/,
    new RegExp('\\b' + HOUSEHOLD + '\\b (is|has been|has become|has gotten|gets|becomes|can be|was|turned|has turned|is getting|is becoming) (very |really |so |extremely |increasingly |more |physically )?(abusive|violent|dangerous|physical with me|physical when|physical)\\b'),
    new RegExp('\\b' + PERSON + '\\b (is|has been|has become|gets|was) (very |really |so |extremely |increasingly |more )?(physically abusive|violent|physical with me|physical when)\\b'),
    /\b(domestic|physical|sexual|child|spousal|partner|elder|emotional and physical) (violence|abuse|battery)\b/,
    /\b(being|been|am|was|get|getting|got) abused\b/,
    /\babus(es|ing|ed) (me|us|my (?:\w+ )?(?:kids?|children|child|son|daughter|brother|sister|mother|mom|wife|husband|partner|dog|cat))\b/,
    { re: /\b(i am|im|we are|were|i dont feel|i do not feel|we dont feel) (not |un)safe( here| anymore| at home| with| around| in| tonight| right now| at all|$|\.|,|!)/, neg: false },
    { re: /\b(i|we) (am|are|was|were|feel|felt|dont feel|do not feel|no longer feel|never feel|have never felt) (not |un)?safe (at home|in (my|our|this|the) (own )?(home|house|apartment|bed|room|marriage|relationship)|with (him|her|them)|here|anymore|around (him|her|them)|when (he|she) (drinks|is home|comes home|gets home|is angry|is drunk|is high))\b/, neg: false },
    { re: /\b(not|never|isnt|is not|aint|no longer) safe (at home|in (my|our|this|the) (own )?(home|house|apartment|bed|room)|with (him|her|them)|here|anymore|around (him|her|them)|for (me|us|the kids|my kids|my children))\b/, neg: false },
    { re: /\b(dont|do not|didnt|did not) feel safe (at home|here|with (him|her|them)|anymore|in my (own )?(home|house|bed|room))\b/, neg: false },
    /\bunsafe (at home|in my (own )?(home|house)|with (him|her|them)|around (him|her|them))\b/,
    new RegExp('\\b(i am|im|we are|were|i feel|i get|i live|living|i have been|ive been|i was|am|feel|feeling|so|really|constantly|always|genuinely|physically) (so |really |very |truly |constantly |always |genuinely |physically |a little |kind of |terrified and )?(scared|afraid|terrified|frightened|petrified|fearful|in fear|nervous|anxious) (of|for my (life|safety) (with|around|because of|near|when im with|with)) ' + FEAR_OF + '( |$|,|\\.|\\?|!)(?!(finding|find|knowing|seeing|hearing|reading|reacting|reaction|being|getting|judging|yelling|disowning|leaving|dying|passing|not|because (he|she|they) (wont|will not|might|may|would) (approve|accept|understand|like|be happy)|disapprov|opinion|thoughts|response|answer|saying|telling|thinking|asking|calling|texting|visiting|coming (over|to visit)|meeting|reject))'),
    /\b(scared|afraid|terrified|frightened|worried|anxious|nervous) (of|about) what (he|she|they)(ll| will|s going to| is going to|s gonna| gonna| might| could| would| are going to) do( to (me|us|my|the kids|them)| next| when| if| tonight| this time|$|\.|,)/,
    /\b(scared|afraid|terrified|frightened|worried|know|think|feel like) (he|she|they)(ll| will|s going to| is going to|s gonna| gonna| might| could| would| is gonna| are going to) (really |actually |finally |eventually |one day |seriously )?(hurt|kill|hit|beat|find|come after|come for|get|strangle|choke|shoot|stab|take the kids|take my) (me|us|my|the kids|them|one day|eventually)?\b/,
    /\b(fear|scared|afraid|terrified|worried|frightened) for my (life|safety|kids|children|childrens (safety|lives)|sons? (life|safety)|daughters? (life|safety)|familys safety)\b/,
    /\b(fear|fearing|feared) for (my|our|the kids|my kids|my childrens) (life|lives|safety)\b/,
    /\b(i|we|the kids|my kids|my children|my son|my daughter) (have|has|got|have got|has got) (bruises|a black eye|black eyes|marks|welts|cuts|a bloody nose|a busted lip|a split lip|a concussion|broken (bones|ribs|arm|nose|jaw|wrist))( (from|because of|after|since|where|and|on|all over|again|that)|$|\.|,)/,
    /\b(hide|hiding|cover|covering|covered|hid) (my|the|her|his|our) (bruises|black eye|marks|welts|cuts|injuries)\b/,
    /\bbruises (from|because of|after|where|when|every time|again|on my)\b/,
    /\bblack eye (from|because|after|he|she|my)\b/,
    /\b(my|our) (son|daughter|child|kid|kids|children|baby|little (brother|sister|boy|girl)|brother|sister|grandson|granddaughter|niece|nephew|student|students) (is|are|was|were|keeps?|keep) (being |getting |get |gets )?(abused|beaten|beat|hit|molested|touched|hurt|punished with|whipped|choked|slapped|kicked|neglected|starved|locked (in|up)|burned|bruised)( by| at| every| when| and| again| in| for|$|\.|,)/,
    /\b(abused|beaten|molested|hit|touched|hurt|neglected) by (his|her|their|my|our|the) (father|mother|dad|mom|stepdad|stepfather|stepmom|stepmother|uncle|aunt|grandfather|grandpa|teacher|coach|pastor|priest|babysitter|nanny|caregiver|boyfriend|girlfriend|husband|wife|partner|ex|brother|sister|cousin|neighbou?r|foster)\b/,
    /\b(someone|somebody|a (man|teacher|coach|relative|neighbou?r|family member)) (is|has been|was|keeps?|might be) (hurting|touching|abusing|beating|molesting|hitting|grooming) (my|our|the) (child|kids?|son|daughter|children|baby|students?|brother|sister|niece|nephew|grandchild|grandson|granddaughter)\b/,
    /\b(he|she|they|my (husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|stepdad|stepfather|ex)) (hits?|beats?|kicks?|slaps?|chokes?|punches|shoves?|whips?|smacks?|hurts?|starves?) (the|our|my) (kids|children|baby|dog|cat|son|daughter|little (one|ones|boy|girl))\b/,
    /\bstalk(s|ing|ed)? (me|us|my)\b/,
    /\bpoints? (it|a gun|the gun|his gun|her gun|a knife|the knife|a weapon) at (me|us|my|the kids)\b/,
    { re: /\b(my|our) (kids|children|son|daughter|baby|little (one|ones|boy|girl)|family) (arent|are not|isnt|is not|aint|are no longer|is no longer) safe\b/, neg: false },
    /\b(scared|afraid|terrified|frightened|too scared|too afraid) to go (home|back home|back there|back to (him|her|them|the house|my (house|apartment|husband|wife|boyfriend|girlfriend)))\b/,
    /\b(dv|domestic violence) (situation|shelter|hotline|survivor|victim|case|advocate|charge|charges)\b/,
    /\bin a dv\b/,
    /\b(who|that) (hits|hit|beats|beat|chokes|choked|abuses|abused|hurts|slaps|slapped|punches|punched|threatens|threatened|strangled|strangles|kicks|kicked) (me|us|my (kids|children|son|daughter|mom|mother))\b/,
    /\b(a man|a woman|a husband|a wife|someone|a partner|a boyfriend|a girlfriend|a spouse|a dad|a father|a mom|a mother|a parent) who (hits|beats|chokes|abuses|hurts|slaps|punches|threatens|strangles|kicks) (me|us|his|her|their)\b/,
    new RegExp('\\b' + PERSON + '\\b[^.?!]{0,30}?\\b(scares|frightens|terrifies|scared|frightened|terrified) (me|us|the kids|my kids|my children) (when|every time|after|if|whenever) (he|she|they) (drinks?|is drunk|gets? (angry|mad|home|drunk|high)|comes? home|is high|loses|drinking|uses)\\b'),
    /\b(discipline|correct|punish|chastise) me (physically|with (his|a|the) (belt|hand|fist|cane|paddle|switch)|until (i|im)|like a child)\b/,
    /\b(says|said|claims|thinks|believes|insists|told me) (the bible|god|scripture|jesus|the church|our pastor|paul) (says|allows|lets|permits|wants|gives|tells) (him|her|husbands|men|a husband|a man) (to )?(hit|beat|discipline|punish|correct|chastise|spank|control|own) (me|his wife|their wives|women|wives)\b/,
    /\b(hit|beat|discipline|punish|correct) me (because|since) (the bible|god|scripture|im his wife|i am his wife|thats what)\b/,
    /\b(bible|god|scripture|jesus|church|pastor|religion) (says|allows|permits|wants|gives|tells|teaches|lets) (him|her|he|she|men|husbands|a husband|a man) (can |may |should |is allowed to |has the right to |to |the right to )?(hit|beat|discipline|punish|correct|chastise|spank|control|own) (me|his wife|women|wives|us)\b/,
    /\b(\w+) (beats|hits|chokes|abuses|is beating|is abusing|is hitting|punches|slaps|strangles) (his|her|their) (wife|husband|kids|children|girlfriend|boyfriend|partner|daughter|son|mother|mom|dad|father|dog|cat|baby)\b/,
    { re: /\b(wont|will not|doesnt|does not|refuses to|never lets me|doesnt let me|wont let me) ?(let me )?(leave|go|see (my|anyone)|have (a phone|my phone|money|friends)|talk to (anyone|my (family|friends|mom|mother|dad|sister|brother))|work|drive|go anywhere|out of the house|call (anyone|my)|use the (phone|car))\b/, neg: false },
    /\b(checks?|checking|reads?|reading|monitors?|monitoring|tracks?|tracking|controls?|controlling|took|takes|taking|hides?|hiding|broke|breaks|smashed|smashes|destroyed|destroys) (my|all my|our) (phone|messages|texts|location|money|passport|keys|car keys|documents|id|bank|cards?|paycheck|medication|meds|things|stuff|clothes|laptop) (so i cant|and i cant|and wont|so that i|to keep me|to stop me|when (he|she)s angry|when (he|she) is angry|in (a|his|her) rage|against the wall|in front of)\b/,
    /\b(kill|hurt|beat|shoot|stab|strangle|choke|drown) (me|us|the (kids|children|baby)|my (kids|children|baby|son|daughter)) (if i|when i|unless i|if we|the next time|next time|when he|when she|tonight)\b/,
    /\b(im|i am|we are|were) (in|not out of) (danger|physical danger|a dangerous situation|an unsafe situation)\b/,
    /\bcall(ed)? the (police|cops) on (him|her|them|my (husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|son|ex|stepdad)) (for|after|because|when) (hitting|beating|choking|threatening|attacking|hurting|pushing|strangling|assaulting)/,
    /\b(restraining|protective|protection) order\b/,
    /\b(womens|domestic violence|battered womens|dv) (shelter|refuge|safe house)\b/,
  ];

  // Words that, inside a matched span, mean the event did not happen or is
  // not the writer's ("he would never hit me", "a character who kills
  // himself"). Kept narrow: "not", "dont" and "cant" are part of many genuine
  // disclosures ("I dont want to live") and are only checked just before a match.
  const NEGATION_RE = /\b(never|wouldnt|would not|would never|hasnt|has not|didnt|did not|doesnt|does not|could never|has never|have never|had never|cant imagine|stopped|used to|hypothetically|joke|joking|kidding|movie|show|book|novel|episode|character|video game|for a story|for my (story|novel|essay|paper|class|homework|research)|in (the )?(bible|scripture|gospels?)|a friend of mine|my friend|if someone|if a person|what if someone)\b/;

  function anyMatch(list, text) {
    for (const entry of list) {
      const re = entry instanceof RegExp ? entry : entry.re;
      const checkNegation = entry instanceof RegExp ? true : entry.neg !== false;
      re.lastIndex = 0;
      const m = re.exec(text);
      if (!m) continue;
      if (checkNegation && NEGATION_RE.test(m[0])) continue;
      // A negation just before the match ("he would never hit me", "I don't
      // want to kill myself") disqualifies it too.
      const before = text.slice(Math.max(0, m.index - 24), m.index);
      if (/\b(never|not|wouldnt|would not|dont|do not|didnt|did not|doesnt|does not|hasnt|has not|isnt|is not|wont|will not|cant|cannot|no one|nobody|stopped|quit|used to|if someone|if a person|what if someone|my friend|a friend|someone i know|in a (movie|book|show|dream)|the movie|the book|the show|a story|read about|heard about|news about|article about|character who|about a (man|woman|girl|boy) who)\s+(\w+\s+){0,2}$/.test(before)) continue;
      return true;
    }
    return false;
  }

  // Suicidality first (its handoff is the most urgent), then sexual assault,
  // then other danger.
  function detectKind(text) {
    const t = scrub(text);
    if (!t) return null;
    if (anyMatch(CRISIS, t)) return 'crisis';
    if (anyMatch(ASSAULT, t)) return 'assault';
    if (anyMatch(DANGER, t)) return 'danger';
    return null;
  }

  // For a conversation: a disclosure of abuse or assault stays in force for
  // the following turns, because "should I forgive him and stay?" is the same
  // conversation as "my husband hits me". Suicidality carries too. The
  // current message wins when it names something new; otherwise the most
  // recent earlier disclosure applies. Returns { kind, carried } where carried
  // is true when the verdict came from an earlier turn.
  function detectConversation(messages, lookback) {
    const list = Array.isArray(messages) ? messages : [];
    const users = list.filter(function (m) { return m && m.role === 'user' && typeof m.content === 'string'; });
    if (!users.length) return { kind: null, carried: false };
    const current = detectKind(users[users.length - 1].content);
    if (current) return { kind: current, carried: false };
    const n = typeof lookback === 'number' ? lookback : 8;
    const earlier = users.slice(Math.max(0, users.length - 1 - n), users.length - 1);
    for (let i = earlier.length - 1; i >= 0; i -= 1) {
      const k = detectKind(earlier[i].content);
      if (k) return { kind: k, carried: true };
    }
    return { kind: null, carried: false };
  }

  return { normalize, scrub, detectKind, detectConversation, IDIOMS, CRISIS, ASSAULT, DANGER };
});
