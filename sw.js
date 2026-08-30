const CACHE = 'rla-v16-path';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/app.css',
  '/js/app.js',
  '/js/share-card.js',
  '/js/crisis.js',
  '/js/atelier.js',
  '/js/craft.js',
  '/js/trust.js',
  '/data/corpus.json',
  '/data/curated.js',
  '/data/advisor.js',
  '/data/paths.js',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  const isHTML =
    e.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('periodicsync', (e) => {
  if (e.tag !== 'quiet-hour') return;
  e.waitUntil(
    caches.open('rla-prefs').then((c) => c.match('/__prefs')).then((res) => {
      if (!res) return;
      return res.json().then((prefs) => {
        const today = new Date().toISOString().slice(0, 10);
        if (!prefs || prefs.lastLectio === today) return;
        const hour = new Date().getHours();
        if (hour < Number(prefs.quietHour || 7)) return;
        return self.registration.showNotification('The page is still here', {
          body: prefs.carry || 'A quiet sentence is waiting.',
          icon: '/icon-192.png',
          tag: 'rla-quiet',
        });
      });
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('/'));
});
