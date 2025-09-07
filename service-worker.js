// Define um nome e versão para o cache.
// Altere esta versão sempre que atualizar os arquivos para forçar a atualização do cache.
const CACHE_NAME = 'suporte-n2-cache-v1';

// Lista de arquivos e recursos essenciais para o funcionamento offline.
const URLS_TO_CACHE = [
  './', // Armazena em cache o index.html na raiz
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js', // Cache da biblioteca de gráficos
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Evento 'install': é acionado quando o service worker é instalado pela primeira vez.
self.addEventListener('install', (event) => {
  // Aguarda até que o cache seja aberto e todos os recursos sejam armazenados.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        // Adiciona todos os URLs da lista ao cache.
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((err) => {
        console.error('Falha ao armazenar recursos em cache durante a instalação:', err);
      })
  );
});

// Evento 'activate': é acionado quando o service worker é ativado.
// Ótimo lugar para limpar caches antigos.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Se o nome do cache for diferente do atual, ele é excluído.
          if (cacheName !== CACHE_NAME) {
            console.log('ServiceWorker: limpando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento 'fetch': é acionado para cada requisição de rede feita pela página.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Estratégia "Cache First": primeiro tenta buscar no cache.
    caches.match(event.request)
      .then((response) => {
        // Se a resposta for encontrada no cache, a retorna.
        if (response) {
          return response;
        }
        // Se não estiver no cache, busca na rede.
        return fetch(event.request);
      })
      .catch(() => {
        // Caso a busca no cache e na rede falhe (offline e sem cache).
        console.log('Falha no fetch; o usuário provavelmente está offline e o recurso não está em cache.');
      })
  );
});
