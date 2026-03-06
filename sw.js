// ============================================================
//  sw.js — UPDATED: Full offline support + background sync
// ============================================================

const CACHE_STATIC = 'aidev-static-v2';
const CACHE_DATA   = 'aidev-data-v2';

const STATIC_ASSETS = [
  '/', '/index.html', '/manifest.json',
  '/css/global.css', '/css/auth.css', '/css/dashboard.css',
  '/css/checkin.css', '/css/analytics.css', '/css/roadmap.css', '/css/todo.css',
  '/js/firebase-config.js', '/js/auth.js', '/js/auth-guard.js',
  '/js/tracker.js', '/js/dashboard.js', '/js/checkin.js',
  '/js/analytics.js', '/js/roadmap-data.js', '/js/roadmap.js',
  '/js/todo.js', '/js/offline-queue.js',
  '/pages/dashboard.html', '/pages/checkin.html',
  '/pages/analytics.html', '/pages/roadmap.html', '/pages/todo.html',
  '/icons/icon-192.png', '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(cache =>
      Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DATA).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (url.includes('firestore.googleapis.com') || url.includes('firebase') ||
      url.includes('googleapis.com') || url.includes('api.github.com')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (e.request.method === 'GET' && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_DATA).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => {
      if (e.request.destination === 'document') return caches.match('/index.html');
    })
  );
});

self.addEventListener('sync', e => {
  if (e.tag === 'offline-queue') {
    e.waitUntil(self.clients.matchAll().then(clients =>
      clients.forEach(c => c.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' }))
    ));
  }
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
