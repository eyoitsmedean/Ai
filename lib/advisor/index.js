/**
 * Advisor truth-and-safety layer. One module per product promise:
 *   verify.js        — only Jesus's words, verbatim, checkable
 *   intent.js        — crisis and abuse never depend on the model
 *   corpus-reply.js  — warm replies with no model at all
 *   normalize.js     — shared text helpers
 */
const verify = require('./verify');
const intent = require('./intent');
const corpusReply = require('./corpus-reply');
const { similarity } = require('./normalize');

module.exports = {
  corpus: verify.corpus,
  verifyPassage: verify.verifyPassage,
  verifyPassages: verify.verifyPassages,
  annotateAdvisorText: verify.annotateAdvisorText,
  groundAdvisorText: verify.groundAdvisorText,
  extractCitations: verify.extractCitations,
  isGospelRef: verify.isGospelRef,
  offlineDaily: corpusReply.offlineDaily,
  offlineEncouragement: corpusReply.offlineEncouragement,
  detectCrisis: intent.detectCrisis,
  detectPassiveIdeation: intent.detectPassiveIdeation,
  looksSpanish: intent.looksSpanish,
  detectAbuse: intent.detectAbuse,
  detectOffScope: intent.detectOffScope,
  detectHostile: intent.detectHostile,
  classifyIntent: intent.classifyIntent,
  similarity,
};
