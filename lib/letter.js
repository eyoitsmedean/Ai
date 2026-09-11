/* Server side of the letterpress. The engine lives in data/letterpress.js so the
   static page runs the same one; here it is fed sayings hydrated from the corpus
   and rendered as placeholders that lib/scripture fills with canonical KJV. */
const press = require('../data/letterpress');
const { THEMES, COMMONS } = require('./curated');

function composeLetter(text, { history = [] } = {}) {
  const letter = press.composeLetter(text, { history, packs: THEMES, commons: COMMONS });
  return {
    theme: letter.theme,
    citations: letter.citations,
    crisis: Boolean(letter.crisis),
    text: press.renderLetter(letter, { placeholders: !letter.crisis }),
  };
}

module.exports = { composeLetter, citedBefore: press.citedBefore };
