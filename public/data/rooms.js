/* One set of rooms. The server requires this file; the page loads it before the composer.
   guessThemes is the only function that may name a room from the question. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RLA_ROOMS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KNOWN = {
    'Anxiety & Worry': 1, 'Grief & Loss': 1, Forgiveness: 1, Loneliness: 1,
    'Conflict & Relationships': 1, Fear: 1, 'Purpose & Direction': 1,
    'Faith & Doubt': 1, 'Suffering & Pain': 1, 'Shame & Guilt': 1, Peace: 1, Hope: 1
  };

  // Prefix cues: a leading \b, no trailing \b on the group. `diagnos` must
  // hear diagnosis; `betray` must hear betrayed. Do not close the group.
  var BETRAYED_RE = /\b(?:cheat(?:ed|ing)\s+on\s+me|(?:he|she|my\s+(?:wife|husband|partner|boyfriend|girlfriend|fianc\w+|spouse))\s+(?:has\s+been|is|was|'s\s+been|had\s+been)\s+(?:cheating|unfaithful|sleeping\s+with)|(?:his|her)\s+affair|(?:he|she|my\s+(?:wife|husband|partner|boyfriend|girlfriend|fianc\w+|spouse))\s+(?:had|is\s+having|has\s+been\s+having|was\s+having|'s\s+having|'s\s+been\s+having)\s+an\s+affair|been\s+unfaithful|left\s+me\s+for\s+(?:another|someone|a\s+younger|his|her))\b/i;
  var WOUNDED_RE = /\b(?:abus|assault|molest|raped?\b|hits? me(?! up)|beat me|beats me|violen|bullied|bullying|bully|bullies)/i;
  var ILLNESS_RE = /\b(?:\bms\b|multiple sclerosis|not getting better|chronic|disease|diagnosed with|lupus|fibromyalgia|crohn|parkinson|arthritis|dialysis|chemo|terminal|weeks to live|months to live|won'?t make it|not going to make it)\b/i;

  var NEED_CUES = [
    [WOUNDED_RE, 'Suffering & Pain'],
    [BETRAYED_RE, 'Suffering & Pain'],
    [ILLNESS_RE, 'Suffering & Pain'],
    [/\b(furious|enraged|rage|so angry|livid|protected the wrong|covered (it )?up)\b/i, 'Suffering & Pain'],
    [/\b(grief|griev|mourn|died|death|(?:is|are|was|were|'s|he's|she's)\s+dying|dying\s+(?:of|from)|funeral|widow|hospice|passed away|buried|miscarri|stillb|lost the baby|lost our baby|dementia|alzheimer|doesn'?t (know|recognize|recognise) me|infertil|can'?t (get|have) (pregnant|children|a baby)|ivf|baby shower|all my friends are (dead|gone)|lost my (mom|mum|dad|mother|father|wife|husband|son|daughter|brother|sister|baby|child|best friend)|lost a (patient|child|baby)|(?:taking|took) my (?:baby|son|daughter|wife|husband|child)|my baby died)/i, 'Grief & Loss'],
    [/\b(angry (?:at|with) god|mad at god|furious (?:at|with) god|hate god|blame god)\b/i, 'Faith & Doubt'],
    [/\b(shame|guilt|ashamed|unworthy|filthy|dirty|disgust|deserve|regret|can'?t undo|cannot undo|relapse|drinking again|using again|i cheated|i lied|i stole|i hit (?:him|her|my (?:wife|husband|girlfriend|boyfriend|partner|kid|son|daughter|child|baby|mom|dad))|i killed|people i killed|their faces|haunted by|haunts me|can'?t forgive myself|cannot forgive myself|hate myself)/i, 'Shame & Guilt'],
    [/\b(forgiv|resent|bitter|hate (him|her|them)|trespass|betray|grudge|stole from|cheat(ed|ing|s)\b|affair|unfaithful)/i, 'Forgiveness'],
    [/\b(afraid|fear|scared|terror|terrified|frightened|scans?\b|diagnos|biopsy|results|cancer|tumor|tumour|leukemia|leukaemia|nicu|icu|deport|immigration)/i, 'Fear'],
    [/\b(anxi|worr|overwhelm|stress|tomorrow|panic|interview|laid off|fired|lost my job|lost the job|out of work|unemployed|no savings|rent\b|bills|debt|money|income|bankrupt|can'?t sleep|cannot sleep|racing)/i, 'Anxiety & Worry'],
    [/\b(pain(?!t)|suffer|sick|illness|tribulation|hurts|breaking|exhaust|so tired|burnt? out|burning out|numb\b|lost (?:my|our|the) (?:house|home|everything)|house (?:burned|burnt|flooded)|in the fire)/i, 'Suffering & Pain'],
    [/\b(lonel|alone|abandon|orphan|left me|no one|nobody|by myself|isolat|no friends|waiting to die|coming out|come out to)/i, 'Loneliness'],
    [/\b(fight(?!ing\s+(?:cancer|for\s+my\s+life|the\s+disease|this\s+illness|this\s+infection))|fought|conflict|marriage is|my marriage|save (?:my|our) marriage|divorce|enemy|argue|argument|feud|not speaking|barely speaks?|won'?t talk|losing (him|her))/i, 'Conflict & Relationships'],
    [/\b(doubt|unbelief|have not seen|faith|believe|god is even|is god|talking to the ceiling|not sure god|prayer feels|pray and)/i, 'Faith & Doubt'],
    [/\b(purpose|direction|calling|what should i do|what i'?m for|what am i for|meaning|tempted|temptation|fudge|lie about|honest|integrity|(?:feel|feeling|i'?m|am|so) lost|lost my way|wandering)/i, 'Purpose & Direction'],
    [/\b(hope|joy|cheer|future|never change|give up|pointless)/i, 'Hope'],
    [/\b(peace|calm|still|quiet|rest)/i, 'Peace']
  ];

  function guessThemes(query) {
    var hits = [];
    for (var i = 0; i < NEED_CUES.length; i++) {
      if (NEED_CUES[i][0].test(query) && hits.indexOf(NEED_CUES[i][1]) === -1) hits.push(NEED_CUES[i][1]);
    }
    var wounded = BETRAYED_RE.test(query) || WOUNDED_RE.test(query);
    var ill = ILLNESS_RE.test(query);
    var combatShame = /\b(?:i killed|people i killed|their faces)\b/i.test(query);
    return hits.filter(function (t) {
      return KNOWN[t]
        && !(wounded && t === 'Forgiveness')
        && !(ill && t === 'Faith & Doubt')
        && !(combatShame && t === 'Anxiety & Worry');
    });
  }

  return {
    BETRAYED_RE: BETRAYED_RE,
    WOUNDED_RE: WOUNDED_RE,
    ILLNESS_RE: ILLNESS_RE,
    guessThemes: guessThemes,
    knownThemes: Object.keys(KNOWN)
  };
});
