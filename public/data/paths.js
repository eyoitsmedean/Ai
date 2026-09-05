/* Named paths — Seven is the first week; Forty is the longer story (Lent, or after Day 7).
   Words are public-domain KJV speech of Jesus. */
(function () {
  const EXTRA = [
    { title: 'Resurrection', theme: 'Life', verse: 'John 11:25–26', passage: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live: And whosoever liveth and believeth in me shall never die.', reflection: 'He does not offer a theory of death. He offers himself in the middle of it.' },
    { title: 'Bread', theme: 'Hunger', verse: 'John 6:35', passage: 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.', reflection: 'Hunger is honest. He does not scold it. He names himself as enough.' },
    { title: 'Shepherd', theme: 'Care', verse: 'John 10:11', passage: 'I am the good shepherd: the good shepherd giveth his life for the sheep.', reflection: 'Care that costs nothing is a hireling. He stays when it is expensive.' },
    { title: 'Troubled', theme: 'Peace', verse: 'John 14:1', passage: 'Let not your heart be troubled: ye believe in God, believe also in me.', reflection: 'He speaks to a room about to break. Belief here is company, not a quiz.' },
    { title: 'Overcome', theme: 'Courage', verse: 'John 16:33', passage: 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', reflection: 'He tells the truth about the world first. Cheer is not denial.' },
    { title: 'Always', theme: 'Presence', verse: 'Matthew 28:20', passage: 'Lo, I am with you alway, even unto the end of the world.', reflection: 'The last word is not a map. It is presence that does not expire.' },
    { title: 'Paradise', theme: 'Mercy', verse: 'Luke 23:43', passage: 'Verily I say unto thee, To day shalt thou be with me in paradise.', reflection: 'A dying thief is given today, not a waitlist. Mercy does not arrive late.' },
    { title: 'Peacemakers', theme: 'Peace', verse: 'Matthew 5:9', passage: 'Blessed are the peacemakers: for they shall be called the children of God.', reflection: 'Peace is made, not merely felt. One reconciling step is enough for this day.' },
    { title: 'Anointed', theme: 'Purpose', verse: 'Luke 4:18', passage: 'The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives.', reflection: 'His purpose statement is toward the poor, the broken, the locked. That is the work.' },
    { title: 'Sent', theme: 'Go', verse: 'John 20:21', passage: 'Peace be unto you: as my Father hath sent me, even so send I you.', reflection: 'Peace first. Then a sending. You do not go unaccompanied.' },
    { title: 'Willing', theme: 'Surrender', verse: 'Matthew 26:39', passage: 'O my Father, if it be possible, let this cup pass from me: nevertheless not as I will, but as thou wilt.', reflection: 'He does not pretend the cup is sweet. Honesty and obedience can sit in one sentence.' },
    { title: 'Ninety-nine', theme: 'Seeking', verse: 'Luke 15:4–5', passage: 'What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it? And when he hath found it, he layeth it on his shoulders, rejoicing.', reflection: 'You are not an acceptable loss. He goes after the one, and he is glad when he finds you.' }
  ];

  function fromDaily() {
    const list = (window.RLA_CURATED && window.RLA_CURATED.daily) || [];
    return list.map(function (d) {
      const w = d.word || {};
      return {
        title: w.title || w.theme || 'Word',
        theme: w.theme || '',
        verse: w.verse || '',
        passage: w.passage || '',
        reflection: w.reflection || ''
      };
    });
  }

  window.RLA_FORTY = fromDaily().concat(EXTRA).slice(0, 40);

  /* Watch with me — the Advent path. Four weeks, twenty-eight rooms, counted
     from Advent Sunday. Week one is Seven Days in seasonal clothes. Every line
     is his own speech (verified against the spoken map in test/paths.test.js).
     Titles stay under nine characters so seven fit across a phone. */
  function pick(title, verse, passage, reflection) {
    return { title: title, verse: verse, passage: passage, reflection: reflection };
  }
  const WEEK_TWO = [
    pick('Watch', 'Matthew 25:13', 'Watch therefore, for ye know neither the day nor the hour wherein the Son of man cometh.', 'Advent is not a countdown you control. It is attention you keep.'),
    pick('Troubled', 'John 14:1', 'Let not your heart be troubled: ye believe in God, believe also in me.', 'He speaks to a room about to break. Belief here is company, not a quiz.'),
    pick('Enough', 'Matthew 6:34', 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.', 'You were carrying Tuesday on Monday. He hands you back today, and only today.'),
    pick('Flock', 'Luke 12:32', 'Fear not, little flock; for it is your Father\'s good pleasure to give you the kingdom.', 'Little is not an insult. It is the size he chooses to give to.'),
    pick('Sparrows', 'Luke 12:7', 'But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.', 'Counted is the opposite of forgotten. Fear has less room when you are known.'),
    pick('Bread', 'John 6:35', 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.', 'Hunger is honest. He does not scold it. He names himself as enough.'),
    pick('Lost', 'Luke 15:4–5', 'What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it? And when he hath found it, he layeth it on his shoulders, rejoicing.', 'You are not an acceptable loss. He goes after the one, and he is glad when he finds you.')
  ];
  const WEEK_THREE = [
    pick('Kingdom', 'Matthew 4:17', 'Repent: for the kingdom of heaven is at hand.', 'His first sermon is one sentence. Turn around; it is closer than you think.'),
    pick('First', 'Matthew 6:33', 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.', 'The list does not shrink. The order changes. One thing goes first.'),
    pick('Thirst', 'John 7:37', 'If any man thirst, let him come unto me, and drink.', 'No credential is asked for. Thirst is the ticket.'),
    pick('Ask', 'Matthew 7:7', 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:', 'Three verbs and a door. He does not describe the room behind it. He tells you to knock.'),
    pick('Anointed', 'Luke 4:18', 'The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives.', 'His purpose statement is toward the poor, the broken, the locked. That is the work.'),
    pick('Mourn', 'Matthew 5:4', 'Blessed are they that mourn: for they shall be comforted.', 'December has empty chairs. He does not hurry grief. He blesses it and promises company.'),
    pick('Mercy', 'Matthew 9:13', 'But go ye and learn what that meaneth, I will have mercy, and not sacrifice: for I am not come to call the righteous, but sinners to repentance.', 'He says who he came for. If you are not qualified, you are on the list.')
  ];
  const WEEK_FOUR = [
    pick('Still', 'Mark 4:39', 'Peace, be still.', 'Three words to a storm. He does not explain the weather. He speaks to it.'),
    pick('Lift', 'Luke 21:28', 'And when these things begin to come to pass, then look up, and lift up your heads; for your redemption draweth nigh.', 'The longest night. He does not say the dark is unreal. He says where to look.'),
    pick('Sorrow', 'John 16:22', 'And ye now therefore have sorrow: but I will see you again, and your heart shall rejoice, and your joy no man taketh from you.', 'He names the sorrow first. Then a joy nobody can repossess.'),
    pick('Joy', 'John 15:11', 'These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.', 'Joy is not a mood you generate. It is his, left in you, meant to be full.'),
    pick('Prepare', 'John 14:2–3', 'In my Father\'s house are many mansions: if it were not so, I would have told you. I go to prepare a place for you. And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.', 'The night before, a room is made ready. He is the one preparing, and the one coming.'),
    pick('Here', 'John 12:46', 'I am come a light into the world, that whosoever believeth on me should not abide in darkness.', 'Not a theory of light. Arrival. The paper warms because he is here.'),
    pick('Comfort', 'John 14:18', 'I will not leave you comfortless: I will come to you.', 'The last room is a promise, not a wrap-up. He comes to you. That is the whole path.')
  ];

  function weekOne() {
    return (window.RLA_SEVEN || []).slice(0, 7).map(function (d) {
      return pick(d.title, d.verse, d.passage, d.reflection);
    });
  }

  window.RLA_ADVENT = {
    id: 'advent',
    name: 'Watch with me',
    weeks: ['Watch', 'Wait', 'Prepare', 'Near'],
    days: weekOne().concat(WEEK_TWO, WEEK_THREE, WEEK_FOUR).map(function (d, i) {
      d.week = Math.floor(i / 7);
      return d;
    })
  };

  window.RLA_pathList = function (kind) {
    if (kind === 'forty' && window.RLA_FORTY && window.RLA_FORTY.length) return window.RLA_FORTY;
    if (kind === 'advent' && window.RLA_ADVENT) return window.RLA_ADVENT.days;
    return window.RLA_SEVEN || [];
  };
})();
