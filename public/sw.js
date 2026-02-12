// Service Worker for PWA offline support
const CACHE_NAME = 'prompt-engineering-v1'
const RUNTIME_CACHE = 'runtime-cache-v1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/examples/',
  '/demos/',
  '/vibe-coding/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url)
          return cachedResponse
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache for runtime
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                console.log('[SW] Caching new resource:', request.url)
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error)
            
            // Return offline page or fallback
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            throw error
          })
      })
  )
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
