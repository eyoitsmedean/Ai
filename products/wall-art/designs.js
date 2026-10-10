'use strict';
// Words in Frame: content for 12 typographic wall-art prints.
// Every `quote` is the exact KJV wording of Jesus from data/spoken-gospels.json
// (a contiguous sub-span of one verse). `lines` is the hand-set line breaking
// for the print; joined with spaces it must equal `quote`. Run verify.js.

const collection = {
  brand: 'Red Letter',
  name: 'Words in Frame',
  subtitle: 'Twelve typographic prints of the words of Jesus',
  edition: 'King James Version',
  blurb:
    'Twelve short sayings of Jesus, set in type and made to hang on a wall. ' +
    'Each print is drawn as its own design, with line breaks chosen by hand, ' +
    'and all twelve sit together as one family.',
  licence:
    'For personal printing and display. The King James Version is in the public domain in the United States.',
};

// Print sizes. One master file per ratio, at the largest size in that ratio;
// smaller frames in the same ratio print from the same file.
const DPI = 300;
const SAFE_MARGIN_IN = 0.4;
const ratios = [
  {
    key: '4x5', label: '4:5', master: { w: 16, h: 20 }, px: [4800, 6000],
    prints: ['8 x 10 in', '16 x 20 in'],
  },
  {
    key: '3x4', label: '3:4', master: { w: 18, h: 24 }, px: [5400, 7200],
    prints: ['12 x 16 in', '18 x 24 in'],
  },
  {
    key: '2x3', label: '2:3', master: { w: 24, h: 36 }, px: [7200, 10800],
    prints: ['8 x 12 in', '12 x 18 in', '16 x 24 in', '20 x 30 in', '24 x 36 in'],
  },
  {
    key: '11x14', label: '11:14', master: { w: 11, h: 14 }, px: [3300, 4200],
    prints: ['11 x 14 in'],
  },
  {
    key: 'iso', label: 'ISO A', master: { w: 297 / 25.4, h: 420 / 25.4, name: 'A3' }, px: [3508, 4961],
    prints: ['A5', 'A4', 'A3'],
  },
];

