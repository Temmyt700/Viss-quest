const VERSION = 'v4'
const STATIC_CACHE = `vissquest-static-${VERSION}`
const PAGE_CACHE = `vissquest-pages-${VERSION}`

const APP_SHELL_ASSETS = ['/vq-logo.svg']
const RUNTIME_CACHABLE_DESTINATIONS = new Set(['style', 'script', 'font', 'image'])

const isSameOrigin = (url) => url.origin === self.location.origin
const isApiRequest = (url) => url.pathname.startsWith('/api/')
const isNavigationRequest = (request) => request.mode === 'navigate'
const isManifestRequest = (url) => url.pathname === '/manifest.json'

const putIfSuccessful = async (cacheName, request, response) => {
  if (!response || !response.ok) return
  const cache = await caches.open(cacheName)
  await cache.put(request, response)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)
  if (!isSameOrigin(requestUrl)) return
  if (isApiRequest(requestUrl)) {
    // Never cache API traffic in SW. Backend already sets no-store for API
    // so draw/winner/auth updates never depend on manual cache clearing.
    return
  }

  if (isNavigationRequest(request)) {
    // Network-first for HTML/app shell so deployments become visible quickly.
    // On offline failure, fall back to the latest cached page response.
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          void putIfSuccessful(PAGE_CACHE, request, networkResponse.clone())
          return networkResponse
        })
        .catch(async () => {
          const cachedPage = await caches.match(request)
          if (cachedPage) return cachedPage
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Offline</title></head><body style="font-family:Arial,sans-serif;padding:24px;background:#f5fbf5;color:#153a25;"><h2>You are offline</h2><p>Please reconnect and refresh to load the latest VissQuest update.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )
        }),
    )
    return
  }

  if (isManifestRequest(requestUrl)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          void putIfSuccessful(STATIC_CACHE, request, networkResponse.clone())
          return networkResponse
        })
        .catch(() => caches.match(request)),
    )
    return
  }

  if (RUNTIME_CACHABLE_DESTINATIONS.has(request.destination)) {
    // Stale-while-revalidate keeps assets fast while allowing new hashed build
    // assets to replace old ones in the background.
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            void putIfSuccessful(STATIC_CACHE, request, networkResponse.clone())
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || networkFetch
      }),
    )
  }
})
