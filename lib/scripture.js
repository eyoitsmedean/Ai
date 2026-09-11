const fs = require('fs');
const path = require('path');

const CORPUS_PATH = path.join(__dirname, '..', 'data', 'gospels-kjv.json');
const SPOKEN_PATH = path.join(__dirname, '..', 'data', 'spoken-gospels.json');

const BOOK_ALIASES = {
  matthew: 'Matthew',
  matt: 'Matthew',
  mt: 'Matthew',
  mat: 'Matthew',
  mark: 'Mark',
  mk: 'Mark',
  mrk: 'Mark',
  mr: 'Mark',
  luke: 'Luke',
  lk: 'Luke',
  luk: 'Luke',
  john: 'John',
  jn: 'John',
  jhn: 'John',
  joh: 'John',
};

const BOOK_PATTERN = 'Matthew|Matt\\.?|Mt\\.?|Mat\\.?|Mark|Mrk\\.?|Mk\\.?|Mr\\.?|Luke|Luk\\.?|Lk\\.?|John|Jhn\\.?|Jn\\.?|Joh\\.?';
const REF_RE = new RegExp(
  `\\b(${BOOK_PATTERN})\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[–—\\-]\\s*(\\d{1,3}))?`,
  'gi'
);

let _corpus = null;
let _spoken = null;

function loadCorpus() {
  if (_corpus) return _corpus;
  _corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
  return _corpus;
}

function loadSpoken() {
  if (_spoken) return _spoken;
  if (!fs.existsSync(SPOKEN_PATH)) {
    _spoken = { books: {} };
    return _spoken;
  }
  _spoken = JSON.parse(fs.readFileSync(SPOKEN_PATH, 'utf8'));
  return _spoken;
}

function spokenAt(book, chapter, verse) {
  return loadSpoken().books?.[book]?.[String(chapter)]?.[String(verse)] || null;
}

function isRedLetter(ref) {
  const parsed = typeof ref === 'string' ? parseRef(ref) : ref;
  if (!parsed) return false;
  for (let v = parsed.start; v <= parsed.end; v++) {
    if (spokenAt(parsed.book, parsed.chapter, v)) return true;
  }
  return false;
}

function cleanKjv(text) {
  if (!text) return '';
  // Braces mark two things in this corpus: translators' italics ({are}, {it were}) which
  // belong in the text, and marginal notes ({comfortless: or, orphans}, {this verse is not
  // found in most of the Greek copies}) which do not. Notes carry a colon or talk about copies.
  return String(text)
    .replace(/\{[^}]*:[^}]*\}/g, '')
    .replace(/\{[^}]*\b(copies|manuscripts|this verse)\b[^}]*\}/gi, '')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBook(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().replace(/\./g, '').trim();
  return BOOK_ALIASES[key] || null;
}

function parseRef(input) {
  if (!input || typeof input !== 'string') return null;
  REF_RE.lastIndex = 0;
  const m = REF_RE.exec(input.trim());
  if (!m) return null;
  const book = normalizeBook(m[1]);
  if (!book) return null;
  const chapter = Number(m[2]);
  const start = Number(m[3]);
  const end = m[4] ? Number(m[4]) : start;
  if (!chapter || !start || end < start) return null;
  return { book, chapter, start, end, raw: m[0] };
}

function parseAllRefs(input) {
  if (!input) return [];
  const found = [];
  const re = new RegExp(REF_RE.source, 'gi');
  let m;
  while ((m = re.exec(input))) {
    const book = normalizeBook(m[1]);
    if (!book) continue;
    const chapter = Number(m[2]);
    const start = Number(m[3]);
    const end = m[4] ? Number(m[4]) : start;
    if (!chapter || !start || end < start) continue;
    found.push({ book, chapter, start, end, raw: m[0], index: m.index });
  }
  return found;
}

const SPOKEN_OVERRIDES = {
  'Mark 4:39': 'Peace, be still.',
  'Mark 5:36': 'Be not afraid, only believe.',
  'John 6:35': 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.',
  'John 8:12': 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.',
  'John 11:25': 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live:',
  'John 20:29': 'Thomas, because thou hast seen me, thou hast believed: blessed are they that have not seen, and yet have believed.',
};

