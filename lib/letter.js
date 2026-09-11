/**
 * A verified letter with no model in the room.
 * Empathy comes from the curated pack; speech comes through {{placeholders}}.
 */
const { retrieveSayings } = require('./retrieve');
const { encouragementFor } = require('./curated');
const { FALLBACK_LETTER } = require('./prompts');

function letterFor(query) {
  const asked = String(query || '').trim();
  if (!asked) return FALLBACK_LETTER;

  const { themes, sayings } = retrieveSayings(asked, { limit: 3 });
  const theme = themes[0];
  const pack = theme ? encouragementFor(theme) : null;
  const fromPack = (pack && pack.passages) ? pack.passages.slice(0, 2) : [];
  const fromRetrieve = (sayings || []).slice(0, 2).map((s) => ({
    verse: s.citation,
    context: 'These words meet this hour without asking it to be finished first.',
  }));
  const picks = fromPack.length ? fromPack : fromRetrieve;
  if (!picks.length) return FALLBACK_LETTER;

  const hear = pack
    ? pack.opening
    : 'I am here with you, and I will not rush past what you just named.';
  const close = pack
    ? pack.closing
    : 'Sit with these sentences. You do not have to solve the whole day.';

  const lines = [hear, ''];
  for (const p of picks) {
    if (!p.verse) continue;
    lines.push(`{{${p.verse}}}`);
    lines.push(p.context || 'These words meet this hour without asking it to be finished first.');
    lines.push('');
  }
  lines.push(close);
  return lines.join('\n');
}

module.exports = { letterFor };
