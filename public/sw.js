const CACHE_NAME = 'mtg-companion-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only intercept local GET requests
  if (e.request.method !== 'GET') return;
  
  // Skip Scryfall API request intercepting to prevent caching raw API data or causing CORS problems
  const url = new URL(e.request.url);
  if (url.origin.includes('scryfall.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Offline fallback
      });
    })
  );
});
