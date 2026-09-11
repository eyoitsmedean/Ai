require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');
const webpush = require('web-push');
const {
  corpus,
  verifyPassage,
  verifyPassages,
  annotateAdvisorText,
  offlineDaily,
  offlineEncouragement,
  detectCrisis,
  detectPassiveIdeation,
  looksSpanish,
  classifyIntent,
  guessTheme,
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

const QID_RE = /^[A-Za-z0-9_-]{8,80}$/;

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    try {
      out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      /* ignore malformed cookie encodings */
    }
  }
  return out;
}

function ensureClientId(req, res) {
  if (req.rlaId) return req.rlaId;
  const fromCookie = parseCookies(req).rla_qid;
  if (QID_RE.test(fromCookie || '')) {
    req.rlaId = fromCookie;
    return fromCookie;
  }
  const fromHeader = String(req.headers['x-client-id'] || '').slice(0, 80);
  const id = QID_RE.test(fromHeader) ? fromHeader : crypto.randomUUID();
  res.append(
    'Set-Cookie',
    `rla_qid=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${IS_PROD ? '; Secure' : ''}`
  );
  req.rlaId = id;
  return id;
}

const apiHits = new Map();
app.use('/api/', (req, res, next) => {
  const id = ensureClientId(req, res);
  const now = Date.now();
  const recent = (apiHits.get(id) || []).filter((t) => now - t < 60000);
  const cap = req.path === '/chat' ? 20 : 90;
  if (recent.length >= cap) {
    // A person in danger must never be told to wait.
    const last = req.path === '/chat' && Array.isArray(req.body?.messages)
      ? [...req.body.messages].reverse().find((m) => m && m.role !== 'assistant' && typeof m.content === 'string')?.content
      : '';
    const intent = last ? classifyIntent(last) : 'guidance';
    if (intent !== 'crisis' && intent !== 'abuse') {
      return res.status(429).json({ error: 'slow_down', message: 'Please wait a moment, then try again.' });
    }
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
  return req.rlaId || String(req.headers['x-client-id'] || req.ip || 'anon').slice(0, 80);
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

SCOPE:
• You help with life situations: fear, grief, anger, loneliness, shame, decisions, relationships, work, money worry, faith and doubt, rest.
• If asked for something else — code, homework, trivia, weather, sports, finance tips, medical dosing, legal filings, creative writing on demand — do not force a verse onto it. In two or three warm sentences say plainly that it is outside what you are for, name what you are for, and invite them to bring whatever is underneath the question. No scripture block in that case.
• If the user is hostile, mocking, or says they do not believe: do not argue, do not defend, do not moralize. Acknowledge that doubt is welcome, then offer one or two red-letter passages with no pressure.

SAFETY:
• You are not a pastor, therapist, or crisis counselor.
• If the user expresses suicidal ideation, self-harm intent, or immediate danger, do NOT give spiritual advice as the main response. Briefly acknowledge their pain, urge them to contact emergency services or the 988 Suicide & Crisis Lifeline (call/text 988 in the US) or https://www.iasp.info/suicidalthoughts/ internationally, and keep any scripture secondary and non-prescriptive.
• If the user describes being hit, threatened, or abused by someone, say clearly that it is not their fault and not something to endure, give the National Domestic Violence Hotline (US: call 1-800-799-7233, text START to 88788, thehotline.org) and 911 for immediate danger, and keep scripture brief and secondary.
• Never tell someone to endure abuse, stay in danger, or avoid professional help.
• Never diagnose, prescribe, or advise stopping medication or treatment.`;

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

const CRISIS_REPLY_ES = `Siento mucho que estés cargando esto, y me alegra que lo hayas dicho. Soy una guía que comparte las palabras de Jesús — no soy un consejero de crisis, y no reemplazo la ayuda humana real.

Si estás en peligro o pensando en hacerte daño, por favor busca ayuda ahora:
• En EE. UU. y Canadá, llama o envía un mensaje de texto al **988** (hay atención en español)
• O visita https://www.iasp.info/suicidalthoughts/ para recursos en tu país

No estás solo. Hay personas listas para acompañarte en este momento.`;

const ABUSE_REPLY = `Thank you for trusting me with this. What you are describing is not something you have to endure, and it is not your fault. I am a reflective guide using the words of Jesus — not a counselor — so the most caring thing I can do is point you to people trained for exactly this:

• If you are in immediate danger, call **911** (US) or your local emergency number
• **National Domestic Violence Hotline** (US): call **1-800-799-7233**, text **START** to **88788**, or chat at https://www.thehotline.org — free, confidential, 24/7
• Outside the US: https://www.hotpeachpages.net lists local helplines by country

If someone may be watching your phone, clear this conversation afterward (Saved → delete).

Jesus never asked anyone to stay in harm's way. When you are safe, I am here — and so are His words about being seen, valued, and not alone.`;

const ABUSE_REPLY_ES = `Gracias por confiarme esto. Lo que describes no es algo que debas soportar, y no es tu culpa. It is not your fault. Soy una guía que comparte las palabras de Jesús — no soy consejero — así que lo más cuidadoso es señalarte a personas entrenadas para esto:

• Si estás en peligro inmediato, llama al **911** (EE. UU.) o a tu número de emergencia local
• **Línea Nacional contra la Violencia Doméstica** (EE. UU.): llama al **1-800-799-7233** (hay atención en español), envía **START** al **88788**, o entra a https://www.thehotline.org — gratis, confidencial, 24/7
• Fuera de EE. UU.: https://www.hotpeachpages.net lista líneas de ayuda por país

Si alguien puede estar viendo tu teléfono, borra esta conversación después (Guardados → eliminar).

Jesús nunca pidió que nadie se quedara en peligro. Cuando estés a salvo, estoy aquí.`;

const OFFSCOPE_REPLY = `That is a fair question, but it is outside what I am here for. I am a reflective guide for life's real struggles — fear, grief, decisions, relationships, faith, shame, rest — and I answer only with words Jesus actually spoke in Matthew, Mark, Luke, and John.

For that request, a general assistant or search will serve you better.

If there is something heavier underneath it — stress, a hard season, a question you have been carrying — bring that here. I will meet you with His words, not mine.`;

const HOSTILE_INTRO = `You do not have to believe anything to be here, and I am not going to argue with you. I am a program that quotes one person — Jesus, from the four Gospels — with every citation checkable against the public-domain World English Bible. Doubt is welcome; some of the people He spoke most gently to were the ones who doubted Him.

If you are willing, here are His own words, not mine:`;

const PASSIVE_FOOTER = `One more thing, gently: if any part of you is thinking about not being here, please also talk to a person tonight — call or text **988** (US & Canada), or find local help at https://www.iasp.info/suicidalthoughts/. You matter more than this moment.`;

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
    // The daily red letter is the product's front door: if the model's pick is
    // not a corpus-verified saying of Jesus, keep the model's framing but show
    // a verified passage instead of an unverifiable one.
    const affOk = aff.verified && aff.quote;
    const wordOk = word.verified && word.quote;
    const out = {
      affirmation: {
        text: data.affirmation?.text || fallback.affirmation.text,
        verse: affOk ? aff.verse : fallback.affirmation.verse,
        quote: affOk ? aff.quote : fallback.affirmation.quote,
        verified: true,
        substituted: !affOk,
      },
      word: {
        theme: data.word?.theme || fallback.word.theme || 'Presence',
        title: data.word?.title || fallback.word.title,
        passage: wordOk ? word.quote : fallback.word.passage,
        verse: wordOk ? word.verse : fallback.word.verse,
        reflection: wordOk ? (data.word?.reflection || fallback.word.reflection) : fallback.word.reflection,
        verified: true,
        substituted: !wordOk,
      },
      verified: true,
      source: affOk && wordOk ? 'model' : 'model+corpus',
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
  });
});

