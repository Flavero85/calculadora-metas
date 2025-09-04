// Define um nome e versão para o cache
const CACHE_NAME = 'suporte-n2-cache-v2'; // <-- MUDANÇA REALIZADA AQUI

// Lista de arquivos essenciais para o funcionamento offline
const URLS_TO_CACHE = [
  './index.html',
  'https://cdn.jsdelivr.net/npm/chart.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Evento de Instalação: guarda os arquivos em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de Fetch: serve os arquivos do cache quando offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se o arquivo existir no cache, retorna-o
        if (response) {
          return response;
        }
        // Caso contrário, busca na rede
        return fetch(event.request);
      })
  );
});

// Evento de Ativação: limpa caches antigos se houver uma nova versão
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Este código irá deletar o cache antigo 'suporte-n2-cache-v1'
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});