const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Capacitor shell', () => {
  it('points at the existing public build and the parchment background', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'capacitor.config.json'), 'utf8'));
    assert.equal(cfg.webDir, 'public');
    assert.equal(cfg.appId, 'app.redletter.advisor');
    assert.equal(cfg.backgroundColor, '#F4EFE4');
    assert.equal(cfg.ios.backgroundColor, '#F4EFE4');
    assert.equal(cfg.android.backgroundColor, '#F4EFE4');
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'index.html')));
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'DEVICE_CHECKLIST.md')));
  });
});