/* ═══ WEB PUSH — morning red letter (installed iOS 16.4+ and Android) ═══ */
const PUSH_STORE = process.env.PUSH_STORE || path.join(__dirname, 'data', 'push-store.json');
let pushStore = { vapid: null, subs: {} };
try {
  pushStore = JSON.parse(fs.readFileSync(PUSH_STORE, 'utf8'));
  pushStore.subs = pushStore.subs || {};
} catch (_) {}
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  pushStore.vapid = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
} else if (!pushStore.vapid) {
  pushStore.vapid = webpush.generateVAPIDKeys();
  savePushStore();
}
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:hello@redletter.app',
  pushStore.vapid.publicKey,
  pushStore.vapid.privateKey
);
function savePushStore() {
  try {
    fs.mkdirSync(path.dirname(PUSH_STORE), { recursive: true });
    fs.writeFileSync(PUSH_STORE, JSON.stringify(pushStore));
  } catch (err) {
    console.error('push store write failed:', err.message);
  }
}
function localHM(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const h = parts.find((p) => p.type === 'hour')?.value || '00';
    const m = parts.find((p) => p.type === 'minute')?.value || '00';
    return (h === '24' ? '00' : h) + ':' + m;
  } catch (_) {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
}
function localDay(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  } catch (_) {
    return todayKey();
  }
}
async function sendMorningPush(sub) {
  const daily = await getDaily();
  const w = daily.word || {};
  const quote = String(w.passage || '').replace(/^["“]|["”]$/g, '');
  const body = quote.length > 140 ? quote.slice(0, 137).replace(/\s+\S*$/, '') + '…' : quote;
  const payload = JSON.stringify({
    title: 'Red Letter · ' + (w.verse || 'today'),
    body: body || 'One red letter is waiting for you today.',
    tag: 'rla-morning',
    url: '/?tab=today&source=push',
  });
  await webpush.sendNotification(sub.subscription, payload, { TTL: 3600 * 6 });
}
async function pushTick() {
  const entries = Object.entries(pushStore.subs);
  let dirty = false;
  for (const [id, sub] of entries) {
    const tz = sub.tz || 'UTC';
    const day = localDay(tz);
    if (sub.lastSent === day) continue;
    if (localHM(tz) !== (sub.time || '07:30')) continue;
    try {
      await sendMorningPush(sub);
      sub.lastSent = day;
      dirty = true;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        delete pushStore.subs[id];
        dirty = true;
      } else {
        console.error('push failed:', err.statusCode || err.message);
      }
    }
  }
  if (dirty) savePushStore();
}
setInterval(() => pushTick().catch(() => {}), 60 * 1000);

