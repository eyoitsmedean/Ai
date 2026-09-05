const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MODEL_CHOICES, DEFAULT_MODEL, providerFor, resolveModel, createProvider } = require('../lib/models');

describe('model choices', () => {
  it('offers Claude Opus 5 and GPT-6 Astra', () => {
    const ids = MODEL_CHOICES.map((m) => m.id);
    assert.deepEqual(ids, ['claude-opus-5', 'gpt-6-astra']);
    assert.equal(DEFAULT_MODEL, 'claude-opus-5');
  });

  it('routes each model to its provider', () => {
    assert.equal(providerFor('claude-opus-5'), 'anthropic');
    assert.equal(providerFor('gpt-6-astra'), 'openai');
    assert.equal(providerFor('gpt-5.6-sol'), 'openai');
    assert.equal(providerFor('claude-sonnet-5'), 'anthropic');
  });

  it('reads MODEL first, then the legacy ANTHROPIC_MODEL', () => {
    assert.deepEqual(resolveModel({}), { id: 'claude-opus-5', provider: 'anthropic' });
    assert.deepEqual(resolveModel({ ANTHROPIC_MODEL: 'claude-sonnet-5' }), { id: 'claude-sonnet-5', provider: 'anthropic' });
    assert.deepEqual(resolveModel({ MODEL: 'gpt-6-astra', ANTHROPIC_MODEL: 'claude-opus-5' }), { id: 'gpt-6-astra', provider: 'openai' });
  });

  it('only builds a provider when the matching key is usable', () => {
    assert.equal(createProvider({ MODEL: 'gpt-6-astra' }), null);
    assert.equal(createProvider({ MODEL: 'gpt-6-astra', OPENAI_API_KEY: 'your_api_key_here' }), null);
    assert.equal(createProvider({ MODEL: 'gpt-6-astra', ANTHROPIC_API_KEY: 'sk-ant-real' }), null);
    assert.equal(createProvider({ MODEL: 'claude-opus-5', OPENAI_API_KEY: 'sk-real' }), null);

    const astra = createProvider({ MODEL: 'gpt-6-astra', OPENAI_API_KEY: 'sk-real' });
    assert.equal(astra.name, 'openai');
    assert.equal(astra.model, 'gpt-6-astra');
    assert.equal(typeof astra.generateStructured, 'function');
    assert.equal(typeof astra.streamText, 'function');

    const claude = createProvider({ ANTHROPIC_API_KEY: 'sk-ant-real' });
    assert.equal(claude.name, 'anthropic');
    assert.equal(claude.model, 'claude-opus-5');
  });
});
