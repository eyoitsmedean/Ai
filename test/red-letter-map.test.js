const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { spokenAt, SPOKEN_ADDITIONS } = require('../lib/scripture');

const ROOT = path.join(__dirname, '..');
const named = require('../data/red-letter-ebible-kjv.json');
const production = require('../data/red-letter-source.json');

const OSIS_ONLY = [
  'Luke 17:36', 'Luke 7:1', 'Luke 7:2', 'Luke 7:3', 'Luke 7:36', 'Luke 7:37', 'Luke 7:38', 'Luke 7:39',
  'Luke 7:4', 'Luke 7:5', 'Luke 7:6', 'Luke 7:7', 'Luke 7:8',
  'Mark 8:22', 'Mark 8:23', 'Mark 8:24', 'Mark 8:25', 'Matthew 24:1',
];
const WEB_ONLY = ['John 16:17', 'John 16:18', 'Luke 22:61', 'Mark 10:49', 'Matthew 13:57'];
const OTHER_SPEAKERS = [
  'Mark 9:7', 'Mark 16:6', 'Matthew 15:33', 'Luke 13:14', 'Luke 24:32',
  'John 7:20', 'John 11:35', 'Mark 4:2', 'Mark 5:43', 'John 16:17',
];

describe('named red-letter map (eBible KJV OSIS)', () => {
  it('names its source and locks the counts that were measured on 2026-09-07', () => {
    assert.equal(named.provenance.primary.publisherElectronic, 'eBible.org');
    assert.equal(named.provenance.primary.rights, 'public domain');
    assert.equal(named.provenance.primary.markup, '<q who="Jesus">');
    assert.equal(named.provenance.primary.sha256, 'eeeae647fc28360ce47f9c0d5cc3b397b7fdd9913fe53dc9f44eb6deee50e253');
    assert.equal(named.provenance.witness.markup, '<wj>');
    assert.equal(named.provenance.witness.sha256, '5ffa2626f170a109a4a96afc90775c06f0821cb4ba81ed34e63663e085708d68');
    assert.deepEqual(named.counts, {
      Matthew: 645, Mark: 290, Luke: 599, John: 434,
      total: 1968, full: 1357, partial: 611,
      webAgrees: 1950, osisOnly: 18, webOnly: 5,
    });
    assert.deepEqual([...named.osisOnly].sort(), [...OSIS_ONLY].sort());
    assert.deepEqual([...named.webOnly].sort(), [...WEB_ONLY].sort());
  });

  it('keeps His words and drops the speakers the unnamed map had vouched for', () => {
    assert.equal(named.verses['Luke 2:49'], 'How is it that ye sought me? wist ye not that I must be about my Father’s business?');
    assert.equal(named.verses['John 12:28'], 'Father, glorify thy name.');
    assert.equal(named.verses['Matthew 8:3'], 'I will; be thou clean.');
    for (const cite of OTHER_SPEAKERS) assert.equal(named.verses[cite], undefined, cite);
  });

  it('does not replace the production map', () => {
    assert.equal(Object.keys(production.verses).length, 2007);
    assert.match(production.description, /Words of Jesus Christ/);
    assert.equal(production.provenance, undefined);
    assert.equal(spokenAt('Luke', 2, 49), SPOKEN_ADDITIONS['Luke 2:49']);
    assert.equal(spokenAt('Mark', 9, 7), null);
    assert.equal(spokenAt('John', 12, 28), 'Father, glorify thy name.');
  });

  it('refuses to overwrite the production spoken corpus from the named map', () => {
    const run = spawnSync(process.execPath, ['scripts/build-spoken.js', 'data/red-letter-ebible-kjv.json'], { cwd: ROOT, encoding: 'utf8' });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /Refusing to overwrite/);
  });

  it('builds a candidate spoken corpus that still excludes other speakers', () => {
    const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rla-named-'));
    const spokenOut = path.join(dir, 'spoken.json');
    const libraryOut = path.join(dir, 'library.json');
    const run = spawnSync(process.execPath, [
      'scripts/build-spoken.js',
      '--source', 'data/red-letter-ebible-kjv.json',
      '--out', spokenOut,
      '--library', libraryOut,
    ], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const candidate = JSON.parse(fs.readFileSync(spokenOut, 'utf8'));
    assert.equal(candidate.books.Luke['2']['49'].startsWith('How is it that ye sought me'), true);
    assert.equal(candidate.books.John['12']['28'], 'Father, glorify thy name.');
    assert.equal(candidate.books.Mark['9']?.['7'], undefined);
    assert.equal(candidate.books.Mark['16']?.['6'], undefined);
    assert.match(candidate.attribution, /eBible\.org KJV OSIS/);
  });
});