const SPEECH_INTROS = [
  /^Then spake Jesus again unto them, saying,\s*/i,
  /^And Jesus answered and said unto them,\s*/i,
  /^And Jesus said unto them,\s*/i,
  /^Jesus said unto them,\s*/i,
  /^Jesus said unto her,\s*/i,
  /^Jesus saith unto him,\s*/i,
  /^Jesus saith unto them,\s*/i,
  /^And he saith unto them,\s*/i,
  /^And he said unto them,\s*/i,
  /^As soon as Jesus heard the word that was spoken, he saith unto the ruler of the synagogue,\s*/i,
  /^And he arose, and rebuked the wind, and said unto the sea,\s*/i,
];

const SPEECH_TAILS = [
  /\s+And the wind ceased, and there was a great calm\.?$/i,
];

/* Evangelist attribution that still leaks into some spoken entries.
   Only strips frames that name Jesus / he / the Lord as the speaker.
   Leaves His own narration (the flood, a parable's vineyard lord) intact. */
const NARRATOR_FRAMES = [
  /^(And |Then |But |Now )?(Jesus |he |the Lord )?(answering( them)? )?(answered and )?(cried and )?(said|saith)( therefore)?( unto (them|him|her|his disciples|the disciples|the twelve|those Jews[^.]*?)| to them again| again unto them| to those Jews[^.]*?)?,\s*/i,
  /^(And |Then |But )?(Jesus |he )?(knew their thoughts, and said unto them,\s*)/i,
  /^(Now )?Jesus knew that they were desirous to ask him,?\s*(and said(?: unto them)?,\s*)?/i,
  /^(Then |And |But )?(Jesus |he )?(called them (unto him|to him), and (said|saith)( unto them)?,\s*)/i,
  /^(Then |And )?(Jesus )?(called his disciples unto him, and said,\s*)/i,
  /^(And he sat down, and called the twelve, and saith unto them,\s*)/i,
  /^(And Jesus looked round about, and saith unto his disciples,\s*)/i,
  /^(And he called unto him his disciples, and saith unto them,\s*)/i,
  /^(And he turned him unto his disciples,?\s*(and said(?: unto them)?,\s*)?)/i,
  /^(And he called them unto him, and said unto them in parables,\s*)/i,
  /^(And Jesus answering them began to say,\s*)/i,
  /^(Then saith (he|Jesus) unto (them|his disciples),\s*)/i,
  /^(Then he saith,\s*)/i,
  /^(He answered and said unto them,\s*)/i,
  /^(Then answered Jesus and said unto them,\s*)/i,
  /^(He said therefore,\s*)/i,
  /^(and said privately,\s*)/i,
  /^(Then said (he|Jesus)( unto [^,]{0,40}| to [^,]{0,40}| again unto them| to them again)?,\s*)/i,
];

function stripNarratorFrame(text) {
  let spoken = String(text || '').trim();
  if (!spoken) return '';
  let prev;
  do {
    prev = spoken;
    for (const re of NARRATOR_FRAMES) spoken = spoken.replace(re, '');
    spoken = spoken.replace(/^and said,\s*/i, '');
  } while (spoken !== prev);
  return spoken.trim();
}

function extractSpoken(text, citation) {
  const cleaned = cleanKjv(text);
  if (!cleaned) return '';
  if (citation && SPOKEN_OVERRIDES[citation]) return SPOKEN_OVERRIDES[citation];
  let spoken = cleaned;
  for (const re of SPEECH_INTROS) spoken = spoken.replace(re, '');
  const saying = spoken.match(/,\s+saying,\s+(.+)$/i);
  if (saying && saying[1].length > 12) spoken = saying[1];
  for (const re of SPEECH_TAILS) spoken = spoken.replace(re, '');
  return stripNarratorFrame(spoken);
}

