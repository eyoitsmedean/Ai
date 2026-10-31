const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');

test('hearing rests the page on night paper, over a season', () => {
  const rule = html.match(/html\.hearing\[data-theme\],\s*html\.hearing\[data-theme\]\[data-season\]\s*\{([^}]+)\}/);
  assert.ok(rule, 'hearing rule must outrank a season and a dark season');
  assert.match(rule[1], /--paper:\s*#14110D/i);
  assert.match(rule[1], /--folio:\s*#1A1612/i);
  assert.match(rule[1], /--ink:\s*#F3EBDD/i);
  assert.match(rule[1], /--crimson:\s*#D15A54/i);
  assert.match(html, /The page is resting\./);
  assert.doesNotMatch(html, /the page can rest/);
});

test('hearing holds the screen, and lets it go', () => {
  assert.match(html, /navigator\.wakeLock\.request\('screen'\)/);
  assert.match(html, /function releaseHearLock\(/);
  assert.match(html, /speechSynthesis\.resume\(\)/);
  const stopOffice = html.slice(html.indexOf('function stopHearOffice'), html.indexOf('function officeScript'));
  const stopSit = html.slice(html.indexOf('function stopSitListen'), html.indexOf('function toggleSitListen'));
  assert.match(stopOffice, /endRest\(\)/);
  assert.match(stopSit, /endRest\(\)/);
  assert.match(html, /function beginRest\(/);
  assert.match(sw, /const CACHE = 'rla-v25'/);
});

test('a spoken saying names the King James Version', () => {
  const fn = html.slice(html.indexOf('function spokenVerse'), html.indexOf('function restThemeColor'));
  assert.match(fn, /King James Version/);
  assert.match(html, /spokenVerse\(dailyData\.affirmation\.verse\)/);
  assert.match(html, /spokenVerse\(dailyData\.word\.verse\)/);
  assert.match(html, /spokenVerse\(saying\.verse\)/);
  assert.match(html, /spokenVerse\(sitPayload && sitPayload\.verse\)/);
});
