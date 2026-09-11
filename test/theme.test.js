const test = require('node:test');
const assert = require('node:assert/strict');
const { guessTheme } = require('../data/scripture');

const cases = [
  ['Grief & Loss', 'My mom died three weeks ago and everyone has gone back to normal.'],
  ['Grief & Loss', 'I lost my baby last week.'],
  ['Fear', "I got the biopsy results and it's cancer. I'm scared."],
  ['Fear', "My dad has dementia and doesn't know who I am."],
  ['Forgiveness', 'I found out my husband has been texting another woman.'],
  ['Suffering & Pain', "I've been sober 40 days and tonight I really want to drink."],
  ['Purpose & Direction', "I don't know what I'm supposed to do with my life."],
  ['Faith & Doubt', 'Is it wrong to be angry at God?'],
  ['Shame & Guilt', 'I cheated on my wife two years ago. The guilt is eating me alive.'],
  ['Conflict & Relationships', "My daughter came out to me and I don't know how to respond."],
  ['Anxiety & Worry', "I can't sleep because I'm terrified about losing my job."],
  ['Hope', 'help'],
];

test('guessTheme routes high-stakes life questions', () => {
  const misses = cases.filter(([want, text]) => guessTheme(text) !== want);
  assert.deepEqual(misses, []);
});
