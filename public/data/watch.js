/**
 * Watch — the Advent path. Advent Sunday to Christmas morning, in calendar
 * order. "And what I say unto you I say unto all, Watch." (Mark 13:37)
 *
 * Four weeks: Stay awake, Prepare the way, Joy, He came. Each week opens on its
 * Sunday. Advent is 22 to 28 days long, so the fourth week stops wherever
 * Christmas Eve falls; Christmas Eve and Christmas Day always have their own
 * entries. The path is counted like Advent itself: every day, Sundays too.
 *
 * Every passage is exact KJV speech of Jesus, checked by
 * test/curated-quotes.test.js. The page and the tests both load this file.
 *
 * RLA_watchFor(date) -> null outside Advent Sunday..Christmas Day, else
 *   { offset, day (1..total, or null on Christmas Day), total, entry }
 */
(function (root) {
  const W = 'Stay awake';
  const P = 'Prepare the way';
  const J = 'Joy';
  const C = 'He came';

  // [kind, week, title, verse, passage, reflection, practice]
  // Four weeks of seven, Sunday first; the fourth week never reaches Saturday,
  // because the Saturday after Advent Sunday IV is always Christmas Eve or later.
  const WEEKS = [
    ['sunday', W, 'Watch', 'Mark 13:37',
      'And what I say unto you I say unto all, Watch.',
      'Advent opens with one word, and he addressed it to everyone. To watch is to keep your face turned toward the door, expecting someone kind.',
      'Light one candle at supper tonight. Let it burn while you eat.'],
    ['day', W, 'Ye Know Not When', 'Mark 13:33',
      'Take ye heed, watch and pray: for ye know not when the time is.',
      'He never gave a date. He gave two verbs, watch and pray, and they fit any ordinary Monday.',
      'Pray once today at a moment you would usually reach for your phone.'],
    ['day', W, 'Lift Up Your Heads', 'Luke 21:28',
      'And when these things begin to come to pass, then look up, and lift up your heads; for your redemption draweth nigh.',
      'When the world shakes, he says, look up. Fear bends the head down. He asks for the opposite posture.',
      'Step outside tonight and look at the sky for one full minute.'],
    ['day', W, 'Lights Burning', 'Luke 12:35',
      'Let your loins be girded about, and your lights burning;',
      'Dressed for work, lamp lit. Waiting for him is something you do with your sleeves rolled up.',
      'Finish one small task you have been putting off.'],
    ['day', W, 'He Will Serve Them', 'Luke 12:37',
      'Blessed are those servants, whom the lord when he cometh shall find watching: verily I say unto you, that he shall gird himself, and make them to sit down to meat, and will come forth and serve them.',
      'In this story the master comes home late, finds his servants awake, and puts on the apron himself. The one we wait for comes to serve.',
      'Serve someone a meal or a cup of something, unasked.'],
    ['day', W, 'My Words', 'Mark 13:31',
      'Heaven and earth shall pass away: but my words shall not pass away.',
      'Everything you can see will wear out. He said his words would not. That is why this room keeps only his words.',
      'Copy this sentence by hand and leave it where you will see it in the morning.'],
    ['day', W, 'At Midnight', 'Matthew 25:6',
      'And at midnight there was a cry made, Behold, the bridegroom cometh; go ye out to meet him.',
      'The cry came at the hour when everyone had fallen asleep. He told the story of the ten virgins and their lamps so that we would keep a little oil for the late hour.',
      'Before you sleep, name one thing you are waiting for and hand it to God.'],

    ['sunday', P, 'Prepare Thy Way', 'Matthew 11:10',
      'For this is he, of whom it is written, Behold, I send my messenger before thy face, which shall prepare thy way before thee.',
      'He was speaking of John the Baptist, the one sent ahead. Someone prepared the way for you too, long before you knew it.',
      'Light two candles at supper. Thank, by name, someone who prepared a way for you.'],
    ['day', P, 'A Reed Shaken', 'Matthew 11:7',
      'What went ye out into the wilderness to see? A reed shaken with the wind?',
      'Crowds walked out into the desert to hear John, and he did not bend with every wind. Jesus asked them what they had gone out looking for.',
      'Ask yourself what you are going out to see this week, and whether it will hold.'],
    ['day', P, 'A Burning Light', 'John 5:35',
      'He was a burning and a shining light: and ye were willing for a season to rejoice in his light.',
      'He said John gave off light, and the people were glad of it for a while. Light like that is easy to enjoy and easy to forget.',
      'Tell one person what their faithfulness has meant to you.'],
    ['day', P, 'The Least', 'Luke 7:28',
      'For I say unto you, Among those that are born of women there is not a greater prophet than John the Baptist: but he that is least in the kingdom of God is greater than he.',
      'He praised John as highly as anyone could, then said the least person in the kingdom is greater still. No one in that kingdom has to earn a place near the front.',
      'Give your seat, your turn, or your parking space to someone else today.'],
    ['day', P, 'Suffer It to Be So', 'Matthew 3:15',
      'Suffer it to be so now: for thus it becometh us to fulfil all righteousness.',
      'John did not want to baptise him. Jesus asked him to let it happen anyway. These are his first words in Matthew, and they are about stepping into the water with everyone else.',
      'Say yes to one small thing you would rather someone else did.'],
    ['day', P, 'Within You', 'Luke 17:21',
      'Neither shall they say, Lo here! or, lo there! for, behold, the kingdom of God is within you.',
      'People wanted a time and a place. He told them to stop looking over there. The kingdom he spoke of is nearer than the next headline.',
      'Spend five quiet minutes before you read any news.'],
    ['day', P, 'A Place for You', 'John 14:2',
      'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.',
      'In Advent we make room for him. Here he says he is the one preparing a room, and that his Father\'s house has space to spare.',
      'Clear one surface in your home and leave it empty for the rest of the week.'],

    ['sunday', J, 'Go and Shew John', 'Matthew 11:4–5',
      'Go and shew John again those things which ye do hear and see: The blind receive their sight, and the lame walk, the lepers are cleansed, and the deaf hear, the dead are raised up, and the poor have the gospel preached to them.',
      'John was in prison, asking whether Jesus was the one to come. Jesus did not send an argument. He sent a list of people made well.',
      'Light three candles at supper. Write down three good things you have seen this year.'],
    ['day', J, 'Good News to the Poor', 'Luke 4:18',
      'The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised,',
      'In the synagogue of his home town he stood and read these words from Isaiah. The good news starts with the poor, the brokenhearted, the captive, the blind and the bruised.',
      'Give something today to someone who cannot pay you back.'],
    ['day', J, 'This Day', 'Luke 4:21',
      'This day is this scripture fulfilled in your ears.',
      'Then he closed the book, sat down, and told them the waiting was over. Not someday. This day.',
      'Do today the kind thing you had planned for later.'],
    ['day', J, 'That Your Joy Might Be Full', 'John 15:11',
      'These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.',
      'He said why he spoke at all: so that his joy would stay in us. The point of his words is joy, and joy that lasts.',
      'Do one thing today only because it makes you glad.'],
    ['day', J, 'Joy in Heaven', 'Luke 15:7',
      'I say unto you, that likewise joy shall be in heaven over one sinner that repenteth, more than over ninety and nine just persons, which need no repentance.',
      'Heaven celebrates the one who comes back. No one is too far gone to be the reason for a party.',
      'Reach out to someone you have drifted away from.'],
    ['day', J, 'No Man Taketh', 'John 16:22',
      'And ye now therefore have sorrow: but I will see you again, and your heart shall rejoice, and your joy no man taketh from you.',
      'He said this the night before he died. The sorrow was real and close. So was a joy that no one would be able to take.',
      'If this season is hard, say so to one person you trust.'],
    ['day', J, 'Your Names Are Written', 'Luke 10:20',
      'Notwithstanding in this rejoice not, that the spirits are subject unto you; but rather rejoice, because your names are written in heaven.',
      'His friends came back thrilled with what they had done. He told them to rejoice in something better: they were known by name.',
      'Learn the name of someone you see often and have never asked.'],

    ['sunday', C, 'So Loved', 'John 3:16',
      'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      'Christmas in one sentence: love that gave. He said it to Nicodemus, who came to him by night with questions.',
      'Light all four candles at supper. Tell the people at the table that you love them.'],
    ['day', C, 'To Seek and to Save', 'Luke 19:10',
      'For the Son of man is come to seek and to save that which was lost.',
      'He said this in Zacchaeus\' house, after inviting himself over. He came looking for the lost, and he found one up a tree.',
      'Ask someone to your table this week who might not expect it.'],
    ['day', C, 'Little Children', 'Mark 10:14',
      'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.',
      'The disciples treated the children as an interruption. He was much displeased, and he took them up in his arms. The kingdom belongs to people like them.',
      'Give a child your whole attention for ten minutes.'],
    ['day', C, 'His First Words', 'Luke 2:49',
      'How is it that ye sought me? wist ye not that I must be about my Father\'s business?',
      'These are the first words of his that anyone wrote down. He was twelve, and his parents had looked for him for three days. Even then he knew whose house he belonged in.',
      'If you have someone to worry over tonight, hand them to the Father by name.'],
    ['day', C, 'More Abundantly', 'John 10:10',
      'I am come that they might have life, and that they might have it more abundantly.',
      'He came for life, and more of it than we manage on our own.',
      'Rest for an hour today without apologising for it.'],
    ['day', C, 'I Came Forth', 'John 16:28',
      'I came forth from the Father, and am come into the world: again, I leave the world, and go to the Father.',
      'His whole life in one sentence: from the Father, into the world, and home again. Christmas is the middle of it.',
      'Call someone who is far from home this season.'],
  ];

  const EVE = ['eve', 'Christmas Eve', 'A Light into the World', 'John 12:46',
    'I am come a light into the world, that whosoever believeth on me should not abide in darkness.',
    'Christmas Eve. He says he came as light, so that no one has to stay in the dark. The waiting is almost done.',
    'Turn off the other lights tonight and sit by one candle for a minute.'];

  const CHRISTMAS = ['christmas', 'Christmas', 'To This End Was I Born', 'John 18:37',
    'To this end was I born, and for this cause came I into the world, that I should bear witness unto the truth.',
    'He said this to Pilate, many years after the manger: he was born on purpose. Christmas morning. The one we watched for has come.',
    'Wish a merry Christmas to someone who might not hear it today.'];

  const shape = ([kind, week, title, verse, passage, reflection, practice]) => (
    { kind, week, title, verse, passage, reflection, practice }
  );
  const WATCH = WEEKS.map(shape).concat([shape(EVE), shape(CHRISTMAS)]);

  // Advent Sunday is the fourth Sunday before Christmas: the Sunday on or after 27 November.
  function adventSunday(year) {
    const start = new Date(year, 10, 27);
    return new Date(year, 10, 27 + ((7 - start.getDay()) % 7));
  }

  // Whole local days between two dates, immune to daylight-saving shifts.
  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  // This year's road, one entry per date from Advent Sunday to Christmas Day.
  function watchYear(year) {
    const eve = daysBetween(adventSunday(year), new Date(year, 11, 24));
    const road = WATCH.slice(0, eve);
    road.push(WATCH[WATCH.length - 2], WATCH[WATCH.length - 1]);
    return road;
  }

  function watchFor(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;
    const road = watchYear(d.getFullYear());
    const offset = daysBetween(adventSunday(d.getFullYear()), d);
    if (offset < 0 || offset >= road.length) return null;
    const total = road.length - 1;
    const entry = road[offset];
    return { offset, day: entry.kind === 'christmas' ? null : offset + 1, total, entry, road };
  }

  root.RLA_WATCH_PATH = WATCH;
  root.RLA_watchFor = watchFor;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WATCH, watchFor, watchYear, adventSunday };
  }
})(typeof window !== 'undefined' ? window : globalThis);
