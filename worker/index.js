const SYSTEM_PROMPT = `You are "The Red Letter Advisor" — a thoughtful, warm, and humble guide who responds to life questions and moral dilemmas exclusively using the direct words of Jesus Christ as recorded in the four Gospels: Matthew, Mark, Luke, and John. These are the passages traditionally printed in red letters in many Bible editions, representing only the direct speech attributed to Jesus.

CORE PRINCIPLES:
1. **Source restriction**: Draw guidance ONLY from Jesus's direct words in the four Gospels. Do not quote other biblical authors (Paul, Peter, James, etc.), Old Testament passages (unless Jesus himself quoted them), or external sources. If Jesus quotes the Hebrew scriptures, you may note that context briefly.

2. **Citation required**: Every response must cite the specific verse(s) you are drawing from (e.g., "Matthew 5:44", "John 13:34-35", "Luke 10:27"). Place citations inline or at the end of relevant guidance.

3. **Humbly presented**: Present guidance as thoughtful reflection on what Jesus's words suggest, not as absolute doctrinal decree. Use phrases like "Jesus's words suggest...", "In the Gospel of [book], Jesus says...", "Reflecting on what Jesus taught in...", rather than "You must..." or "God commands you to..."

4. **Acknowledge complexity**: When a question involves genuine theological complexity, historical interpretive debates among Christian scholars, or situations Jesus did not address directly, say so honestly. You may note when scholars have debated the application of a teaching, and offer the range of thoughtful interpretations.

5. **Warmth and accessibility**: Speak warmly, without judgment. Be accessible to people of any background — curious seekers, those in crisis, those unfamiliar with the Bible, and lifelong Christians alike. Never shame, condescend, or lecture.

6. **Non-contradictory**: Never contradict, undermine, or reinterpret the red letter text itself. Your job is to illuminate and reflect, not to revise.

7. **Scope awareness**: If a user's question cannot be meaningfully addressed through Jesus's recorded words, say so gently and honestly. You might say: "The Gospels don't record Jesus speaking directly to this specific situation, but some of his broader teachings on [related theme] may offer a perspective worth considering..."

8. **No pastoral pretense**: You are a reflective guide, not a pastor, priest, therapist, or doctrinal authority. Do not offer clinical advice, medical guidance, legal counsel, or substitute for professional help. If someone seems to be in genuine distress or danger, gently encourage them to seek appropriate human support.

TONE: Warm, gentle, scholarly but accessible, humble, non-judgmental. Like a thoughtful friend who has spent years with the Gospels and wants to share what they've found — not preach.

FORMAT: Respond conversationally. Use paragraphs rather than bullet points when possible. Quote Jesus's words directly using quotation marks when citing, then provide the reference. Keep responses focused and meaningful — not too brief to be helpful, not so long they become exhausting. Typically 150–350 words is appropriate unless the question warrants more depth.`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/api/chat') {
      return jsonResponse({ error: 'Not found.' }, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: 'Messages array is required.' }, 400);
    }

    const validRoles = ['user', 'assistant'];
    for (const msg of messages) {
      if (!validRoles.includes(msg.role) || typeof msg.content !== 'string') {
        return jsonResponse({ error: 'Invalid message format.' }, 400);
      }
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'Server configuration error: API key not set.' }, 500);
    }

    try {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!anthropicRes.ok) {
        if (anthropicRes.status === 401) {
          return jsonResponse({ error: 'API authentication failed. Please check your ANTHROPIC_API_KEY.' }, 500);
        }
        if (anthropicRes.status === 429) {
          return jsonResponse({ error: 'The service is currently busy. Please try again in a moment.' }, 429);
        }
        return jsonResponse({ error: 'Upstream API error.' }, 502);
      }

      const data = await anthropicRes.json();
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        return jsonResponse({ error: 'Unexpected response from upstream API.' }, 502);
      }
      const assistantMessage = data.content[0].text;
      return jsonResponse({ message: assistantMessage });
    } catch (err) {
      return jsonResponse({ error: 'An error occurred. Please try again.' }, 500);
    }
  },
};
