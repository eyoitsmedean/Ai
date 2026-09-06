const { adviseLetter } = require('./advise');
const { verifyAndSubstitute, looksLikeCrisis, looksLikeDanger, CRISIS_NOTICE, DANGER_NOTICE } = require('./scripture');

/**
 * The last step every Advisor letter passes through, model or not:
 * placeholders become exact KJV speech, anything unverifiable is removed,
 * and a question that names danger gets the human-help notice first —
 * self-harm outranks violence when both are present.
 */
function noticeFor(question) {
  if (looksLikeCrisis(question)) return CRISIS_NOTICE;
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
