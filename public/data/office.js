/**
 * This hour's office, and the one saying Hear may speak.
 * The page and the tests load the same file so the spoken line cannot
 * drift from the hour names on Today.
 *
 * Hear may speak only His words. Not the pastoral line, not the verse
 * label, not the hour's name, not a vespers prompt.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RLA_OFFICE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function hours(d) {
    return (d instanceof Date ? d : new Date()).getHours();
  }

  function isNightOffice(d) {
    var h = hours(d);
    return h >= 21 || h < 6;
  }

  function isEveningOffice(d) {
    var h = hours(d);
    return h >= 17 || h < 6;
  }

  function officeName(d) {
    if (isNightOffice(d)) return 'Compline';
    if (isEveningOffice(d)) return 'Vespers';
    return hours(d) < 12 ? 'Morning' : 'Afternoon';
  }

  function spokenOnly(text) {
    return String(text || '').replace(/[“”]/g, '').trim();
  }

  // In the evening the office is the Vespers card's saying when the page
  // passes it (that card never closes the day on tribulation); the day's
  // word is the fallback when it does not.
  function pickOfficeSaying(daily, d, eveningSaying) {
    var evening = isEveningOffice(d);
    if (evening && eveningSaying && eveningSaying.quote) {
      return {
        card: 'vespers',
        quote: spokenOnly(eveningSaying.quote),
        verse: eveningSaying.verse || '',
        office: officeName(d),
      };
    }
    if (evening && daily && daily.word && daily.word.passage) {
      return {
        card: 'word',
        quote: spokenOnly(daily.word.passage),
        verse: daily.word.verse || '',
        office: officeName(d),
      };
    }
    if (daily && daily.affirmation && daily.affirmation.quote) {
      return {
        card: 'aff',
        quote: spokenOnly(daily.affirmation.quote),
        verse: daily.affirmation.verse || '',
        office: officeName(d),
      };
    }
    return { card: '', quote: '', verse: '', office: officeName(d) };
  }

  function officeScript(daily, d, eveningSaying) {
    return pickOfficeSaying(daily, d, eveningSaying).quote;
  }

  return {
    isEveningOffice: isEveningOffice,
    isNightOffice: isNightOffice,
    officeName: officeName,
    officeScript: officeScript,
    pickOfficeSaying: pickOfficeSaying,
    spokenOnly: spokenOnly,
  };
});
