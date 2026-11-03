const CACHE_NAME = 'ice-run-v16';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/hud.css',
  './css/screens.css',
  './css/components.css',
  './css/levelup.css',
  './js/config.js',
  './js/utils.js',
  './js/customization.js',
  './js/audio-input.js',
  './js/entities.js',
  './js/game.js',
  './js/ui.js',
  './player.customize/personaje.1.png',
  './player.customize/personaje.2.png',
  './player.customize/personaje.3.png',
  './player.customize/personaje.4.png',
  './player.customize/personaje.5.png',
  './player.customize/personaje.6.png',
  './player.customize/personaje.7.png',
  './player.customize/personaje.8.png',
  './player.customize/personaje.9.png',
  './player.customize/personaje.10.png',
  './player.customize/personaje.11.png',
  './player.customize/personaje.12.png',
  './player.customize/personaje.13.png',
  './player.customize/personaje.14.png'
];

self.addEventListener('install', event => {
  // Si un archivo falta, no debe tumbar todo el modo offline.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Navegación: red primero, para no quedarse con un index.html viejo.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Resto de recursos: caché primero.
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
