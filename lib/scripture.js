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
  /^Then saith he to Thomas,\s*/i,
  /^And he said unto her,\s*/i,
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

// Any "Book 3:16"-shaped reference, Gospel or not.
const ANY_REF_RE = /\b(?:[1-3]\s?)?[A-Z][a-z]+\.?\s+\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?\b/;
const OTHER_BOOKS_RE = /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d{1,3}(?::\d{1,3})?\b/;
const OTHER_VERSION_RE = /\b(?:NIV|ESV|NLT|NKJV|NASB|NRSV|CSB|MSG|AMP|The Message|New International|English Standard|New Living)\b/;

let _spokenHay = null;
function spokenHaystack() {
  if (_spokenHay) return _spokenHay;
  const parts = [];
  const books = loadSpoken().books || {};
  for (const b of Object.values(books)) for (const ch of Object.values(b)) for (const t of Object.values(ch)) parts.push(normalizeForCompare(t));
  _spokenHay = ' ' + parts.join(' ') + ' ';
  return _spokenHay;
}

function quotedSpans(line) {
  const spans = [];
  const re = /[“"]([^”"]{25,})[”"]|[‘']([^’']{25,})[’']/g;
  let m;
  while ((m = re.exec(line))) spans.push(m[1] || m[2]);
  return spans;
}

