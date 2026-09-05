#!/usr/bin/env node
/**
 * Bound-book review folio — generated from the locked catalog.
 * Open review/folio.html. No invented verses.
 */
const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'assets', 'moments', 'catalog.json'), 'utf8')
);

const today = catalog.daily[2]; // Peace / John 16:33 — a sentence that holds
const come = catalog.seven[0];
const rooms = Object.values(catalog.themes);
const verseCount = Object.keys(catalog.verses).length;
const widget = {
  word: today.word.passage,
  citation: today.word.verse,
};

const vespersPrompts = [
  'What are you laying down?',
  'Where did you need rest?',
  'What stayed after the day?',
  'Whom will you forgive before sleep?',
  'What fear can wait until morning?',
  'Where was mercy given to you?',
  'What will you leave in His hands?',
];

const offices = [
  { name: 'Morning', hours: '06:00 – 12:00', watch: 'Dawn', note: 'Today’s light. The sentence meets the first hour.' },
  { name: 'Afternoon', hours: '12:00 – 17:00', watch: 'Day', note: 'The same Word. The clock does not invent a second saying.' },
  { name: 'Vespers', hours: '17:00 – 21:00', watch: 'Evening', note: 'A prompt from the week. The furniture stays quiet.' },
  { name: 'Compline', hours: '21:00 – 06:00', watch: 'Night', note: 'Night office. The page is a lamp, never OLED.' },
];

const seasons = [
  { id: 'ordinary', name: 'Ordinary Time', paper: '#F4EFE4', folio: '#FBF7EE', crimson: '#8F1D1D', gold: '#8A6A28', note: 'Warm paper. The default clothes of the book.' },
  { id: 'advent', name: 'Advent', paper: '#EEEBE6', folio: '#F4F1EA', crimson: '#5C2448', gold: '#5A4A6A', note: 'The leaf cools. You never have to name the season.' },
  { id: 'christmas', name: 'Christmas', paper: '#F7F0E2', folio: '#FBF6EC', crimson: '#9A1C24', gold: '#A07A2A', note: 'The paper warms. Gold lifts a half-stop.' },
  { id: 'lent', name: 'Lent', paper: '#E8E0D2', folio: '#EFE8DA', crimson: '#6E2E24', gold: '#6B5344', note: 'Unbleached. Quieter. Nothing extra on the page.' },
  { id: 'easter', name: 'Easter', paper: '#F7F2E6', folio: '#FBF7EE', crimson: '#8F1D1D', gold: '#C4A35A', note: 'Gold enters the rule. The crimson stays His speech.' },
];

const identifiers = [
  ['Workspace', 'ios/Runner.xcworkspace'],
  ['App bundle', 'com.redwords.redWords'],
  ['Widget product', 'RedWordsWidget'],
  ['Widget bundle', 'com.redwords.redWords.RedWordsWidget'],
  ['App Group', 'group.com.redwords.redWords'],
  ['URL scheme', 'redwords://today'],
  ['Display name', 'Red Words'],
  ['iOS floor', '15.0 — Runner and widget'],
  ['Version', '0.1.0+2'],
  ['Android applicationId', 'com.redwords.red_words'],
];

const forbidden = ['Red Words', 'streak', 'badge', 'Tap to', 'Subscribe', 'Roumie', 'Chosen', 'Hallow'];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const catchwordSkip = new Set([
  'these', 'things', 'that', 'unto', 'have', 'from', 'shall', 'they', 'them',
  'this', 'into', 'your', 'their', 'with', 'been', 'were', 'said', 'saith',
  'spoken', 'before', 'after', 'which', 'there', 'about', 'would', 'could',
  'should', 'might', 'what', 'when', 'where',
]);

function catchword(passage) {
  const words = String(passage)
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return (
    words.find((w) => w.length >= 4 && !catchwordSkip.has(w.toLowerCase())) ||
    words.find((w) => w.length > 3) ||
    words[0] ||
    'Peace'
  );
}

const restWordRaw = catchword(today.word.passage);
const restWord = restWordRaw ? restWordRaw[0].toUpperCase() + restWordRaw.slice(1) : 'Peace';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Red Words — a bound book for review</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,560&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
:root {
  --paper: #F4EFE4; --folio: #FBF7EE; --ink: #1B1610; --muted: #7A6E5E;
  --crimson: #8F1D1D; --gold: #8A6A28; --rule: rgba(27,22,16,.12);
  --display: "Fraunces", "Iowan Old Style", Georgia, serif;
  --body: "Source Serif 4", Palatino, serif;
  --ui: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scroll-padding-top: 52px; }
