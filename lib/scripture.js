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
  // Verses where He speaks and then someone else does, or the evangelist resumes.
  // Only His part is kept.
  'John 12:28': 'Father, glorify thy name.', // the rest is the voice from heaven
  'Mark 8:19': 'When I brake the five loaves among five thousand, how many baskets full of fragments took ye up?', // "They say unto him, Twelve."
  'Luke 20:16': 'He shall come and destroy these husbandmen, and shall give the vineyard to others.', // "they said, God forbid."
  'John 6:64': 'But there are some of you that believe not.', // "For Jesus knew from the beginning…"
  'John 12:36': 'While ye have light, believe in the light, that ye may be the children of light.', // "These things spake Jesus, and departed…"
  'John 19:27': 'Behold thy mother!', // "And from that hour that disciple took her…"
  // The evangelist's gloss is the translation of His words, and is kept so the
  // reader is not handed untranslated Aramaic.
  'Matthew 27:46': 'Eli, Eli, lama sabachthani? that is to say, My God, my God, why hast thou forsaken me?',
  'Mark 15:34': 'Eloi, Eloi, lama sabachthani? which is, being interpreted, My God, my God, why hast thou forsaken me?',
};

// Speech every red-letter edition marks that the verse map omits. Added at build.
const SPOKEN_ADDITIONS = {
  'Luke 2:49': 'How is it that ye sought me? wist ye not that I must be about my Father’s business?',
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
  'Mark 9:7', // the voice out of the cloud
  'Mark 16:6', // the angel at the tomb
  'Matthew 15:33', // the disciples
  'Luke 19:25', // the hearers, in parenthesis
  'John 16:17', // some of his disciples among themselves
  'Mark 4:2', // "And he taught them many things by parables" — narration, no speech
]);

