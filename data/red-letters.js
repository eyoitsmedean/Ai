/**
 * Curated red-letter (Jesus speech) corpus — World English Bible (public domain).
 * Used for offline library, daily fallbacks, and citation verification.
 */
module.exports = {
  translation: 'WEB',
  translationName: 'World English Bible',
  passages: [
    // Anxiety & Worry
    {
      id: 'mt6-25-27',
      book: 'Matthew', chapter: 6, verseStart: 25, verseEnd: 27,
      theme: ['Anxiety & Worry', 'Peace'],
      text: "Therefore I tell you, don’t be anxious for your life: what you will eat, or what you will drink; nor yet for your body, what you will wear. Isn’t life more than food, and the body more than clothing? See the birds of the sky, that they don’t sow, neither do they reap, nor gather into barns. Your heavenly Father feeds them. Aren’t you of much more value than they? Which of you by being anxious can add one moment to his lifespan?",
    },
    {
      id: 'mt6-34',
      book: 'Matthew', chapter: 6, verseStart: 34, verseEnd: 34,
      theme: ['Anxiety & Worry', 'Peace'],
      text: "Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each day’s own evil is sufficient.",
    },
    {
      id: 'jn14-27',
      book: 'John', chapter: 14, verseStart: 27, verseEnd: 27,
      theme: ['Anxiety & Worry', 'Peace', 'Fear'],
      text: "Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful.",
    },
    {
      id: 'mt11-28-30',
      book: 'Matthew', chapter: 11, verseStart: 28, verseEnd: 30,
      theme: ['Anxiety & Worry', 'Suffering & Pain', 'Peace'],
      text: "Come to me, all you who labor and are heavily burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart; and you will find rest for your souls. For my yoke is easy, and my burden is light.",
    },
    // Fear
    {
      id: 'mt10-29-31',
      book: 'Matthew', chapter: 10, verseStart: 29, verseEnd: 31,
      theme: ['Fear', 'Anxiety & Worry'],
      text: "Aren’t two sparrows sold for an assarion coin? Not one of them falls to the ground apart from your Father’s will. But the very hairs of your head are all numbered. Therefore don’t be afraid. You are of more value than many sparrows.",
    },
    {
      id: 'lk12-32',
      book: 'Luke', chapter: 12, verseStart: 32, verseEnd: 32,
      theme: ['Fear', 'Hope'],
      text: "Don’t be afraid, little flock, for it is your Father’s good pleasure to give you the Kingdom.",
    },
    {
      id: 'jn16-33',
      book: 'John', chapter: 16, verseStart: 33, verseEnd: 33,
      theme: ['Fear', 'Hope', 'Suffering & Pain'],
      text: "I have told you these things, that in me you may have peace. In the world you have trouble; but cheer up! I have overcome the world.",
    },
    // Grief & Loss
    {
      id: 'mt5-4',
      book: 'Matthew', chapter: 5, verseStart: 4, verseEnd: 4,
      theme: ['Grief & Loss', 'Hope'],
      text: "Blessed are those who mourn, for they shall be comforted.",
    },
    {
      id: 'jn14-1-3',
      book: 'John', chapter: 14, verseStart: 1, verseEnd: 3,
      theme: ['Grief & Loss', 'Hope', 'Fear'],
      text: "Don’t let your heart be troubled. Believe in God. Believe also in me. In my Father’s house are many homes. If it weren’t so, I would have told you. I am going to prepare a place for you. If I go and prepare a place for you, I will come again and will receive you to myself; that where I am, you may be there also.",
    },
    {
      id: 'jn11-25-26',
      book: 'John', chapter: 11, verseStart: 25, verseEnd: 26,
      theme: ['Grief & Loss', 'Hope', 'Faith & Doubt'],
      text: "I am the resurrection and the life. He who believes in me will still live, even if he dies. Whoever lives and believes in me will never die. Do you believe this?",
    },
    // Forgiveness
    {
      id: 'mt6-14-15',
      book: 'Matthew', chapter: 6, verseStart: 14, verseEnd: 15,
      theme: ['Forgiveness', 'Shame & Guilt'],
      text: "For if you forgive men their trespasses, your heavenly Father will also forgive you. But if you don’t forgive men their trespasses, neither will your Father forgive your trespasses.",
    },
    {
      id: 'mt18-21-22',
      book: 'Matthew', chapter: 18, verseStart: 21, verseEnd: 22,
      theme: ['Forgiveness', 'Conflict & Relationships'],
      text: "I don’t tell you until seven times, but, until seventy times seven.",
    },
    {
      id: 'lk23-34',
      book: 'Luke', chapter: 23, verseStart: 34, verseEnd: 34,
      theme: ['Forgiveness', 'Suffering & Pain'],
      text: "Father, forgive them, for they don’t know what they are doing.",
    },
    {
      id: 'jn8-10-11',
      book: 'John', chapter: 8, verseStart: 10, verseEnd: 11,
      theme: ['Forgiveness', 'Shame & Guilt'],
      text: "Woman, where are your accusers? Did no one condemn you? … Neither do I condemn you. Go your way. From now on, sin no more.",
    },
    // Loneliness
    {
      id: 'mt28-20',
      book: 'Matthew', chapter: 28, verseStart: 20, verseEnd: 20,
      theme: ['Loneliness', 'Hope', 'Faith & Doubt'],
      text: "Behold, I am with you always, even to the end of the age.",
    },
    {
      id: 'jn14-18',
      book: 'John', chapter: 14, verseStart: 18, verseEnd: 18,
      theme: ['Loneliness', 'Hope'],
      text: "I will not leave you orphans. I will come to you.",
    },
    {
      id: 'jn15-9',
      book: 'John', chapter: 15, verseStart: 9, verseEnd: 9,
      theme: ['Loneliness', 'Hope', 'Peace'],
      text: "Even as the Father has loved me, I also have loved you. Remain in my love.",
    },
    // Conflict & Relationships
    {
      id: 'mt5-44',
      book: 'Matthew', chapter: 5, verseStart: 44, verseEnd: 44,
      theme: ['Conflict & Relationships', 'Forgiveness'],
      text: "But I tell you, love your enemies, bless those who curse you, do good to those who hate you, and pray for those who mistreat you and persecute you,",
    },
    {
      id: 'mt7-1-3',
      book: 'Matthew', chapter: 7, verseStart: 1, verseEnd: 3,
      theme: ['Conflict & Relationships', 'Shame & Guilt'],
      text: "Don’t judge, so that you won’t be judged. For with whatever judgment you judge, you will be judged; and with whatever measure you measure, it will be measured to you. Why do you see the speck that is in your brother’s eye, but don’t consider the beam that is in your own eye?",
    },
    {
      id: 'mt7-12',
      book: 'Matthew', chapter: 7, verseStart: 12, verseEnd: 12,
      theme: ['Conflict & Relationships'],
      text: "Therefore, whatever you desire for men to do to you, you shall also do to them; for this is the law and the prophets.",
    },
    {
      id: 'jn13-34-35',
      book: 'John', chapter: 13, verseStart: 34, verseEnd: 35,
      theme: ['Conflict & Relationships', 'Loneliness'],
      text: "A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another. By this everyone will know that you are my disciples, if you have love for one another.",
    },
    // Purpose & Direction
    {
      id: 'mt5-14-16',
      book: 'Matthew', chapter: 5, verseStart: 14, verseEnd: 16,
      theme: ['Purpose & Direction', 'Hope'],
      text: "You are the light of the world. A city located on a hill can’t be hidden. Neither do you light a lamp and put it under a measuring basket, but on a stand; and it shines to all who are in the house. Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.",
    },
    {
      id: 'mt6-33',
      book: 'Matthew', chapter: 6, verseStart: 33, verseEnd: 33,
      theme: ['Purpose & Direction', 'Anxiety & Worry'],
      text: "But seek first God’s Kingdom and his righteousness; and all these things will be given to you as well.",
    },
    {
      id: 'mt22-37-39',
      book: 'Matthew', chapter: 22, verseStart: 37, verseEnd: 39,
      theme: ['Purpose & Direction', 'Conflict & Relationships'],
      text: "‘You shall love the Lord your God with all your heart, with all your soul, and with all your mind.’ This is the first and great commandment. A second likewise is this, ‘You shall love your neighbor as yourself.’",
    },
    {
      id: 'jn15-16',
      book: 'John', chapter: 15, verseStart: 16, verseEnd: 16,
      theme: ['Purpose & Direction'],
      text: "You didn’t choose me, but I chose you and appointed you, that you should go and bear fruit, and that your fruit should remain; that whatever you will ask of the Father in my name, he may give it to you.",
    },
    // Faith & Doubt
    {
      id: 'mk9-23',
      book: 'Mark', chapter: 9, verseStart: 23, verseEnd: 23,
      theme: ['Faith & Doubt'],
      text: "If you can believe, all things are possible to him who believes.",
    },
    {
      id: 'mt17-20',
      book: 'Matthew', chapter: 17, verseStart: 20, verseEnd: 20,
      theme: ['Faith & Doubt', 'Hope'],
      text: "Because of your unbelief. For most certainly I tell you, if you have faith as a grain of mustard seed, you will tell this mountain, ‘Move from here to there,’ and it will move; and nothing will be impossible for you.",
    },
    {
      id: 'jn20-29',
      book: 'John', chapter: 20, verseStart: 29, verseEnd: 29,
      theme: ['Faith & Doubt'],
      text: "Because you have seen me, you have believed. Blessed are those who have not seen and have believed.",
    },
    // Suffering & Pain
    {
      id: 'mt5-10-12',
      book: 'Matthew', chapter: 5, verseStart: 10, verseEnd: 12,
      theme: ['Suffering & Pain', 'Hope'],
      text: "Blessed are those who have been persecuted for righteousness’ sake, for theirs is the Kingdom of Heaven. Blessed are you when people reproach you, persecute you, and say all kinds of evil against you falsely, for my sake. Rejoice, and be exceedingly glad, for great is your reward in heaven. For that is how they persecuted the prophets who were before you.",
    },
    {
      id: 'lk6-21',
      book: 'Luke', chapter: 6, verseStart: 21, verseEnd: 21,
      theme: ['Suffering & Pain', 'Hope', 'Grief & Loss'],
      text: "Blessed are you who hunger now, for you will be filled. Blessed are you who weep now, for you will laugh.",
    },
    // Shame & Guilt
    {
      id: 'lk15-20-24',
      book: 'Luke', chapter: 15, verseStart: 20, verseEnd: 24,
      theme: ['Shame & Guilt', 'Forgiveness', 'Hope'],
      text: "But while he was still far off, his father saw him and was moved with compassion, and ran, fell on his neck, and kissed him. The son said to him, ‘Father, I have sinned against heaven and in your sight. I am no longer worthy to be called your son.’ But the father said to his servants, ‘Bring out the best robe and put it on him. Put a ring on his hand and sandals on his feet. Bring the fattened calf, kill it, and let’s eat and celebrate; for this, my son, was dead and is alive again. He was lost and is found.’",
      note: 'Parable of the Lost Son — Jesus teaching in narrative form',
    },
    {
      id: 'lk18-13-14',
      book: 'Luke', chapter: 18, verseStart: 13, verseEnd: 14,
      theme: ['Shame & Guilt', 'Faith & Doubt'],
      text: "But the tax collector, standing far away, wouldn’t even lift up his eyes to heaven, but beat his breast, saying, ‘God, be merciful to me, a sinner!’ I tell you, this man went down to his house justified rather than the other; for everyone who exalts himself will be humbled, but he who humbles himself will be exalted.",
      note: 'Parable of the Pharisee and the Tax Collector',
    },
    // Peace
    {
      id: 'mt5-9',
      book: 'Matthew', chapter: 5, verseStart: 9, verseEnd: 9,
      theme: ['Peace', 'Conflict & Relationships'],
      text: "Blessed are the peacemakers, for they shall be called children of God.",
    },
    {
      id: 'jn14-1',
      book: 'John', chapter: 14, verseStart: 1, verseEnd: 1,
      theme: ['Peace', 'Fear', 'Anxiety & Worry'],
      text: "Don’t let your heart be troubled. Believe in God. Believe also in me.",
    },
    // Hope
    {
      id: 'mt7-7-8',
      book: 'Matthew', chapter: 7, verseStart: 7, verseEnd: 8,
      theme: ['Hope', 'Faith & Doubt', 'Purpose & Direction'],
      text: "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you. For everyone who asks receives. He who seeks finds. To him who knocks it will be opened.",
    },
    {
      id: 'jn10-10',
      book: 'John', chapter: 10, verseStart: 10, verseEnd: 10,
      theme: ['Hope', 'Purpose & Direction'],
      text: "The thief only comes to steal, kill, and destroy. I came that they may have life, and may have it abundantly.",
    },
    {
      id: 'mt28-18-19',
      book: 'Matthew', chapter: 28, verseStart: 18, verseEnd: 19,
      theme: ['Hope', 'Purpose & Direction'],
      text: "All authority has been given to me in heaven and on earth. Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit,",
    },
    // Generosity / wealth (extra themes for advisor depth)
    {
      id: 'mt6-19-21',
      book: 'Matthew', chapter: 6, verseStart: 19, verseEnd: 21,
      theme: ['Purpose & Direction', 'Anxiety & Worry'],
      text: "Don’t lay up treasures for yourselves on the earth, where moth and rust consume, and where thieves break through and steal; but lay up for yourselves treasures in heaven, where neither moth nor rust consume, and where thieves don’t break through and steal; for where your treasure is, there your heart will be also.",
    },
    {
      id: 'lk6-38',
      book: 'Luke', chapter: 6, verseStart: 38, verseEnd: 38,
      theme: ['Conflict & Relationships', 'Hope'],
      text: "Give, and it will be given to you: good measure, pressed down, shaken together, and running over, will be given to you. For with the same measure you measure it will be measured back to you.",
    },
    {
      id: 'mt5-3-6',
      book: 'Matthew', chapter: 5, verseStart: 3, verseEnd: 6,
      theme: ['Hope', 'Purpose & Direction', 'Suffering & Pain'],
      text: "Blessed are the poor in spirit, for theirs is the Kingdom of Heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the gentle, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be filled.",
    },
    // Mark — storm, faith, children
    {
      id: 'mk4-39',
      book: 'Mark', chapter: 4, verseStart: 39, verseEnd: 39,
      theme: ['Fear', 'Peace', 'Anxiety & Worry'],
      text: "He awoke and rebuked the wind, and said to the sea, “Peace! Be still!” The wind ceased and there was a great calm.",
      note: 'Jesus speaks to the storm — narrative with His command',
    },
    {
      id: 'mk5-36',
      book: 'Mark', chapter: 5, verseStart: 36, verseEnd: 36,
      theme: ['Fear', 'Faith & Doubt', 'Grief & Loss'],
      text: "Don’t be afraid, only believe.",
    },
    {
      id: 'mk10-14-15',
      book: 'Mark', chapter: 10, verseStart: 14, verseEnd: 15,
      theme: ['Hope', 'Faith & Doubt', 'Purpose & Direction'],
      text: "Allow the little children to come to me! Don’t forbid them, for God’s Kingdom belongs to such as these. Most certainly I tell you, whoever will not receive God’s Kingdom like a little child, he will in no way enter into it.",
    },
    // Luke — Martha, enemies
    {
      id: 'lk10-41-42',
      book: 'Luke', chapter: 10, verseStart: 41, verseEnd: 42,
      theme: ['Anxiety & Worry', 'Peace', 'Purpose & Direction'],
      text: "Martha, Martha, you are anxious and troubled about many things, but one thing is needed. Mary has chosen the good part, which will not be taken away from her.",
    },
    {
      id: 'lk6-27-28',
      book: 'Luke', chapter: 6, verseStart: 27, verseEnd: 28,
      theme: ['Conflict & Relationships', 'Forgiveness'],
      text: "But I tell you who hear: love your enemies, do good to those who hate you, bless those who curse you, and pray for those who mistreat you.",
    },
    // John — life, light, abide
    {
      id: 'jn3-16-17',
      book: 'John', chapter: 3, verseStart: 16, verseEnd: 17,
      theme: ['Hope', 'Faith & Doubt', 'Shame & Guilt'],
      text: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life. For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.",
    },
    {
      id: 'jn6-35',
      book: 'John', chapter: 6, verseStart: 35, verseEnd: 35,
      theme: ['Hope', 'Loneliness', 'Purpose & Direction'],
      text: "I am the bread of life. He who comes to me will not be hungry, and he who believes in me will never be thirsty.",
    },
    {
      id: 'jn8-12',
      book: 'John', chapter: 8, verseStart: 12, verseEnd: 12,
      theme: ['Hope', 'Fear', 'Purpose & Direction'],
      text: "I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.",
    },
    {
      id: 'jn15-4-5',
      book: 'John', chapter: 15, verseStart: 4, verseEnd: 5,
      theme: ['Purpose & Direction', 'Faith & Doubt', 'Loneliness'],
      text: "Remain in me, and I in you. As the branch can’t bear fruit by itself unless it remains in the vine, so neither can you, unless you remain in me. I am the vine. You are the branches. He who remains in me and I in him bears much fruit, for apart from me you can do nothing.",
    },
    {
      id: 'mt9-12-13',
      book: 'Matthew', chapter: 9, verseStart: 12, verseEnd: 13,
      theme: ['Shame & Guilt', 'Hope', 'Suffering & Pain'],
      text: "Those who are healthy have no need for a physician, but those who are sick do. But you go and learn what this means: ‘I desire mercy, and not sacrifice,’ for I came not to call the righteous, but sinners to repentance.",
    },
    {
      id: 'mt13-31-32',
      book: 'Matthew', chapter: 13, verseStart: 31, verseEnd: 32,
      theme: ['Hope', 'Faith & Doubt', 'Purpose & Direction'],
      text: "The Kingdom of Heaven is like a grain of mustard seed which a man took, and sowed in his field, which indeed is smaller than all seeds. But when it is grown, it is greater than the herbs and becomes a tree, so that the birds of the air come and lodge in its branches.",
      note: 'Parable of the Mustard Seed',
    },
    {
      id: 'mt18-12-14',
      book: 'Matthew', chapter: 18, verseStart: 12, verseEnd: 14,
      theme: ['Loneliness', 'Hope', 'Shame & Guilt'],
      text: "What do you think? If a man has one hundred sheep, and one of them goes astray, doesn’t he leave the ninety-nine, go to the mountains, and seek that which has gone astray? If he finds it, most certainly I tell you, he rejoices over it more than over the ninety-nine which have not gone astray. Even so it is not the will of your Father who is in heaven that one of these little ones should perish.",
      note: 'Parable of the Lost Sheep',
    },
    {
      id: 'lk10-33-37',
      book: 'Luke', chapter: 10, verseStart: 33, verseEnd: 37,
      theme: ['Conflict & Relationships', 'Purpose & Direction', 'Suffering & Pain'],
      text: "But a certain Samaritan, as he traveled, came where he was. When he saw him, he was moved with compassion, came to him, and bound up his wounds, pouring on oil and wine. He set him on his own animal, brought him to an inn, and took care of him. On the next day, when he departed, he took out two denarii, gave them to the host, and said to him, ‘Take care of him. Whatever you spend beyond that, I will repay you when I return.’ Now which of these three do you think seemed to be a neighbor to him who fell among the robbers?” He said, “He who showed mercy on him.” Then Jesus said to him, “Go and do likewise.”",
      note: 'Parable of the Good Samaritan',
    },
    {
      id: 'jn10-11-14',
      book: 'John', chapter: 10, verseStart: 11, verseEnd: 14,
      theme: ['Loneliness', 'Hope', 'Fear'],
      text: "I am the good shepherd. The good shepherd lays down his life for the sheep. He who is a hired hand and not a shepherd, who doesn’t own the sheep, sees the wolf coming, leaves the sheep, and flees. The wolf snatches the sheep and scatters them. The hired hand flees because he is a hired hand and doesn’t care for the sheep. I am the good shepherd. I know my own, and I’m known by my own.",
      note: 'Parable / figure of the Good Shepherd',
    },
  ],
};

