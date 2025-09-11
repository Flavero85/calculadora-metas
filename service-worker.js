// service-worker.js
const CACHE_NAME = "suporte-n2-cache-v2";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/logo.png",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // network-first for API calls, cache-first for static assets
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // try cache first for same-origin static files
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
        return resp;
      }).catch(()=> caches.match("/index.html")))
    );
  } else {
    // for other origins, do network then fallback
    event.respondWith(fetch(req).catch(()=> caches.match(req)));
  }
});

// push
self.addEventListener("push", event => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); } catch(e){ data = { body: event.data.text() }; }
  }
  const title = data.title || "Suporte N2";
  const options = {
    body: data.body || "Notificação",
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    data: data.url || "/"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(clients.matchAll({ type:"window" }).then(list => {
    const client = list.find(c => c.visibilityState === "visible");
    if (client) client.navigate(url).then(c => c.focus());
    else clients.openWindow(url);
  }));
});

// background sync (example)
self.addEventListener("sync", event => {
  if (event.tag === "sync-casos") {
    event.waitUntil(syncCasos());
  }
});

async function syncCasos() {
  // placeholder: se usar IndexedDB, leia e envie para API aqui
  return;
}

