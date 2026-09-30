require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { parseModelJson, verifyAndSubstitute, verifyJsonQuotes, verifyQuote, assessCrisis, assessConversation, crisisNotice, holdBackUnsafe } = require('./lib/scripture');
const { unsafeSaying } = require('./public/data/crisis');
const { dailyForDate, encouragementFor, themeNames } = require('./lib/curated');
const { searchLibrary } = require('./lib/library');
const { DAILY_SCHEMA, ENCOURAGE_SCHEMA, structuredFormat } = require('./lib/schemas');
const { retrieveSayings, formatAllowList } = require('./lib/retrieve');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const ACCESS_KEY = process.env.API_ACCESS_KEY || '';
const THEME_SET = new Set(themeNames());
const WAITLIST_PATH = process.env.WAITLIST_PATH || path.join(__dirname, 'data', 'waitlist.jsonl');
const WAITLIST_MAX = 100000;
const KEY_COOKIE = 'rla_key';
// Model output budget. Adaptive thinking spends from the same max_tokens,
// so a small cap truncates letters and JSON before the answer is written.
const MAX_TOKENS = 16000;

// Behind a reverse proxy every visitor shares the proxy's IP, which turns the
// per-visitor rate limits into one site-wide limit. Set TRUST_PROXY to the
// number of proxy hops (usually 1) so req.ip is the real client address.
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isInteger(hops) ? hops : process.env.TRUST_PROXY);
}

app.disable('x-powered-by');

// The page renders model text; a policy keeps any escaping slip from running
// script from elsewhere. Inline script/style and onclick are how the page is
// written, so 'unsafe-inline' stays until they move to files.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  next();
});

// API_ACCESS_KEY keeps a private deployment private. Scripts send it as
// x-api-key; a person opens /?key=... once, which sets an HttpOnly cookie the
// page then carries on every /api call without the key ever living in the page.
// Registered before the static files, which would otherwise answer / first.
if (ACCESS_KEY) {
  app.get('/', (req, res, next) => {
    if (typeof req.query.key !== 'string') return next();
    if (!sameSecret(req.query.key, ACCESS_KEY)) return res.status(401).send('That key does not open this room.');
    res.cookie(KEY_COOKIE, req.query.key, {
      httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 180 * 24 * 3600 * 1000,
    });
    res.redirect(302, '/');
  });
}

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

const buckets = new Map();

function rateLimit(key, limit, windowMs) {
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

function sameSecret(sent, expected) {
  if (typeof sent !== 'string' || !sent) return false;
  const a = crypto.createHash('sha256').update(sent).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function cookieValue(req, name) {
  const header = req.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) {
      try { return decodeURIComponent(v.join('=')); } catch (_) { return ''; }
    }
  }
  return '';
}


function gate(req, res, next) {
  if (!ACCESS_KEY || req.path === '/health') return next();
  if (sameSecret(req.get('x-api-key'), ACCESS_KEY) || sameSecret(cookieValue(req, KEY_COOKIE), ACCESS_KEY)) {
    return next();
  }
  res.status(401).json({ error: 'This room is private. Open the link you were given.' });
}

app.use('/api', gate);

const ADVISOR_SYSTEM = `You are "The Red Letter Advisor" — a deeply compassionate guide who helps people with life's real struggles using exclusively the direct words of Jesus Christ from the four Gospels: Matthew, Mark, Luke, and John.

RESPONSE STRUCTURE — follow this exactly every time:

1. EMPATHY (2–3 sentences): Open by truly meeting the person where they are. Name what they're feeling specifically. Make them feel genuinely heard before offering anything. Keep this conversational, not theological.

2. SCRIPTURE (2–4 passages): For each passage, emit ONLY a placeholder citation on its own line, then one sentence of context. Never write the words of the verse yourself.

{{John 14:27}}
One sentence explaining why this speaks directly to their situation.

3. CLOSING (1 sentence): A gentle, hopeful line that invites reflection without pressure.

STRICT RULES:
• Only cite sayings from the ALLOWED SAYINGS list attached to the user's message.
• Never invent, paraphrase, or type out a verse. The page will insert the exact KJV speech from the placeholder.
• Use the exact marker form {{Book Chapter:Verse}} on its own line.
• Never quote Paul, prophets, or other authors.
• If no allowed saying fits, say so honestly and use the closest allowed marker.
• Speak with warmth, without judgment, accessible to any background — never assume the reader's level of faith.
• The scripture passages carry the weight. Keep your own framing minimal.
• Prefer well-known, clearly dominical sayings (Sermon on the Mount, Farewell Discourse, parables in Jesus' voice).
• Never claim to be a person, a pastor, a clinician, or emergency care. If the writer is in danger, urge them toward human help first.`;