app.get('/api/push/key', (_req, res) => {
  res.json({ publicKey: pushStore.vapid.publicKey });
});

app.post('/api/push/subscribe', (req, res) => {
  const { subscription, time, tz } = req.body || {};
  if (!subscription?.endpoint || !subscription?.keys?.p256dh) {
    return res.status(400).json({ error: 'invalid_subscription' });
  }
  if (Object.keys(pushStore.subs).length > 50000) {
    return res.status(503).json({ error: 'capacity' });
  }
  const id = getClientId(req);
  pushStore.subs[id] = {
    subscription,
    time: /^\d{2}:\d{2}$/.test(String(time)) ? time : '07:30',
    tz: typeof tz === 'string' && tz.length < 64 ? tz : 'UTC',
    lastSent: pushStore.subs[id]?.lastSent || null,
    updatedAt: Date.now(),
  };
  savePushStore();
  res.json({ ok: true, time: pushStore.subs[id].time, tz: pushStore.subs[id].tz });
});

app.post('/api/push/unsubscribe', (req, res) => {
  const id = getClientId(req);
  delete pushStore.subs[id];
  savePushStore();
  res.json({ ok: true });
});

app.post('/api/push/test', async (req, res) => {
  const id = getClientId(req);
  const sub = pushStore.subs[id];
  if (!sub) return res.status(404).json({ error: 'not_subscribed' });
  try {
    await sendMorningPush(sub);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: 'push_failed', detail: err.statusCode || err.message });
  }
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
  const raw = req.body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return res.status(400).json({ error: 'messages required.' });
  }
  // Keep only what the model API accepts: role + string content. The client
  // also stores html/crisis on its saved turns; those must never reach the API.
  const messages = raw
    .filter((m) => m && typeof m === 'object' && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 8000) }))
    .slice(-20);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Empty message.' });
  }

  const id = getClientId(req);
  const lastUser = messages[messages.length - 1].content;
  const intent = classifyIntent(lastUser);
  const passive = intent === 'guidance' && detectPassiveIdeation(lastUser);

  // Safety handoffs run before the paywall and never consume a free credit:
  // someone in danger must never meet a 402.
  if (intent === 'crisis' || intent === 'abuse') {
    const reply = intent === 'crisis'
      ? (looksSpanish(lastUser) ? CRISIS_REPLY_ES + '\n\n---\n\n' + CRISIS_REPLY : CRISIS_REPLY)
      : (looksSpanish(lastUser) ? ABUSE_REPLY_ES + '\n\n---\n\n' + ABUSE_REPLY : ABUSE_REPLY);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ text: reply, crisis: true, intent })}\n\n`);
    res.write(
      `data: ${JSON.stringify({ done: true, crisis: true, intent, citations: [], quota: getQuota(id) })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const quota = getQuota(id);
  if (quota.remaining <= 0) {
    return res.status(402).json({
      error: 'daily_limit',
      message:
        'You have used today’s free Advisor conversations. Come back tomorrow, or unlock Plus for unlimited guidance.',
      ...quota,
    });
  }

  // Off-scope requests get a plain, warm redirect with no verse forced onto them.
  // Deterministic in both modes so the product behaves the same with or without a key.
  if (intent === 'offscope') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ text: OFFSCOPE_REPLY, intent })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, intent, citations: [], grounded: 0, unverified: 0, quota: getQuota(id) })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  // Verified-corpus reply: used when no AI is configured, and as the graceful
  // fallback when the model fails before producing any text.
  async function streamCorpusReply(intro) {
    const theme = intent === 'hostile' ? 'Faith & Doubt' : guessTheme(lastUser);
    const pack = offlineEncouragement(theme, lastUser);
    // Hostile: two passages, skipping the first lead (it opens with "Because of your unbelief").
    const picks = intent === 'hostile' ? pack.passages.slice(1, 3) : pack.passages.slice(0, 3);
    const text = [
      intro || pack.opener,
      '',
      ...picks.flatMap((p) => [`**${p.verse}**`, `"${p.quote}"`, p.context, '']),
      intent === 'hostile' ? 'No pressure. They are here if you ever want them.' : pack.closing,
      ...(passive ? ['', PASSIVE_FOOTER] : []),
    ].join('\n');
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }
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
        intent,
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  }

  if (!ai) {
    bumpQuota(id);
    return streamCorpusReply(intent === 'hostile' ? HOSTILE_INTRO : null);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let full = '';
  try {
    bumpQuota(id);
    const stream = ai.messages.stream({
      model: MODEL,
      max_tokens: 1400,
      thinking: { type: 'adaptive' },
      system: ADVISOR_SYSTEM,
      messages,
    });

    stream.on('text', (text) => {
      full += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    const annotated = await annotateAdvisorText(full);
    if (passive && !/\b988\b/.test(annotated.text || full)) {
      annotated.text = (annotated.text || full) + '\n\n' + PASSIVE_FOOTER;
    }
    if (annotated.text && annotated.text !== full) {
      res.write(`data: ${JSON.stringify({ replace: annotated.text })}\n\n`);
    }
    res.write(
      `data: ${JSON.stringify({
        done: true,
        citations: annotated.citations,
        grounded: annotated.grounded,
        unverified: annotated.unverified,
        outOfScope: annotated.outOfScope,
        quota: getQuota(id),
        intent,
      })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.status || '', err.message);
    if (!full.trim()) {
      // Nothing reached the user yet: answer from the verified corpus instead of failing.
      return streamCorpusReply(
        intent === 'hostile'
          ? HOSTILE_INTRO
          : 'The Advisor is briefly unavailable, so here are words Jesus actually spoke that speak into what you shared — from our verified red-letter library.'
      );
    }
    res.write(`data: ${JSON.stringify({ error: 'interrupted', partial: true })}\n\n`);
    res.write(
      `data: ${JSON.stringify({ done: true, citations: [], grounded: 0, unverified: 0, quota: getQuota(id), interrupted: true })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', err.message);
  if (res.headersSent) return res.end();
  res.status(status).json({
    error: status === 400 ? 'bad_request' : status === 413 ? 'too_large' : 'server_error',
    message: status === 400 ? 'Malformed request.' : status === 413 ? 'Request too large.' : 'Something went wrong. Please try again.',
  });
});
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err && err.message ? err.message : err));
process.on('uncaughtException', (err) => console.error('uncaughtException:', err && err.message ? err.message : err));

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

server.on('error', (err) => {
  console.error('listen failed:', err.message);
  process.exit(1);
});

function shutdown(signal) {
  console.log(signal + ' — closing');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 4000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
