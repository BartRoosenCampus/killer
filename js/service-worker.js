"use strict";

const CACHE_NAME = 'pwa-cache-v1';
// const ASSETS_TO_CACHE = [
//     'http://localhost/projects/Repositories/05_Andere/darts-killer/',
//     'http://localhost/projects/Repositories/05_Andere/darts-killer/index.html',
//     'http://localhost/projects/Repositories/05_Andere/darts-killer/js/main.js',
//     'http://localhost/projects/Repositories/05_Andere/darts-killer/manifest.json',
//     'http://localhost/projects/Repositories/05_Andere/darts-killer/img/killer.png'
// ];

const ASSETS_TO_CACHE = [
    'https://bartroosencampus.github.io/darts-killer/',
    'https://bartroosencampus.github.io/darts-killer/index.html',
    'https://bartroosencampus.github.io/darts-killer/js/main.js',
    'https://bartroosencampus.github.io/darts-killer/manifest.json',
    'https://bartroosencampus.github.io/darts-killer/img/killer.png'
];



// Service Worker installeren
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    console.log('Service Worker geïnstalleerd.');
});

// Activeer en opruimen oude caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    console.log('Service Worker geactiveerd.');
});

// Intercept verzoeken en offline cache gebruiken
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
