require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { parseModelJson, verifyAndSubstitute, verifyJsonQuotes, verifyQuote, looksLikeCrisis, CRISIS_NOTICE } = require('./lib/scripture');
const { dailyForDate, encouragementFor, themeNames } = require('./lib/curated');
const { searchLibrary } = require('./lib/library');
const { DAILY_SCHEMA, ENCOURAGE_SCHEMA } = require('./lib/schemas');
const { retrieveSayings, formatAllowList } = require('./lib/retrieve');
const { loadConfig } = require('./lib/config');
const { createRateLimiter } = require('./lib/rate-limit');
const { createModel } = require('./lib/model');
const { ADVISOR_SYSTEM, ENCOURAGE_SYSTEM, FALLBACK_LETTER, dailySystem } = require('./lib/prompts');
const { letterFor } = require('./lib/letter');
const { askFor } = require('./lib/ask');

const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John'];
const THEME_SET = new Set(themeNames());

function createApp(options = {}) {
  const config = options.config || loadConfig();
  const model = options.model !== undefined ? options.model : createModel(config);
  const limiter = options.limiter || createRateLimiter();
  const dailyCache = options.dailyCache || new Map();
  const app = express();

  if (config.trustProxy) app.set('trust proxy', config.trustProxy);

  app.use(express.json({ limit: '32kb' }));
  app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders(res, filePath) {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Service-Worker-Allowed', '/');
      } else if (/\.(html|js)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));

  function rateLimit(key, limit, windowMs) {
    return limiter.allow(key, limit, windowMs);
  }

  function clientKey(req) {
    return req.ip || 'local';
  }

  function gate(req, res, next) {
    if (!config.accessKey) return next();
    const sent = req.get('x-api-key');
    if (sent !== config.accessKey) return res.status(401).json({ error: 'Unauthorized.' });
    next();
  }

  app.use('/api', gate);

  function todayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  async function generateDailyFromModel(date) {
    const result = await model.generateStructured({
      system: dailySystem(date),
      user: "Generate today's daily affirmation and word.",
      schema: DAILY_SCHEMA,
      maxTokens: config.structuredMaxTokens,
    });
    const data = verifyJsonQuotes(parseModelJson(result.text));
    if (!data?.verified) throw new Error('Daily page failed verification.');
    return data;
  }

  async function fetchDailyContent() {
    const now = new Date();
    const key = todayKey(now);
    if (dailyCache.has(key)) return dailyCache.get(key);

    if (!model) {
      const curated = dailyForDate(now);
      dailyCache.set(key, curated);
      return curated;
    }

    try {
      const data = await generateDailyFromModel(now);
      dailyCache.set(key, data);
      return data;
    } catch (err) {
      console.error('Daily model fallback:', err.message);
      const curated = dailyForDate(now);
      dailyCache.set(key, curated);
      return curated;
    }
  }

  app.post('/api/ask', (req, res) => {
    const q = typeof req.body?.q === 'string' ? req.body.q : (typeof req.body?.content === 'string' ? req.body.content : '');
    if (!q.trim()) return res.status(400).json({ error: 'What is weighing on you?' });
    if (q.length > 2000) return res.status(400).json({ error: 'That is too long for this page.' });
    if (!rateLimit(`ask:${clientKey(req)}`, 20, 60 * 1000)) {
      return res.status(429).json({ error: 'A little space, then ask again.' });
    }
    res.json(askFor(q));
  });

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      anthropic: Boolean(model),
      themes: themeNames().length,
      model: config.model,
      effort: config.effort,
    });
  });

  app.get('/api/daily', async (req, res) => {
    if (!rateLimit(`daily:${clientKey(req)}`, 60, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Please return later for the morning page.' });
    }
    try {
      res.json(await fetchDailyContent());
    } catch (err) {
      console.error('Daily error:', err.message);
      res.status(500).json({ error: 'Failed to generate daily content.' });
    }
  });

  app.get('/api/themes', (req, res) => {
    res.json({ themes: themeNames() });
  });

  app.post('/api/verify', (req, res) => {
    if (!rateLimit(`verify:${clientKey(req)}`, 60, 60 * 1000)) {
      return res.status(429).json({ error: 'Please return later.' });
    }
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [req.body || {}];
    if (rawItems.length > 12) return res.status(400).json({ error: 'Too many citations.' });
    const results = rawItems.slice(0, 12).map((item) => {
      const verse = typeof item?.verse === 'string' ? item.verse.slice(0, 80) : '';
      const quote = typeof item?.quote === 'string' ? item.quote.slice(0, 2000) : '';
      if (!verse) return { ok: false, reason: 'missing-verse', verse: '', quote: '' };
      const verified = verifyQuote(verse, quote);
      return {
        ok: Boolean(verified.ok),
        verse: verified.citation || verse,
        quote: verified.quote || quote,
        score: verified.score || 0,
        reason: verified.reason || (verified.ok ? 'quote-match' : 'unknown-ref'),
      };
    });
    res.json({
      results,
      allVerified: results.length > 0 && results.every((row) => row.ok),
    });
  });

  app.get('/api/library', (req, res) => {
    if (!rateLimit(`lib:${clientKey(req)}`, 120, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Please return later.' });
    }
    const rawBook = typeof req.query.book === 'string' ? req.query.book.trim() : '';
    const book = GOSPELS.includes(rawBook) ? rawBook : '';
    const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
    const theme = typeof req.query.theme === 'string' ? req.query.theme.slice(0, 80) : '';
    res.json(searchLibrary({ book, q, theme, limit: req.query.limit, offset: req.query.offset }));
  });

  app.post('/api/encouragement', async (req, res) => {
    const theme = typeof req.body?.theme === 'string' ? req.body.theme.trim() : '';
    if (!theme || theme.length > 80) return res.status(400).json({ error: 'theme required.' });
    if (!THEME_SET.has(theme)) return res.status(400).json({ error: 'Unknown theme.' });
    if (!rateLimit(`enc:${clientKey(req)}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Please return later for more encouragement.' });
    }

    const curated = encouragementFor(theme);
    if (!model) return res.json(curated);

    try {
      const result = await model.generateStructured({
        system: ENCOURAGE_SYSTEM,
        user: `Generate encouragement for: ${theme}`,
        schema: ENCOURAGE_SCHEMA,
        maxTokens: config.structuredMaxTokens,
      });
      const data = verifyJsonQuotes({ ...parseModelJson(result.text), theme });
      if (!data?.verified || !data.passages?.length) {
        return res.json(curated);
      }
      res.json(data);
    } catch (err) {
      console.error('Encouragement fallback:', err.message);
      res.json(curated);
    }
  });

  function writeLetter(res, body, crisis) {
    const verified = verifyAndSubstitute(body);
    const text = crisis ? `${CRISIS_NOTICE}${verified}` : verified;
    const chunk = 24;
    for (let i = 0; i < text.length; i += chunk) {
      res.write(`data: ${JSON.stringify({ text: text.slice(i, i + chunk) })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  app.post('/api/chat', async (req, res) => {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required.' });
    }
    if (messages.length > 24) return res.status(400).json({ error: 'Conversation is too long. Begin a new one.' });
    const last = messages[messages.length - 1];
    if (!last?.content || typeof last.content !== 'string' || !last.content.trim()) {
      return res.status(400).json({ error: 'Empty message.' });
    }
    if (last.content.length > 2000) return res.status(400).json({ error: 'Message is too long.' });
    for (const m of messages) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
        return res.status(400).json({ error: 'Invalid message list.' });
      }
      if (m.content.length > 8000) return res.status(400).json({ error: 'Message is too long.' });
    }

    if (!rateLimit(`chat:${clientKey(req)}`, 10, 60 * 1000)) {
      return res.status(429).json({ error: 'A little space, then ask again.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const crisis = looksLikeCrisis(last.content);
    const ac = new AbortController();
    req.on('close', () => {
      ac.abort();
      if (!res.writableEnded) {
        try { res.end(); } catch (_) {}
      }
    });

    if (!model) {
      return writeLetter(res, crisis ? FALLBACK_LETTER : letterFor(last.content), crisis);
    }

    try {
      const retrieved = retrieveSayings(last.content);
      const allow = formatAllowList(retrieved.sayings);
      const modelMessages = messages.map((m, i) => {
        if (i !== messages.length - 1) return { role: m.role, content: m.content };
        return {
          role: 'user',
          content: `${m.content}\n\nALLOWED SAYINGS (cite only these, as {{Book Chapter:Verse}}):\n${allow}`,
        };
      });

      const result = await model.completeLetter({
        system: ADVISOR_SYSTEM,
        messages: modelMessages,
        maxTokens: config.chatMaxTokens,
        signal: ac.signal,
      });
      if (res.writableEnded) return;
      writeLetter(res, result.text || letterFor(last.content), crisis);
    } catch (err) {
      if (ac.signal.aborted || res.writableEnded) return;
      console.error('Chat error:', err.message);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
      }
      writeLetter(res, crisis ? FALLBACK_LETTER : (letterFor(last.content) || FALLBACK_LETTER), crisis);
    }
  });

  app.post('/api/waitlist', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      return res.status(400).json({ error: 'A real email is needed.' });
    }
    if (!rateLimit(`wait:${clientKey(req)}`, 6, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Please return later.' });
    }
    const dest = path.join(__dirname, 'data', 'waitlist.json');
    let rows = [];
    try { rows = JSON.parse(fs.readFileSync(dest, 'utf8')); } catch (_) {}
    if (!Array.isArray(rows)) rows = [];
    if (!rows.some((r) => r.email === email)) {
      rows.push({ email, at: new Date().toISOString() });
      fs.writeFileSync(dest, JSON.stringify(rows, null, 2));
    }
    res.json({ ok: true });
  });

  app.get('/ask', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'public', 'ask.html'));
  });

  app.get('/welcome', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.locals.config = config;
  return app;
}

const app = createApp();
app.createApp = createApp;

if (require.main === module) {
  const { port } = app.locals.config;
  app.listen(port, () => {
    console.log(`The Red Letter Advisor → http://localhost:${port}`);
  });
}

module.exports = app;
