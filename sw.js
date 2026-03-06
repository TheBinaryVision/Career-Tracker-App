// ============================================================
//  sw.js  —  Service Worker (offline support)
// ============================================================

const CACHE  = 'aidev-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/global.css',
  '/css/auth.css',
  '/css/dashboard.css',
  '/css/checkin.css',
  '/css/analytics.css',
  '/css/roadmap.css',
  '/js/firebase-config.js',
  '/js/auth.js',
  '/js/auth-guard.js',
  '/js/tracker.js',
  '/js/dashboard.js',
  '/js/checkin.js',
  '/js/analytics.js',
  '/js/roadmap-data.js',
  '/js/roadmap.js',
  '/pages/dashboard.html',
  '/pages/checkin.html',
  '/pages/analytics.html',
  '/pages/roadmap.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Network-first for Firebase, cache-first for static assets
self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
