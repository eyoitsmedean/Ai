/**
 * Scripture verification helpers.
 * Preference order: local red-letter corpus → bible-api.com (WEB) → unverified flag.
 */
const corpus = require('./red-letters');

const apiCache = new Map();

function normalizeText(s) {
  return String(s || '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function similarity(a, b) {
  const A = normalizeText(a);
  const B = normalizeText(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A)) return 0.92;
  // Token Jaccard
  const ta = new Set(A.split(' ').filter(Boolean));
  const tb = new Set(B.split(' ').filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.max(1, ta.size + tb.size - inter);
}

async function fetchFromApi(ref) {
  const key = ref.toLowerCase().replace(/\s+/g, '');
  if (apiCache.has(key)) return apiCache.get(key);
  try {
    const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=web`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const text = String(data.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const out = { text, reference: data.reference || ref, source: 'bible-api', translation: 'WEB' };
    apiCache.set(key, out);
    return out;
  } catch {
    return null;
  }
}

/**
 * Verify a single citation+quote pair.
 * Returns { verse, quote, verified, source, similarity }
 */
async function verifyPassage({ verse, quote, context }) {
  const local = corpus.findByRef(verse);
  if (local) {
    const sim = quote ? similarity(quote, local.text) : 1;
    return {
      verse: corpus.cite(local),
      quote: local.text,
      context: context || undefined,
      verified: true,
      source: 'corpus',
      similarity: sim,
      translation: 'WEB',
    };
  }

  const api = await fetchFromApi(verse);
  if (api) {
    const sim = quote ? similarity(quote, api.text) : 1;
    // If model quote diverges badly, prefer API text but mark low-sim
    return {
      verse: api.reference,
      quote: api.text,
      context: context || undefined,
      verified: true,
      source: 'bible-api',
      similarity: sim,
      translation: 'WEB',
      modelDiverged: sim < 0.55,
    };
  }

  return {
    verse,
    quote: quote || '',
    context: context || undefined,
    verified: false,
    source: 'unverified',
    similarity: 0,
  };
}

async function verifyPassages(passages) {
  if (!Array.isArray(passages)) return [];
  return Promise.all(passages.map(p => verifyPassage(p)));
}

/** Extract **Book N:N** citations from freeform advisor text and annotate. */
function extractCitations(text) {
  const re = /\*\*([1-3]?\s?[A-Za-z]+\s+\d+:\d+(?:\s*[–-]\s*\d+)?)\*\*/g;
  const found = [];
  let m;
  while ((m = re.exec(text))) found.push(m[1]);
  return [...new Set(found)];
}

/**
 * Lattice / Apologist-style grounding:
 * After each **Citation**, replace the following quoted line with verified corpus
 * (or bible-api) text when available. Unverifiable citations stay flagged.
 */
async function groundAdvisorText(text) {
  const lines = String(text || '').split('\n');
  const citations = [];
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const vm = line.trim().match(/^\*\*((?:Matthew|Mark|Luke|John|[1-3]?\s?[A-Za-z]+)\s+\d+:\d+(?:\s*[–-]\s*\d+)?)\*\*\s*$/i);
    if (!vm) {
      out.push(line);
      continue;
    }

    const citation = vm[1].trim();
    out.push(line);

    // Skip blank lines after citation
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) {
      out.push(lines[j]);
      j++;
    }

    if (j >= lines.length) {
      citations.push({ citation, verified: false, quote: '', verse: citation });
      i = j - 1;
      continue;
    }

    const quoteLine = lines[j];
    const trimmed = quoteLine.trim();
    const isQuote = trimmed.length > 8 && (/^["“]/.test(trimmed) || /^[A-Z]/.test(trimmed));
    const modelQuote = trimmed.replace(/^["“]+/, '').replace(/["”]+$/, '');
    const verified = await verifyPassage({ verse: citation, quote: modelQuote });

    citations.push({
      citation,
      verified: verified.verified,
      quote: verified.quote,
      verse: verified.verse || citation,
      similarity: verified.similarity,
      source: verified.source,
      modelDiverged: !!verified.modelDiverged || (verified.verified && modelQuote && verified.similarity < 0.55),
    });

    if (verified.verified && verified.quote) {
      out.push(`"${verified.quote}"`);
      i = j; // consume original quote line
      continue;
    }

    out.push(quoteLine);
    i = j;
  }

  // Also annotate any bold citations that had no quote block
  const allCites = extractCitations(text);
  for (const c of allCites) {
    if (citations.some((x) => x.citation === c)) continue;
    const v = await verifyPassage({ verse: c, quote: '' });
    citations.push({
      citation: c,
      verified: v.verified,
      quote: v.quote,
      verse: v.verse || c,
      similarity: v.similarity,
      source: v.source,
    });
  }

  return {
    text: out.join('\n'),
    citations,
    grounded: citations.filter((c) => c.verified).length,
    unverified: citations.filter((c) => !c.verified).length,
  };
}

async function annotateAdvisorText(text) {
  return groundAdvisorText(text);
}

/** Build offline daily content from corpus (no LLM). */
function offlineDaily(dateSeed) {
  const list = corpus.passages;
  const day = Math.abs(hash(dateSeed || new Date().toISOString().slice(0, 10)));
  const a = list[day % list.length];
  const b = list[(day + 7) % list.length];
  const affirmations = [
    'You are held in the same care Jesus named for the sparrows — seen, known, and valued.',
    'You do not have to carry tomorrow’s weight today. His words give you this hour.',
    'You are invited to rest under a yoke that is light — not to prove yourself, but to receive Him.',
    'You are not forgotten. The One who spoke peace still speaks it over anxious hearts.',
    'You can return to His words whenever the day grows loud. They remain.',
  ];
  return {
    affirmation: {
      text: affirmations[day % affirmations.length],
      verse: corpus.cite(a),
      quote: a.text,
      verified: true,
    },
    word: {
      theme: a.theme[0],
      title: 'His Words for Today',
      passage: b.text,
      verse: corpus.cite(b),
      reflection: 'Sit with these words without rushing. Let one phrase stay with you through the next thing you must do.',
      verified: true,
    },
    offline: true,
    verified: true,
  };
}

/** Build offline encouragement pack from corpus. */
function offlineEncouragement(theme) {
  const picks = corpus.byTheme(theme);
  const pool = picks.length ? picks : corpus.passages;
  const passages = pool.slice(0, 4).map(p => ({
    verse: corpus.cite(p),
    quote: p.text,
    context: `Jesus speaks directly into ${theme.toLowerCase()}.`,
    verified: true,
    source: 'corpus',
  }));
  return {
    theme,
    headline: `Held in His Words`,
    opening: `Whatever brought you here under “${theme}” — you do not have to carry it alone. Here are words Jesus actually spoke.`,
    passages,
    practice: 'Read one passage aloud once. Then sit in silence for one minute before you move on.',
    closing: 'His words remain. You can return to them whenever you need.',
    offline: true,
    verified: true,
  };
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const CRISIS_PATTERNS = [
  /\bkill\s+myself\b/i,
  /\bsuicid/i,
  /\bend\s+my\s+life\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt\s+myself\b/i,
];

function detectCrisis(text) {
  return CRISIS_PATTERNS.some(re => re.test(String(text || '')));
}

module.exports = {
  corpus,
  verifyPassage,
  verifyPassages,
  annotateAdvisorText,
  groundAdvisorText,
  extractCitations,
  offlineDaily,
  offlineEncouragement,
  detectCrisis,
  similarity,
};
