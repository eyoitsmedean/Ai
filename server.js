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
  verifyQuote,
  fillPlaceholders,
  looksLikeCrisis,
  CRISIS_NOTICE,
} = require('./lib/scripture');
const { THEMES, dailyForDate, encouragementFor, themeNames } = require('./lib/curated');
const { searchLibrary, sayingCount } = require('./lib/library');
const { sayingTouchesCitation } = require('./lib/themes');
const { DAILY_SCHEMA, ENCOURAGE_SCHEMA, structuredFormat } = require('./lib/schemas');
const { retrieveSayings, formatAllowList } = require('./lib/retrieve');
const { holdPlaceholders } = require('./lib/stream');

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

function gate(req, res, next) {
  if (!ACCESS_KEY) return next();
  const sent = req.get('x-api-key');
  if (sent !== ACCESS_KEY) return res.status(401).json({ error: 'Unauthorized.' });
  next();
}

app.use('/api', gate);

/* ── Prompts ──────────────────────────────────────────────────────── */

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

SAFETY:
• Never claim to be a person, a pastor, a clinician, or emergency care.
• If the writer expresses suicidal ideation, self-harm intent, or immediate danger, do NOT give spiritual advice as the main response. Briefly acknowledge their pain, urge them toward human help first (call or text 988 in the US; https://findahelpline.com elsewhere), and keep any scripture secondary and non-prescriptive.
• Never tell someone to endure abuse, stay in danger, or avoid professional help.`;

const DAILY_SYSTEM = `You are a spiritual content generator for "The Red Letter Advisor." Create today's fresh daily content drawn ONLY from the direct words of Jesus Christ (red-letter passages in Matthew, Mark, Luke, John).

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
- Every quote must be actual Jesus speech from the four Gospels. The page verifies each citation against the KJV and replaces your wording with the recorded text.
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

Include 3–4 passages. Use only real, verifiable red-letter verses; the page verifies each citation against the KJV. Be emotionally generous — meet real pain with real comfort. The opening should make the reader feel profoundly understood.`;

/* ── Daily + encouragement (structured, verified) ─────────────────── */

const dailyCache = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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
    DAILY_SYSTEM,
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
  const results = list.slice(0, 12).map((item) => {
    const verse = typeof item?.verse === 'string' ? item.verse.slice(0, 80)
      : typeof item?.citation === 'string' ? item.citation.slice(0, 80) : '';
    const quote = typeof item?.quote === 'string' ? item.quote.slice(0, 2000) : '';
    if (!verse) return { ok: false, verified: false, reason: 'missing-verse', verse: '', quote: '' };
    const verified = verifyQuote(verse, quote);
    return {
      ok: Boolean(verified.ok),
      verified: Boolean(verified.ok),
      verse: verified.citation || verse,
      quote: verified.quote || quote,
      score: verified.score || 0,
      reason: verified.reason || (verified.ok ? 'quote-match' : 'unknown-ref'),
    };
  });
  const verifiedCount = results.filter((row) => row.ok).length;
  res.json({
    translation: 'KJV',
    total: results.length,
    verified: verifiedCount,
    results,
    allVerified: results.length > 0 && verifiedCount === results.length,
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

const CITE_LINE_RE = /^\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\*\*\s*$/i;

// Walks the final letter and checks every bold citation + quote line against
// the corpus, so the page can seal passages with the server's verdict instead
// of re-deriving it from a different translation.
function verifyReport(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const results = [];
  for (let i = 0; i < lines.length; i += 1) {
    const cite = lines[i].trim().match(CITE_LINE_RE);
    if (!cite) continue;
    let next = i + 1;
    while (next < lines.length && !lines[next].trim()) next += 1;
    const quoteLine = next < lines.length ? lines[next].trim() : '';
    const quote = /^["“]/.test(quoteLine) ? quoteLine.replace(/^["“]+/, '').replace(/["”]+\s*$/, '') : '';
    const v = verifyQuote(cite[1], quote);
    results.push({
      verse: v.citation || cite[1],
      verified: Boolean(v.ok),
      reason: v.reason || (v.ok ? 'quote-match' : 'unknown-ref'),
      score: typeof v.score === 'number' ? v.score : v.ok ? 1 : 0,
    });
  }
  const verified = results.filter((r) => r.verified).length;
  return {
    source: 'server',
    translation: 'KJV',
    total: results.length,
    verified,
    unverified: results.length - verified,
    results,
    allVerified: results.length > 0 && verified === results.length,
  };
}

function curatedContextFor(saying, themes) {
  for (const name of themes) {
    const pack = THEMES[name];
    if (!pack) continue;
    const hit = (pack.passages || []).find((p) => sayingTouchesCitation(saying, p.verse));
    if (hit && hit.context) return hit.context;
  }
  return '';
}

const FALLBACK_LETTER = [
  'I am here with you, and I will not rush past what you just named.',
  '',
  '{{John 14:27}}',
  'These words meet a troubled heart without asking it to perform calm first.',
  '',
  '{{Matthew 11:28}}',
  'The invitation is for the exhausted — including this moment.',
  '',
  'Sit with these two sentences. You do not have to solve the whole day.',
].join('\n');

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Without a model, the letter is still shaped by what was written. Curated
// theme passages come first (short, chosen by hand, each with a context line);
// library retrieval fills in only when no theme matches, and long multi-verse
// spans are skipped because they read badly as a reply.
function fallbackLetter(query) {
  let retrieved;
  try {
    retrieved = retrieveSayings(query, { limit: 6 });
  } catch (_) {
    return FALLBACK_LETTER;
  }
  const themes = retrieved.themes || [];
  const blocks = [];
  const used = new Set();
  const push = (citation, context) => {
    const key = String(citation).toLowerCase();
    if (used.has(key) || blocks.length >= 3) return;
    used.add(key);
    blocks.push(`{{${citation}}}\n${context}`);
  };

  if (themes[0] && THEMES[themes[0]]) {
    THEMES[themes[0]].passages.slice(0, 2).forEach((p) => push(p.verse, p.context));
  }
  if (themes[1] && THEMES[themes[1]]) {
    THEMES[themes[1]].passages.slice(0, 1).forEach((p) => push(p.verse, p.context));
  }
  for (const saying of retrieved.sayings || []) {
    if (blocks.length >= 3) break;
    if (wordCount(saying.text) > 45) continue;
    push(saying.citation, curatedContextFor(saying, themes) || 'Kept here exactly as it was spoken, for this moment.');
  }
  if (blocks.length < 2) return FALLBACK_LETTER;

  return [
    'I am here with you, and I will not rush past what you just named.',
    '',
    blocks.join('\n\n'),
    '',
    'Sit with these words for a minute. You do not have to solve the whole day.',
  ].join('\n');
}

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

  const send = (payload) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };
  const streamText = (text) => {
    const chunk = 24;
    for (let i = 0; i < text.length; i += chunk) send({ text: text.slice(i, i + chunk) });
  };
  const crisis = looksLikeCrisis(last.content);
  const finish = (finalText) => {
    // `replace` is the authoritative letter: the page swaps it in so any
    // verse the model typed itself is shown as the recorded text.
    send({ replace: finalText });
    send({ verify: verifyReport(finalText) });
    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  };
  const finishWithLetter = (letter) => {
    const body = `${crisis ? CRISIS_NOTICE : ''}${verifyAndSubstitute(letter)}`;
    streamText(body);
    finish(body);
  };

  req.on('close', () => {
    if (!res.writableEnded) {
      try { res.end(); } catch (_) { /* already closed */ }
    }
  });

  if (!client) return finishWithLetter(fallbackLetter(last.content));

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

    if (crisis) {
      streamed += CRISIS_NOTICE;
      send({ text: CRISIS_NOTICE });
    }

    const stream = client.messages.stream({
      ...modelParams(2048),
      system: ADVISOR_SYSTEM,
      messages: modelMessages,
    });

    // Tokens go out as they arrive, except that an unclosed {{ is held back
    // until its }} lands so the reader only ever sees the recorded verse.
    let rawText = '';
    let pending = '';
    const flushPending = (force) => {
      const { flush, rest } = holdPlaceholders(pending, force);
      pending = rest;
      if (!flush) return;
      const filled = fillPlaceholders(flush);
      streamed += filled;
      send({ text: filled });
    };
    stream.on('text', (delta) => {
      rawText += delta;
      pending += delta;
      flushPending(false);
    });

    const final = await stream.finalMessage();
    logStop('chat', final);
    flushPending(true);

    if (!rawText.trim()) return finishWithLetter(fallbackLetter(last.content));
    finish(`${crisis ? CRISIS_NOTICE : ''}${verifyAndSubstitute(rawText)}`);
  } catch (err) {
    console.error('Chat error:', err.message);
    if (streamed.trim()) {
      // Something already reached the page; hand it the verified fallback as
      // a replacement rather than a torn letter.
      const body = `${crisis ? CRISIS_NOTICE : ''}${verifyAndSubstitute(fallbackLetter(last.content))}`;
      finish(body);
    } else {
      finishWithLetter(fallbackLetter(last.content));
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
  });
}

module.exports = app;