html, body { background: #c9bea8; color: var(--ink); font-family: var(--ui); }
body {
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(255,250,240,.35), transparent 55%),
    #c9bea8;
}
.stage { max-width: 1180px; margin: 0 auto; padding: 28px 16px 96px; }
.book {
  background: var(--paper);
  box-shadow:
    8px 0 24px rgba(27,22,16,.06) inset,
    0 1px 0 rgba(27,22,16,.06),
    0 36px 90px rgba(27,22,16,.16);
  position: relative;
  overflow: hidden;
  counter-reset: leaf;
}
.book::before {
  content: "";
  position: absolute; left: 0; top: 0; bottom: 0; width: 8px;
  background: linear-gradient(90deg, #6e1616, var(--crimson) 55%, #a33);
  z-index: 3;
}
.book::after {
  content: "";
  pointer-events: none;
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.045'/%3E%3C/svg%3E");
  z-index: 1;
}
.leaf {
  position: relative;
  z-index: 2;
  padding: 64px 64px 72px 80px;
  border-bottom: 1px solid var(--rule);
  counter-increment: leaf;
  scroll-margin-top: 52px;
}
.leaf::after {
  content: counter(leaf, decimal-leading-zero);
  position: absolute; right: 28px; bottom: 22px;
  font-size: 11px; letter-spacing: .18em; color: var(--muted);
}
@media (max-width: 720px) {
  .leaf { padding: 40px 22px 56px 30px; }
  .leaf::after { right: 16px; }
}
.kicker { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); }
h1, h2, h3 { font-family: var(--display); font-weight: 500; }
.promise { font-family: var(--display); font-style: italic; font-size: clamp(40px, 7vw, 72px); color: var(--crimson); line-height: 1.12; }
.lede { font-family: var(--body); font-size: 19px; line-height: 1.65; max-width: 38em; }
.drop::first-letter {
  font-family: var(--display); font-style: italic; font-size: 3.1em;
  float: left; line-height: .75; padding: .08em .1em 0 0; color: var(--crimson);
}
.mark {
  width: 56px; height: 56px; border-radius: 50%;
  border: 1px solid rgba(27,22,16,.22); display: grid; place-items: center;
  font-family: var(--display); font-style: italic; font-size: 26px; color: var(--crimson);
}
.toc { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px 28px; margin-top: 28px; }
.toc a {
  color: var(--ink); text-decoration: none; font-family: var(--body); font-size: 16px;
  border-bottom: 1px dotted var(--rule); padding: 6px 0;
}
.toc a span { color: var(--muted); font-family: var(--ui); font-size: 12px; letter-spacing: .12em; margin-right: 10px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px; margin-top: 28px; }
.phones { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; margin-top: 28px; justify-items: center; }
.phone {
  width: 268px; height: 560px;
  background: var(--paper);
  border-radius: 36px; padding: 18px 16px 14px;
  box-shadow: inset 0 0 0 9px #1b1610, 0 22px 48px rgba(27,22,16,.14);
  display: flex; flex-direction: column; position: relative;
}
.phone .notch {
  width: 88px; height: 10px; border-radius: 999px; background: #1b1610;
  margin: 0 auto 10px;
}
.phone .silk { position: absolute; left: 9px; top: 9px; bottom: 9px; width: 3px; background: var(--crimson); opacity: .7; }
.ph-head { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); text-align: center; }
.ph-gold { font-size: 11px; letter-spacing: .16em; color: var(--gold); text-align: center; margin-top: 4px; }
.ph-word { font-family: var(--body); font-style: italic; color: var(--crimson); font-size: 15.5px; line-height: 1.45; text-align: center; margin-top: 16px; }
.ph-cite { font-size: 10px; letter-spacing: .12em; color: var(--crimson); text-align: center; margin-top: 10px; }
.ph-note { font-family: var(--body); font-size: 13px; line-height: 1.5; text-align: center; color: var(--ink); margin-top: 14px; }
.ph-dock { margin-top: auto; display: flex; justify-content: center; gap: 10px; font-size: 11px; letter-spacing: .08em; color: var(--muted); padding-top: 10px; }
.ph-catch {
  font-family: var(--display); font-style: italic; font-size: 42px;
  color: var(--crimson); text-align: center; margin: auto 0;
}
.caption { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); text-align: center; margin-top: 12px; }
.homescreen {
  width: 268px; height: 560px; margin: 0 auto;
  background: linear-gradient(180deg, #3a2a22, #1b1610);
  border-radius: 36px; padding: 22px 16px 16px;
  box-shadow: inset 0 0 0 9px #111, 0 22px 48px rgba(27,22,16,.18);
  color: #f4efe4; display: flex; flex-direction: column; align-items: center;
}
.homescreen .clock { font-family: var(--display); font-size: 52px; font-weight: 400; letter-spacing: -.03em; }
.homescreen .date { font-size: 13px; letter-spacing: .08em; opacity: .7; margin-top: 2px; }
.widget {
  width: 220px; min-height: 148px; margin: 22px auto 0;
  background: var(--paper); border-radius: 18px; padding: 18px 16px;
  border: 1px solid var(--rule);
  box-shadow: 0 12px 30px rgba(27,22,16,.12);
}
.widget p { font-family: var(--body); font-style: italic; color: var(--crimson); font-size: 14.5px; line-height: 1.4; }
.widget cite { display: block; margin-top: 12px; font-style: normal; font-size: 10px; letter-spacing: .14em; color: var(--crimson); }
.blessing {
  max-width: 420px; margin: 28px auto 0; padding: 40px 32px 32px;
  background: var(--folio); border: 1px solid var(--rule);
}
.blessing p { font-family: var(--body); font-style: italic; color: var(--crimson); font-size: 20px; line-height: 1.45; text-align: center; }
.blessing cite { display: block; margin-top: 16px; text-align: center; font-style: normal; letter-spacing: .14em; font-size: 11px; color: var(--crimson); }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { text-align: left; padding: 11px 8px; border-bottom: 1px solid var(--rule); vertical-align: top; }
.table th { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
.room { font-family: var(--body); }
.cite { color: var(--crimson); letter-spacing: .08em; font-size: 12px; }
.colophon { font-family: var(--body); font-size: 16px; line-height: 1.7; color: var(--muted); max-width: 36em; }
.check { list-style: none; }
.check li { padding: 9px 0 9px 28px; position: relative; font-family: var(--body); line-height: 1.55; font-size: 17px; }
.check li::before { content: "○"; position: absolute; left: 0; color: var(--crimson); }
.seasons { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 22px; }
@media (max-width: 800px) { .seasons { grid-template-columns: 1fr 1fr; } }
.swatch { padding: 28px 14px 20px; text-align: center; min-height: 140px; display: flex; flex-direction: column; justify-content: space-between; }
.swatch strong { font-family: var(--display); font-weight: 500; font-size: 16px; }
.swatch em { font-size: 11px; letter-spacing: .06em; font-style: normal; opacity: .75; }
.clocks { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 24px; }
.clock-card { border: 1px solid var(--rule); padding: 20px 18px; background: var(--folio); }
.clock-card h3 { font-size: 22px; }
.clock-card .hrs { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); margin: 6px 0 10px; }
.clock-card p { font-family: var(--body); font-size: 14px; line-height: 1.5; color: var(--muted); }
.seven { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 24px; }
.daycard { background: var(--folio); border: 1px solid var(--rule); padding: 22px 18px 18px; }
.daycard .n { font-size: 11px; letter-spacing: .16em; color: var(--gold); text-transform: uppercase; }
.daycard h3 { font-family: var(--display); font-size: 26px; margin: 8px 0 12px; }
.daycard p { font-family: var(--body); font-style: italic; color: var(--crimson); font-size: 14px; line-height: 1.4; }
.plates { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 24px; }
.plate { border-top: 1px solid var(--rule); padding: 16px 4px 8px; }
.plate .num { font-size: 11px; letter-spacing: .18em; color: var(--muted); }
.plate h3 { font-family: var(--display); font-size: 22px; margin: 6px 0 4px; }
.plate .head { font-family: var(--body); font-style: italic; color: var(--gold); margin-bottom: 10px; }
.plate .saying { font-family: var(--body); font-size: 14.5px; line-height: 1.5; }
.strike { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.strike span {
  font-size: 13px; letter-spacing: .04em; padding: 6px 10px;
  border: 1px solid var(--rule); color: var(--muted); text-decoration: line-through;
}
.ids { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
.week { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 22px; }
.week article { border-bottom: 1px solid var(--rule); padding: 12px 0 16px; }
.week h3 { font-family: var(--display); font-size: 20px; }
.nav {
  position: sticky; top: 0; z-index: 8;
  background: rgba(244,239,228,.92); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rule);
  display: flex; gap: 16px; overflow-x: auto; padding: 10px 24px 10px 32px;
  font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
}
.nav a { color: var(--muted); text-decoration: none; white-space: nowrap; }
.nav a:hover { color: var(--crimson); }
@media print {
  html, body { background: white; }
  .nav { display: none; }
  .book { box-shadow: none; }
  .leaf { break-inside: avoid; }
}
</style>
</head>
<body>
<div class="stage">
<nav class="nav" aria-label="Folio leaves">
  <a href="#front">Front</a>
  <a href="#law">Law</a>
  <a href="#morning">Morning</a>
  <a href="#lectio">Sit</a>
  <a href="#bless">Bless</a>
  <a href="#office">Office</a>
  <a href="#seven">Seven</a>
  <a href="#seek">Seek</a>
  <a href="#week">Week</a>
  <a href="#paper">Paper</a>
  <a href="#lock">Lock</a>
  <a href="#dean">Dean</a>
</nav>
<article class="book">

<section class="leaf" id="front">
  <p class="kicker">A folio for Dean · 5 September 2026</p>
  <div class="mark" style="margin: 36px 0 24px">R</div>
  <p class="promise">${esc(catalog.brand.promise)}</p>
  <p class="lede drop" style="margin-top: 28px">
    This is not a second app. It is the existing Red Words book, bound for a phone.
    The sentence is the interface. The widget is the Word. The rooms you already
    wrote — office, lectio, Seven Days, blessing, silk, the printer’s mark — are
    now leaves a guest can turn. Nothing on this page was invented to fill a silence.
  </p>
  <nav class="toc" aria-label="Contents">
    <a href="#law"><span>02</span>Widget = Word only</a>
    <a href="#morning"><span>03</span>Three leaves of the first morning</a>
    <a href="#lectio"><span>04</span>Sit — Read, Reflect, Rest, Respond</a>
    <a href="#bless"><span>05</span>A blessing without the brand</a>
    <a href="#office"><span>06</span>The office is a clock</a>
    <a href="#seven"><span>07</span>Seven Days with His words</a>
    <a href="#seek"><span>08</span>Twelve rooms</a>
    <a href="#week"><span>09</span>The seven-day rotation</a>
    <a href="#paper"><span>10</span>The paper changes clothes</a>
    <a href="#lock"><span>11</span>Identifiers and the fail-closed page</a>
    <a href="#dean"><span>12</span>The only taps that matter</a>
  </nav>
</section>

<section class="leaf" id="law">
  <p class="kicker">The law</p>
  <h2 style="font-size: clamp(32px, 5vw, 48px); margin: 12px 0 16px">Widget = Word only</h2>
  <p class="lede">No badge. No streak. No CTA. No in-card app name. The card is the saying and its address. Tap opens <em>redwords://today</em>. The payload keys are <code>word</code> and <code>citation</code> — nothing else crosses the App Group.</p>
  <div class="grid" style="align-items: start">
    <div>
      <div class="homescreen">
        <p class="clock">7:14</p>
        <p class="date">Wednesday 2 September</p>
        <div class="widget">
          <p>${esc(widget.word)}</p>
          <cite>${esc(widget.citation)}  ·  KJV</cite>
        </div>
        <p style="margin-top:auto;font-size:10px;letter-spacing:.16em;opacity:.45">WORD</p>
      </div>
      <p class="caption">Home screen · the card a guest actually keeps</p>
    </div>
    <div>
      <p class="lede" style="margin-top: 8px">These words may never appear on the card:</p>
      <div class="strike">
        ${forbidden.map((w) => `<span>${esc(w)}</span>`).join('')}
      </div>
      <p class="lede" style="margin-top: 28px">Craft, from the design language: crimson is reserved for speech He spoke. Paper, not glass. A missed day is never a failure state. If you removed the navigation, the first screen would still say red letter — because a sentence is set in red, on paper, as if a printer had dipped the type.</p>
    </div>
  </div>
</section>

<section class="leaf" id="morning">
  <p class="kicker">The first morning</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 8px">Three leaves a guest actually turns</h2>
  <p class="lede" style="margin-bottom: 8px">Title. Today. Sit. The furniture leaves the room. The silk stays in the gutter.</p>
  <div class="phones">
    <div>
      <div class="phone">
        <div class="silk"></div>
        <div class="notch"></div>
        <p class="ph-head">Ordinary Time</p>
        <div class="mark" style="margin: 48px auto 18px; width: 44px; height: 44px; font-size: 22px">R</div>
        <p class="ph-word" style="font-size: 22px">${esc(catalog.brand.promise)}</p>
        <p class="ph-note">A quiet page for the words Jesus spoke. The Gospels only. Kept on this device.</p>
        <p class="ph-dock">Turn the page</p>
      </div>
      <p class="caption">Title · printer’s mark</p>
    </div>
    <div>
      <div class="phone">
        <div class="silk"></div>
        <div class="notch"></div>
        <p class="ph-head">Ordinary Time</p>
        <p class="ph-gold">Morning</p>
        <p class="ph-gold" style="letter-spacing:.08em">${esc(today.word.theme)}</p>
        <p class="ph-word">${esc(today.word.passage)}</p>
        <p class="ph-cite">${esc(today.word.verse)}  ·  KJV</p>
        <p class="ph-note">${esc(today.word.reflection)}</p>
        <p class="ph-dock">Sit · Seek · Seven · Bless</p>
      </div>
      <p class="caption">Today · the Word is the page</p>
    </div>
    <div>
      <div class="phone">
        <div class="notch"></div>
        <p class="ph-head">Read</p>
        <p class="ph-word" style="margin-top: 64px; font-size: 17px">${esc(today.word.passage)}</p>
        <p class="ph-cite">${esc(today.word.verse)}</p>
        <p class="ph-dock">Read · Reflect · Rest · Respond</p>
      </div>
      <p class="caption">Sit · chrome gone</p>
    </div>
  </div>
</section>

<section class="leaf" id="lectio">
  <p class="kicker">Sit — lectio divina</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">Four leaves. Amen is allowed to end the room.</h2>
  <p class="lede">Read is the sentence. Reflect is the note already written for this hour. Rest is one catchword from the saying — not a timer, not a score. Respond is one sentence of your own; you do not have to finish the thought. Next turns the leaf. Amen returns you to Today.</p>
  <div class="phones">
    <div>
      <div class="phone">
        <div class="notch"></div>
        <p class="ph-head">Read</p>
        <p class="ph-word" style="margin-top: 56px">${esc(today.word.passage)}</p>
        <p class="ph-cite">${esc(today.word.verse)}  ·  KJV</p>
        <p class="ph-dock">Next</p>
      </div>
      <p class="caption">I. The Word</p>
    </div>
    <div>
      <div class="phone">
        <div class="notch"></div>
        <p class="ph-head">Reflect</p>
        <p class="ph-note" style="margin-top: 64px; font-size: 16px">${esc(today.word.reflection)}</p>
        <p class="ph-dock">Next</p>
      </div>
      <p class="caption">II. The note for this hour</p>
    </div>
    <div>
      <div class="phone">
        <div class="notch"></div>
        <p class="ph-head">Rest</p>
        <p class="ph-catch">${esc(restWord)}</p>
        <p class="ph-dock">Next</p>
      </div>
      <p class="caption">III. One word from the sentence</p>
    </div>
    <div>
      <div class="phone">
        <div class="notch"></div>
        <p class="ph-head">Respond</p>
        <p class="ph-note" style="margin-top: 72px; font-size: 17px; color: var(--muted)">One sentence is enough. You do not have to finish the thought.</p>
        <p class="ph-dock">Amen</p>
      </div>
      <p class="caption">IV. Then leave the room</p>
    </div>
  </div>
</section>

<section class="leaf" id="bless">
  <p class="kicker">A blessing</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">One cream leaf. Sit with this.</h2>
  <p class="lede">The blessing card is the Word and the citation. It does not say Red Words. It does not ask anyone to install anything. It is a letterpress broadside you can hold up to a friend.</p>
  <div class="blessing">
    <p>${esc(today.word.passage)}</p>
    <cite>${esc(today.word.verse)}  ·  KJV</cite>
  </div>
  <p class="caption">Blessing card · no brand on the leaf</p>
</section>

<section class="leaf" id="office">
  <p class="kicker">The daily office</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">A clock, not a setting</h2>
  <p class="lede">Morning before noon. Afternoon until seventeen. Vespers after seventeen. Compline after twenty-one, and again before six. The same Word stays on the page. The hour only changes the running title and, in the evening, offers one prompt from the week.</p>
  <div class="clocks">
    ${offices.map((o) => `<article class="clock-card"><h3>${esc(o.name)}</h3><p class="hrs">${esc(o.hours)} · ${esc(o.watch)}</p><p>${esc(o.note)}</p></article>`).join('')}
  </div>
  <h3 style="margin: 36px 0 12px; font-size: 26px">Vespers prompts — one for each weekday</h3>
  <table class="table">
    <thead><tr><th>Weekday</th><th>The page asks</th></tr></thead>
    <tbody>
      ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d, i) =>
        `<tr><td>${d}</td><td class="room">${esc(vespersPrompts[i])}</td></tr>`
      ).join('')}
    </tbody>
  </table>
