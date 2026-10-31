/**
 * Advent — the waiting path. First Sunday through Christmas Eve.
 * Four weeks of the wreath: Hope, Peace, Joy, Love. Sundays open
 * each week. Christmas Eve is always the last leaf, whatever weekday
 * it falls on. Length follows the church year (22–28 days).
 *
 * Every passage is exact KJV speech of Jesus, checked by
 * test/curated-quotes.test.js. The page and the tests both load this file.
 *
 * RLA_adventFor(date) -> null outside Advent Sunday..Dec 24, else
 *   { offset, day (1-based of this year's wait), total, entry }
 */
(function (root) {
  const HOPE = 'Hope';
  const PEACE = 'Peace';
  const JOY = 'Joy';
  const LOVE = 'Love';

  const SUNDAYS = [
    { kind: 'sunday', week: HOPE, title: 'Look Up', verse: 'Luke 21:28',
      passage: 'And when these things begin to come to pass, then look up, and lift up your heads; for your redemption draweth nigh.',
      reflection: 'Advent begins with the neck, not the hands. He does not say finish the list. He says lift up your head. What is coming is already near.',
      practice: 'Stand at a window. Look up once. That is the whole work.' },
    { kind: 'sunday', week: PEACE, title: 'Little Flock', verse: 'Luke 12:32',
      passage: 'Fear not, little flock; for it is your Father\'s good pleasure to give you the kingdom.',
      reflection: 'He names the fear before he names the gift. Little flock is not an insult. It is how a tired household sounds from the inside.',
      practice: 'Say this sentence over whoever is asleep in the next room.' },
    { kind: 'sunday', week: JOY, title: 'Your Joy', verse: 'John 15:11',
      passage: 'These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.',
      reflection: 'Gaudete Sunday. The joy is his first, then yours. It does not ask you to feel ready.',
      practice: 'Name one small gladness out loud. Do not improve it.' },
    { kind: 'sunday', week: LOVE, title: 'With You', verse: 'Matthew 28:20',
      passage: 'I am with you alway, even unto the end of the world.',
      reflection: 'The last Sunday of waiting is not a countdown. It is a person who does not leave.',
      practice: 'Sit one minute without a phone. That is enough.' },
  ];

  const WEEKDAYS = [
    [
      { kind: 'day', week: HOPE, title: 'Watch', verse: 'Matthew 24:42',
        passage: 'Watch therefore: for ye know not what hour your Lord doth come.',
        reflection: 'Watching is not worrying. It is staying awake to a knock you cannot schedule.',
        practice: 'Leave one lamp on until you go to bed.' },
      { kind: 'day', week: HOPE, title: 'Come', verse: 'Matthew 11:28',
        passage: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        reflection: 'The invitation is to the laden. You do not have to be rested to come.',
        practice: 'Rest. This one is not a suggestion.' },
      { kind: 'day', week: HOPE, title: 'Watch and Pray', verse: 'Mark 13:33',
        passage: 'Take ye heed, watch and pray: for ye know not when the time is.',
        reflection: 'He pairs watching with prayer so the wait does not turn into a clenched jaw.',
        practice: 'One sentence of prayer before the next feeding or the next scroll.' },
      { kind: 'day', week: HOPE, title: 'Lights Burning', verse: 'Luke 12:35',
        passage: 'Let your loins be girded about, and your lights burning;',
        reflection: 'A burning light is a small, ordinary readiness. Not a performance.',
        practice: 'Light one candle, or one cheap bulb. Sit with it for a minute.' },
      { kind: 'day', week: HOPE, title: 'Ready', verse: 'Luke 12:40',
        passage: 'Be ye therefore ready also: for the Son of man cometh at an hour when ye think not.',
        reflection: 'Ready here is not packed bags. It is a heart that can be interrupted.',
        practice: 'When the next cry or ping comes, answer it as if it were the hour.' },
      { kind: 'day', week: HOPE, title: 'Watch, All', verse: 'Mark 13:37',
        passage: 'And what I say unto you I say unto all, Watch.',
        reflection: 'He said it to the four who asked, then to everyone. The wait is shared.',
        practice: 'Tell one person you are waiting too. No advice.' },
    ],
    [
      { kind: 'day', week: PEACE, title: 'My Peace', verse: 'John 14:27',
        passage: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
        reflection: 'The world offers a pause. He leaves a gift. You do not have to manufacture calm to receive it.',
        practice: 'Breathe out once and say: not as the world giveth.' },
      { kind: 'day', week: PEACE, title: 'Not Troubled', verse: 'John 14:1',
        passage: 'Let not your heart be troubled: ye believe in God, believe also in me.',
        reflection: 'He said this the night they would scatter. Belief here is a place to stand, not a mood.',
        practice: 'When the heart starts, put a hand on it and read this once.' },
      { kind: 'day', week: PEACE, title: 'In Me', verse: 'John 16:33',
        passage: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.',
        reflection: 'He does not deny the tribulation. He locates the peace.',
        practice: 'Name the trouble honestly. Then stop talking.' },
      { kind: 'day', week: PEACE, title: 'Today', verse: 'Matthew 6:34',
        passage: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.',
        reflection: 'December will try to borrow tomorrow. He gives you permission to keep today.',
        practice: 'When tomorrow arrives early, tell it: not today.' },
      { kind: 'day', week: PEACE, title: 'Be Still', verse: 'Mark 4:39',
        passage: 'Peace, be still.',
        reflection: 'Two words to a storm. He does not explain the weather. He speaks to it.',
        practice: 'Say this to one loud thing in the house, including yourself.' },
      { kind: 'day', week: PEACE, title: 'Life More Than Meat', verse: 'Matthew 6:25',
        passage: 'Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment?',
        reflection: 'Lists swell in December. He asks whether the life is larger than the list.',
        practice: 'Skip one optional errand. The life is still there.' },
    ],
    [
      { kind: 'day', week: JOY, title: 'Names Written', verse: 'Luke 10:20',
        passage: 'Notwithstanding in this rejoice not, that the spirits are subject unto you; but rather rejoice, because your names are written in heaven.',
        reflection: 'He redirects the joy from what they could do to the fact that they are known.',
        practice: 'Write one name you love on a scrap. Keep it in a pocket.' },
      { kind: 'day', week: JOY, title: 'No One Takes', verse: 'John 16:22',
        passage: 'And ye now therefore have sorrow: but I will see you again, and your heart shall rejoice, and your joy no man taketh from you.',
        reflection: 'Sorrow is named first. The joy that follows is not on loan from other people.',
        practice: 'If you weep today, let it. The sentence still stands.' },
      { kind: 'day', week: JOY, title: 'Exceeding Glad', verse: 'Matthew 5:12',
        passage: 'Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.',
        reflection: 'Gladness here is stubborn. It does not wait for the room to agree.',
        practice: 'Hum one line of a hymn, badly if needed.' },
      { kind: 'day', week: JOY, title: 'The Poor Hear', verse: 'Matthew 11:5',
        passage: 'The blind receive their sight, and the lame walk, the lepers are cleansed, and the deaf hear, the dead are raised up, and the poor have the gospel preached to them.',
        reflection: 'John asked if he was the one. The answer was a list of people being met.',
        practice: 'Notice one person who is trying not to be seen. See them.' },
      { kind: 'day', week: JOY, title: 'Ask', verse: 'John 16:24',
        passage: 'Hitherto have ye asked nothing in my name: ask, and ye shall receive, that your joy may be full.',
        reflection: 'Ask is a small verb. Full joy is allowed to begin with one request.',
        practice: 'Ask for help with one thing you have been carrying alone.' },
      { kind: 'day', week: JOY, title: 'You Shall Laugh', verse: 'Luke 6:21',
        passage: 'Blessed are ye that hunger now: for ye shall be filled. Blessed are ye that weep now: for ye shall laugh.',
        reflection: 'Now is in both sentences. The blessing finds people in the middle of it.',
        practice: 'Eat something warm. If you can laugh, do. If you cannot, this still holds.' },
    ],
    [
      { kind: 'day', week: LOVE, title: 'A Place', verse: 'John 14:2',
        passage: 'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.',
        reflection: 'A place prepared is the opposite of making yourself small enough to fit.',
        practice: 'Clear one chair. That is a mansion enough for tonight.' },
      { kind: 'day', week: LOVE, title: 'I Will Come Again', verse: 'John 14:3',
        passage: 'And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.',
        reflection: 'The promise is not a map. It is that he comes back for the ones he left.',
        practice: 'When you pick the child up, say the last clause once.' },
      { kind: 'day', week: LOVE, title: 'Abide', verse: 'John 15:4',
        passage: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.',
        reflection: 'Branches do not strain toward Christmas. They stay attached.',
        practice: 'Do a little less today, on purpose.' },
      { kind: 'day', week: LOVE, title: 'In the Midst', verse: 'Matthew 18:20',
        passage: 'For where two or three are gathered together in my name, there am I in the midst of them.',
        reflection: 'Two or three is a household. He does not wait for a crowd.',
        practice: 'Sit in the same room as someone. That counts.' },
      { kind: 'day', week: LOVE, title: 'The Light', verse: 'John 8:12',
        passage: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.',
        reflection: 'Following does not cancel the night. It means you do not walk it in the dark.',
        practice: 'Before bed, sit one minute in a dark room. Then say this line.' },
      { kind: 'day', week: LOVE, title: 'A Light Come', verse: 'John 12:46',
        passage: 'I am come a light into the world, that whosoever believeth on me should not abide in darkness.',
        reflection: 'He does not send light ahead of himself. He comes as it.',
        practice: 'Open a curtain in the morning. Let the room change.' },
    ],
  ];

  const EVE = { kind: 'eve', week: LOVE, title: 'I Will Come', verse: 'John 14:18',
    passage: 'I will not leave you comfortless: I will come to you.',
    reflection: 'Christmas Eve. The waiting ends at dusk, and the sentence is still a visit, not a theory. He will not leave you comfortless.',
    practice: 'Leave a light on. The waiting is almost over.' };

  function civil(y, m, d) { return new Date(y, m - 1, d); }

  function adventSunday(year) {
    const start = civil(year, 11, 27);
    const add = (7 - start.getDay()) % 7;
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + add);
  }

  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function pathForYear(year) {
    const start = adventSunday(year);
    const eve = civil(year, 12, 24);
    const total = daysBetween(start, eve) + 1;
    const path = [];
    for (let i = 0; i < total; i++) {
      const d = addDays(start, i);
      if (sameDay(d, eve)) {
        path.push(EVE);
        continue;
      }
      const week = Math.floor(i / 7);
      if (d.getDay() === 0) {
        path.push(SUNDAYS[week]);
      } else {
        path.push(WEEKDAYS[week][d.getDay() - 1]);
      }
    }
    return path;
  }

  function adventFor(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const start = adventSunday(year);
    const eve = civil(year, 12, 24);
    const offset = daysBetween(start, d);
    const total = daysBetween(start, eve) + 1;
    if (offset < 0 || offset >= total) return null;
    const path = pathForYear(year);
    return { offset, day: offset + 1, total, entry: path[offset], path };
  }

  const ALL = SUNDAYS.concat(WEEKDAYS[0], WEEKDAYS[1], WEEKDAYS[2], WEEKDAYS[3], [EVE]);

  root.RLA_ADVENT_PATH = ALL;
  root.RLA_adventFor = adventFor;
  root.RLA_adventSunday = adventSunday;
  root.RLA_adventPathForYear = pathForYear;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ALL, EVE, SUNDAYS, WEEKDAYS, adventFor, adventSunday, pathForYear };
  }
})(typeof window !== 'undefined' ? window : globalThis);
