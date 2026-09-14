#!/usr/bin/env node
/**
 * Conscience atlas. First verses come from lib/curated.js.
 * Refusals and hard-letter copy stay editorial in this file.
 * Written by `npm run curated`. Do not edit public/atlas.html by hand.
 */
const fs = require('fs');
const path = require('path');
const { encouragementFor, themeNames } = require('../lib/curated');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'atlas.html');

const REFUSE = {
  'Anxiety & Worry': 'Never leads a veteran or the ashamed. Shame opens on the lost sheep, not tomorrow’s rent.',
  'Grief & Loss': 'Never contains many mansions. Comfort first, not departure as escape.',
  Forgiveness: 'Never leads with forgive-not. Affair day is not this room.',
  Loneliness: 'Company, not a technique. Not an orphan story.',
  'Conflict & Relationships': 'Never leads with love your enemies. The first move is small enough for today.',
  Fear: 'No longer carries Jairus’s “only believe.” A dying child’s parent must not be handed it.',
  'Purpose & Direction': 'A job lost is worry. A house lost is suffering. “Lost” alone is not this room.',
  'Faith & Doubt': 'A body not getting better is Suffering, never this room.',
  'Suffering & Pain': 'Come first. Tribulation may be third, never the first sentence.',
  'Shame & Guilt': 'The one who hit, and the veteran, open here — never “this is not your fault,” never take no thought.',
  Peace: 'Crisis uses this verse, then Come, then the numbered hairs — not the tribulation line from this room’s third passage.',
  Hope: 'Sorrow is admitted. Joy is not a mood you manufacture.',
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstLine(quote) {
  const q = String(quote || '').trim();
  const stop = q.search(/[.!?]/);
  if (stop > 24 && stop < 110) return q.slice(0, stop + 1);
  if (q.length <= 96) return q;
  return q.slice(0, 94).replace(/\s+\S*$/, '') + '…';
}

function roomArticle(name) {
  const pack = encouragementFor(name);
  if (!pack || !pack.passages || !pack.passages[0]) {
    throw new Error('atlas: missing first passage for ' + name);
  }
  const first = pack.passages[0];
  const refuse = REFUSE[name];
  if (!refuse) throw new Error('atlas: missing editorial refusal for ' + name);
  return [
    `    <article data-room="${esc(name)}">`,
    `      <h2>${esc(name)}</h2>`,
    `      <p class="first">${esc(firstLine(first.quote))}</p>`,
    `      <p class="cite">${esc(first.verse)} · KJV</p>`,
    `      <p class="refuse">${esc(refuse)}</p>`,
    '    </article>',
  ].join('\n');
}

function render() {
  const rooms = themeNames().map(roomArticle).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#F4EFE4" />
  <title>The rooms — Red Letter</title>
  <link rel="icon" href="./icon-192.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=Source+Serif+4:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root { --paper:#F4EFE4; --folio:#FBF7EE; --ink:#1B1610; --mute:#7A6E5E; --crimson:#8F1D1D; --rule:rgba(27,22,16,.1); }
    * { box-sizing:border-box; margin:0; padding:0; }
    html, body { min-height:100%; background:var(--paper); color:var(--ink); }
    body { font-family:'Source Serif 4', Georgia, serif; }
    main { max-width:44rem; margin:0 auto; padding:56px 22px 96px; }
    .kicker { font-family:'Instrument Sans', system-ui, sans-serif; letter-spacing:.24em; text-transform:uppercase; font-size:11px; color:var(--mute); }
    h1 { font-family:Fraunces, Georgia, serif; font-weight:500; font-size:clamp(40px, 8vw, 64px); letter-spacing:-.03em; line-height:.95; margin:12px 0 16px; }
    h1 em { font-style:italic; color:var(--crimson); }
    .lede { font-style:italic; color:#4A4034; max-width:36ch; line-height:1.5; margin-bottom:36px; }
    article { border-top:1px solid var(--rule); padding:22px 0; }
    article h2 { font-family:Fraunces, Georgia, serif; font-weight:500; font-size:22px; margin-bottom:6px; }
    .first { font-family:Fraunces, Georgia, serif; font-style:italic; color:var(--crimson); font-size:20px; line-height:1.4; margin:8px 0; }
    .cite { font-family:'Instrument Sans', system-ui, sans-serif; letter-spacing:.14em; text-transform:uppercase; font-size:11px; color:var(--mute); }
    .refuse { margin-top:10px; color:var(--mute); font-size:15px; line-height:1.5; }
    .hard { margin-top:40px; padding-top:22px; border-top:1px solid var(--rule); }
    .hard h2 { font-family:Fraunces, Georgia, serif; font-weight:500; font-size:22px; margin-bottom:12px; }
    .hard p { margin:10px 0; line-height:1.55; }
    a { color:var(--crimson); }
    nav { margin-top:36px; font-family:'Instrument Sans', system-ui, sans-serif; font-size:14px; }
  </style>
</head>
<body>
  <!-- generated by npm run curated from lib/curated.js. Do not edit by hand. -->
  <main data-generated="curated">
    <p class="kicker">Conscience atlas</p>
    <h1>Twelve rooms, one <em>first</em> word</h1>
    <p class="lede">The first verse is the one a person on a bad night reads. Each room refuses a sentence that used to wound.</p>

${rooms}

    <section class="hard">
      <h2>Hard letters, first word</h2>
      <p><strong>Crisis.</strong> Notice first. Then John 14:27 · Matthew 11:28 · Luke 12:7. Never tribulation as the first word.</p>
      <p><strong>Poison.</strong> 911 / 1-800-222-1222 above 988. Then the same three.</p>
      <p><strong>The one who hit.</strong> Violence notice. Luke 15:4. Never “not your fault.”</p>
      <p><strong>Affair day.</strong> Come (Matthew 11:28). Forgiveness waits.</p>
      <p><strong>Empty send.</strong> Two calm lines: Matthew 11:28, John 14:27. Not the day’s word.</p>
    </section>

    <nav>
      <a href="./">The room</a> · <a href="./help.html">Help if this fails</a>
    </nav>
  </main>
</body>
</html>
`;
}

function writeAtlas() {
  fs.writeFileSync(OUT, render());
  console.log('Wrote public/atlas.html from lib/curated.js (' + themeNames().length + ' rooms)');
}

if (require.main === module) writeAtlas();

module.exports = { writeAtlas, REFUSE };
