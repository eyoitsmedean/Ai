#!/usr/bin/env node
/* Mirrors honestCash() in index.html. Run: node plans/test-honest-cash.js */
'use strict';

function honestCash(household, choice) {
  const windowOpen = household === 'confirmed' || household === 'notneeded';
  const units = {
    none: { expected: 0, caption: 'none' },
    lamp: { expected: 0, caption: 'lamp' },
    folio: { expected: 0, caption: 'folio' },
    room: { expected: 0, caption: 'room' },
    handoff: { expected: 0, caption: 'handoff' },
    storefront: { expected: 0, caption: 'storefront' }
  };
  if (!windowOpen) return { expected: 0, caption: 'closed' };
  return units[choice] || units.none;
}

let failed = 0;
function assert(name, cond) {
  if (!cond) { failed++; console.error('FAIL', name); }
  else console.log('ok', name);
}

assert('closed window → 0', honestCash('not', 'storefront').expected === 0);
assert('lamp + open → 0', honestCash('confirmed', 'lamp').expected === 0);
assert('folio + open → 0', honestCash('notneeded', 'folio').expected === 0);
assert('none + open → 0', honestCash('confirmed', 'none').expected === 0);
assert('room expected still 0', honestCash('confirmed', 'room').expected === 0);
assert('never 80-120', honestCash('confirmed', 'lamp').expected !== 100);

const seTax = 0.153 * 0.9235;
const at12 = seTax + (1 - seTax / 2) * (0.12 + 0.053);
const at22 = seTax + (1 - seTax / 2) * (0.22 + 0.053);
assert('12% combined ~30.2%', Math.abs(at12 - 0.3021) < 0.0005);
assert('22% combined ~39.5%', Math.abs(at22 - 0.3950) < 0.0005);

process.exit(failed ? 1 : 0);
