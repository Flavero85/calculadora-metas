// Nome e versão do cache. Mude a versão (v2, v3, etc.) se atualizar os arquivos para forçar a atualização.
const CACHE_NAME = 'metas-n2-cache-v1';

// Arquivos essenciais para o funcionamento offline do app.
const URLS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/chart.js' // Mantém o Chart.js em cache também
  // Adicione aqui os caminhos para seus ícones se desejar que eles fiquem em cache.
  // './icon-192x192.png',
  // './icon-512x512.png'
];

// Evento de Instalação: Salva os arquivos listados em cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos sendo salvos.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de Fetch: Intercepta as requisições e serve os arquivos do cache se estiverem disponíveis.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o arquivo estiver no cache, retorna-o.
        if (response) {
          return response;
        }
        // Se não, busca na rede.
        return fetch(event.request);
      })
  );
});

// Evento de Ativação: Limpa caches antigos para garantir que a aplicação está sempre atualizada.
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