/**
 * Citation verification — the Advisor's truth layer.
 *
 * Preference order for any citation the model (or a person) supplies:
 *   1. outside Matthew/Mark/Luke/John        → verified:false, outOfScope:true
 *   2. in the curated red-letter corpus        → verified:true, exact WEB text, source 'corpus'
 *   3. in the Gospels but not in the corpus    → verified:false, speakerUnverified:true,
 *                                                exact WEB text from bible-api (it cannot
 *                                                tell narration from Jesus's speech)
 *   4. nowhere                                 → verified:false, source 'unverified'
 *
 * groundAdvisorText() applies this to freeform model output: after each
 * **Book c:v** header it swaps the model's quote for the exact text and, if the
 * corpus entry covers a different range, corrects the header to match.
 */
const corpus = require('../../data/red-letters');
const { similarity } = require('./normalize');

const apiCache = new Map();

async function fetchFromApi(rawRef) {
  // bible-api rejects typographic dashes in ranges ("6:25–27"); normalize to ASCII.
  const ref = String(rawRef || '').replace(/[–—]/g, '-').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
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

const GOSPEL_RE = /^(?:matthew|matt|mat|mt|mark|mk|mr|luke|lk|lu|john|jn|joh)\.?\s+\d+:\d+/i;

/** True only for citations inside Matthew, Mark, Luke, or John. */
function isGospelRef(ref) {
  return GOSPEL_RE.test(String(ref || '').trim());
}

async function verifyPassage({ verse, quote, context }) {
  // Scope guard: the product promise is Jesus's own words. A citation outside the
  // four Gospels can never be "verified" here, even if bible-api has the text.
  if (!isGospelRef(verse)) {
    return {
      verse: verse || '',
      quote: quote || '',
      context: context || undefined,
      verified: false,
      outOfScope: true,
      source: 'out-of-scope',
      similarity: 0,
    };
  }

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
    // The text is exact WEB and inside the Gospels, but bible-api cannot tell
    // us who is speaking (Matthew 1:1 is narration). Only the curated corpus
    // can vouch for red letters, so this is honest-but-not-verified.
    return {
      verse: api.reference,
      quote: api.text,
      context: context || undefined,
      verified: false,
      speakerUnverified: true,
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
    const headerIndex = out.length;
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
      outOfScope: !!verified.outOfScope,
      speakerUnverified: !!verified.speakerUnverified,
      modelDiverged: !!verified.modelDiverged || (verified.verified && modelQuote && verified.similarity < 0.55),
    });

    if ((verified.verified || verified.speakerUnverified) && verified.quote) {
      // The text shown must be labelled with the range it actually covers.
      if (verified.verse && verified.verse !== citation) out[headerIndex] = `**${verified.verse}**`;
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
      outOfScope: !!v.outOfScope,
      speakerUnverified: !!v.speakerUnverified,
    });
  }

  return {
    text: out.join('\n'),
    citations,
    grounded: citations.filter((c) => c.verified).length,
    unverified: citations.filter((c) => !c.verified).length,
    outOfScope: citations.filter((c) => c.outOfScope).length,
  };
}

async function annotateAdvisorText(text) {
  return groundAdvisorText(text);
}

module.exports = {
  corpus,
  isGospelRef,
  verifyPassage,
  verifyPassages,
  extractCitations,
  groundAdvisorText,
  annotateAdvisorText,
};
