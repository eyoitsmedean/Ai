const test = require('node:test');
const assert = require('node:assert/strict');
const { hearingDesk } = require('../lib/hear');

test('hearing desk seals live KJV and keeps opened WEBU beside it', () => {
  const desk = hearingDesk();
  assert.equal(desk.watch, true);
  assert.equal(desk.translation_live, 'KJV');
  const john = desk.verses.find((v) => v.ref === 'John 14:27');
  assert.ok(john.kjv_ok);
  assert.match(john.kjv, /Peace I leave with you/);
  assert.match(john.webu, /Peace I leave with you/);
  assert.ok(john.webu_url.includes('ebible.org'));
});
