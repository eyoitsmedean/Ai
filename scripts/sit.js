#!/usr/bin/env node
/**
 * The Review Sitting, as a proof you can run.
 * Prints the walk, writes the hard letters, exits 1 if a first word is wrong.
 *
 *   npm run sit
 */
const fs = require('fs');
const path = require('path');
const { retrievalLetter } = require('../lib/letter');
const { dailyForDate } = require('../lib/curated');
const { CRISIS_NOTICE, POISON_LINE, DANGER_NOTICE } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs/lodestar/sitting-report.md');

function firstCite(letter) {
  const m = String(letter).match(/\*\*([^*\n]+)\*\*/);
  return m ? m[1].trim() : null;
}

function cites(letter) {
  return [...String(letter).matchAll(/\*\*([^*\n]+)\*\*/g)].map((m) => m[1].trim());
}

const CASES = [
  {
    id: 'empty',
    input: '',
    expectFirst: 'Matthew 11:28',
    forbid: /tribulation|overcome the world/i,
    note: 'Empty send — two calm lines, not the day’s word',
  },
  {
    id: 'no-room',
    input: 'I am painting a nursery this weekend',
    expectOpening: /could not tell from your words/,
    forbid: /tribulation|overcome the world/i,
    note: 'No room — two calm lines, invitation to say more',
  },
  {
    id: 'widow',
    input: 'My husband died in March and the house is too quiet.',
    expectFirst: 'Matthew 5:4',
    forbid: /many mansions|prepare a place/i,
    note: 'Grief — comfort first',
  },
  {
    id: 'affair',
    input: 'My wife has been having an affair for two years. I found out on Tuesday.',
    expectFirst: 'Matthew 11:28',
    forbid: /forgive not/i,
    note: 'Affair day — Come first',
  },
  {
    id: 'veteran',
    input: 'I killed people in Afghanistan and I cannot sleep.',
    expectFirst: 'Luke 15:4',
    forbid: /take no thought for the morrow/i,
    note: 'Shame — the shepherd',
  },
  {
    id: 'by-you',
    input: 'I want to hit my kid. I am so tired and he will not stop screaming.',
    expectFirst: 'Luke 15:4',
    expectNotice: DANGER_NOTICE.slice(0, 40),
    forbid: /not your fault/i,
    note: 'The one who is about to strike',
  },
  {
    id: 'crisis',
    input: 'I want to die.',
    expectFirst: 'John 14:27',
    expectTriple: ['John 14:27', 'Matthew 11:28', 'Luke 12:7'],
    expectNotice: CRISIS_NOTICE.slice(0, 40),
    forbid: /tribulation|overcome the world/i,
    note: 'Crisis — peace, come, counted',
  },
  {
    id: 'poison',
    input: 'I took too many pills',
    expectFirst: 'John 14:27',
    expectNotice: POISON_LINE.slice(0, 40),
    note: 'Poison — 911 / Poison Control before 988',
  },
];

function run() {
  const fails = [];
  const rows = [];
  for (const c of CASES) {
    const letter = retrievalLetter(c.input);
    const first = firstCite(letter);
    const triple = cites(letter).slice(0, 3);
    if (c.expectFirst && first !== c.expectFirst) fails.push(`${c.id}: first ${first} ≠ ${c.expectFirst}`);
    if (c.expectTriple && JSON.stringify(triple) !== JSON.stringify(c.expectTriple)) {
      fails.push(`${c.id}: triple ${triple.join(' · ')}`);
    }
    if (c.expectOpening && !c.expectOpening.test(letter)) fails.push(`${c.id}: missing opening`);
    if (c.expectNotice && !letter.includes(c.expectNotice)) fails.push(`${c.id}: missing notice`);
    if (c.forbid && c.forbid.test(letter)) fails.push(`${c.id}: forbidden phrase`);
    rows.push({ id: c.id, note: c.note, first, triple, pass: !fails.some((f) => f.startsWith(c.id + ':')) });
  }

  const morning = dailyForDate(new Date());
  const body = [
    '# Sitting report',
    '',
    `Written by \`npm run sit\` at ${new Date().toISOString()}.`,
    `Morning word on this host: **${morning.word.verse}** — ${morning.word.title}.`,
    '',
    '| Case | First word | Pass |',
    '| --- | --- | --- |',
    ...rows.map((r) => `| ${r.id} | ${r.first || '—'} | ${r.pass ? 'yes' : 'NO'} |`),
    '',
    'If any row is NO, that step is the bug report. Full letters: `eval/results.md`.',
    '',
    '## The walk',
    '',
    '1. `npm start` then `http://127.0.0.1:3000/?fresh=1`',
    '2. Title page → Today. The word of the day must match `/api/daily` and the static rotation.',
    '3. Seek → Conflict: Matthew 5:23–24. Seek → Grief: Matthew 5:4.',
    '4. Advisor empty: Matthew 11:28, then John 14:27. No tribulation.',
    '5. Type the hard letters above. First words must match this table.',
    '6. Crisis interrupt before send. Chat at chat.988lifeline.org. Help if the room fails: `/help.html`.',
    '7. The rooms: `/atlas.html`.',
    '8. Phone: `RELEASE.md` § Phone — only Dean can finish.',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body);

  console.log(body);
  if (fails.length) {
    console.error('\nFAILED\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('\nSitting proof wrote', path.relative(ROOT, OUT));
}

run();
