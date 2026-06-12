const CACHE = 'miti-pro-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css?v=3',
  './js/bs-data.js?v=2',
  './js/date-converter.js?v=1',
  './js/holidays.js?v=2',
  './js/app.js?v=6',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Navigation: network-first (fresh app), assets: cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('/data/')) return; // live data: network-only, app handles offline fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  // Stale-while-revalidate: serve cached instantly, refresh the cache in the
  // background so the next load always has the latest deployed data.
  e.respondWith(
    caches.match(req).then((cached) => {
      const refresh = fetch(req).then((res) => {
        if (res.ok && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
      if (cached) { refresh.catch(() => {}); return cached; }
      return refresh;
    })
  );
});
