const CACHE_NAME = 'vissquest-static-v2'
const OFFLINE_ASSETS = ['/', '/manifest.json', '/vq-logo.svg']

const isCacheableStaticRequest = (requestUrl, request) => {
  if (request.method !== 'GET') return false
  if (requestUrl.origin !== self.location.origin) return false
  if (requestUrl.pathname.startsWith('/api/')) return false

  return (
    request.mode === 'navigate' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    requestUrl.pathname === '/manifest.json'
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)
  if (!isCacheableStaticRequest(requestUrl, event.request)) {
    // Never cache API traffic in the service worker. Dynamic responses must
    // stay network-fresh so draw creation/deletion and dashboard updates are
    // visible immediately without clearing browser cache.
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)).catch(() => {})
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})
