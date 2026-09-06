const { retrieveSayings } = require('./retrieve');
const { encouragementFor, dailyForDate } = require('./curated');
const { fillPlaceholders } = require('./scripture');

function adviseLetter(question) {
  const q = String(question || '').trim();
  if (!q) {
    const daily = dailyForDate(new Date());
    return fillPlaceholders([
      'Peace I leave with you.',
      '',
      `{{${daily.word.verse}}}`,
      daily.word.reflection,
    ].join('\n'));
  }

  const retrieved = retrieveSayings(q, { limit: 3 });
  const theme = (retrieved.themes && retrieved.themes[0]) || 'Peace';
  const pack = encouragementFor(theme) || encouragementFor('Peace');
  const sayings = (retrieved.sayings && retrieved.sayings.length)
    ? retrieved.sayings.slice(0, 3)
    : pack.passages.map((p) => ({ citation: p.verse, text: p.quote }));

  const lines = [pack.opening, ''];
  for (const saying of sayings) {
    const cite = saying.citation || saying.verse;
    const hit = pack.passages.find((p) => p.verse === cite);
    lines.push(`{{${cite}}}`);
    lines.push(hit?.context || 'These words still hold for the thing you named.');
    lines.push('');
  }
  if (pack.practice) lines.push(pack.practice);
  if (pack.closing) {
    lines.push('');
    lines.push(pack.closing);
  }
  return fillPlaceholders(lines.join('\n'));
}

module.exports = { adviseLetter };
