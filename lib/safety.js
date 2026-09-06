'use strict';
// Server-side face of lib/safety-core.js (the single file the room also loads
// as /data/safety.js). Keep the API stable; put logic in the core.
const core = require('./safety-core');

module.exports = {
  CRISIS_NOTICE: core.NOTICES.crisis,
  MEDICAL_NOTICE: core.NOTICES.medical,
  IDENTITY_NOTICE: core.NOTICES.identity,
  DECISION_NOTICE: core.NOTICES.decision,
  OFFSCOPE_NOTICE: core.NOTICES.offscope,
  looksLikeCrisis: core.looksLikeCrisis,
  looksLikeMedical: core.looksLikeMedical,
  looksLikeIdentity: core.looksLikeIdentity,
  looksLikeDecision: core.looksLikeDecision,
  looksLikeOffScope: core.looksLikeOffScope,
  mentionsOwnDeath: core.mentionsOwnDeath,
  verseSafeFor: core.verseSafeFor,
  letterSafeFor: core.letterSafeFor,
  crisis: core.crisis,
  cues: core.cues,
  route: core.route,
  core,
};
