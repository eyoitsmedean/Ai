const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildSafetyPack } = require('../lib/letters');

describe('offline safety client contract', () => {
  it('sendMsg never theme-retrieves after a safety kind', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');
    assert.match(src, /function buildOfflineSafetyReply/);
    assert.match(src, /function offlineReplyFor/);
    assert.match(src, /data\/safety-pack\.json/);
    assert.equal((src.match(/buildOfflineAdvisorReply\(/g) || []).length, 2, 'definition plus one ordinary-path call');
    assert.match(src, /offlineReplyFor\(text, crisisKind, carried\)/);
    assert.equal((src.match(/offlineReplyFor\(/g) || []).length, 3, 'definition plus both fetch-fail paths');
  });

  it('service worker precaches the pack at the current cache version', () => {
    const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
    const index = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
    assert.match(sw, /rla-v19-chapel/);
    assert.match(sw, /data\/safety-pack\.json/);
    assert.doesNotMatch(sw, /v=18/);
    assert.doesNotMatch(index, /v=18/);
    assert.equal((index.match(/\?v=19/g) || []).length, 11);
    assert.equal((sw.match(/\?v=19/g) || []).length, 11);
  });

  it('About names RAINN and distinguishes 988 US from 988.ca', () => {
    const index = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
    assert.match(index, /1-800-656-4673/);
    assert.match(index, /hotline\.rainn\.org/);
    assert.match(index, /988\.ca/);
    assert.match(index, /id="crisis-modal"/);
    assert.doesNotMatch(index, /988<\/a> \(US &amp; Canada\)/);
  });

  it('mobile shell treats the crisis dialog as a modal', () => {
    const mobile = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'mobile.js'), 'utf8');
    assert.match(mobile, /crisis-modal/);
  });

  it('pack letters are the same sentences the server would send', () => {
    const pack = buildSafetyPack();
    assert.match(pack.kinds.crisis.letter, /\*\*Matthew 11:28\*\*/);
    assert.match(pack.kinds.crisis.letter, /Please use it — now, if you can/);
    assert.match(pack.kinds.danger.letter, /never a reason to stay in danger/);
    assert.match(pack.kinds.danger.followup, /never a reason to go back into danger/);
    assert.doesNotMatch(pack.kinds.danger.followup, /forgive not men|neither will your Father/);
    assert.doesNotMatch(pack.kinds.assault.letter, /forgive not men/);
    assert.match(pack.kinds.assault.letter, /was not your fault/);
    assert.match(pack.kinds.greeting.letter, /\*\*Matthew 11:28\*\*/);
  });
});
