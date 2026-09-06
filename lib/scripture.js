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

// A placeholder becomes a quotation only when the recorded verse is Jesus's
// own speech. Narrator lines (Matthew 1:1), other authors (Romans 8:28) and
// unknown references are dropped together with the one-line context the model
// wrote for them, so a reader never meets a quotation this page cannot vouch for.
function fillPlaceholders(text) {
  if (!text) return text;
  const DROP = '\u0000DROP\u0000';
  const filled = String(text).replace(PLACEHOLDER_RE, (_, raw) => {
    const hit = lookup(String(raw).replace(/^["'“”]+|["'“”]+$/g, ''));
    if (!hit || !hit.redLetter) return DROP;
    return `**${hit.citation}**\n“${hit.text}”`;
  });
  if (!filled.includes(DROP)) return filled.replace(/\n{3,}/g, '\n\n');
  const lines = filled.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.includes(DROP)) { out.push(line); continue; }
    const remainder = line.split(DROP).join('').trim();
    if (remainder) { out.push(remainder); continue; }
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j += 1;
    const ctx = j < lines.length ? lines[j].trim() : '';
    const isCiteOrQuote = /^\*\*/.test(ctx) || /^[“”"]/.test(ctx) || ctx.includes(DROP) || Boolean(parseRef(ctx));
    if (ctx && !isCiteOrQuote) i = j;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
      if (canonical && !canonical.redLetter && loadSpoken().books[parsed.book]) {
        // A typed citation to narration: remove the cite and its quote line so
        // the letter never shows non-dominical text in the red-letter style.
        let j = quote ? index + 1 : i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        const ctx = j < lines.length ? lines[j].trim() : '';
        if (ctx && !/^\*\*/.test(ctx) && !parseRef(ctx) && !/^[“”"]/.test(ctx)) j++;
        i = j;
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

// Stems carry a leading boundary only, so "suicidal", "suicide", "overdosing"
// and "self-harming" all match; apostrophes are optional ("dont", "don't", "don’t").
const CRISIS_RE = /\b(suicid|kill(ing)?\s+myself|end(ing)?\s+my\s+life|tak(e|ing)\s+my\s+(own\s+)?life|want\s+to\s+die|wanna\s+die|self[-\s]?harm|hurt(ing)?\s+myself|cut(ting)?\s+myself|hang(ing)?\s+myself|overdos|don[’']?t\s+want\s+to\s+(live|be\s+here|be\s+alive|wake\s+up)|do\s+not\s+want\s+to\s+live|better\s+off\s+dead|no\s+reason\s+to\s+live|not\s+worth\s+living|end\s+it\s+all|jump\s+off)/i;

function looksLikeCrisis(text) {
  if (!text) return false;
  return CRISIS_RE.test(String(text));
}

// Abuse, violence and immediate physical danger: a different handoff than
// suicidality, because the right first call is a domestic-violence advocate or
// emergency services rather than a suicide line.
const DANGER_RE = /\b((he|she|they|my\s+\w+)\s+(hit|hits|beat|beats|choke[sd]?|strangle[sd]?|punche[sd]|slap(s|ped)?|threaten(s|ed)?\s+to\s+(kill|hurt))\s+(me|us|him|her|them|the\s+kids|my\s+(little\s+|younger\s+|older\s+|baby\s+)?(kids|children|son|daughter|brother|sister|sibling|mom|mother|wife|husband|partner|girlfriend|boyfriend))|abus(ive|ing|es|ed)\s+(me|us|husband|wife|partner|boyfriend|girlfriend|relationship|father|mother|dad|mom|home)|domestic\s+violence|(not|never)\s+safe\s+(at\s+home|with\s+(him|her|them))|afraid\s+(of|for\s+my\s+life\s+around)\s+my\s+(husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|stepdad|stepfather)|(rape[ds]?|molest(ed|ing)?|sexual(ly)?\s+assault(ed)?)\b|going\s+to\s+(kill|hurt)\s+me\b|threatening\s+(me|my\s+life)|hurts?\s+me\s+when\s+(he|she)|scared\s+(he|she)\s+will\s+(hurt|kill)\s+me)/i;

function looksLikeDanger(text) {
  if (!text) return false;
  return DANGER_RE.test(String(text));
}

const CRISIS_NOTICE = [
  'If you are in danger or thinking of ending your life, please stop here and get human help now.',
  'In the United States, call or text 988. Anywhere else, start at https://findahelpline.com — a global directory of verified helplines.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

// Numbers verified 2026-09-06 at https://www.thehotline.org/ (call 1-800-799-7233,
// text START to 88788), https://rainn.org/help-and-healing/ (800-656-4673, chat at
// hotline.rainn.org) and https://findahelpline.com/ (global directory).
const ASSAULT_RE = /\b(rape[ds]?|molest(ed|ing)?|sexual(ly)?\s+(assault(ed)?|abus(e|ed)))\b/i;

const DANGER_NOTICE = [
  'What you just described is not something you should have to carry alone, and nothing here will tell you to endure it.',
  'If you are in immediate danger, call your local emergency number now (911 in the United States).',
  'In the United States, the National Domestic Violence Hotline is 1-800-799-7233 (text START to 88788, or chat at https://www.thehotline.org). Anywhere else, start at https://findahelpline.com.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

const ASSAULT_NOTICE = [
  'What you just described is not something you should have to carry alone, and none of it was your fault.',
  'If you are in immediate danger, call your local emergency number now (911 in the United States).',
  'In the United States, RAINN\'s National Sexual Assault Hotline is 1-800-656-4673 (chat at https://hotline.rainn.org), and the National Domestic Violence Hotline is 1-800-799-7233. Anywhere else, start at https://findahelpline.com.',
  'I am not a person, and this page is not emergency care.',
  '',
].join('\n');

function safetyKind(text) {
  if (looksLikeCrisis(text)) return 'crisis';
  if (!looksLikeDanger(text)) return null;
  return ASSAULT_RE.test(String(text)) ? 'assault' : 'danger';
}

// The one prefix a letter may carry: suicidality first, then danger.
function safetyNotice(text) {
  const kind = safetyKind(text);
  if (kind === 'crisis') return CRISIS_NOTICE;
  if (kind === 'assault') return ASSAULT_NOTICE;
  if (kind === 'danger') return DANGER_NOTICE;
  return '';
}

module.exports = {
  BOOK_ALIASES,
  cleanKjv,
  CRISIS_NOTICE,
  DANGER_NOTICE,
  extractSpoken,
  fillPlaceholders,
  isRedLetter,
  loadCorpus,
  loadSpoken,
  looksLikeCrisis,
  looksLikeDanger,
  lookup,
  safetyKind,
  safetyNotice,
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
