/* ═══════════════════════════════════════════
   CHESKORETOS - SERVICE WORKER (PWA)
   ═══════════════════════════════════════════
   Cachea estáticos para que la app funcione
   sin conexión (en el parque sin datos).
   ═══════════════════════════════════════════ */

var CACHE_NAME = 'cheskoretos-v5';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/perfil.html',
  '/menu.html',
  '/ruleta.html',
  '/retos.html',
  '/css/theme.css',
  '/css/landing.css',
  '/css/profile.css',
  '/js/config.js',
  '/js/challenges.js',
  '/js/data.js',
  '/js/auth.js',
  '/js/loyalty.js',
  '/js/retos-album.js',
  '/js/api.js',
  '/js/app.js',
  '/js/buzon.js',
  '/js/landing.js',
  '/manifest.json'
];

/* INSTALL: cachear assets estáticos */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

/* ACTIVATE: limpiar caches viejos */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* FETCH: network first, fallback a cache */
self.addEventListener('fetch', function(event) {
  /* No cachear llamadas a Supabase */
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  /* No cachear CDN externos */
  if (event.request.url.includes('cdn.jsdelivr.net') ||
      event.request.url.includes('unpkg.com') ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        /* Guardar en cache si es exitoso */
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        /* Si falla la red, intentar desde cache */
        return caches.match(event.request);
      })
  );
});
