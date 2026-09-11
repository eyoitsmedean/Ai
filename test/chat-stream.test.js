// Drives /api/chat through the real server with a fake SDK stream, so the live
// model path (placeholder hold-back, substitution, replace + verify frames,
// disconnect handling) is covered without credentials.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const http = require('http');
const { EventEmitter } = require('events');

const sent = [];
let tokens = [];
let aborted = 0;

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === '@anthropic-ai/sdk') {
    return class FakeAnthropic {
      constructor() {
        this.messages = {
          stream: (params) => {
            sent.push(params);
            const em = new EventEmitter();
            const timers = tokens.map((t, i) => setTimeout(() => em.emit('text', t), 3 + i * 3));
            em.abort = () => { aborted += 1; timers.forEach(clearTimeout); };
            em.finalMessage = () => new Promise((resolve) => {
              setTimeout(() => resolve({ stop_reason: 'end_turn', content: [] }), tokens.length * 3 + 15);
            });
            return em;
          },
          create: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{}' }] }),
        };
      }
    };
  }
  return originalLoad.call(this, request, ...rest);
};

process.env.ANTHROPIC_API_KEY = 'sk-test-fake';
process.env.RATE_LIMIT_OFF = '1';
const app = require('../server');

let server;
let base;

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => resolve({ status: res.statusCode, raw }));
    });
    req.on('error', reject);
    req.end(payload);
  });
}

function frames(raw) {
  return raw.split('\n')
    .filter((l) => l.startsWith('data: ') && l !== 'data: [DONE]')
    .map((l) => JSON.parse(l.slice(6)));
}

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  Module._load = originalLoad;
  await new Promise((resolve) => server.close(resolve));
});

