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
  'John 21:15': 'Simon, son of Jonas, lovest thou me more than these? … Feed my lambs.',
  'John 21:16': 'Simon, son of Jonas, lovest thou me? … Feed my sheep.',
  'John 21:17': 'Simon, son of Jonas, lovest thou me? … Feed my sheep.',
  // Narration the extractor left in front of, or inside, his words.
  'Mark 2:10': 'But that ye may know that the Son of man hath power on earth to forgive sins,',
  'Mark 3:23': 'How can Satan cast out Satan?',
  'Mark 3:34': 'Behold my mother and my brethren!',
  'Mark 5:30': 'Who touched my clothes?',
  'Mark 7:6': 'Well hath Esaias prophesied of you hypocrites, as it is written, This people honoureth me with their lips, but their heart is far from me.',
  'Mark 8:12': 'Why doth this generation seek after a sign? verily I say unto you, There shall no sign be given unto this generation.',
  'Mark 8:17': 'Why reason ye, because ye have no bread? perceive ye not yet, neither understand? have ye your heart yet hardened?',
  'Mark 8:19': 'When I brake the five loaves among five thousand, how many baskets full of fragments took ye up?',
  'Mark 8:20': 'And when the seven among four thousand, how many baskets full of fragments took ye up?',
  'Mark 9:19': 'O faithless generation, how long shall I be with you? how long shall I suffer you? bring him unto me.',
  'Mark 9:31': 'The Son of man is delivered into the hands of men, and they shall kill him; and after that he is killed, he shall rise the third day.',
  'Mark 9:35': 'If any man desire to be first, the same shall be last of all, and servant of all.',
  'Mark 10:14': 'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.',
  'Mark 10:21': 'One thing thou lackest: go thy way, sell whatsoever thou hast, and give to the poor, and thou shalt have treasure in heaven: and come, take up the cross, and follow me.',
  'Mark 10:23': 'How hardly shall they that have riches enter into the kingdom of God!',
  'Mark 10:24': 'Children, how hard is it for them that trust in riches to enter into the kingdom of God!',
  'Mark 10:27': 'With men it is impossible, but not with God: for with God all things are possible.',
  'Mark 10:42': 'Ye know that they which are accounted to rule over the Gentiles exercise lordship over them; and their great ones exercise authority upon them.',
  'Mark 11:2': 'Go your way into the village over against you: and as soon as ye be entered into it, ye shall find a colt tied, whereon never man sat; loose him, and bring him.',
  'Mark 11:17': 'Is it not written, My house shall be called of all nations the house of prayer? but ye have made it a den of thieves.',
  'Mark 11:22': 'Have faith in God.',
  'Mark 12:1': 'A certain man planted a vineyard, and set an hedge about it, and digged a place for the winefat, and built a tower, and let it out to husbandmen, and went into a far country.',
  'Mark 12:24': 'Do ye not therefore err, because ye know not the scriptures, neither the power of God?',
  'Mark 12:37': 'David therefore himself calleth him Lord; and whence is he then his son?',
  'Mark 12:43': 'Verily I say unto you, That this poor widow hath cast more in, than all they which have cast into the treasury:',
  'Mark 13:5': 'Take heed lest any man deceive you:',
  'Mark 14:13': 'Go ye into the city, and there shall meet you a man bearing a pitcher of water: follow him.',
  'Matthew 9:6': 'But that ye may know that the Son of man hath power on earth to forgive sins, … Arise, take up thy bed, and go unto thine house.',
  'Matthew 9:37': 'The harvest truly is plenteous, but the labourers are few;',
  'Matthew 11:7': 'What went ye out into the wilderness to see? A reed shaken with the wind?',
  'Matthew 12:25': 'Every kingdom divided against itself is brought to desolation; and every city or house divided against itself shall not stand:',
  'Matthew 12:49': 'Behold my mother and my brethren!',
  'Matthew 13:11': 'Because it is given unto you to know the mysteries of the kingdom of heaven, but to them it is not given.',
  'Matthew 13:33': 'The kingdom of heaven is like unto leaven, which a woman took, and hid in three measures of meal, till the whole was leavened.',
  'Matthew 13:37': 'He that soweth the good seed is the Son of man;',
  'Matthew 15:32': 'I have compassion on the multitude, because they continue with me now three days, and have nothing to eat: and I will not send them away fasting, lest they faint in the way.',
  'Matthew 16:2': 'When it is evening, ye say, It will be fair weather: for the sky is red.',
  'Matthew 16:4': 'A wicked and adulterous generation seeketh after a sign; and there shall no sign be given unto it, but the sign of the prophet Jonas.',
  'Matthew 20:25': 'Ye know that the princes of the Gentiles exercise dominion over them, and they that are great exercise authority upon them.',
  'Matthew 26:31': 'All ye shall be offended because of me this night: for it is written, I will smite the shepherd, and the sheep of the flock shall be scattered abroad.',
  'Matthew 26:55': 'Are ye come out as against a thief with swords and staves for to take me? I sat daily with you teaching in the temple, and ye laid no hold on me.',
  'John 1:43': 'Follow me.',
  'John 5:19': 'Verily, verily, I say unto you, The Son can do nothing of himself, but what he seeth the Father do: for what things soever he doeth, these also doeth the Son likewise.',
  'John 6:20': 'It is I; be not afraid.',
  'John 6:43': 'Murmur not among yourselves.',
  'John 6:64': 'But there are some of you that believe not.',
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
