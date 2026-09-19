// Service Worker for The Curator PWA
const CACHE_NAME = 'the-curator-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Respond with network fetch, fallback to cache if available
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
