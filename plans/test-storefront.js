#!/usr/bin/env node
/** Guards for the Storefront first-sale page. No network. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dir = __dirname;
const page = fs.readFileSync(path.join(dir, 'storefront.html'), 'utf8');
const leaf = fs.readFileSync(path.join(dir, 'storefront-leaf.html'), 'utf8');
const list = fs.readFileSync(path.join(dir, 'LAUNCH-CHECKLIST.md'), 'utf8');

function fail(msg) { console.error('FAIL', msg); process.exitCode = 1; }

if (!page.includes('$595')) fail('customer page missing $595');
if (/\$350|\$295/.test(page)) fail('retired price on the customer page');
if (/OneDigital|onedigital/i.test(page + leaf + list)) fail('employer name leaked');
if (!/insurance, benefits, HR, staffing, or finance/i.test(page)) fail('clean-room exclusion missing');
if (!/refund/i.test(page)) fail('refund missing');
if (!/href="#"/i.test(page)) fail('payment link should stay off');
if (/buy\.stripe\.com|checkout\.stripe\.com/i.test(page)) fail('invented Stripe checkout');
if (/customers (say|love)|testimonial|★★★★★/i.test(page)) fail('invented testimonial');
if (!/20 Nov/.test(page) || !/27 Nov/.test(page)) fail('remaining Fridays missing');
if (!/\$595/.test(leaf) || !/Blank on purpose/.test(leaf)) fail('delivery leaf');
for (const bit of ['**personal** Stripe', '$595', '35%', 'Assumed Business Name', 'Send **one** message', '27 Nov 2026', '3 Dec 2026', 'not tax advice']) {
  if (!list.includes(bit)) fail('checklist missing ' + bit);
}
if (/\$80|\$1,050|one in thirteen/i.test(page)) fail('forecast leaked onto the customer page');

if (!process.exitCode) console.log('ok storefront page, leaf, checklist');
else process.exit(process.exitCode);
