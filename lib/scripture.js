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
  return String(text)
    .replace(/\{[^}]*:[^}]*\}/g, '')
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

/* Reviewed spoken text for verses the frame rules below cannot decide (data/spoken-overrides.json).
   "" means the red-letter map marks the verse but the words are not His. */
const OVERRIDES_PATH = path.join(__dirname, '..', 'data', 'spoken-overrides.json');
let _overrides = null;
function loadOverrides() {
  if (_overrides) return _overrides;
  _overrides = fs.existsSync(OVERRIDES_PATH)
    ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')).verses || {}
    : {};
  return _overrides;
}

/* The KJV has no quotation marks. The evangelist's frame — "And Jesus answering said unto them," — must be
   cut before the words are printed in red. Three rules, in order:
   R1  the frame names the speaker (Jesus, or the evangelist's capitalised "the Lord"), verb before or after;
   R2  a pronoun or subjectless frame ("He answered and said unto them,"), only at the start of a speech block
       — i.e. when the previous verse is not red. Inside a parable Jesus narrates other speakers, and those
       frames are His words, so they are kept;
   R3  a narrator ", saying," frame, with the same block guard, or with an explicit "he"/Jesus subject.
   Lower-case "the lord" (a parable's master) and "The LORD" (a quoted Psalm) are deliberately not matched. */
const SPEECH_VERB = '(?:said|saith|spake|answered|answereth|answering said|answering saith|answered and said|began to say|cried|cried out)';
const SPEECH_OBJECT = '(?:\\s+(?:also|again|again unto them|likewise|therefore|unto them again|to them again))?'
  + '(?:\\s+(?:unto|to)\\s+(?:them|him|her|it|the [a-z]+(?: of [a-z]+)*|his [a-z]+|one of them|Simon Peter|Simon|Peter|Thomas|Philip|Martha|Mary|Nathanael|Nicodemus|Judas|Pilate|John|James|Zacchaeus|Bartimaeus|Jerusalem|Israel))?'
  + '(?:\\s+(?:in his doctrine|in parables|by parables|by a parable|in the temple|by the way|with a loud voice|privately|openly|plainly|the third time|the second time|again the second time))?'
  + '(?:,?\\s*saying)?';
const FRAME_END = '\\s*[,;:]\\s+';
const NAMED_SPEAKER = '(?:Jesus|[Tt]he Lord)';
const RULE_NAMED_BEFORE_VERB = new RegExp(`^[^.!?]*?\\b${NAMED_SPEAKER}\\b[^.!?]*?\\b${SPEECH_VERB}\\b${SPEECH_OBJECT}${FRAME_END}`);
const RULE_VERB_THEN_NAMED = new RegExp(`^(?:\\w+\\s+){0,4}${SPEECH_VERB}\\s+${NAMED_SPEAKER}\\b${SPEECH_OBJECT}${FRAME_END}`);
const CONJUNCTION = '(?:(?:And|But|Then|Now|So|When|While|Again|Likewise|Howbeit|Nevertheless|Whereupon)\\s+)?';
const RULE_PRONOUN_FRAME = new RegExp(
  `^${CONJUNCTION}(?:(?:he|He)\\s+)?(?:(?:also|again|likewise|answering|therefore|knowing their thoughts|sat down|and|called them unto him|called unto him his disciples|called the twelve|sendeth forth two of his disciples|arose|turned|stood|came|went)[,;]?\\s+)*${SPEECH_VERB}\\b${SPEECH_OBJECT}${FRAME_END}`,
);
const RULE_VERB_THEN_PRONOUN = new RegExp(`^(?:\\w+\\s+){0,3}${SPEECH_VERB}\\s+he\\b${SPEECH_OBJECT}${FRAME_END}`);
const RULE_SAYING_ANY = /^[^.!?]{0,120}?,\s+saying,\s+(?=.{13,})/;
const RULE_SAYING_NARRATOR = /^(?:[^.!?;]{0,100}?\b(?:he|He|Jesus)\b[^.!?;]{0,100}?|Likewise also the cup after supper),\s+saying,\s+(?=.{13,})/;

function extractSpoken(text, citation, context = {}) {
  const cleaned = cleanKjv(text);
  if (!cleaned) return '';
  const overrides = loadOverrides();
  if (citation && Object.prototype.hasOwnProperty.call(overrides, citation)) return overrides[citation];
  const previousRed = Boolean(context.previousRed);
  let m = cleaned.match(RULE_NAMED_BEFORE_VERB) || cleaned.match(RULE_VERB_THEN_NAMED);
  if (!m && !previousRed) m = cleaned.match(RULE_PRONOUN_FRAME) || cleaned.match(RULE_VERB_THEN_PRONOUN);
  if (!m) m = cleaned.match(previousRed ? RULE_SAYING_NARRATOR : RULE_SAYING_ANY);
  return (m ? cleaned.slice(m[0].length) : cleaned).trim();
}

/* True when the text still opens with the evangelist naming the speaker — the shape the rules must never leave. */
const NAMED_FRAME_LEAK = new RegExp(`^${CONJUNCTION}(?:when\\s+)?${NAMED_SPEAKER}\\b[^.!?]{0,80}?\\b(?:said|saith|answered|answereth|spake|cried)\\b|^(?:\\w+\\s+){0,4}(?:said|saith|spake|answered)\\s+${NAMED_SPEAKER}\\b`);
/* A pronoun frame — legitimate inside a parable, a leak at the start of a block. Reviewed by test/spoken.test.js. */
const PRONOUN_FRAME = new RegExp(`^${CONJUNCTION}(?:he|He)\\b[^.!?]{0,80}?\\b(?:said|saith|answered|answereth|spake|cried)\\b|^(?:\\w+\\s+){0,3}(?:said|saith|spake)\\s+he\\b`);

function frameShape(text) {
  if (NAMED_FRAME_LEAK.test(text)) return 'named';
  if (PRONOUN_FRAME.test(text)) return 'pronoun';
  return null;
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
    const previousRed = Boolean(spokenAt(parsed.book, parsed.chapter, v - 1));
    const text = mapped || extractSpoken(full, cite, { previousRed });
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
  if (left.includes(right) || right.includes(left)) return 0.92;
  const aw = left.split(' ');
  const bw = right.split(' ');
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

function fillPlaceholders(text) {
  if (!text) return text;
  return String(text).replace(PLACEHOLDER_RE, (_, raw) => {
    const hit = lookup(String(raw).replace(/^["'“”]+|["'“”]+$/g, ''));
    if (!hit) return '';
    return `**${hit.citation}**\n“${hit.text}”`;
  }).replace(/\n{3,}/g, '\n\n');
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
  return out.join('\n');
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
  return /\b(suicid|kill myself|killing myself|end my life|take my life|want to die|wanna die|self[-\s]?harm|hurt myself|cut myself|hang myself|overdose|don't want to live|do not want to live|better off dead|no reason to live)\b/i.test(String(text));
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
  frameShape,
};
