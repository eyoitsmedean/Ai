'use strict';

const { lookup, verifyQuote } = require('./scripture');

/**
 * The Concordance of Need.
 * Eighty human sentences. One sealed red-letter each.
 * This is the IP — not more Jesus content, a map from life onto a small corpus.
 */
const NEEDS = [
  { id: 'anxious-tomorrow', carry: 'I cannot sleep because tomorrow is already here', verse: 'Matthew 6:34', theme: 'Anxiety & Worry' },
  { id: 'anxious-spiral', carry: 'My mind will not stop turning', verse: 'Matthew 6:25', theme: 'Anxiety & Worry' },
  { id: 'anxious-enough', carry: 'I am carrying Tuesday on Monday', verse: 'Matthew 6:34', theme: 'Anxiety & Worry' },
  { id: 'anxious-lilies', carry: 'I am afraid there will not be enough', verse: 'Matthew 6:28', theme: 'Anxiety & Worry' },
  { id: 'anxious-one-day', carry: 'The whole week is sitting on my chest', verse: 'Matthew 6:34', theme: 'Anxiety & Worry' },
  { id: 'overwhelmed', carry: 'I feel overwhelmed and I cannot start', verse: 'Matthew 11:28', theme: 'Anxiety & Worry' },
  { id: 'heavy-laden', carry: 'I am so tired I cannot pray', verse: 'Matthew 11:28', theme: 'Anxiety & Worry' },
  { id: 'restless', carry: 'I cannot rest even when the house is quiet', verse: 'Matthew 11:29', theme: 'Peace' },
  { id: 'fear-future', carry: 'I am afraid of the future', verse: 'John 14:1', theme: 'Fear' },
  { id: 'fear-waves', carry: 'The next thing feels bigger than I am', verse: 'Matthew 14:27', theme: 'Fear' },
  { id: 'fear-night', carry: 'I am scared and I do not want to be alone with it', verse: 'John 14:18', theme: 'Fear' },
  { id: 'fear-storm', carry: 'Everything is loud and I want it to stop', verse: 'Mark 4:39', theme: 'Fear' },
  { id: 'fear-little-flock', carry: 'I feel small in a room that is too big', verse: 'Luke 12:32', theme: 'Fear' },
  { id: 'fear-death', carry: 'I am afraid of dying', verse: 'John 11:25', theme: 'Fear' },
  { id: 'peace-troubled', carry: 'My heart will not be still', verse: 'John 14:27', theme: 'Peace' },
  { id: 'peace-world', carry: 'The world offered me a pause and it did not hold', verse: 'John 14:27', theme: 'Peace' },
  { id: 'peace-be-still', carry: 'I need a word that can sit in a storm', verse: 'Mark 4:39', theme: 'Peace' },
  { id: 'shame-room', carry: 'I thought I had to leave the room', verse: 'John 8:11', theme: 'Shame & Guilt' },
  { id: 'shame-face', carry: 'I cannot lift my face', verse: 'John 8:11', theme: 'Shame & Guilt' },
  { id: 'shame-worst', carry: 'I am my worst hour', verse: 'Luke 15:20', theme: 'Shame & Guilt' },
  { id: 'guilt-undone', carry: 'I keep replaying what I did', verse: 'John 8:11', theme: 'Shame & Guilt' },
  { id: 'guilt-unworthy', carry: 'I am not worthy of being here', verse: 'Luke 15:21', theme: 'Shame & Guilt' },
  { id: 'forgive-cannot', carry: 'I cannot forgive them', verse: 'Matthew 6:14', theme: 'Forgiveness' },
  { id: 'forgive-seventy', carry: 'They did it again and I am empty', verse: 'Matthew 18:22', theme: 'Forgiveness' },
  { id: 'forgive-enemy', carry: 'I hate someone I used to love', verse: 'Matthew 5:44', theme: 'Forgiveness' },
  { id: 'forgive-self', carry: 'I cannot forgive myself', verse: 'John 8:11', theme: 'Shame & Guilt' },
  { id: 'forgive-work', carry: 'Mercy feels like work I do not have', verse: 'Matthew 5:7', theme: 'Forgiveness' },
  { id: 'grief-dad', carry: 'Someone I love has died and I do not know how to pray', verse: 'John 11:25', theme: 'Grief & Loss' },
  { id: 'grief-tears', carry: 'I am tired of being told to be strong', verse: 'Matthew 5:4', theme: 'Grief & Loss' },
  { id: 'grief-empty', carry: 'The chair is empty and the day keeps going', verse: 'John 14:18', theme: 'Grief & Loss' },
  { id: 'grief-why', carry: 'I do not understand why this happened', verse: 'John 11:25', theme: 'Grief & Loss' },
  { id: 'lonely-unseen', carry: 'I feel invisible in my own life', verse: 'Matthew 10:29', theme: 'Loneliness' },
  { id: 'lonely-friend', carry: 'I do not have anyone to tell this to', verse: 'John 15:15', theme: 'Loneliness' },
  { id: 'lonely-left', carry: 'Everyone left and I am still here', verse: 'John 14:18', theme: 'Loneliness' },
  { id: 'lonely-crowd', carry: 'I am in a crowded room and still alone', verse: 'Matthew 28:20', theme: 'Loneliness' },
  { id: 'conflict-spouse', carry: 'We cannot stop hurting each other', verse: 'Matthew 5:23', theme: 'Conflict & Relationships' },
  { id: 'conflict-altar', carry: 'I am supposed to worship and I am angry', verse: 'Matthew 5:24', theme: 'Conflict & Relationships' },
  { id: 'conflict-enemy', carry: 'They became my enemy', verse: 'Matthew 5:44', theme: 'Conflict & Relationships' },
  { id: 'conflict-judge', carry: 'I keep rehearsing my case against them', verse: 'Matthew 7:1', theme: 'Conflict & Relationships' },
  { id: 'purpose-lost', carry: 'I do not know what I am for', verse: 'Matthew 5:14', theme: 'Purpose & Direction' },
  { id: 'purpose-map', carry: 'I want the whole map before I take a step', verse: 'Matthew 6:33', theme: 'Purpose & Direction' },
  { id: 'purpose-follow', carry: 'I do not know what the next yes is', verse: 'Matthew 4:19', theme: 'Purpose & Direction' },
  { id: 'purpose-hidden', carry: 'I feel like I am wasting the one life I have', verse: 'Matthew 5:16', theme: 'Purpose & Direction' },
  { id: 'doubt-real', carry: 'I am not sure I believe any of this', verse: 'John 20:27', theme: 'Faith & Doubt' },
  { id: 'doubt-touch', carry: 'I need to see it or I cannot stay', verse: 'John 20:27', theme: 'Faith & Doubt' },
  { id: 'doubt-where', carry: 'Where is God in this', verse: 'John 14:9', theme: 'Faith & Doubt' },
  { id: 'doubt-left-church', carry: 'I left church and I am still looking for Jesus', verse: 'Matthew 11:28', theme: 'Faith & Doubt' },
  { id: 'doubt-not-christian', carry: 'I am not a Christian. Can I still sit with this', verse: 'John 6:37', theme: 'Faith & Doubt' },
  { id: 'suffer-body', carry: 'My body hurts and the words feel far', verse: 'Matthew 11:28', theme: 'Suffering & Pain' },
  { id: 'suffer-tribulation', carry: 'This pain does not feel like a lesson', verse: 'John 16:33', theme: 'Suffering & Pain' },
  { id: 'suffer-sick', carry: 'I am sick and I am afraid of the scan', verse: 'Mark 5:36', theme: 'Suffering & Pain' },
  { id: 'suffer-why-me', carry: 'Why me', verse: 'John 16:33', theme: 'Suffering & Pain' },
  { id: 'hope-gone', carry: 'I cannot see a way through', verse: 'John 16:33', theme: 'Hope' },
  { id: 'hope-cheer', carry: 'I have nothing cheerful to say', verse: 'John 16:33', theme: 'Hope' },
  { id: 'hope-joy', carry: 'I want a joy nobody can take', verse: 'John 16:22', theme: 'Hope' },
  { id: 'hope-light', carry: 'It is dark and I need a sentence that stays', verse: 'John 8:12', theme: 'Hope' },
  { id: 'hunger', carry: 'I am empty and I keep filling it with the wrong things', verse: 'John 6:35', theme: 'Hope' },
  { id: 'thirst', carry: 'Nothing I drink stays', verse: 'John 4:14', theme: 'Hope' },
  { id: 'abide', carry: 'I keep leaving and I want to stay', verse: 'John 15:4', theme: 'Faith & Doubt' },
  { id: 'apart', carry: 'I tried to do this alone and I cannot', verse: 'John 15:5', theme: 'Loneliness' },
  { id: 'love-as', carry: 'I do not know how to love the person in front of me', verse: 'John 13:34', theme: 'Conflict & Relationships' },
  { id: 'love-enemy', carry: 'You cannot mean I have to love them', verse: 'Matthew 5:44', theme: 'Forgiveness' },
  { id: 'children', carry: 'I do not know how to talk to my child about this', verse: 'Mark 10:14', theme: 'Conflict & Relationships' },
  { id: 'money-worry', carry: 'The bills are louder than anything else', verse: 'Matthew 6:31', theme: 'Anxiety & Worry' },
  { id: 'work-weary', carry: 'Work has taken the whole person', verse: 'Matthew 11:28', theme: 'Anxiety & Worry' },
  { id: 'decision', carry: 'I have a decision and I am frozen', verse: 'Matthew 7:7', theme: 'Purpose & Direction' },
  { id: 'ask', carry: 'I do not even know what to ask for', verse: 'Matthew 7:7', theme: 'Purpose & Direction' },
  { id: 'knock', carry: 'I have been knocking and the door is still shut', verse: 'Matthew 7:7', theme: 'Hope' },
  { id: 'judge-self', carry: 'I am harsher with myself than anyone else is', verse: 'Matthew 7:1', theme: 'Shame & Guilt' },
  { id: 'meek', carry: 'Everyone told me to fight harder', verse: 'Matthew 5:5', theme: 'Peace' },
  { id: 'poor-spirit', carry: 'I have nothing spiritually left to offer', verse: 'Matthew 5:3', theme: 'Hope' },
  { id: 'persecuted', carry: 'Doing the right thing cost me the room', verse: 'Matthew 5:10', theme: 'Suffering & Pain' },
  { id: 'secret', carry: 'I have a secret I cannot tell the people I sit with', verse: 'Matthew 6:6', theme: 'Loneliness' },
  { id: 'seen', carry: 'Does anyone see what this is costing me', verse: 'Matthew 6:6', theme: 'Loneliness' },
  { id: 'tomorrow-evil', carry: 'Today already has enough evil in it', verse: 'Matthew 6:34', theme: 'Anxiety & Worry' },
  { id: 'yoke', carry: 'I need a lighter way to carry this', verse: 'Matthew 11:30', theme: 'Anxiety & Worry' },
  { id: 'learn', carry: 'I do not know how to be taught anymore', verse: 'Matthew 11:29', theme: 'Faith & Doubt' },
  { id: 'come', carry: 'I do not know if I am allowed to come as I am', verse: 'Matthew 11:28', theme: 'Shame & Guilt' },
  { id: 'condemn', carry: 'I am waiting for the sentence against me', verse: 'John 8:11', theme: 'Shame & Guilt' },
  { id: 'life', carry: 'I want a life that is actually life', verse: 'John 10:10', theme: 'Hope' },
  { id: 'resurrection', carry: 'This feels like a tomb and I am still in it', verse: 'John 11:25', theme: 'Grief & Loss' },
  { id: 'hands', carry: 'I need to leave this in someone else’s hands before I sleep', verse: 'Luke 23:46', theme: 'Peace' },
  { id: 'thief', carry: 'I wasted years and I want the last hour to count', verse: 'Luke 23:43', theme: 'Hope' },
  { id: 'father-forgive', carry: 'I want to forgive them and I do not feel it yet', verse: 'Luke 23:34', theme: 'Forgiveness' },
  { id: 'little-faith', carry: 'My faith feels smaller than the weather', verse: 'Matthew 8:26', theme: 'Faith & Doubt' },
  { id: 'follow-cost', carry: 'I am afraid of what following would cost', verse: 'Matthew 16:24', theme: 'Purpose & Direction' },
  { id: 'children-kingdom', carry: 'I feel too late and too complicated to begin', verse: 'Mark 10:15', theme: 'Faith & Doubt' },
  { id: 'one-thing', carry: 'I have too many things and I have lost the one thing', verse: 'Luke 10:42', theme: 'Purpose & Direction' },
];

