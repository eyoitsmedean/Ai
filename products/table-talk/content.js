'use strict';
// Table Talk: 52 conversation cards from the words of Jesus.
// Every saying is exact KJV red-letter text (a contiguous span of one verse,
// or lines joined with " … "). Run `node verify.js` to check.

const meta = {
  brand: 'Red Letter',
  title: 'Table Talk',
  subtitle: '52 conversation cards from the words of Jesus',
  translation: 'King James Version',
  backLine: 'Table Talk',
  backSub: 'from the words of Jesus',
};

const suits = [
  { key: 'love', name: 'Love', blurb: 'Friendship, kindness and caring for each other.' },
  { key: 'courage', name: 'Courage', blurb: 'Fear, hope, honesty and taking a brave step.' },
  { key: 'peace', name: 'Peace', blurb: 'Rest, worry, home and the gift of a calm heart.' },
  { key: 'grace', name: 'Grace', blurb: 'Mercy, second chances, generosity and joy.' },
];

const instructions = [
  {
    title: 'How to play',
    body: [
      'Shuffle the deck and set it in the middle of the table.',
      'Take turns drawing a card. Read the saying aloud, then the question.',
      'Anyone can answer, in any order. Listen well, and let each person finish.',
      'Pass is always a fine answer. No one has to share more than they want to.',
    ],
  },
  {
    title: 'Ways to use the deck',
    body: [
      'Family dinner: one card a night, or a few on a slow evening.',
      'Small groups: draw three to open a meeting, or pick one suit for the evening.',
      'Couples: take a card on a walk or over coffee.',
      'The sayings are from the King James Version, in the words of Jesus as the Gospels record them.',
    ],
  },
];

