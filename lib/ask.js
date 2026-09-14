'use strict';

const { retrieveSayings, guessThemes } = require('./retrieve');
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

const OFF_SCOPE = /\b(paul|saul of tarsus|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james the epistle|1 peter|2 peter|jude|revelation|genesis|exodus|leviticus|deuteronomy|psalm|proverbs|isaiah|jeremiah|quran|koran)\b|\b(are you jesus|you are jesus|pretend(?:ing)? to be jesus|channel jesus|talk as jesus|chatbot pretending)\b|\b(who should i vote|democrat|republican|political party|vote for|sow a seed|prosperity gospel|name it and claim)\b|\b(what is the weather|write my resume|tell me a joke)\b|\b(stop taking my|skip chemo|leave my husband|antidepressant)\b/i;

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

function offScopeReason(question) {
  const q = String(question || '');
  if (/\b(are you jesus|you are jesus|pretend to be jesus|channel jesus|talk as jesus)\b/i.test(q)) {
    return 'I am software. I will not speak as if I were Him.';
  }
  if (/\b(who should i vote|democrat|republican|political party|vote for)\b/i.test(q)) {
    return 'I will not make Him a political mascot.';
  }
  if (/\b(sow a seed|prosperity gospel|name it and claim)\b/i.test(q)) {
    return 'I will not lay a prosperity overlay on His words.';
  }
  if (/\b(what is the weather|write my resume|tell me a joke)\b/i.test(q)) {
    return 'That is not a weight I keep His words for. This screen can stay quiet.';
  }
  if (/\b(stop taking my|skip chemo|leave my husband|antidepressant)\b/i.test(q)) {
    return 'I will not give medical or legal advice. Ask a human who is responsible for that decision.';
  }
  if (/\b(quran|koran)\b/i.test(q)) {
    return 'I only keep the words Jesus spoke in Matthew, Mark, Luke, and John.';
  }
  return 'I only keep the words Jesus spoke in Matthew, Mark, Luke, and John. I will not answer from Paul, or from another book.';
}

function firstSealedSaying(question) {
  const themes = guessThemes(question);
  const retrieved = retrieveSayings(question, { limit: 6, allowEmpty: true });
  for (const saying of retrieved.sayings || []) {
    const hit = lookup(saying.citation);
    if (hit && hit.redLetter && hit.text) {
      return { hit, themes: retrieved.themes || themes, unmatched: false };
    }
  }
  return { hit: null, themes: retrieved.themes || themes, unmatched: true };
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
    unmatched: false,
    reason: null,
  };

  if (crisis) {
    return { ...base, words: null, meaning: null };
  }

  if (OFF_SCOPE.test(q)) {
    return {
      ...base,
      unmatched: true,
      reason: offScopeReason(q),
      words: null,
      meaning: null,
    };
  }

  const { hit, themes, unmatched } = firstSealedSaying(q);
  if (unmatched || !hit) {
    return {
      ...base,
      unmatched: true,
      reason: 'None of the sealed sayings answered that. This screen can stay quiet. Ask what you are carrying, or sit.',
      words: null,
      meaning: null,
    };
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
  OFF_SCOPE,
  TRANSLATION,
  answerAsk,
  clipMeaning,
};