describe('live advisor stream', () => {
  it('streams tokens live, fills split placeholders, and corrects a typed verse', async () => {
    tokens = [
      'I hear how heavy tonight feels.\n\n',
      '{', '{John 14', ':27}', '}\n', 'This peace is left with you.\n\n',
      '{{Matthew 11:28}}\nRest is offered to the tired.\n\n',
      '**Luke 12:7**\n"the hairs of your head are numbered"\nYou are counted.\n\n',
      'Sit with one sentence tonight.',
    ];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am anxious and cannot sleep' }] });
    assert.equal(res.status, 200);
    const all = frames(res.raw);
    const texts = all.filter((f) => typeof f.text === 'string').map((f) => f.text);
    const streamed = texts.join('');
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    const verify = all.find((f) => f.verify).verify;

    const params = sent[sent.length - 1];
    assert.equal(params.model, 'claude-opus-5');
    assert.equal(params.max_tokens, 2048);
    assert.equal(params.output_config.effort, 'low');
    assert.equal(params.thinking.type, 'adaptive');
    assert.match(params.messages[params.messages.length - 1].content, /ALLOWED SAYINGS/);

    assert.ok(texts.length > 3, 'tokens go out incrementally');
    assert.ok(texts.every((t) => !/\{\{|\}\}/.test(t)), 'no frame carries a marker');
    assert.match(streamed, /\*\*John 14:27\*\*\n“Peace I leave with you/);
    assert.match(streamed, /\*\*Matthew 11:28\*\*\n“Come unto me/);
    assert.match(replace, /\*\*Luke 12:7\*\*\n“But even the very hairs of your head are all numbered/);
    assert.doesNotMatch(replace, /\{\{/);
    assert.equal(verify.total, 3);
    assert.equal(verify.allVerified, true);
    assert.equal(verify.source, 'server');
    assert.match(res.raw, /\[DONE\]$/m);
  });

  it('prefixes the crisis notice before the model speaks', async () => {
    tokens = ['{{John 14:27}}\nStay.\n'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'i want to die' }] });
    const texts = frames(res.raw).filter((f) => typeof f.text === 'string').map((f) => f.text);
    assert.match(texts[0], /^If you are in danger/);
    assert.match(texts.join(''), /988/);
  });

  it('prefixes the domestic-violence handoff when someone describes being hit', async () => {
    tokens = ['{{Luke 4:18}}\nYou are not asked to stay.\n'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'my husband hits me when he drinks' }] });
    const texts = frames(res.raw).filter((f) => typeof f.text === 'string').map((f) => f.text);
    assert.match(texts[0], /1-800-799-7233/);
    assert.match(texts[0], /911/);
    assert.doesNotMatch(texts.join(''), /988/);
  });

  it('drops a narrator verse the model cites and never shows it as a quotation', async () => {
    tokens = [
      'Hear this.\n\n',
      '{{Matthew 1:1}}\nA genealogy is not comfort.\n\n',
      '{{John 14:27}}\nThis peace is left with you.\n\n',
      '**Luke 2:1**\n"there went out a decree from Caesar Augustus"\nNarration typed as a quote.\n\n',
      'Sit with that.',
    ];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am anxious tonight' }] });
    const all = frames(res.raw);
    const streamed = all.filter((f) => typeof f.text === 'string').map((f) => f.text).join('');
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    const verify = all.find((f) => f.verify).verify;
    assert.doesNotMatch(streamed, /generation of Jesus Christ/);
    assert.doesNotMatch(streamed, /genealogy is not comfort/);
    assert.doesNotMatch(replace, /Matthew 1:1|Luke 2:1|Caesar Augustus/);
    assert.match(replace, /\*\*John 14:27\*\*/);
    assert.equal(verify.total, 1);
    assert.equal(verify.allVerified, true);
  });

  it('replaces a letter with no verifiable saying by the retrieval letter', async () => {
    tokens = ['I have only my own words for you tonight.\n\n{{Romans 8:28}}\nAll things work together.\n'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'my mother died last week' }] });
    const all = frames(res.raw);
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    const verify = all.find((f) => f.verify).verify;
    assert.doesNotMatch(replace, /Romans|my own words/);
    assert.match(replace, /\*\*Matthew 5:4\*\*/);
    assert.ok(verify.verified >= 2);
  });

  it('never leaks a half-typed marker into any frame', async () => {
    tokens = ['Peace.\n\n{{John 14:27}\nsome context\n\n{{Matthew 11:28}}\nRest.\n\n{{John {{14:27}} }}\n\nEnd {{Luke 12:7}'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am anxious tonight' }] });
    const all = frames(res.raw);
    const texts = all.filter((f) => typeof f.text === 'string').map((f) => f.text);
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    assert.ok(texts.every((t) => !/\{\{|\}\}/.test(t)), `a text frame carried a marker: ${JSON.stringify(texts)}`);
    assert.doesNotMatch(replace, /[{}]/);
    assert.match(replace, /\*\*John 14:27\*\*/);
    assert.match(replace, /\*\*Matthew 11:28\*\*/);
    assert.match(replace, /\*\*Luke 12:7\*\*/);
  });

  it('drops other-author citations, narration in prose, and recited verses; the report counts them', async () => {
    tokens = [
      '**Romans 8:28**\n"And we know that all things work together for good"\nPaul wrote this.\n\n',
      'As Matthew 1:1 says, "The book of the generation of Jesus Christ, the son of David." Hold on to that.\n\n',
      'Jesus said "Come unto me all ye that labour and are heavy laden and I will give you rest" and he meant it.\n\n',
      '{{John 14:27}}\nPeace.\n',
    ];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am anxious tonight' }] });
    const all = frames(res.raw);
    const streamed = all.filter((f) => typeof f.text === 'string').map((f) => f.text).join('');
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    const verify = all.find((f) => f.verify).verify;
    for (const text of [streamed, replace]) {
      assert.doesNotMatch(text, /Romans|work together for good|Paul wrote/);
      assert.doesNotMatch(text, /Matthew 1:1|generation of Jesus Christ/);
      assert.doesNotMatch(text, /Come unto me all ye that labour and are heavy laden and I will/);
    }
    assert.match(replace, /Hold on to that/);
    assert.match(replace, /\*\*John 14:27\*\*/);
    assert.equal(verify.total, 1);
    assert.equal(verify.allVerified, true);
    assert.equal(verify.dropped, 3);
    assert.deepEqual(verify.droppedItems.map((d) => d.kind).sort(), ['narration', 'other-author', 'typed-quote']);
  });

  it('holds a typed narrator citation out of the live stream, not just the final letter', async () => {
    tokens = ['**Matthew 1:1**\n"The book of the generation of Jesus Christ"\nA lineage of hope.\n\n{{John 14:27}}\nPeace.\n'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am anxious tonight' }] });
    const streamed = frames(res.raw).filter((f) => typeof f.text === 'string').map((f) => f.text).join('');
    assert.doesNotMatch(streamed, /generation of Jesus Christ|lineage of hope|Matthew 1:1/);
    assert.match(streamed, /\*\*John 14:27\*\*/);
  });

  it('answers abuse and suicidality with the fixed letter and never calls the model', async () => {
    tokens = ['Forgive him and stay; submit to him as the Bible says.\n\n{{Matthew 6:14}}\nForgive.\n'];
    const callsBefore = sent.length;
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'my husband hits me when he drinks' }] });
    const all = frames(res.raw);
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    assert.equal(sent.length, callsBefore, 'the model was not called');
    assert.doesNotMatch(replace, /submit to him|forgive not men|Matthew 6:14/);
    assert.match(replace, /1-800-799-7233/);
    assert.match(replace, /never a reason to stay in danger/);
    assert.match(replace, /\*\*Luke 4:18\*\*/);

    tokens = ['As your pastor, I am a real person who cares.\n\n{{John 14:27}}\nPeace.\n'];
    const res2 = await post('/api/chat', { messages: [{ role: 'user', content: 'I have the pills lined up' }] });
    const replace2 = frames(res2.raw).find((f) => typeof f.replace === 'string').replace;
    assert.equal(sent.length, callsBefore);
    assert.match(replace2, /988/);
    assert.doesNotMatch(replace2, /your pastor|real person who cares/);
  });

  it('keeps a disclosure of abuse in force for the follow-up turns', async () => {
    tokens = ['{{Matthew 6:14}}\nForgive, and go back.\n'];
    const callsBefore = sent.length;
    const messages = [
      { role: 'user', content: 'my husband hits me when he drinks' },
      { role: 'assistant', content: 'letter' },
      { role: 'user', content: 'should I forgive him and stay?' },
    ];
    const res = await post('/api/chat', { messages });
    const all = frames(res.raw);
    const replace = all.find((f) => typeof f.replace === 'string').replace;
    assert.equal(sent.length, callsBefore, 'the model was not called for the follow-up');
    assert.doesNotMatch(replace, /Matthew 6:14|forgive not men|Forgive, and go back/);
    assert.match(replace, /1-800-799-7233/);
    assert.match(replace, /never a reason to go back into danger/);
    assert.match(replace, /\*\*Matthew 10:16\*\*/);

    // A plain thank-you after the disclosure is a greeting, not the handoff again.
    tokens = ['{{John 14:27}}\nPeace.\n'];
    const res2 = await post('/api/chat', { messages: messages.concat([{ role: 'assistant', content: 'letter' }, { role: 'user', content: 'ok thank you' }]) });
    const replace2 = frames(res2.raw).find((f) => typeof f.replace === 'string').replace;
    assert.doesNotMatch(replace2, /1-800-799-7233/);
  });

  it('replaces a live letter that claims to be a person or counsels staying', async () => {
    tokens = ['As your pastor, I am a real person who cares.\n\n{{John 14:27}}\nPeace.\n'];
    const res = await post('/api/chat', { messages: [{ role: 'user', content: 'I am so anxious about tomorrow' }] });
    const replace = frames(res.raw).find((f) => typeof f.replace === 'string').replace;
    assert.doesNotMatch(replace, /your pastor|real person who cares/);
    assert.match(replace, /\*\*(John 14:27|Matthew 11:28|Matthew 6:34|Matthew 6:26)\*\*/);

    tokens = ['Forgive him and stay with him tonight.\n\n{{Matthew 11:28}}\nCome.\n'];
    const res2 = await post('/api/chat', { messages: [{ role: 'user', content: 'I feel lonely tonight' }] });
    const replace2 = frames(res2.raw).find((f) => typeof f.replace === 'string').replace;
    assert.doesNotMatch(replace2, /Forgive him and stay|stay with him tonight/);
    assert.match(replace2, /\*\*(Matthew 11:28|John 14:27|John 14:18)\*\*/);
  });

  it('aborts the model stream when the client disconnects', async () => {
    tokens = Array.from({ length: 40 }, (_, i) => `word${i} `);
    const before = aborted;
    await new Promise((resolve) => {
      const payload = JSON.stringify({ messages: [{ role: 'user', content: 'hello there' }] });
      const req = http.request(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      }, (res) => {
        res.once('data', () => { req.destroy(); setTimeout(resolve, 60); });
      });
      req.on('error', () => {});
      req.end(payload);
    });
    assert.equal(aborted, before + 1);
  });
});
