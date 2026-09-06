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
// "1 John 4:18" is an epistle, not the Gospel: a digit before the book name disqualifies it.
const REF_RE = new RegExp(
  `(?<![0-9]\\s{0,2})\\b(${BOOK_PATTERN})\\s+(\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[–—\\-]\\s*(\\d{1,3}))?`,
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
const OTHER_BOOKS_RE = /\b(?:[1-3]\s?John|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|Moroni|Nephi|Alma|Mosiah|Ether|Surah)\s+\d{1,3}(?::\d{1,3})?\b/;
// Another voice quoted or paraphrased as authority — the letter has one.
const OTHER_VOICE_RE = /\b(?:Paul|Moses|David|Isaiah|Solomon|Jeremiah|Peter|James|Jude|Moroni|Nephi|Muhammad|the Prophet|Buddha|Confucius|Rumi|C\.?\s?S\.?\s?Lewis|Augustine|the Psalmist|the Apostle)\s+(?:wrote|said|says|writes|teaches|taught|put it|reminds us|tells us)\b|\b(?:the\s+)?(?:Quran|Qur'an|Koran|Torah|Talmud|Book of Mormon|Bhagavad Gita|Tao Te Ching|Hadith)\b/i;
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
  // Judge quotations on the whole line first, so a fabrication with a full stop
  // inside it ("I will never leave you. Not tonight, not ever.") cannot split into
  // two halves that each look unquoted.
  let work = line;
  for (const span of quotedSpans(work)) {
    if (!spokenHaystack().includes(normalizeForCompare(span))) {
      const stop = /[.!?]$/.test(span) ? span.slice(-1) : '';
      work = work.split(span).join(`\u0000${stop}`);
    }
  }
  const sentences = work.split(/(?<=[.!?]|[.!?][”"’'])\s+/);
  const kept = sentences.filter((s) => {
    if (s.includes('\u0000')) return false;
    if (OTHER_BOOKS_RE.test(s)) return false;
    if (OTHER_VERSION_RE.test(s)) return false;
    if (OTHER_VOICE_RE.test(s)) return false;
    return true;
  });
  const out = kept.join(' ').trim();
  // What is left of "“fake” — John 14:27" is a dash and a reference: nothing.
  if (/^[—–\-\s(),.;:]*(?:[1-3]\s?)?(?:[A-Z][a-z]+\.?\s+\d{1,3}:\d{1,3}(?:[-–—]\d{1,3})?)?[—–\-\s(),.;:]*$/.test(out)) return '';
  return out;
}

// Other quotation glyphs («» „“ ‚‘ and backticks) become the two the verifier reads;
// a heading dressed as *John 14:27*, __John 14:27__, ### John 14:27 or (**John 14:27**)
// becomes the one form it reads.
const HEADING_VARIANT_RE = /^(?:#{1,6}\s*|\*{1,3}|_{1,3}|\(\*{0,2}|\*\*\()\s*((?:[1-3]\s?)?[A-Z][a-z]+\.?\s+\d{1,3}\s*[:.]\s*\d{1,3}(?:\s*[-–—]\s*\d{1,3})?)\s*(?:\*{1,3}|_{1,3}|\*{0,2}\)|\)\*\*)?\s*$/;
function normalizeMarkup(text) {
  return String(text)
    .replace(/„([^„“”]*)[“”]/g, '"$1"')
    .replace(/‚([^‚‘’]*)[‘’]/g, "'$1'")
    .replace(/[«»‟]/g, '"')
    .replace(/‛/g, "'")
    .replace(/`+/g, '"')
    .split('\n')
    .map((line) => {
      const t = line.trim();
      const h = t.match(HEADING_VARIANT_RE);
      if (h) return `**${h[1]}**`;
      // A blockquote is a quotation; an attribution line under it ("— Jesus") is not His.
      if (/^>\s*/.test(t)) {
        const body = t.replace(/^>\s*/, '').replace(/^[“"‘']+|[”"’'][.,;:]?$/g, '').trim();
        if (!body || /^[—–-]/.test(body)) return '';
        return `“${body}”`;
      }
      if (/^[—–-]{1,2}\s*(?:Jesus|Christ|the Lord|John|Matthew|Mark|Luke)\b[^“"]{0,30}$/.test(t)) return '';
      return line;
    })
    .join('\n');
}

function verifyAdvisorText(text) {
  if (!text) return text;
  const lines = normalizeMarkup(text).split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const bold = trimmed.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    const probe = bold ? bold[1].trim() : trimmed;
    const parsed = parseRef(probe);
    const looksLikeCite = parsed && (bold || /^(Matthew|Mark|Luke|John)\b/i.test(probe));
    if (looksLikeCite) {
      let found = extractQuotedLine(lines, i + 1);
      // Context written above the quotation instead of below it: keep both in order.
      let ctxFirst = null;
      if (found.quote && !found.isQuote) {
        const below = extractQuotedLine(lines, found.index + 1);
        if (below.isQuote) { ctxFirst = found.quote; found = below; }
      }
      const { quote, index, isQuote } = found;
      const took = Boolean(quote) || isQuote;
      const canonical = lookup(parsed);
      if (canonical) {
        out.push(`**${canonical.citation}**`);
        out.push(`“${canonical.text}”`);
        let j = took ? index + 1 : i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (ctxFirst) {
          const c = scrubProse(ctxFirst);
          if (c) out.push(c);
        } else if (j < lines.length) {
          const ctx = lines[j].trim();
          if (ctx && !/^\*\*/.test(ctx) && !parseRef(ctx) && !OPEN_Q.test(ctx)) {
            const c = scrubProse(ctx);
            if (c) out.push(c);
            j++;
          }
        }
        // The same verse quoted again right under its canonical text is a duplicate.
        while (j < lines.length) {
          const t = lines[j].trim();
          if (!t) { j++; continue; }
          if (OPEN_Q.test(t) && isExactSpan(canonical.citation, t.replace(/^[“"‘']+|[”"’'][.,;:]?$/g, ''))) { j++; continue; }
          break;
        }
        i = j;
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
    const scrubbed = scrubProse(lines[i]);
    if (scrubbed || !lines[i].trim()) out.push(scrubbed);
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

// What the Advisor listens for before it answers — one copy, shared with the page
// and the static composer (public/data/signals.js).
const SIGNALS = require('../public/data/signals.js');
const {
  fold,
  CRISIS_RE,
  POISON_RE,
  POISON_NOT_ME_RE,
  DANGER_RE,
  BY_YOU_RE,
  BEREAVED_RE,
  looksLikeCrisis,
  looksLikePoisoning,
  looksLikeDanger,
  looksLikeByYou,
  looksLikeBereaved,
  POISON_LINE,
  CRISIS_NOTICE,
  DANGER_NOTICE,
} = SIGNALS;

// True when `quote` is, word for word, what He said at `cite` — the whole verse or a shorter contiguous span.
function isExactSpan(cite, quote) {
  const canonical = lookup(cite);
  if (!canonical) return false;
  const q = normalizeForCompare(quote);
  if (q.length < 12) return false;
  return normalizeForCompare(canonical.text).includes(q);
}

module.exports = {
  BEREAVED_RE,
  BOOK_ALIASES,
  BY_YOU_RE,
  fold,
  looksLikeBereaved,
  looksLikeByYou,
  POISON_NOT_ME_RE,
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
