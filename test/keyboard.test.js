const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const rule = (sel) => (html.match(new RegExp(`^${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`, 'm')) || [])[1] || '';

test('pages that are not showing leave the tab order', () => {
  assert.match(rule('.page'), /visibility: hidden/);
  assert.match(rule('.page.active'), /visibility: visible/);
});

test('settings toggles have a name and a visible focus ring', () => {
  assert.match(html, /id="dark-toggle" aria-label="[^"]+"/);
  assert.match(html, /id="reminder-toggle" aria-label="[^"]+"/);
  assert.match(html, /\.toggle input:focus-visible \+ \.toggle-track \{[^}]*outline/);
});

test('focus has somewhere to go when what held it disappears', () => {
  for (const fn of ['showEnc', 'showThemeGrid', 'openLibFolio', 'closeLibFolio', 'closeCommandPalette', 'hideOverlayIfIdle', 'showNeedStep']) {
    const start = html.indexOf(`function ${fn}(`);
    assert.ok(start > 0, `${fn} missing`);
    const body = html.slice(start, html.indexOf('\n}\n', start));
    assert.match(body, /\.focus\(/, `${fn} must move focus`);
  }
});
