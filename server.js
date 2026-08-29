require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const { parseModelJson, verifyAdvisorText, verifyJsonQuotes, looksLikeCrisis, CRISIS_NOTICE } = require('./lib/scripture');
const { dailyForDate, encouragementFor, themeNames } = require('./lib/curated');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const ACCESS_KEY = process.env.API_ACCESS_KEY || '';
const THEME_SET = new Set(themeNames());

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

function gate(req, res, next) {
  if (!ACCESS_KEY) return next();
  const sent = req.get('x-api-key');
  if (sent !== ACCESS_KEY) return res.status(401).json({ error: 'Unauthorized.' });
  next();
}

app.use('/api', gate);

const ADVISOR_SYSTEM = `You are "The Red Letter Advisor" — a deeply compassionate guide who helps people with life's real struggles using exclusively the direct words of Jesus Christ from the four Gospels: Matthew, Mark, Luke, and John.

RESPONSE STRUCTURE — follow this exactly every time:

1. EMPATHY (2–3 sentences): Open by truly meeting the person where they are. Name what they're feeling specifically. Make them feel genuinely heard before offering anything. Keep this conversational, not theological.

2. SCRIPTURE (2–4 passages): For each passage, use this exact format with a blank line between passages:

**Book Chapter:Verse**
"Exact words Jesus spoke — verbatim, no paraphrase, no additions."
One sentence explaining why this speaks directly to their situation.

3. CLOSING (1 sentence): A gentle, hopeful line that invites reflection without pressure.

STRICT RULES:
• Only quote the direct words of Jesus in Matthew, Mark, Luke, and John. Never quote Paul, prophets, or other authors.
• Every quote must be verbatim scripture — never fabricate or paraphrase a single word.
• Cite every verse in bold on its own line: **Matthew 5:44**
• Put the exact Jesus quote on the next line, in curly quotes "like this."
• Put the one-sentence context on the line after the quote.
• Separate each passage block with a blank line.
• If no direct red-letter parallel exists, say so honestly and offer the closest relevant teaching.
• Speak with warmth, without judgment, accessible to any background — never assume the reader's level of faith.
• The scripture passages carry the weight. Keep your own framing minimal.
• Prefer well-known, clearly dominical sayings (Sermon on the Mount, Farewell Discourse, parables in Jesus' voice).
• Never claim to be a person, a pastor, a clinician, or emergency care. If the writer is in danger, urge them toward human help first.`;

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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function generateDailyFromModel() {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1400,
    thinking: { type: 'adaptive' },
    system: DAILY_SYSTEM,
    messages: [{ role: 'user', content: "Generate today's daily affirmation and word." }],
  });
  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  return verifyJsonQuotes(parseModelJson(text));
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
    const curated = dailyForDate();
    dailyCache.set(key, curated);
    return curated;
  }
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

app.post('/api/encouragement', async (req, res) => {
  const theme = typeof req.body?.theme === 'string' ? req.body.theme.trim() : '';
  if (!theme || theme.length > 80) return res.status(400).json({ error: 'theme required.' });
  if (!THEME_SET.has(theme)) return res.status(400).json({ error: 'Unknown theme.' });
  if (!rateLimit(`enc:${clientKey(req)}`, 30, 60 * 60 * 1000)) {
    return res.status(429).json({ error: 'Please return later for more encouragement.' });
  }

  const curated = encouragementFor(theme);

  if (!client) {
    return res.json(curated);
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1600,
      thinking: { type: 'adaptive' },
      system: ENCOURAGE_SYSTEM,
      messages: [{ role: 'user', content: `Generate encouragement for: ${theme}` }],
    });
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

  if (!rateLimit(`chat:${clientKey(req)}`, 12, 60 * 1000)) {
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

  const crisis = looksLikeCrisis(last.content);
  const finish = (body) => {
    const verified = verifyAdvisorText(body);
    streamText(crisis ? `${CRISIS_NOTICE}${verified}` : verified);
    res.write('data: [DONE]\n\n');
    res.end();
  };

  req.on('close', () => {
    if (!res.writableEnded) {
      try { res.end(); } catch (_) {}
    }
  });

  if (!client) {
    return finish(FALLBACK_LETTER);
  }

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1400,
      thinking: { type: 'adaptive' },
      system: ADVISOR_SYSTEM,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    let raw = '';
    stream.on('text', (text) => {
      raw += text;
    });

    await stream.finalMessage();
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

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`The Red Letter Advisor → http://localhost:${PORT}`);
});
