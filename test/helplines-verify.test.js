const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { CHECKS, looksBlocked } = require('../scripts/verify-helplines');

describe('helpline verifier contract', () => {
  it('covers every number printed in About and the crisis modal', () => {
    const ids = CHECKS.map((c) => c.id);
    for (const id of ['988-us', '988-ca', 'hotline-us', 'samaritans', 'lifeline-au', 'ovc-rainn', 'rainn-org']) {
      assert.ok(ids.includes(id), 'missing check ' + id);
    }
    assert.ok(CHECKS.find((c) => c.id === 'rainn-org').allowBlocked);
  });

  it('treats Cloudflare interstitial bodies as blocked, not as a failed number', () => {
    assert.equal(looksBlocked({ blocked: true, status: 0, text: '' }), true);
    assert.equal(looksBlocked({ blocked: false, status: 403, text: 'nope' }), true);
    assert.equal(looksBlocked({
      blocked: false,
      status: 200,
      text: 'Sorry, you have been blocked by cloudflare',
    }), true);
    assert.equal(looksBlocked({
      blocked: false,
      status: 200,
      text: 'Call or text 988. '.repeat(400),
    }), false);
  });
});
