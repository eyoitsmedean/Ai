// Exercises the live-model path of /api/chat with a stubbed SDK client.
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.ANTHROPIC_API_KEY = 'sk-test-live-path';
delete process.env.ANTHROPIC_AUTH_TOKEN;

const calls = [];
let script = null;
const creates = [];
let createImpl = async (params) => {
  creates.push(params);
  await new Promise((r) => setTimeout(r, 30));
  const daily = {
    affirmation: { text: 'You are known.', verse: 'Luke 12:7', quote: 'ye are of more value than many sparrows' },
    word: { theme: 'Peace', title: 'Peace', passage: 'Peace I leave with you', verse: 'John 14:27', reflection: 'Rest.' },
  };
  return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(daily) }] };
};

class FakeStream {
  constructor(params) {
    this.params = params;
    this.aborted = false;
    this.handlers = {};
    calls.push(this);
  }
  on(event, cb) {
    this.handlers[event] = cb;
    return this;
  }
  abort() {
    this.aborted = true;
    if (this.rejectPending) this.rejectPending(new Error('aborted'));
  }
  finalMessage() {
    return script(this);
  }
}

class FakeAnthropic {
  constructor() {
    this.messages = {
      stream: (params) => new FakeStream(params),
      create: (params) => createImpl(params),
    };
  }
}

require.cache[require.resolve('@anthropic-ai/sdk')] = {
  id: require.resolve('@anthropic-ai/sdk'),
  filename: require.resolve('@anthropic-ai/sdk'),
  loaded: true,
  exports: FakeAnthropic,
};

const app = require('../server');

let server;
let base;

function chat(content, { abortAfterHeaders = false } = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ messages: [{ role: 'user', content }] });
    const req = http.request(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      if (abortAfterHeaders) {
        req.destroy();
        return resolve(null);
      }
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        const text = raw.split('\n')
          .filter((l) => l.startsWith('data: ') && !l.includes('[DONE]'))
          .map((l) => JSON.parse(l.slice(6)).text)
          .join('');
        resolve(text);
      });
    });
    req.on('error', (err) => (abortAfterHeaders ? resolve(null) : reject(err)));
    req.end(payload);
  });
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  calls.length = 0;
});

describe('chat with a live model', () => {
  it('gives the model room to think before it writes', async () => {
    script = async (s) => {
      s.handlers.text('I hear you.\n\n{{John 14:27}}\nPeace for a troubled heart.');
      return { stop_reason: 'end_turn' };
    };
    const text = await chat('I am anxious about tomorrow');
    assert.ok(calls[0].params.max_tokens >= 16000);
    assert.match(text, /Peace I leave with you/);
  });

  it('sends the fallback letter when the model refuses', async () => {
    script = async () => ({ stop_reason: 'refusal' });
    const text = await chat('I am anxious about tomorrow');
    assert.match(text, /Come unto me/);
  });

  it('sends the fallback letter instead of a cut-off one', async () => {
    script = async (s) => {
      s.handlers.text('I hear you and I want to');
      return { stop_reason: 'max_tokens' };
    };
    const text = await chat('I am anxious about tomorrow');
    assert.doesNotMatch(text, /I want to$/);
    assert.match(text, /Come unto me/);
  });

  it('puts 988 first when someone says they feel suicidal', async () => {
    script = async (s) => {
      s.handlers.text('I am here.\n\n{{Matthew 11:28}}\nRest.');
      return { stop_reason: 'end_turn' };
    };
    const text = await chat('I feel suicidal');
    assert.match(text, /^If you are in danger/);
    assert.match(text, /988/);
  });

  it('aborts the model call when the visitor leaves', async () => {
    script = (s) => new Promise((_, reject) => { s.rejectPending = reject; });
    await chat('I am anxious about tomorrow', { abortAfterHeaders: true });
    for (let i = 0; i < 50 && !calls[0]?.aborted; i += 1) {
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.equal(calls[0].aborted, true);
  });
});

describe('daily page with a live model', () => {
  it('makes one model call for a morning rush', async () => {
    const get = () => new Promise((resolve, reject) => {
      http.get(`${base}/api/daily`, (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });
    const pages = await Promise.all(Array.from({ length: 20 }, get));
    assert.equal(creates.length, 1);
    assert.match(pages[19].word.passage, /Peace I leave with you/);
  });
});
