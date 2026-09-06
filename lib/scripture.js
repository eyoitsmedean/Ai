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
  'John 13:21': 'Verily, verily, I say unto you, that one of you shall betray me.',
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
  /^He answered and said unto them,\s*/i,
  /^But he saith unto them,\s*/i,
  /^And he spake (?:also )?(?:a|this) parable (?:unto|to) them;\s*/i,
  /^He spake also this parable;\s*/i,
  /^And he began to speak unto them by parables\.\s*/i,
  /^As soon as Jesus heard the word that was spoken, he saith unto the ruler of the synagogue,\s*/i,
  /^And he arose, and rebuked the wind, and said unto the sea,\s*/i,
];

const SPEECH_TAILS = [
  /\s+And the wind ceased, and there was a great calm\.?$/i,
];

// An explicit narrator introduction: "<And> Jesus/he <...> said/saith unto them, ".
// Only what follows it is speech. The red-letter map decides whether a verse is
// speech at all; this only trims how the evangelist introduced it.
const NARRATOR_INTRO_RE = /^(?:(?:and|then|but|now|when|so|as|while|after|likewise|also|again|immediately|straightway|the same day|in those days|at that time)\s+)?jesus\b[^,.;]{0,80}?\b(?:said|saith|answered and said|answering said|answering|spake|cried|prayed|commanded|charged|asked|began to say|began to speak|answered)\b[^,.;]*[,.;]\s+(?:saying,\s+)?(.+)$/i;

// Verses the red-letter map marks as speech but which are narration, indirect
// report, or someone else speaking. Excluded from the spoken corpus outright.
const NOT_SPEECH = new Set([
  'John 11:35', // Jesus wept.
  'Mark 5:43', // indirect report of a charge
  'Luke 13:14', // the ruler of the synagogue
  'Luke 24:32', // the two on the Emmaus road
  'John 7:20', // the people
  'John 12:34', // the people
]);

function extractSpoken(text, citation) {
  const cleaned = cleanKjv(text);
  if (!cleaned) return '';
  if (citation && NOT_SPEECH.has(citation)) return '';
  if (citation && SPOKEN_OVERRIDES[citation]) return SPOKEN_OVERRIDES[citation];
  let spoken = cleaned;
  for (const re of SPEECH_INTROS) spoken = spoken.replace(re, '');
  const saying = spoken.match(/,\s+saying,\s+(.+)$/i);
  if (saying && saying[1].length > 12) spoken = saying[1];
  for (const re of SPEECH_TAILS) spoken = spoken.replace(re, '');
  spoken = spoken.trim();
  const intro = spoken.match(NARRATOR_INTRO_RE);
  if (intro && intro[1] && intro[1].length > 8) spoken = intro[1].trim();
  return spoken;
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
    // Only the red-letter map decides what He said. A verse the map does not
    // mark is narrator, Mary, Pilate, or the devil — never guessed at.
    const mapped = spokenAt(parsed.book, parsed.chapter, v);
    verses.push({ verse: v, full, text: mapped || '', redLetter: Boolean(mapped) });
  }
  const use = verses.filter((v) => v.redLetter);
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
    redLetter: true,
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

// Mirrored in public/index.html (looksLikeCrisisClient). Keep the two in step;
// test/scripture.test.js checks the client copy against this one.
const CRISIS_RE = /\b(suicid\w*|kill(ing)?\s+(myself|himself|herself|themselves|yourself)|end(ing)?\s+(my|his|her|their|your)\s+(own\s+)?life|tak(e|ing)\s+(my|his|her|their)\s+(own\s+)?life|wants?\s+to\s+die|wanna\s+die|self[-\s]?harm\w*|hurt(ing)?\s+myself|cut(ting)?\s+myself|hang(ing)?\s+myself|overdos\w*|too\s+many\s+pills|don'?t\s+want\s+to\s+(live|be\s+alive|be\s+here)|do\s+not\s+want\s+to\s+(live|be\s+alive)|better\s+off\s+dead|no\s+reason\s+to\s+live|not\s+worth\s+living|(not|never)\s+wake\s+up|end\s+it\s+all)\b/i;

function looksLikeCrisis(text) {
  if (!text) return false;
  return CRISIS_RE.test(String(text));
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
  CRISIS_RE,
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
};
