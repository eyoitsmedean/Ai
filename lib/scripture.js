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

function extractSpoken(text, citation) {
  const cleaned = cleanKjv(text);
  if (!cleaned) return '';
  if (citation && SPOKEN_OVERRIDES[citation]) return SPOKEN_OVERRIDES[citation];
  let spoken = cleaned;
  for (const re of SPEECH_INTROS) spoken = spoken.replace(re, '');
  const saying = spoken.match(/,\s+saying,\s+(.+)$/i);
  if (saying && saying[1].length > 12) spoken = saying[1];
  for (const re of SPEECH_TAILS) spoken = spoken.replace(re, '');
  return spoken.trim();
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

// Explicit ideation plus the passive phrasings screeners actually ask about:
// C-SSRS Q1 ("wished you were dead / go to sleep and not wake up") and the
// 988 warning-sign list ("burden to others", "no reason to live", "can't go on").
const CRISIS_PATTERN = new RegExp([
  'suicid',
  'kill(?:ing)? myself',
  'end (?:my|it) (?:life|all)',
  'take my (?:own )?life',
  'end my life',
  'wan(?:t|na) to die',
  'wish(?:ed|ing)? (?:i (?:were|was) dead|i (?:could|would) die|to die|i (?:was|were) never born)',
  '(?:go|going) to sleep and (?:not|never) wake up',
  'not (?:be )?alive anymore',
  'self[-\\s]?harm',
  'hurt(?:ing)? myself',
  'cut(?:ting)? myself',
  'hang myself',
  'overdos',
  '(?:don\'?t|do not|dont) want to (?:live|be here|be alive|wake up)',
  'better off (?:dead|without me)',
  'no (?:reason|point) (?:to live|in living|to (?:go|be) on|to be here|to keep going)',
  '(?:life|it) (?:is|isn\'?t|is not) (?:not )?worth living',
  'can\'?t (?:go on|do this anymore|keep going|take it anymore)',
  'cannot (?:go on|do this anymore|keep going|take it anymore)',
  '(?:a )?burden to (?:everyone|everybody|my family|them|others)',
  'nobody would (?:miss|notice|care if)',
  'no one would (?:miss|notice|care if)',
  'want (?:it|everything|the pain) to (?:end|stop|be over)',
  'planning (?:my|to end my) (?:death|life)',
].join('|'), 'i');

function looksLikeCrisis(text) {
  if (!text) return false;
  return CRISIS_PATTERN.test(String(text));
}

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

// Medication, diagnosis, and treatment questions get His words and a plain
// refusal to steer the medical decision. The line names who does own it.
const MEDICAL_PATTERN = /\b(medication|medications|meds|antidepressant|antidepressants|prescription|prescribed|dosage|dose|pills|insulin|chemo|chemotherapy|therapy session|therapist|psychiatrist|diagnos(?:is|ed)|stop taking|go off my|off my meds|treatment plan|surgery|vaccine)\b/i;
function looksLikeMedical(text) {
  if (!text) return false;
  return MEDICAL_PATTERN.test(String(text));
}
// Requests for another book, another voice, or a chore. The room says what it
// carries instead of quietly answering a different question.
// Books that are also common first names (Job, James, Peter, Daniel) are left
// out on purpose: "James hurt me" is a need, not a citation request.
const OFFSCOPE_PATTERN = /\b(paul|psalm|psalms|proverbs?|genesis|exodus|leviticus|deuteronomy|isaiah|jeremiah|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|hebrews|revelation|old testament|torah|quran|koran|bhagavad|buddha|nietzsche|joke|weather|forecast|recipe|resume|résumé|cover letter|homework|essay|write (?:me )?(?:a|some) (?:code|poem|song)|lottery|stock tip)\b/i;
function looksLikeOffScope(text) {
  if (!text) return false;
  return OFFSCOPE_PATTERN.test(String(text));
}
const OFFSCOPE_NOTICE = [
  'One thing first: this room carries only the words Jesus spoke in Matthew, Mark, Luke, and John. It will not quote another book or another voice, and it does not do tasks.',
  'If there is something underneath the question that you are carrying, a sentence of His can sit beside it.',
  '',
].join('\n');

// "Are you Jesus?" deserves a straight answer before any verse.
const IDENTITY_PATTERN = /\b(pretend(?:ing)? to be (?:jesus|god|christ)|are you (?:really )?(?:jesus|god|christ|a bot|a robot|an ai|a person|human)|is this (?:really )?(?:jesus|god|christ)|talking to (?:jesus|god)|ai jesus|jesus ai|chat ?bot|robot|you are (?:just )?(?:an? )?(?:ai|machine|program|computer)|speak(?:ing)? as (?:jesus|god|christ))\b/i;
function looksLikeIdentity(text) {
  if (!text) return false;
  return IDENTITY_PATTERN.test(String(text));
}
const IDENTITY_NOTICE = [
  'You are right to ask, so here it is plainly: this is software, not a person, and not Him. It does not speak for Jesus; it carries what He is recorded as saying in Matthew, Mark, Luke, and John, checked line by line against the King James text.',
  'Doubt is welcome here. So is staying.',
  '',
].join('\n');

const MEDICAL_NOTICE = [
  'A word first about the decision itself: this page is not medical care, and it will not tell you to start, stop, or change a medication or treatment.',
  'That decision belongs with you and the clinician who prescribed it. Please bring the question to them, and let these words keep you company while you do.',
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
  looksLikeMedical,
  MEDICAL_NOTICE,
  looksLikeOffScope,
  OFFSCOPE_NOTICE,
  looksLikeIdentity,
  IDENTITY_NOTICE,
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
