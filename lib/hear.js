/**
 * Hearing desk: sealed KJV from the live corpus beside WEBU lines opened this cycle.
 * Does not switch the corpus. Bearing: C9, C4
 */
const fs = require('fs');
const path = require('path');
const { spokenLookup } = require('./scripture');

const DESK = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hearing-desk.json'), 'utf8'));

function hearingDesk() {
  return {
    watch: true,
    opened: DESK.opened,
    note: DESK.note,
    translation_live: 'KJV',
    verses: DESK.verses.map((row) => {
      const sealed = spokenLookup(row.ref);
      return {
        ref: row.ref,
        kjv: sealed ? sealed.text : null,
        kjv_ok: Boolean(sealed),
        webu: row.webu || null,
        webu_url: row.webu_url || null,
        note: row.note || '',
      };
    }),
  };
}

module.exports = { hearingDesk };