function lookup(ref) {
  const parsed = typeof ref === 'string' ? parseRef(ref) : ref;
  if (!parsed) return null;
  const corpus = loadCorpus();
  const book = corpus.books[parsed.book];
  if (!book) return null;
  const chapter = book[String(parsed.chapter)];
  if (!chapter) return null;
  const verses = [];
  for (let v = parsed.start; v <= parsed.end; v++) {
    const full = cleanKjv(chapter[String(v)]);
    if (!full) return null;
    const cite = `${parsed.book} ${parsed.chapter}:${v}`;
    const mapped = spokenAt(parsed.book, parsed.chapter, v);
    const text = mapped || extractSpoken(full, cite);
    verses.push({ verse: v, full, text, redLetter: Boolean(mapped) });
  }
  const spokenVerses = verses.filter((v) => v.redLetter || v.text);
  const redOnly = verses.filter((v) => v.redLetter);
  const use = redOnly.length ? redOnly : spokenVerses;
  if (!use.length) return null;
  const start = use[0].verse;
  const end = use[use.length - 1].verse;
  return {
    book: parsed.book,
    chapter: parsed.chapter,
    start,
    end,
    citation: start === end
      ? `${parsed.book} ${parsed.chapter}:${start}`
      : `${parsed.book} ${parsed.chapter}:${start}–${end}`,
    text: use.map((v) => v.text).join(' '),
    full: verses.map((v) => v.full).join(' '),
    redLetter: redOnly.length > 0,
    verses,
  };
}

