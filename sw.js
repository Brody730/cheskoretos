/* ═══════════════════════════════════════════
   CHESKORETOS - SERVICE WORKER (PWA)
   ═══════════════════════════════════════════
   Cachea estáticos para que la app funcione
   sin conexión (en el parque sin datos).
   ═══════════════════════════════════════════ */

var CACHE_NAME = 'cheskoretos-v8';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/perfil.html',
  '/menu.html',
  '/ruleta.html',
  '/retos.html',
  '/arcade.html',
  '/css/theme.css',
  '/css/landing.css',
  '/css/profile.css',
  '/css/arcade.css',
  '/js/config.js',
  '/js/challenges.js',
  '/js/data.js',
  '/js/auth.js',
  '/js/loyalty.js',
  '/js/retos-album.js',
  '/js/api.js',
  '/js/app.js',
  '/js/arcade.js',
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

/* PUSH: mostrar la notificación del sistema aunque la app esté cerrada */
self.addEventListener('push', function(event) {
  var datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch (e) {
    datos = { titulo: 'ChesKoretos', mensaje: event.data ? event.data.text() : '' };
  }

  var titulo  = datos.titulo || datos.title || 'ChesKoretos';
  var mensaje = datos.mensaje || datos.body || '';

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: mensaje,
      icon: '/assets/cheskin_no_bg.png',
      badge: '/assets/cheskin_no_bg.png',
      tag: datos.tag || 'chesko-push',
      data: { url: datos.url || '/perfil.html' }
    })
  );
});

/* CLICK en la notificación: abrir/enfocar la app */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/perfil.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(url) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
