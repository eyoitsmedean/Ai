// Splits a buffer of streamed model text into the part that is safe to send
// now and the part that must wait. The rule: a chunk is released only when
// the verifier can judge it on its own, so the page never sees
//   - an unclosed "{{" (a placeholder is filled once its "}}" arrives; a lone
//     trailing "{" or "}" is held because the next token may complete a pair);
//   - a bold citation line before its quote and context lines have landed;
//   - a sentence that is still open while it carries an opening quotation mark
//     or a scripture reference (it may turn into a recited verse).
const BOOK_REF_RE = /\b(?:[123]\s?[A-Z][a-z]+|[A-Z][a-z]+)\.?\s+\d{1,3}\s*:\s*\d{1,3}/;

function lastSentenceStart(text) {
  // The start of the last sentence or line: after the last ".", "!" or "?"
  // that is followed by whitespace, or after the last newline.
  let idx = -1;
  const nl = text.lastIndexOf('\n');
  if (nl !== -1) idx = nl + 1;
  const re = /[.!?]["”’)]*\s/g;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (end > idx) idx = end;
  }
  return idx === -1 ? 0 : idx;
}

function hasOpenQuote(text) {
  const curlyOpen = (text.match(/[“]/g) || []).length;
  const curlyClose = (text.match(/[”]/g) || []).length;
  if (curlyOpen > curlyClose) return true;
  const straight = (text.match(/"/g) || []).length;
  return straight % 2 === 1;
}

function holdUnsafe(pending, force = false) {
  const text = String(pending || '');
  if (force) return { flush: text, rest: '' };

  // 1. An unclosed placeholder, or a stray brace that may become one.
  const open = text.lastIndexOf('{{');
  const close = text.lastIndexOf('}}');
  if (open !== -1 && close < open) {
    return { flush: text.slice(0, open), rest: text.slice(open) };
  }
  if (/[{}]$/.test(text)) {
    return { flush: text.slice(0, -1), rest: text.slice(-1) };
  }

  // 2. A bold citation line and the two lines after it (quote, context) are
  //    released together, so the verifier sees the whole block.
  const lastBold = text.lastIndexOf('\n**');
  const start = text.startsWith('**') && lastBold === -1 ? 0 : lastBold === -1 ? -1 : lastBold + 1;
  if (start !== -1) {
    const after = text.slice(start);
    const segments = after.split('\n');
    // Only lines terminated by a newline count; blank lines do not.
    const complete = segments.slice(0, -1).filter((l) => l.trim()).length;
    if (complete < 3) return { flush: text.slice(0, start), rest: after };
  }
  if (/\*$/.test(text)) {
    return { flush: text.slice(0, -1), rest: '*' };
  }

  // 3. An unfinished sentence that carries an open quotation mark or a
  //    scripture reference is held until the sentence ends.
  const sStart = lastSentenceStart(text);
  const tail = text.slice(sStart);
  if (tail && (hasOpenQuote(tail) || BOOK_REF_RE.test(tail))) {
    return { flush: text.slice(0, sStart), rest: tail };
  }

  return { flush: text, rest: '' };
}

// Removes any marker syntax that survived filling: half-closed placeholders,
// nested braces, stray "{{" or "}}". Nothing shaped like a marker reaches
// the page.
function scrubMarkers(text) {
  if (!text) return text;
  return String(text)
    .replace(/\{\{[^\n]{0,80}?\}\}/g, '')
    .replace(/\{\{[^{}\n]{0,80}\}(?!\})/g, '')
    .replace(/\{[^{}\n]{0,80}\}\}/g, '')
    .replace(/\{\{[^\n}]{0,80}/g, '')
    .replace(/[{}]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Kept for callers that only need the placeholder rule.
function holdPlaceholders(pending, force = false) {
  const text = String(pending || '');
  if (force) return { flush: text, rest: '' };
  const open = text.lastIndexOf('{{');
  const close = text.lastIndexOf('}}');
  if (open !== -1 && close < open) {
    return { flush: text.slice(0, open), rest: text.slice(open) };
  }
  if (/\{$/.test(text)) {
    return { flush: text.slice(0, -1), rest: '{' };
  }
  return { flush: text, rest: '' };
}

module.exports = { holdPlaceholders, holdUnsafe, scrubMarkers };
