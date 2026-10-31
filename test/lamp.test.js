const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lampShouldBeDark, isNightHour, applyLamp } = require('../public/data/lamp');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');

test('night office lights the Lamp unless the reader locked parchment', () => {
  assert.equal(isNightHour(3), true);
  assert.equal(isNightHour(21), true);
  assert.equal(isNightHour(5), true);
  assert.equal(isNightHour(6), false);
  assert.equal(isNightHour(14), false);
  assert.equal(isNightHour(20), false);

  assert.equal(lampShouldBeDark(null, 3), true);
  assert.equal(lampShouldBeDark('', 22), true);
  assert.equal(lampShouldBeDark(undefined, 14), false);
  assert.equal(lampShouldBeDark('1', 14), true);
  assert.equal(lampShouldBeDark('0', 3), false);
});

test('applyLamp paints the theme and the status-bar color', () => {
  const metas = {
    'theme-color': { setAttribute(name, value) { this[name] = value; } },
    'apple-mobile-web-app-status-bar-style': { setAttribute(name, value) { this[name] = value; } },
  };
  const doc = {
    documentElement: { dataset: {} },
    querySelector(sel) {
      const match = /name="([^"]+)"/.exec(sel);
      return match ? metas[match[1]] : null;
    },
  };
  assert.equal(applyLamp(doc, null, 3), true);
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(metas['theme-color'].content, '#14110D');
  assert.equal(metas['apple-mobile-web-app-status-bar-style'].content, 'black-translucent');
  assert.equal(applyLamp(doc, '0', 3), false);
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(metas['theme-color'].content, '#F4EFE4');
});

test('the page loads the Lamp before first paint and the worker keeps it', () => {
  assert.match(html, /<script src="data\/lamp\.js"><\/script>/);
  assert.match(html, /RedLetterLamp\.applyLamp/);
  assert.match(html, /Darker paper after 9/);
  assert.match(html, /function paintLamp/);
  assert.match(sw, /rla-v22/);
  assert.match(sw, /data\/lamp\.js/);
});
