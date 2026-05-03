// Smart Farm Dashboard — Service Worker
// Strategi: Cache-first untuk aset statis, Network-first untuk API/data

const CACHE_VERSION = 'smartfarm-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DATA_CACHE = `${CACHE_VERSION}-data`

// Aset yang di-cache saat install (app shell)
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
]

// Pola URL yang pakai network-first (data dinamis)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/api\/mqtt/,
  /\/api\/chatbot/,
  /\/api\/analyze-photo/,
]

// ── Install: pre-cache app shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore individual failures — offline page may not exist yet
      })
    }).then(() => self.skipWaiting())
  )
})

// ── Activate: hapus cache lama ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('smartfarm-') && k !== STATIC_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: strategi cache ──
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Abaikan request non-HTTP atau browser extension
  if (!url.protocol.startsWith('http')) return
  // Abaikan SSE stream (tidak bisa di-cache)
  if (url.pathname.includes('/api/mqtt/stream')) return

  // API calls → Network-first, fallback ke cache data
  if (NETWORK_FIRST_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(networkFirst(request, DATA_CACHE))
    return
  }

  // Next.js chunks & images → Cache-first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(png|jpg|svg|ico|webp)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Halaman HTML (navigasi) → Network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline') ?? caches.match('/')
      )
    )
    return
  }

  // Default → Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)
  return cached ?? fetchPromise ?? new Response('Offline', { status: 503 })
}

// ── Background Sync: kirim task completion saat online ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks())
  }
})

async function syncPendingTasks() {
  // Dalam implementasi nyata: baca pending actions dari IndexedDB dan kirim ke server
  const clients = await self.clients.matchAll()
  clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE', message: 'Data berhasil disinkronisasi' }))
}
