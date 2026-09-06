const { adviseLetter } = require('./advise');
const { verifyAndSubstitute, looksLikeCrisis, looksLikeDanger, looksLikePoisoning, CRISIS_NOTICE, DANGER_NOTICE, POISON_LINE } = require('./scripture');

/**
 * The last step every Advisor letter passes through, model or not:
 * placeholders become exact KJV speech, anything unverifiable is removed,
 * and a question that names danger gets the human-help notice first —
 * a body in danger outranks self-harm, which outranks violence.
 */
function noticeFor(question) {
  if (looksLikeCrisis(question)) {
    return (looksLikePoisoning(question) ? `${POISON_LINE}\n` : '') + CRISIS_NOTICE;
  }
  if (looksLikeDanger(question)) return DANGER_NOTICE;
  return '';
}

function finishLetter(body, question) {
  return `${noticeFor(question)}${verifyAndSubstitute(body)}`;
}

function retrievalLetter(question) {
  return finishLetter(adviseLetter(question), question);
}

module.exports = { finishLetter, noticeFor, retrievalLetter };
