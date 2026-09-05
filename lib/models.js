const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { structuredFormat } = require('./schemas');

const MODEL_CHOICES = [
  { id: 'claude-opus-5', provider: 'anthropic', label: 'Claude Opus 5' },
  { id: 'gpt-6-astra', provider: 'openai', label: 'GPT-6 Astra' },
];

const DEFAULT_MODEL = MODEL_CHOICES[0].id;

// Reasoning models spend output tokens on thinking before the visible reply, so
// the OpenAI budget gets headroom above what the letter itself needs.
const OPENAI_REASONING_HEADROOM = 2000;

function usableSecret(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  if (/your_api_key|changeme|placeholder|xxx|example/i.test(v)) return false;
  return true;
}

function providerFor(modelId) {
  const known = MODEL_CHOICES.find((m) => m.id === modelId);
  if (known) return known.provider;
  if (/^(gpt-|o\d|chatgpt-)/i.test(modelId)) return 'openai';
  return 'anthropic';
}

function resolveModel(env = process.env) {
  const id = (env.MODEL || env.ANTHROPIC_MODEL || DEFAULT_MODEL).trim();
  return { id, provider: providerFor(id) };
}

function anthropicProvider(model, env) {
  const hasKey = usableSecret(env.ANTHROPIC_API_KEY) || usableSecret(env.ANTHROPIC_AUTH_TOKEN);
  if (!hasKey) return null;
  const client = new Anthropic(
    env.ANTHROPIC_AUTH_TOKEN
      ? { authToken: env.ANTHROPIC_AUTH_TOKEN }
      : { apiKey: env.ANTHROPIC_API_KEY }
  );
  const textOf = (response) => response.content.find((b) => b.type === 'text')?.text ?? '';

  return {
    name: 'anthropic',
    model,
    async generateStructured({ system, user, schema, maxTokens }) {
      try {
        const response = await client.messages.create({
          model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: user }],
          ...structuredFormat(schema),
        });
        return textOf(response);
      } catch (err) {
        console.error('Structured output fallback:', err.message);
        const response = await client.messages.create({
          model,
          max_tokens: maxTokens,
          thinking: { type: 'adaptive' },
          system,
          messages: [{ role: 'user', content: user }],
        });
        return textOf(response);
      }
    },
    async streamText({ system, messages, maxTokens, onText }) {
      const stream = client.messages.stream({
        model,
        max_tokens: maxTokens,
        thinking: { type: 'adaptive' },
        system,
        messages,
      });
      let raw = '';
      stream.on('text', (text) => {
        raw += text;
        if (onText) onText(text);
      });
      await stream.finalMessage();
      return raw;
    },
  };
}

function openaiProvider(model, env) {
  if (!usableSecret(env.OPENAI_API_KEY)) return null;
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {}),
  });
  const reasoning = env.OPENAI_REASONING_EFFORT ? { reasoning: { effort: env.OPENAI_REASONING_EFFORT } } : {};
  const base = (system, maxTokens) => ({
    model,
    instructions: system,
    max_output_tokens: maxTokens + OPENAI_REASONING_HEADROOM,
    ...reasoning,
  });

  return {
    name: 'openai',
    model,
    async generateStructured({ system, user, schema, schemaName, maxTokens }) {
      try {
        const response = await client.responses.create({
          ...base(system, maxTokens),
          input: user,
          text: { format: { type: 'json_schema', name: schemaName || 'result', schema, strict: true } },
        });
        return response.output_text ?? '';
      } catch (err) {
        console.error('Structured output fallback:', err.message);
        const response = await client.responses.create({ ...base(system, maxTokens), input: user });
        return response.output_text ?? '';
      }
    },
    async streamText({ system, messages, maxTokens, onText }) {
      const stream = client.responses.stream({
        ...base(system, maxTokens),
        input: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      let raw = '';
      stream.on('response.output_text.delta', (event) => {
        raw += event.delta;
        if (onText) onText(event.delta);
      });
      const final = await stream.finalResponse();
      return final.output_text || raw;
    },
  };
}

function createProvider(env = process.env) {
  const { id, provider } = resolveModel(env);
  if (provider === 'openai') return openaiProvider(id, env);
  return anthropicProvider(id, env);
}

module.exports = {
  MODEL_CHOICES,
  DEFAULT_MODEL,
  providerFor,
  resolveModel,
  createProvider,
  usableSecret,
};
