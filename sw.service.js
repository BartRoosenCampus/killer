const CACHE_NAME = 'killer-v2';
const assets = [
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './img/logo.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});