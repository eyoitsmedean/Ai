const test = require("node:test");
const assert = require("node:assert/strict");
const clock = require("../folio/clock.js");

function at(y, m, d) {
  return new Date(y, m - 1, d, 12, 0, 0);
}

test("31 Oct 2026 is Saturday, still Red, 33 days staged, 58 used", () => {
  const c = clock.read(at(2026, 10, 31));
  assert.equal(c.weekday, "Saturday");
  assert.equal(c.phase, "red");
  assert.equal(c.daysLeft, 33);
  assert.equal(c.daysUsed, 58);
  assert.equal(c.label, "Saturday 31 Oct 2026");
});

test("1 Nov 2026 opens the calendar at 33 days; 2 Nov is 32", () => {
  const first = clock.read(at(2026, 11, 1));
  assert.equal(first.weekday, "Sunday");
  assert.equal(first.phase, "open");
  assert.equal(first.daysLeft, 33);
  const second = clock.read(at(2026, 11, 2));
  assert.equal(second.daysLeft, 32);
  assert.equal(second.phase, "open");
});

test("3 Dec is the last day; 4 Dec has ended", () => {
  const last = clock.read(at(2026, 12, 3));
  assert.equal(last.phase, "open");
  assert.equal(last.daysLeft, 1);
  const after = clock.read(at(2026, 12, 4));
  assert.equal(after.phase, "ended");
  assert.equal(after.daysLeft, 0);
});

test("14 Sep stays Monday and does not pretend 80 days is the live count", () => {
  const c = clock.read(at(2026, 9, 14));
  assert.equal(c.weekday, "Monday");
  assert.equal(c.phase, "red");
  assert.equal(c.daysLeft, 33);
  assert.equal(clock.inclusive([2026, 9, 15], [2026, 12, 3]), 80);
});

test("Advent 29 Nov is the first of the last five calendar days", () => {
  assert.equal(clock.inclusive(clock.ADVENT, clock.END), 5);
  assert.equal(clock.read(at(2026, 10, 31)).adventSpan, 5);
});
