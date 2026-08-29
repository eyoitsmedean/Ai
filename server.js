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

/* ── Curated fallbacks (KJV public domain) ─────────────────────────────── */
const CURATED_DAILY = [
  {
    affirmation: {
      text: 'You are seen and valued — even the smallest detail of your life is held with care.',
      quote: 'Are not five sparrows sold for two farthings, and not one of them is forgotten before God? But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.',
      verse: 'Luke 12:6–7',
    },
    word: {
      theme: 'Worth',
      title: 'You Are of Great Value',
      passage: 'Are not five sparrows sold for two farthings, and not one of them is forgotten before God? But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.',
      verse: 'Luke 12:6–7',
      reflection: 'When life makes you feel small, Jesus points to sparrows — and then to you. Your worth is not earned by output. It is spoken over you.',
    },
  },
  {
    affirmation: {
      text: 'You can bring your worries to him — you do not have to carry tomorrow alone.',
      quote: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.',
      verse: 'Matthew 6:34',
    },
    word: {
      theme: 'Peace',
      title: 'Enough for Today',
      passage: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.',
      verse: 'Matthew 6:34',
      reflection: 'Jesus does not shame your anxiety — he narrows your focus. One day. One step. Grace enough for what is in front of you.',
    },
  },
  {
    affirmation: {
      text: 'You are invited to rest — not as a reward for finishing, but as a gift for the weary.',
      quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.',
      verse: 'Matthew 11:28–29',
    },
    word: {
      theme: 'Rest',
      title: 'Rest for Your Soul',
      passage: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls. For my yoke is easy, and my burden is light.',
      verse: 'Matthew 11:28–30',
      reflection: 'Rest is not laziness in the kingdom Jesus describes. It is coming close enough to exchange crushing weight for a lighter yoke.',
    },
  },
  {
    affirmation: {
      text: 'You are not abandoned in the dark — light is promised to those who follow him.',
      quote: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.',
      verse: 'John 8:12',
    },
    word: {
      theme: 'Light',
      title: 'Light for the Path',
      passage: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.',
      verse: 'John 8:12',
      reflection: 'Dark seasons are real. Jesus does not deny them — he claims to be light within them. Following is how the path becomes visible, one step at a time.',
    },
  },
  {
    affirmation: {
      text: 'Your heart can be made new — love is the center of everything he asks.',
      quote: 'Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. This is the first and great commandment. And the second is like unto it, Thou shalt love thy neighbour as thyself.',
      verse: 'Matthew 22:37–39',
    },
    word: {
      theme: 'Love',
      title: 'The Greatest Command',
      passage: 'Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. This is the first and great commandment. And the second is like unto it, Thou shalt love thy neighbour as thyself. On these two commandments hang all the law and the prophets.',
      verse: 'Matthew 22:37–40',
      reflection: 'When life feels complicated, Jesus simplifies: love God, love people. Everything else hangs on that.',
    },
  },
  {
    affirmation: {
      text: 'You can ask boldly — he invites seeking hearts, not perfect ones.',
      quote: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.',
      verse: 'Matthew 7:7',
    },
    word: {
      theme: 'Seeking',
      title: 'Ask, Seek, Knock',
      passage: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.',
      verse: 'Matthew 7:7–8',
      reflection: 'Jesus frames prayer as persistence, not performance. Keep asking. Keep seeking. Keep knocking.',
    },
  },
  {
    affirmation: {
      text: 'You are called to freedom in forgiveness — seventy times seven if needed.',
      quote: 'I say not unto thee, Until seven times: but, Until seventy times seven.',
      verse: 'Matthew 18:22',
    },
    word: {
      theme: 'Forgiveness',
      title: 'Seventy Times Seven',
      passage: 'Then came Peter to him, and said, Lord, how oft shall my brother sin against me, and I forgive him? till seven times? Jesus saith unto him, I say not unto thee, Until seven times: but, Until seventy times seven.',
      verse: 'Matthew 18:21–22',
      reflection: 'Forgiveness is not a single heroic act. Jesus frames it as a way of life — repeated mercy that keeps the heart from calcifying.',
    },
  },
];

