const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('native bundled rotation matches the locked catalog, slot for slot', () => {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../assets/moments/catalog.json'), 'utf8'),
  );
  const swift = fs.readFileSync(
    path.join(__dirname, '../ios/RedWordsWidget/RedWordsWidget.swift'),
    'utf8',
  );
  const kotlin = fs.readFileSync(
    path.join(
      __dirname,
      '../android/app/src/main/kotlin/com/redwords/red_words/RedWordsWidget.kt',
    ),
    'utf8',
  );
  assert.equal(catalog.daily.length, 7);
  for (const slot of catalog.daily) {
    assert.match(swift, new RegExp(slot.word.verse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(swift, new RegExp(slot.word.passage.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(kotlin, new RegExp(slot.word.verse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(kotlin, new RegExp(slot.word.passage.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
