const DAILY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['affirmation', 'word'],
  properties: {
    affirmation: {
      type: 'object',
      additionalProperties: false,
      required: ['text', 'verse', 'quote'],
      properties: {
        text: { type: 'string' },
        verse: { type: 'string' },
        quote: { type: 'string' },
      },
    },
    word: {
      type: 'object',
      additionalProperties: false,
      required: ['theme', 'title', 'passage', 'verse', 'reflection'],
      properties: {
        theme: { type: 'string' },
        title: { type: 'string' },
        passage: { type: 'string' },
        verse: { type: 'string' },
        reflection: { type: 'string' },
      },
    },
  },
};

const ENCOURAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['theme', 'headline', 'opening', 'passages', 'practice', 'closing'],
  properties: {
    theme: { type: 'string' },
    headline: { type: 'string' },
    opening: { type: 'string' },
    passages: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['verse', 'quote', 'context'],
        properties: {
          verse: { type: 'string' },
          quote: { type: 'string' },
          context: { type: 'string' },
        },
      },
    },
    practice: { type: 'string' },
    closing: { type: 'string' },
  },
};

function structuredFormat(schema) {
  return {
    output_config: {
      format: {
        type: 'json_schema',
        schema,
      },
    },
  };
}

module.exports = { DAILY_SCHEMA, ENCOURAGE_SCHEMA, structuredFormat };
