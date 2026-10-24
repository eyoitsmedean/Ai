// Pulls the POOL straight out of the game file so card numbers match the game exactly.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../../freedom-units.html'), 'utf8');
const line = html.split('\n').find((l) => l.startsWith('const POOL = '));
const POOL = JSON.parse(line.replace(/^const POOL = /, '').replace(/;\s*$/, ''));
// Pool index (0-based) -> readable source names for the answer card.
const PICKS = [
  { i: 1,  sources: ['National Park Service: Statue of Liberty statistics'] },
  { i: 14, sources: ['National Park Service: Wright Brothers National Memorial', 'AutoPadre: 2023 Ford F-150 SuperCrew specs'] },
  { i: 20, sources: ['National Hot Dog and Sausage Council (via Foodmarket.com)', 'Route66RoadTrip.com'] },
  { i: 10, sources: ['NPS NPGallery: Hoover Dam record', 'NFL Rulebook', 'NOAA National Geodetic Survey'] },
  { i: 21, sources: ['National Park Service: Mississippi River facts', 'NIST Handbook 44'] }
];
const tStart = html.indexOf('const TITLES = [');
const TITLES = JSON.parse(html.slice(tStart + 15, html.indexOf('];', tStart) + 1));
const CARDS = PICKS.map((p) => Object.assign({ poolIndex: p.i, title: TITLES[p.i], sourceNames: p.sources }, POOL[p.i]));
fs.writeFileSync(path.join(__dirname, 'data.js'), 'window.CARDS = ' + JSON.stringify(CARDS, null, 1) + ';\n');
CARDS.forEach((c, k) => console.log('q' + (k + 1), c.poolIndex, c.answer, c.unit, c.sliderMin, c.sliderMax, '|', c.sources.join(' ; ')));
