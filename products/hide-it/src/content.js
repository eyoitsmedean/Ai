// Hide It in Your Heart: every word the game shows.
//
// Each saying's `text` is exact KJV (1769) as spoken by Jesus, taken from
// data/spoken-gospels.json. A text may be the whole verse or a contiguous
// span of it (narration such as "And Jesus answering saith unto them," is
// left out). verify.js checks every one against the corpus and fails the
// build if a word differs.
//
// `cue` is a plain, short prompt shown on the review card before the saying
// appears. It describes the moment, never paraphrases his words.
//
// Within each collection, sayings run from shortest to longest, and the
// first collection holds the shortest sayings of all, so a new player
// starts with something they can hold in one breath. The one exception is
// the Lord's Prayer (sayings marked `prayerLine`), which is kept in prayer
// order so it can be learned line by line; verify.js checks that order.
//
// Every cue is different, so a review card always points to one saying.

const collections = [
  {
    id: 'first',
    name: 'First Words',
    blurb: 'Short sayings to start with. Each one fits in a single breath.',
    sayings: [
      { id: 'peace-be-still', ref: 'Mark 4:39', cue: 'On the sea, to the wind and waves', text: 'Peace, be still.' },
      { id: 'only-believe', ref: 'Mark 5:36', cue: 'To a father who has just heard the worst news', text: 'Be not afraid, only believe.' },
      { id: 'go-in-peace', ref: 'Luke 7:50', cue: 'To a woman who came to him in tears', text: 'Thy faith hath saved thee; go in peace.' },
      { id: 'it-is-i', ref: 'Matthew 14:27', cue: 'Walking to the boat on the water', text: 'Be of good cheer; it is I; be not afraid.' },
      { id: 'yoke-easy', ref: 'Matthew 11:30', cue: 'What his yoke is like', text: 'For my yoke is easy, and my burden is light.' },
      { id: 'fishers-of-men', ref: 'Matthew 4:19', cue: 'By the Sea of Galilee, to two brothers', text: 'Follow me, and I will make you fishers of men.' },
      { id: 'forgive-them', ref: 'Luke 23:34', cue: 'From the cross', text: 'Father, forgive them; for they know not what they do.' },
      { id: 'not-comfortless', ref: 'John 14:18', cue: 'At the last supper, a promise', text: 'I will not leave you comfortless: I will come to you.' },
      { id: 'if-any-thirst', ref: 'John 7:37', cue: 'On the last day of the feast', text: 'If any man thirst, let him come unto me, and drink.' },
    ],
  },
  {
    id: 'beatitudes',
    name: 'The Beatitudes',
    blurb: 'The blessings that open the Sermon on the Mount.',
    sayings: [
      { id: 'merciful', ref: 'Matthew 5:7', cue: 'Blessed are the merciful', text: 'Blessed are the merciful: for they shall obtain mercy.' },
      { id: 'meek', ref: 'Matthew 5:5', cue: 'Blessed are the meek', text: 'Blessed are the meek: for they shall inherit the earth.' },
      { id: 'mourn', ref: 'Matthew 5:4', cue: 'Blessed are they that mourn', text: 'Blessed are they that mourn: for they shall be comforted.' },
      { id: 'pure-in-heart', ref: 'Matthew 5:8', cue: 'Blessed are the pure in heart', text: 'Blessed are the pure in heart: for they shall see God.' },
      { id: 'poor-in-spirit', ref: 'Matthew 5:3', cue: 'Blessed are the poor in spirit', text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
      { id: 'peacemakers', ref: 'Matthew 5:9', cue: 'Blessed are the peacemakers', text: 'Blessed are the peacemakers: for they shall be called the children of God.' },
      { id: 'hunger-thirst', ref: 'Matthew 5:6', cue: 'Blessed are they which do hunger', text: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.' },
    ],
  },
  {
    id: 'i-am',
    name: 'I Am',
    blurb: 'Seven ways he named himself in the Gospel of John.',
    sayings: [
      { id: 'good-shepherd', ref: 'John 10:11', cue: 'The shepherd and the sheep', text: 'I am the good shepherd: the good shepherd giveth his life for the sheep.' },
      { id: 'way-truth-life', ref: 'John 14:6', cue: 'An answer to Thomas: how can we know the way?', text: 'I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
      { id: 'resurrection', ref: 'John 11:25', cue: 'To Martha, outside Bethany', text: 'I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live:' },
      { id: 'bread-of-life', ref: 'John 6:35', cue: 'The day after the loaves and fishes', text: 'I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.' },
      { id: 'light-of-world', ref: 'John 8:12', cue: 'Teaching in the temple', text: 'I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.' },
      { id: 'door', ref: 'John 10:9', cue: 'The door of the sheepfold', text: 'I am the door: by me if any man enter in, he shall be saved, and shall go in and out, and find pasture.' },
      { id: 'vine-branches', ref: 'John 15:5', cue: 'Abiding in the vine', text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.' },
    ],
  },
  {
    id: 'comfort',
    name: 'Comfort',
    blurb: 'Words for hard days, to have ready before you need them.',
    sayings: [
      { id: 'rest-a-while', ref: 'Mark 6:31', cue: 'To his tired friends, after a long day', text: 'Come ye yourselves apart into a desert place, and rest a while.' },
      { id: 'with-you-alway', ref: 'Matthew 28:20', cue: 'His last words in Matthew', text: 'I am with you alway, even unto the end of the world.' },
      { id: 'heart-troubled', ref: 'John 14:1', cue: 'At the last supper', text: 'Let not your heart be troubled: ye believe in God, believe also in me.' },
      { id: 'little-flock', ref: 'Luke 12:32', cue: 'To his friends, who were anxious', text: "Fear not, little flock; for it is your Father's good pleasure to give you the kingdom." },
      { id: 'come-unto-me', ref: 'Matthew 11:28', cue: 'An invitation to the weary', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
      { id: 'hairs-numbered', ref: 'Luke 12:7', cue: 'Sparrows, and every hair counted', text: 'But even the very hairs of your head are all numbered. Fear not therefore: ye are of more value than many sparrows.' },
      { id: 'many-mansions', ref: 'John 14:2', cue: "In his Father's house", text: "In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you." },
      { id: 'my-peace', ref: 'John 14:27', cue: 'A parting gift', text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
      { id: 'good-cheer', ref: 'John 16:33', cue: 'At the close of the last supper', text: 'These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.' },
    ],
  },
  {
    id: 'prayer',
    name: 'Prayer',
    blurb: "The Lord's Prayer, line by line in order, then what he taught about asking.",
    sayings: [
      { prayerLine: true, id: 'our-father', ref: 'Matthew 6:9', cue: "The Lord's Prayer: the opening", text: 'Our Father which art in heaven, Hallowed be thy name.' },
      { prayerLine: true, id: 'thy-kingdom', ref: 'Matthew 6:10', cue: "The Lord's Prayer: the kingdom", text: 'Thy kingdom come. Thy will be done in earth, as it is in heaven.' },
      { prayerLine: true, id: 'daily-bread', ref: 'Matthew 6:11', cue: "The Lord's Prayer: today's need", text: 'Give us this day our daily bread.' },
      { prayerLine: true, id: 'forgive-debts', ref: 'Matthew 6:12', cue: "The Lord's Prayer: forgiveness", text: 'And forgive us our debts, as we forgive our debtors.' },
      { prayerLine: true, id: 'lead-us-not', ref: 'Matthew 6:13', cue: "The Lord's Prayer: the close", text: 'And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.' },
      { id: 'into-thy-hands', ref: 'Luke 23:46', cue: 'His last prayer from the cross', text: 'Father, into thy hands I commend my spirit:' },
      { id: 'two-or-three', ref: 'Matthew 18:20', cue: 'When a few gather', text: 'For where two or three are gathered together in my name, there am I in the midst of them.' },
      { id: 'ask-seek-knock', ref: 'Matthew 7:7', cue: 'On asking, seeking and knocking', text: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:' },
    ],
  },
  {
    id: 'love',
    name: 'Love One Another',
    blurb: 'What he asked of his friends, and how he loved them first.',
    sayings: [
      { id: 'love-neighbour', ref: 'Matthew 22:39', cue: 'The second commandment', text: 'Thou shalt love thy neighbour as thyself.' },
      { id: 'be-merciful', ref: 'Luke 6:36', cue: 'On the plain, to a great crowd', text: 'Be ye therefore merciful, as your Father also is merciful.' },
      { id: 'golden-rule', ref: 'Luke 6:31', cue: 'How to treat others', text: 'And as ye would that men should do to you, do ye also to them likewise.' },
      { id: 'greater-love', ref: 'John 15:13', cue: 'The measure of love', text: 'Greater love hath no man than this, that a man lay down his life for his friends.' },
      { id: 'by-this', ref: 'John 13:35', cue: 'How the world will know', text: 'By this shall all men know that ye are my disciples, if ye have love one to another.' },
      { id: 'great-commandment', ref: 'Matthew 22:37', cue: 'The first and great commandment', text: 'Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind.' },
      { id: 'new-commandment', ref: 'John 13:34', cue: 'A new commandment', text: 'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.' },
      { id: 'god-so-loved', ref: 'John 3:16', cue: 'To Nicodemus, at night', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
    ],
  },
  {
    id: 'seek-first',
    name: 'Seek First',
    blurb: 'On trust, treasure, and the lilies of the field.',
    sayings: [
      { id: 'treasure', ref: 'Matthew 6:21', cue: 'Treasure in heaven', text: 'For where your treasure is, there will your heart be also.' },
      { id: 'seek-and-save', ref: 'Luke 19:10', cue: 'At the house of Zacchaeus', text: 'For the Son of man is come to seek and to save that which was lost.' },
      { id: 'more-abundantly', ref: 'John 10:10', cue: 'Why he came', text: 'I am come that they might have life, and that they might have it more abundantly.' },
      { id: 'lilies', ref: 'Matthew 6:28', cue: 'The lilies of the field', text: 'Consider the lilies of the field, how they grow; they toil not, neither do they spin:' },
      { id: 'no-thought-morrow', ref: 'Matthew 6:34', cue: 'About tomorrow', text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself.' },
      { id: 'seek-ye-first', ref: 'Matthew 6:33', cue: 'What to seek first', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
      { id: 'let-your-light', ref: 'Matthew 5:16', cue: 'Letting your light shine', text: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.' },
    ],
  },
];

// Practice modes, in the order a saying moves through them.
const modes = [
  {
    id: 'read',
    name: 'Read',
    short: 'Read it slowly, then reveal it a phrase at a time.',
    instructions: 'Read the saying aloud if you can. Then tap Reveal to bring it back one phrase at a time and say each part before you see it.',
    action: 'Reveal next phrase',
    done: 'Read through',
  },
  {
    id: 'fade',
    name: 'Fade',
    short: 'Words disappear a few at a time.',
    instructions: 'Each round hides a few more words. Say the whole saying, blanks and all, then tap Next round. Tap any blank to peek.',
    action: 'Next round',
    done: 'Every word hidden',
  },
  {
    id: 'letters',
    name: 'First Letters',
    short: 'Only the first letters are left. Type the saying.',
    instructions: 'Each word shows only its first letter. Type the saying from memory. Capitals and punctuation do not matter. Spell thee, thou, ye, hath and shalt as written.',
    action: 'Check',
    done: 'Typed from memory',
  },
  {
    id: 'build',
    name: 'Build',
    short: 'Tap the words in order.',
    instructions: 'The words are shuffled. Tap them in order to build the saying. A wrong tap shakes gently and costs nothing but a moment.',
    action: 'Tap the next word',
    done: 'Built in order',
  },
];

// Mastery levels follow the Leitner box a saying sits in (0 = new).
const mastery = [
  { box: 0, name: 'New', note: 'Not started yet.' },
  { box: 1, name: 'Learning', note: 'Back tomorrow.' },
  { box: 2, name: 'Familiar', note: 'Back in a few days.' },
  { box: 3, name: 'Growing', note: 'Back in about a week.' },
  { box: 4, name: 'Steady', note: 'Back in about two weeks.' },
  { box: 5, name: 'Hidden in your heart', note: 'Back in about a month, to keep it fresh.' },
];

const ui = {
  appName: 'Hide It in Your Heart',
  brand: 'Red Letter',
  tagline: 'A memory game for the words of Jesus',
  epigraph: 'Fifty-five sayings of Jesus, in the King James words, learned a little each day.',

  nav: {
    today: 'Today',
    collections: 'Sayings',
    progress: 'Progress',
    about: 'About',
  },

  welcome: {
    title: 'Welcome',
    body: [
      'Pick a saying and practice it four ways: read it, watch it fade, type it from its first letters, and build it from shuffled words.',
      'Once you know a saying, it joins your review. It comes back tomorrow, then in a few days, then a week, then longer, right before you would forget it.',
      'A few minutes a day is plenty.',
    ],
    start: 'Start with a short one',
  },

  today: {
    title: 'Today',
    dueHeading: 'Ready for review',
    dueCount: (n) => (n === 1 ? '1 saying is ready for review.' : `${n} sayings are ready for review.`),
    noneDue: 'Nothing is due right now. Your sayings are resting.',
    newHeading: 'Learn something new',
    newSuggest: 'Here is the next saying in your list.',
    startReview: 'Start review',
    learnNew: 'Learn this saying',
    allLearned: 'You have started every saying. Reviews will keep them fresh.',
    sessionDone: 'That is everything for today.',
    sessionDoneNote: 'Come back tomorrow, or keep practicing any saying you like.',
    newDone: (n) => (n === 1 ? 'You learned 1 new saying today. That is plenty.' : `You learned ${n} new sayings today. That is plenty.`),
    newDoneNote: 'Let them settle. You can raise the daily number in Progress.',
    nextUp: 'Next up',
  },

  review: {
    showCue: 'Here is the moment. Can you say what he said?',
    reveal: 'Show the saying',
    rateHeading: 'How did that go?',
    rateAgain: 'Not yet',
    rateAgainNote: 'See it again tomorrow',
    rateHard: 'With help',
    rateHardNote: 'Stay at this level',
    rateGood: 'I knew it',
    rateGoodNote: 'Move up a level',
    typeInstead: 'Type it instead',
    counter: (i, n) => `Saying ${i} of ${n}`,
    check: 'Check',
  },

  practice: {
    back: 'Back to sayings',
    hideToRecall: 'Hide it and recall',
    readAgain: 'Read it again',
    toToday: 'Back to today',
    peeks: (n) => (n === 1 ? '1 peek' : `${n} peeks`),
    mistakes: (n) => (n === 0 ? 'No wrong taps' : n === 1 ? '1 wrong tap' : `${n} wrong taps`),
    score: (got, total) => `${got} of ${total} words`,
    nearHeading: 'Small typos, counted as right',
    modeLabel: 'Practice mode',
    nextMode: 'Next mode',
    tryAgain: 'Try again',
    finish: 'Finish',
    peek: 'Peek',
    hint: 'Hint',
    progress: (i, n) => `Round ${i} of ${n}`,
    typeLabel: 'Type the saying',
    typePlaceholder: 'Type from memory',
    chipsLabel: 'Shuffled words',
    builtLabel: 'Your saying so far',
    undo: 'Undo last word',
    reset: 'Start over',
  },

  feedback: {
    perfect: 'Every word. Well done.',
    close: (missed) => (missed === 1 ? 'So close. One word to look at.' : `Close. ${missed} words to look at.`),
    keepGoing: 'A good start. Look over the words below and try once more.',
    missedHeading: 'Words to look at',
    extraHeading: 'Words that were not in the saying',
    builtCorrect: 'Built in order.',
    wrongChip: 'Not that one yet.',
    modeComplete: (mode) => `${mode} complete.`,
    sayingLearned: 'Added to your review. It will come back tomorrow.',
    levelUp: (level) => `Now ${level}.`,
    stayed: 'It will stay at this level for now.',
    again: 'It will come back tomorrow. That is how memory grows.',
  },

  streak: {
    label: 'Days in a row',
    count: (n) => (n === 1 ? '1 day' : `${n} days`),
    grace: (n) => (n === 1 ? '1 grace day left this week' : `${n} grace days left this week`),
    graceExplain: 'Missed a day? A grace day covers it, two each week. Your streak waits for you.',
    graceUsed: 'A grace day covered yesterday. Welcome back.',
    restarted: 'Welcome back. Every day you practice counts, and today is a good day to start again.',
    zero: 'Practice today to start a streak.',
  },

  progress: {
    title: 'Progress',
    learned: (n, total) => `${n} of ${total} sayings started`,
    mastered: (n) => (n === 1 ? '1 saying hidden in your heart' : `${n} sayings hidden in your heart`),
    byCollection: 'By collection',
    nextReview: 'Next review',
    dueNow: 'Due now',
    dueIn: (d) => (d === 1 ? 'Tomorrow' : `In ${d} days`),
    reset: 'Reset all progress',
    resetConfirm: 'This clears every saying, review date and streak on this device. Reset?',
    resetDone: 'Progress cleared.',
    storageOff: 'Your browser is not letting this page save, so progress lasts until you close it.',
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeAuto: 'Match my device',
    themeLight: 'Light',
    themeDark: 'Dark',
    motion: 'Reduce motion',
    newPerDay: 'New sayings per day',
  },

  about: {
    title: 'About',
    body: [
      'Hide It in Your Heart helps you memorize the words Jesus spoke, as the King James Version gives them. Every saying is checked word for word against the red-letter text of the four Gospels.',
      'The title comes from Psalm 119:11, "Thy word have I hid in mine heart."',
      'Your progress stays in this browser on this device. Nothing is sent anywhere.',
      'This is a memory aid for personal devotion. It is not a substitute for a church community, pastoral care or professional counseling.',
    ],
    fonts: 'Set in IM Fell English and Literata, both under the SIL Open Font License.',
    kjvNote: 'Scripture from the King James Version (1769), public domain in the United States.',
    credit: 'A Red Letter project.',
  },

  a11y: {
    skip: 'Skip to main content',
    themeToggle: 'Change theme',
    closeDialog: 'Close',
    blank: (n) => `Hidden word ${n}`,
    chip: (w) => `Add the word ${w}`,
    removeChip: (w) => `Remove the word ${w}`,
    feedbackRegion: 'Feedback',
    masteryOf: (level) => `Mastery: ${level}`,
    modeDone: (mode) => `${mode}, done`,
    weekStrip: 'The last seven days',
    practicedOn: (day) => `${day}: practiced`,
    graceOn: (day) => `${day}: covered by a grace day`,
    restOn: (day) => `${day}: rest`,
  },
};

module.exports = { collections, modes, mastery, ui };
