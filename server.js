// server.js — routes, headers, rate limits and the model client.
// Reader-facing prose lives in lib/letters.js (CLAUDE.md D12, D13).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');
const {
  parseModelJson,
  verifyAndSubstitute,
  verifyJsonQuotes,
  fillPlaceholders,
  noticeForKind,
  auditAdvisorText,
} = require('./lib/scripture');
const { dailyForDate, encouragementFor, themeNames } = require('./lib/curated');
const { searchLibrary, sayingCount } = require('./lib/library');
const { DAILY_SCHEMA, ENCOURAGE_SCHEMA, structuredFormat } = require('./lib/schemas');
const { retrieveSayings, formatAllowList } = require('./lib/retrieve');
const { holdUnsafe, scrubMarkers } = require('./lib/stream');
const { letterViolates } = require('./lib/guard');
const { ADVISOR_SYSTEM, dailySystem, ENCOURAGE_SYSTEM } = require('./lib/prompts');
const { verifyItems, verifyReport } = require('./lib/report');
const { chatSafety, safetyLetter, fallbackLetter } = require('./lib/letters');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_KEY = process.env.API_ACCESS_KEY || '';
const THEME_SET = new Set(themeNames());
const MAX_CHAT_MESSAGES = 24;

// Railway, Render and Fly terminate TLS one hop away; without this every
// visitor shares the proxy's address in the rate limiter.
app.set('trust proxy', 1);

// A 24-message conversation with 8 000-character turns is ~200 kB of JSON.
app.use(express.json({ limit: '256kb' }));

// Cross-origin API access for a static front end (GitHub Pages) that points at
// this host via <meta name="rla-api-base">. Same-origin traffic is untouched.
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
if (ALLOWED_ORIGINS.length) {
  app.use('/api', cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Api-Key'],
    maxAge: 600,
  }));
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  if (req.path === '/' || req.path === '/index.html' || req.path === '/manifest.json' || req.path === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Service-Worker-Allowed', '/');
    } else if (/\.html$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.woff2$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(?:js|css|png|jpg|jpeg|webp|json)$/i.test(filePath)) {
      // index.html cache-busts js/css with ?v=; the SW owns offline copies.
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
}));

/* ── Model ────────────────────────────────────────────────────────── */

function usableSecret(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;
  if (/your_api_key|changeme|placeholder|xxx|example/i.test(v)) return false;
  return true;
}

const hasAnthropic = usableSecret(process.env.ANTHROPIC_API_KEY) || usableSecret(process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasAnthropic
  ? new Anthropic(
      process.env.ANTHROPIC_AUTH_TOKEN
        ? { authToken: process.env.ANTHROPIC_AUTH_TOKEN }
        : { apiKey: process.env.ANTHROPIC_API_KEY }
    )
  : null;

// Opus 5 thinks by default and max_tokens caps thinking + text. Effort 'low'
// is the documented setting for latency-sensitive chat; structured output
// (`format`) lives in the same output_config object.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const MODEL_EFFORT = process.env.ANTHROPIC_EFFORT || 'low';
function modelParams(maxTokens, extra = {}) {
  const outputConfig = { effort: MODEL_EFFORT };
  if (extra.output_config && extra.output_config.format) outputConfig.format = extra.output_config.format;
  return {
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    output_config: outputConfig,
  };
}
function logStop(route, response) {
  const reason = response && response.stop_reason;
  if (reason && reason !== 'end_turn') {
    console.warn(`[${route}] stop_reason=${reason} (raise max_tokens or lower effort)`);
  }
}

/* ── Rate limiting + access gate ──────────────────────────────────── */

const buckets = new Map();

// RATE_LIMIT_OFF=1 is for local evaluation runs (npm run eval) only; the
// boot log says so loudly when it is set.
const RATE_LIMIT_OFF = process.env.RATE_LIMIT_OFF === '1';

function rateLimit(key, limit, windowMs) {
  if (RATE_LIMIT_OFF) return true;
  const now = Date.now();
  if (buckets.size > 4000) {
    for (const [k, slot] of buckets) {
      if (now > slot.reset) buckets.delete(k);
    }
  }
  const slot = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > slot.reset) {
    slot.count = 0;
    slot.reset = now + windowMs;
  }
  slot.count += 1;
  buckets.set(key, slot);
  return slot.count <= limit;
}

function clientKey(req) {
  return req.ip || 'local';
}

function gate(req, res, next) {
  if (!ACCESS_KEY) return next();
  const sent = req.get('x-api-key');
  if (sent !== ACCESS_KEY) return res.status(401).json({ error: 'Unauthorized.' });
  next();
}

app.use('/api', gate);

/* ── Daily + encouragement (structured, verified) ─────────────────── */

const dailyCache = new Map();

