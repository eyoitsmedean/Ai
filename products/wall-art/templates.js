'use strict';
// HTML/CSS for each of the 12 Words in Frame designs.
//
// Every sheet is rendered with the viewport equal to the output in pixels, so
// 1vw = 1% of the sheet width and 1vh = 1% of its height. Each design places
// one or more absolutely positioned blocks (.blk). A block with data-fw/data-fh
// is fitted in the page: its font-size is set so its widest line is at most
// fw x sheet width and its height at most fh x sheet height. Everything inside
// a fitted block is sized in em (scales with the type) except the citation,
// which is sized in vw so it stays legible at every print size.
const path = require('path');

const FONTS = path.join(__dirname, '..', 'forty-days', 'fonts');

const GROUNDS = {
  paper: { bg: '#f6f3ee', fg: '#23201d', ac: '#a3142c', orn: '#a3142c', cite: '#a3142c', soft: 'rgba(35,32,29,0.55)' },
  stone: { bg: '#e9e3da', fg: '#23201d', ac: '#a3142c', orn: '#a3142c', cite: '#a3142c', soft: 'rgba(35,32,29,0.55)' },
  ink: { bg: '#23201d', fg: '#efe9df', ac: '#cc5060', orn: '#c8404f', cite: 'rgba(239,233,223,0.72)', soft: 'rgba(239,233,223,0.5)' },
  red: { bg: '#a3142c', fg: '#f7f2ea', ac: '#f7f2ea', orn: 'rgba(247,242,234,0.78)', cite: 'rgba(247,242,234,0.82)', soft: 'rgba(247,242,234,0.55)' },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One line of the saying. Accent words get <em class="ac">; trailing
// punctuation gets <span class="hp"> so centred/right lines can hang it.
function line(text, d, cls = '') {
  const accents = d.accent == null ? [] : [].concat(d.accent);
  let html = esc(text);
  let trail = '';
  const m = /([,;:.]+)$/.exec(html);
  if (m) { trail = m[1]; html = html.slice(0, -trail.length); }
  for (const a of accents) {
    const core = esc(a).replace(/[,;:.]+$/, '');
    const re = new RegExp(`(^|[^A-Za-z])(${reEsc(core)})(?![A-Za-z])`);
    if (re.test(html)) { html = html.replace(re, '$1<em class="ac">$2</em>'); break; }
  }
  if (trail) html += `<span class="hp">${trail}</span>`;
  return `<span class="ln ${cls}">${html}</span>`;
}

const cite = (d, style = '') => `<div class="cite" style="${style}">${esc(d.ref)}</div>`;

// ---- Ornaments (SVG, stroke widths in viewBox units; sized by the caller) ----
const svg = (vb, body, style, extra = '') =>
  `<svg class="orn" viewBox="${vb}" style="${style}" ${extra} xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">${body}</svg>`;

function radiant(color) {
  const rays = [];
  const cx = 200, cy = 118;
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI - (i * Math.PI) / 18;
    const long = i % 2 === 0;
    const r0 = 34, r1 = long ? 96 : 70;
    rays.push(`<line x1="${(cx + r0 * Math.cos(a)).toFixed(2)}" y1="${(cy - r0 * Math.sin(a)).toFixed(2)}" x2="${(cx + r1 * Math.cos(a)).toFixed(2)}" y2="${(cy - r1 * Math.sin(a)).toFixed(2)}" stroke-width="${long ? 1.6 : 1.1}"/>`);
  }
  return `<g stroke="${color}">${rays.join('')}<line x1="40" y1="${cy}" x2="150" y2="${cy}" stroke-width="1.1"/><line x1="250" y1="${cy}" x2="360" y2="${cy}" stroke-width="1.1"/></g><circle cx="${cx}" cy="${cy}" r="3.2" fill="${color}"/>`;
}

function wave(color) {
  let dpath = 'M 0 20';
  const periods = 3, w = 400, amp = 9;
  for (let x = 1; x <= w; x++) dpath += ` L ${x} ${(20 - amp * Math.sin((x / w) * periods * 2 * Math.PI)).toFixed(2)}`;
  return `<path d="${dpath}" stroke="${color}" stroke-width="2.2"/>`;
}

