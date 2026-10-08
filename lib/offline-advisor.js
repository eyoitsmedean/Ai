// The page's no-key Advisor (public/data/advisor.js), run on the server too,
// so a reader without a live model gets the same letter written for their
// words whether the page or the server answers. The browser files are loaded
// unchanged into a sandbox that stands in for window.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crisis = require('../public/data/crisis');

const DATA = path.join(__dirname, '..', 'public', 'data');
const sandbox = { window: { RLA_CRISIS: crisis } };
vm.createContext(sandbox);
for (const file of ['curated.js', 'advisor.js']) {
  vm.runInContext(fs.readFileSync(path.join(DATA, file), 'utf8'), sandbox, { filename: file });
}
const { RLA_advise: advise, RLA_adviseTheme: adviseTheme } = sandbox.window;

module.exports = { advise, adviseTheme };