// Local date, matching dailyForDate(); a UTC key would hold yesterday's
// curated page for hours on a host west of Greenwich.
function todayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

async function generateStructured(route, system, user, schema, maxTokens) {
  try {
    const response = await client.messages.create({
      ...modelParams(maxTokens, structuredFormat(schema)),
      system,
      messages: [{ role: 'user', content: user }],
    });
    logStop(route, response);
    return response;
  } catch (err) {
    console.error(`[${route}] structured output fallback:`, err.message);
    const response = await client.messages.create({
      ...modelParams(maxTokens),
      system,
      messages: [{ role: 'user', content: user }],
    });
    logStop(route, response);
    return response;
  }
}

function textOf(response) {
  return response.content.find((b) => b.type === 'text')?.text ?? '';
}

async function generateDailyFromModel() {
  const response = await generateStructured(
    'daily',
    dailySystem(),
    "Generate today's daily affirmation and word.",
    DAILY_SCHEMA,
    2048
  );
  const data = verifyJsonQuotes(parseModelJson(textOf(response)));
  if (!data.verified) throw new Error('Daily content failed verification');
  return { ...data, source: 'model' };
}

async function fetchDailyContent() {
  const key = todayKey();
  if (dailyCache.has(key)) return dailyCache.get(key);

  if (!client) {
    const curated = dailyForDate();
    dailyCache.set(key, curated);
    return curated;
  }

  try {
    const data = await generateDailyFromModel();
    dailyCache.set(key, data);
    return data;
  } catch (err) {
    console.error('Daily model fallback:', err.message);
    const curated = { ...dailyForDate(), source: 'curated-fallback' };
    dailyCache.set(key, curated);
    return curated;
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: pkg.name,
    version: pkg.version,
    anthropic: Boolean(client),
    api: Boolean(client),
    model: client ? MODEL : null,
    translation: 'KJV',
    themes: themeNames().length,
    sayings: sayingCount(),
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
  const body = req.body || {};
  const list = Array.isArray(body.items) ? body.items : Array.isArray(body.citations) ? body.citations : [body];
  if (list.length > 12) return res.status(400).json({ error: 'Too many citations.' });
  res.json(verifyItems(list.slice(0, 12)));
});

