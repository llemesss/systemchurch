const CACHE_NAME = 'igreja-app-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Implementar fetch com tratamento robusto de erros
        return fetch(event.request)
          .then((fetchResponse) => {
            // Verificar se a resposta é válida
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clonar a resposta para cache
            const responseToCache = fetchResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((cacheError) => {
                console.warn('Erro ao cachear recurso:', cacheError);
              });
            
            return fetchResponse;
          })
          .catch((fetchError) => {
            console.warn('Fetch falhou para:', event.request.url, fetchError);
            
            // Para requisições de navegação, retornar página offline ou index
            if (event.request.destination === 'document') {
              return caches.match('/') || new Response('Aplicação offline', {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
              });
            }
            
            // Para outros recursos, falhar graciosamente
            return new Response('Recurso não disponível', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
      .catch((cacheError) => {
        console.warn('Erro no cache:', cacheError);
        
        // Fallback direto para fetch se o cache falhar
        return fetch(event.request)
          .catch((fetchError) => {
            console.warn('Fetch e cache falharam para:', event.request.url, fetchError);
            return new Response('Serviço indisponível', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});