// Evangelist introductions the general pattern cannot separate from a parable's
// own "and he said" (the steward, the servants, the rich man are His narration and
// stay). Each prefix was read against the KJV text; it is stripped only when the
// verse begins with it exactly.
const NARRATOR_PREFIXES = {
  'Matthew 12:25': 'And Jesus knew their thoughts, and said unto them, ',
  'Matthew 12:49': 'And he stretched forth his hand toward his disciples, and said, ',
  'Matthew 15:32': 'Then Jesus called his disciples unto him, and said, ',
  'Matthew 20:25': 'But Jesus called them unto him, and said, ',
  'Mark 3:23': 'And he called them unto him, and said unto them in parables, ',
  'Mark 3:34': 'And he looked round about on them which sat about him, and said, ',
  'Mark 8:12': 'And he sighed deeply in his spirit, and saith, ',
  'Mark 9:19': 'He answereth him, and saith, ',
  'Mark 9:35': 'And he sat down, and called the twelve, and saith unto them, ',
  'Mark 10:21': 'Then Jesus beholding him loved him, and said unto him, ',
  'Mark 10:23': 'And Jesus looked round about, and saith unto his disciples, ',
  'Mark 10:42': 'But Jesus called them to him, and saith unto them, ',
  'Mark 12:43': 'And he called unto him his disciples, and saith unto them, ',
  'Mark 14:13': 'And he sendeth forth two of his disciples, and saith unto them, ',
  'Luke 6:20': 'And he lifted up his eyes on his disciples, and said, ',
  'Luke 6:39': 'And he spake a parable unto them, ',
  'Luke 7:31': 'And the Lord said, ',
  'Luke 7:44': 'And he turned to the woman, and said unto Simon, ',
  'Luke 10:23': 'And he turned him unto his disciples, and said privately, ',
  'Luke 11:17': 'But he, knowing their thoughts, said unto them, ',
  'Luke 12:42': 'And the Lord said, ',
  'Luke 13:15': 'The Lord then answered him, and said, ',
  'Luke 17:6': 'And the Lord said, ',
  'Luke 18:6': 'And the Lord said, ',
  'Luke 18:16': 'But Jesus called them unto him, and said, ',
  'Luke 18:31': 'Then he took unto him the twelve, and said unto them, ',
  'Luke 20:17': 'And he beheld them, and said, ',
  'Luke 21:29': 'And he spake to them a parable; ',
  'Luke 22:17': 'And he took the cup, and gave thanks, and said, ',
  'Luke 22:31': 'And the Lord said, ',
  'John 16:19': 'Now Jesus knew that they were desirous to ask him, and said unto them, ',
  // Second reading: verb-before-subject ("Then said Jesus"), bare "he", time-phrase
  // openers, and two-sentence introductions.
  'Matthew 9:37': 'Then saith he unto his disciples, ',
  'Matthew 11:7': 'And as they departed, Jesus began to say unto the multitudes concerning John, ',
  'Matthew 26:31': 'Then saith Jesus unto them, ',
  'Matthew 26:55': 'In that same hour said Jesus to the multitudes, ',
  'Mark 5:30': 'And Jesus, immediately knowing in himself that virtue had gone out of him, turned him about in the press, and said, ',
  'Mark 8:17': 'And when Jesus knew it, he saith unto them, ',
  'Mark 9:31': 'For he taught his disciples, and said unto them, ',
  'Mark 10:14': 'But when Jesus saw it, he was much displeased, and said unto them, ',
  'Mark 10:24': 'And the disciples were astonished at his words. But Jesus answereth again, and saith unto them, ',
  'Mark 11:2': 'And saith unto them, ',
  'Mark 11:17': 'And he taught, saying unto them, ',
  'Luke 9:48': 'And said unto them, ',
  'Luke 10:21': 'In that hour Jesus rejoiced in spirit, and said, ',
  'Luke 13:18': 'Then said he, ',
  'Luke 14:12': 'Then said he also to him that bade him, ',
  'Luke 17:1': 'Then said he unto the disciples, ',
  'Luke 19:12': 'He said therefore, ',
  'Luke 21:10': 'Then said he unto them, ',
  'Luke 22:36': 'Then said he unto them, ',
  'Luke 24:46': 'And said unto them, ',
  'John 1:43': 'The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, ',
  'John 5:19': 'Then answered Jesus and said unto them, ',
  'John 7:16': 'Jesus answered them, and said, ',
  'John 8:21': 'Then said Jesus again unto them, ',
  'John 8:31': 'Then said Jesus to those Jews which believed on him, ',
  'John 10:7': 'Then said Jesus unto them again, ',
  'John 11:41': 'Then they took away the stone from the place where the dead was laid. And Jesus lifted up his eyes, and said, ',
  'John 13:11': 'For he knew who should betray him; therefore said he, ',
  'John 17:1': 'These words spake Jesus, and lifted up his eyes to heaven, and said, ',
  'John 19:26': 'When Jesus therefore saw his mother, and the disciple standing by, whom he loved, he saith unto his mother, ',
  'John 19:28': 'After this, Jesus knowing that all things were now accomplished, that the scripture might be fulfilled, saith, ',
  'John 20:21': 'Then said Jesus to them again, ',
  'John 20:22': 'And when he had said this, he breathed on them, and saith unto them, ',
};

