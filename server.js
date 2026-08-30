require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const letters = require('./data/red-letters');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Service-Worker-Allowed', '/');
    }
  },
}));

const hasKey = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasKey
  ? new Anthropic(
      process.env.ANTHROPIC_AUTH_TOKEN
        ? { authToken: process.env.ANTHROPIC_AUTH_TOKEN }
        : { apiKey: process.env.ANTHROPIC_API_KEY }
    )
  : null;

function hasApiCredentials() {
  return hasKey;
}

/* ── Living Advisor (KJV curated) ──────────────────────────────────────── */
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

function dayIndex(listLength) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start;
  const day = Math.floor(diff / 86400000);
  const len = listLength == null ? Math.max(CURATED_DAILY.length, 1) : listLength;
  return len ? day % len : 0;
}

function curatedDaily() {
  return { ...CURATED_DAILY[dayIndex(CURATED_DAILY.length)], source: 'curated' };
}

function curatedEnc(theme) {
  const key = ENC_ALIASES[theme] || theme;
  const data = CURATED_ENC[key] || CURATED_ENC.Hope;
  return { ...data, theme, source: 'curated' };
}

/* ── Chapel corpus (WEB) + citation lock ──────────────────────────────── */
const CORPUS_PATH = path.join(__dirname, 'public', 'data', 'corpus.json');
let corpusCache = null;
let verseCatalogCache = null;

function loadCorpus() {
  if (corpusCache) return corpusCache;
  try {
    corpusCache = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
  } catch (_) {
    corpusCache = { daily: [], encouragement: {}, verses: [], library: [] };
  }
  return corpusCache;
}