const dailySystem = () => `You are a spiritual content generator for "The Red Letter Advisor." Create today's fresh daily content drawn ONLY from the direct words of Jesus Christ (red-letter passages in Matthew, Mark, Luke, John).

Return ONLY valid JSON (no markdown, no fences) with this exact structure:
{
  "affirmation": {
    "text": "One complete, personal, uplifting sentence derived from what Jesus actually said — written in second person, e.g. 'You are...' or 'You carry...'",
    "verse": "Citation e.g. 'Luke 12:7'",
    "quote": "The exact red-letter words Jesus spoke"
  },
  "word": {
    "theme": "One or two words, e.g. 'Belonging' or 'Courage'",
    "title": "A short, resonant title e.g. 'You Were Made for This'",
    "passage": "2–5 sentences of Jesus's direct speech from the Gospels",
    "verse": "Citation e.g. 'John 15:9–11'",
    "reflection": "2–3 sentences of warm, practical reflection for daily life. Accessible to anyone, no jargon, no assumed belief."
  }
}

Rules:
- Every quote must be actual Jesus speech from the four Gospels.
- The affirmation must feel personal and specific, not generic.
- Choose a theme that is timeless and emotionally resonant.
- Today is ${new Date().toDateString()} — choose content appropriate for the day.`;

const ENCOURAGE_SYSTEM = `You are "The Red Letter Advisor." Generate a deeply generous encouragement package for someone in a specific life situation, drawn entirely from the direct words of Jesus in the four Gospels.

Return ONLY valid JSON (no markdown fences) with this structure:
{
  "theme": "The situation/theme name",
  "headline": "5–8 word powerful headline",
  "opening": "1–2 sentences of warm, specific empathy that meet the reader where they are",
  "passages": [
    {
      "verse": "Book Chapter:Verse",
      "quote": "Exact words of Jesus — no paraphrase",
      "context": "One sentence: why this matters for someone in this exact situation"
    }
  ],
  "practice": "One gentle, concrete suggestion for how to sit with these words today",
  "closing": "One warm, non-pressuring closing line"
}

Include 3–4 passages. Use only real, verifiable red-letter verses. Be emotionally generous — meet real pain with real comfort. The opening should make the reader feel profoundly understood.`;

const dailyCache = new Map();
// A failed generation serves the curated page for a few minutes, not all day.
const DAILY_RETRY_MS = 10 * 60 * 1000;

// Same local calendar day that dailyForDate uses, so the cache never serves
// yesterday's page into the morning.
function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function generateStructured(system, user, schema) {
  try {
    return await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: user }],
      ...structuredFormat(schema),
    });
  } catch (err) {
    // Only a rejected request shape earns a second call; a 429 or an overload
    // retried at once just doubles the bill.
    if (err?.status !== 400) throw err;
    console.error('Structured output fallback:', err.message);
    return client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      system,
      messages: [{ role: 'user', content: user }],
    });
  }
}

async function generateDailyFromModel() {
  const response = await generateStructured(
    dailySystem(),
    "Generate today's daily affirmation and word.",
    DAILY_SCHEMA
  );
  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  return verifyJsonQuotes(parseModelJson(text));
}

function fetchDailyContent() {
  const key = todayKey();
  const hit = dailyCache.get(key);
  if (hit && (!hit.retryAt || Date.now() < hit.retryAt)) return hit.promise;

  for (const k of dailyCache.keys()) if (k !== key) dailyCache.delete(k);

  if (!client) {
    const promise = Promise.resolve(dailyForDate());
    dailyCache.set(key, { promise });
    return promise;
  }

  // The promise is cached before it settles, so a morning rush makes one
  // model call, not one per reader.
  const entry = {};
  entry.promise = generateDailyFromModel().catch((err) => {
    console.error('Daily model fallback:', err.message);
    entry.retryAt = Date.now() + DAILY_RETRY_MS;
    return dailyForDate();
  });
  dailyCache.set(key, entry);
  return entry.promise;
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    anthropic: Boolean(client),
    themes: themeNames().length,
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
    // A real citation with invented words is not a match: say so, and hand
    // back the words actually spoken there.
    const mismatch = verified.ok && quote && verified.score < 0.8;
    return {
      ok: Boolean(verified.ok) && !mismatch,
      verse: verified.citation || verse,
      quote: verified.quote || quote,
      score: verified.score || 0,
      reason: verified.reason || (mismatch ? 'quote-mismatch' : quote ? 'quote-match' : 'citation'),
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

  if (!client) {
    return res.json(curated);
  }

  try {
    const response = await generateStructured(
      ENCOURAGE_SYSTEM,
      `Generate encouragement for: ${theme}`,
      ENCOURAGE_SCHEMA
    );
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const data = verifyJsonQuotes({ ...parseModelJson(text), theme });
    res.json(data);
  } catch (err) {
    console.error('Encouragement fallback:', err.message);
    res.json(curated);
  }
});