</section>

<section class="leaf" id="seven">
  <p class="kicker">Seven Days with His words</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">Come · Peace · Light · Love · Forgive · Abide · Go</h2>
  <p class="lede">The Pray40 you can ship before Lent. One room a morning. Beads on Today mark place. They do not shame. A missed morning is never a failure state. Day one is not a program. It is an invitation.</p>
  <div class="seven">
    ${catalog.seven.map((d, i) => `<article class="daycard"><p class="n">Day ${String(i + 1).padStart(2, '0')}</p><h3>${esc(d.title)}</h3><p>${esc(d.passage)}</p><p class="cite" style="margin-top:12px">${esc(d.verse)}</p></article>`).join('')}
  </div>
  <div class="blessing" style="margin-top: 40px">
    <p class="kicker" style="margin-bottom: 16px">${esc(come.title)}</p>
    <p>${esc(come.passage)}</p>
    <cite>${esc(come.verse)}  ·  KJV</cite>
    <p style="margin-top: 22px; font-style: normal; color: var(--ink); font-size: 16px; font-family: var(--body)">${esc(come.reflection)}</p>
  </div>
</section>

<section class="leaf" id="seek">
  <p class="kicker">Seek — twelve rooms</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">Encouragement, not a feed</h2>
  <p class="lede">A table of contents. Twelve named rooms. The first sentence He spoke there, locked by <code>lookup()</code>. No Romans. No Psalms. No celebrity.</p>
  <div class="plates">
    ${rooms.map((r, i) => {
      const first = r.passages[0];
      return `<article class="plate"><p class="num">${String(i + 1).padStart(2, '0')}</p><h3>${esc(r.theme)}</h3><p class="head">${esc(r.headline)}</p><p class="saying">${esc(first.quote)}</p><p class="cite" style="margin-top:8px">${esc(first.verse)}</p></article>`;
    }).join('')}
  </div>