function normalizeCitation(cite) {
  return String(cite || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .trim();
}

function normalizeQuote(quote) {
  return String(quote || '')
    .toLowerCase()
    .replace(/[“”"'`]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function citationKeys(cite) {
  const norm = normalizeCitation(cite);
  const keys = new Set([norm]);
  const match = norm.match(/^(matthew|mark|luke|john)\s+(\d+):(\d+)(?:[a-z])?(?:-(\d+)(?:[a-z])?)?$/i);
  if (match) {
    const book = match[1];
    const chapter = match[2];
    const start = Number(match[3]);
    const end = match[4] ? Number(match[4]) : start;
    keys.add(`${book} ${chapter}:${start}`);
    if (end !== start) keys.add(`${book} ${chapter}:${start}-${end}`);
    for (let verse = start; verse <= end; verse += 1) keys.add(`${book} ${chapter}:${verse}`);
  }
  return [...keys];
}

function quoteOverlap(a, b) {
  const left = normalizeQuote(a);
  const right = normalizeQuote(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }
  const leftWords = new Set(left.split(' ').filter((w) => w.length > 3));
  const rightWords = right.split(' ').filter((w) => w.length > 3);
  if (!rightWords.length) return 0;
  let hits = 0;
  rightWords.forEach((word) => {
    if (leftWords.has(word)) hits += 1;
  });
  return hits / rightWords.length;
}

function buildVerseCatalog() {
  if (verseCatalogCache) return verseCatalogCache;
  const corpus = loadCorpus();
  const list = [];
  const byKey = new Map();

  function register(verse, quote, theme) {
    if (!verse || !quote) return;
    const entry = { verse: String(verse).trim(), quote: String(quote).trim(), theme: theme || '' };
    list.push(entry);
    citationKeys(entry.verse).forEach((key) => {
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(entry);
    });
  }

  (corpus.verses || []).forEach((item) => register(item.verse, item.quote, item.theme));
  (corpus.passages || []).forEach((item) => {
    const theme = Array.isArray(item.theme) ? item.theme[0] : item.theme;
    register(item.verse, item.text || item.quote, theme);
  });
  (letters.passages || []).forEach((p) => {
    const cite = typeof letters.cite === 'function' ? letters.cite(p) : `${p.book} ${p.chapter}:${p.verseStart}`;
    const theme = Array.isArray(p.theme) ? p.theme[0] : p.theme;
    register(cite, p.text, theme);
  });
  (corpus.daily || []).forEach((day) => {
    if (day.affirmation) register(day.affirmation.verse, day.affirmation.quote, day.word && day.word.theme);
    if (day.word) register(day.word.verse, day.word.passage, day.word.theme);
  });
  Object.values(corpus.encouragement || {}).forEach((pack) => {
    (pack.passages || []).forEach((passage) => register(passage.verse, passage.quote, pack.theme));
  });
  (corpus.library || []).forEach((item) => register(item.verse, item.quote, item.theme));
  CURATED_DAILY.forEach((day) => {
    if (day.affirmation) register(day.affirmation.verse, day.affirmation.quote, day.word && day.word.theme);
    if (day.word) register(day.word.verse, day.word.passage, day.word.theme);
  });
  Object.values(CURATED_ENC).forEach((pack) => {
    (pack.passages || []).forEach((passage) => register(passage.verse, passage.quote, pack.headline));
  });

  const seen = new Set();
  const unique = list.filter((item) => {
    const key = `${normalizeCitation(item.verse)}|${normalizeQuote(item.quote).slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  verseCatalogCache = { list: unique, byKey };
  return verseCatalogCache;
}

function verifyCitation(verse, quote) {
  const { byKey } = buildVerseCatalog();
  const matches = [];
  citationKeys(verse).forEach((key) => {
    const found = byKey.get(key);
    if (found) matches.push(...found);
  });
  if (!matches.length) {
    return { verse, verified: false, reason: 'unknown-citation', score: 0 };
  }
  if (!quote) {
    return { verse, verified: true, reason: 'citation-known', score: 0.7, match: matches[0] };
  }
  let best = null;
  let bestScore = 0;
  matches.forEach((entry) => {
    const score = quoteOverlap(entry.quote, quote);
    if (!best || score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  if (bestScore >= 0.55) {
    return { verse, verified: true, reason: 'quote-match', score: bestScore, match: best };
  }
  return {
    verse,
    verified: false,
    reason: 'quote-mismatch',
    score: bestScore,
    expected: best ? best.quote : null,
    match: best,
  };
}

function catalogPromptBlock() {
  const { list } = buildVerseCatalog();
  const lines = list.slice(0, 80).map((item) => {
    const short = item.quote.length > 160 ? `${item.quote.slice(0, 160)}…` : item.quote;
    return `- ${item.verse}: "${short}"`;
  });
  return `VERIFIED RED-LETTER CATALOG (prefer these exact citations; do not invent):\n${lines.join('\n')}`;
}

function advisorSystemPrompt() {
  return `${ADVISOR_SYSTEM}

${catalogPromptBlock()}

QUOTE LOCK:
• When a catalog verse fits, quote it verbatim.
• Never invent a citation or paraphrase Jesus' words.
• If unsure of exact wording, use a shorter verified phrase rather than guessing.`;
}

function verifyChatBlocks(fullText) {
  const blocks = [];
  const lines = String(fullText || '').replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const citeMatch = lines[i].trim().match(
      /^\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\*\*\s*$/i
    );
    if (!citeMatch) continue;
    let next = i + 1;
    while (next < lines.length && !lines[next].trim()) next += 1;
    const quoteLine = next < lines.length ? lines[next].trim() : '';
    let quote = '';
    if (/^["“]/.test(quoteLine)) {
      quote = quoteLine.replace(/^["“]+/, '').replace(/["”]+\s*$/, '');
    }
    blocks.push(verifyCitation(citeMatch[1], quote));
  }
  return {
    total: blocks.length,
    verified: blocks.filter((item) => item.verified).length,
    results: blocks,
  };
}

function offlineDaily() {
  const corpus = loadCorpus();
  const list = corpus.daily || [];
  return list[dayIndex(list.length)] || list[0] || curatedDaily();
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
• Cite every verse in bold on its own line: **Matthew 5:44**
• Put the exact Jesus quote on the next line, in curly quotes "like this."
• Put the one-sentence context on the line after the quote.
• Separate each passage block with a blank line.
• If no direct red-letter parallel exists, say so honestly and offer the closest relevant teaching.
• Speak with warmth, without judgment, accessible to any background — never assume the reader's level of faith.
• The scripture passages carry the weight. Keep your own framing minimal.

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

app.get('/welcome', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (_req, res) => {
  const corpus = loadCorpus();
  const chapelLoaded = Boolean(
    (corpus.passages && corpus.passages.length) ||
    (corpus.daily && corpus.daily.length) ||
    (corpus.verses && corpus.verses.length)
  );
  res.json({
    ok: true,
    model: MODEL,
    llm: !!client,
    corpus: chapelLoaded,
    corpusPassages: (letters.passages || []).length,
    version: require('./package.json').version,
  });
});

app.get('/api/quota', (_req, res) => {
  res.json({ used: 0, remaining: null, limit: null, unlimited: true });
});

app.get('/api/library', (req, res) => {
  const theme = req.query.theme;
  const book = req.query.book;
  let passages = letters.passages || [];
  if (book && typeof letters.byBook === 'function') passages = letters.byBook(String(book));
  if (theme) {
    passages = passages.filter((p) =>
      Array.isArray(p.theme) ? p.theme.includes(String(theme)) : p.theme === String(theme)
    );
  }
  res.json({
    translation: letters.translation || 'WEB',
    translationName: letters.translationName || 'World English Bible',
    themes: letters.THEMES || [],
    books: letters.BOOKS || ['Matthew', 'Mark', 'Luke', 'John'],
    passages: passages.map((p) => ({
      id: p.id,
      verse: typeof letters.cite === 'function' ? letters.cite(p) : `${p.book} ${p.chapter}:${p.verseStart}`,
      book: p.book,
      chapter: p.chapter,
      theme: p.theme,
      text: p.text,
      note: p.note || null,
    })),
  });
});

app.get('/api/corpus', (_req, res) => {
  try {
    res.json(loadCorpus());
  } catch (err) {
    res.status(500).json({ error: 'Corpus unavailable.' });
  }
});

app.get('/api/verses', (_req, res) => {
  try {
    const { list } = buildVerseCatalog();
    res.json({ count: list.length, verses: list });
  } catch (err) {
    res.status(500).json({ error: 'Verse catalog unavailable.' });
  }
});

app.post('/api/verify', (req, res) => {
  try {
    const citations = Array.isArray(req.body?.citations) ? req.body.citations : [];
    if (!citations.length && typeof req.body?.text === 'string') {
      const text = req.body.text;
      const citationLine =
        /\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\*\*/gi;
      const found = [];
      let match;
      while ((match = citationLine.exec(text)) !== null) {
        found.push({ verse: match[1], quote: '' });
      }
      const results = found.map((item) => verifyCitation(item.verse, item.quote));
      return res.json({
        total: results.length,
        verified: results.filter((item) => item.verified).length,
        results,
      });
    }
    const results = citations.map((item) =>
      verifyCitation(item?.verse || item?.citation || '', item?.quote || '')
    );
    res.json({
      total: results.length,
      verified: results.filter((item) => item.verified).length,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

app.get('/api/daily', async (_req, res) => {
  try {
    res.json(await fetchDailyContent());
  } catch (err) {
    console.error('Daily error:', err.message);
    try {
      res.json(curatedDaily());
    } catch {
      res.json({ ...offlineDaily(), source: 'corpus-error-fallback' });
    }
  }
});

app.post('/api/encouragement', async (req, res) => {
  const theme = String(req.body?.theme || '').trim().slice(0, 80);
  if (!theme) return res.status(400).json({ error: 'theme required.' });

  const corpus = loadCorpus();
  const fromCorpus = corpus.encouragement && corpus.encouragement[theme];

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
    if (fromCorpus) return res.json({ ...fromCorpus, theme, source: 'corpus-fallback' });
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
        'I am glad you reached out — what you are carrying sounds unbearably heavy. I am not a crisis counselor. Please contact emergency services or call/text 988 (Suicide & Crisis Lifeline in the US) or find help at https://www.iasp.info/suicidalthoughts/ right away, and tell someone you trust.\n\n' +
        fallback;
    }
    const verify = verifyChatBlocks(fallback);
    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ verify })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    if (crisis) {
      const notice =
        'I am glad you reached out — what you are carrying sounds unbearably heavy. I am not a crisis counselor. Please contact emergency services or call/text **988** (Suicide & Crisis Lifeline in the US) or https://www.iasp.info/suicidalthoughts/ right away, and tell someone you trust.\n\n';
      res.write(`data: ${JSON.stringify({ text: notice })}\n\n`);
    }

    let fullText = '';
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1400,
      system: advisorSystemPrompt(),
      messages: normalized,
    });

    stream.on('text', (text) => {
      fullText += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ verify: verifyChatBlocks(fullText) })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) return res.status(500).json({ error: 'Failed to respond.' });
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`R  The Red Letter Advisor → http://localhost:${PORT}`);
  console.log(`   Landing: http://localhost:${PORT}/welcome`);
  console.log(`   LLM: ${client ? MODEL : 'living Advisor + curated (no API key)'}`);
});
