// Single source for crisis detection. The client copies in public/index.html,
// data/advisor.js, and public/data/advisor.js must carry this exact pattern;
// test/crisis.test.js fails if they drift.
//
// Scope is self-directed harm. Phrases are first-person or unambiguous, so a
// grief message ("my father died") or hyperbole ("this job is killing me")
// does not receive a suicide notice. eval/questions.json holds the cases.
const CRISIS_PATTERN = /\b(suicid(?:e|al|ally)?|kill(?:ing)? myself|kms|unalive (?:myself|me)|end(?:ing)? my (?:own )?life|tak(?:e|ing) my (?:own )?life|end it all|want(?:ed|s)? to die|wanna die|wish(?:ed)? i (?:was|were) dead|wish(?:ed)? i (?:had never been|(?:was|were) never) born|(?:don'?t|do not|didn'?t|did not|no longer) want to (?:live|be alive|exist|wake up|be here anymore)|not want to (?:live|be alive)|(?:don'?t|do not) deserve to live|sleep and never wake up|never wake up again|disappear forever|(?:no ?one|nobody) would (?:notice|care) if i (?:was|were) gone|(?:can'?t|cannot) go on (?:like this|anymore|any longer|living)|(?:can'?t|cannot) do this anymore|no (?:point|reason) (?:in|to) liv(?:e|ing)|(?:not|isn'?t|is not|ain'?t) worth living|tired of (?:living|being alive|this life)|better off (?:dead|without me)|nobody would miss me|self[-\s]?harm|harm(?:ing)? myself|hurt(?:ing)? myself|cut(?:ting)? myself|hang(?:ing)? myself|i (?:want to |will |might |could |am going to )?overdose|jump(?:ing)? off (?:a|the) (?:bridge|building|roof)|thinking about (?:dying|killing myself|ending it)|plan(?:ning)? to (?:die|kill myself))\b/i;

function looksLikeCrisis(text) {
  if (!text) return false;
  return CRISIS_PATTERN.test(String(text));
}

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'I am not a person, and this page is not emergency care.',
  '',
  '',
].join('\n');

module.exports = { CRISIS_PATTERN, CRISIS_NOTICE, looksLikeCrisis };