// rank 1..13 within each suit
const cards = [
  // LOVE
  { suit: 'love', citation: 'John 13:34', saying: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.', question: 'Who has shown you what love looks like, and what did they do?' },
  { suit: 'love', citation: 'John 15:13', saying: 'Greater love hath no man than this, that a man lay down his life for his friends.', question: 'What is something a friend might give up to help someone they love?' },
  { suit: 'love', citation: 'Mark 12:31', saying: 'Thou shalt love thy neighbour as thyself.', question: 'Who lives or works near you, and how could you look after them this week?' },
  { suit: 'love', citation: 'Luke 6:31', saying: 'And as ye would that men should do to you, do ye also to them likewise.', question: 'What kind thing would you love someone to do for you, and who could you do it for?' },
  { suit: 'love', citation: 'Matthew 6:21', saying: 'For where your treasure is, there will your heart be also.', question: 'If someone watched how you spend your time, what would they say you treasure?' },
  { suit: 'love', citation: 'Luke 6:27', saying: 'Love your enemies, do good to them which hate you', question: 'What makes it hard to be kind to someone who has been unkind to you?' },
  { suit: 'love', citation: 'John 15:15', saying: 'I have called you friends', question: 'What makes someone a true friend?' },
  { suit: 'love', citation: 'Matthew 25:35', saying: 'For I was an hungred, and ye gave me meat: I was thirsty, and ye gave me drink: I was a stranger, and ye took me in', question: 'How could we make someone new feel welcome at our table or in our group?' },
  { suit: 'love', citation: 'Matthew 25:40', saying: 'Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me.', question: 'Who is easy to overlook, and how could we notice them more?' },
  { suit: 'love', citation: 'John 15:9', saying: 'As the Father hath loved me, so have I loved you: continue ye in my love.', question: 'What helps you remember that you are loved, even on a hard day?' },
  { suit: 'love', citation: 'Mark 10:14', saying: 'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.', question: 'What is something children understand better than grown-ups do?' },
  { suit: 'love', citation: 'John 21:17', saying: 'Feed my sheep.', question: 'What are some ways people take care of each other without using any words?' },
  { suit: 'love', citation: 'John 13:14', saying: 'If I then, your Lord and Master, have washed your feet; ye also ought to wash one another\'s feet.', question: 'What everyday job shows love, and who does it for you?' },

  // COURAGE
  { suit: 'courage', citation: 'Matthew 14:27', saying: 'Be of good cheer; it is I; be not afraid.', question: 'What is something that used to scare you but doesn\'t anymore, and what changed?' },
  { suit: 'courage', citation: 'Mark 5:36', saying: 'Be not afraid, only believe.', question: 'What helps you feel brave when you are nervous?' },
  { suit: 'courage', citation: 'Matthew 5:14', saying: 'Ye are the light of the world. A city that is set on an hill cannot be hid.', question: 'What gift do you see in someone at this table that the world needs?' },
  { suit: 'courage', citation: 'Matthew 5:16', saying: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.', question: 'What good thing have you seen someone do lately that made you smile?' },
  { suit: 'courage', citation: 'Matthew 19:26', saying: 'With men this is impossible; but with God all things are possible.', question: 'What is something that seemed impossible at first but turned out to be possible?' },
  { suit: 'courage', citation: 'Luke 11:9', saying: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.', question: 'What would you love to learn or try if you knew you could not fail?' },
  { suit: 'courage', citation: 'John 16:33', saying: 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.', question: 'What helps a person keep going when things get hard?' },
  { suit: 'courage', citation: 'John 8:32', saying: 'And ye shall know the truth, and the truth shall make you free.', question: 'Why can telling the truth feel scary, and why is it worth it?' },
  { suit: 'courage', citation: 'John 5:8', saying: 'Rise, take up thy bed, and walk.', question: 'What is a small first step toward something you have been wanting to do?' },
  { suit: 'courage', citation: 'Luke 12:32', saying: 'Fear not, little flock; for it is your Father\'s good pleasure to give you the kingdom.', question: 'Who cheers you on, and how does that change what you are willing to try?' },
  { suit: 'courage', citation: 'John 20:21', saying: 'as my Father hath sent me, even so send I you.', question: 'If you could be sent anywhere in the world to help people, where would you go?' },
  { suit: 'courage', citation: 'Luke 12:7', saying: 'But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.', question: 'What is something about you that makes you one of a kind?' },
  { suit: 'courage', citation: 'Matthew 5:41', saying: 'And whosoever shall compel thee to go a mile, go with him twain.', question: 'What does it look like to go the extra mile for someone?' },

  // PEACE
  { suit: 'peace', citation: 'Mark 4:39', saying: 'Peace, be still.', question: 'Where do you go, or what do you do, when you need to feel calm?' },
  { suit: 'peace', citation: 'John 14:27', saying: 'Peace I leave with you, my peace I give unto you … Let not your heart be troubled, neither let it be afraid.', question: 'What does peace feel like to you, and where do you find it?' },
  { suit: 'peace', citation: 'Matthew 11:28', saying: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', question: 'What is your favorite way to rest after a long day?' },
  { suit: 'peace', citation: 'Matthew 6:26', saying: 'Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them.', question: 'What can we learn from watching birds, animals and the rest of nature?' },
  { suit: 'peace', citation: 'Matthew 6:28', saying: 'Consider the lilies of the field, how they grow; they toil not, neither do they spin', question: 'What is something beautiful you noticed this week?' },
  { suit: 'peace', citation: 'Matthew 6:34', saying: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.', question: 'What helps you set aside worries about tomorrow and enjoy today?' },
  { suit: 'peace', citation: 'Matthew 5:9', saying: 'Blessed are the peacemakers: for they shall be called the children of God.', question: 'What is a good way to help two friends who are arguing make peace?' },
  { suit: 'peace', citation: 'Mark 6:31', saying: 'Come ye yourselves apart into a desert place, and rest a while.', question: 'If we had a whole day with nothing planned, how would you want to spend it?' },
  { suit: 'peace', citation: 'Luke 10:41-42', saying: 'Martha, Martha, thou art careful and troubled about many things … But one thing is needful', question: 'When life gets busy, what is the one thing you most want to make time for?' },
  { suit: 'peace', citation: 'John 21:12', saying: 'Come and dine.', question: 'What is your favorite meal to share with people you love, and why?' },
  { suit: 'peace', citation: 'John 14:2', saying: 'In my Father\'s house are many mansions … I go to prepare a place for you.', question: 'What makes a place feel like home to you?' },
  { suit: 'peace', citation: 'Mark 9:50', saying: 'have peace one with another.', question: 'What are some things that help a family or a group get along well?' },
  { suit: 'peace', citation: 'Luke 24:36', saying: 'Peace be unto you.', question: 'How can we tell when someone needs a little peace, and what could we do?' },

  // GRACE
  { suit: 'grace', citation: 'Matthew 18:22', saying: 'I say not unto thee, Until seven times: but, Until seventy times seven.', question: 'Jesus said to forgive seventy times seven. Why do you think forgiving can be so hard?' },
  { suit: 'grace', citation: 'Luke 23:34', saying: 'Father, forgive them; for they know not what they do.', question: 'How does it feel when someone forgives you?' },
  { suit: 'grace', citation: 'Luke 6:36', saying: 'Be ye therefore merciful, as your Father also is merciful.', question: 'What does it mean to give someone a second chance?' },
  { suit: 'grace', citation: 'Luke 6:37', saying: 'Judge not, and ye shall not be judged: condemn not, and ye shall not be condemned: forgive, and ye shall be forgiven', question: 'What might we miss about a person when we judge them too quickly?' },
  { suit: 'grace', citation: 'Luke 15:10', saying: 'there is joy in the presence of the angels of God over one sinner that repenteth.', question: 'Who is always glad to see you, and how can you tell?' },
  { suit: 'grace', citation: 'Luke 10:20', saying: 'rejoice, because your names are written in heaven.', question: 'What good news from this week could we celebrate together?' },
  { suit: 'grace', citation: 'Luke 19:10', saying: 'For the Son of man is come to seek and to save that which was lost.', question: 'How can we help someone who feels left out?' },
  { suit: 'grace', citation: 'John 8:11', saying: 'Neither do I condemn thee: go, and sin no more.', question: 'What helps someone make a fresh start after a mistake?' },
  { suit: 'grace', citation: 'Matthew 10:8', saying: 'freely ye have received, freely give.', question: 'What is something you have been given that you would love to pass on?' },
  { suit: 'grace', citation: 'Mark 12:43', saying: 'this poor widow hath cast more in, than all they which have cast into the treasury', question: 'Why can a small gift sometimes mean more than a big one?' },
  { suit: 'grace', citation: 'Matthew 7:3', saying: 'And why beholdest thou the mote that is in thy brother\'s eye, but considerest not the beam that is in thine own eye?', question: 'Why is it easier to spot other people\'s mistakes than our own?' },
  { suit: 'grace', citation: 'John 15:11', saying: 'These things have I spoken unto you, that my joy might remain in you, and that your joy might be full.', question: 'What fills you with joy, even on an ordinary day?' },
  { suit: 'grace', citation: 'Matthew 5:7', saying: 'Blessed are the merciful: for they shall obtain mercy.', question: 'Who do you know who is good at being gentle with others, and what do they do?' },
];

// assign ranks within suits
const counters = {};
for (const c of cards) {
  counters[c.suit] = (counters[c.suit] || 0) + 1;
  c.rank = counters[c.suit];
  c.id = `${c.suit}-${String(c.rank).padStart(2, '0')}`;
}

module.exports = { meta, suits, instructions, cards };
