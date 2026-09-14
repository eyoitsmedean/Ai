#!/usr/bin/env node
/**
 * Write the locked daily seven into the native widgets so the card is
 * today's Word before the app is opened. Source of truth: catalog.json.
 */
const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../assets/moments/catalog.json'), 'utf8'),
);
const slots = catalog.daily.map((d) => ({
  word: d.word.passage,
  citation: d.word.verse,
}));
if (slots.length !== 7) {
  throw new Error(`expected 7 daily slots, got ${slots.length}`);
}

function replaceSeed(file, body) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/\/\/ BEGIN_SEED[\s\S]*?\/\/ END_SEED/.test(src)) {
    throw new Error(`no BEGIN_SEED/END_SEED in ${file}`);
  }
  const next = src.replace(/\/\/ BEGIN_SEED[\s\S]*?\/\/ END_SEED/, body.trim());
  fs.writeFileSync(file, next);
  console.log('seeded', path.relative(process.cwd(), file));
}

const swiftSlots = slots
  .map(
    (s) => `    WordSlot(
      word: ${JSON.stringify(s.word)},
      citation: ${JSON.stringify(s.citation)}
    )`,
  )
  .join(',\n');

replaceSeed(
  path.join(__dirname, '../ios/RedWordsWidget/RedWordsWidget.swift'),
  `// BEGIN_SEED
  static let bundled: [WordSlot] = [
${swiftSlots},
  ]
  // END_SEED`,
);

const kotlinSlots = slots
  .map(
    (s) => `            WordSlot(
                ${JSON.stringify(s.word)},
                ${JSON.stringify(s.citation)},
            )`,
  )
  .join(',\n');

replaceSeed(
  path.join(__dirname, '../android/app/src/main/kotlin/com/redwords/red_words/RedWordsWidget.kt'),
  `// BEGIN_SEED
        val bundled: List<WordSlot> = listOf(
${kotlinSlots},
        )
        // END_SEED`,
);