function hydrateNeed(row) {
  const hit = lookup(row.verse);
  const verified = hit ? verifyQuote(hit.citation, hit.text) : { ok: false };
  return {
    id: row.id,
    carry: row.carry,
    theme: row.theme,
    verse: (hit && hit.citation) || row.verse,
    quote: (hit && hit.text) || '',
    ok: Boolean(hit && verified.ok && hit.text),
  };
}

function allNeeds() {
  return NEEDS.map(hydrateNeed);
}

function sealedNeeds() {
  return allNeeds().filter((row) => row.ok);
}

const STOP = new Set([
  'the', 'and', 'for', 'you', 'your', 'that', 'this', 'with', 'from', 'have',
  'not', 'but', 'are', 'was', 'feel', 'felt', 'just', 'really', 'very', 'like',
  'been', 'being', 'they', 'them', 'cannot', 'dont', "don't",
]);

const GRAVITY = [
  [/\b(shame|ashamed|condemn|lift my face|leave the room)\b/i, /John 8:11/, 28],
  [/\b(died|death|grief|grieve|mourn|funeral|tomb)\b/i, /John 11:25/, 22],
  [/\b(tomorrow|cannot sleep|can't sleep|cant sleep|already here)\b/i, /Matthew 6:34/, 22],
  [/\b(cannot forgive|can't forgive|cant forgive|forgive them)\b/i, /Matthew 6:14/, 18],
  [/\b(afraid of the future|heart be troubled)\b/i, /John 14:1/, 16],
];

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function matchNeed(query, { limit = 6 } = {}) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const qTokens = tokens(q);
  const scored = [];
  for (const row of sealedNeeds()) {
    let score = 0;
    const hay = `${row.carry} ${row.theme} ${row.quote}`.toLowerCase();
    if (hay.includes(q) || q.includes(row.carry.toLowerCase())) score += 20;
    for (const t of qTokens) {
      if (row.carry.toLowerCase().includes(t)) score += 6;
      if (row.theme.toLowerCase().includes(t)) score += 3;
      if (row.quote.toLowerCase().includes(t)) score += 1;
    }
    for (const [re, verse, boost] of GRAVITY) {
      if (re.test(q) && verse.test(row.verse)) score += boost;
    }
    if (score > 0) scored.push({ ...row, score });
  }
  scored.sort((a, b) => b.score - a.score || a.carry.localeCompare(b.carry));
  const out = [];
  const seen = new Set();
  for (const row of scored) {
    const key = row.verse + '|' + row.carry;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

function bestNeed(query) {
  return matchNeed(query, { limit: 1 })[0] || null;
}

function formatNeedLetter(row) {
  if (!row) return '';
  return [
    'I hear what you are carrying. Before advice, a sentence He actually spoke.',
    '',
    `**${row.verse}**`,
    `“${row.quote}”`,
    'This is the word the concordance keeps for that sentence.',
    '',
    'Sit with this. The page can close.',
  ].join('\n');
}

module.exports = {
  NEEDS,
  allNeeds,
  sealedNeeds,
  matchNeed,
  bestNeed,
  formatNeedLetter,
  hydrateNeed,
};
