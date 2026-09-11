// Offline and error letters. Same allow-list the model would have seen,
// printed as placeholders so verifyAndSubstitute inserts corpus speech.
const FALLBACK_OPEN = 'I am here with you, and I will not rush past what you just named.';

function letterFromSayings(sayings) {
  const picks = (sayings || []).filter((s) => s && s.citation).slice(0, 2);
  if (!picks.length) {
    return [
      FALLBACK_OPEN,
      '',
      '{{John 14:27}}',
      'These words meet a troubled heart without asking it to perform calm first.',
      '',
      '{{Matthew 11:28}}',
      'The invitation is for the exhausted — including this moment.',
      '',
      'Sit with these two sentences. You do not have to solve the whole day.',
    ].join('\n');
  }
  const lines = [FALLBACK_OPEN, ''];
  for (const s of picks) {
    lines.push(`{{${s.citation}}}`);
    lines.push('These words are offered for this moment.');
    lines.push('');
  }
  lines.push(picks.length === 1
    ? 'Sit with this sentence. You do not have to solve the whole day.'
    : 'Sit with these two sentences. You do not have to solve the whole day.');
  return lines.join('\n');
}

module.exports = { FALLBACK_OPEN, letterFromSayings };
