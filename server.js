require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const zlib = require('zlib');
const {
  corpus,
  verifyPassage,
  verifyPassages,
  annotateAdvisorText,
  offlineDaily,
  offlineEncouragement,
  detectCrisis,
} = require('./data/scripture');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const FREE_CHAT_LIMIT = Number(process.env.FREE_CHAT_LIMIT || 5);
const IS_PROD = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  const proto = req.headers['x-forwarded-proto'];
  if (IS_PROD && proto === 'http') {
    return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "manifest-src 'self'",
      "worker-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/chat')) return next();
  const ae = String(req.headers['accept-encoding'] || '');
  if (!/(gzip|deflate)/.test(ae) || req.headers['x-no-compress']) return next();
  const useGzip = ae.includes('gzip');
  const _write = res.write.bind(res);
  const _end = res.end.bind(res);
  let chunks = [];
  res.write = (chunk, enc) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc));
    return true;
  };
  res.end = (chunk, enc) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc));
    const raw = Buffer.concat(chunks);
    const type = String(res.getHeader('Content-Type') || '');
    const compressible = /text|json|javascript|xml|svg|manifest/.test(type) && raw.length > 512;
    if (!compressible || res.headersSent) {
      res.write = _write;
      res.end = _end;
      return _end(raw);
    }
    const packed = useGzip ? zlib.gzipSync(raw) : zlib.deflateSync(raw);
    res.setHeader('Content-Encoding', useGzip ? 'gzip' : 'deflate');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Length', packed.length);
    res.write = _write;
    res.end = _end;
    return _end(packed);
  };
  next();
});

app.use(express.json({ limit: '256kb' }));

const apiHits = new Map();
app.use('/api/', (req, res, next) => {
  const id = String(req.headers['x-client-id'] || req.ip || 'anon').slice(0, 80);
  const now = Date.now();
  const recent = (apiHits.get(id) || []).filter((t) => now - t < 60000);
  const cap = req.path === '/chat' ? 20 : 90;
  if (recent.length >= cap) {
    return res.status(429).json({ error: 'slow_down', message: 'Please wait a moment, then try again.' });
  }
  recent.push(now);
  apiHits.set(id, recent);
  next();
});

