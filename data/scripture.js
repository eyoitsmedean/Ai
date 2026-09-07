/**
 * Compatibility façade. The implementation lives in lib/advisor/ (one file per
 * product promise: verify, intent, corpus-reply). Existing imports of
 * './data/scripture' keep working unchanged.
 */
module.exports = require('../lib/advisor');