// Prose may not quote what He did not say, cite another book, or name another translation.
function scrubProse(line) {
  if (!line.trim()) return line;
  const sentences = line.split(/(?<=[.!?]|[.!?][”"’'])\s+/);
  const kept = sentences.filter((s) => {
    if (OTHER_BOOKS_RE.test(s)) return false;
    if (OTHER_VERSION_RE.test(s)) return false;
    for (const span of quotedSpans(s)) {
      if (!spokenHaystack().includes(normalizeForCompare(span))) return false;
    }
    return true;
  });
  return kept.join(' ');
}

function verifyAdvisorText(text) {
  if (!text) return text;
  const lines = String(text).split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const bold = trimmed.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    const probe = bold ? bold[1].trim() : trimmed;
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
            out.push(scrubProse(ctx));
            j++;
          }
        }
        i = quote ? j : i + 1;
        continue;
      }
      // A Gospel reference He did not speak: drop the citation and its quote.
      i = quote ? index + 1 : i + 1;
      continue;
    }
    if (bold && (ANY_REF_RE.test(probe) || OTHER_BOOKS_RE.test(probe))) {
      // A bold citation outside the Gospels: drop it and its quote.
      const { quote, index } = extractQuotedLine(lines, i + 1);
      i = quote ? index + 1 : i + 1;
      continue;
    }
    if (/^[“"‘'].{25,}[”"’']\s*$/.test(trimmed)) {
      // A free-standing quotation with no citation above it.
      if (!spokenHaystack().includes(normalizeForCompare(trimmed.slice(1, -1)))) { i++; continue; }
    }
    out.push(scrubProse(lines[i]));
    i++;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
const CRISIS_RE = /\b(?:suicid\w*|sucid\w*|suicd\w*|unaliv\w*|kms|kys|kill(?:ing|ed)?\s+(?:my|him|her|your|them|our)\s*s(?:el|le)\w{0,4}|end(?:ed|ing)?\s+(?:my|his|her|their|your)\s+(?:own\s+)?life|tak(?:e|ing|en)\s+(?:my|his|her|their)\s+(?:own\s+)?life(?!\s+as)|want(?:s|ing|ed)?\s+(?:to|2)\s+(?:die|be\s+dead)(?!\s+on\s+this\s+hill)|wanna\s+(?:die|be\s+dead)|ready\s+to\s+die|wish(?:ed|ing)?\s+(?:i|he|she)\s+(?:was|were)\s+(?:dead|never\s+born)|rather\s+be\s+dead|wish\s+i\s+(?:had\s+)?never\s+(?:been\s+)?born|self[-\s]?harm\w*|hurt(?:ing)?\s+myself|cut(?:ting)?\s+(?:my|him|her|them|your)\s*sel(?:f|ves)|cutting\s+again|hang(?:ing)?\s+myself|shoot(?:ing)?\s+myself|(?:slit|cut)(?:ting)?\s+my\s+wrists?|overdos\w*|too\s+many\s+pills|(?:whole|entire)\s+bottle\s+of|swallowed\s+(?:all\s+)?(?:the|my)\s+pills|took\s+all\s+(?:my|the)\s+pills|(?:to|gonna|planning\s+to|going\s+to)\s+od\b|jump(?:ing)?\s+(?:off|from)\s+(?:a|the)\s+(?:bridge|building|roof)|drive\s+into\s+a\s+wall|noose|bought\s+a\s+rope|gun\s+in\s+my\s+hand|have\s+the\s+means|(?:pills|rope|gun|blade|razor)\s+ready|(?:way|ways|how)\s+to\s+die|painless\s+way|goodbye\s+everyone|my\s+last\s+message|suicide\s+note|written\s+my\s+note|tell\s+my\s+(?:kids|children|family|wife|husband|mom|dad)\s+i\s+loved\s+them|(?:want|wanna|going|gonna|ready|about|decided|plan|planning|need)\s+to\s+end\s+(?:it|things|everything|myself)(?!\s+with)|imma\s+end\s+it|end(?:ing)?\s+it\s+(?:all|tonight|soon)|end(?:ing)?\s+myself|(?:don'?t|do\s+not|dont|doesn'?t|does\s+not)\s+(?:want\s+to|wanna)\s+(?:live|exist|be\s+alive|wake\s+up)|(?:don'?t|do\s+not|dont)\s+(?:want\s+to|wanna)\s+be\s+here\s+anymore|(?:hope|hoping|wish|wishing|pray|praying)\s+(?:that\s+)?i\s+(?:don'?t|do\s+not|won'?t|will\s+not|never)\s+wake\s+up|(?:sleep|asleep)\s+and\s+(?:not|never)\s+wake\s+up|sleep\s+forever|disappear\s+forever|stop\s+existing|better\s+off\s+dead|better\s+off\s+without\s+me|miss\s+me\s+if\s+i\s+(?:was|were)\s+gone|happier\s+(?:if|when)\s+i(?:'?m|\s+was|\s+am)\s+gone|i(?:'?m|\s+am)\s+(?:such\s+)?a\s+burden|no\s+reason\s+to\s+live|not\s+worth\s+living|life\s+(?:isn'?t|is\s+not|ain'?t)\s+worth|(?:don'?t|do\s+not)\s+deserve\s+to\s+live|no\s+point\s+(?:in\s+)?(?:going\s+on|living|being\s+alive)|can'?t\s+go\s+on(?:\s+anymore)?|can'?t\s+do\s+this\s+anymore|(?:won'?t|not\s+going\s+to|not\s+gonna)\s+be\s+here\s+tomorrow|i\s+(?:want|wanna|need)\s+to\s+go\s+home\s+to\s+jesus|starving\s+myself|no\s+quiero\s+vivir|quiero\s+morir\w*|matarme|suicidarme|acabar\s+con\s+(?:mi\s+vida|todo))\b/i;

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

// Someone is being hurt, or is not safe at home. Mirrored in data/advisor.js (DANGER).
const DANGER_RE = /\b(?:(?:he|she|they|my (?:dad|father|mom|mother|husband|wife|partner|boyfriend|girlfriend|stepdad|stepfather|stepmom|brother|son|uncle))\s+(?:hit|hits|beat|beats|punched|punches|choked|chokes|strangled|kicked|kicks|slapped|slaps|threatened to kill|threatens to kill|threatened me|threatens me)\b(?!\s+(?:me\s+|us\s+)?(?:at|in|to|by)\b)|(?:hit|hits|beat|beats|punched|choked|strangled|slapped)\s+(?:me|my mom|my mother|my kids|my child|my daughter|my son)\b(?!\s+(?:at|in|to|by)\b)|abus(?:e|es|ed|ing|ive)\s+(?:me|us|my|her|him)\b|(?:sexually|physically)\s+abus\w*|molest\w*|raped?\b|rape[sd]?\s+me|domestic violence|not safe at home|afraid (?:of|to go) home|afraid he(?:'ll| will) (?:hurt|kill)|he(?:'ll| will) kill me|scared (?:he|she)(?:'ll| will) hurt)\b/i;

function looksLikeDanger(text) {
  if (!text) return false;
  return DANGER_RE.test(String(text));
}

const DANGER_NOTICE = [
  'If someone is hurting you, if you are not safe at home, or if you are afraid of what you might do to someone, you deserve help from a person — tonight, not later.',
  'In the United States, the National Domestic Violence Hotline is 1-800-799-7233 (or text START to 88788), free and confidential, 24/7; if you are in immediate danger, call 911. Anywhere else, https://findahelpline.com lists abuse and violence lines by country.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

// True when `quote` is, word for word, what He said at `cite` — the whole verse or a shorter contiguous span.
function isExactSpan(cite, quote) {
  const canonical = lookup(cite);
  if (!canonical) return false;
  const q = normalizeForCompare(quote);
  if (q.length < 12) return false;
  return normalizeForCompare(canonical.text).includes(q);
}

module.exports = {
  BOOK_ALIASES,
  cleanKjv,
  CRISIS_NOTICE,
  CRISIS_RE,
  DANGER_NOTICE,
  DANGER_RE,
  isExactSpan,
  looksLikeDanger,
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
