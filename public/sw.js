const CACHE = 'rla-v14-chapel';

function scopeUrl(path) {
  const clean = String(path || '').replace(/^\//, '');
  return new URL(clean, self.registration.scope).href;
}

const PRECACHE_PATHS = [
  './',
  'index.html',
  'manifest.json',
  'css/app.css?v=14',
  'fonts/fonts.css?v=14',
  'fonts/fraunces-normal-latin.woff2',
  'fonts/fraunces-italic-latin.woff2',
  'fonts/literata-normal-latin.woff2',
  'fonts/literata-italic-latin.woff2',
  'fonts/figtree-normal-latin.woff2',
  'fonts/figtree-italic-latin.woff2',
  'js/base.js?v=14',
  'js/app.js?v=14',
  'js/share-card.js?v=14',
  'js/crisis.js?v=14',
  'js/atelier.js?v=14',
  'js/craft.js?v=14',
  'js/trust.js?v=14',
  'js/mobile.js?v=14',
  'data/corpus.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png',
  'favicon.png',
  'apple-touch-icon.png',
  'og-image.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.all(
        PRECACHE_PATHS.map(async (path) => {
          const url = scopeUrl(path);
          try {
            await cache.add(url);
          } catch (err) {
            console.warn('Precache miss', url, err);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(self.registration.scope);
      return undefined;
    })
  );
});

function isApiRequest(url) {
  try {
    const scope = new URL(self.registration.scope);
    const apiRoot = new URL('api/', scope);
    return url.href.startsWith(apiRoot.href) || url.pathname.startsWith('/api/');
  } catch (_) {
    return url.pathname.startsWith('/api/');
  }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  if (isApiRequest(url)) {
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
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const forRequest = res.clone();
            const forIndex = res.clone();
            const forRoot = res.clone();
            caches.open(CACHE).then((c) => {
              c.put(e.request, forRequest);
              c.put(scopeUrl('index.html'), forIndex);
              c.put(scopeUrl('./'), forRoot);
            });
          }
          return res;
        })
        .catch(async () => {
          const cached =
            (await caches.match(e.request)) ||
            (await caches.match(scopeUrl('index.html'))) ||
            (await caches.match(scopeUrl('./')));
          return (
            cached ||
            new Response('<h1>Red Letter is offline</h1><p>Open once online to save readings.</p>', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          );
        })
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
