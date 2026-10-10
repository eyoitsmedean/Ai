#!/usr/bin/env node
/**
 * Hand-reviewed corrections to data/red-letter-source.json.
 *
 * Found by comparing the map, verse by verse, with an independent red-letter
 * KJV (seven1m/open-bibles eng-kjv.osis.xml, <q who="Jesus">) and deciding
 * each disagreement against the KJV text itself. That witness has its own
 * slips (unclosed quotes run into narration; it colours others quoting him),
 * so nothing is taken from it without a reading.
 *
 * Run once, then `npm run spoken`. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'red-letter-source.json');
const KJV = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'gospels-kjv.json'), 'utf8')).books;

// Someone else is speaking, or it is narration.
const NOT_HIS = {
  'Matthew 15:33': 'the disciples',
  'Mark 4:2': 'narration',
  'Mark 5:43': 'narration (reported instruction)',
  'Mark 9:7': 'the voice from the cloud',
  'Mark 9:9': 'narration (reported instruction)',
  'Mark 16:6': 'the young man at the tomb',
  'Luke 13:14': 'the ruler of the synagogue',
  'Luke 24:32': 'the two disciples',
  'Luke 24:45': 'narration',
  'John 7:20': 'the people',
  'John 11:35': 'narration: "Jesus wept."',
  'John 16:17': 'the disciples among themselves',
};

// The whole verse is his: a parable or teaching he is telling, including the
// characters' lines and "he said" inside the story. Showing only the inner
// line put a servant's or a widow's words in his mouth.
const WHOLE_VERSE = [
  'Matthew 6:31', 'Matthew 10:7', 'Matthew 12:33', 'Matthew 13:28', 'Matthew 13:29',
  'Matthew 15:4', 'Matthew 18:26', 'Matthew 18:28', 'Matthew 18:29', 'Matthew 20:13',
  'Matthew 21:29', 'Matthew 21:30', 'Matthew 21:37', 'Matthew 22:4', 'Matthew 22:12',
  'Matthew 24:5', 'Matthew 25:9', 'Matthew 25:11', 'Matthew 25:12', 'Matthew 25:20',
  'Matthew 25:37', 'Matthew 25:44', 'Matthew 25:45', 'Matthew 26:2',
  'Mark 12:6', 'Mark 12:26', 'Mark 13:6', 'Mark 14:15',
  'Luke 5:37', 'Luke 5:38', 'Luke 5:39', 'Luke 7:35', 'Luke 8:5', 'Luke 8:6', 'Luke 8:7',
  'Luke 10:35', 'Luke 12:17', 'Luke 12:18', 'Luke 13:25', 'Luke 15:9', 'Luke 15:17',
  'Luke 15:27', 'Luke 15:31', 'Luke 16:6', 'Luke 16:7', 'Luke 16:27', 'Luke 16:30',
  'Luke 16:31', 'Luke 17:4', 'Luke 17:36', 'Luke 18:3', 'Luke 18:4', 'Luke 18:13',
  'Luke 19:14', 'Luke 19:16', 'Luke 19:17', 'Luke 19:18', 'Luke 19:19', 'Luke 19:20',
  'Luke 19:22', 'Luke 19:24', 'Luke 20:14', 'Luke 21:6', 'Luke 22:69',
];

// Only part of the verse is his. " … " marks words between two of his lines.
const HIS_WORDS = {
  'Matthew 8:3': 'I will; be thou clean.',
  'Matthew 8:32': 'Go.',
  'Matthew 15:10': 'Hear, and understand:',
  'Matthew 17:23': 'And they shall kill him, and the third day he shall be raised again.',
  'Matthew 21:25': 'The baptism of John, whence was it? from heaven, or of men?',
  'Matthew 21:31': 'Whether of them twain did the will of his father? … Verily I say unto you, That the publicans and the harlots go into the kingdom of God before you.',
  'Luke 2:49': "How is it that ye sought me? wist ye not that I must be about my Father's business?",
  'Luke 8:8': 'And other fell on good ground, and sprang up, and bare fruit an hundredfold. … He that hath ears to hear, let him hear.',
  'Luke 9:55': 'Ye know not what manner of spirit ye are of.',
  'Luke 20:23': 'Why tempt ye me?',
  'John 1:47': 'Behold an Israelite indeed, in whom is no guile!',
  'John 8:41': 'Ye do the deeds of your father.',
  'John 12:28': 'Father, glorify thy name.',
  'John 19:26': 'Woman, behold thy son!',
  'John 19:27': 'Behold thy mother!',
  'John 19:28': 'I thirst.',
  'John 20:21': 'Peace be unto you: as my Father hath sent me, even so send I you.',
  'John 21:15': 'Simon, son of Jonas, lovest thou me more than these? … Feed my lambs.',
  'John 21:16': 'Simon, son of Jonas, lovest thou me? … Feed my sheep.',
  'John 21:17': 'Simon, son of Jonas, lovest thou me? … Feed my sheep.',
};

function verse(cite) {
  const [book, cv] = cite.split(' ');
  const [c, v] = cv.split(':');
  const text = KJV[book]?.[c]?.[v];
  if (!text) throw new Error(`No KJV text for ${cite}`);
  return text;
}

const source = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const verses = source.verses;
for (const cite of Object.keys(NOT_HIS)) delete verses[cite];
for (const cite of WHOLE_VERSE) verses[cite] = verse(cite);
for (const [cite, words] of Object.entries(HIS_WORDS)) {
  verse(cite);
  verses[cite] = words;
}

// Keep canonical order so diffs stay readable.
const order = ['Matthew', 'Mark', 'Luke', 'John'];
const key = (c) => {
  const [b, cv] = c.split(' ');
  const [ch, v] = cv.split(':').map(Number);
  return [order.indexOf(b), ch, v];
};
source.verses = Object.fromEntries(
  Object.entries(verses).sort(([a], [b]) => {
    const [x, y] = [key(a), key(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  })
);
fs.writeFileSync(FILE, `${JSON.stringify(source, null, 1)}\n`);
console.log(`removed ${Object.keys(NOT_HIS).length}, whole-verse ${WHOLE_VERSE.length}, partial ${Object.keys(HIS_WORDS).length}; ${Object.keys(source.verses).length} verses`);
