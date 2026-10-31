/**
 * Night card — seven sealed sayings, one for each local weekday.
 * For a parent who is already up. Not a hymn. Not a launch.
 * Quotes are His speech only (KJV). Tests seal every line.
 */
(function (root) {
  const CARDS = [
    { verse: 'John 14:27', quote: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
    { verse: 'Matthew 11:28', quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
    { verse: 'Matthew 6:34', quote: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.' },
    { verse: 'John 16:33', quote: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.' },
    { verse: 'Luke 12:32', quote: 'Fear not, little flock; for it is your Father\'s good pleasure to give you the kingdom.' },
    { verse: 'Matthew 19:14', quote: 'Suffer little children, and forbid them not, to come unto me: for of such is the kingdom of heaven.' },
    { verse: 'John 14:18', quote: 'I will not leave you comfortless: I will come to you.' },
  ];

  function norm(ref) {
    return String(ref || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function cardForDate(date) {
    const d = date instanceof Date ? date : new Date();
    return CARDS[d.getDay()];
  }

  function cardFromRef(ref) {
    const want = norm(ref);
    if (!want || want === '1' || want === 'true' || want === 'yes') return null;
    return CARDS.find((c) => norm(c.verse) === want) || null;
  }

  const api = { CARDS, cardForDate, cardFromRef };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RLA_NIGHT_CARD = api;
})(typeof window !== 'undefined' ? window : globalThis);
