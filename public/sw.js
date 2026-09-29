// Paths are relative to this file, so the same worker runs at the site root
// (Node server) and under a project path such as /Ai/ (GitHub Pages).
const CACHE = 'rla-v12';
const FONT_CACHE = 'rla-fonts-v1';
const PRECACHE = [
  './',
  'index.html',
  'manifest.json',
  'curated.json',
  'library.json',
  'data/advisor.js',
  'data/curated.js',
  'data/paths.js',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
];
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

self.addEventListener('install', (e) => {
  // addAll fails the install if any file is missing, so a broken deploy keeps
  // the previous working worker instead of installing an empty offline cache.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function offlineApi() {
  return new Response(JSON.stringify({ error: 'offline', offline: true }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Fonts never change at a given URL: cache first, and keep opaque responses
  // so the typography survives offline.
  if (FONT_HOSTS.has(url.hostname)) {
    e.respondWith(
      caches.open(FONT_CACHE).then((c) =>
        c.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone());
          return res;
        }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes('/api/')) {
    e.respondWith(fetch(e.request).catch(offlineApi));
    return;
  }

  // App files: network first so a new deploy never runs new HTML against old
  // scripts or data; the cache is the offline copy.
  const isDocument = e.request.mode === 'navigate';
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: isDocument }).then((cached) =>
          cached || (isDocument ? caches.match('index.html') : undefined) || Response.error()
        )
      )
  );
});
