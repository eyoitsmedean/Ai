/**
 * The only module that talks to the Anthropic SDK.
 * Returns raw model text; callers pass it through lib/scripture.js before it reaches a page.
 */
const Anthropic = require('@anthropic-ai/sdk');
const { structuredFormat } = require('./schemas');

function createClient(config) {
  if (!config.hasAnthropic) return null;
  const auth = config.authToken ? { authToken: config.authToken } : { apiKey: config.apiKey };
  return new Anthropic({
    ...auth,
    timeout: config.modelTimeoutMs,
    maxRetries: 1,
  });
}

function firstText(response) {
  return response?.content?.find((b) => b.type === 'text')?.text ?? '';
}

/**
 * Thinking is adaptive on current models and counts against max_tokens,
 * so effort stays low for short letters and the cap leaves room for both.
 */
function thinkingParams(config) {
  return {
    thinking: { type: 'adaptive' },
    output_config: { effort: config.effort },
  };
}

function createModel(config, client = createClient(config)) {
  if (!client) return null;

  async function generateStructured({ system, user, schema, maxTokens = config.structuredMaxTokens }) {
    const base = {
      model: config.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    };
    try {
      const thinking = thinkingParams(config);
      const response = await client.messages.create({
        ...base,
        thinking: thinking.thinking,
        output_config: { ...thinking.output_config, ...structuredFormat(schema).output_config },
      });
      return { text: firstText(response), stopReason: response.stop_reason, structured: true };
    } catch (err) {
      console.error('Structured output fallback:', err.message);
      const response = await client.messages.create({ ...base, ...thinkingParams(config) });
      return { text: firstText(response), stopReason: response.stop_reason, structured: false };
    }
  }

  /** Streams the letter to completion; the caller verifies the whole text before writing anything. */
  async function completeLetter({ system, messages, maxTokens = config.chatMaxTokens, signal } = {}) {
    const stream = client.messages.stream({
      model: config.model,
      max_tokens: maxTokens,
      system,
      messages,
      ...thinkingParams(config),
    });
    if (signal) {
      const abort = () => {
        try { stream.controller.abort(); } catch (_) {}
      };
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
    }
    let raw = '';
    stream.on('text', (text) => { raw += text; });
    const final = await stream.finalMessage();
    return { text: raw, stopReason: final.stop_reason };
  }

  return { completeLetter, generateStructured, model: config.model, effort: config.effort };
}

module.exports = { createClient, createModel, thinkingParams };
