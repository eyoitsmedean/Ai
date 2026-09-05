/* The letterpress Advisor.
   When no model is available — or the model fails — the harness itself writes a short
   letter from the spoken corpus. Nothing here types Scripture: passages are emitted as
   {{Book Chapter:Verse}} placeholders and filled by lib/scripture so the KJV text is
   always canonical. */
const { THEMES } = require('./curated');
const { guessThemes, retrieveSayings } = require('./retrieve');
const { themesForSaying } = require('./themes');
const { parseAllRefs, lookup } = require('./scripture');

const MAX_RETRIEVED_CHARS = 240;

const GENERIC = {
  opening: 'I am here with what you brought. Before any advice, two sentences he actually spoke.',
  closing: 'You can sit with one line. Nothing else is required of this hour.',
  passages: [
    { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted, not the already-healed.' },
    { verse: 'John 14:27', context: 'Peace is left with you — a gift, not a mood you manufacture.' },
  ],
};

const RETRIEVED_CONTEXT = 'Of everything he is recorded saying, this is the sentence nearest to what you wrote.';

function citationKey(citation) {
  const refs = parseAllRefs(citation || '');
  if (!refs.length) return citation || '';
  const r = refs[0];
  return `${r.book} ${r.chapter}:${r.start}`;
}

function overlaps(a, b) {
  const ra = parseAllRefs(a || '')[0];
  const rb = parseAllRefs(b || '')[0];
  if (!ra || !rb) return false;
  return ra.book === rb.book && ra.chapter === rb.chapter && ra.start <= rb.end && ra.end >= rb.start;
}

function citedBefore(history) {
  const seen = [];
  for (const m of history || []) {
    if (!m || m.role !== 'assistant' || typeof m.content !== 'string') continue;
    for (const ref of parseAllRefs(m.content)) {
      seen.push(`${ref.book} ${ref.chapter}:${ref.start}${ref.end !== ref.start ? `-${ref.end}` : ''}`);
    }
  }
  return seen;
}

function alreadyUsed(citation, used) {
  return used.some((u) => overlaps(u, citation));
}

function composeLetter(text, { history = [], limit = 3 } = {}) {
  const raw = String(text || '').trim();
  const themes = guessThemes(raw);
  const theme = themes[0] || null;
  const pack = theme ? THEMES[theme] : null;
  const used = citedBefore(history);
  const chosen = [];

  const add = (verse, context) => {
    if (chosen.length >= limit) return;
    if (!lookup(verse)) return;
    if (alreadyUsed(verse, used) || chosen.some((c) => overlaps(c.verse, verse))) return;
    chosen.push({ verse, context });
  };

  if (pack) {
    // Two curated sentences for the named need, skipping any already sent in this correspondence.
    for (const p of pack.passages) {
      if (chosen.length >= 2) break;
      add(p.verse, p.context);
    }
    // One sentence retrieved from the whole spoken corpus, only if it also belongs to this need.
    const { sayings } = retrieveSayings(raw, { limit: 8 });
    for (const s of sayings) {
      if (chosen.length >= limit) break;
      if (!s.text || s.text.length > MAX_RETRIEVED_CHARS) continue;
      if (!themesForSaying(s).includes(theme)) continue;
      add(s.citation, RETRIEVED_CONTEXT);
    }
  } else {
    for (const p of GENERIC.passages) add(p.verse, p.context);
  }
  if (!chosen.length) {
    // Every allowed sentence was already used in this correspondence; repeat the gentlest one.
    chosen.push(GENERIC.passages[0]);
  }

  const opening = pack ? pack.opening : GENERIC.opening;
  const closing = pack ? pack.closing : GENERIC.closing;

  const body = chosen.map((c) => `{{${c.verse}}}\n${c.context}`).join('\n\n');
  return {
    theme,
    citations: chosen.map((c) => citationKey(c.verse)),
    text: `${opening}\n\n${body}\n\n${closing}`,
  };
}

module.exports = { composeLetter, citedBefore, GENERIC };
