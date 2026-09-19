/**
 * Saying maker — a quiet motif from a sealed saying.
 *
 * The tune is not His. It is made from the words so a reader can sit with them.
 * A comma or stop is a breath. The last word of a phrase sits on E or A so the
 * motif can rest — that cadence is the maker's, not His.
 * Crisis and abuse never become music. Verses that are not His speech never open.
 */
const { lookup, looksLikeCrisis, verifyQuote } = require('./scripture');
const { composeAsk } = require('./ask');

const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
const SCALE_NAMES = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'];
const BPM = 72;
const DRONE = 220.0;

function hashWord(word) {
  let h = 2166136261;
  const s = String(word || '').toLowerCase();
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cleanWord(word) {
  return String(word || '').replace(/[^A-Za-z']+/g, '');
}

function tokensFromQuote(quote) {
  return String(quote || '').match(/[A-Za-z']+|[,.;:!?]/g) || [];
}

function cadenceLast(notes, close) {
  for (let i = notes.length - 1; i >= 0; i -= 1) {
    if (notes[i].kind !== 'tone') continue;
    const degree = close ? 0 : 3;
    notes[i].degree = degree;
    notes[i].hz = SCALE[degree];
    notes[i].name = SCALE_NAMES[degree];
    notes[i].beats += close ? 0.5 : 0.25;
    return;
  }
}

function notesFromQuote(quote) {
  const tokens = tokensFromQuote(quote);
  const notes = [];
  let phrase = 0;
  let toneIndex = 0;
  for (const tok of tokens) {
    if (/^[,.;:!?]$/.test(tok)) {
      const close = /[.!?]/.test(tok);
      cadenceLast(notes, close);
      notes.push({
        word: '',
        hz: 0,
        beats: close ? 1 : 0.5,
        name: '',
        degree: -1,
        phrase,
        kind: 'rest',
      });
      phrase += 1;
      continue;
    }
    const word = cleanWord(tok);
    if (!word) continue;
    const h = hashWord(word + ':' + toneIndex);
    const degree = h % SCALE.length;
    notes.push({
      word,
      hz: SCALE[degree],
      beats: 0.75 + ((word.length + (h % 3)) % 4) * 0.25,
      name: SCALE_NAMES[degree],
      degree,
      phrase,
      kind: 'tone',
    });
    toneIndex += 1;
  }
  if (notes.length && notes[notes.length - 1].kind === 'tone') {
    cadenceLast(notes, true);
  }
  return notes;
}

function tonesOf(notes) {
  return (notes || []).filter((n) => n.kind === 'tone');
}

function motifFromRef(ref) {
  const raw = String(ref || '').trim();
  if (!raw) return { ok: false, stop: false, error: 'empty', notes: [], bpm: BPM };
  if (looksLikeCrisis(raw)) return motifFromAsk(raw);
  const hit = lookup(raw);
  if (!hit || !hit.redLetter || !hit.text) {
    return { ok: false, stop: false, error: 'not-his', notes: [], bpm: BPM };
  }
  const sealed = verifyQuote(hit.citation, hit.text);
  if (!sealed.ok || sealed.score < 0.92) {
    return { ok: false, stop: false, error: 'unsealed', notes: [], bpm: BPM };
  }
  const notes = notesFromQuote(hit.text);
  const last = notes[notes.length - 1];
  return {
    ok: true,
    stop: false,
    citation: hit.citation,
    quote: hit.text,
    edition: 'KJV 1769',
    notes,
    bpm: BPM,
    drone: DRONE,
    phrases: last ? last.phrase + 1 : 0,
    scale: 'A minor pentatonic',
    cannot: 'This tune is not His. It is made from the words so you can sit with them. A breath and a rest are the maker\'s. This page is not a hymnbook and not a launch.',
  };
}

function motifFromAsk(text) {
  const raw = String(text || '').trim();
  if (!raw) return { ok: false, stop: false, error: 'empty', notes: [], bpm: BPM };
  const asked = composeAsk(raw);
  if (asked.stop) {
    return {
      ok: false,
      stop: true,
      kind: asked.kind,
      citation: '',
      quote: '',
      notes: [],
      bpm: BPM,
      drone: DRONE,
      phrases: 0,
      scale: 'A minor pentatonic',
      handoff: asked.handoff,
      cannot: asked.cannot,
    };
  }
  if (!asked.citation || !asked.quote) {
    return { ok: false, stop: false, error: 'no-saying', notes: [], bpm: BPM };
  }
  return motifFromRef(asked.citation);
}

module.exports = {
  SCALE,
  SCALE_NAMES,
  BPM,
  DRONE,
  hashWord,
  notesFromQuote,
  tokensFromQuote,
  tonesOf,
  motifFromRef,
  motifFromAsk,
};