app.get('/welcome', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/offline', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'offline.html')));
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders(res, filePath) {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Service-Worker-Allowed', '/');
      } else if (/\.(png|jpg|webp|woff2)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else if (filePath.endsWith('manifest.json')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

const hasAuth = !!(process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY);
const ai = hasAuth
  ? new Anthropic(
      process.env.ANTHROPIC_AUTH_TOKEN
        ? { authToken: process.env.ANTHROPIC_AUTH_TOKEN }
        : { apiKey: process.env.ANTHROPIC_API_KEY }
    )
  : null;

const chatQuota = new Map();
const dailyCache = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getClientId(req) {
  return String(req.headers['x-client-id'] || req.ip || 'anon').slice(0, 80);
}

function getQuota(id) {
  const key = `${todayKey()}:${id}`;
  const used = chatQuota.get(key) || 0;
  return { used, remaining: Math.max(0, FREE_CHAT_LIMIT - used), limit: FREE_CHAT_LIMIT };
}

function bumpQuota(id) {
  const key = `${todayKey()}:${id}`;
  chatQuota.set(key, (chatQuota.get(key) || 0) + 1);
  return getQuota(id);
}

function parseJsonLoose(text) {
  return JSON.parse(
    String(text || '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
  );
}

function guessTheme(text) {
  const t = String(text).toLowerCase();
  const map = [
    [/anxi|worr|stress|overwhelm/, 'Anxiety & Worry'],
    [/grief|mourn|loss|died|death|funeral/, 'Grief & Loss'],
    [/forgiv/, 'Forgiveness'],
    [/lonely|alone|abandon/, 'Loneliness'],
    [/conflict|enemy|anger|argue|relationship/, 'Conflict & Relationships'],
    [/fear|afraid|scared|terrified/, 'Fear'],
    [/purpose|direction|calling|lost/, 'Purpose & Direction'],
    [/doubt|faith|believe/, 'Faith & Doubt'],
    [/suffer|pain|sick|hurt/, 'Suffering & Pain'],
    [/shame|guilt|ashamed|regret/, 'Shame & Guilt'],
    [/peace|rest|calm/, 'Peace'],
    [/hope|despair|hopeless/, 'Hope'],
  ];
  for (const [re, theme] of map) {
    if (re.test(t)) return theme;
  }
  return 'Hope';
}

function publicCorpusPayload() {
  return {
    translation: corpus.translation,
    translationName: corpus.translationName,
    themes: corpus.THEMES,
    books: corpus.BOOKS || ['Matthew', 'Mark', 'Luke', 'John'],
    passages: corpus.passages.map((p) => ({
      id: p.id,
      verse: corpus.cite(p),
      book: p.book,
      chapter: p.chapter,
      theme: p.theme,
      text: p.text,
      note: p.note || null,
    })),
  };
}

function verseCatalog() {
  return corpus.passages.map((p) => ({
    verse: corpus.cite(p),
    quote: p.text,
    theme: Array.isArray(p.theme) ? p.theme[0] : p.theme || '',
  }));
}

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
• Prefer World English Bible (WEB) wording when recalling verses; if unsure of exact wording, choose a shorter verified phrase and cite accurately rather than inventing.
• Cite every verse in bold on its own line: **Matthew 5:44**
• Put the exact Jesus quote on the next line, in curly quotes "like this."
• Put the one-sentence context on the line after the quote.
• Separate each passage block with a blank line.
• Prefer well-known dominical sayings (Sermon on the Mount, John 14–16, parables Jesus told, etc.).
• If no direct red-letter parallel exists, say so honestly and offer the closest relevant teaching.
• Speak with warmth, without judgment, accessible to any background — never assume the reader's level of faith.
• The scripture passages carry the weight. Keep your own framing minimal.
• Never claim to be Jesus, a pastor, a therapist, or a crisis counselor.

SAFETY:
• You are not a pastor, therapist, or crisis counselor.
• If the user expresses suicidal ideation, self-harm intent, or immediate danger, do NOT give spiritual advice as the main response. Briefly acknowledge their pain, urge them to contact emergency services or the 988 Suicide & Crisis Lifeline (call/text 988 in the US) or https://www.iasp.info/suicidalthoughts/ internationally, and keep any scripture secondary and non-prescriptive.
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
- Every quote must be actual Jesus speech from the four Gospels (WEB preferred).
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

Include 3–4 passages. Use only real, verifiable red-letter verses (WEB preferred). Be emotionally generous — meet real pain with real comfort. The opening should make the reader feel profoundly understood.`;

const CRISIS_REPLY = `I hear how heavy this is, and I'm glad you said something. I am a reflective guide using the words of Jesus — not a crisis counselor, and not a substitute for real human help.

If you are in immediate danger or thinking about hurting yourself, please reach out now:
• In the US & Canada, call or text **988** (Suicide & Crisis Lifeline)
• Or go to https://www.iasp.info/suicidalthoughts/ for local resources worldwide

You are not alone. People are ready to help you through this moment.

If you want, after you are safe, we can sit with words Jesus spoke about weariness and rest — but your safety comes first.`;

async function getDaily() {
  const key = todayKey();
  if (dailyCache.has(key)) return dailyCache.get(key);

  if (!ai) {
    const offline = offlineDaily(key);
    dailyCache.set(key, { ...offline, source: 'corpus' });
    return dailyCache.get(key);
  }

  try {
    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 1400,
      thinking: { type: 'adaptive' },
      system: DAILY_SYSTEM,
      messages: [{ role: 'user', content: "Generate today's daily affirmation and word." }],
    });
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const data = parseJsonLoose(text);
    const aff = await verifyPassage({ verse: data.affirmation?.verse, quote: data.affirmation?.quote });
    const word = await verifyPassage({ verse: data.word?.verse, quote: data.word?.passage });
    const fallback = offlineDaily(key);
    const out = {
      affirmation: {
        text: data.affirmation?.text || fallback.affirmation.text,
        verse: aff.verse,
        quote: aff.quote,
        verified: aff.verified,
      },
      word: {
        theme: data.word?.theme || fallback.word.theme || 'Presence',
        title: data.word?.title || fallback.word.title,
        passage: word.quote,
        verse: word.verse,
        reflection: data.word?.reflection || fallback.word.reflection,
        verified: word.verified,
      },
      verified: !!(aff.verified && word.verified),
      source: 'model',
    };
    dailyCache.set(key, out);
    return out;
  } catch (err) {
    console.error('Daily LLM error:', err.message);
    const offline = offlineDaily(key);
    dailyCache.set(key, { ...offline, source: 'corpus-fallback' });
    return dailyCache.get(key);
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasAuth,
    api: hasAuth,
    name: 'red-letter-advisor',
    version: '1.1.0',
    corpusPassages: corpus.passages.length,
    themes: corpus.THEMES.length,
    freeChatLimit: FREE_CHAT_LIMIT,
    env: IS_PROD ? 'production' : 'development',
  });
});

app.post('/api/waitlist', (req, res) => {
  const email = String(req.body?.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  res.json({ ok: true });
});

app.get('/api/quota', (req, res) => {
  res.json(getQuota(getClientId(req)));
});

app.get('/api/corpus', (_req, res) => {
  res.json(publicCorpusPayload());
});

app.get('/api/verses', (_req, res) => {
  const list = verseCatalog();
  res.json({ translation: corpus.translation || 'WEB', count: list.length, verses: list });
});

app.post('/api/verify', async (req, res) => {
  try {
    const citations = Array.isArray(req.body?.citations) ? req.body.citations : [];
    if (!citations.length && typeof req.body?.text === 'string') {
      const annotated = await annotateAdvisorText(req.body.text);
      return res.json({
        total: annotated.citations.length,
        verified: annotated.grounded,
        grounded: annotated.grounded,
        unverified: annotated.unverified,
        text: annotated.text,
        results: annotated.citations,
      });
    }
    const results = await verifyPassages(
      citations.map((item) => ({ verse: item.verse, quote: item.quote || '' }))
    );
    res.json({
      total: results.length,
      verified: results.filter((item) => item.verified).length,
      results,
    });
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

app.get('/api/library', (req, res) => {
  const theme = req.query.theme;
  const book = req.query.book;
  let passages = corpus.passages;
  if (book) passages = corpus.byBook(String(book));
  if (theme) {
    passages = passages.filter((p) =>
      Array.isArray(p.theme) ? p.theme.includes(String(theme)) : p.theme === String(theme)
    );
  }
  res.json({
    translation: corpus.translation,
    translationName: corpus.translationName,
    themes: corpus.THEMES,
    books: corpus.BOOKS || ['Matthew', 'Mark', 'Luke', 'John'],
    passages: passages.map((p) => ({
      id: p.id,
      verse: corpus.cite(p),
      book: p.book,
      chapter: p.chapter,
      theme: p.theme,
      text: p.text,
      note: p.note || null,
    })),
  });
});

app.get('/api/daily', async (_req, res) => {
  try {
    res.json(await getDaily());
  } catch (err) {
    console.error('Daily error:', err.message);
    res.json({ ...offlineDaily(todayKey()), source: 'corpus-error-fallback' });
  }
});

app.post('/api/encouragement', async (req, res) => {
  const { theme } = req.body || {};
  if (!theme || typeof theme !== 'string') {
    return res.status(400).json({ error: 'theme required.' });
  }
  if (!ai) return res.json({ ...offlineEncouragement(theme), source: 'corpus' });

  try {
    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 1600,
      thinking: { type: 'adaptive' },
      system: ENCOURAGE_SYSTEM,
      messages: [{ role: 'user', content: `Generate encouragement for: ${theme}` }],
    });
    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const data = parseJsonLoose(text);
    const passages = await verifyPassages(data.passages || []);
    res.json({
      theme: data.theme || theme,
      headline: data.headline,
      opening: data.opening,
      passages,
      practice: data.practice,
      closing: data.closing,
      verified: passages.every((p) => p.verified),
      source: 'model',
    });
  } catch (err) {
    console.error('Encouragement error:', err.message);
    res.json({ ...offlineEncouragement(theme), source: 'corpus-fallback' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required.' });
  }
  if (!messages[messages.length - 1]?.content?.trim()) {
    return res.status(400).json({ error: 'Empty message.' });
  }

  const id = getClientId(req);
  const quota = getQuota(id);
  if (quota.remaining <= 0) {
    return res.status(402).json({
      error: 'daily_limit',
      message:
        'You have used today’s free Advisor conversations. Come back tomorrow, or unlock Plus for unlimited guidance.',
      ...quota,
    });
  }

  const lastUser = messages.filter((m) => m.role === 'user').pop()?.content || '';
  if (detectCrisis(lastUser)) {
    bumpQuota(id);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ text: CRISIS_REPLY, crisis: true })}\n\n`);
    res.write(
      `data: ${JSON.stringify({ done: true, crisis: true, citations: [], quota: getQuota(id) })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  if (!ai) {
    bumpQuota(id);
    const pack = offlineEncouragement(guessTheme(lastUser));
    const text = [
      'I hear you. Here are words Jesus actually spoke that speak into what you shared — drawn from our verified red-letter library (offline mode).',
      '',
      ...pack.passages.slice(0, 3).flatMap((p) => [`**${p.verse}**`, `"${p.quote}"`, p.context, '']),
      pack.closing,
    ].join('\n');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    for (const chunk of text.match(/.{1,48}/gs) || [text]) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    const annotated = await annotateAdvisorText(text);
    if (annotated.text && annotated.text !== text) {
      res.write(`data: ${JSON.stringify({ replace: annotated.text })}\n\n`);
    }
    res.write(
      `data: ${JSON.stringify({
        done: true,
        citations: annotated.citations,
        grounded: annotated.grounded,
        unverified: annotated.unverified,
        quota: getQuota(id),
        offline: true,
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    bumpQuota(id);
    const stream = ai.messages.stream({
      model: MODEL,
      max_tokens: 1400,
      thinking: { type: 'adaptive' },
      system: ADVISOR_SYSTEM,
      messages,
    });

    let full = '';
    stream.on('text', (text) => {
      full += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    const annotated = await annotateAdvisorText(full);
    if (annotated.text && annotated.text !== full) {
      res.write(`data: ${JSON.stringify({ replace: annotated.text })}\n\n`);
    }
    res.write(
      `data: ${JSON.stringify({
        done: true,
        citations: annotated.citations,
        grounded: annotated.grounded,
        unverified: annotated.unverified,
        quota: getQuota(id),
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) return res.status(500).json({ error: 'Failed to respond.' });
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', 'offline.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`✝  The Red Letter Advisor → http://${HOST}:${PORT}`);
  console.log(`   Auth: ${hasAuth ? 'configured' : 'offline corpus mode'}`);
  console.log(`   Corpus: ${corpus.passages.length} verified red-letter passages`);
  console.log(`   Landing: http://${HOST}:${PORT}/welcome`);
});

function shutdown(signal) {
  console.log(signal + ' — closing');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 4000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
