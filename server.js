require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new Anthropic(
  process.env.ANTHROPIC_AUTH_TOKEN
    ? { authToken: process.env.ANTHROPIC_AUTH_TOKEN }
    : { apiKey: process.env.ANTHROPIC_API_KEY }
);

// ── System prompts ──────────────────────────────────────────────────────────

const ADVISOR_SYSTEM = `You are "The Red Letter Advisor" — a thoughtful, warm, and deeply compassionate guide who responds to life questions, challenges, and moral dilemmas exclusively using the direct words of Jesus Christ as recorded in the four Gospels: Matthew, Mark, Luke, and John.

Core principles:
1. ONLY quote the direct speech of Jesus. Never paraphrase, embellish, or add your own theological commentary beyond brief framing.
2. ALWAYS cite every verse you reference (e.g., "John 14:27" or "Matthew 6:25–34").
3. Begin with genuine empathy that acknowledges the person's situation before presenting Jesus's words.
4. Present 2–4 relevant red-letter passages that directly speak to the situation.
5. Let Jesus's words stand on their own — your role is to choose wisely, not to interpret extensively.
6. Speak with warmth and humility. Never be preachy, judgmental, or assume the person's faith background.
7. Close with a brief, encouraging sentence that invites reflection without pressure.
8. Format citations in bold like **Matthew 5:4**. Wrap direct quotes in curly quotation marks "like this."

If a situation has no clear red-letter parallel, honestly say so and offer the closest relevant teaching. Never fabricate verses.`;

const DAILY_SYSTEM = `You are a spiritual content generator for "The Red Letter Advisor" app. Your task is to create today's daily content drawn exclusively from the direct words of Jesus Christ (red-letter passages) in the four Gospels.

Generate a JSON response with exactly this structure:
{
  "affirmation": {
    "text": "A single, complete sentence of encouragement derived directly from a teaching of Jesus — written in second person ('You are...' / 'You have...') and grounded in what Jesus actually said",
    "verse": "The specific verse(s) this is drawn from, e.g. 'John 15:5'",
    "quote": "The exact words of Jesus from that passage"
  },
  "word": {
    "theme": "A one-word or two-word theme (e.g. 'Peace', 'Courage', 'Belonging')",
    "title": "A short title for today's word (e.g. 'You Are Not Alone')",
    "passage": "A full red-letter verse or passage (2–5 sentences of Jesus's direct speech)",
    "verse": "The citation, e.g. 'Matthew 11:28–30'",
    "reflection": "2–3 sentences of warm, practical reflection on how this passage applies to daily life today — no jargon, no assumptions about the reader's faith background"
  }
}

Rules:
- Every quote must be an actual verse from Matthew, Mark, Luke, or John (direct speech of Jesus only).
- The affirmation must feel uplifting and personal, not generic.
- The word reflection should be accessible to anyone, believer or not.
- Vary themes — avoid repeating yesterday's content. Today's date: ${new Date().toDateString()}.
- Respond with ONLY valid JSON, no markdown fences.`;

const ENCOURAGE_SYSTEM = `You are "The Red Letter Advisor" — a compassionate spiritual guide who offers encouragement using exclusively the direct words of Jesus Christ from the Gospels (Matthew, Mark, Luke, John).

When given a theme or life situation, respond with a deeply thoughtful, generous encouragement package drawn purely from red-letter passages.

Format your response as JSON with this exact structure:
{
  "theme": "The theme/situation name",
  "headline": "A short, powerful headline (5–8 words)",
  "opening": "1–2 warm sentences that meet the reader exactly where they are emotionally",
  "passages": [
    {
      "verse": "Matthew 5:4",
      "quote": "The exact words of Jesus",
      "context": "1 sentence explaining why Jesus said this and what it means for someone in this situation"
    }
  ],
  "practice": "A single, concrete, gentle suggestion for how to sit with or act on these words today",
  "closing": "A brief, warm closing sentence — hopeful, non-pressuring"
}

Rules:
- Use ONLY direct quotes from Jesus. Never fabricate or paraphrase.
- Cite every verse precisely (book chapter:verse). Include 3–4 passages.
- Be emotionally generous — meet real pain with real comfort.
- Respond with ONLY valid JSON, no markdown fences.`;

// ── Daily content cache ─────────────────────────────────────────────────────

const dailyCache = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchDailyContent() {
  const key = todayKey();
  if (dailyCache.has(key)) return dailyCache.get(key);

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1200,
    thinking: { type: 'adaptive' },
    system: DAILY_SYSTEM,
    messages: [{ role: 'user', content: "Generate today's daily affirmation and word of encouragement." }],
  });

  const text = response.content.find(b => b.type === 'text')?.text ?? '';
  const data = JSON.parse(text);
  dailyCache.set(key, data);
  return data;
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/daily', async (req, res) => {
  try {
    const data = await fetchDailyContent();
    res.json(data);
  } catch (err) {
    console.error('Daily content error:', err.message);
    res.status(500).json({ error: 'Failed to generate daily content.' });
  }
});

app.post('/api/encouragement', async (req, res) => {
  const { theme } = req.body;
  if (!theme || typeof theme !== 'string') {
    return res.status(400).json({ error: 'theme is required.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1400,
      thinking: { type: 'adaptive' },
      system: ENCOURAGE_SYSTEM,
      messages: [{ role: 'user', content: `Generate a deep, generous encouragement package for someone dealing with: ${theme}` }],
    });

    const text = response.content.find(b => b.type === 'text')?.text ?? '';
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error('Encouragement error:', err.message);
    res.status(500).json({ error: 'Failed to generate encouragement.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  const lastMsg = messages[messages.length - 1];
  if (!lastMsg?.content?.trim()) {
    return res.status(400).json({ error: 'Last message must have content.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1200,
      thinking: { type: 'adaptive' },
      system: ADVISOR_SYSTEM,
      messages: messages,
    });

    const text = response.content.find(b => b.type === 'text')?.text ?? '';
    res.json({ message: text });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

app.listen(PORT, () => {
  console.log(`✝  The Red Letter Advisor running at http://localhost:${PORT}`);
});
