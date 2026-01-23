
// Service Worker C.I.M. Visas
// Pensez à incrémenter cette version à chaque gros déploiement pour forcer le rafraîchissement chez tous les clients
const CACHE_NAME = 'siam-visa-pro-v2.6.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. INSTALLATION : On met en cache les fichiers critiques
self.addEventListener('install', (event) => {
  // Force le SW à s'activer immédiatement sans attendre que l'utilisateur ferme l'app
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ACTIVATION : On supprime les anciennes versions du cache
self.addEventListener('activate', (event) => {
  // Prend le contrôle de toutes les pages immédiatement
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('SW: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. INTERCEPTION RESEAU (Stratégie: Network First)
// On essaie TOUJOURS d'avoir la version en ligne. Si échec (avion/offline), on sert le cache.
self.addEventListener('fetch', (event) => {
  // On ne cache pas les appels API, Firebase ou les extensions Chrome
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('googleapis') || 
      event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, on la met en cache pour la prochaine fois (mise à jour dynamique)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Si offline, on sert le cache
        return caches.match(event.request);
      })
  );
});
