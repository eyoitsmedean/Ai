const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');
const crisis = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'crisis.js'), 'utf8');
const index = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const welcome = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const mobile = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'mobile.js'), 'utf8');
const trust = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'trust.js'), 'utf8');

describe('watched-device session wipe', () => {
  it('implements fresh=1, Begin again, and Leave quickly', () => {
    assert.match(app, /function consumeFreshQuery/);
    assert.match(app, /searchParams\.get\('fresh'\) !== '1'/);
    assert.match(app, /function beginAgain/);
    assert.match(app, /function leaveQuickly/);
    assert.match(app, /function wipeSessionStorage/);
    assert.match(app, /rla-chat/);
    assert.match(app, /rla-onboarded/);
    assert.match(app, /rla-chat-count-/);
    assert.match(app, /ESCAPE_URL = 'https:\/\/www\.live-local-weather\.com\/'/);
    assert.match(app, /consumeFreshQuery\(\)/);
    assert.doesNotMatch(app, /if \(wipeJournal\) removeLsKey\('rla-journal'\);\s*removeLsKey\('rla-journal'\)/);
  });

  it('Leave quickly is a crisis-footer control; Escape still closes without wipe', () => {
    assert.match(crisis, /id="crisis-leave"/);
    assert.match(crisis, /Leave quickly/);
    assert.match(crisis, /finish\('leave'\)/);
    assert.match(crisis, /global\.leaveQuickly/);
    assert.match(crisis, /if \(e\.key === 'Escape'\) \{ e\.preventDefault\(\); finish\('close'\)/);
    assert.match(index, /onclick="beginAgain\(\)"/);
    assert.match(index, /Begin again/);
    assert.match(index, /Leave quickly/);
  });

  it('welcome landing uses the shipped type stack, not a CDN', () => {
    assert.match(welcome, /\/fonts\/fonts\.css/);
    assert.match(welcome, /font-family: Figtree/);
    assert.match(welcome, /font-family: Literata/);
    assert.doesNotMatch(welcome, /fonts\.googleapis\.com/);
    assert.doesNotMatch(welcome, /Instrument Sans/);
    assert.doesNotMatch(welcome, /Source Serif 4/);
  });

  it('install sheet names Home Screen ITP exemption and Open as Web App', () => {
    assert.match(mobile, /Open as Web App/);
    assert.match(mobile, /7-day tab cleanup/);
    assert.match(mobile, /Safari 26/);
  });

  it('About colophon names the self-hosted faces', () => {
    assert.match(index, /id="colophon"/);
    assert.match(index, /Fraunces, Literata, Figtree/);
    assert.match(index, /No webfont CDN/);
  });

  it('onboarding quotes Matthew 11:28 from the KJV corpus, labeled', () => {
    assert.match(index, /Come unto me, all ye that labour and are heavy laden/);
    assert.match(index, /Matthew 11:28 · KJV/);
    assert.doesNotMatch(index, /heavily burdened/);
    assert.match(app, /function clearThisPhone/);
    assert.match(index, /Clear this phone/);
    assert.match(trust, /Verified · KJV pack/);
    assert.match(trust, /Verified · KJV/);
    assert.match(trust, /Verified · WEB/);
    assert.match(index, /js\/cite\.js\?v=23/);
  });
});