// `marker` is the verse map's own span for the verse ('full' or a substring). The
// exclusions and overrides above outrank it: the map has vouched for the voice from
// the cloud and the angel at the tomb before.
function extractSpoken(text, citation, marker) {
  const cleaned = cleanKjv(text);
  if (!cleaned) return '';
  if (citation && NOT_SPEECH.has(citation)) return '';
  if (citation && SPOKEN_OVERRIDES[citation]) return SPOKEN_OVERRIDES[citation];
  const prefix = citation && NARRATOR_PREFIXES[citation];
  if (prefix && cleaned.startsWith(prefix)) return cleaned.slice(prefix.length).trim();
  if (marker && marker !== 'full') return cleanKjv(marker);
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

const OPEN_Q = /^[“"‘']/;
const CLOSE_Q = /[”"’'][.,;:]?\s*$/;

// The quotation under a citation: a line in quote marks (any length, even a
// one-word fake), an unquoted line long enough to be one, or a quotation the
// model split across several lines — consumed whole so no tail is left behind.
function extractQuotedLine(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^\*\*/.test(trimmed)) return { quote: '', index: i, isQuote: false };
    if (OPEN_Q.test(trimmed)) {
      let end = i;
      if (!CLOSE_Q.test(trimmed) || trimmed.length === 1) {
        for (let j = i + 1; j < lines.length && j <= i + 6; j++) {
          const t = lines[j].trim();
          if (!t || /^\*\*/.test(t)) break;
          end = j;
          if (CLOSE_Q.test(t)) break;
        }
      }
      const joined = lines.slice(i, end + 1).map((l) => l.trim()).join(' ');
      const unquoted = joined.replace(/^[“”"‘’']+/, '').replace(/[“”"‘’']+[.,;:]?$/, '');
      return { quote: unquoted, index: end, isQuote: true };
    }
    if (trimmed.length > 8) return { quote: trimmed, index: i, isQuote: false };
    return { quote: '', index: i, isQuote: false };
  }
  return { quote: '', index: startIndex, isQuote: false };
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
  // Twelve characters is three or four words — "just let go" is a fabrication
  // people repeat; "it is I" is too short to prove either way and is left alone.
  const re = /[“"]([^”"]{12,})[”"]|[‘']([^’']{12,})[’']/g;
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
      const { quote, index, isQuote } = extractQuotedLine(lines, i + 1);
      const took = Boolean(quote) || isQuote;
      const canonical = lookup(parsed);
      if (canonical) {
        out.push(`**${canonical.citation}**`);
        out.push(`“${canonical.text}”`);
        let j = took ? index + 1 : i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length) {
          const ctx = lines[j].trim();
          if (ctx && !/^\*\*/.test(ctx) && !parseRef(ctx) && !OPEN_Q.test(ctx)) {
            out.push(scrubProse(ctx));
            j++;
          }
        }
        i = took ? j : i + 1;
        continue;
      }
      // A Gospel reference He did not speak: drop the citation and its quote.
      i = took ? index + 1 : i + 1;
      continue;
    }
    if (bold) {
      const { index, isQuote } = extractQuotedLine(lines, i + 1);
      const refShaped = ANY_REF_RE.test(probe) || OTHER_BOOKS_RE.test(probe) || /^[A-Za-z][A-Za-z. ]*\d/.test(probe);
      // A bold heading that is not a verified Gospel citation — another book, a
      // look-alike like "Jn 14.27", or any heading with a quotation under it —
      // goes, and so does whatever it was vouching for.
      if (refShaped || isQuote) {
        i = isQuote ? index + 1 : i + 1;
        continue;
      }
    }
    if (/^[“"‘'].{12,}[”"’']\s*$/.test(trimmed)) {
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
const CRISIS_RE = /\b(?:suicid\w*|sucid\w*|suicd\w*|unaliv\w*|sewer\s?slide|kms|kys|kill(?:ing|ed)?\s+(?:my|him|her|your|them|our)\s*s(?:el|le)\w{0,4}|end(?:ed|ing)?\s+(?:my|his|her|their|your)\s+(?:own\s+)?life|tak(?:e|ing|en)\s+(?:my|his|her|their)\s+(?:own\s+)?life(?!\s+as)|want(?:s|ing|ed)?\s+(?:to|2)\s+(?:die|be\s+dead)(?!\s+(?:on\s+this\s+hill|of\s+(?:embarrassment|shame|laugh\w*|boredom|cringe)|laughing))|wanna\s+(?:die|be\s+dead)|ready\s+to\s+die(?!\s+(?:of|from)\s+(?:embarrassment|shame|laugh\w*|boredom|cringe))|wish(?:ed|ing)?\s+(?:i|he|she)\s+(?:was|were)\s+(?:dead|never\s+born)|rather\s+be\s+dead|wish\s+i\s+(?:had\s+)?never\s+(?:been\s+)?born|self[-\s]?harm\w*|hurt(?:ing)?\s+myself|cut(?:ting)?\s+(?:my|him|her|them|your)\s*sel(?:f|ves)|cutting\s+again|hang(?:ing)?\s+myself|shoot(?:ing)?\s+myself|(?:slit|cut)(?:ting)?\s+my\s+wrists?|overdos\w*|too\s+many\s+pills|(?:whole|entire)\s+bottle\s+of\s+(?:pills|tablets|tylenol|acetaminophen|paracetamol|ibuprofen|advil|aspirin|xanax|ambien|oxy\w*|vicodin|percocet|benadryl|sleeping\s+pills|my\s+(?:meds|medication|medicine|pills|prescription))|(?:took|take|taking|taken|swallow\w*)\s+(?:the|a|an|my)\s+(?:whole|entire)\s+bottle|swallowed\s+(?:all\s+)?(?:the|my)\s+pills|took\s+all\s+(?:my|the)\s+pills|(?:to|gonna|planning\s+to|going\s+to)\s+od\b|jump(?:ing)?\s+(?:off|from)\s+(?:a|the)\s+(?:bridge|building|roof)|drive\s+into\s+a\s+wall|noose|bought\s+a\s+rope|gun\s+in\s+my\s+hand|have\s+the\s+means|(?:pills|rope|gun|blade|razor)\s+ready|(?:way|ways|how)\s+to\s+die|how\s+i\s+would\s+do\s+it|painless\s+way|goodbye\s+everyone|my\s+last\s+message|suicide\s+note|written\s+my\s+note|tell\s+my\s+(?:kids|children|family|wife|husband|mom|dad)\s+i\s+loved\s+them|(?:want|wanna|going|gonna|ready|about|decided|plan|planning|need)\s+to\s+end\s+(?:it|things|everything|myself)(?!\s+with)|(?:think|thinking|thought)\s+(?:about|of)\s+ending\s+(?:it|things|everything|myself|my\s+life)|imma\s+end\s+it|end(?:ing)?\s+it\s+(?:all|tonight|soon)|end(?:ing)?\s+myself|(?:don'?t|do\s+not|dont|doesn'?t|does\s+not)\s+(?:want\s+to|wanna)\s+(?:live|exist|be\s+alive|wake\s+up)|(?:don'?t|do\s+not|dont)\s+(?:want\s+to|wanna)\s+be\s+here\s+anymore|(?:think|thinking|thought)\s+about\s+not\s+being\s+here(?!\s+(?:for|at|when|on|during|next))|(?:don'?t|do\s+not|can'?t|cannot)\s+see\s+a\s+future\s+for\s+myself|(?:hope|hoping|wish|wishing|pray|praying)\s+(?:that\s+)?i\s+(?:don'?t|do\s+not|won'?t|will\s+not|never)\s+wake\s+up|(?:sleep|asleep)\s+and\s+(?:not|never)\s+wake\s+up|sleep\s+forever|disappear\s+forever|stop\s+existing|better\s+off\s+dead|better\s+off\s+without\s+me|miss\s+me\s+if\s+i\s+(?:was|were)\s+gone|happier\s+(?:if|when)\s+i(?:'?m|\s+was|\s+am)\s+gone|i(?:'?m|\s+am)\s+(?:such\s+)?a\s+burden|no\s+reason\s+to\s+live|not\s+worth\s+living|life\s+(?:isn'?t|is\s+not|ain'?t)\s+worth|(?:don'?t|do\s+not)\s+deserve\s+to\s+live|no\s+point\s+(?:in\s+)?(?:going\s+on|living|being\s+alive)|can'?t\s+go\s+on(?:\s+anymore)?|can'?t\s+do\s+this\s+anymore|(?:won'?t|not\s+going\s+to|not\s+gonna)\s+be\s+here\s+tomorrow|i\s+(?:want|wanna|need)\s+to\s+go\s+home\s+to\s+jesus|starving\s+myself|no\s+quiero\s+vivir|quiero\s+morir\w*|matarme|suicidarme|acabar\s+con\s+(?:mi\s+vida|todo)|je\s+veux\s+mourir|me\s+tuer|ich\s+will\s+sterben|mich\s+umbringen|quero\s+morrer|me\s+matar)\b/i;

// Someone has taken something. This is a medical emergency before it is anything else;
// the line goes ahead of the 988 notice. Poison Control number VERIFIED 2026-09-06 at
// poisonhelp.org and poisoncenters.org.
const POISON_RE = /\b(?:overdos\w*|too\s+many\s+pills|swallowed\s+(?:all\s+)?(?:the|my)\s+pills|took\s+all\s+(?:my|the)\s+pills|(?:took|take|taking|taken|swallow\w*)\s+(?:the|a|an|my)\s+(?:whole|entire)\s+bottle|(?:whole|entire)\s+bottle\s+of\s+(?:pills|tablets|tylenol|acetaminophen|paracetamol|ibuprofen|advil|aspirin|xanax|ambien|oxy\w*|vicodin|percocet|benadryl|sleeping\s+pills|my\s+(?:meds|medication|medicine|pills|prescription))|(?:took|swallowed|drank|ate)\s+(?:some\s+|the\s+|a\s+lot\s+of\s+|a\s+bunch\s+of\s+|a\s+handful\s+of\s+)?(?:bleach|antifreeze|rat\s+poison|drain\s+cleaner)|(?:just|already)\s+(?:took|swallowed)\s+(?:\d+|a\s+handful\s+of|a\s+bunch\s+of)\s+(?:pills|tablets)|poison(?:ed|ing)?\s+myself)\b/i;

function looksLikePoisoning(text) {
  if (!text) return false;
  return POISON_RE.test(String(text));
}

const POISON_LINE = 'If you have taken pills or anything else to harm yourself, that is a medical emergency before it is anything else: in the United States call 911, or Poison Control at 1-800-222-1222, right now — even if you feel fine.';

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

// The person writing is the one who hit, or is frightened they will. The same notice
// applies (the Hotline talks with people afraid of their own anger); the letter's
// opening changes. Mirrored in public/data/advisor.js (BY_YOU).
const BY_YOU_RE = /\b(?:allowed\s+to\s+(?:beat|hit|hurt|spank)|i\s+(?:hit|beat|slapped|punched|choked|strangled|shook|kicked|smacked)\s+(?:my\s+(?!(?:head|knee|elbow|hand|foot|toe|leg|arm|shin|thumb|finger|snooze|stride|limit|goal|target|quota|peak|mark|record|best|addiction|depression|cancer|anxiety|demons|fear|illness|diagnosis|own)\b)\w+|him|her|them)\b(?!\s+(?:at|in|to|by)\b)|(?:want|wanna|wanted|going|gonna|about|tempted|urge|urges)\s+to\s+(?:hit|beat|hurt|kill|strangle|choke|shake|smack)\s+(?:my|him|her|them|the\s+baby|our\s+baby)\b(?!\s+(?:at|in)\b)|(?:scared|afraid|worried|terrified|frightened)\s+(?:that\s+)?(?:i(?:'?m|\s+am)\s+(?:going\s+to|gonna)|i(?:'ll|\s+will|\s+might|\s+could))\s+(?:hurt|hit|kill|shake|snap\s+and\s+hurt|lose\s+it\s+and\s+hurt)\s+(?:my|him|her|them|the\s+baby|someone)|afraid\s+(?:of\s+)?what\s+i(?:'ll|\s+will|\s+might|\s+could|\s+would)\s+do(?:\s+to\s+(?:my|him|her|them|someone|the\s+baby))?)\b/i;

// Someone is being hurt, or is not safe at home — or is the one hurting. Mirrored in public/data/advisor.js (DANGER).
const DANGER_RE = new RegExp(
  /\b(?:(?:he|she|they|my (?:dad|father|mom|mother|husband|wife|partner|boyfriend|girlfriend|stepdad|stepfather|stepmom|brother|son|uncle))\s+(?:hit|hits|beat|beats|punched|punches|choked|chokes|strangled|kicked|kicks|slapped|slaps|threatened to kill|threatens to kill|threatened me|threatens me)\b(?!\s+(?:me\s+|us\s+|him\s+|her\s+|them\s+)?(?:at|in|to|by)\b)|(?:hit|hits|beat|beats|punched|choked|strangled|slapped)\s+(?:me|my mom|my mother|my kids|my child|my daughter|my son)\b(?!\s+(?:at|in|to|by)\b)|abus(?:e|es|ed|ing|ive)\s+(?:me|us|my|her|him)\b|(?:sexually|physically)\s+abus\w*|molest\w*|raped?\b|rape[sd]?\s+me|domestic violence|not safe at home|afraid (?:of|to go) home|afraid he(?:'ll| will) (?:hurt|kill)|he(?:'ll| will) kill me|scared (?:he|she)(?:'ll| will) hurt)\b/.source + '|' + BY_YOU_RE.source,
  'i'
);

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
  BY_YOU_RE,
  cleanKjv,
  CRISIS_NOTICE,
  CRISIS_RE,
  DANGER_NOTICE,
  DANGER_RE,
  isExactSpan,
  looksLikeDanger,
  looksLikePoisoning,
  NARRATOR_PREFIXES,
  SPOKEN_ADDITIONS,
  POISON_LINE,
  POISON_RE,
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
