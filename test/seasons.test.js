const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

// Every block whose selector list matches `re`, as one string of declarations.
function blocks(re) {
  const out = [];
  for (const m of html.matchAll(/([^{}]+)\{([^{}]*)\}/g)) if (re.test(m[1])) out.push(m[2]);
  return out.join('\n');
}

test('with the Lamp on, every season keeps dark paper', () => {
  for (const season of ['advent', 'christmas', 'lent', 'easter']) {
    const light = blocks(new RegExp(`:root\\[data-season="${season}"\\]\\s*$`));
    if (!/--paper:/.test(light)) continue;
    const dark = blocks(new RegExp(`:root\\[data-theme="dark"\\]\\[data-season="${season}"\\]`));
    for (const v of ['--paper', '--paper-2', '--folio', '--crimson']) {
      if (new RegExp(`${v}:`).test(light)) assert.match(dark, new RegExp(`${v}:`), `${season}: the Lamp must reset ${v}`);
    }
  }
});
