#!/usr/bin/env node
/**
 * Write the filled KJV safety letters the PWA serves when /api/chat is down
 * after a crisis, danger, or assault disclosure. Source of wording:
 * lib/letters.js. Do not edit the JSON by hand.
 */
const fs = require('fs');
const path = require('path');
const { buildSafetyPack } = require('../lib/letters');

const out = path.join(__dirname, '..', 'public', 'data', 'safety-pack.json');
fs.writeFileSync(out, `${JSON.stringify(buildSafetyPack(), null, 2)}\n`);
process.stdout.write(`wrote ${out}\n`);
