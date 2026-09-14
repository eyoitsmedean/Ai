/**
 * Environment → one typed config object. The only file that reads process.env.
 */

const PLACEHOLDER_RE = /^(your_api_key(_here)?|changeme|placeholder|x{3,}|example)$/i;

function usableSecret(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  return !PLACEHOLDER_RE.test(v);
}

function intFrom(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const EFFORT_LEVELS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

/**
 * Express `trust proxy` accepts a boolean, a hop count, or subnet names.
 * We accept the same vocabulary from the environment; unset means "not behind a proxy".
 */
function trustProxyFrom(value) {
  if (value === undefined || value === null) return false;
  const v = String(value).trim();
  if (!v || /^(0|false|no|off)$/i.test(v)) return false;
  if (/^(1|true|yes|on)$/i.test(v)) return v === '1' ? 1 : true;
  if (/^\d+$/.test(v)) return Number(v);
  return v;
}

function loadConfig(env = process.env) {
  const apiKey = usableSecret(env.ANTHROPIC_API_KEY) ? env.ANTHROPIC_API_KEY.trim() : '';
  const authToken = usableSecret(env.ANTHROPIC_AUTH_TOKEN) ? env.ANTHROPIC_AUTH_TOKEN.trim() : '';
  const effort = String(env.ANTHROPIC_EFFORT || 'low').trim().toLowerCase();

  return {
    port: intFrom(env.PORT, 3000, { min: 1, max: 65535 }),
    model: (env.ANTHROPIC_MODEL || 'claude-opus-5').trim(),
    effort: EFFORT_LEVELS.has(effort) ? effort : 'low',
    apiKey,
    authToken,
    hasAnthropic: Boolean(apiKey || authToken),
    accessKey: (env.API_ACCESS_KEY || '').trim(),
    trustProxy: trustProxyFrom(env.TRUST_PROXY),
    modelTimeoutMs: intFrom(env.MODEL_TIMEOUT_MS, 45000, { min: 5000, max: 600000 }),
    // Hard cap on thinking + text per request; sized so a letter is never cut mid-sentence.
    chatMaxTokens: intFrom(env.CHAT_MAX_TOKENS, 2400, { min: 400, max: 16000 }),
    structuredMaxTokens: intFrom(env.STRUCTURED_MAX_TOKENS, 2000, { min: 400, max: 16000 }),
  };
}

module.exports = { EFFORT_LEVELS, loadConfig, trustProxyFrom, usableSecret };
