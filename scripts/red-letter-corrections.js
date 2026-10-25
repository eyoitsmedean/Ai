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
  'John 12:34': 'the people',
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
  'Luke 4:4': 'It is written, That man shall not live by bread alone, but by every word of God.',
  'Luke 4:12': 'It is said, Thou shalt not tempt the Lord thy God.',
  'Luke 5:14': 'but go, and shew thyself to the priest, and offer for thy cleansing, according as Moses commanded, for a testimony unto them.',
  'Luke 5:24': 'But that ye may know that the Son of man hath power upon earth to forgive sins, … I say unto thee, Arise, and take up thy couch, and go into thine house.',
  'Luke 5:31': 'They that are whole need not a physician; but they that are sick.',
  'Luke 5:36': 'No man putteth a piece of a new garment upon an old; if otherwise, then both the new maketh a rent, and the piece that was taken out of the new agreeth not with the old.',
  'Luke 6:3': 'Have ye not read so much as this, what David did, when himself was an hungred, and they which were with him;',
  'Luke 6:20': 'Blessed be ye poor: for yours is the kingdom of God.',
  'Luke 6:39': 'Can the blind lead the blind? shall they not both fall into the ditch?',
  'Luke 7:22': 'Go your way, and tell John what things ye have seen and heard; how that the blind see, the lame walk, the lepers are cleansed, the deaf hear, the dead are raised, to the poor the gospel is preached.',
  'Luke 7:24': 'What went ye out into the wilderness for to see? A reed shaken with the wind?',
  'Luke 7:31': 'Whereunto then shall I liken the men of this generation? and to what are they like?',
  'Luke 7:44': 'Seest thou this woman? I entered into thine house, thou gavest me no water for my feet: but she hath washed my feet with tears, and wiped them with the hairs of her head.',
  'Luke 9:48': 'Whosoever shall receive this child in my name receiveth me: and whosoever shall receive me receiveth him that sent me: for he that is least among you all, the same shall be great.',
  'Luke 9:56': "For the Son of man is not come to destroy men's lives, but to save them.",
  'Luke 10:2': 'The harvest truly is great, but the labourers are few: pray ye therefore the Lord of the harvest, that he would send forth labourers into his harvest.',
  'Luke 10:21': 'I thank thee, O Father, Lord of heaven and earth, that thou hast hid these things from the wise and prudent, and hast revealed them unto babes: even so, Father; for so it seemed good in thy sight.',
  'Luke 10:23': 'Blessed are the eyes which see the things that ye see:',
  'Luke 10:30': 'A certain man went down from Jerusalem to Jericho, and fell among thieves, which stripped him of his raiment, and wounded him, and departed, leaving him half dead.',
  'Luke 11:17': 'Every kingdom divided against itself is brought to desolation; and a house divided against a house falleth.',
  'Luke 11:29': 'This is an evil generation: they seek a sign; and there shall no sign be given it, but the sign of Jonas the prophet.',
  'Luke 12:1': 'Beware ye of the leaven of the Pharisees, which is hypocrisy.',
  'Luke 12:42': 'Who then is that faithful and wise steward, whom his lord shall make ruler over his household, to give them their portion of meat in due season?',
  'Luke 13:2': 'Suppose ye that these Galilaeans were sinners above all the Galilaeans, because they suffered such things?',
  'Luke 13:6': 'A certain man had a fig tree planted in his vineyard; and he came and sought fruit thereon, and found none.',
  'Luke 13:15': 'Thou hypocrite, doth not each one of you on the sabbath loose his ox or his ass from the stall, and lead him away to watering?',
  'Luke 13:18': 'Unto what is the kingdom of God like? and whereunto shall I resemble it?',
  'Luke 14:12': 'When thou makest a dinner or a supper, call not thy friends, nor thy brethren, neither thy kinsmen, nor thy rich neighbours; lest they also bid thee again, and a recompence be made thee.',
  'Luke 14:16': 'A certain man made a great supper, and bade many:',
  'Luke 17:1': 'It is impossible but that offences will come: but woe unto him, through whom they come!',
  'Luke 17:6': 'If ye had faith as a grain of mustard seed, ye might say unto this sycamine tree, Be thou plucked up by the root, and be thou planted in the sea; and it should obey you.',
  'Luke 17:17': 'Were there not ten cleansed? but where are the nine?',
  'Luke 18:6': 'Hear what the unjust judge saith.',
  'Luke 18:16': 'Suffer little children to come unto me, and forbid them not: for of such is the kingdom of God.',
  'Luke 18:31': 'Behold, we go up to Jerusalem, and all things that are written by the prophets concerning the Son of man shall be accomplished.',
  'Luke 19:12': 'A certain nobleman went into a far country to receive for himself a kingdom, and to return.',
  'Luke 20:9': 'A certain man planted a vineyard, and let it forth to husbandmen, and went into a far country for a long time.',
  'Luke 20:16': 'He shall come and destroy these husbandmen, and shall give the vineyard to others.',
  'Luke 20:17': 'What is this then that is written, The stone which the builders rejected, the same is become the head of the corner?',
  'Luke 20:34': 'The children of this world marry, and are given in marriage:',
  'Luke 21:10': 'Nation shall rise against nation, and kingdom against kingdom:',
  'Luke 21:29': 'Behold the fig tree, and all the trees;',
  'Luke 22:17': 'Take this, and divide it among yourselves:',
  'Luke 22:31': 'Simon, Simon, behold, Satan hath desired to have you, that he may sift you as wheat:',
  'Luke 22:36': 'But now, he that hath a purse, let him take it, and likewise his scrip: and he that hath no sword, let him sell his garment, and buy one.',
  'Luke 23:28': 'Daughters of Jerusalem, weep not for me, but weep for yourselves, and for your children.',
  'Luke 24:46': 'Thus it is written, and thus it behoved Christ to suffer, and to rise from the dead the third day:',
  'John 7:16': 'My doctrine is not mine, but his that sent me.',
  'John 8:7': 'He that is without sin among you, let him first cast a stone at her.',
  'John 8:21': 'I go my way, and ye shall seek me, and shall die in your sins: whither I go, ye cannot come.',
  'John 8:31': 'If ye continue in my word, then are ye my disciples indeed;',
  'John 10:7': 'Verily, verily, I say unto you, I am the door of the sheep.',
  'John 11:11': 'Our friend Lazarus sleepeth; but I go, that I may awake him out of sleep.',
  'John 11:41': 'Father, I thank thee that thou hast heard me.',
  'John 11:43': 'Lazarus, come forth.',
  'John 12:36': 'While ye have light, believe in the light, that ye may be the children of light.',
  'John 12:44': 'He that believeth on me, believeth not on me, but on him that sent me.',
  'John 13:11': 'Ye are not all clean.',
  'John 13:21': 'Verily, verily, I say unto you, that one of you shall betray me.',
  'John 16:19': 'Do ye enquire among yourselves of that I said, A little while, and ye shall not see me: and again, a little while, and ye shall see me?',
  'John 17:1': 'Father, the hour is come; glorify thy Son, that thy Son also may glorify thee:',
  'John 18:6': 'I am he',
  'John 19:26': 'Woman, behold thy son!',
  'John 19:27': 'Behold thy mother!',
  'John 19:28': 'I thirst.',
  'John 20:21': 'Peace be unto you: as my Father hath sent me, even so send I you.',
  'John 20:22': 'Receive ye the Holy Ghost:',
  'John 20:27': 'Reach hither thy finger, and behold my hands; and reach hither thy hand, and thrust it into my side: and be not faithless, but believing.',
  'John 21:19': 'Follow me.',
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
