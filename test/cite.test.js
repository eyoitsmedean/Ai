const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { formatVerseCite, bareCitation, citeTranslation } = require('../public/js/cite');
const { dailyForDate, encouragementFor } = require('../lib/curated');

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'corpus.json'), 'utf8')
);
const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');

describe('reader-facing verse cites name the translation', () => {
  it('formats and strips KJV / WEB labels without inventing one', () => {
    assert.equal(formatVerseCite('Matthew 11:28', 'KJV'), 'Matthew 11:28 · KJV');
    assert.equal(formatVerseCite('— John 14:27', 'WEB'), 'John 14:27 · WEB');
    assert.equal(formatVerseCite('Matthew 6:34 · WEB', 'WEB'), 'Matthew 6:34 · WEB');
    assert.equal(formatVerseCite('John 16:33'), 'John 16:33');
    assert.equal(bareCitation('— Matthew 11:28 · KJV'), 'Matthew 11:28');
    assert.equal(citeTranslation('World English Bible (public domain)'), 'WEB');
    assert.equal(citeTranslation('KJV'), 'KJV');
    assert.equal(citeTranslation('Matthew 11:28 · KJV'), 'KJV');
    assert.equal(citeTranslation(''), '');
  });

  it('online curated pages are KJV; offline corpus is WEB', () => {
    const daily = dailyForDate(new Date('2026-09-14T12:00:00'));
    assert.equal(daily.translation, 'KJV');
    assert.equal(encouragementFor('Peace').translation, 'KJV');
    assert.match(corpus.translation, /World English Bible/);
    assert.equal(citeTranslation(corpus.translation), 'WEB');
    assert.ok(corpus.daily[0].affirmation.verse);
    assert.ok(corpus.encouragement.Peace.passages[0].verse);
  });

  it('the page labels Today, Seek, Journal, and the offline WEB path', () => {
    assert.match(app, /RedLetterCite/);
    assert.match(app, /formatVerseCite/);
    assert.match(app, /function verseLabel/);
    assert.match(app, /translation: readingTranslation\(corpus\.translation\) \|\| 'WEB'/);
    assert.match(app, /aff-verse': `— \$\{verseLabel/);
    assert.match(app, /verseLabel\(passage\.verse/);
  });
});