function star(color) {
  // A fine eight-pointed star: four long rays, four short, and a small core.
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? 96 : 42;
    pts.push(`<line x1="100" y1="100" x2="${(100 + r * Math.cos(a)).toFixed(2)}" y2="${(100 + r * Math.sin(a)).toFixed(2)}" stroke-width="${i % 2 === 0 ? 1.8 : 1.3}"/>`);
  }
  // Slim diamond around the long vertical/horizontal rays.
  const diamond = '<path d="M100 22 L108 92 L178 100 L108 108 L100 178 L92 108 L22 100 L92 92 Z" stroke-width="1.1"/>';
  return `<g stroke="${color}">${pts.join('')}${diamond}</g><circle cx="100" cy="100" r="4" fill="${color}"/>`;
}

function lily(color) {
  return `<g stroke="${color}" stroke-width="1.6" stroke-linejoin="round">
  <path d="M100 300 C 98 250, 96 205, 100 150 C 103 118, 104 104, 100 92"/>
  <path d="M99 238 C 88 226, 70 214, 52 206 C 66 222, 82 236, 99 246"/>
  <path d="M99 198 C 112 184, 130 172, 150 166 C 138 182, 120 196, 100 208"/>
  <path d="M100 150 C 106 136, 116 124, 128 116"/>
  <path d="M128 116 C 128 104, 133 94, 140 86 C 144 96, 142 108, 128 116 Z"/>
  <path d="M100 92 C 93 76, 90 60, 92 44 C 96 34, 104 34, 108 44 C 110 60, 107 76, 100 92 Z"/>
  <path d="M100 92 C 88 82, 72 72, 58 72 C 50 72, 46 66, 50 60 C 64 58, 84 70, 100 92"/>
  <path d="M100 92 C 112 82, 128 72, 142 72 C 150 72, 154 66, 150 60 C 136 58, 116 70, 100 92"/>
  <path d="M100 92 L 94 52 M100 92 L 104 50 M100 92 L 86 60 M100 92 L 113 59"/>
  </g>`;
}

