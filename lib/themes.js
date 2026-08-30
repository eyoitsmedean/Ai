const { parseRef } = require('./scripture');
const { THEMES, themeNames } = require('./curated');

const KEYWORDS = {
  'Anxiety & Worry': ['take no thought', 'sufficient unto the day'],
  'Grief & Loss': ['blessed are they that mourn', 'ye shall be sorrowful'],
  'Forgiveness': ['forgive, and ye shall be forgiven', 'love your enemies', 'be ye therefore merciful'],
  Loneliness: ['leave you comfortless', 'i am with you alway', 'continue ye in my love'],
  'Conflict & Relationships': ['pray for them which despitefully', 'lay down his life for his friends'],
  Fear: ['fear not, little flock', 'be not afraid, only believe', 'hairs of your head'],
  'Purpose & Direction': ['ye are the light of the world', 'seek ye first the kingdom', 'i am the light of the world'],
  'Faith & Doubt': ['have not seen, and yet have believed', 'labour and are heavy laden'],
  'Suffering & Pain': ['ye shall have tribulation', 'be of good cheer'],
  'Shame & Guilt': ['go after that which is lost', 'joy shall be in heaven', 'i am the bread of life'],
  Peace: ['peace i leave with you', 'peace, be still', 'not as the world giveth'],
  Hope: ['your joy no man taketh', 'that your joy might be full'],
};

let _cites = null;

function themeCitations() {
  if (_cites) return _cites;
  _cites = {};
  for (const name of themeNames()) {
    _cites[name] = (THEMES[name].passages || []).map((p) => p.verse);
  }
  return _cites;
}

function sayingTouchesCitation(saying, citation) {
  const parsed = parseRef(citation);
  if (!parsed || parsed.book !== saying.book || Number(saying.chapter) !== parsed.chapter) return false;
  return saying.start <= parsed.end && saying.end >= parsed.start;
}

function themesForSaying(saying) {
  if (!saying) return [];
  const hay = String(saying.text || '').toLowerCase();
  const cites = themeCitations();
  const hits = [];
  for (const name of themeNames()) {
    const byCite = (cites[name] || []).some((c) => sayingTouchesCitation(saying, c));
    const byWord = (KEYWORDS[name] || []).some((w) => hay.includes(w));
    if (byCite || byWord) hits.push(name);
  }
  return hits;
}

function isKnownTheme(name) {
  return themeNames().includes(String(name || ''));
}

module.exports = {
  KEYWORDS,
  isKnownTheme,
  sayingTouchesCitation,
  themeCitations,
  themesForSaying,
};
