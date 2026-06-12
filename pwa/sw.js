const CACHE_NAME = 'miti-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/index.css',
  '/styles/widget.css',
  '/styles/calendar.css',
  '/styles/converter.css',
  '/styles/animations.css',
  '/js/bs-data.js',
  '/js/date-converter.js',
  '/js/holidays.js',
  '/js/utils.js',
  '/js/bookmarks.js',
  '/js/calendar.js',
  '/js/app.js',
];

// Install — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
