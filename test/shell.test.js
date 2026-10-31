const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// The house rules in AGENTS.md, checked against the page as shipped.
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

function pageMarkup(id) {
  const open = new RegExp(`<div class="page( active)?" id="${id}">`);
  const m = open.exec(html);
  assert.ok(m, `${id} missing`);
  const start = m.index;
  const next = html.indexOf('<div class="page', start + 1);
  const end = next === -1 ? html.indexOf('<nav class="dock"', start) : next;
  return html.slice(start, end);
}

test('a crisis line on every screen', () => {
  for (const id of ['today-page', 'seek-page', 'advisor-page', 'journal-page']) {
    const markup = pageMarkup(id);
    assert.match(markup, /href="tel:988"/, `${id} has no 988`);
    assert.match(markup, /findahelpline\.com/, `${id} has no helpline`);
  }
  const title = html.slice(html.indexOf('id="onboarding"'), html.indexOf('</section>'));
  assert.match(title, /tel:988/, 'title page has no 988');
});

test('the room never sells and never pretends', () => {
  assert.doesNotMatch(html, /Ask Him/, 'never "Ask Him"');
  assert.doesNotMatch(html, /AI Jesus/, 'never "AI Jesus"');
  assert.doesNotMatch(html, /coming soon/i, 'no teaser for a tier that does not exist');
  assert.doesNotMatch(html, /\bPlus\b/, 'no "Plus" tier');
  assert.doesNotMatch(html, /\/week\b|weekly/i, 'never a weekly price');
});

test('the evening office never closes on tribulation', () => {
  const fn = html.match(/function vespersSaying\(\) \{[\s\S]*?\n\}/);
  assert.ok(fn, 'vespersSaying missing');
  assert.doesNotMatch(fn[0], /dailyData/, 'vespers must not take the morning word');
  assert.match(fn[0], /VESPERS_FALLBACK/);
  const block = html.match(/const VESPERS_FALLBACK = \[[\s\S]*?\];/);
  assert.ok(block, 'evening fallbacks missing');
  assert.doesNotMatch(block[0], /16:33|tribulation|overcome the world/i);
  assert.match(block[0], /Matthew 11:28/);
  assert.match(block[0], /John 14:27/);
  assert.match(block[0], /Luke 23:46/);
});

test('last night’s catchword is kept until morning', () => {
  const remember = html.match(/function rememberSitting\([\s\S]*?\n\}/);
  assert.ok(remember, 'rememberSitting missing');
  assert.match(remember[0], /nextCivilStr\(\)/, 'catchword must last into the next civil day');
  assert.match(html, /Last night you laid down/);
  assert.match(html, /Earlier you laid down/);
});