function birds(color) {
  // A loose flock of small birds drawn as two-stroke curves.
  const flock = [
    [60, 30, 1.0], [96, 18, 0.8], [130, 40, 0.9], [168, 22, 0.7], [112, 66, 0.75],
    [150, 82, 0.6], [196, 50, 0.65], [80, 92, 0.55], [212, 92, 0.5],
  ];
  return `<g stroke="${color}" stroke-width="1.6" stroke-linejoin="round">${flock
    .map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M -14 0 C -9 -7, -4 -7, 0 0 C 4 -7, 9 -7, 14 0"/>`)
    .join('')}</g>`;
}

function sunrise(color, soft) {
  const arcs = [140, 112, 84].map((r, i) =>
    `<path d="M ${200 - r} 150 A ${r} ${r} 0 0 1 ${200 + r} 150" stroke="${i === 0 ? color : soft}" stroke-width="${i === 0 ? 2 : 1.4}"/>`).join('');
  const rays = [];
  for (let i = 1; i < 12; i++) {
    const a = Math.PI - (i * Math.PI) / 12;
    rays.push(`<line x1="${(200 + 152 * Math.cos(a)).toFixed(2)}" y1="${(150 - 152 * Math.sin(a)).toFixed(2)}" x2="${(200 + 172 * Math.cos(a)).toFixed(2)}" y2="${(150 - 172 * Math.sin(a)).toFixed(2)}" stroke="${color}" stroke-width="1.6"/>`);
  }
  return `${arcs}${rays.join('')}<line x1="8" y1="150" x2="392" y2="150" stroke="${soft}" stroke-width="1.4"/>`;
}

// ---- Designs -----------------------------------------------------------------
// Each returns { css, html }. `g` is the ground palette.
const T = {
  'centered-large'(d, g) {
    return {
      css: `.q{font-family:Fell;line-height:1.06;text-align:center} .q .ln{display:block}`,
      html: `<div class="blk q hang" style="left:50%;top:50%;transform:translate(-50%,-50%)" data-fw="0.74" data-fh="0.5">
        ${svg('0 0 400 124', radiant(g.orn), 'display:block;width:2.6em;margin:0 auto 0.38em')}
        ${d.lines.map((l) => line(l, d)).join('')}
        <div style="width:0.5em;height:0;border-top:0.012em solid ${g.orn};margin:0.42em auto 0"></div>
        ${cite(d, 'margin-top:2.4vw;text-align:center')}
      </div>`,
    };
  },

  'left-ragged'(d, g) {
    const last = d.lines.length - 1;
    return {
      css: `.q{font-family:Fell;line-height:1.14;text-align:left} .q .ln{display:block} .q .ln.last{margin-top:0.5em}
            .rule{position:absolute;left:15vw;top:9vh;bottom:9vh;border-left:0.13vw solid ${g.orn}}`,
      html: `<div class="rule orn"></div>
      <div class="blk q" style="left:21vw;top:44%;transform:translateY(-50%)" data-fw="0.64" data-fh="0.56">
        ${d.lines.map((l, i) => line(l, d, i === last ? 'last' : '')).join('')}
      </div>
      <div class="blk" style="inset:0">${cite(d, 'position:absolute;left:21vw;bottom:9vh;white-space:nowrap')}</div>`,
    };
  },

  'stepped'(d, g) {
    return {
      css: `.q{font-family:Fell;line-height:1.16} .q .ln{display:block} .q .ln.in{padding-left:1.35em}
            .frame{position:absolute;inset:5.2vw;border:0.16vw solid ${g.fg}}
            .frame2{position:absolute;inset:6.6vw;border:0.07vw solid ${g.orn}}`,
      html: `<div class="frame orn"></div><div class="frame2 orn"></div>
      <div class="blk q" style="left:50%;top:48%;transform:translate(-50%,-50%)" data-fw="0.66" data-fh="0.6">
        ${d.lines.map((l, i) => line(l, d, i % 2 ? 'in' : '')).join('')}
        <div style="padding-left:1.35em">
        ${svg('0 0 120 20', `<path d="M0 10 H44 M76 10 H120" stroke="${g.orn}" stroke-width="1.6" fill="none"/><path d="M60 2 L68 10 L60 18 L52 10 Z" fill="${g.orn}"/>`, 'display:block;width:1.1em;margin:0.55em 0 0 0')}
        ${cite(d, 'margin-top:1.8vw')}</div>
      </div>`,
    };
  },

  'triad'(d, g) {
    // lines alternate verb / answer.
    const stanzas = [];
    for (let i = 0; i < d.lines.length; i += 2) {
      stanzas.push(`<div class="st">${line(d.lines[i], d, 'verb')}${line(d.lines[i + 1], d, 'ans')}</div>`);
    }
    const rule = `<div class="r3"></div>`;
    return {
      css: `.q{text-align:center} .q .ln{display:block}
            .verb{font-family:Fell;font-size:1em;line-height:1.0}
            .ans{font-family:Literata;font-style:italic;font-weight:380;font-size:0.31em;line-height:1.3;margin-top:0.25em;letter-spacing:0.01em}
            .q .verb .ac{color:${g.ac};font-style:normal}
            .r3{width:0.38em;margin:0.5em auto;border-top:0.012em solid ${g.orn}}`,
      html: `<div class="blk q hang" style="left:50%;top:48%;transform:translate(-50%,-50%)" data-fw="0.62" data-fh="0.74">
        ${stanzas.join(rule)}${rule}
        ${cite(d, 'text-align:center')}
      </div>`,
    };
  },

  'centered-monumental'(d, g) {
    return {
      css: `.q{font-family:Fell;line-height:1.05;text-align:center} .q .ln{display:block}`,
      html: `<div class="blk q hang" style="left:50%;top:47%;transform:translate(-50%,-50%)" data-fw="0.72" data-fh="0.56">
        ${d.lines.map((l) => line(l, d)).join('')}
        ${svg('0 0 400 40', wave(g.orn), 'display:block;width:1.9em;margin:0.5em auto 0')}
        ${cite(d, 'margin-top:3vw;text-align:center')}
      </div>`,
    };
  },

  'lower-third'(d, g) {
    return {
      css: `.q{font-family:Fell;line-height:1.1;text-align:center} .q .ln{display:block} .q .ac{font-style:italic}`,
      html: `<div class="blk" style="left:50%;top:27%;transform:translate(-50%,-50%)">
        ${svg('0 0 200 200', star(g.orn), 'display:block;width:21vw;height:21vw')}
      </div>
      <div class="blk q hang" style="left:50%;top:70%;transform:translate(-50%,-50%)" data-fw="0.64" data-fh="0.3">
        ${d.lines.map((l) => line(l, d)).join('')}
        ${cite(d, 'margin-top:2.6vw;text-align:center')}
      </div>`,
    };
  },

  'centered-italic'(d, g) {
    return {
      css: `.q{font-family:Fell;font-style:italic;line-height:1.08;text-align:center} .q .ln{display:block}`,
      html: `<div class="blk q hang" style="left:50%;top:50%;transform:translate(-50%,-50%)" data-fw="0.6" data-fh="0.74">
        ${svg('0 0 200 300', lily(g.orn), 'display:block;width:1.5em;margin:0 auto 0.3em')}
        ${d.lines.map((l) => line(l, d)).join('')}
        ${cite(d, 'margin-top:2.6vw;text-align:center;font-style:normal')}
      </div>`,
    };
  },

  'headline-and-body'(d, g) {
    const [a, b, ...rest] = d.lines;
    return {
      css: `.q{text-align:left} .q .ln{display:block}
            .h1{font-family:Fell;font-size:1em;line-height:0.95;margin-left:-0.03em}
            .h2{font-family:Fell;font-style:italic;font-size:0.4em;line-height:1.1;margin-top:0.1em}
            .bd{font-family:Fell;font-size:0.3em;line-height:1.22}
            .gap{height:0.32em} .q .h1 .ac{color:${g.ac}}`,
      html: `<div class="blk" style="right:13vw;top:13vh">${svg('0 0 240 110', birds(g.fg), 'display:block;width:34vw;opacity:0.85')}</div>
      <div class="blk q" style="left:13vw;top:60%;transform:translateY(-50%)" data-fw="0.7" data-fh="0.46">
        ${line(a, d, 'h1')}${line(b, d, 'h2')}<div class="gap"></div>
        ${rest.map((l) => line(l, d, 'bd')).join('')}
        <div style="width:0.6em;border-top:0.008em solid ${g.orn};margin:0.34em 0 0"></div>
        ${cite(d, 'margin-top:2vw')}
      </div>`,
    };
  },

  'framed-arch'(d, g) {
    const [a, ...rest] = d.lines;
    return {
      css: `.arch{position:absolute;left:50%;transform:translateX(-50%);top:12vh;width:60vw;height:72vh;border:0.16vw solid ${g.fg};border-bottom:0;border-radius:30vw 30vw 0 0;opacity:0.85}
            .arch2{position:absolute;left:50%;transform:translateX(-50%);top:calc(12vh + 1.6vw);width:56.8vw;height:calc(72vh - 1.6vw);border:0.07vw solid ${g.orn};border-bottom:0;border-radius:28.4vw 28.4vw 0 0}
            .sill{position:absolute;left:50%;transform:translateX(-50%);top:84vh;width:68vw;border-top:0.16vw solid ${g.fg};opacity:0.85}
            .q{text-align:center;font-family:Fell} .q .ln{display:block;line-height:1.12}
            .lead{font-style:italic;font-size:0.8em;margin-bottom:0.12em} .q .ac{font-style:italic}`,
      html: `<div class="arch orn"></div><div class="arch2 orn"></div><div class="sill orn"></div>
      <div class="blk q hang" style="left:50%;top:54%;transform:translate(-50%,-50%)" data-fw="0.5" data-fh="0.4">
        ${line(a, d, 'lead')}${rest.map((l) => line(l, d)).join('')}
        ${svg('0 0 120 20', `<path d="M0 10 H46 M74 10 H120" stroke="${g.orn}" stroke-width="1.6" fill="none"/><circle cx="60" cy="10" r="6" fill="${g.orn}"/>`, 'display:block;width:1.1em;margin:0.5em auto 0')}
      </div>
      <div class="blk" style="inset:0">${cite(d, 'position:absolute;left:50%;transform:translateX(-50%);top:78vh;white-space:nowrap')}</div>`,
    };
  },

  'right-ragged'(d, g) {
    const m = 6.2, len = 3.4, t = 0.13;
    const corner = (pos) => {
      const [v, h] = pos;
      return `<div class="orn" style="position:absolute;${v}:${m}vw;${h}:${m}vw;width:${len}vw;height:${len}vw;border-${v}:${t}vw solid ${g.fg};border-${h}:${t}vw solid ${g.fg};opacity:0.7"></div>`;
    };
    return {
      css: `.q{font-family:Fell;line-height:1.02;text-align:right} .q .ln{display:block}`,
      html: `${[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(corner).join('')}
      <div class="blk q hang" style="right:14vw;top:15vh" data-fw="0.66" data-fh="0.46">
        ${d.lines.map((l) => line(l, d)).join('')}
        <div style="width:0.5em;border-top:0.012em solid ${g.orn};margin:0.4em 0 0 auto"></div>
        ${cite(d, 'margin-top:2.2vw;text-align:right')}
      </div>`,
    };
  },

  'initial-word'(d, g) {
    const [a, ...rest] = d.lines;
    return {
      css: `.q{font-family:Fell;text-align:left} .q .ln{display:block}
            .big{font-size:1em;line-height:0.86;margin-left:-0.045em} .big .ac{font-style:italic}
            .sm{font-size:0.3em;line-height:1.14}
            .bar{width:0.36em;border-top:0.012em solid ${g.orn};margin:0.2em 0 0.16em}`,
      html: `<div class="blk q" style="left:15vw;top:50%;transform:translateY(-50%)" data-fw="0.66" data-fh="0.62">
        ${line(a, d, 'big')}<div class="bar"></div>
        ${rest.map((l) => line(l, d, 'sm')).join('')}
        ${cite(d, 'margin-top:3.2vw')}
      </div>`,
    };
  },

  'centered-rule-split'(d, g) {
    const [a, ...rest] = d.lines;
    return {
      css: `.q{font-family:Fell;line-height:1.08;text-align:center} .q .ln{display:block} .q .ac{font-style:italic}
            .split{width:0.9em;margin:0.42em auto 0.36em;border-top:0.014em solid ${g.orn}}`,
      html: `<div class="blk q hang" style="left:50%;top:42%;transform:translate(-50%,-50%)" data-fw="0.66" data-fh="0.46">
        ${line(a, d)}<div class="split"></div>${rest.map((l) => line(l, d)).join('')}
        ${cite(d, 'margin-top:3vw;text-align:center')}
      </div>
      <div class="blk" style="left:50%;bottom:9vh;transform:translateX(-50%)">
        ${svg('0 0 400 156', sunrise(g.orn, g.soft), 'display:block;width:58vw')}
      </div>`,
    };
  },
};

function page(d, { w, h, pxPerIn, safeIn }) {
  const g = GROUNDS[d.ground];
  const tpl = T[d.layout];
  if (!tpl) throw new Error(`no template for layout ${d.layout}`);
  const { css, html } = tpl(d, g);
  const font = (name, file, style, weight) =>
    `@font-face{font-family:"${name}";src:url("file://${path.join(FONTS, file)}");font-style:${style};font-weight:${weight};}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${font('Fell', 'IMFeENrm28P.ttf', 'normal', '400')}${font('Fell', 'IMFeENit28P.ttf', 'italic', '400')}
${font('Literata', 'Literata[opsz,wght].ttf', 'normal', '200 900')}${font('Literata', 'Literata-Italic[opsz,wght].ttf', 'italic', '200 900')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${g.bg}}
body{color:${g.fg};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;font-kerning:normal;font-variant-ligatures:common-ligatures}
.sheet{position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${g.bg}}
.blk{position:absolute;white-space:nowrap}
.ln{white-space:nowrap}
em.ac{font-style:inherit;color:${g.ac}}
.cite{font-family:Literata;font-weight:500;font-size:1.7vw;letter-spacing:0.2em;text-transform:uppercase;color:${g.cite};font-variant-numeric:lining-nums;line-height:1.2;margin-right:-0.2em;font-style:normal}
${css}
</style></head><body><div class="sheet" data-w="${w}" data-h="${h}" data-safe="${(safeIn * pxPerIn).toFixed(2)}" data-ppi="${pxPerIn}">${html}</div>
<script>
window.__layout = async function () {
  const faces = ['400 100px Fell', 'italic 400 100px Fell', '400 100px Literata', '500 100px Literata', 'italic 400 100px Literata'];
  await Promise.all(faces.map((f) => document.fonts.load(f, 'AaBb 0123')));
  await document.fonts.ready;
  const sheet = document.querySelector('.sheet');
  const W = +sheet.dataset.w, H = +sheet.dataset.h, SAFE = +sheet.dataset.safe, PPI = +sheet.dataset.ppi;
  const problems = [];
  const loaded = faces.map((f) => document.fonts.check(f));
  if (loaded.includes(false)) problems.push('font not loaded: ' + faces.filter((f, i) => !loaded[i]).join(', '));
  // Hang trailing punctuation outside the measure on centred and right-set lines.
  document.querySelectorAll('.hang .hp').forEach((s) => {
    const fs = parseFloat(getComputedStyle(s).fontSize);
    s.style.marginRight = -(s.getBoundingClientRect().width / fs).toFixed(4) + 'em';
  });
  // Fit each block.
  const fits = [];
  document.querySelectorAll('[data-fw]').forEach((el) => {
    const maxW = +el.dataset.fw * W, maxH = +el.dataset.fh * H;
    let lo = 4, hi = W;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      const r = el.getBoundingClientRect();
      if (r.width <= maxW && r.height <= maxH) lo = mid; else hi = mid;
    }
    el.style.fontSize = lo.toFixed(2) + 'px';
    const r = el.getBoundingClientRect();
    fits.push({ fontPx: +lo.toFixed(2), byWidth: r.width > 0.985 * maxW, w: r.width / W, h: r.height / H });
  });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  // Checks: everything drawn sits inside the 0.4 in safe margin.
  const inside = (r) => r.left >= SAFE - 0.5 && r.top >= SAFE - 0.5 && r.right <= W - SAFE + 0.5 && r.bottom <= H - SAFE + 0.5;
  sheet.querySelectorAll('.ln, .cite, .orn').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (!inside(r)) problems.push('outside safe margin: ' + (el.className.baseVal ?? el.className) + ' "' + el.textContent.trim().slice(0, 30) + '" ' + [r.left, r.top, r.right, r.bottom].map(Math.round));
  });
  // Lines of text must not overflow their line box.
  sheet.querySelectorAll('.ln').forEach((el) => {
    const hp = el.querySelector('.hp');
    const allow = (hp ? hp.getBoundingClientRect().width : 0) + 2;
    if (getComputedStyle(el).display === 'block' && el.clientWidth && el.scrollWidth > el.clientWidth + allow) problems.push('line overflow: ' + el.textContent);
  });
  // Blocks must not touch each other (gap of at least 2% of the width).
  const blks = [...sheet.querySelectorAll('.blk')].map((b) => {
    const rs = [...b.querySelectorAll('.ln, .cite, .orn')].map((e) => e.getBoundingClientRect()).filter((r) => r.width);
    return rs.length ? { l: Math.min(...rs.map((r) => r.left)), t: Math.min(...rs.map((r) => r.top)), r: Math.max(...rs.map((r) => r.right)), b: Math.max(...rs.map((r) => r.bottom)) } : null;
  }).filter(Boolean);
  const gap = 0.02 * W;
  for (let i = 0; i < blks.length; i++) for (let j = i + 1; j < blks.length; j++) {
    const a = blks[i], b = blks[j];
    if (a.l < b.r + gap && b.l < a.r + gap && a.t < b.b + gap && b.t < a.b + gap) problems.push('blocks ' + i + ' and ' + j + ' collide');
  }
  // Type size sanity: the smallest line of the saying, and the citation, in points at master size.
  const lineSizes = [...sheet.querySelectorAll('.ln')].map((e) => parseFloat(getComputedStyle(e).fontSize));
  const citePt = parseFloat(getComputedStyle(sheet.querySelector('.cite')).fontSize) / PPI * 72;
  const minLinePt = Math.min(...lineSizes) / PPI * 72;
  const text = [...sheet.querySelectorAll('.ln')].map((e) => e.textContent).join(' ');
  // Straight hairline borders (frames, rules) as strips, in fractions of the sheet. Chromium snaps
  // borders to whole pixels, so at the small reference size they carry far more ink than at master
  // size; the repaint check leaves these strips out.
  const hairlines = [];
  sheet.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderTopLeftRadius) || parseFloat(cs.borderTopRightRadius)) return;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const bw = { t: parseFloat(cs.borderTopWidth) || 0, b: parseFloat(cs.borderBottomWidth) || 0, l: parseFloat(cs.borderLeftWidth) || 0, rt: parseFloat(cs.borderRightWidth) || 0 };
    const add = (l, t, rr, bb) => hairlines.push([l / W, t / H, rr / W, bb / H]);
    if (bw.t) add(r.left, r.top, r.right, r.top + bw.t);
    if (bw.b) add(r.left, r.bottom - bw.b, r.right, r.bottom);
    if (bw.l) add(r.left, r.top, r.left + bw.l, r.bottom);
    if (bw.rt) add(r.right - bw.rt, r.top, r.right, r.bottom);
  });
  return { problems, fits, citePt, minLinePt, text, hairlines };
};
</script></body></html>`;
}

module.exports = { page, GROUNDS };
