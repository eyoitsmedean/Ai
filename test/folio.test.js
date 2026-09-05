const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

test('review folio is generated from the locked catalog', () => {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'assets', 'moments', 'catalog.json'), 'utf8')
  );
  const html = fs.readFileSync(path.join(__dirname, '..', 'review', 'folio.html'), 'utf8');

  assert.match(html, /His words, for this moment/);
  assert.match(html, /Widget = Word only/);
  assert.match(html, /redwords:\/\/today/);
  assert.match(html, /<span>Roumie<\/span>/);
  assert.match(html, /<span>Hallow<\/span>/);

  const widget = html.match(/<div class="widget">([\s\S]*?)<\/div>/);
  assert.ok(widget, 'home-screen widget card missing');
  assert.equal(widget[1].includes('Red Words'), false);
  assert.equal(widget[1].includes('streak'), false);

  for (const day of catalog.seven) {
    assert.ok(html.includes(esc(day.title)), `missing Seven Day ${day.title}`);
    assert.ok(html.includes(esc(day.verse)), `missing ${day.verse}`);
    assert.ok(html.includes(esc(day.passage)), `missing passage for ${day.title}`);
  }

  for (const slot of catalog.daily) {
    assert.ok(html.includes(esc(slot.word.verse)), `missing daily ${slot.word.verse}`);
    assert.ok(html.includes(esc(slot.word.passage)), `missing daily passage ${slot.word.verse}`);
  }

  for (const room of Object.values(catalog.themes)) {
    assert.ok(html.includes(esc(room.theme)), `missing room ${room.theme}`);
    assert.ok(html.includes(esc(room.passages[0].verse)), `missing ${room.passages[0].verse}`);
  }

  const verseCount = Object.keys(catalog.verses).length;
  assert.ok(html.includes(`${verseCount} red-letter`) || html.includes(`${verseCount} spoken`));
});
