'use strict';

const { retrieveSayings } = require('./retrieve');
const { lookup, looksLikeCrisis } = require('./scripture');
const { THEMES } = require('./curated');

const TRANSLATION = {
  id: 'KJV-1769',
  name: 'King James Version (1769)',
  label: 'KJV',
  jurisdiction: 'Public domain in the United States. Crown copyright still applies in the United Kingdom.',
};

const CANNOT = [
  'This is not a pastor, not a church, not a confession booth, and not a crisis counselor.',
  'This bot cannot replace a human who can sit with you, and it cannot speak words Jesus did not speak.',
].join(' ');

const HELPLINE = {
  us: 'If you are in crisis or thinking about harming yourself, call or text 988 (Suicide & Crisis Lifeline) right now.',
  world: 'Outside the United States, start at findahelpline.com for a local line.',
  url: 'https://findahelpline.com',
};

function clipMeaning(text, maxSentences = 4) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const parts = (raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [raw]).map((s) => s.trim());
  return parts.slice(0, maxSentences).join(' ');
}

function meaningFor(citation, themes) {
  const theme = themes && themes[0];
  const pack = theme && THEMES[theme];
  if (pack) {
    const match = pack.passages.find((p) => {
      const a = String(p.verse || '');
      const b = String(citation || '');
      return a === b || a.startsWith(b) || b.startsWith(a.split('–')[0]);
    });
    if (match && match.context) return clipMeaning(match.context);
    if (pack.opening) return clipMeaning(pack.opening);
  }
  return clipMeaning(
    'These words are offered as he spoke them. Sit with one sentence. This screen will not add a sermon on top.'
  );
}

function firstSealedSaying(question) {
  const retrieved = retrieveSayings(question, { limit: 6 });
  for (const saying of retrieved.sayings || []) {
    const hit = lookup(saying.citation);
    if (hit && hit.redLetter && hit.text) {
      return { hit, themes: retrieved.themes || [] };
    }
  }
  const fallback = lookup('Matthew 11:28');
  return { hit: fallback, themes: retrieved.themes || [] };
}

function answerAsk(question) {
  const q = String(question || '').trim();
  if (!q) {
    return { ok: false, error: 'Empty question.' };
  }
  if (q.length > 2000) {
    return { ok: false, error: 'Question is too long.' };
  }

  const crisis = looksLikeCrisis(q);
  const base = {
    ok: true,
    crisis,
    translation: TRANSLATION,
    cannot: CANNOT,
    helpline: HELPLINE,
    stopped: crisis,
  };

  if (crisis) {
    return {
      ...base,
      words: null,
      meaning: null,
    };
  }

  const { hit, themes } = firstSealedSaying(q);
  if (!hit) {
    return { ok: false, error: 'No sealed saying was available.' };
  }

  return {
    ...base,
    theme: themes[0] || null,
    words: {
      citation: hit.citation,
      quote: hit.text,
      translation: TRANSLATION.label,
    },
    meaning: meaningFor(hit.citation, themes),
  };
}

module.exports = {
  CANNOT,
  HELPLINE,
  TRANSLATION,
  answerAsk,
  clipMeaning,
};