</section>

<section class="leaf" id="week">
  <p class="kicker">The daily rotation</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">Seven mornings. The same clock as the Quiet Page.</h2>
  <p class="lede">The Flutter engine ports <code>dailyForDate</code>. Goldens cover four hundred days against Node. If the catalog is empty, the page is blank. Nothing is invented to fill the silence.</p>
  <div class="week">
    ${catalog.daily.map((d, i) => `<article><p class="kicker">Slot ${String(i + 1).padStart(2, '0')}</p><h3>${esc(d.word.theme)}</h3><p class="cite" style="margin: 6px 0 8px">${esc(d.word.verse)}</p><p class="room">${esc(d.word.passage)}</p></article>`).join('')}
  </div>
</section>

<section class="leaf" id="paper">
  <p class="kicker">The paper changes clothes</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">You never have to name Advent</h2>
  <p class="lede">The church year retints the leaf. These are the Flutter tokens — the same hex the phone wears. Silk in the gutter takes the season’s crimson. Dark is a lamp after vespers, never a black slab.</p>
  <div class="seasons">
    ${seasons.map((s) => `<div class="swatch" style="background:${s.paper};color:${s.crimson}"><strong>${esc(s.name)}</strong><em>${esc(s.paper)}</em><span style="font-family:var(--body);font-size:13px;margin-top:10px;color:${s.gold}">${esc(s.note)}</span></div>`).join('')}
  </div>
