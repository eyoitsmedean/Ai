/* The letterpress Advisor.
   When no model is available — or the model fails — the harness itself writes a short
   letter. Nothing here types Scripture: passages are emitted as {{Book Chapter:Verse}}
   placeholders and filled by lib/scripture so the KJV text is always canonical. */
const { THEMES } = require('./curated');
const { guessThemes } = require('./retrieve');
const { parseAllRefs, lookup } = require('./scripture');

const LETTER_LENGTH = 2;

const GENERIC = {
  opening: 'I am here with what you brought. Before any advice, sentences he actually spoke.',
  closing: 'You can sit with one line. Nothing else is required of this hour.',
};

// Read when the writer has stayed on one need past the sentences kept for it.
const CONTINUING = {
  opening: 'You have stayed with this. Here is more of what he said, still for what you named.',
};

// Read when every sentence kept for this correspondence has already been sent.
const EXHAUSTED = {
  opening: 'I have given you every sentence I hold for this. One of them is worth hearing twice.',
  closing: 'A line can be read again. You do not have to find a new one.',
};

// Sayings any room may fall back to once its own are spent.
const COMMONS = [
  { verse: 'Matthew 11:28', context: 'The invitation is to the exhausted, not the already-healed.' },
  { verse: 'John 14:27', context: 'Peace is left with you — a gift, not a mood you manufacture.' },
  { verse: 'Matthew 28:20', context: 'The last word of his charge is company, to the end.' },
  { verse: 'John 6:37', context: 'Coming is enough. Being cast out is not on the table.' },
  { verse: 'John 10:27-28', context: 'You are known by name, and held by a hand that does not open.' },
  { verse: 'Mark 4:39', context: 'The storm is addressed by name. Calm is spoken, not negotiated.' },
];

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

function packSayings(theme) {
  const pack = THEMES[theme];
  if (!pack) return [];
  return [...pack.passages, ...(pack.more || [])];
}

function composeLetter(text, { history = [] } = {}) {
  const raw = String(text || '').trim();
  const themes = guessThemes(raw);
  const primary = themes[0] || null;
  const used = citedBefore(history);
  const chosen = [];

  const add = (candidate) => {
    if (chosen.length >= LETTER_LENGTH) return;
    const hit = lookup(candidate.verse);
    if (!hit) return;
    if (used.some((u) => overlaps(u, candidate.verse))) return;
    if (chosen.some((c) => overlaps(c.verse, candidate.verse))) return;
    chosen.push({ verse: hit.citation, context: candidate.context });
  };

  for (const theme of themes) {
    for (const p of packSayings(theme)) add(p);
    if (chosen.length >= LETTER_LENGTH) break;
  }
  for (const p of COMMONS) add(p);

  // A room's opening names its first sentences, so it is read only the first time in that room.
  const firstTimeHere = primary && !packSayings(primary).some((p) => used.some((u) => overlaps(u, p.verse)));

  let opening;
  let closing;
  if (!chosen.length) {
    chosen.push({ verse: 'Matthew 11:28', context: COMMONS[0].context });
    opening = EXHAUSTED.opening;
    closing = EXHAUSTED.closing;
  } else if (firstTimeHere) {
    opening = THEMES[primary].opening;
    closing = THEMES[primary].closing;
  } else if (primary) {
    opening = CONTINUING.opening;
    closing = THEMES[primary].closing;
  } else {
    opening = GENERIC.opening;
    closing = GENERIC.closing;
  }

  const body = chosen.map((c) => `{{${c.verse}}}\n${c.context}`).join('\n\n');
  return {
    theme: primary,
    citations: chosen.map((c) => c.verse),
    text: `${opening}\n\n${body}\n\n${closing}`,
  };
}

module.exports = { composeLetter, citedBefore };
