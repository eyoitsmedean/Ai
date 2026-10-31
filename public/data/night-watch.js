/* Night office: keep the saying they already received today.
   Shared with Node tests. The page paints Compline from this pick. */
(function (root) {
  const REST = {
    verse: 'Matthew 11:28',
    quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
  };

  function padDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Before 6am the night is still last evening's watch.
  function watchDates(now) {
    const d = now instanceof Date ? now : new Date(now || Date.now());
    const today = padDate(d);
    if (d.getHours() < 6) {
      const y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
      return { today, lastNight: padDate(y) };
    }
    return { today, lastNight: today };
  }

  function inWatch(date, dates) {
    const day = String(date || '').slice(0, 10);
    return !!day && (day === dates.today || day === dates.lastNight);
  }

  function extractFirstSaying(text) {
    const raw = String(text || '');
    const verseM = raw.match(/\*\*((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[–\-]\d+)?)\*\*/i)
      || raw.match(/((?:Matthew|Mark|Luke|John)\s+\d+:\d+(?:[–\-]\d+)?)/);
    if (!verseM) return null;
    const quoteM = raw.match(/[“"]([^”"]{12,})[”"]/);
    return { verse: verseM[1], quote: quoteM ? quoteM[1].trim() : '' };
  }

  function pickNightWatch(input) {
    const src = input || {};
    const dates = watchDates(src.now);
    const unsafe = typeof src.unsafeSaying === 'function' ? src.unsafeSaying : function () { return false; };
    const crisisKind = src.crisisKind || null;
    const candidates = [];
    const sit = src.sit;
    if (sit && inWatch(sit.date, dates) && sit.quote && sit.verse) {
      candidates.push({ verse: sit.verse, quote: sit.quote, source: 'sit' });
    }
    const letter = src.letter;
    if (letter && inWatch(letter.date, dates) && letter.quote && letter.verse) {
      candidates.push({ verse: letter.verse, quote: letter.quote, source: 'letter' });
    }
    const daily = src.daily;
    if (daily && daily.verse && daily.quote) {
      candidates.push({ verse: daily.verse, quote: daily.quote, source: 'daily' });
    }
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (crisisKind && unsafe(crisisKind, c.quote)) continue;
      return { verse: c.verse, quote: c.quote, source: c.source };
    }
    return { verse: REST.verse, quote: REST.quote, source: 'rest' };
  }

  const api = { pickNightWatch, extractFirstSaying, watchDates, REST };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RLA_NIGHT_WATCH = api;
})(typeof self !== 'undefined' ? self : this);
