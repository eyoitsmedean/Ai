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

test('the morning does not erase the evening', () => {
  const keep = html.match(/function keepVespers\(\) \{[\s\S]*?\n\}/);
  assert.ok(keep, 'keepVespers missing');
  assert.match(keep[0], /rememberEvening\(/);
  const paint = html.match(/function paintEpigraph\(\) \{[\s\S]*?\n\}/);
  assert.ok(paint, 'paintEpigraph missing');
  assert.match(paint[0], /eveningRecord\(\)/);
  assert.match(paint[0], /Last night you laid down/);
  assert.match(paint[0], /·  KJV/);
  assert.match(html, /Laid down/);
});
