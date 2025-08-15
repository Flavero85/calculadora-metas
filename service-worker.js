// Versão do cache aumentada para forçar a atualização dos caminhos
const CACHE_NAME = 'metas-cache-v5'; 
const URLS_TO_CACHE = [
  './', // Cache da página principal (index.html)
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Evento de Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos salvos');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de Fetch: Responde com os arquivos do cache quando offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna do cache. Senão, busca na rede.
        return response || fetch(event.request);
      })
  );
});

// Limpa caches antigos para manter tudo atualizado
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});