function normalizeForCompare(text) {
  return cleanKjv(text)
    .toLowerCase()
    .replace(/[“”"‘’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a, b) {
  const left = normalizeForCompare(a);
  const right = normalizeForCompare(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const aw = left.split(' ');
  const bw = right.split(' ');
  // A verbatim fragment counts as a match only when it carries most of the verse
  // (or is a substantial clause on its own). A five-word clipping that can invert
  // the sense of a saying must fall through to word overlap and score low.
  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(aw.length, bw.length);
    const longer = Math.max(aw.length, bw.length);
    if (shorter >= 12 || shorter / longer >= 0.6) return 0.92;
  }
  const setB = new Set(bw);
  let overlap = 0;
  for (const w of aw) if (setB.has(w)) overlap++;
  return (2 * overlap) / (aw.length + bw.length);
}

function formatCitation(parsed) {
  if (parsed.start === parsed.end) return `${parsed.book} ${parsed.chapter}:${parsed.start}`;
  return `${parsed.book} ${parsed.chapter}:${parsed.start}–${parsed.end}`;
}

function verifyQuote(citation, quote) {
  const parsed = parseRef(citation);
  if (parsed && loadSpoken().books[parsed.book] && !isRedLetter(parsed)) {
    return { ok: false, reason: 'not-red-letter', citation: citation || '', quote: quote || '' };
  }
  const canonical = lookup(citation);
  if (!canonical) {
    return { ok: false, reason: 'unknown-ref', citation: citation || '', quote: quote || '' };
  }
  const againstSpoken = quote ? similarity(quote, canonical.text) : 0;
  const againstFull = quote ? similarity(quote, canonical.full) : 0;
  const score = Math.max(againstSpoken, againstFull);
  return {
    ok: true,
    citation: canonical.citation,
    quote: canonical.text,
    score,
    substituted: !quote || similarity(quote, canonical.text) < 0.98,
  };
}

function verifyJsonQuotes(data) {
  if (!data || typeof data !== 'object') return data;
  const next = JSON.parse(JSON.stringify(data));
  let verified = true;
  if (next.affirmation) {
    const v = verifyQuote(next.affirmation.verse, next.affirmation.quote);
    if (v.ok) {
      next.affirmation.verse = v.citation;
      next.affirmation.quote = v.quote;
    } else {
      verified = false;
    }
  }
  if (next.word) {
    const v = verifyQuote(next.word.verse, next.word.passage);
    if (v.ok) {
      next.word.verse = v.citation;
      next.word.passage = v.quote;
    } else {
      verified = false;
    }
  }
  if (Array.isArray(next.passages)) {
    const kept = [];
    for (const p of next.passages) {
      const v = verifyQuote(p.verse, p.quote);
      if (!v.ok) {
        verified = false;
        continue;
      }
      kept.push({ ...p, verse: v.citation, quote: v.quote });
    }
    next.passages = kept;
  }
  next.translation = 'KJV';
  next.verified = verified;
  return next;
}

function extractQuotedLine(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^\*\*/.test(trimmed)) return { quote: '', index: i };
    const unquoted = trimmed.replace(/^[“”"']+/, '').replace(/[“”"']+[.,;:]?$/, '');
    if (unquoted.length > 8) return { quote: unquoted, index: i };
    return { quote: '', index: i };
  }
  return { quote: '', index: startIndex };
}

const PLACEHOLDER_RE = /\{\{(?:QUOTE:)?\s*([^{}]+?)\s*\}\}/gi;

/* The seal admits only His own speech. Every Gospel verse resolves in the corpus, but only
   the spoken map's entries are red letters; an angel's line or the evangelist's narration
   is dropped here rather than printed under "He said this". */
function fillPlaceholders(text) {
  if (!text) return text;
  const lines = String(text).split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const whole = line.trim().match(/^\{\{(?:QUOTE:)?\s*([^{}]+?)\s*\}\}$/i);
    if (whole) {
      const hit = lookup(whole[1].replace(/^["'“”]+|["'“”]+$/g, ''));
      if (hit && hit.redLetter) {
        out.push(`**${hit.citation}**`, `“${hit.text}”`);
      } else {
        // Not His speech (or not found): drop the block and the one-line gloss written for it.
        const next = (lines[i + 1] || '').trim();
        if (next && !/^\{\{/.test(next) && !/^\*\*/.test(next)) i++;
      }
      continue;
    }
    out.push(line.replace(PLACEHOLDER_RE, (_, raw) => {
      const hit = lookup(String(raw).replace(/^["'“”]+|["'“”]+$/g, ''));
      return hit && hit.redLetter ? `**${hit.citation}**\n“${hit.text}”` : '';
    }));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function verifyAndSubstitute(text) {
  return verifyAdvisorText(fillPlaceholders(text));
}

function verifyAdvisorText(text) {
  if (!text) return text;
  const lines = String(text).split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const bold = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
    const probe = bold ? bold[1] : trimmed;
    const parsed = parseRef(probe);
    const looksLikeCite = parsed && (bold || /^(Matthew|Mark|Luke|John)\b/i.test(probe));
    if (looksLikeCite) {
      const { quote, index } = extractQuotedLine(lines, i + 1);
      const canonical = lookup(parsed);
      if (canonical && !canonical.redLetter) {
        // A Gospel verse that is not His speech: remove the citation, its quote, and its gloss.
        let j = quote ? index + 1 : i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length) {
          const ctx = lines[j].trim();
          if (ctx && !/^\*\*/.test(ctx) && !parseRef(ctx) && !/^[“”"]/.test(ctx)) j++;
        }
        i = quote ? j : i + 1;
        continue;
      }
      if (canonical) {
        out.push(`**${canonical.citation}**`);
        out.push(`“${canonical.text}”`);
        let j = quote ? index + 1 : i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length) {
          const ctx = lines[j].trim();
          if (ctx && !/^\*\*/.test(ctx) && !parseRef(ctx) && !/^[“”"]/.test(ctx)) {
            out.push(ctx);
            j++;
          }
        }
        i = quote ? j : i + 1;
        continue;
      }
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function parseModelJson(text) {
  if (!text || typeof text !== 'string') throw new Error('Empty model output');
  let stripped = text.trim();
  stripped = stripped.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object in model output');
  return JSON.parse(stripped.slice(start, end + 1));
}

function looksLikeCrisis(text) {
  if (!text) return false;
  return /\b(suicid\w*|kill myself|killing myself|end (my|it|their|his|her|your|our) (life|lives)|end it all|ending it all|ending my life|end things|end everything|ending things|going to end (it|things|everything)|take my life|took .{0,30}pills|swallowed .{0,30}pills|want(s|ed)? to die|wanna die|wish(ed)? (i|that i|he|she|they) (was|were|could be) dead|wish i (were|was)n[’']?t (here|alive|born)|wish i could (die|disappear|not exist)|self[-\s]?harm|hurt(ing)? myself|cut(ting)? myself|hang myself|overdos\w*|don[’']?t want to live|do not want to live|don[’']?t want to be (alive|here|around)|not want to be alive|better off dead|no reason to live|not worth living|life isn[’']?t worth|slit my|jump off|a plan and .{0,40}(notes?|letters?|goodbyes?)|suicide notes?|goodbye letters?|kill(ed|ing)? (him|her|them)sel(f|ves))\b/i.test(String(text));
}

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

module.exports = {
  BOOK_ALIASES,
  cleanKjv,
  CRISIS_NOTICE,
  extractSpoken,
  stripNarratorFrame,
  fillPlaceholders,
  isRedLetter,
  loadCorpus,
  loadSpoken,
  looksLikeCrisis,
  lookup,
  normalizeBook,
  parseAllRefs,
  parseModelJson,
  parseRef,
  similarity,
  spokenAt,
  verifyAdvisorText,
  verifyAndSubstitute,
  verifyJsonQuotes,
  verifyQuote,
  formatCitation,
};
