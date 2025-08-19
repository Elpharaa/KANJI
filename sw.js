/* Elphara PWA Service Worker */
const CACHE = 'elphara-v2';
const ASSETS = ['./','./index.html','./offline.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone(); caches.open(CACHE).then(cache => cache.put('./index.html', copy)); return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match('./offline.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); return res; }))
  );
});