module.exports.THEMES = [
  'Anxiety & Worry',
  'Grief & Loss',
  'Forgiveness',
  'Loneliness',
  'Conflict & Relationships',
  'Fear',
  'Purpose & Direction',
  'Faith & Doubt',
  'Suffering & Pain',
  'Shame & Guilt',
  'Peace',
  'Hope',
];

module.exports.cite = function cite(p) {
  if (p.verseStart === p.verseEnd) return `${p.book} ${p.chapter}:${p.verseStart}`;
  return `${p.book} ${p.chapter}:${p.verseStart}–${p.verseEnd}`;
};

module.exports.byTheme = function byTheme(theme) {
  return module.exports.passages.filter(p => p.theme.includes(theme));
};

module.exports.byBook = function byBook(book) {
  const b = String(book || '').trim();
  if (!b) return module.exports.passages;
  return module.exports.passages.filter(p => p.book === b);
};

module.exports.BOOKS = ['Matthew', 'Mark', 'Luke', 'John'];

module.exports.findByRef = function findByRef(ref) {
  // Accept "Matthew 6:34", "Matt 6:34-35", "John 14:1–3"
  const m = String(ref).match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:\s*[–-]\s*(\d+))?/);
  if (!m) return null;
  const bookRaw = m[1].replace(/\s+/g, ' ').trim().toLowerCase();
  const bookMap = {
    matthew: 'Matthew', matt: 'Matthew', mt: 'Matthew',
    mark: 'Mark', mk: 'Mark', mr: 'Mark',
    luke: 'Luke', lk: 'Luke', lu: 'Luke',
    john: 'John', jn: 'John', joh: 'John',
  };
  const book = bookMap[bookRaw] || bookMap[bookRaw.replace(/\./g, '')];
  if (!book) return null;
  const chapter = +m[2];
  const start = +m[3];
  const end = m[4] ? +m[4] : start;
  return module.exports.passages.find(p =>
    p.book === book &&
    p.chapter === chapter &&
    p.verseStart <= end &&
    p.verseEnd >= start
  ) || null;
};
