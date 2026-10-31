const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { lookup, verifyQuote } = require('../lib/scripture');
const crisis = require('../public/data/crisis');
const night = require('../public/data/night-card');

describe('night card', () => {
  it('keeps seven sealed sayings, His speech only, and none that fail a self-harm screen', () => {
    assert.equal(night.CARDS.length, 7);
    const seen = new Set();
    for (const card of night.CARDS) {
      assert.ok(!seen.has(card.verse), 'duplicate ' + card.verse);
      seen.add(card.verse);
      const hit = lookup(card.verse);
      assert.ok(hit && hit.redLetter, card.verse + ' is not His speech');
      const sealed = verifyQuote(hit.citation, card.quote);
      assert.equal(sealed.ok, true, card.verse + ' failed the seal');
      assert.ok(sealed.score >= 0.92, card.verse + ' score ' + sealed.score);
      assert.equal(card.quote, hit.text);
      assert.equal(crisis.unsafeSaying('self', card.quote), false, card.verse + ' is unsafe after a crisis');
    }
    assert.equal(lookup('Luke 2:14').redLetter, false);
    assert.equal(night.cardFromRef('Luke 2:14'), null);
  });

  it('picks a card by weekday and by an allowed reference', () => {
    const sunday = night.cardForDate(new Date('2026-11-01T08:00:00'));
    assert.equal(sunday.verse, 'John 14:27');
    const friday = night.cardForDate(new Date('2026-11-06T02:00:00'));
    assert.equal(friday.verse, 'Matthew 19:14');
    assert.deepEqual(night.cardFromRef('Matthew 11:28'), night.CARDS[1]);
    assert.equal(night.cardFromRef('1'), null);
    assert.equal(night.cardFromRef(''), null);
    assert.equal(night.cardFromRef('week'), null);
    assert.equal(night.wantsWeek('week'), true);
    const week = night.weekCards();
    assert.equal(week.length, 7);
    assert.deepEqual(week.map((c) => c.day), night.DAYS);
    assert.equal(week[5].verse, 'Matthew 19:14');
    assert.equal(night.dayName(new Date('2026-11-01T08:00:00')), 'Sunday');
  });

  it('is wired into the folio as a card you can open and print', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
    assert.match(html, /data\/night-card\.js/);
    const start = html.indexOf('id="print-folio"');
    assert.ok(start > 0);
    const folio = html.slice(start, html.indexOf('</article>', start));
    assert.match(folio, /href="tel:988"/);
    assert.match(folio, /findahelpline\.com/);
    assert.match(html, /openNightCard/);
    assert.match(html, /\?card=1/);
    assert.match(html, /\?card=week/);
    assert.match(html, /id="print-quire"/);
    assert.match(html, /Print the week/);
    assert.doesNotMatch(html, /Ask Him/);
  });
});
