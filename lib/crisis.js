/**
 * Single crisis matcher. Client copies in public/ must use the same CRISIS_SOURCE.
 * Bearing: C7
 */
const CRISIS_SOURCE = String.raw`\b(suicid\w*|unaliv\w*|kill(?:ing)? myself|end (?:my life|it all)|take my life|want to die|wanna die|wish i (?:was|were) dead|self[-\s]?harm\w*|hurt(?:ing)? myself|cut(?:ting)? myself|hang myself|overdos\w*|don't want to (?:live|be alive|be here(?: anymore)?)|do not want to (?:live|be alive|be here(?: anymore)?)|can'?t go on|cannot go on|(?:going to|gonna) jump|better off (?:dead|without me)|no reason to live|not worth living|no point in living)\b`;

const CRISIS_RE = new RegExp(CRISIS_SOURCE, 'i');

function looksLikeCrisis(text) {
  if (!text) return false;
  return CRISIS_RE.test(String(text).replace(/[‘’]/g, "'"));
}

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

/** Vectors for eval-ask and unit tests. Bearing: C7 */
const CRISIS_HITS = [
  'I want to kill myself tonight',
  'I have no reason to live',
  'I want to unalive myself',
  "I don't want to be alive anymore",
  'I wish I was dead',
  'I cannot go on',
  'I am going to jump',
];

const CRISIS_MISSES = [
  'I am grieving and feel overwhelmed',
  'I carry so much shame',
  'I am afraid of the future',
];

module.exports = {
  CRISIS_HITS,
  CRISIS_MISSES,
  CRISIS_NOTICE,
  CRISIS_RE,
  CRISIS_SOURCE,
  looksLikeCrisis,
};
