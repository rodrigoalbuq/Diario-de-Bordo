/* Service Worker for Diário de Bordo */
const CACHE_NAME = 'diario-de-bordo-v2';
const ASSETS = [
    './',
    './screenshots/Diario de bordo 2025-12-19 .png',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    './icons/icon-192.png',
    './icons/icon-512.png'

];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    // App shell offline for navigations
    if (req.mode === 'navigate') {
        event.respondWith(
            caches.match('./index.html').then((cached) => {
                return cached || fetch(req).catch(() => caches.match('./index.html'));
            })
        );
        return;
    }

    // Static assets: cache-first, then network
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                const copy = res.clone();
                // Cache GET requests only
                if (req.method === 'GET' && res.ok) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
                }
                return res;
            }).catch(() => cached);
        })
    );
});
