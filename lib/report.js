// lib/report.js — the server's verdict on every quotation a page will show.
// Moved from server.js 2026-09-11. judgeQuote() is the one mismatch rule.

const { verifyQuote } = require('./scripture');

const QUOTE_MATCH_FLOOR = 0.55;

function judgeQuote(verse, quote) {
  const v = verifyQuote(verse, quote);
  const matches = v.ok && (!quote || (typeof v.score === 'number' && v.score >= QUOTE_MATCH_FLOOR));
  return {
    ok: Boolean(v.ok),
    verified: Boolean(matches),
    verse: v.citation || verse,
    quote: v.quote || quote,
    score: typeof v.score === 'number' ? v.score : v.ok ? 1 : 0,
    reason: v.reason || (!v.ok ? 'unknown-ref' : matches ? 'quote-match' : 'quote-mismatch'),
  };
}

function verifyItems(list) {
  const results = list.map((item) => {
    const verse = typeof item?.verse === 'string' ? item.verse.slice(0, 80)
      : typeof item?.citation === 'string' ? item.citation.slice(0, 80) : '';
    const quote = typeof item?.quote === 'string' ? item.quote.slice(0, 2000) : '';
    if (!verse) return { ok: false, verified: false, reason: 'missing-verse', verse: '', quote: '' };
    return judgeQuote(verse, quote);
  });
  const verified = results.filter((row) => row.verified).length;
  return {
    translation: 'KJV',
    total: results.length,
    verified,
    results,
    allVerified: results.length > 0 && verified === results.length,
  };
}

const CITE_LINE_RE = /^\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[a-z])?(?:\s*[–\-—]\s*\d+(?:[a-z])?)?)\*\*\s*$/i;

// Walks the final letter and checks every bold citation + quote line against
// the corpus, so the page can seal passages with the server's verdict instead
// of re-deriving it from a different translation.
function verifyReport(text, dropped = []) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
  const results = [];
  for (let i = 0; i < lines.length; i += 1) {
    const cite = lines[i].trim().match(CITE_LINE_RE);
    if (!cite) continue;
    let next = i + 1;
    while (next < lines.length && !lines[next].trim()) next += 1;
    const quoteLine = next < lines.length ? lines[next].trim() : '';
    const quote = /^["“]/.test(quoteLine) ? quoteLine.replace(/^["“]+/, '').replace(/["”]+\s*$/, '') : '';
    const j = judgeQuote(cite[1], quote);
    results.push({ verse: j.verse, verified: j.verified, reason: j.reason, score: j.score });
  }
  const verified = results.filter((r) => r.verified).length;
  return {
    source: 'server',
    translation: 'KJV',
    total: results.length,
    verified,
    unverified: results.length - verified,
    // Quotations the model typed that never reached the page: another author,
    // narration, or a verse recited from memory.
    dropped: dropped.length,
    droppedItems: dropped.slice(0, 12),
    results,
    allVerified: results.length > 0 && verified === results.length,
  };
}

module.exports = { QUOTE_MATCH_FLOOR, CITE_LINE_RE, judgeQuote, verifyItems, verifyReport };
