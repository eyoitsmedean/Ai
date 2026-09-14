'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { lookup } = require('../lib/scripture');

describe('need concordance seals', () => {
  it('prints twelve rooms whose quotes match the spoken KJV corpus', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'need.html'), 'utf8');
    const rooms = [...html.matchAll(/<article class="room"><h2>(.*?)<\/h2><p class="quote">(.*?)<\/p><p class="cite">(.*?) · KJV<\/p>/g)];
    assert.equal(rooms.length, 12);
    for (const [, theme, quote, cite] of rooms) {
      const hit = lookup(cite.replace(/&amp;/g, '&'));
      assert.ok(hit && hit.redLetter, theme + ' ' + cite + ' is not a sealed red-letter saying');
      assert.equal(
        quote.replace(/&amp;/g, '&'),
        hit.text,
        theme + ' quote must be the full sealed text of ' + cite
      );
    }
  });
});

describe('sit sayings', () => {
  it('only offers four sealed KJV citations', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'sit.html'), 'utf8');
    const block = html.match(/const SAYINGS = (\[[\s\S]*?\]);/);
    assert.ok(block, 'SAYINGS array missing');
    const rows = Function('return ' + block[1])();
    assert.equal(rows.length, 4);
    for (const { citation, quote } of rows) {
      const hit = lookup(citation);
      assert.ok(hit && hit.redLetter, citation + ' is not sealed');
      assert.equal(quote, hit.text);
    }
  });
});