const CURATED_ENC = {
  'Anxiety & Worry': {
    headline: 'Do Not Be Anxious',
    opening: 'Worry can feel like a room with no windows. Jesus speaks directly into that room — not with shame, but with a Father who knows what you need.',
    passages: [
      { verse: 'Matthew 6:25–26', quote: 'Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment? Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?', context: 'Jesus redirects anxious eyes from scarcity to the care already written into creation.' },
      { verse: 'Matthew 6:33–34', quote: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you. Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.', context: 'Priority becomes the antidote: seek first, then let tomorrow stay tomorrow.' },
      { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', context: 'His peace is a gift, not a mood you manufacture.' },
    ],
    practice: 'Name one worry out loud. Then read Matthew 6:26 slowly twice. Ask: what would it look like to trust I am cared for in this one thing today?',
    closing: 'You are not alone in the spiral. His words meet you there.',
  },
  'Grief & Loss': {
    headline: 'Blessed Are They That Mourn',
    opening: 'Grief is not a failure of faith. Jesus blesses those who mourn — and he weeps with the hurting.',
    passages: [
      { verse: 'Matthew 5:4', quote: 'Blessed are they that mourn: for they shall be comforted.', context: 'Comfort is promised to mourners, not to those who hide their tears.' },
      { verse: 'John 11:25–26', quote: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live: And whosoever liveth and believeth in me shall never die.', context: 'Jesus meets grief with resurrection hope without erasing the pain of the present.' },
      { verse: 'John 14:1–3', quote: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.", context: 'He speaks preparation and place when hearts are troubled by loss.' },
    ],
    practice: 'Sit in quiet for three minutes. Speak the name of what you have lost. Then read Matthew 5:4 aloud as a blessing over your mourning.',
    closing: 'Your tears are seen. Comfort is not a dismissal of pain — it is company within it.',
  },
  Forgiveness: {
    headline: 'As We Forgive',
    opening: 'Forgiveness is one of the hardest teachings Jesus gave — and one of the freest.',
    passages: [
      { verse: 'Matthew 6:14–15', quote: 'For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.', context: 'Forgiveness received and forgiveness given are linked in Jesus’ teaching.' },
      { verse: 'Matthew 18:21–22', quote: 'I say not unto thee, Until seven times: but, Until seventy times seven.', context: 'Mercy is meant to be practiced repeatedly, not rationed.' },
      { verse: 'Luke 23:34', quote: 'Father, forgive them; for they know not what they do.', context: 'Even from the cross, Jesus models forgiveness toward those who wound.' },
    ],
    practice: 'Write one name you struggle to forgive. Pray Luke 23:34 over that name — not forcing feelings, but opening a door.',
    closing: 'Forgiveness is often a road, not a moment. Take the next honest step.',
  },
  Loneliness: {
    headline: 'I Am With You',
    opening: 'Loneliness can convince you that you are unseen. Jesus speaks of presence and friendship.',
    passages: [
      { verse: 'Matthew 28:20', quote: 'Lo, I am with you always, even unto the end of the world.', context: 'His final Gospel promise is presence that does not expire.' },
      { verse: 'John 14:18', quote: 'I will not leave you comfortless: I will come to you.', context: 'Orphaned feelings meet a promise of coming near.' },
      { verse: 'John 15:15', quote: 'Henceforth I call you not servants; for the servant knoweth not what his lord doeth: but I have called you friends.', context: 'Jesus names his followers friends — belonging at the center of discipleship.' },
    ],
    practice: 'Sit with John 14:18 for five minutes. Whisper: “You will not leave me comfortless.”',
    closing: 'You are not an interruption to God. You are someone Jesus calls friend.',
  },
  Fear: {
    headline: 'Be Not Afraid',
    opening: 'Fear shrinks the future. Jesus keeps saying “fear not” — not because danger is fake, but because you are held.',
    passages: [
      { verse: 'Matthew 14:27', quote: 'Be of good cheer; it is I; be not afraid.', context: 'In the storm, his presence is the first word against fear.' },
      { verse: 'Luke 12:32', quote: "Fear not, little flock; for it is your Father's good pleasure to give you the kingdom.", context: 'Tenderness and inheritance replace terror.' },
      { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', context: 'Peace is left with you — a possession, not a performance.' },
    ],
    practice: 'When fear spikes, place a hand on your chest and slowly say Matthew 14:27.',
    closing: 'Courage is not the absence of fear. It is hearing “it is I” in the middle of it.',
  },

  Peace: {
    headline: 'My Peace I Give You',
    opening: 'The world offers fragile calm. Jesus offers a peace that holds even when trouble stays.',
    passages: [
      { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', context: 'His peace is left with you — a gift, not a mood you manufacture.' },
      { verse: 'John 16:33', quote: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', context: 'Peace in him can coexist with tribulation in the world.' },
      { verse: 'Matthew 11:28–29', quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.', context: 'Rest for the soul is the shape peace often takes in his invitation.' },
    ],
    practice: 'Sit quietly for one minute. Breathe in: “Peace I leave with you.” Breathe out: “Let not your heart be troubled.”',
    closing: 'His peace is not the absence of storms — it is his presence within them.',
  },

  Hope: {
    headline: 'Take Heart',
    opening: 'Hope is not naive optimism. In Jesus’ words, hope is anchored in who he is.',
    passages: [
      { verse: 'John 16:33', quote: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', context: 'He names tribulation honestly — then plants cheer in his victory.' },
      { verse: 'Matthew 5:14–16', quote: 'Ye are the light of the world. A city that is set on an hill cannot be hid. Let your light so shine before men.', context: 'Hope becomes visible when light is lived, not only felt.' },
      { verse: 'John 11:25', quote: 'I am the resurrection, and the life.', context: 'The center of Christian hope is a person, not a vague wish.' },
    ],
    practice: 'Write one hard thing. Under it, write John 16:33. Ask for peace in him.',
    closing: 'Good cheer is possible because he has overcome — not because you have to.',
  },
};

const ENC_ALIASES = {
  'Conflict & Relationships': 'Forgiveness',
  'Purpose & Direction': 'Hope',
  'Faith & Doubt': 'Hope',
  'Suffering & Pain': 'Grief & Loss',
  'Shame & Guilt': 'Forgiveness',
  Peace: 'Peace',
  'Anxiety & Worry': 'Anxiety & Worry',
  'Grief & Loss': 'Grief & Loss',
};

function dayIndex() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start;
  return Math.floor(diff / 86400000) % CURATED_DAILY.length;
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
    let fallback =
      'I hear you. Without a live connection I can still point you to Jesus’ words:\n\n' +
      '**Matthew 11:28**\n' +
      '"Come unto me, all ye that labour and are heavy laden, and I will give you rest."\n' +
      'Bring what is heavy — you are invited, not required to fix yourself first.\n\n' +
      '**John 14:27**\n' +
      '"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid."\n' +
      'His peace is offered as a gift in troubled moments.\n\n' +
      'Add an API key on the server to unlock full live guidance.';
    if (crisis) {
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
