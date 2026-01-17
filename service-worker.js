/* Service Worker for Diário de Bordo */
const CACHE_NAME = 'diario-de-bordo-v4';
const ASSETS = [
    './',
    // Evitar arquivos com espaços no nome no cache
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    // Screenshots sem espaços
    './screenshots/desktop-wide-1280x720.png',
    './screenshots/mobile-narrow-720x1280.png'
];

function hasSpaceInPath(urlString) {
    try {
        const u = new URL(urlString, self.location.origin);
        const path = u.pathname;
        return /\s|%20/.test(path);
    } catch {
        return /\s|%20/.test(String(urlString));
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const safeAssets = ASSETS.filter((a) => !hasSpaceInPath(a));
            return cache.addAll(safeAssets);
        })
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
    // Ignorar qualquer recurso com espaços no caminho ao cachear
    if (hasSpaceInPath(req.url)) {
        return; // seguir comportamento padrão da rede
    }
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
                if (req.method === 'GET' && res.ok && !hasSpaceInPath(req.url)) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
                }
                return res;
            }).catch(() => cached);
        })
    );
});
