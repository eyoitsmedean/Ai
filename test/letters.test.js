const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('a letter written offline is kept with the day, like one from the server', () => {
  const send = html.slice(html.indexOf('async function sendMsg'), html.indexOf('} finally {', html.indexOf('async function sendMsg')));
  const offline = send.slice(send.indexOf('window.RLA_advise'));
  assert.ok(offline.length > 0, 'offline branch not found');
  assert.match(offline, /chatHistory\.push\(userMsg, \{ role: 'assistant', content: fallback \}\)/);
  assert.match(offline, /persistLetters\(\)/);
});
