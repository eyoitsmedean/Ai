require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const hasKey = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasKey
  ? new Anthropic(
      process.env.ANTHROPIC_AUTH_TOKEN
        ? { authToken: process.env.ANTHROPIC_AUTH_TOKEN }
        : { apiKey: process.env.ANTHROPIC_API_KEY }
    )
  : null;

/* ── Curated fallbacks (single source: public/data/curated.js) ──────── */
const vm = require('vm');
function loadCurated() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'public/data/curated.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'public/data/advisor.js'), 'utf8'), ctx);
  return ctx.window;
}
const curatedBrowser = loadCurated();
const CURATED_DAILY = (curatedBrowser.RLA_CURATED && curatedBrowser.RLA_CURATED.daily) || [];
const CURATED_ENC = (curatedBrowser.RLA_CURATED && curatedBrowser.RLA_CURATED.encouragement) || {};
const ENC_ALIASES = curatedBrowser.RLA_THEME_ALIASES || {};

function dayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start;
  return Math.floor(diff / 86400000) % Math.max(CURATED_DAILY.length, 1);
}

function curatedDaily() {
  return { ...CURATED_DAILY[dayIndex()], source: 'curated' };
}

function curatedEnc(theme) {
  const key = ENC_ALIASES[theme] || theme;
  const data = CURATED_ENC[key] || CURATED_ENC['Hope'];
  return { ...data, theme, source: 'curated' };
}

/* ── Prompts ───────────────────────────────────────────────────────────── */
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
• You are not a pastor, therapist, or crisis counselor. If someone appears to be in immediate danger or expressing suicidal despair, gently urge them to contact local emergency services or the 988 Suicide & Crisis Lifeline (call/text 988 in the US) and to reach a trusted human — then still offer a brief, compassionate red-letter word if appropriate.`;

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

Include 3–4 passages. Use only real, verifiable red-letter verses. Be emotionally generous — meet real pain with real comfort.`;

/* ── Helpers ───────────────────────────────────────────────────────────── */
const dailyCache = new Map();
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function extractJSON(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in model response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

const CRISIS_RE =
  /\b(suicid(?:e|al)|kill myself|end my life|want to die|self[- ]?harm|cut myself|no reason to live)\b/i;

function looksLikeCrisis(text) {
  return CRISIS_RE.test(text || '');
}

async function fetchDailyContent() {
  const key = todayKey();
  if (dailyCache.has(key)) return dailyCache.get(key);

  if (!client) {
    const data = curatedDaily();
    dailyCache.set(key, data);
    return data;
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: DAILY_SYSTEM,
      messages: [{ role: 'user', content: "Generate today's daily affirmation and word." }],
    });
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const data = { ...extractJSON(text), source: 'model' };
    dailyCache.set(key, data);
    return data;
  } catch (err) {
    console.error('Daily model error, using curated:', err.message);
    const data = curatedDaily();
    dailyCache.set(key, data);
    return data;
  }
}

/* ── Routes ────────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    llm: !!client,
    version: '2.0.0',
  });
});

app.get('/api/daily', async (_req, res) => {
  try {
    res.json(await fetchDailyContent());
  } catch (err) {
    console.error('Daily error:', err.message);
    res.json(curatedDaily());
  }
});

app.post('/api/encouragement', async (req, res) => {
  const theme = String(req.body?.theme || '').trim().slice(0, 80);
  if (!theme) return res.status(400).json({ error: 'theme required.' });

  if (!client) return res.json(curatedEnc(theme));

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1600,
      system: ENCOURAGE_SYSTEM,
      messages: [{ role: 'user', content: `Generate encouragement for: ${theme}` }],
    });
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    res.json({ ...extractJSON(text), source: 'model' });
  } catch (err) {
    console.error('Encouragement error, using curated:', err.message);
    res.json(curatedEnc(theme));
  }
});

app.post('/api/chat', async (req, res) => {
  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required.' });
  }
  if (messages.length > 40) {
    return res.status(400).json({ error: 'Conversation too long. Start a new chat.' });
  }

  const normalized = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!normalized.length || !normalized[normalized.length - 1].content.trim()) {
    return res.status(400).json({ error: 'Empty message.' });
  }

  const lastUser = [...normalized].reverse().find((m) => m.role === 'user')?.content || '';
  const crisis = looksLikeCrisis(lastUser);

  if (!client) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    let fallback = typeof curatedBrowser.RLA_advise === 'function'
      ? curatedBrowser.RLA_advise(lastUser)
      : 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.';
    if (crisis && fallback && fallback.indexOf('988') === -1) {
      fallback =
        'I am glad you reached out — what you are carrying sounds unbearably heavy. I am not a crisis counselor. Please contact emergency services or call/text 988 (Suicide & Crisis Lifeline in the US) right away, and tell someone you trust.\n\n' +
        fallback;
    }
    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    if (crisis) {
      const notice =
        'I am glad you reached out — what you are carrying sounds unbearably heavy. I am not a crisis counselor. Please contact emergency services or call/text **988** (Suicide & Crisis Lifeline in the US) right away, and tell someone you trust.\n\n';
      res.write(`data: ${JSON.stringify({ text: notice })}\n\n`);
    }

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1400,
      system: ADVISOR_SYSTEM,
      messages: normalized,
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) return res.status(500).json({ error: 'Failed to respond.' });
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

/* SPA fallback */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✝  The Red Letter Advisor → http://localhost:${PORT}`);
  console.log(`   LLM: ${client ? MODEL : 'curated fallbacks only (no API key)'}`);
});
