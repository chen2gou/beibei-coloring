const CACHE_NAME = 'paint-by-numbers-v3'
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.ico']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const request = event.request
  const url = new URL(request.url)
  const isNavigation = request.mode === 'navigate'
  const isCacheable = url.protocol === 'http:' || url.protocol === 'https:'

  if (!isCacheable) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      }).catch(() => {
        if (isNavigation) {
          return caches.match('./index.html')
        }
        return Response.error()
      })
    })
  )
})
