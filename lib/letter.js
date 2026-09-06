const { adviseLetter, roomFor, citationAllowed, CRISIS_PASSAGES } = require('./advise');
const { verifyAndSubstitute, fillPlaceholders, parseRef, CRISIS_NOTICE, DANGER_NOTICE, POISON_LINE, looksLikePoisoning } = require('./scripture');

/**
 * The last step every Advisor letter passes through, model or not:
 * placeholders become exact KJV speech, anything unverifiable is removed,
 * every citation must belong to the room the question named, and a question
 * that names danger gets the human-help notice first —
 * a body in danger outranks self-harm, which outranks violence.
 */
function noticeFor(question, room = roomFor(question)) {
  if (room.crisis) {
    return (looksLikePoisoning(question) ? `${POISON_LINE}\n` : '') + CRISIS_NOTICE;
  }
  if (room.danger) return DANGER_NOTICE;
  return '';
}

// Sentences that must never be said to the one who hit.
const NOT_FOR_BY_YOU_RE = /\b(?:not your fault|wasn'?t your fault|isn'?t your fault|nothing you did|you did nothing wrong|you didn'?t deserve|you don'?t deserve (?:this|that|it)|they will believe you)\b/i;

/**
 * Remove every cited block (**Book c:v**, its quotation, its context line) whose
 * citation is outside the room's allowed passages. Crisis rooms are strict:
 * the cited verses must sit inside an allowed span.
 */
function keepToRoom(text, room) {
  const lines = String(text).split('\n');
  const out = [];
  let kept = 0;
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    const bold = t.match(/^\*\*([^*]+)\*\*\s*$/);
    if (bold && parseRef(bold[1])) {
      const ok = citationAllowed(bold[1], room.allowed, { strict: room.crisis });
      let j = i + 1;
      // The quotation (possibly several lines) and one context line belong to the heading.
      if (j < lines.length && /^[“"]/.test(lines[j].trim())) {
        while (j < lines.length && !/[”"][.,;:]?\s*$/.test(lines[j].trim())) j++;
        j++;
      }
      if (j < lines.length && lines[j].trim() && !/^\*\*/.test(lines[j].trim()) && !/^[“"]/.test(lines[j].trim())) j++;
      if (ok) {
        kept += 1;
        for (let k = i; k < j; k++) out.push(lines[k]);
      }
      i = j;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return { text: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), kept };
}

function roomPassages(room) {
  const items = room.crisis && !room.bereaved
    ? CRISIS_PASSAGES
    : room.pack.passages.slice(0, 2);
  return fillPlaceholders(items.map((p) => `{{${p.verse}}}\n${p.context}`).join('\n\n'));
}

function scrubOpening(text, room) {
  if (!room.byYou) return text;
  return text
    .split('\n')
    .map((line) => {
      if (/^\*\*|^[“"]/.test(line.trim())) return line;
      return line
        .split(/(?<=[.!?])\s+/)
        .filter((s) => !NOT_FOR_BY_YOU_RE.test(s))
        .join(' ');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function finishLetter(body, question) {
  const room = roomFor(question);
  const verified = verifyAndSubstitute(body);
  const { text, kept } = keepToRoom(verified, room);
  let letter = scrubOpening(text, room);
  // A letter with no passage left is not a letter from this room; the room supplies its own.
  if (!kept) letter = `${letter}\n\n${roomPassages(room)}`.trim();
  return `${noticeFor(question, room)}${letter}`;
}

function retrievalLetter(question) {
  return finishLetter(adviseLetter(question), question);
}

module.exports = { finishLetter, keepToRoom, noticeFor, retrievalLetter };
