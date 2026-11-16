const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const listing = JSON.parse(fs.readFileSync('docs/store/listing.json', 'utf8'));

test('store listing fields fit the published limits', () => {
  assert.equal(listing.name, 'Red Words');
  assert.ok(listing.subtitle.length <= 30, `subtitle ${listing.subtitle.length}`);
  assert.ok(listing.promotionalText.length <= 170, `promo ${listing.promotionalText.length}`);
  assert.ok(listing.keywords.length <= 100, `keywords ${listing.keywords.length}`);
  assert.ok(listing.description.length <= 4000, `description ${listing.description.length}`);
  assert.ok(listing.playShort.length <= 80, `play short ${listing.playShort.length}`);
  assert.equal(listing.playShort.includes('AI'), false);
  assert.equal(listing.description.includes('Ask Him'), false);
  assert.equal(listing.privacyUrl, null);
});
