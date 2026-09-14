const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig, trustProxyFrom, usableSecret } = require('../lib/config');
const { createRateLimiter } = require('../lib/rate-limit');

describe('usableSecret', () => {
  it('rejects blanks and documented placeholders', () => {
    assert.equal(usableSecret(''), false);
    assert.equal(usableSecret('your_api_key_here'), false);
    assert.equal(usableSecret('sk-live-not-a-placeholder'), true);
  });
});

describe('loadConfig', () => {
  it('defaults the model and effort, and ignores a placeholder key', () => {
    const cfg = loadConfig({
      ANTHROPIC_API_KEY: 'your_api_key_here',
      ANTHROPIC_EFFORT: 'not-a-level',
    });
    assert.equal(cfg.hasAnthropic, false);
    assert.equal(cfg.model, 'claude-opus-5');
    assert.equal(cfg.effort, 'low');
    assert.equal(cfg.port, 3000);
  });

  it('accepts a documented effort level and a hop-count proxy', () => {
    const cfg = loadConfig({
      ANTHROPIC_AUTH_TOKEN: 'oauth-token',
      ANTHROPIC_EFFORT: 'medium',
      TRUST_PROXY: '1',
      CHAT_MAX_TOKENS: '800',
    });
    assert.equal(cfg.hasAnthropic, true);
    assert.equal(cfg.effort, 'medium');
    assert.equal(cfg.trustProxy, 1);
    assert.equal(cfg.chatMaxTokens, 800);
  });
});

describe('trustProxyFrom', () => {
  it('maps the common env spellings', () => {
    assert.equal(trustProxyFrom(undefined), false);
    assert.equal(trustProxyFrom('false'), false);
    assert.equal(trustProxyFrom('true'), true);
    assert.equal(trustProxyFrom('1'), 1);
    assert.equal(trustProxyFrom('loopback'), 'loopback');
  });
});

describe('createRateLimiter', () => {
  it('allows up to the limit, then refuses, then resets', () => {
    let now = 1_000;
    const limiter = createRateLimiter({ now: () => now });
    assert.equal(limiter.allow('chat:a', 2, 1000), true);
    assert.equal(limiter.allow('chat:a', 2, 1000), true);
    assert.equal(limiter.allow('chat:a', 2, 1000), false);
    now = 3_000;
    assert.equal(limiter.allow('chat:a', 2, 1000), true);
  });
});