app.get('/api/library', (req, res) => {
  if (!rateLimit(`lib:${clientKey(req)}`, 120, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Please return later.' });
  }
  const rawBook = typeof req.query.book === 'string' ? req.query.book.trim() : '';
  const book = ['Matthew', 'Mark', 'Luke', 'John'].includes(rawBook) ? rawBook : '';
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
  if (!client) return res.json(curated);

  try {
    const response = await generateStructured(
      'encouragement',
      ENCOURAGE_SYSTEM,
      `Generate encouragement for: ${theme}`,
      ENCOURAGE_SCHEMA,
      2048
    );
    const data = verifyJsonQuotes({ ...parseModelJson(textOf(response)), theme });
    // A pack that lost most of its passages to verification reads thin;
    // the curated page is the better experience.
    if (!Array.isArray(data.passages) || data.passages.length < 2) {
      return res.json({ ...curated, source: 'curated-fallback' });
    }
    res.json({ ...data, source: 'model' });
  } catch (err) {
    console.error('Encouragement fallback:', err.message);
    res.json({ ...curated, source: 'curated-fallback' });
  }
});

/* ── Advisor ──────────────────────────────────────────────────────── */
// Letters: lib/letters.js. Verdicts: lib/report.js. Guard: lib/guard.js.

app.post('/api/chat', async (req, res) => {
  const raw = req.body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return res.status(400).json({ error: 'messages required.' });
  }
  for (const m of raw) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return res.status(400).json({ error: 'Invalid message list.' });
    }
    if (m.content.length > 8000) return res.status(400).json({ error: 'Message is too long.' });
  }
  // The page keeps a long local history; the model only needs the recent turns.
  const messages = raw.slice(-MAX_CHAT_MESSAGES);
  const last = messages[messages.length - 1];
  if (!last.content.trim()) return res.status(400).json({ error: 'Empty message.' });
  if (last.content.length > 2000) return res.status(400).json({ error: 'Message is too long.' });

  if (!rateLimit(`chat:${clientKey(req)}`, 10, 60 * 1000)) {
    return res.status(429).json({ error: 'A little space, then ask again.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  // Disconnects are observed on the response: since Node 16 the request stream
  // auto-destroys as soon as its body is read, so `req.on('close')` would end
  // the reply before the first model token.
  let clientGone = false;
  let activeStream = null;
  res.on('close', () => {
    clientGone = true;
    if (activeStream && typeof activeStream.abort === 'function') {
      try { activeStream.abort(); } catch (_) { /* already finished */ }
    }
  });
  const send = (payload) => {
    if (!clientGone && !res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };
  const streamText = (text) => {
    const chunk = 24;
    for (let i = 0; i < text.length; i += chunk) send({ text: text.slice(i, i + chunk) });
  };
  const safe = chatSafety(messages, last.content);
  const notice = noticeForKind(safe.kind);
  let dropped = [];
  const finish = (finalText) => {
    // `replace` is the authoritative letter: the page swaps it in so any
    // verse the model typed itself is shown as the recorded text.
    const clean = scrubMarkers(finalText);
    send({ replace: clean });
    send({ verify: verifyReport(clean, dropped) });
    if (!clientGone && !res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  };
  const finishWithLetter = (letter) => {
    // The notice arrives whole, as the first frame, so the numbers are never
    // split across tokens on the page.
    const text = verifyAndSubstitute(letter);
    if (notice) send({ text: notice });
    streamText(text);
    finish(`${notice}${text}`);
  };

  // Suicidality, assault and abuse are answered with the fixed letters and
  // never by the model: the one thing this page must not do in that moment is
  // improvise. (Decision D12 in CLAUDE.md.)
  if (safe.kind) return finishWithLetter(safetyLetter(safe.kind, safe.carried));
  if (!client) return finishWithLetter(fallbackLetter(last.content, messages));

  let streamed = '';
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

    if (notice) {
      streamed += notice;
      send({ text: notice });
    }

    const stream = client.messages.stream({
      ...modelParams(2048),
      system: ADVISOR_SYSTEM,
      messages: modelMessages,
    });
    activeStream = stream;

    // Tokens go out as they arrive, except that anything the page must not
    // see half-finished is held back: an unclosed {{, a bold citation line
    // with its quote, an open quotation mark, a sentence naming a reference.
    // Each released chunk ends on a boundary the verifier can judge alone.
    let rawText = '';
    let pending = '';
    const flushPending = (force) => {
      const { flush, rest } = holdUnsafe(pending, force);
      pending = rest;
      if (!flush) return;
      const audited = auditAdvisorText(fillPlaceholders(flush));
      dropped = dropped.concat(audited.dropped);
      const clean = scrubMarkers(audited.text);
      if (!clean) return;
      streamed += clean;
      send({ text: clean });
    };
    stream.on('text', (delta) => {
      rawText += delta;
      pending += delta;
      flushPending(false);
    });

    const final = await stream.finalMessage();
    activeStream = null;
    logStop('chat', final);
    flushPending(true);

    if (!rawText.trim()) return finishWithLetter(fallbackLetter(last.content, messages));
    const audited = auditAdvisorText(fillPlaceholders(rawText));
    dropped = audited.dropped;
    const substituted = audited.text;
    const violation = letterViolates(substituted);
    const truncated = final && final.stop_reason === 'max_tokens';
    // A letter with no verified red-letter quotation left in it (every marker
    // the model chose was narration, another author, or unknown) is replaced
    // by the retrieval letter rather than shipped as bare prose. Same for a
    // persona claim, stay/submit advice, or a reply cut short by max_tokens.
    if (verifyReport(substituted).verified === 0 || violation || truncated) {
      console.warn(`Chat: model letter replaced (${violation || (truncated ? 'truncated' : 'no-verified-saying')}).`);
      dropped = [];
      return finish(`${notice}${verifyAndSubstitute(fallbackLetter(last.content, messages))}`);
    }
    finish(`${notice}${substituted}`);
  } catch (err) {
    activeStream = null;
    if (clientGone) return;
    console.error('Chat error:', err.message);
    if (streamed.trim()) {
      // Something already reached the page; hand it the verified fallback as
      // a replacement rather than a torn letter.
      const body = `${notice}${verifyAndSubstitute(fallbackLetter(last.content, messages))}`;
      finish(body);
    } else {
      finishWithLetter(fallbackLetter(last.content, messages));
    }
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
  try { rows = JSON.parse(fs.readFileSync(dest, 'utf8')); } catch (_) { /* first signup */ }
  if (!Array.isArray(rows)) rows = [];
  if (!rows.some((r) => r.email === email)) {
    rows.push({ email, at: new Date().toISOString() });
    fs.writeFileSync(dest, JSON.stringify(rows, null, 2));
  }
  res.json({ ok: true });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✝  The Red Letter Advisor v${pkg.version} → http://localhost:${PORT}`);
    if (!client) {
      console.log('   No Anthropic credentials — Today, Seek and the Advisor serve verified curated pages.');
    }
    if (RATE_LIMIT_OFF) {
      console.warn('   RATE_LIMIT_OFF=1 — rate limiting is disabled. Evaluation runs only; never in production.');
    }
  });
}

module.exports = app;
