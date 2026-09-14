'use strict';

const MAX_NOTE = 280;
const MAX_QUOTE = 2000;
const MAX_VERSE = 80;

function clean(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function encodeBlessing(input) {
  const payload = {
    v: clean(input.verse || input.v, MAX_VERSE),
    q: clean(input.quote || input.q, MAX_QUOTE),
    n: clean(input.note || input.n, MAX_NOTE),
  };
  if (!payload.v || !payload.q) return null;
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeBlessing(token) {
  if (!token || typeof token !== 'string' || token.length > 4000) return null;
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const data = JSON.parse(raw);
    const verse = clean(data.v || data.verse, MAX_VERSE);
    const quote = clean(data.q || data.quote, MAX_QUOTE);
    const note = clean(data.n || data.note, MAX_NOTE);
    if (!verse || !quote) return null;
    if (!/^(Matthew|Mark|Luke|John)\s+\d+:\d+/i.test(verse)) return null;
    return { verse, quote, note };
  } catch (_) {
    return null;
  }
}

function blessingPage({ verse, quote, note }, origin) {
  const sitHref = '/?b=' + encodeURIComponent(encodeBlessing({ verse, quote, note }) || '');
  const roomHref = '/';
  const title = 'A blessing — Red Letter';
  const desc = quote.slice(0, 140);
  const canon = origin ? `${origin.replace(/\/$/, '')}/b/${encodeBlessing({ verse, quote, note })}` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#F4EFE4" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:type" content="article" />
  ${canon ? `<meta property="og:url" content="${escapeHtml(canon)}" />` : ''}
  <link rel="icon" href="/icon-192.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=Source+Serif+4:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root { --paper:#F4EFE4; --ink:#1B1610; --crimson:#8F1D1D; --mute:#7A6E5E; }
    * { box-sizing:border-box; margin:0; padding:0; }
    html, body { min-height:100%; background:var(--paper); color:var(--ink); font-family:'Instrument Sans',system-ui,sans-serif; }
    main { max-width:34rem; margin:0 auto; padding:calc(48px + env(safe-area-inset-top,0px)) 24px calc(48px + env(safe-area-inset-bottom,0px)); text-align:center; }
    .mark { width:46px; height:46px; margin:0 auto 22px; border:1px solid var(--crimson); border-radius:50%; display:grid; place-items:center; font-family:Fraunces,Georgia,serif; font-style:italic; font-size:22px; color:var(--crimson); }
    .kicker { letter-spacing:.28em; text-transform:uppercase; font-size:11px; color:var(--mute); margin-bottom:16px; }
    .note { font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:18px; color:#4A4034; margin:0 auto 28px; max-width:28ch; line-height:1.5; }
    .quote { font-family:Fraunces,Georgia,serif; font-style:italic; font-size:clamp(22px,4.4vw,30px); color:var(--crimson); line-height:1.4; }
    .cite { letter-spacing:.16em; text-transform:uppercase; font-size:12px; color:var(--mute); margin:16px 0 36px; }
    .actions { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
    a.btn { display:inline-block; min-height:44px; line-height:44px; padding:0 20px; background:var(--crimson); color:#FBF7EE; text-decoration:none; letter-spacing:.06em; text-transform:uppercase; font-size:13px; }
    a.ghost { display:inline-block; min-height:44px; line-height:44px; padding:0 16px; color:var(--crimson); text-decoration:none; letter-spacing:.06em; text-transform:uppercase; font-size:13px; }
    .colophon { margin-top:40px; font-size:13px; color:var(--mute); line-height:1.55; }
  </style>
</head>
<body>
  <main>
    <div class="mark" aria-hidden="true">R</div>
    <p class="kicker">A blessing · one person</p>
    ${note ? `<p class="note">${escapeHtml(note)}</p>` : ''}
    <p class="quote">“${escapeHtml(quote)}”</p>
    <p class="cite">${escapeHtml(verse)} · KJV</p>
    <div class="actions">
      <a class="btn" href="${escapeHtml(sitHref)}">Sit with this</a>
      <a class="ghost" href="${escapeHtml(roomHref)}">Open the room</a>
    </div>
    <p class="colophon">His words, on a page. No feed. No likes. Crisis: 988 (U.S.).</p>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { encodeBlessing, decodeBlessing, blessingPage };