const FALLBACK_LETTER = [
  'I am here with you, and I will not rush past what you just named.',
  '',
  '**John 14:27**',
  '“Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.”',
  'These words meet a troubled heart without asking it to perform calm first.',
  '',
  '**Matthew 11:28**',
  '“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”',
  'The invitation is for the exhausted — including this moment.',
  '',
  'Sit with these two sentences. You do not have to solve the whole day.',
].join('\n');

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

  const write = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const streamText = (text) => {
    const chunk = 24;
    for (let i = 0; i < text.length; i += chunk) {
      write({ text: text.slice(i, i + chunk) });
    }
  };

  const crisis = assessCrisis(last.content);
  // What was disclosed earlier still governs which sayings are safe to send.
  const disclosed = crisis || assessConversation(messages.filter((m) => m.role === 'user').map((m) => m.content));
  let stream = null;
  const finish = (body) => {
    if (res.writableEnded || res.destroyed) return;
    const verified = holdBackUnsafe(verifyAndSubstitute(body), disclosed && disclosed.kind);
    streamText(crisis ? `${crisisNotice(crisis)}${verified}` : verified);
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // res 'close' fires when the visitor leaves (req 'close' fires once the body
  // is read). Abort the model call so an abandoned letter stops costing tokens.
  res.on('close', () => {
    if (stream) stream.abort();
  });

  if (!client) {
    return finish(FALLBACK_LETTER);
  }

  try {
    const retrieved = retrieveSayings(last.content);
    let sayings = retrieved.sayings;
    if (disclosed) {
      sayings = sayings.filter((s) => !unsafeSaying(disclosed.kind, s.text));
      if (sayings.length < 2) sayings = retrieveSayings('peace rest fear not').sayings.filter((s) => !unsafeSaying(disclosed.kind, s.text));
    }
    const allow = formatAllowList(sayings);
    const care = !disclosed ? '' : disclosed.kind === 'self' || disclosed.kind === 'other'
      ? '\n\nCARE: The writer may be at risk of ending a life. Urge real human help first (988 in the US). No sayings about death, dying, losing one\'s life, crosses or graves.'
      : '\n\nCARE: The writer has disclosed abuse or violence. Their safety comes first. Do not counsel forgiving, reconciling, staying, submitting, or examining their own fault.';
    const modelMessages = messages.map((m, i) => {
      if (i !== messages.length - 1) return { role: m.role, content: m.content };
      return {
        role: 'user',
        content: `${m.content}\n\nALLOWED SAYINGS (cite only these, as {{Book Chapter:Verse}}):\n${allow}${care}`,
      };
    });

    stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      system: ADVISOR_SYSTEM,
      messages: modelMessages,
    });

    let raw = '';
    stream.on('text', (text) => {
      raw += text;
    });

    // Nothing is written until the letter is verified, so keep the
    // connection visibly alive for proxies and the page's own timeout.
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(': ping\n\n');
    }, 15000);
    const message = await stream.finalMessage().finally(() => clearInterval(heartbeat));
    // A refusal or a cut-off letter would leave the page half-written.
    if (message.stop_reason !== 'end_turn' || !raw.trim()) {
      console.error('Chat fallback, stop_reason:', message.stop_reason);
      return finish(FALLBACK_LETTER);
    }
    finish(raw);
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
    }
    finish(FALLBACK_LETTER);
  }
});

const LEGACY_WAITLIST = path.join(__dirname, 'data', 'waitlist.json');

function waitlistEmails() {
  const emails = new Set();
  // Signups from before the move to one-line-per-email still count.
  try {
    const rows = JSON.parse(fs.readFileSync(LEGACY_WAITLIST, 'utf8'));
    if (Array.isArray(rows)) for (const r of rows) if (r?.email) emails.add(r.email);
  } catch (_) {}
  let text = '';
  try { text = fs.readFileSync(WAITLIST_PATH, 'utf8'); } catch (_) { return emails; }
  for (const line of text.split('\n')) {
    // One bad line (a torn write) costs that line, never the whole list.
    try { const row = JSON.parse(line); if (row?.email) emails.add(row.email); } catch (_) {}
  }
  return emails;
}

app.post('/api/waitlist', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return res.status(400).json({ error: 'A real email is needed.' });
  }
  if (!rateLimit(`wait:${clientKey(req)}`, 6, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Please return later.' });
  }
  const emails = waitlistEmails();
  if (!emails.has(email)) {
    if (emails.size >= WAITLIST_MAX) return res.status(503).json({ error: 'The list is full for now.' });
    fs.appendFileSync(WAITLIST_PATH, `${JSON.stringify({ email, at: new Date().toISOString() })}\n`);
  }
  res.json({ ok: true });
});

app.get('/welcome', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  // A missing file must 404, not come back as the page: a script tag that
  // receives HTML fails silently.
  if (path.extname(req.path)) return res.status(404).end();
  // The page loads its files by relative path, so it only works from the root.
  if (req.path.indexOf('/', 1) !== -1) return res.redirect(302, '/');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Bad JSON, an oversized body or a thrown handler: a short JSON error, never
// a stack trace with server paths.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled:', err);
  res.status(status).json({ error: status < 500 && err.expose ? err.message : 'Something went wrong.' });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`The Red Letter Advisor → http://localhost:${PORT}`);
  });
  // On deploy, finish the letters already being written, then go.
  const stop = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10000).unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

module.exports = app;
