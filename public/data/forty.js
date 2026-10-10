/**
 * Forty — the Lent path. Ash Wednesday to Easter morning, in calendar order:
 * forty counted days, six Sundays that Lent does not count, and Easter.
 * The road follows his: wilderness, the mountain, the people he met, the
 * "I am" sayings, the turn toward Jerusalem, and Holy Week day by day.
 *
 * Every passage is exact KJV speech of Jesus, checked by
 * test/curated-quotes.test.js. The page and the tests both load this file.
 *
 * RLA_fortyFor(date) -> null outside Ash Wednesday..Easter, else
 *   { offset, day (1-40, or null on a Sunday or Easter), entry }
 */
(function (root) {
  const W = 'Into the wilderness';
  const M = 'The mountain';
  const D = 'Do not worry';
  const P = 'The people he met';
  const I = 'I am';
  const J = 'Toward Jerusalem';
  const H = 'Holy Week';

  // [kind, week, title, verse, passage, reflection, practice]
  const ROWS = [
    ['day', 'Ash Wednesday', 'In Secret', 'Matthew 6:6',
      'But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.',
      'Lent begins behind a closed door, not in front of a crowd. Whatever you give up or take on, he asks that it stay between you and the Father.',
      'Choose one small thing for these forty days. Tell no one.'],
    ['day', W, 'Bread Alone', 'Matthew 4:4',
      'It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.',
      'He was hungry, and he did not pretend otherwise. Bread is not the enemy. It is just not the whole of a life.',
      'When you miss the thing you gave up, say this sentence once.'],
    ['day', W, 'Not a Test', 'Matthew 4:7',
      'It is written again, Thou shalt not tempt the Lord thy God.',
      'He would not make God prove himself. Trust that keeps demanding a sign is still afraid.',
      'Name one thing you keep asking God to prove. Set it down for today.'],
    ['day', W, 'Him Only', 'Matthew 4:10',
      'Get thee hence, Satan: for it is written, Thou shalt worship the Lord thy God, and him only shalt thou serve.',
      'Every offer in the wilderness was a shortcut. He took the long road and called it worship.',
      'Notice what you reach for first when you are tired.'],
    ['sunday', W, 'Turn', 'Mark 1:15',
      'The time is fulfilled, and the kingdom of God is at hand: repent ye, and believe the gospel.',
      'Repent means turn around. It was the first thing he preached, and it sounds less like a scolding than a door opening.',
      'Sundays are not counted in Lent. Rest from whatever you gave up.'],

    ['day', M, 'Poor in Spirit', 'Matthew 5:3',
      'Blessed are the poor in spirit: for theirs is the kingdom of heaven.',
      'The first blessing goes to people with nothing left to bring. If that is you this morning, you are first in line.',
      'Pray one honest sentence that begins with "I can\'t."'],
    ['day', M, 'They That Mourn', 'Matthew 5:4',
      'Blessed are they that mourn: for they shall be comforted.',
      'He does not hurry grief or explain it away. He puts the mourners on the blessed list and promises comfort.',
      'Send a note to someone who is grieving. No advice.'],
    ['day', M, 'The Meek', 'Matthew 5:5',
      'Blessed are the meek: for they shall inherit the earth.',
      'Meek is not weak. It is strength that does not need to win the argument.',
      'Let someone else have the last word once today.'],
    ['day', M, 'Hunger and Thirst', 'Matthew 5:6',
      'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.',
      'He blesses the wanting, not only the having. A hunger for what is right is already a gift.',
      'Pray by name for one wrong you would like to see made right.'],
    ['day', M, 'The Merciful', 'Matthew 5:7',
      'Blessed are the merciful: for they shall obtain mercy.',
      'Mercy is the one thing on this list you can hand out and get back.',
      'Let go of one small debt someone owes you.'],
    ['day', M, 'Pure in Heart', 'Matthew 5:8',
      'Blessed are the pure in heart: for they shall see God.',
      'A pure heart is not a perfect record. It is a heart that wants one thing.',
      'Put the phone away an hour earlier tonight.'],
    ['sunday', M, 'Light of the World', 'Matthew 5:14',
      'Ye are the light of the world. A city that is set on an hill cannot be hid.',
      'He did not say try to be light. He said you are. A city on a hill does not strain to be seen.',
      'Rest today. Leave a light on for someone coming home late.'],

    ['day', D, 'Our Father', 'Matthew 6:9',
      'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.',
      'He taught them to begin with a name, not a request. Our, not my. Father, not force.',
      'Pray the Lord\'s Prayer slowly, once, before you look at a screen.'],
    ['day', D, 'The Birds', 'Matthew 6:26',
      'Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?',
      'Birds do not plan the harvest, and they are fed. He says you are worth more than they are.',
      'Step outside for two minutes. Look for one bird.'],
    ['day', D, 'The Lilies', 'Matthew 6:28',
      'Consider the lilies of the field, how they grow; they toil not, neither do they spin.',
      'Lilies do no work for their beauty. Some of what you are carrying was never yours to make.',
      'Put down one thing you were doing only to be seen.'],
    ['day', D, 'Tomorrow', 'Matthew 6:34',
      'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.',
      'Today has enough trouble of its own. That is permission, not a threat.',
      'When tomorrow\'s worry arrives early, tell it: not today.'],
    ['day', D, 'Ask', 'Matthew 7:7',
      'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.',
      'Ask, seek, knock. Three verbs, all moving, and each one comes with an answer.',
      'Ask for help with one thing you have been carrying alone.'],
    ['day', D, 'On the Rock', 'Matthew 7:24',
      'Therefore whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a rock.',
      'Hearing is the start. The house stands because someone did what they heard.',
      'Do one thing this week\'s sayings asked of you.'],
    ['sunday', D, 'Come', 'Matthew 11:28',
      'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
      'The invitation is to the tired. You do not have to be rested to come.',
      'Rest. This one is not a suggestion.'],

    ['day', P, 'The Physician', 'Mark 2:17',
      'They that are whole have no need of the physician, but they that are sick: I came not to call the righteous, but sinners to repentance.',
      'He ate with the people the respectable avoided. A doctor in a room full of the healthy has nothing to do.',
      'Share a meal or a coffee with someone you usually would not.'],
    ['day', P, 'Go in Peace', 'Luke 7:50',
      'Thy faith hath saved thee; go in peace.',
      'She came with tears and ointment and left with peace. He said her faith had done it.',
      'Give away one thing that costs you something.'],
    ['day', P, 'Neither Do I', 'John 8:11',
      'Neither do I condemn thee: go, and sin no more.',
      'Everyone holding a stone walked away. The only one without sin stayed, and he did not throw one.',
      'Put down one accusation you have been rehearsing.'],
    ['day', P, 'Daughter', 'Mark 5:34',
      'Daughter, thy faith hath made thee whole; go in peace, and be whole of thy plague.',
      'She meant to touch his clothes and slip away. He stopped the crowd to call her daughter.',
      'Notice one person who is trying not to be seen. See them.'],
    ['day', P, 'Come Down', 'Luke 19:5',
      'Zacchaeus, make haste, and come down; for to day I must abide at thy house.',
      'He called the tax collector out of the tree by name and invited himself to dinner. Mercy that comes to your house today.',
      'Invite someone over, even for ten minutes.'],
    ['day', P, 'The Well', 'John 4:14',
      'But whosoever drinketh of the water that I shall give him shall never thirst; but the water that I shall give him shall be in him a well of water springing up into everlasting life.',
      'He asked a stranger for a drink and offered her a spring. The thirst he means runs deeper than water.',
      'Drink a glass of water slowly, and pray for one person by name.'],
    ['sunday', P, 'A Great Way Off', 'Luke 15:20',
      'And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him.',
      'The son rehearsed a speech on the road home. The father saw him from far off and ran.',
      'Rest. Call someone you have been far from.'],

    ['day', I, 'Bread of Life', 'John 6:35',
      'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.',
      'He does not hand out bread. He says he is the bread. Enough is a person, not a pantry.',
      'Before one meal, give thanks with one specific sentence.'],
    ['day', I, 'The Light', 'John 8:12',
      'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.',
      'Following him does not cancel the night. It means you do not walk it in the dark.',
      'Before bed, sit one minute in a dark room. Then say this line.'],
    ['day', I, 'The Good Shepherd', 'John 10:11',
      'I am the good shepherd: the good shepherd giveth his life for the sheep.',
      'A hired hand runs when the wolf comes. The shepherd stays, and it costs him.',
      'Stay in one hard conversation you would rather leave.'],
    ['day', I, 'Resurrection', 'John 11:25',
      'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.',
      'He said this to Martha, whose brother had been in the grave four days. A little later, he wept.',
      'Remember one person you have lost. Say their name.'],
    ['day', I, 'The Way', 'John 14:6',
      'I am the way, the truth, and the life: no man cometh unto the Father, but by me.',
      'Thomas asked how they could know the way. He was not given a map. He was given a person.',
      'Take a short walk with nowhere to be.'],
    ['day', I, 'The Vine', 'John 15:5',
      'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
      'Branches do not strain to bear fruit. They stay attached.',
      'Do a little less today, on purpose.'],
    ['sunday', I, 'A Grain of Wheat', 'John 12:24',
      'Verily, verily, I say unto you, Except a corn of wheat fall into the ground and die, it abideth alone: but if it die, it bringeth forth much fruit.',
      'He said it plainly, days before the cross: some things only grow by being let go.',
      'Rest. Let one thing go.'],

    ['day', J, 'Daily', 'Luke 9:23',
      'If any man will come after me, let him deny himself, and take up his cross daily, and follow me.',
      'Daily is the hard word in this sentence. Not once, heroically. Every ordinary morning.',
      'Do the dull, faithful thing first today.'],
    ['day', J, 'To Serve', 'Mark 10:45',
      'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.',
      'Two of his friends asked for the best seats. He told them he came to serve, and then he did.',
      'Do one chore no one will notice.'],
    ['day', J, 'As a Hen', 'Luke 13:34',
      'O Jerusalem, Jerusalem, which killest the prophets, and stonest them that are sent unto thee; how often would I have gathered thy children together, as a hen doth gather her brood under her wings, and ye would not!',
      'Grief for a city that would not let itself be loved. Wings held open, and no one coming.',
      'Pray for your own town, one street at a time.'],
    ['day', J, 'Seventy Times Seven', 'Matthew 18:22',
      'I say not unto thee, Until seven times: but, Until seventy times seven.',
      'Peter offered seven and thought it generous. He was told to stop counting.',
      'Forgive the same person again, even if only in your heart.'],
    ['day', J, 'The Least', 'Matthew 25:40',
      'Verily I say unto you, Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me.',
      'He stands with the hungry, the stranger, the sick and the prisoner. What reached them reached him.',
      'Give food or money to someone who needs it today.'],
    ['day', J, 'Thy Peace', 'Luke 19:42',
      'If thou hadst known, even thou, at least in this thy day, the things which belong unto thy peace! but now they are hid from thine eyes.',
      'He wept over the city as he came near. Peace was right in front of them, and they could not see it.',
      'Make peace with one person before Palm Sunday.'],
    ['sunday', H, 'The Stones', 'Luke 19:40',
      'I tell you that, if these should hold their peace, the stones would immediately cry out.',
      'Palm Sunday. They told him to quiet the crowd. He said the stones would shout if the people did not.',
      'Rest. Sing something, even quietly.'],

    ['day', H, 'House of Prayer', 'Mark 11:17',
      'Is it not written, My house shall be called of all nations the house of prayer? but ye have made it a den of thieves.',
      'He cleared the temple court so there would be room to pray. Some rooms need clearing.',
      'Clear one shelf or one corner. Pray there.'],
    ['day', H, 'With All Thy Heart', 'Mark 12:30',
      'And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind, and with all thy strength: this is the first commandment.',
      'Heart, soul, mind and strength. He asks for all of it, and in three days he gives all of his.',
      'Pray with your body: kneel, or walk, or open your hands.'],
    ['day', H, 'A Good Work', 'Mark 14:6',
      'Let her alone; why trouble ye her? she hath wrought a good work on me.',
      'They called her gift a waste. He called it a good work and told them to leave her alone.',
      'Do one extravagant kindness.'],
    ['day', H, 'A New Commandment', 'John 13:34',
      'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.',
      'Maundy Thursday. He washed their feet, then told them to love like that. As I have loved you is the measure.',
      'Serve someone at the table tonight.'],
    ['day', H, 'Forgive Them', 'Luke 23:34',
      'Father, forgive them; for they know not what they do.',
      'Good Friday. He prayed this as they crucified him. Forgiveness spoken before anyone asked for it.',
      'Keep this day quiet. At three in the afternoon, sit with this one sentence.'],
    ['day', H, 'Into Thy Hands', 'Luke 23:46',
      'Father, into thy hands I commend my spirit.',
      'Holy Saturday. His last words were a line from the Psalms, an evening prayer. Today the tomb is closed. Wait with it.',
      'Nothing needs fixing today.'],

    ['easter', 'Easter', 'Mary', 'John 20:15–16',
      'Woman, why weepest thou? whom seekest thou? … Mary.',
      'She thought he was the gardener until he said her name. Easter begins with one word, spoken to you.',
      'Whatever you gave up, let it go with joy. Say someone\'s name gladly today.'],
  ];

  const FORTY = ROWS.map(([kind, week, title, verse, passage, reflection, practice]) => (
    { kind, week, title, verse, passage, reflection, practice }
  ));

  // Gregorian Easter (Anonymous / Meeus), local-date arithmetic only.
  function easterSunday(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function ashWednesday(year) {
    const e = easterSunday(year);
    return new Date(e.getFullYear(), e.getMonth(), e.getDate() - 46);
  }

  // Whole local days between two dates, immune to daylight-saving shifts.
  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  function fortyFor(date) {
    const d = date instanceof Date ? date : new Date(date);
    const offset = daysBetween(ashWednesday(d.getFullYear()), d);
    if (offset < 0 || offset >= FORTY.length) return null;
    const entry = FORTY[offset];
    let day = null;
    if (entry.kind === 'day') {
      day = FORTY.slice(0, offset + 1).filter((e) => e.kind === 'day').length;
    }
    return { offset, day, entry };
  }

  root.RLA_FORTY_PATH = FORTY;
  root.RLA_fortyFor = fortyFor;
  root.RLA_ashWednesday = ashWednesday;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FORTY, fortyFor, ashWednesday, easterSunday };
  }
})(typeof window !== 'undefined' ? window : globalThis);
