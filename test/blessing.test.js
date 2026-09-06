const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { encodeBlessing, decodeBlessing, blessingPage } = require('../lib/blessing');

describe('blessing tokens', () => {
  it('round-trips a Gospel blessing', () => {
    const token = encodeBlessing({
      verse: 'Matthew 11:28',
      quote: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
      note: 'For Elena',
    });
    assert.ok(token);
    const parsed = decodeBlessing(token);
    assert.equal(parsed.verse, 'Matthew 11:28');
    assert.match(parsed.quote, /Come unto me/);
    assert.equal(parsed.note, 'For Elena');
  });

  it('rejects a non-Gospel citation', () => {
    const token = encodeBlessing({ verse: 'Romans 8:28', quote: 'All things work together.' });
    assert.equal(decodeBlessing(token), null);
  });

  it('rejects junk', () => {
    assert.equal(decodeBlessing('not-a-token'), null);
    assert.equal(encodeBlessing({ verse: '', quote: '' }), null);
  });

  it('renders a page with His words and 988', () => {
    const html = blessingPage({
      verse: 'John 14:27',
      quote: 'Peace I leave with you',
      note: 'For you',
    }, 'https://example.com');
    assert.match(html, /Peace I leave with you/);
    assert.match(html, /John 14:27/);
    assert.match(html, /988/);
    assert.match(html, /Sit with this/);
    assert.doesNotMatch(html, /Plus/);
  });
});