// Grounds: paper (#f6f3ee), stone (#e9e3da), ink (#23201d, dark), red (#a3142c).
// layout: how the type sits on the sheet. ornament: drawn in CSS/SVG at build.
// accent: a word or phrase from one line, set in red (or paper on red/ink grounds).
const designs = [
  {
    n: 1,
    slug: 'light-of-the-world',
    title: 'Light',
    ref: 'Matthew 5:14',
    quote: 'Ye are the light of the world.',
    lines: ['Ye are the light', 'of the world.'],
    accent: 'light',
    ground: 'paper',
    layout: 'centered-large',
    ornament: 'radiant-rule',
    note: 'Large, centred, a fine rule of short rays above the text.',
  },
  {
    n: 2,
    slug: 'come-unto-me',
    title: 'Rest',
    ref: 'Matthew 11:28',
    quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    lines: ['Come unto me,', 'all ye that labour', 'and are heavy laden,', 'and I will', 'give you rest.'],
    accent: 'rest',
    ground: 'stone',
    layout: 'left-ragged',
    ornament: 'hairline-margin',
    note: 'Flush left on a hairline margin rule, the last line given room to breathe.',
  },
  {
    n: 3,
    slug: 'where-your-treasure-is',
    title: 'Treasure',
    ref: 'Matthew 6:21',
    quote: 'For where your treasure is, there will your heart be also.',
    lines: ['For where', 'your treasure is,', 'there will', 'your heart be also.'],
    accent: 'heart',
    ground: 'paper',
    layout: 'stepped',
    ornament: 'double-frame',
    note: 'Lines step in pairs inside a thin double frame.',
  },
  {
    n: 4,
    slug: 'ask-seek-knock',
    title: 'Ask, Seek, Knock',
    ref: 'Matthew 7:7',
    quote: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you',
    lines: ['Ask,', 'and it shall be given you;', 'seek,', 'and ye shall find;', 'knock,', 'and it shall be opened unto you'],
    singleWordLines: ['Ask,', 'seek,', 'knock,'],
    accent: ['Ask,', 'seek,', 'knock,'],
    ground: 'stone',
    layout: 'triad',
    ornament: 'three-rules',
    note: 'Three stanzas. The verbs are set large in red, each answer small beneath it.',
  },
  {
    n: 5,
    slug: 'peace-be-still',
    title: 'Be Still',
    ref: 'Mark 4:39',
    quote: 'Peace, be still.',
    lines: ['Peace,', 'be still.'],
    singleWordLines: ['Peace,'],
    accent: null,
    ground: 'red',
    layout: 'centered-monumental',
    ornament: 'wave-line',
    note: 'Paper-coloured type on the red ground, very large, a single calm wave line below.',
  },
  {
    n: 6,
    slug: 'only-believe',
    title: 'Only Believe',
    ref: 'Mark 5:36',
    quote: 'Be not afraid, only believe.',
    lines: ['Be not afraid,', 'only believe.'],
    accent: 'believe',
    ground: 'ink',
    layout: 'lower-third',
    ornament: 'small-star',
    note: 'Dark ground. Text set low with a small drawn star high in the open space.',
  },
  {
    n: 7,
    slug: 'consider-the-lilies',
    title: 'Lilies',
    ref: 'Luke 12:27',
    quote: 'Consider the lilies how they grow',
    lines: ['Consider', 'the lilies', 'how they grow'],
    singleWordLines: ['Consider'],
    accent: 'lilies',
    ground: 'paper',
    layout: 'centered-italic',
    ornament: 'lily-sprig',
    note: 'Italic display face with a fine line-drawn lily stem.',
  },
  {
    n: 8,
    slug: 'more-than-sparrows',
    title: 'Sparrows',
    ref: 'Luke 12:7',
    quote: 'Fear not therefore: ye are of more value than many sparrows.',
    lines: ['Fear not', 'therefore:', 'ye are of more value', 'than many sparrows.'],
    singleWordLines: ['therefore:'],
    accent: 'Fear not',
    ground: 'stone',
    layout: 'headline-and-body',
    ornament: 'flight-dots',
    note: 'A large opening phrase over a smaller second half, with a scatter of small dots like birds.',
  },
  {
    n: 9,
    slug: 'kingdom-within-you',
    title: 'Within',
    ref: 'Luke 17:21',
    quote: 'Behold, the kingdom of God is within you.',
    lines: ['Behold,', 'the kingdom of God', 'is within you.'],
    singleWordLines: ['Behold,'],
    accent: 'within',
    ground: 'ink',
    layout: 'framed-arch',
    ornament: 'arch',
    note: 'Dark ground. Text centred inside a tall drawn arch.',
  },
  {
    n: 10,
    slug: 'let-not-your-heart',
    title: 'Untroubled',
    ref: 'John 14:1',
    quote: 'Let not your heart be troubled',
    lines: ['Let not', 'your heart', 'be troubled'],
    accent: 'heart',
    ground: 'paper',
    layout: 'right-ragged',
    ornament: 'corner-marks',
    note: 'Flush right, set high, with small corner marks at the safe margin.',
  },
  {
    n: 11,
    slug: 'love-one-another',
    title: 'Love One Another',
    ref: 'John 15:12',
    quote: 'Love one another, as I have loved you.',
    lines: ['Love', 'one another,', 'as I have', 'loved you.'],
    singleWordLines: ['Love'],
    accent: 'Love',
    ground: 'red',
    layout: 'initial-word',
    ornament: 'none',
    note: 'Red ground. "Love" set very large as the first line, the rest set smaller beneath.',
  },
  {
    n: 12,
    slug: 'good-cheer',
    title: 'Good Cheer',
    ref: 'John 16:33',
    quote: 'Be of good cheer; I have overcome the world.',
    lines: ['Be of good cheer;', 'I have overcome', 'the world.'],
    accent: 'good cheer',
    ground: 'ink',
    layout: 'centered-rule-split',
    ornament: 'sunrise-arc',
    note: 'Dark ground. A short rule splits the two clauses, with a low arc like a sunrise.',
  },
];

// Copy for the size guide PDF included in the download.
const sizeGuide = {
  title: 'Which file to print',
  intro:
    'Each design comes in five files, one for each frame shape. ' +
    'Pick the file that matches your frame and print it at the size of the frame. ' +
    'A file made for a large frame prints cleanly at any smaller size of the same shape.',
  tips: [
    'Print at the size of your frame (say 8 x 10 in), or use “fit to page” on paper that size. Each file is made for the largest frame of its shape, so avoid “actual size” unless your frame is that size.',
    'Every file keeps a 0.4 in margin clear of text, so a frame lip or a print-shop trim will not touch the words.',
    'Matte or lightly textured paper suits these designs best. Heavy cotton or watercolour paper looks lovely too.',
    'For sizes over A3 or 11 x 14 in, a local print shop or an online photo lab will give the best result.',
    'Frames with a mat: choose the file for the mat opening, not the outer frame.',
  ],
  fileNaming: 'Files are named design-XX-name-ratio.jpg, for example design-01-light-of-the-world-4x5.jpg.',
  closing: 'Thank you for bringing these words into your home.',
};

module.exports = { collection, DPI, SAFE_MARGIN_IN, ratios, designs, sizeGuide };