</section>

<section class="leaf" id="lock">
  <p class="kicker">What is locked</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 12px">Identifiers, corpus, fail-closed</h2>
  <table class="table ids">
    <thead><tr><th>Lock</th><th>Value</th></tr></thead>
    <tbody>
      ${identifiers.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
      <tr><td>Corpus</td><td>${verseCount} red-letter KJV verses. Zero Romans. Zero Psalms. Zero celebrity.</td></tr>
      <tr><td>Empty catalog</td><td>The page is blank. His words will be here when the book is.</td></tr>
      <tr><td>Widget clock</td><td>The seven-slot rotation crosses the App Group once. iOS renders one entry per local midnight; Android recomputes from the clock and wakes after midnight. The card is right on mornings no one opens the book.</td></tr>
      <tr><td>Rights</td><td>Rights in the Authorized (King James) Version in the United Kingdom are vested in the Crown, administered by Cambridge University Press. Public domain elsewhere. UK availability is Dean’s call.</td></tr>
      <tr><td>Privacy</td><td>Nothing collected. Nothing sent. PRIVACY.md is the policy; About carries it in-app.</td></tr>
    </tbody>
  </table>
  <div class="phone" style="margin: 36px auto 0; height: 420px">
    <div class="silk"></div>
    <div class="notch"></div>
    <p class="ph-head">Colophon</p>
    <p class="ph-word" style="margin-top: 80px; font-size: 26px; color: var(--ink); font-style: italic">The page is blank.</p>
    <p class="ph-note" style="color: var(--muted)">His words will be here when the book is. Nothing has been invented to fill the silence.</p>
  </div>
  <p class="caption">Fail closed · no invented verse</p>
</section>

<section class="leaf">
  <p class="kicker">What this agent verified · 5 Sep 2026</p>
  <table class="table">
    <thead><tr><th>Check</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>Corpus lock</td><td>${verseCount} spoken Gospel verses, each passed through <code>lookup()</code>.</td></tr>
      <tr><td>Flutter tests</td><td>Engine parity, office clock, Seven Days, lectio Read leaf, blessing card without the brand, widget craft law, empty catalog.</td></tr>
      <tr><td>Android</td><td>APK/AAB built on Linux. Debug-signed. Not a Play upload. Label: Red Words. Scheme: redwords://today. App-widget present.</td></tr>
      <tr><td>iOS</td><td>Archive-ready identifiers. A Mac still signs TestFlight. See TESTFLIGHT.md.</td></tr>
      <tr><td>This folio</td><td>Generated from <code>assets/moments/catalog.json</code>. Rebuild with <code>npm run folio</code>.</td></tr>
    </tbody>
  </table>
</section>

<section class="leaf" id="dean">
  <p class="kicker">Dean, on a phone and a Mac</p>
  <h2 style="font-size: clamp(32px, 5vw, 44px); margin: 12px 0 16px">The only taps that matter</h2>
  <ul class="check">
    <li>Open the title leaf. Exhale. Turn the page.</li>
    <li>Airplane mode. The sentence stays.</li>
    <li>Add the <strong>Word</strong> widget. Confirm the card is only the saying.</li>
    <li>Tap it. You are in Today. <em>redwords://today</em>.</li>
    <li>Sit: Read → Reflect → Rest → Respond. Amen is allowed to end the room.</li>
    <li>Seven: sit Come. Do not look for a streak.</li>
    <li>Bless: hold the cream leaf up. The brand is not on it.</li>
    <li>Set the phone’s date forward a day. The card changes without you.</li>
    <li>Leave the app on Seek. Tap the widget. You land on Today.</li>
    <li>On a Mac: <code>ios/Runner.xcworkspace</code>, Team on Runner and RedWordsWidget, App Group <code>group.com.redwords.redWords</code>, Archive.</li>
  </ul>
</section>

<section class="leaf">
  <p class="kicker">Colophon</p>
  <p class="colophon">
    Set from the spoken King James Gospels. Brand promise locked.
    Widget law locked. Identifiers locked. No accounts. No payments.
    No second app. ${verseCount} verses. Twelve rooms. Seven days.
    His words, for this moment.
  </p>
  <div class="mark" style="margin: 36px 0 0">R</div>
</section>

</article>
</div>
</body>
</html>
`;

const out = path.join(__dirname, '..', 'review', 'folio.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote', out, Buffer.byteLength(html), 'bytes');
